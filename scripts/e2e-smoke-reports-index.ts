import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { basename, join } from "node:path"

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

interface SmokeAttemptSummary {
  attempt: "attempt1" | "attempt2"
  reportPath: string
  diagnosisPath: string | null
  status: SmokeReport["status"]
  failureCategory: SmokeFailureCategory | null
  lastStage: string
  shouldRetry: boolean | null
}

interface SmokeReportsIndex {
  generatedAt: string
  reportDir: string
  finalStatus: "passed" | "failed"
  recoveredByRetry: boolean
  attempts: SmokeAttemptSummary[]
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const resolveSmokeReportDir = () =>
  process.env.ELYSIAN_SMOKE_REPORT_DIR ??
  join(process.env.RUNNER_TEMP ?? process.cwd(), "elysian-reports", "smoke")

const resolveSummaryPath = () => process.env.GITHUB_STEP_SUMMARY ?? null
const resolveGitHubOutputPath = () => process.env.GITHUB_OUTPUT ?? null

const attemptConfigs = [
  {
    attempt: "attempt1" as const,
    reportPath: "e2e-smoke-report-attempt1.json",
    diagnosisPath: "e2e-smoke-diagnosis-attempt1.json",
  },
  {
    attempt: "attempt2" as const,
    reportPath: "e2e-smoke-report-attempt2.json",
    diagnosisPath: "e2e-smoke-diagnosis-attempt2.json",
  },
]

const readJsonFile = async <T>(path: string): Promise<T | null> => {
  try {
    const raw = await readFile(path, "utf8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const renderSmokeIndexSummaryMarkdown = (index: SmokeReportsIndex) => {
  const lines = [
    "### E2E Smoke Index",
    "",
    `- finalStatus: \`${index.finalStatus}\``,
    `- recoveredByRetry: \`${String(index.recoveredByRetry)}\``,
    `- attempts: \`${String(index.attempts.length)}\``,
    "",
    "Attempt details:",
    ...index.attempts.map(
      (attempt) =>
        `- ${attempt.attempt}: status=${attempt.status}, category=${attempt.failureCategory ?? "none"}, stage=${attempt.lastStage}, shouldRetry=${attempt.shouldRetry === null ? "n/a" : String(attempt.shouldRetry)}`,
    ),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const buildGitHubOutputLines = (index: SmokeReportsIndex) => [
  `smoke_final_status=${index.finalStatus}`,
  `smoke_recovered_by_retry=${String(index.recoveredByRetry)}`,
  `smoke_attempt_count=${String(index.attempts.length)}`,
]

export const run = async () => {
  const reportDir = resolveSmokeReportDir()
  const attempts: SmokeAttemptSummary[] = []

  for (const config of attemptConfigs) {
    const reportPath = join(reportDir, config.reportPath)
    const diagnosisPath = join(reportDir, config.diagnosisPath)
    const report = await readJsonFile<SmokeReport>(reportPath)

    if (!report) {
      continue
    }

    const diagnosis = await readJsonFile<SmokeDiagnosisReport>(diagnosisPath)
    attempts.push({
      attempt: config.attempt,
      reportPath: basename(reportPath),
      diagnosisPath: diagnosis ? basename(diagnosisPath) : null,
      status: report.status,
      failureCategory: report.failureCategory,
      lastStage: report.lastStage,
      shouldRetry: diagnosis?.retryRecommendation.shouldRetry ?? null,
    })
  }

  assert(attempts.length > 0, "No smoke attempt reports found")

  const lastAttempt = attempts[attempts.length - 1]
  assert(lastAttempt, "No smoke attempt reports found")
  const firstAttempt = attempts[0]
  assert(firstAttempt, "No smoke attempt reports found")
  const index: SmokeReportsIndex = {
    generatedAt: new Date().toISOString(),
    reportDir,
    finalStatus: lastAttempt.status,
    recoveredByRetry:
      attempts.length > 1 &&
      firstAttempt.status === "failed" &&
      lastAttempt.status === "passed",
    attempts,
  }

  const indexPath = join(reportDir, "e2e-smoke-reports-index.json")
  await mkdir(reportDir, { recursive: true })
  await writeFile(indexPath, JSON.stringify(index, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(
      summaryPath,
      renderSmokeIndexSummaryMarkdown(index),
      "utf8",
    )
    console.log(`[e2e-smoke-index] summary: ${summaryPath}`)
  }

  const githubOutputPath = resolveGitHubOutputPath()
  if (githubOutputPath) {
    await appendFile(
      githubOutputPath,
      `${buildGitHubOutputLines(index).join("\n")}\n`,
      "utf8",
    )
    console.log(`[e2e-smoke-index] github-output: ${githubOutputPath}`)
  }

  console.log(`[e2e-smoke-index] report: ${indexPath}`)
  console.log(
    `[e2e-smoke-index] finalStatus=${index.finalStatus} recoveredByRetry=${String(index.recoveredByRetry)}`,
  )
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-smoke-index] failed: ${message}`)
    process.exitCode = 1
  }
}
