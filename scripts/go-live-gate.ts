import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

interface GoLiveReport {
  generatedAt: string
  outputPath: string
  status: "passed" | "failed"
  blockers: string[]
  recommendedActions: string[]
  summary: {
    sourceBranch: string
    targetBranch: string
    releaseEnvironment: string | null
    tenantImpact: boolean
  }
}

interface GoLiveGateReport {
  generatedAt: string
  reportPath: string
  outputPath: string
  status: "passed" | "failed"
  conclusion: string
  blockerCount: number
  summary: GoLiveReport["summary"]
  recommendedActions: string[]
}

const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) {
    throw new Error(message)
  }
}

const readNonEmptyEnv = (key: string) => {
  const value = process.env[key]
  return value && value.trim().length > 0 ? value.trim() : null
}

const resolveSummaryPath = () => readNonEmptyEnv("GITHUB_STEP_SUMMARY")

const resolveReportPath = () =>
  readNonEmptyEnv("ELYSIAN_GO_LIVE_REPORT_PATH") ??
  join(process.cwd(), "artifacts", "go-live", "go-live-report.json")

const resolveOutputPath = () =>
  readNonEmptyEnv("ELYSIAN_GO_LIVE_GATE_REPORT_PATH") ??
  join(process.cwd(), "artifacts", "go-live", "go-live-gate-report.json")

const parseReport = (raw: string) => {
  const parsed = JSON.parse(raw) as Partial<GoLiveReport>

  assert(
    parsed.status === "passed" || parsed.status === "failed",
    "Invalid go-live report: status is invalid",
  )
  assert(
    Array.isArray(parsed.blockers),
    "Invalid go-live report: blockers missing",
  )
  assert(
    Array.isArray(parsed.recommendedActions),
    "Invalid go-live report: recommendedActions missing",
  )
  assert(
    typeof parsed.summary === "object" && parsed.summary !== null,
    "Invalid go-live report: summary missing",
  )
  assert(
    typeof parsed.summary.sourceBranch === "string" &&
      typeof parsed.summary.targetBranch === "string" &&
      typeof parsed.summary.tenantImpact === "boolean",
    "Invalid go-live report: summary is incomplete",
  )

  return parsed as GoLiveReport
}

export const renderGateSummaryMarkdown = (report: GoLiveGateReport) => {
  const lines = [
    "### Go-live Gate",
    "",
    `- status: \`${report.status}\``,
    `- source -> target: \`${report.summary.sourceBranch} -> ${report.summary.targetBranch}\``,
    `- environment: \`${report.summary.releaseEnvironment ?? "unset"}\``,
    `- tenantImpact: \`${String(report.summary.tenantImpact)}\``,
    `- blockerCount: \`${String(report.blockerCount)}\``,
    `- conclusion: ${report.conclusion}`,
    "",
    "Recommended actions:",
    ...report.recommendedActions.map((item) => `- ${item}`),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const run = async () => {
  const reportPath = resolveReportPath()
  const outputPath = resolveOutputPath()
  const goLiveReport = parseReport(await readFile(reportPath, "utf8"))

  const gateReport: GoLiveGateReport = {
    generatedAt: new Date().toISOString(),
    reportPath,
    outputPath,
    status: goLiveReport.status,
    conclusion:
      goLiveReport.status === "passed"
        ? "Go-live gate passed."
        : `Go-live gate failed with ${String(goLiveReport.blockers.length)} blocker(s).`,
    blockerCount: goLiveReport.blockers.length,
    summary: goLiveReport.summary,
    recommendedActions: goLiveReport.recommendedActions,
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(gateReport, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(summaryPath, renderGateSummaryMarkdown(gateReport), "utf8")
    console.log(`[go-live-gate] summary: ${summaryPath}`)
  }

  console.log(`[go-live-gate] report: ${outputPath}`)
  console.log(`[go-live-gate] ${gateReport.conclusion}`)

  if (gateReport.status === "failed") {
    for (const action of gateReport.recommendedActions) {
      console.error(`[go-live-gate] suggested-action: ${action}`)
    }
    process.exitCode = 1
  }

  return gateReport
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[go-live-gate] failed: ${message}`)
    process.exitCode = 1
  }
}
