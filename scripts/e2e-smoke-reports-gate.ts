import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

type SmokeFailureCategory = "environment" | "dependency" | "test_case"

interface SmokeAttemptSummary {
  attempt: "attempt1" | "attempt2"
  reportPath: string
  diagnosisPath: string | null
  status: "passed" | "failed"
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

interface SmokeGateReport {
  generatedAt: string
  indexPath: string
  status: "passed" | "failed"
  policy: {
    allowRecoveredByRetry: boolean
    maxAttempts: number
    policyInputs: {
      allowRecoveredByRetryRaw: string | null
      maxAttemptsRaw: string | null
      indexPathRaw: string | null
    }
  }
  summary: {
    finalStatus: "passed" | "failed"
    recoveredByRetry: boolean
    attempts: number
  }
  conclusion: string
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

const resolveSummaryPath = () => process.env.GITHUB_STEP_SUMMARY ?? null
const resolveGitHubOutputPath = () => process.env.GITHUB_OUTPUT ?? null

const resolveGateIndexPath = () =>
  process.env.ELYSIAN_SMOKE_GATE_INDEX_PATH ??
  join(resolveSmokeReportDir(), "e2e-smoke-reports-index.json")

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

const buildRecommendedActions = (
  status: "passed" | "failed",
  index: SmokeReportsIndex,
) => {
  if (status === "passed") {
    return ["No action required."]
  }

  const actions = new Set<string>([
    "Inspect e2e-smoke-reports-index.json and attempt-level reports first.",
  ])

  if (index.finalStatus === "failed") {
    actions.add(
      "Fix the latest failed attempt before re-running CI; do not rely on repeated retries.",
    )
  }

  if (index.recoveredByRetry) {
    actions.add(
      "This run recovered by retry; inspect dependency readiness and reduce transient failures.",
    )
  }

  return Array.from(actions)
}

export const renderGateSummaryMarkdown = (report: SmokeGateReport) => {
  const lines = [
    "### E2E Smoke Gate",
    "",
    `- status: \`${report.status}\``,
    `- finalStatus: \`${report.summary.finalStatus}\``,
    `- recoveredByRetry: \`${String(report.summary.recoveredByRetry)}\``,
    `- attempts: \`${String(report.summary.attempts)}\``,
    `- allowRecoveredByRetry: \`${String(report.policy.allowRecoveredByRetry)}\``,
    `- maxAttempts: \`${String(report.policy.maxAttempts)}\``,
    `- conclusion: ${report.conclusion}`,
    "",
    "Recommended actions:",
    ...report.recommendedActions.map((action) => `- ${action}`),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const buildGitHubOutputLines = (report: SmokeGateReport) => [
  `smoke_gate_status=${report.status}`,
  `smoke_gate_final_status=${report.summary.finalStatus}`,
  `smoke_gate_recovered_by_retry=${String(report.summary.recoveredByRetry)}`,
  `smoke_gate_attempts=${String(report.summary.attempts)}`,
]

export const run = async () => {
  const allowRecoveredByRetryRaw =
    process.env.ELYSIAN_SMOKE_GATE_ALLOW_RECOVERED_BY_RETRY ?? null
  const maxAttemptsRaw = process.env.ELYSIAN_SMOKE_GATE_MAX_ATTEMPTS ?? null
  const indexPathRaw = process.env.ELYSIAN_SMOKE_GATE_INDEX_PATH ?? null

  const allowRecoveredByRetry = parseBooleanEnv(
    process.env.ELYSIAN_SMOKE_GATE_ALLOW_RECOVERED_BY_RETRY,
    true,
    "ELYSIAN_SMOKE_GATE_ALLOW_RECOVERED_BY_RETRY",
  )
  const maxAttempts = parsePositiveIntEnv(
    process.env.ELYSIAN_SMOKE_GATE_MAX_ATTEMPTS,
    2,
    "ELYSIAN_SMOKE_GATE_MAX_ATTEMPTS",
  )
  const indexPath = resolveGateIndexPath()
  const raw = await readFile(indexPath, "utf8")
  const index = JSON.parse(raw) as SmokeReportsIndex

  assert(
    Array.isArray(index.attempts),
    "Invalid smoke index: attempts is missing",
  )
  assert(
    index.finalStatus === "passed" || index.finalStatus === "failed",
    "Invalid smoke index: finalStatus is invalid",
  )

  const status: "passed" | "failed" =
    index.finalStatus === "passed" &&
    index.attempts.length <= maxAttempts &&
    (allowRecoveredByRetry || !index.recoveredByRetry)
      ? "passed"
      : "failed"
  const conclusion =
    status === "passed"
      ? "Smoke reports gate passed."
      : `Smoke reports gate failed: finalStatus=${index.finalStatus}, recoveredByRetry=${String(index.recoveredByRetry)}, attempts=${String(index.attempts.length)}.`

  const report: SmokeGateReport = {
    generatedAt: new Date().toISOString(),
    indexPath,
    status,
    policy: {
      allowRecoveredByRetry,
      maxAttempts,
      policyInputs: {
        allowRecoveredByRetryRaw,
        maxAttemptsRaw,
        indexPathRaw,
      },
    },
    summary: {
      finalStatus: index.finalStatus,
      recoveredByRetry: index.recoveredByRetry,
      attempts: index.attempts.length,
    },
    conclusion,
    recommendedActions: buildRecommendedActions(status, index),
  }

  const reportPath = join(
    resolveSmokeReportDir(),
    "e2e-smoke-reports-gate.json",
  )
  await mkdir(resolveSmokeReportDir(), { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(summaryPath, renderGateSummaryMarkdown(report), "utf8")
    console.log(`[e2e-smoke-gate] summary: ${summaryPath}`)
  }

  const githubOutputPath = resolveGitHubOutputPath()
  if (githubOutputPath) {
    await appendFile(
      githubOutputPath,
      `${buildGitHubOutputLines(report).join("\n")}\n`,
      "utf8",
    )
    console.log(`[e2e-smoke-gate] github-output: ${githubOutputPath}`)
  }

  console.log(`[e2e-smoke-gate] report: ${reportPath}`)
  console.log(`[e2e-smoke-gate] ${conclusion}`)
  if (status === "failed") {
    for (const action of report.recommendedActions) {
      console.error(`[e2e-smoke-gate] suggested-action: ${action}`)
    }
  }

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
    console.error(`[e2e-smoke-gate] failed: ${message}`)
    process.exitCode = 1
  }
}
