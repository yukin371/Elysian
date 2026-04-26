import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

type SmokeFailureCategory = "environment" | "dependency" | "test_case"

interface SmokeReport {
  generatedAt: string
  status: "passed" | "failed"
  baseUrl: string
  durationMs: number
  lastStage: string
  failureCategory: SmokeFailureCategory | null
  failureMessage: string | null
}

interface SmokeDiagnosisReport {
  generatedAt: string
  sourceReportPath: string
  status: SmokeReport["status"]
  failureCategory: SmokeFailureCategory | null
  lastStage: string
  conclusion: string
  retryRecommendation: {
    shouldRetry: boolean
    reason: string
  }
  recommendedActions: string[]
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const resolveSmokeReportDir = () =>
  process.env.ELYSIAN_SMOKE_REPORT_DIR ??
  join(process.env.RUNNER_TEMP ?? process.cwd(), "elysian-reports", "smoke")

const resolveSmokeReportPath = () =>
  process.env.ELYSIAN_SMOKE_REPORT_PATH ??
  join(resolveSmokeReportDir(), "e2e-smoke-report.json")

const resolveSmokeDiagnosisPath = () =>
  process.env.ELYSIAN_SMOKE_DIAGNOSIS_PATH ??
  join(resolveSmokeReportDir(), "e2e-smoke-diagnosis.json")

const resolveSummaryPath = () =>
  process.env.ELYSIAN_SMOKE_DIAGNOSIS_SUMMARY_PATH ??
  process.env.GITHUB_STEP_SUMMARY ??
  null

const resolveGitHubOutputPath = () => process.env.GITHUB_OUTPUT ?? null

export const parseSmokeReport = (raw: string): SmokeReport => {
  const parsed = JSON.parse(raw) as Partial<SmokeReport>
  assert(
    parsed.status === "passed" || parsed.status === "failed",
    "Invalid smoke report: status is missing",
  )
  assert(
    typeof parsed.lastStage === "string",
    "Invalid smoke report: lastStage is missing",
  )
  assert(
    parsed.failureCategory === null ||
      parsed.failureCategory === "environment" ||
      parsed.failureCategory === "dependency" ||
      parsed.failureCategory === "test_case",
    "Invalid smoke report: failureCategory is invalid",
  )
  assert(
    parsed.failureMessage === null || typeof parsed.failureMessage === "string",
    "Invalid smoke report: failureMessage is invalid",
  )

  return parsed as SmokeReport
}

export const buildRecommendedActions = (
  report: Pick<SmokeReport, "status" | "failureCategory" | "lastStage">,
): string[] => {
  if (report.status === "passed") {
    return ["No action required."]
  }

  const actions = new Set<string>([
    "Inspect e2e-smoke-report.json first and confirm failureCategory/lastStage before retrying.",
  ])

  if (report.failureCategory === "environment") {
    actions.add(
      "Validate required CI env vars and secrets: DATABASE_URL, ACCESS_TOKEN_SECRET, ELYSIAN_ADMIN_USERNAME, ELYSIAN_ADMIN_PASSWORD.",
    )
  }

  if (report.failureCategory === "dependency") {
    actions.add(
      "Check PostgreSQL service health and startup timing; verify migrate/seed completed before smoke requests.",
    )
  }

  if (report.failureCategory === "test_case") {
    actions.add(
      "Re-run smoke locally with the same env and inspect the failing API contract at lastStage.",
    )
  }

  if (report.lastStage.startsWith("auth_")) {
    actions.add("Prioritize auth module logs and token/cookie contract checks.")
  }

  if (report.lastStage.startsWith("customer_")) {
    actions.add(
      "Prioritize customer module route/repository checks and verify seed data permission coverage.",
    )
  }

  if (report.lastStage.startsWith("workflow_")) {
    actions.add(
      "Prioritize workflow definition/task transition checks and verify the workflow module runtime path against the latest smoke-created definitions.",
    )
  }

  return Array.from(actions)
}

export const buildConclusion = (
  report: Pick<SmokeReport, "status" | "failureCategory" | "lastStage">,
) =>
  report.status === "passed"
    ? "Smoke report passed."
    : `Smoke report failed at stage=${report.lastStage}, category=${report.failureCategory ?? "unknown"}.`

export const renderDiagnosisSummaryMarkdown = (
  diagnosis: SmokeDiagnosisReport,
) => {
  const lines = [
    "### E2E Smoke Diagnosis",
    "",
    `- status: \`${diagnosis.status}\``,
    `- failureCategory: \`${diagnosis.failureCategory ?? "none"}\``,
    `- lastStage: \`${diagnosis.lastStage}\``,
    `- shouldRetry: \`${diagnosis.retryRecommendation.shouldRetry}\``,
    `- retryReason: ${diagnosis.retryRecommendation.reason}`,
    `- conclusion: ${diagnosis.conclusion}`,
    "",
    "Recommended actions:",
    ...diagnosis.recommendedActions.map((action) => `- ${action}`),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const buildRetryRecommendation = (
  report: Pick<SmokeReport, "status" | "failureCategory">,
) => {
  if (report.status === "passed") {
    return {
      shouldRetry: false,
      reason: "Smoke passed; retry is unnecessary.",
    }
  }

  if (report.failureCategory === "dependency") {
    return {
      shouldRetry: true,
      reason:
        "Dependency-type failures are usually transient in CI (service readiness/network).",
    }
  }

  if (report.failureCategory === "environment") {
    return {
      shouldRetry: false,
      reason: "Environment configuration issues should be fixed before retry.",
    }
  }

  return {
    shouldRetry: false,
    reason: "Test-case failures should be investigated before retry.",
  }
}

export const buildGitHubOutputLines = (diagnosis: SmokeDiagnosisReport) => [
  `smoke_status=${diagnosis.status}`,
  `smoke_should_retry=${String(diagnosis.retryRecommendation.shouldRetry)}`,
  `smoke_failure_category=${diagnosis.failureCategory ?? "none"}`,
  `smoke_last_stage=${diagnosis.lastStage}`,
]

export const run = async () => {
  const smokeReportPath = resolveSmokeReportPath()
  const diagnosisPath = resolveSmokeDiagnosisPath()
  const raw = await readFile(smokeReportPath, "utf8")
  const smokeReport = parseSmokeReport(raw)
  const recommendedActions = buildRecommendedActions(smokeReport)
  const conclusion = buildConclusion(smokeReport)
  const retryRecommendation = buildRetryRecommendation(smokeReport)

  const diagnosis: SmokeDiagnosisReport = {
    generatedAt: new Date().toISOString(),
    sourceReportPath: smokeReportPath,
    status: smokeReport.status,
    failureCategory: smokeReport.failureCategory,
    lastStage: smokeReport.lastStage,
    conclusion,
    retryRecommendation,
    recommendedActions,
  }

  await mkdir(dirname(diagnosisPath), { recursive: true })
  await writeFile(diagnosisPath, JSON.stringify(diagnosis, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(
      summaryPath,
      renderDiagnosisSummaryMarkdown(diagnosis),
      "utf8",
    )
    console.log(`[e2e-smoke-diagnose] summary: ${summaryPath}`)
  }

  const githubOutputPath = resolveGitHubOutputPath()
  if (githubOutputPath) {
    await appendFile(
      githubOutputPath,
      `${buildGitHubOutputLines(diagnosis).join("\n")}\n`,
      "utf8",
    )
    console.log(`[e2e-smoke-diagnose] github-output: ${githubOutputPath}`)
  }

  console.log(`[e2e-smoke-diagnose] report: ${diagnosisPath}`)
  console.log(`[e2e-smoke-diagnose] ${conclusion}`)
  for (const action of recommendedActions) {
    console.log(`[e2e-smoke-diagnose] suggested-action: ${action}`)
  }
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-smoke-diagnose] failed: ${message}`)
    process.exitCode = 1
  }
}
