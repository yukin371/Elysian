import {
  appendFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises"
import { join } from "node:path"

type GateStatus = "passed" | "failed" | "unknown"
type SmokeFinalStatus = "passed" | "failed" | null

interface SmokeStabilitySnapshot {
  generatedAt: string
  gitSha: string | null
  githubRunId: string | null
  githubRunNumber: string | null
  githubEventName: string | null
  githubRef: string | null
  reportDir: string
  gateStatus: GateStatus
  smokeFinalStatus: SmokeFinalStatus
  recoveredByRetry: boolean | null
  attempts: number | null
  gateConclusion: string | null
  notes: string[]
}

interface SmokeStabilityEvidenceReport {
  generatedAt: string
  inputDir: string
  outputDir: string
  windowSize: number
  totalSnapshots: number
  selectedWindowRuns: number
  hasMinimumRuns: boolean
  failedGateCount: number
  maxConsecutiveFailedGates: number
  recoveredByRetryCount: number
  systemicBlockerDetected: boolean
  qualifiedForPhaseTransition: boolean
  recommendation: "hold_phase6a" | "candidate_for_next_phase"
  suggestedNextMainline: "phase6b_or_phase5_decision_required" | null
  topRunIds: string[]
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const resolveInputDir = () =>
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_INPUT_DIR ??
  join(process.cwd(), "artifacts", "smoke")

const resolveOutputDir = () =>
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_OUTPUT_DIR ??
  join(process.cwd(), "artifacts", "stability-evidence")

const resolveSummaryPath = () => process.env.GITHUB_STEP_SUMMARY ?? null
const resolveGitHubOutputPath = () => process.env.GITHUB_OUTPUT ?? null

const parseWindowSize = () => {
  const raw = process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE
  if (!raw) {
    return 5
  }
  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE: ${raw}`)
  }
  return value
}

const findSnapshotFilesRecursively = async (
  rootDir: string,
  relativePath = "",
): Promise<string[]> => {
  const currentPath = relativePath ? join(rootDir, relativePath) : rootDir
  const entries = await readdir(currentPath, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const entryRelativePath = relativePath
      ? `${relativePath}/${entry.name}`
      : entry.name

    if (entry.isDirectory()) {
      files.push(
        ...(await findSnapshotFilesRecursively(rootDir, entryRelativePath)),
      )
      continue
    }

    if (entry.name === "e2e-smoke-stability-snapshot.json") {
      files.push(entryRelativePath)
    }
  }

  return files
}

const readSnapshot = async (
  inputDir: string,
  relativePath: string,
): Promise<SmokeStabilitySnapshot> => {
  const raw = await readFile(join(inputDir, relativePath), "utf8")
  const parsed = JSON.parse(raw) as Partial<SmokeStabilitySnapshot>
  assert(
    typeof parsed.generatedAt === "string",
    `Invalid generatedAt: ${relativePath}`,
  )
  assert(
    parsed.gateStatus === "passed" ||
      parsed.gateStatus === "failed" ||
      parsed.gateStatus === "unknown",
    `Invalid gateStatus: ${relativePath}`,
  )
  assert(
    parsed.smokeFinalStatus === "passed" ||
      parsed.smokeFinalStatus === "failed" ||
      parsed.smokeFinalStatus === null,
    `Invalid smokeFinalStatus: ${relativePath}`,
  )
  return {
    generatedAt: parsed.generatedAt,
    gitSha: parsed.gitSha ?? null,
    githubRunId: parsed.githubRunId ?? null,
    githubRunNumber: parsed.githubRunNumber ?? null,
    githubEventName: parsed.githubEventName ?? null,
    githubRef: parsed.githubRef ?? null,
    reportDir: parsed.reportDir ?? "",
    gateStatus: parsed.gateStatus,
    smokeFinalStatus: parsed.smokeFinalStatus,
    recoveredByRetry:
      typeof parsed.recoveredByRetry === "boolean"
        ? parsed.recoveredByRetry
        : null,
    attempts: typeof parsed.attempts === "number" ? parsed.attempts : null,
    gateConclusion: parsed.gateConclusion ?? null,
    notes: Array.isArray(parsed.notes)
      ? parsed.notes.filter((x) => typeof x === "string")
      : [],
  }
}

const dedupeSnapshots = (snapshots: SmokeStabilitySnapshot[]) => {
  const merged = new Map<string, SmokeStabilitySnapshot>()
  for (const snapshot of snapshots) {
    const key = snapshot.githubRunId
      ? `run:${snapshot.githubRunId}`
      : `time:${snapshot.generatedAt}:${snapshot.gitSha ?? "unknown"}`
    const previous = merged.get(key)
    if (!previous || snapshot.generatedAt > previous.generatedAt) {
      merged.set(key, snapshot)
    }
  }
  return Array.from(merged.values()).sort((a, b) =>
    b.generatedAt.localeCompare(a.generatedAt),
  )
}

const analyze = (snapshots: SmokeStabilitySnapshot[], windowSize: number) => {
  const windowSnapshots = snapshots.slice(0, windowSize)
  let failedGateCount = 0
  let recoveredByRetryCount = 0
  let maxConsecutiveFailedGates = 0
  let consecutiveFailedGates = 0

  for (const snapshot of windowSnapshots) {
    if (snapshot.recoveredByRetry) {
      recoveredByRetryCount += 1
    }

    if (snapshot.gateStatus === "failed") {
      failedGateCount += 1
      consecutiveFailedGates += 1
      if (consecutiveFailedGates > maxConsecutiveFailedGates) {
        maxConsecutiveFailedGates = consecutiveFailedGates
      }
      continue
    }

    consecutiveFailedGates = 0
  }

  const hasMinimumRuns = windowSnapshots.length >= windowSize
  const systemicBlockerDetected = maxConsecutiveFailedGates >= 2
  const qualifiedForPhaseTransition = hasMinimumRuns && !systemicBlockerDetected

  return {
    windowSnapshots,
    hasMinimumRuns,
    failedGateCount,
    maxConsecutiveFailedGates,
    recoveredByRetryCount,
    systemicBlockerDetected,
    qualifiedForPhaseTransition,
  }
}

export const renderEvidenceSummaryMarkdown = (
  report: SmokeStabilityEvidenceReport,
) => {
  const lines = [
    "### E2E Smoke Stability Evidence",
    "",
    `- windowSize: \`${String(report.windowSize)}\``,
    `- selectedWindowRuns: \`${String(report.selectedWindowRuns)}\``,
    `- hasMinimumRuns: \`${String(report.hasMinimumRuns)}\``,
    `- failedGateCount: \`${String(report.failedGateCount)}\``,
    `- maxConsecutiveFailedGates: \`${String(report.maxConsecutiveFailedGates)}\``,
    `- recoveredByRetryCount: \`${String(report.recoveredByRetryCount)}\``,
    `- systemicBlockerDetected: \`${String(report.systemicBlockerDetected)}\``,
    `- qualifiedForPhaseTransition: \`${String(report.qualifiedForPhaseTransition)}\``,
    `- recommendation: \`${report.recommendation}\``,
    `- suggestedNextMainline: \`${report.suggestedNextMainline ?? "n/a"}\``,
    "",
  ]
  return `${lines.join("\n")}\n`
}

export const buildGitHubOutputLines = (
  report: SmokeStabilityEvidenceReport,
) => [
  `smoke_evidence_total_snapshots=${String(report.totalSnapshots)}`,
  `smoke_evidence_window_size=${String(report.windowSize)}`,
  `smoke_evidence_selected_runs=${String(report.selectedWindowRuns)}`,
  `smoke_evidence_has_minimum_runs=${String(report.hasMinimumRuns)}`,
  `smoke_evidence_systemic_blocker=${String(report.systemicBlockerDetected)}`,
  `smoke_evidence_qualified=${String(report.qualifiedForPhaseTransition)}`,
  `smoke_evidence_recommendation=${report.recommendation}`,
]

export const run = async () => {
  const inputDir = resolveInputDir()
  const outputDir = resolveOutputDir()
  const windowSize = parseWindowSize()
  const files = await findSnapshotFilesRecursively(inputDir)
  assert(files.length > 0, `No stability snapshot found under ${inputDir}`)

  const snapshots: SmokeStabilitySnapshot[] = []
  for (const file of files) {
    snapshots.push(await readSnapshot(inputDir, file))
  }

  const merged = dedupeSnapshots(snapshots)
  const analyzed = analyze(merged, windowSize)
  const report: SmokeStabilityEvidenceReport = {
    generatedAt: new Date().toISOString(),
    inputDir,
    outputDir,
    windowSize,
    totalSnapshots: merged.length,
    selectedWindowRuns: analyzed.windowSnapshots.length,
    hasMinimumRuns: analyzed.hasMinimumRuns,
    failedGateCount: analyzed.failedGateCount,
    maxConsecutiveFailedGates: analyzed.maxConsecutiveFailedGates,
    recoveredByRetryCount: analyzed.recoveredByRetryCount,
    systemicBlockerDetected: analyzed.systemicBlockerDetected,
    qualifiedForPhaseTransition: analyzed.qualifiedForPhaseTransition,
    recommendation: analyzed.qualifiedForPhaseTransition
      ? "candidate_for_next_phase"
      : "hold_phase6a",
    suggestedNextMainline: analyzed.qualifiedForPhaseTransition
      ? "phase6b_or_phase5_decision_required"
      : null,
    topRunIds: analyzed.windowSnapshots.map(
      (item) => item.githubRunId ?? "n/a",
    ),
  }

  const outputPath = join(outputDir, "e2e-smoke-stability-evidence.json")
  await mkdir(outputDir, { recursive: true })
  await writeFile(outputPath, JSON.stringify(report, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(summaryPath, renderEvidenceSummaryMarkdown(report), "utf8")
    console.log(`[e2e-smoke-evidence] summary: ${summaryPath}`)
  }
  const githubOutputPath = resolveGitHubOutputPath()
  if (githubOutputPath) {
    await appendFile(
      githubOutputPath,
      `${buildGitHubOutputLines(report).join("\n")}\n`,
      "utf8",
    )
    console.log(`[e2e-smoke-evidence] github-output: ${githubOutputPath}`)
  }

  console.log(`[e2e-smoke-evidence] report: ${outputPath}`)
  console.log(
    `[e2e-smoke-evidence] selectedRuns=${String(report.selectedWindowRuns)} qualified=${String(report.qualifiedForPhaseTransition)} recommendation=${report.recommendation}`,
  )

  return report
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-smoke-evidence] failed: ${message}`)
    process.exitCode = 1
  }
}
