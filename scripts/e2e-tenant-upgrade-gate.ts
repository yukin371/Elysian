import { appendFile, readFile } from "node:fs/promises"
import { join } from "node:path"

interface TenantStabilityEvidenceReport {
  generatedAt: string
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

interface TenantUpgradeGateReport {
  generatedAt: string
  evidencePath: string
  status: "passed" | "failed"
  conclusion: string
  summary: {
    windowSize: number
    selectedWindowRuns: number
    hasMinimumRuns: boolean
    systemicBlockerDetected: boolean
    qualifiedForNextStep: boolean
    recommendation: TenantStabilityEvidenceReport["recommendation"]
  }
  recommendedActions: string[]
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

const resolveSummaryPath = () => readNonEmptyEnv("GITHUB_STEP_SUMMARY")

const resolveEvidenceOutputDir = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR")

const resolveEvidencePath = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH") ??
  (resolveEvidenceOutputDir()
    ? join(
        resolveEvidenceOutputDir() as string,
        "e2e-tenant-stability-evidence.json",
      )
    : null) ??
  join(
    process.cwd(),
    "artifacts",
    "tenant-stability-evidence",
    "e2e-tenant-stability-evidence.json",
  )

const parseEvidence = (raw: string) => {
  const parsed = JSON.parse(raw) as Partial<TenantStabilityEvidenceReport>

  assert(
    typeof parsed.windowSize === "number" && Number.isFinite(parsed.windowSize),
    "Invalid evidence: windowSize is missing",
  )
  assert(
    typeof parsed.selectedWindowRuns === "number" &&
      Number.isFinite(parsed.selectedWindowRuns),
    "Invalid evidence: selectedWindowRuns is missing",
  )
  assert(
    typeof parsed.hasMinimumRuns === "boolean",
    "Invalid evidence: hasMinimumRuns is missing",
  )
  assert(
    typeof parsed.systemicBlockerDetected === "boolean",
    "Invalid evidence: systemicBlockerDetected is missing",
  )
  assert(
    typeof parsed.qualifiedForNextStep === "boolean",
    "Invalid evidence: qualifiedForNextStep is missing",
  )
  assert(
    parsed.recommendation === "continue_observation" ||
      parsed.recommendation === "candidate_for_next_step",
    "Invalid evidence: recommendation is invalid",
  )

  return parsed as TenantStabilityEvidenceReport
}

const buildRecommendedActions = (evidence: TenantStabilityEvidenceReport) => {
  if (evidence.qualifiedForNextStep) {
    return [
      "Record the tenant upgrade decision and schedule the next-step execution review.",
      "Freeze tenant e2e observation policy before expanding rollout scope.",
    ]
  }

  const actions = [
    "Keep tenant stability observation active and continue collecting evidence.",
  ]
  if (!evidence.hasMinimumRuns) {
    actions.push(
      `Collect more runs: ${evidence.selectedWindowRuns}/${evidence.windowSize}.`,
    )
  }
  if (evidence.systemicBlockerDetected) {
    actions.push(
      `Fix systemic blocker: maxConsecutiveFailedRuns=${evidence.maxConsecutiveFailedRuns}.`,
    )
  }
  return actions
}

export const renderGateSummaryMarkdown = (report: TenantUpgradeGateReport) => {
  const lines = [
    "### Tenant Upgrade Gate",
    "",
    `- status: \`${report.status}\``,
    `- qualifiedForNextStep: \`${String(report.summary.qualifiedForNextStep)}\``,
    `- selectedWindowRuns: \`${String(report.summary.selectedWindowRuns)}\``,
    `- windowSize: \`${String(report.summary.windowSize)}\``,
    `- hasMinimumRuns: \`${String(report.summary.hasMinimumRuns)}\``,
    `- systemicBlockerDetected: \`${String(report.summary.systemicBlockerDetected)}\``,
    `- recommendation: \`${report.summary.recommendation}\``,
    `- conclusion: ${report.conclusion}`,
    "",
    "Recommended actions:",
    ...report.recommendedActions.map((item) => `- ${item}`),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const run = async () => {
  const evidencePath = resolveEvidencePath()
  const raw = await readFile(evidencePath, "utf8")
  const evidence = parseEvidence(raw)

  const status: "passed" | "failed" = evidence.qualifiedForNextStep
    ? "passed"
    : "failed"
  const conclusion =
    status === "passed"
      ? "Tenant stability upgrade gate passed."
      : `Tenant stability upgrade gate failed: hasMinimumRuns=${String(evidence.hasMinimumRuns)}, systemicBlockerDetected=${String(evidence.systemicBlockerDetected)}.`

  const report: TenantUpgradeGateReport = {
    generatedAt: new Date().toISOString(),
    evidencePath,
    status,
    conclusion,
    summary: {
      windowSize: evidence.windowSize,
      selectedWindowRuns: evidence.selectedWindowRuns,
      hasMinimumRuns: evidence.hasMinimumRuns,
      systemicBlockerDetected: evidence.systemicBlockerDetected,
      qualifiedForNextStep: evidence.qualifiedForNextStep,
      recommendation: evidence.recommendation,
    },
    recommendedActions: buildRecommendedActions(evidence),
  }

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(summaryPath, renderGateSummaryMarkdown(report), "utf8")
    console.log(`[e2e-tenant-upgrade-gate] summary: ${summaryPath}`)
  }

  console.log(`[e2e-tenant-upgrade-gate] ${report.conclusion}`)
  if (report.status === "failed") {
    for (const action of report.recommendedActions) {
      console.error(`[e2e-tenant-upgrade-gate] suggested-action: ${action}`)
    }
    process.exitCode = 1
  }

  return report
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-tenant-upgrade-gate] failed: ${message}`)
    process.exitCode = 1
  }
}
