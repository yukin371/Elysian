import {
  appendFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises"
import { join } from "node:path"

type TenantFailureCategory = "environment" | "dependency" | "test_case"
type TenantE2eStatus = "passed" | "failed" | null

interface TenantStabilitySnapshot {
  generatedAt: string
  gitSha: string | null
  githubRunId: string | null
  githubRunNumber: string | null
  githubEventName: string | null
  githubRef: string | null
  reportDir: string
  tenantE2eStatus: TenantE2eStatus
  lastStage: string | null
  failureCategory: TenantFailureCategory | null
  durationMs: number | null
  notes: string[]
}

interface TenantStabilityEvidenceReport {
  generatedAt: string
  inputDir: string
  outputDir: string
  windowSize: number
  totalSnapshots: number
  selectedWindowRuns: number
  hasMinimumRuns: boolean
  failedRunCount: number
  maxConsecutiveFailedRuns: number
  dependencyFailureCount: number
  environmentFailureCount: number
  systemicBlockerDetected: boolean
  qualifiedForNextStep: boolean
  recommendation: "continue_observation" | "candidate_for_next_step"
  topRunIds: string[]
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const readNonEmptyEnv = (key: string) => {
  const value = process.env[key]
  return value && value.trim().length > 0 ? value : null
}

const resolveInputDir = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_EVIDENCE_INPUT_DIR") ??
  join(process.cwd(), "artifacts", "tenant")

const resolveOutputDir = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR") ??
  join(process.cwd(), "artifacts", "tenant-stability-evidence")

const resolveSummaryPath = () => readNonEmptyEnv("GITHUB_STEP_SUMMARY")
const resolveGitHubOutputPath = () => readNonEmptyEnv("GITHUB_OUTPUT")

const parseWindowSize = () => {
  const raw = process.env.ELYSIAN_TENANT_STABILITY_WINDOW_SIZE
  if (!raw) {
    return 5
  }

  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ELYSIAN_TENANT_STABILITY_WINDOW_SIZE: ${raw}`)
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

    if (entry.name === "e2e-tenant-stability-snapshot.json") {
      files.push(entryRelativePath)
    }
  }

  return files
}

const readSnapshot = async (
  inputDir: string,
  relativePath: string,
): Promise<TenantStabilitySnapshot> => {
  const raw = await readFile(join(inputDir, relativePath), "utf8")
  const parsed = JSON.parse(raw) as Partial<TenantStabilitySnapshot>

  assert(
    typeof parsed.generatedAt === "string",
    `Invalid generatedAt: ${relativePath}`,
  )
  assert(
    parsed.tenantE2eStatus === "passed" ||
      parsed.tenantE2eStatus === "failed" ||
      parsed.tenantE2eStatus === null,
    `Invalid tenantE2eStatus: ${relativePath}`,
  )

  return {
    generatedAt: parsed.generatedAt,
    gitSha: parsed.gitSha ?? null,
    githubRunId: parsed.githubRunId ?? null,
    githubRunNumber: parsed.githubRunNumber ?? null,
    githubEventName: parsed.githubEventName ?? null,
    githubRef: parsed.githubRef ?? null,
    reportDir: parsed.reportDir ?? "",
    tenantE2eStatus: parsed.tenantE2eStatus,
    lastStage: parsed.lastStage ?? null,
    failureCategory: parsed.failureCategory ?? null,
    durationMs:
      typeof parsed.durationMs === "number" ? parsed.durationMs : null,
    notes: Array.isArray(parsed.notes)
      ? parsed.notes.filter((item) => typeof item === "string")
      : [],
  }
}

const dedupeSnapshots = (snapshots: TenantStabilitySnapshot[]) => {
  const merged = new Map<string, TenantStabilitySnapshot>()

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

const analyze = (snapshots: TenantStabilitySnapshot[], windowSize: number) => {
  const windowSnapshots = snapshots.slice(0, windowSize)
  let failedRunCount = 0
  let maxConsecutiveFailedRuns = 0
  let consecutiveFailedRuns = 0
  let dependencyFailureCount = 0
  let environmentFailureCount = 0

  for (const snapshot of windowSnapshots) {
    if (snapshot.failureCategory === "dependency") {
      dependencyFailureCount += 1
    }
    if (snapshot.failureCategory === "environment") {
      environmentFailureCount += 1
    }

    if (snapshot.tenantE2eStatus === "failed") {
      failedRunCount += 1
      consecutiveFailedRuns += 1
      if (consecutiveFailedRuns > maxConsecutiveFailedRuns) {
        maxConsecutiveFailedRuns = consecutiveFailedRuns
      }
      continue
    }

    consecutiveFailedRuns = 0
  }

  const hasMinimumRuns = windowSnapshots.length >= windowSize
  const systemicBlockerDetected = maxConsecutiveFailedRuns >= 2
  const qualifiedForNextStep = hasMinimumRuns && !systemicBlockerDetected

  return {
    windowSnapshots,
    hasMinimumRuns,
    failedRunCount,
    maxConsecutiveFailedRuns,
    dependencyFailureCount,
    environmentFailureCount,
    systemicBlockerDetected,
    qualifiedForNextStep,
  }
}

export const renderEvidenceSummaryMarkdown = (
  report: TenantStabilityEvidenceReport,
) => {
  const lines = [
    "### E2E Tenant Stability Evidence",
    "",
    `- windowSize: \`${String(report.windowSize)}\``,
    `- selectedWindowRuns: \`${String(report.selectedWindowRuns)}\``,
    `- hasMinimumRuns: \`${String(report.hasMinimumRuns)}\``,
    `- failedRunCount: \`${String(report.failedRunCount)}\``,
    `- maxConsecutiveFailedRuns: \`${String(report.maxConsecutiveFailedRuns)}\``,
    `- dependencyFailureCount: \`${String(report.dependencyFailureCount)}\``,
    `- environmentFailureCount: \`${String(report.environmentFailureCount)}\``,
    `- systemicBlockerDetected: \`${String(report.systemicBlockerDetected)}\``,
    `- qualifiedForNextStep: \`${String(report.qualifiedForNextStep)}\``,
    `- recommendation: \`${report.recommendation}\``,
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const buildGitHubOutputLines = (
  report: TenantStabilityEvidenceReport,
) => [
  `tenant_evidence_total_snapshots=${String(report.totalSnapshots)}`,
  `tenant_evidence_window_size=${String(report.windowSize)}`,
  `tenant_evidence_selected_runs=${String(report.selectedWindowRuns)}`,
  `tenant_evidence_has_minimum_runs=${String(report.hasMinimumRuns)}`,
  `tenant_evidence_systemic_blocker=${String(report.systemicBlockerDetected)}`,
  `tenant_evidence_qualified=${String(report.qualifiedForNextStep)}`,
  `tenant_evidence_recommendation=${report.recommendation}`,
]

export const run = async () => {
  const inputDir = resolveInputDir()
  const outputDir = resolveOutputDir()
  const windowSize = parseWindowSize()
  const files = await findSnapshotFilesRecursively(inputDir)

  assert(
    files.length > 0,
    `No tenant stability snapshot found under ${inputDir}`,
  )

  const snapshots: TenantStabilitySnapshot[] = []
  for (const file of files) {
    snapshots.push(await readSnapshot(inputDir, file))
  }

  const merged = dedupeSnapshots(snapshots)
  const analyzed = analyze(merged, windowSize)
  const report: TenantStabilityEvidenceReport = {
    generatedAt: new Date().toISOString(),
    inputDir,
    outputDir,
    windowSize,
    totalSnapshots: merged.length,
    selectedWindowRuns: analyzed.windowSnapshots.length,
    hasMinimumRuns: analyzed.hasMinimumRuns,
    failedRunCount: analyzed.failedRunCount,
    maxConsecutiveFailedRuns: analyzed.maxConsecutiveFailedRuns,
    dependencyFailureCount: analyzed.dependencyFailureCount,
    environmentFailureCount: analyzed.environmentFailureCount,
    systemicBlockerDetected: analyzed.systemicBlockerDetected,
    qualifiedForNextStep: analyzed.qualifiedForNextStep,
    recommendation: analyzed.qualifiedForNextStep
      ? "candidate_for_next_step"
      : "continue_observation",
    topRunIds: analyzed.windowSnapshots.map(
      (item) => item.githubRunId ?? "n/a",
    ),
  }

  const outputPath = join(outputDir, "e2e-tenant-stability-evidence.json")
  await mkdir(outputDir, { recursive: true })
  await writeFile(outputPath, JSON.stringify(report, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(summaryPath, renderEvidenceSummaryMarkdown(report), "utf8")
    console.log(`[e2e-tenant-evidence] summary: ${summaryPath}`)
  }

  const githubOutputPath = resolveGitHubOutputPath()
  if (githubOutputPath) {
    await appendFile(
      githubOutputPath,
      `${buildGitHubOutputLines(report).join("\n")}\n`,
      "utf8",
    )
    console.log(`[e2e-tenant-evidence] github-output: ${githubOutputPath}`)
  }

  console.log(`[e2e-tenant-evidence] report: ${outputPath}`)
  console.log(
    `[e2e-tenant-evidence] selectedRuns=${String(report.selectedWindowRuns)} qualified=${String(report.qualifiedForNextStep)} recommendation=${report.recommendation}`,
  )

  return report
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-tenant-evidence] failed: ${message}`)
    process.exitCode = 1
  }
}
