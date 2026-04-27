import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

interface TenantReleaseReport {
  generatedAt: string
  outputPath: string
  status: "passed" | "failed"
  blockers: string[]
  recommendedActions: string[]
  summary: {
    sourceBranch: string
    targetBranch: string
    releaseEnvironment: string
    qualifiedForNextStep: boolean
    recommendation: "continue_observation" | "candidate_for_next_step"
  }
}

interface TenantReleaseGateReport {
  generatedAt: string
  reportPath: string
  outputPath: string
  status: "passed" | "failed"
  conclusion: string
  blockerCount: number
  summary: TenantReleaseReport["summary"]
  recommendedActions: string[]
}

const assert = (condition: unknown, message: string) => {
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
  readNonEmptyEnv("ELYSIAN_TENANT_RELEASE_REPORT_PATH") ??
  join(
    process.cwd(),
    "artifacts",
    "tenant-release-rehearsal",
    "tenant-release-report.json",
  )

const resolveOutputPath = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_RELEASE_GATE_REPORT_PATH") ??
  join(
    process.cwd(),
    "artifacts",
    "tenant-release-rehearsal",
    "tenant-release-gate-report.json",
  )

const parseReport = (raw: string) => {
  const parsed = JSON.parse(raw) as Partial<TenantReleaseReport>

  assert(
    parsed.status === "passed" || parsed.status === "failed",
    "Invalid release report: status is invalid",
  )
  assert(
    Array.isArray(parsed.blockers),
    "Invalid release report: blockers missing",
  )
  assert(
    Array.isArray(parsed.recommendedActions),
    "Invalid release report: recommendedActions missing",
  )
  assert(
    typeof parsed.summary === "object" && parsed.summary !== null,
    "Invalid release report: summary missing",
  )
  assert(
    parsed.summary.sourceBranch !== undefined &&
      parsed.summary.targetBranch !== undefined &&
      parsed.summary.releaseEnvironment !== undefined &&
      typeof parsed.summary.qualifiedForNextStep === "boolean" &&
      (parsed.summary.recommendation === "continue_observation" ||
        parsed.summary.recommendation === "candidate_for_next_step"),
    "Invalid release report: summary is incomplete",
  )

  return parsed as TenantReleaseReport
}

export const renderGateSummaryMarkdown = (report: TenantReleaseGateReport) => {
  const lines = [
    "### Tenant Release Gate",
    "",
    `- status: \`${report.status}\``,
    `- source -> target: \`${report.summary.sourceBranch} -> ${report.summary.targetBranch}\``,
    `- environment: \`${report.summary.releaseEnvironment}\``,
    `- qualifiedForNextStep: \`${String(report.summary.qualifiedForNextStep)}\``,
    `- recommendation: \`${report.summary.recommendation}\``,
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
  const releaseReport = parseReport(await readFile(reportPath, "utf8"))

  const status = releaseReport.status
  const gateReport: TenantReleaseGateReport = {
    generatedAt: new Date().toISOString(),
    reportPath,
    outputPath,
    status,
    conclusion:
      status === "passed"
        ? "Tenant release rehearsal gate passed."
        : `Tenant release rehearsal gate failed with ${String(releaseReport.blockers.length)} blocker(s).`,
    blockerCount: releaseReport.blockers.length,
    summary: releaseReport.summary,
    recommendedActions: releaseReport.recommendedActions,
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(gateReport, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(summaryPath, renderGateSummaryMarkdown(gateReport), "utf8")
    console.log(`[tenant-release-gate] summary: ${summaryPath}`)
  }

  console.log(`[tenant-release-gate] report: ${outputPath}`)
  console.log(`[tenant-release-gate] ${gateReport.conclusion}`)

  if (gateReport.status === "failed") {
    for (const action of gateReport.recommendedActions) {
      console.error(`[tenant-release-gate] suggested-action: ${action}`)
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
    console.error(`[tenant-release-gate] failed: ${message}`)
    process.exitCode = 1
  }
}
