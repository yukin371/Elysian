import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { resolveP5aReportDir } from "./p5a-schema-handoff"

type P5aStepStatus = "passed" | "failed"

interface P5aAcceptanceCaseReport {
  caseId: string
  generator: P5aStepStatus
  generatedSchemaArtifactPath?: string
}

interface P5aAcceptanceReport {
  generatedAt: string
  status: P5aStepStatus
  steps: {
    corpus: P5aStepStatus
    replay: P5aStepStatus
    generator: P5aStepStatus
  }
  cases: P5aAcceptanceCaseReport[]
}

interface P5aAcceptanceGateReport {
  generatedAt: string
  status: P5aStepStatus
  summary: {
    acceptanceStatus: P5aStepStatus
    corpus: P5aStepStatus
    replay: P5aStepStatus
    generator: P5aStepStatus
    caseCount: number
    generatedArtifactCoverage: "complete" | "incomplete"
  }
  recommendedActions: string[]
}

interface P5aAcceptanceIndexReport {
  generatedAt: string
  reportDir: string
  status: P5aStepStatus
  inputs: {
    acceptanceReportPath: string
    gateReportPath: string
  }
  summary: {
    acceptanceStatus: P5aStepStatus
    gateStatus: P5aStepStatus
    corpus: P5aStepStatus
    replay: P5aStepStatus
    generator: P5aStepStatus
    caseCount: number
    generatedArtifactCoverage: "complete" | "incomplete"
  }
  conclusion: string
  recommendedActions: string[]
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const resolveSummaryPath = () => process.env.GITHUB_STEP_SUMMARY ?? null
const resolveGitHubOutputPath = () => process.env.GITHUB_OUTPUT ?? null

const resolveAcceptanceReportPath = () =>
  process.env.ELYSIAN_P5A_ACCEPTANCE_REPORT_PATH ??
  join(resolveP5aReportDir(), "acceptance", "p5a-acceptance-report.json")

const resolveGateReportPath = () =>
  process.env.ELYSIAN_P5A_ACCEPTANCE_GATE_REPORT_PATH ??
  join(resolveP5aReportDir(), "acceptance", "p5a-acceptance-gate.json")

const hasCompleteGeneratedArtifacts = (report: P5aAcceptanceReport) =>
  report.cases.every(
    (item) =>
      item.generator !== "passed" ||
      (typeof item.generatedSchemaArtifactPath === "string" &&
        item.generatedSchemaArtifactPath.trim().length > 0),
  )

export const validateP5aAcceptanceIndexInputs = (
  acceptance: P5aAcceptanceReport,
  gate: P5aAcceptanceGateReport,
) => {
  assert(
    acceptance.status === "passed" || acceptance.status === "failed",
    "Invalid P5A acceptance index input: acceptance.status is invalid",
  )
  assert(
    gate.status === "passed" || gate.status === "failed",
    "Invalid P5A acceptance index input: gate.status is invalid",
  )
  assert(
    gate.summary.acceptanceStatus === acceptance.status,
    "Invalid P5A acceptance index input: gate acceptanceStatus does not match acceptance report",
  )
  assert(
    gate.summary.corpus === acceptance.steps.corpus,
    "Invalid P5A acceptance index input: gate corpus does not match acceptance report",
  )
  assert(
    gate.summary.replay === acceptance.steps.replay,
    "Invalid P5A acceptance index input: gate replay does not match acceptance report",
  )
  assert(
    gate.summary.generator === acceptance.steps.generator,
    "Invalid P5A acceptance index input: gate generator does not match acceptance report",
  )
  assert(
    gate.summary.caseCount === acceptance.cases.length,
    "Invalid P5A acceptance index input: gate caseCount does not match acceptance report",
  )

  const generatedArtifactCoverage: "complete" | "incomplete" =
    hasCompleteGeneratedArtifacts(acceptance) ? "complete" : "incomplete"

  assert(
    gate.summary.generatedArtifactCoverage === generatedArtifactCoverage,
    "Invalid P5A acceptance index input: gate generatedArtifactCoverage does not match acceptance report",
  )
}

export const renderP5aAcceptanceIndexSummaryMarkdown = (
  report: P5aAcceptanceIndexReport,
) => {
  const lines = [
    "### P5A Acceptance Index",
    "",
    `- status: \`${report.status}\``,
    `- acceptanceStatus: \`${report.summary.acceptanceStatus}\``,
    `- gateStatus: \`${report.summary.gateStatus}\``,
    `- corpus: \`${report.summary.corpus}\``,
    `- replay: \`${report.summary.replay}\``,
    `- generator: \`${report.summary.generator}\``,
    `- caseCount: \`${String(report.summary.caseCount)}\``,
    `- generatedArtifactCoverage: \`${report.summary.generatedArtifactCoverage}\``,
    `- conclusion: ${report.conclusion}`,
    "",
    "Recommended actions:",
    ...report.recommendedActions.map((action) => `- ${action}`),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const buildP5aAcceptanceIndexGitHubOutputLines = (
  report: P5aAcceptanceIndexReport,
) => [
  `p5a_acceptance_index_status=${report.status}`,
  `p5a_acceptance_index_case_count=${String(report.summary.caseCount)}`,
  `p5a_acceptance_index_gate_status=${report.summary.gateStatus}`,
  `p5a_acceptance_index_generated_artifact_coverage=${report.summary.generatedArtifactCoverage}`,
]

export const run = async () => {
  const acceptanceReportPath = resolveAcceptanceReportPath()
  const gateReportPath = resolveGateReportPath()
  const acceptanceRaw = await readFile(acceptanceReportPath, "utf8")
  const gateRaw = await readFile(gateReportPath, "utf8")
  const acceptance = JSON.parse(acceptanceRaw) as P5aAcceptanceReport
  const gate = JSON.parse(gateRaw) as P5aAcceptanceGateReport

  validateP5aAcceptanceIndexInputs(acceptance, gate)

  const reportDir = join(resolveP5aReportDir(), "acceptance")
  const report: P5aAcceptanceIndexReport = {
    generatedAt: new Date().toISOString(),
    reportDir,
    status: gate.status,
    inputs: {
      acceptanceReportPath,
      gateReportPath,
    },
    summary: {
      acceptanceStatus: acceptance.status,
      gateStatus: gate.status,
      corpus: acceptance.steps.corpus,
      replay: acceptance.steps.replay,
      generator: acceptance.steps.generator,
      caseCount: acceptance.cases.length,
      generatedArtifactCoverage: gate.summary.generatedArtifactCoverage,
    },
    conclusion:
      gate.status === "passed"
        ? "P5A acceptance index confirms the current gate boundary passed."
        : "P5A acceptance index confirms the current gate boundary failed.",
    recommendedActions:
      gate.status === "passed"
        ? ["No action required."]
        : gate.recommendedActions,
  }

  const reportPath = join(reportDir, "p5a-acceptance-index.json")

  await mkdir(reportDir, { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(
      summaryPath,
      renderP5aAcceptanceIndexSummaryMarkdown(report),
      "utf8",
    )
    console.log(`[p5a-acceptance-index] summary: ${summaryPath}`)
  }

  const githubOutputPath = resolveGitHubOutputPath()
  if (githubOutputPath) {
    await appendFile(
      githubOutputPath,
      `${buildP5aAcceptanceIndexGitHubOutputLines(report).join("\n")}\n`,
      "utf8",
    )
    console.log(`[p5a-acceptance-index] github-output: ${githubOutputPath}`)
  }

  console.log(`[p5a-acceptance-index] report: ${reportPath}`)
  console.log(
    `[p5a-acceptance-index] status=${report.status} acceptance=${report.summary.acceptanceStatus} gate=${report.summary.gateStatus} cases=${String(report.summary.caseCount)}`,
  )

  return report
}

if (import.meta.main) {
  try {
    const report = await run()
    if (report.status === "failed") {
      process.exitCode = 1
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[p5a-acceptance-index] failed: ${message}`)
    process.exitCode = 1
  }
}
