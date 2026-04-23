import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { resolveP5aReportDir } from "./p5a-schema-handoff"

type P5aStepStatus = "passed" | "failed"

interface P5aAcceptanceCaseReport {
  caseId: string
  replay: P5aStepStatus
  generator: P5aStepStatus
  status: P5aStepStatus
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
  acceptanceReportPath: string
  status: P5aStepStatus
  policy: {
    minCaseCount: number
    requireGeneratedArtifacts: boolean
    policyInputs: {
      minCaseCountRaw: string | null
      requireGeneratedArtifactsRaw: string | null
      acceptanceReportPathRaw: string | null
    }
  }
  summary: {
    acceptanceStatus: P5aStepStatus
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

const parsePositiveIntEnv = (
  raw: string | undefined,
  defaultValue: number,
  envName: string,
) => {
  if (!raw) {
    return defaultValue
  }

  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ${envName}: ${raw}`)
  }

  return value
}

const parseBooleanEnv = (
  raw: string | undefined,
  defaultValue: boolean,
  envName: string,
) => {
  if (!raw) {
    return defaultValue
  }

  const normalized = raw.trim().toLowerCase()
  if (normalized === "true") {
    return true
  }
  if (normalized === "false") {
    return false
  }

  throw new Error(`Invalid ${envName}: ${raw}`)
}

export const validateP5aAcceptanceReport = (report: P5aAcceptanceReport) => {
  assert(
    report.status === "passed" || report.status === "failed",
    "Invalid P5A acceptance report: status is invalid",
  )
  assert(
    report.steps.corpus === "passed" || report.steps.corpus === "failed",
    "Invalid P5A acceptance report: steps.corpus is invalid",
  )
  assert(
    report.steps.replay === "passed" || report.steps.replay === "failed",
    "Invalid P5A acceptance report: steps.replay is invalid",
  )
  assert(
    report.steps.generator === "passed" || report.steps.generator === "failed",
    "Invalid P5A acceptance report: steps.generator is invalid",
  )
  assert(
    Array.isArray(report.cases),
    "Invalid P5A acceptance report: cases is missing",
  )

  for (const item of report.cases) {
    assert(
      typeof item.caseId === "string" && item.caseId.trim().length > 0,
      "Invalid P5A acceptance report: caseId is invalid",
    )
    assert(
      item.replay === "passed" || item.replay === "failed",
      `Invalid P5A acceptance report: replay is invalid for ${item.caseId}`,
    )
    assert(
      item.generator === "passed" || item.generator === "failed",
      `Invalid P5A acceptance report: generator is invalid for ${item.caseId}`,
    )
    assert(
      item.status === "passed" || item.status === "failed",
      `Invalid P5A acceptance report: status is invalid for ${item.caseId}`,
    )
  }

  const derivedReplay: P5aStepStatus = report.cases.every(
    (item) => item.replay === "passed",
  )
    ? "passed"
    : "failed"
  const derivedGenerator: P5aStepStatus = report.cases.every(
    (item) => item.generator === "passed",
  )
    ? "passed"
    : "failed"
  const derivedStatus: P5aStepStatus =
    report.steps.corpus === "passed" &&
    report.steps.replay === "passed" &&
    report.steps.generator === "passed"
      ? "passed"
      : "failed"

  assert(
    report.steps.replay === derivedReplay,
    "Invalid P5A acceptance report: steps.replay does not match case replay results",
  )
  assert(
    report.steps.generator === derivedGenerator,
    "Invalid P5A acceptance report: steps.generator does not match case generator results",
  )
  assert(
    report.status === derivedStatus,
    "Invalid P5A acceptance report: status does not match step status",
  )
}

const hasCompleteGeneratedArtifacts = (report: P5aAcceptanceReport) =>
  report.cases.every(
    (item) =>
      item.generator !== "passed" ||
      (typeof item.generatedSchemaArtifactPath === "string" &&
        item.generatedSchemaArtifactPath.trim().length > 0),
  )

const buildRecommendedActions = (
  status: P5aStepStatus,
  report: P5aAcceptanceReport,
  minCaseCount: number,
  requireGeneratedArtifacts: boolean,
) => {
  if (status === "passed") {
    return ["No action required."]
  }

  const actions = new Set<string>([
    "Inspect p5a-acceptance-report.json first and fix the failing step before relaxing policy.",
  ])

  if (report.steps.corpus === "failed") {
    actions.add(
      "Re-run p5a:handoff:corpus and inspect the corpus summary to restore the expected decision boundary.",
    )
  }

  if (report.steps.replay === "failed" || report.steps.generator === "failed") {
    actions.add(
      "Inspect failed acceptance case summaries under the replay report directory and fix the corresponding schema handoff path.",
    )
  }

  if (report.cases.length < minCaseCount) {
    actions.add(
      `Expand the acceptance manifest so P5A keeps at least ${String(minCaseCount)} replay/generator success cases.`,
    )
  }

  if (requireGeneratedArtifacts && !hasCompleteGeneratedArtifacts(report)) {
    actions.add(
      "Ensure every generator-passed acceptance case records generatedSchemaArtifactPath so artifact evidence stays complete.",
    )
  }

  return Array.from(actions)
}

export const renderP5aAcceptanceGateSummaryMarkdown = (
  report: P5aAcceptanceGateReport,
) => {
  const lines = [
    "### P5A Acceptance Gate",
    "",
    `- status: \`${report.status}\``,
    `- acceptanceStatus: \`${report.summary.acceptanceStatus}\``,
    `- corpus: \`${report.summary.corpus}\``,
    `- replay: \`${report.summary.replay}\``,
    `- generator: \`${report.summary.generator}\``,
    `- caseCount: \`${String(report.summary.caseCount)}\``,
    `- minCaseCount: \`${String(report.policy.minCaseCount)}\``,
    `- generatedArtifactCoverage: \`${report.summary.generatedArtifactCoverage}\``,
    `- requireGeneratedArtifacts: \`${String(report.policy.requireGeneratedArtifacts)}\``,
    `- conclusion: ${report.conclusion}`,
    "",
    "Recommended actions:",
    ...report.recommendedActions.map((action) => `- ${action}`),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const buildP5aAcceptanceGateGitHubOutputLines = (
  report: P5aAcceptanceGateReport,
) => [
  `p5a_acceptance_gate_status=${report.status}`,
  `p5a_acceptance_gate_case_count=${String(report.summary.caseCount)}`,
  `p5a_acceptance_gate_min_case_count=${String(report.policy.minCaseCount)}`,
  `p5a_acceptance_gate_generated_artifact_coverage=${report.summary.generatedArtifactCoverage}`,
]

export const run = async () => {
  const minCaseCountRaw =
    process.env.ELYSIAN_P5A_ACCEPTANCE_GATE_MIN_CASE_COUNT ?? null
  const requireGeneratedArtifactsRaw =
    process.env.ELYSIAN_P5A_ACCEPTANCE_GATE_REQUIRE_GENERATED_ARTIFACTS ?? null
  const acceptanceReportPathRaw =
    process.env.ELYSIAN_P5A_ACCEPTANCE_REPORT_PATH ?? null

  const minCaseCount = parsePositiveIntEnv(
    process.env.ELYSIAN_P5A_ACCEPTANCE_GATE_MIN_CASE_COUNT,
    3,
    "ELYSIAN_P5A_ACCEPTANCE_GATE_MIN_CASE_COUNT",
  )
  const requireGeneratedArtifacts = parseBooleanEnv(
    process.env.ELYSIAN_P5A_ACCEPTANCE_GATE_REQUIRE_GENERATED_ARTIFACTS,
    true,
    "ELYSIAN_P5A_ACCEPTANCE_GATE_REQUIRE_GENERATED_ARTIFACTS",
  )
  const acceptanceReportPath = resolveAcceptanceReportPath()
  const raw = await readFile(acceptanceReportPath, "utf8")
  const acceptanceReport = JSON.parse(raw) as P5aAcceptanceReport

  validateP5aAcceptanceReport(acceptanceReport)

  const generatedArtifactCoverage: "complete" | "incomplete" =
    hasCompleteGeneratedArtifacts(acceptanceReport) ? "complete" : "incomplete"
  const status: P5aStepStatus =
    acceptanceReport.status === "passed" &&
    acceptanceReport.cases.length >= minCaseCount &&
    (!requireGeneratedArtifacts || generatedArtifactCoverage === "complete")
      ? "passed"
      : "failed"
  const conclusion =
    status === "passed"
      ? "P5A acceptance gate passed."
      : `P5A acceptance gate failed: acceptanceStatus=${acceptanceReport.status}, caseCount=${String(acceptanceReport.cases.length)}, minCaseCount=${String(minCaseCount)}, generatedArtifactCoverage=${generatedArtifactCoverage}.`

  const gateReport: P5aAcceptanceGateReport = {
    generatedAt: new Date().toISOString(),
    acceptanceReportPath,
    status,
    policy: {
      minCaseCount,
      requireGeneratedArtifacts,
      policyInputs: {
        minCaseCountRaw,
        requireGeneratedArtifactsRaw,
        acceptanceReportPathRaw,
      },
    },
    summary: {
      acceptanceStatus: acceptanceReport.status,
      corpus: acceptanceReport.steps.corpus,
      replay: acceptanceReport.steps.replay,
      generator: acceptanceReport.steps.generator,
      caseCount: acceptanceReport.cases.length,
      generatedArtifactCoverage,
    },
    conclusion,
    recommendedActions: buildRecommendedActions(
      status,
      acceptanceReport,
      minCaseCount,
      requireGeneratedArtifacts,
    ),
  }

  const reportDir = join(resolveP5aReportDir(), "acceptance")
  const reportPath = join(reportDir, "p5a-acceptance-gate.json")

  await mkdir(reportDir, { recursive: true })
  await writeFile(reportPath, JSON.stringify(gateReport, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(
      summaryPath,
      renderP5aAcceptanceGateSummaryMarkdown(gateReport),
      "utf8",
    )
    console.log(`[p5a-acceptance-gate] summary: ${summaryPath}`)
  }

  const githubOutputPath = resolveGitHubOutputPath()
  if (githubOutputPath) {
    await appendFile(
      githubOutputPath,
      `${buildP5aAcceptanceGateGitHubOutputLines(gateReport).join("\n")}\n`,
      "utf8",
    )
    console.log(`[p5a-acceptance-gate] github-output: ${githubOutputPath}`)
  }

  console.log(`[p5a-acceptance-gate] report: ${reportPath}`)
  console.log(`[p5a-acceptance-gate] ${conclusion}`)

  if (status === "failed") {
    for (const action of gateReport.recommendedActions) {
      console.error(`[p5a-acceptance-gate] suggested-action: ${action}`)
    }
  }

  return gateReport
}

if (import.meta.main) {
  try {
    const report = await run()
    if (report.status === "failed") {
      process.exitCode = 1
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[p5a-acceptance-gate] failed: ${message}`)
    process.exitCode = 1
  }
}
