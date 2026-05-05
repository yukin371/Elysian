import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
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

interface SmokeStabilityWindowEntry {
  generatedAt: string
  githubRunId: string | null
  githubRunNumber: string | null
  githubEventName: string | null
  githubRef: string | null
  gitSha: string | null
  gateStatus: GateStatus
  smokeFinalStatus: SmokeFinalStatus
  recoveredByRetry: boolean | null
  attempts: number | null
  notes: string[]
}

interface SmokeStabilityWindowReport {
  generatedAt: string
  sourceSnapshotPath: string
  windowSize: number
  totalEntries: number
  entries: SmokeStabilityWindowEntry[]
  window: {
    collectedRuns: number
    hasMinimumRuns: boolean
    failedGateCount: number
    maxConsecutiveFailedGates: number
    systemicBlockerDetected: boolean
    qualifiedForPhaseTransition: boolean
  }
  recommendation: "hold_phase6a" | "candidate_for_next_phase"
}

const resolveSmokeReportDir = () =>
  process.env.ELYSIAN_SMOKE_REPORT_DIR ??
  join(process.env.RUNNER_TEMP ?? process.cwd(), "elysian-reports", "smoke")

const resolveSummaryPath = () => process.env.GITHUB_STEP_SUMMARY ?? null
const resolveGitHubOutputPath = () => process.env.GITHUB_OUTPUT ?? null

const resolveSnapshotPath = () =>
  process.env.ELYSIAN_SMOKE_STABILITY_SNAPSHOT_PATH ??
  join(resolveSmokeReportDir(), "e2e-smoke-stability-snapshot.json")

const resolveWindowPath = () =>
  process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_PATH ??
  join(resolveSmokeReportDir(), "e2e-smoke-stability-window.json")

const parseWindowSize = () => {
  const raw = process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE
  if (!raw) {
    return 5
  }
  const size = Number.parseInt(raw, 10)
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error(`Invalid ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE: ${raw}`)
  }
  return size
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const readString = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (typeof property !== "string") {
    throw new Error(`Expected string field: ${key}`)
  }

  return property
}

const readBoolean = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (typeof property !== "boolean") {
    throw new Error(`Expected boolean field: ${key}`)
  }

  return property
}

const readNullableString = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (property === null || typeof property === "string") {
    return property
  }

  throw new Error(`Expected nullable string field: ${key}`)
}

const readNullableBoolean = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (property === null || typeof property === "boolean") {
    return property
  }

  throw new Error(`Expected nullable boolean field: ${key}`)
}

const readNullableNumber = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (property === null || typeof property === "number") {
    return property
  }

  throw new Error(`Expected nullable number field: ${key}`)
}

const readStringArray = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (
    !Array.isArray(property) ||
    !property.every((item) => typeof item === "string")
  ) {
    throw new Error(`Expected string array field: ${key}`)
  }

  return property
}

const readStatus = (
  value: Record<string, unknown>,
  key: string,
): "passed" | "failed" => {
  const status = readString(value, key)

  if (status !== "passed" && status !== "failed") {
    throw new Error(`Expected passed/failed field: ${key}`)
  }

  return status
}

const readGateStatus = (
  value: Record<string, unknown>,
  key: string,
): GateStatus => {
  const gateStatus = readString(value, key)

  if (
    gateStatus !== "passed" &&
    gateStatus !== "failed" &&
    gateStatus !== "unknown"
  ) {
    throw new Error(`Expected gate status field: ${key}`)
  }

  return gateStatus
}

const readSmokeFinalStatus = (
  value: Record<string, unknown>,
  key: string,
): SmokeFinalStatus => {
  const smokeFinalStatus = value[key]

  if (
    smokeFinalStatus === null ||
    smokeFinalStatus === "passed" ||
    smokeFinalStatus === "failed"
  ) {
    return smokeFinalStatus
  }

  throw new Error(`Expected nullable smoke final status field: ${key}`)
}

const readWindowEntry = (
  value: Record<string, unknown>,
): SmokeStabilityWindowEntry => ({
  generatedAt: readString(value, "generatedAt"),
  githubRunId: readNullableString(value, "githubRunId"),
  githubRunNumber: readNullableString(value, "githubRunNumber"),
  githubEventName: readNullableString(value, "githubEventName"),
  githubRef: readNullableString(value, "githubRef"),
  gitSha: readNullableString(value, "gitSha"),
  gateStatus: readGateStatus(value, "gateStatus"),
  smokeFinalStatus: readSmokeFinalStatus(value, "smokeFinalStatus"),
  recoveredByRetry: readNullableBoolean(value, "recoveredByRetry"),
  attempts: readNullableNumber(value, "attempts"),
  notes: readStringArray(value, "notes"),
})

const readSmokeStabilitySnapshot = (
  value: Record<string, unknown>,
): SmokeStabilitySnapshot => ({
  generatedAt: readString(value, "generatedAt"),
  gitSha: readNullableString(value, "gitSha"),
  githubRunId: readNullableString(value, "githubRunId"),
  githubRunNumber: readNullableString(value, "githubRunNumber"),
  githubEventName: readNullableString(value, "githubEventName"),
  githubRef: readNullableString(value, "githubRef"),
  reportDir: readString(value, "reportDir"),
  gateStatus: readGateStatus(value, "gateStatus"),
  smokeFinalStatus: readSmokeFinalStatus(value, "smokeFinalStatus"),
  recoveredByRetry: readNullableBoolean(value, "recoveredByRetry"),
  attempts: readNullableNumber(value, "attempts"),
  gateConclusion: readNullableString(value, "gateConclusion"),
  notes: readStringArray(value, "notes"),
})

const readSmokeStabilityWindowReport = (
  value: Record<string, unknown>,
): SmokeStabilityWindowReport => {
  const entries = value.entries
  const window = value.window

  if (!Array.isArray(entries) || !entries.every(isRecord)) {
    throw new Error("Expected stability window entries")
  }

  if (!isRecord(window)) {
    throw new Error("Expected stability window summary")
  }

  const recommendation = readString(value, "recommendation")
  if (
    recommendation !== "hold_phase6a" &&
    recommendation !== "candidate_for_next_phase"
  ) {
    throw new Error("Expected stability window recommendation")
  }

  return {
    generatedAt: readString(value, "generatedAt"),
    sourceSnapshotPath: readString(value, "sourceSnapshotPath"),
    windowSize: (() => {
      const windowSize = value.windowSize
      if (typeof windowSize !== "number") {
        throw new Error("Expected windowSize")
      }
      return windowSize
    })(),
    totalEntries: (() => {
      const totalEntries = value.totalEntries
      if (typeof totalEntries !== "number") {
        throw new Error("Expected totalEntries")
      }
      return totalEntries
    })(),
    entries: entries.map(readWindowEntry),
    window: {
      collectedRuns: (() => {
        const collectedRuns = window.collectedRuns
        if (typeof collectedRuns !== "number") {
          throw new Error("Expected collectedRuns")
        }
        return collectedRuns
      })(),
      hasMinimumRuns: readBoolean(window, "hasMinimumRuns"),
      failedGateCount: (() => {
        const failedGateCount = window.failedGateCount
        if (typeof failedGateCount !== "number") {
          throw new Error("Expected failedGateCount")
        }
        return failedGateCount
      })(),
      maxConsecutiveFailedGates: (() => {
        const maxConsecutiveFailedGates = window.maxConsecutiveFailedGates
        if (typeof maxConsecutiveFailedGates !== "number") {
          throw new Error("Expected maxConsecutiveFailedGates")
        }
        return maxConsecutiveFailedGates
      })(),
      systemicBlockerDetected: readBoolean(window, "systemicBlockerDetected"),
      qualifiedForPhaseTransition: readBoolean(
        window,
        "qualifiedForPhaseTransition",
      ),
    },
    recommendation,
  }
}

const readJsonFile = async <T>(
  path: string,
  reader: (value: Record<string, unknown>) => T,
): Promise<T | null> => {
  try {
    const raw = await readFile(path, "utf8")
    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed)) {
      throw new Error("Expected JSON object payload")
    }

    return reader(parsed)
  } catch {
    return null
  }
}

const toEntry = (
  snapshot: SmokeStabilitySnapshot,
): SmokeStabilityWindowEntry => ({
  generatedAt: snapshot.generatedAt,
  githubRunId: snapshot.githubRunId,
  githubRunNumber: snapshot.githubRunNumber,
  githubEventName: snapshot.githubEventName,
  githubRef: snapshot.githubRef,
  gitSha: snapshot.gitSha,
  gateStatus: snapshot.gateStatus,
  smokeFinalStatus: snapshot.smokeFinalStatus,
  recoveredByRetry: snapshot.recoveredByRetry,
  attempts: snapshot.attempts,
  notes: snapshot.notes,
})

const mergeEntries = (
  existing: SmokeStabilityWindowEntry[],
  current: SmokeStabilityWindowEntry,
) => {
  const merged = [...existing]
  const identity = current.githubRunId
    ? (entry: SmokeStabilityWindowEntry) =>
        entry.githubRunId === current.githubRunId
    : (entry: SmokeStabilityWindowEntry) =>
        entry.generatedAt === current.generatedAt &&
        entry.gitSha === current.gitSha

  const existingIndex = merged.findIndex(identity)
  if (existingIndex >= 0) {
    merged[existingIndex] = current
  } else {
    merged.push(current)
  }

  merged.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
  return merged
}

const analyzeWindow = (
  entries: SmokeStabilityWindowEntry[],
  windowSize: number,
) => {
  const windowEntries = entries.slice(0, windowSize)
  let failedGateCount = 0
  let maxConsecutiveFailedGates = 0
  let consecutiveFailedGates = 0

  for (const entry of windowEntries) {
    if (entry.gateStatus === "failed") {
      failedGateCount += 1
      consecutiveFailedGates += 1
      if (consecutiveFailedGates > maxConsecutiveFailedGates) {
        maxConsecutiveFailedGates = consecutiveFailedGates
      }
      continue
    }
    consecutiveFailedGates = 0
  }

  const hasMinimumRuns = windowEntries.length >= windowSize
  const systemicBlockerDetected = maxConsecutiveFailedGates >= 2
  const qualifiedForPhaseTransition = hasMinimumRuns && !systemicBlockerDetected

  return {
    windowEntries,
    collectedRuns: windowEntries.length,
    hasMinimumRuns,
    failedGateCount,
    maxConsecutiveFailedGates,
    systemicBlockerDetected,
    qualifiedForPhaseTransition,
  }
}

export const renderStabilityWindowSummaryMarkdown = (
  report: SmokeStabilityWindowReport,
) => {
  const lines = [
    "### E2E Smoke Stability Window",
    "",
    `- windowSize: \`${String(report.windowSize)}\``,
    `- collectedRuns: \`${String(report.window.collectedRuns)}\``,
    `- hasMinimumRuns: \`${String(report.window.hasMinimumRuns)}\``,
    `- failedGateCount: \`${String(report.window.failedGateCount)}\``,
    `- maxConsecutiveFailedGates: \`${String(report.window.maxConsecutiveFailedGates)}\``,
    `- systemicBlockerDetected: \`${String(report.window.systemicBlockerDetected)}\``,
    `- qualifiedForPhaseTransition: \`${String(report.window.qualifiedForPhaseTransition)}\``,
    `- recommendation: \`${report.recommendation}\``,
    "",
    "Recent runs:",
    ...report.entries
      .slice(0, report.windowSize)
      .map(
        (entry) =>
          `- ${entry.generatedAt} run=${entry.githubRunId ?? "n/a"} gate=${entry.gateStatus} final=${entry.smokeFinalStatus ?? "unknown"} retryRecovered=${entry.recoveredByRetry === null ? "unknown" : String(entry.recoveredByRetry)}`,
      ),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const buildGitHubOutputLines = (report: SmokeStabilityWindowReport) => [
  `smoke_stability_window_size=${String(report.windowSize)}`,
  `smoke_stability_collected_runs=${String(report.window.collectedRuns)}`,
  `smoke_stability_has_minimum_runs=${String(report.window.hasMinimumRuns)}`,
  `smoke_stability_systemic_blocker=${String(report.window.systemicBlockerDetected)}`,
  `smoke_stability_qualified=${String(report.window.qualifiedForPhaseTransition)}`,
  `smoke_stability_recommendation=${report.recommendation}`,
]

export const run = async () => {
  const snapshotPath = resolveSnapshotPath()
  const windowPath = resolveWindowPath()
  const windowSize = parseWindowSize()

  const snapshot = await readJsonFile(snapshotPath, readSmokeStabilitySnapshot)
  const fallbackEntry: SmokeStabilityWindowEntry = {
    generatedAt: new Date().toISOString(),
    githubRunId: process.env.GITHUB_RUN_ID ?? null,
    githubRunNumber: process.env.GITHUB_RUN_NUMBER ?? null,
    githubEventName: process.env.GITHUB_EVENT_NAME ?? null,
    githubRef: process.env.GITHUB_REF ?? null,
    gitSha: process.env.GITHUB_SHA ?? null,
    gateStatus: "unknown",
    smokeFinalStatus: null,
    recoveredByRetry: null,
    attempts: null,
    notes: ["Missing smoke stability snapshot; fallback entry generated."],
  }
  const currentEntry = snapshot ? toEntry(snapshot) : fallbackEntry

  const existing = await readJsonFile(
    windowPath,
    readSmokeStabilityWindowReport,
  )
  const mergedEntries = mergeEntries(existing?.entries ?? [], currentEntry)
  const windowAnalysis = analyzeWindow(mergedEntries, windowSize)

  const report: SmokeStabilityWindowReport = {
    generatedAt: new Date().toISOString(),
    sourceSnapshotPath: snapshotPath,
    windowSize,
    totalEntries: mergedEntries.length,
    entries: mergedEntries,
    window: {
      collectedRuns: windowAnalysis.collectedRuns,
      hasMinimumRuns: windowAnalysis.hasMinimumRuns,
      failedGateCount: windowAnalysis.failedGateCount,
      maxConsecutiveFailedGates: windowAnalysis.maxConsecutiveFailedGates,
      systemicBlockerDetected: windowAnalysis.systemicBlockerDetected,
      qualifiedForPhaseTransition: windowAnalysis.qualifiedForPhaseTransition,
    },
    recommendation: windowAnalysis.qualifiedForPhaseTransition
      ? "candidate_for_next_phase"
      : "hold_phase6a",
  }

  await mkdir(resolveSmokeReportDir(), { recursive: true })
  await writeFile(windowPath, JSON.stringify(report, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(
      summaryPath,
      renderStabilityWindowSummaryMarkdown(report),
      "utf8",
    )
    console.log(`[e2e-smoke-stability-window] summary: ${summaryPath}`)
  }

  const githubOutputPath = resolveGitHubOutputPath()
  if (githubOutputPath) {
    await appendFile(
      githubOutputPath,
      `${buildGitHubOutputLines(report).join("\n")}\n`,
      "utf8",
    )
    console.log(
      `[e2e-smoke-stability-window] github-output: ${githubOutputPath}`,
    )
  }

  console.log(`[e2e-smoke-stability-window] report: ${windowPath}`)
  console.log(
    `[e2e-smoke-stability-window] collectedRuns=${String(report.window.collectedRuns)} qualified=${String(report.window.qualifiedForPhaseTransition)} recommendation=${report.recommendation}`,
  )

  return report
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-smoke-stability-window] failed: ${message}`)
    process.exitCode = 1
  }
}
