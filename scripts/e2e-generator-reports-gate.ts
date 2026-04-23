import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

import {
  resolveGeneratorReportDir,
  resolveGeneratorReportGitSha,
} from "./_shared/generator-report"

type ReportSource = "matrix" | "cli" | "unknown"

interface ReportIndexItem {
  source: ReportSource
  reportPath: string
  fileName: string
  status: "passed" | "failed"
  passedCount: number
  failedCount: number
}

interface ReportsIndex {
  gitSha: string
  generatedAt: string
  inputDir: string
  totalReports: number
  passedReports: number
  failedReports: number
  overallStatus: "passed" | "failed"
  conclusion: string
  failedItems: ReportIndexItem[]
  items: ReportIndexItem[]
}

interface GateReport {
  gitSha: string
  generatedAt: string
  indexPath: string
  status: "passed" | "failed"
  maxFailedReports: number
  allowFailedSources: ReportSource[]
  effectiveFailedReports: number
  allFailedItems: ReportIndexItem[]
  blockedFailedItems: ReportIndexItem[]
  conclusion: string
  recommendedActions: string[]
  appliedPolicy: {
    maxFailedReports: number
    allowFailedSources: ReportSource[]
    policyInputs: {
      gateMaxFailedReportsRaw: string | null
      gateAllowFailedSourcesRaw: string | null
      gateIndexPathRaw: string | null
    }
    context: {
      githubEventName: string | null
      githubRef: string | null
    }
  }
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const parseAllowFailedSourcesRaw = (
  raw: string | null | undefined,
): ReportSource[] => {
  if (!raw) {
    return []
  }

  const values = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const sources = new Set<ReportSource>()
  for (const value of values) {
    if (value === "matrix" || value === "cli" || value === "unknown") {
      sources.add(value)
      continue
    }

    throw new Error(`Invalid allow-failed source: ${value}`)
  }

  return Array.from(sources)
}

const parseAllowFailedSources = () =>
  parseAllowFailedSourcesRaw(
    process.env.ELYSIAN_REPORT_GATE_ALLOW_FAILED_SOURCES,
  )

const resolveMaxFailedReports = () => {
  const raw = process.env.ELYSIAN_REPORT_GATE_MAX_FAILED_REPORTS
  if (!raw) {
    return 0
  }

  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid ELYSIAN_REPORT_GATE_MAX_FAILED_REPORTS: ${raw}`)
  }

  return value
}

const resolveIndexPath = () =>
  process.env.ELYSIAN_REPORT_GATE_INDEX_PATH ??
  join(resolveGeneratorReportDir(), "e2e-generator-reports-index.json")

const writeGateReport = async (report: GateReport) => {
  const reportDir = resolveGeneratorReportDir()
  const reportPath = join(reportDir, "e2e-generator-reports-gate.json")

  await mkdir(reportDir, { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")

  return reportPath
}

export const buildRecommendedActions = (
  status: "passed" | "failed",
  blockedFailedItems: ReportIndexItem[],
) => {
  if (status === "passed") {
    return ["No action required."]
  }

  const actions = new Set<string>([
    "Inspect blockedFailedItems first and fix report-producing failures before relaxing gate policy.",
    "If failures are temporary and accepted for manual runs, tune ELYSIAN_REPORT_GATE_MAX_FAILED_REPORTS and/or ELYSIAN_REPORT_GATE_ALLOW_FAILED_SOURCES in workflow_dispatch.",
  ])

  const failedSources = new Set(blockedFailedItems.map((item) => item.source))

  if (failedSources.has("matrix")) {
    actions.add(
      "For matrix failures, check schema/frontend/conflict-strategy combinations in e2e-generator-regression-matrix and validate deterministic output.",
    )
  }

  if (failedSources.has("cli")) {
    actions.add(
      "For cli failures, check command-level conflict strategy behavior in e2e-generator-cli and validate managed/unmanaged overwrite paths.",
    )
  }

  if (failedSources.has("unknown")) {
    actions.add(
      "For unknown source failures, verify artifact download paths and ensure report files keep source prefixes (matrix/ or cli/).",
    )
  }

  return Array.from(actions)
}

export const validateReportsIndex = (index: ReportsIndex) => {
  assert(Array.isArray(index.items), "Invalid reports index: items is missing")
  assert(
    Array.isArray(index.failedItems),
    "Invalid reports index: failedItems is missing",
  )
  assert(
    typeof index.totalReports === "number" &&
      Number.isFinite(index.totalReports),
    "Invalid reports index: totalReports is missing",
  )
  assert(
    typeof index.failedReports === "number" &&
      Number.isFinite(index.failedReports),
    "Invalid reports index: failedReports is missing",
  )
  assert(
    typeof index.passedReports === "number" &&
      Number.isFinite(index.passedReports),
    "Invalid reports index: passedReports is missing",
  )

  const itemFailedCount = index.items.filter(
    (item) => item.status === "failed",
  ).length
  assert(
    index.totalReports === index.items.length,
    "Invalid reports index: totalReports does not match items length",
  )
  assert(
    index.failedReports === itemFailedCount,
    "Invalid reports index: failedReports does not match failed item count",
  )
  assert(
    index.passedReports === index.totalReports - index.failedReports,
    "Invalid reports index: passedReports does not match total-failed",
  )
  assert(
    index.failedItems.length === index.failedReports,
    "Invalid reports index: failedItems length does not match failedReports",
  )
}

export const run = async () => {
  const gateMaxFailedReportsRaw =
    process.env.ELYSIAN_REPORT_GATE_MAX_FAILED_REPORTS ?? null
  const gateAllowFailedSourcesRaw =
    process.env.ELYSIAN_REPORT_GATE_ALLOW_FAILED_SOURCES ?? null
  const gateIndexPathRaw = process.env.ELYSIAN_REPORT_GATE_INDEX_PATH ?? null
  const indexPath = resolveIndexPath()
  const allowFailedSources = parseAllowFailedSources()
  const maxFailedReports = resolveMaxFailedReports()
  const raw = await readFile(indexPath, "utf8")
  const index = JSON.parse(raw) as ReportsIndex

  validateReportsIndex(index)
  const allFailedItems = index.items.filter((item) => item.status === "failed")
  const blockedFailedItems = allFailedItems.filter(
    (item) => !allowFailedSources.includes(item.source),
  )
  const effectiveFailedReports = blockedFailedItems.length
  const status: "passed" | "failed" =
    effectiveFailedReports <= maxFailedReports ? "passed" : "failed"
  const conclusion =
    status === "passed"
      ? "Generator reports gate passed."
      : `Generator reports gate failed: effectiveFailedReports=${effectiveFailedReports}, maxFailedReports=${maxFailedReports}.`
  const recommendedActions = buildRecommendedActions(status, blockedFailedItems)

  const reportPath = await writeGateReport({
    gitSha: resolveGeneratorReportGitSha(),
    generatedAt: new Date().toISOString(),
    indexPath,
    status,
    maxFailedReports,
    allowFailedSources,
    effectiveFailedReports,
    allFailedItems,
    blockedFailedItems,
    conclusion,
    recommendedActions,
    appliedPolicy: {
      maxFailedReports,
      allowFailedSources,
      policyInputs: {
        gateMaxFailedReportsRaw,
        gateAllowFailedSourcesRaw,
        gateIndexPathRaw,
      },
      context: {
        githubEventName: process.env.GITHUB_EVENT_NAME ?? null,
        githubRef: process.env.GITHUB_REF ?? null,
      },
    },
  })

  console.log(`[e2e-generator-reports-gate] report: ${reportPath}`)
  if (status === "passed") {
    console.log("[e2e-generator-reports-gate] passed")
    return
  }

  for (const item of blockedFailedItems) {
    console.error(
      `[gate] fail source=${item.source} reportPath=${item.reportPath}`,
    )
  }
  for (const action of recommendedActions) {
    console.error(`[gate] suggested-action: ${action}`)
  }
  console.error(`[e2e-generator-reports-gate] failed: ${conclusion}`)
  process.exitCode = 1
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-generator-reports-gate] failed: ${message}`)
    process.exitCode = 1
  }
}
