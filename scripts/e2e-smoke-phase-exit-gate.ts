import { appendFile, readFile } from "node:fs/promises"
import { join } from "node:path"

interface SmokeStabilityEvidenceReport {
  generatedAt: string
  windowSize: number
  totalSnapshots: number
  selectedWindowRuns: number
  hasMinimumRuns: boolean
  failedGateCount: number
  maxConsecutiveFailedGates: number
  recoveredByRetryCount: number
  systemicBlockerDetected: boolean
  qualifiedForPhaseTransition: boolean
  recommendation: "hold_phase6a" | "candidate_for_next_phase"
  topRunIds: string[]
}

interface PhaseExitGateReport {
  generatedAt: string
  evidencePath: string
  status: "passed" | "failed"
  conclusion: string
  summary: {
    windowSize: number
    selectedWindowRuns: number
    hasMinimumRuns: boolean
    systemicBlockerDetected: boolean
    qualifiedForPhaseTransition: boolean
    recommendation: SmokeStabilityEvidenceReport["recommendation"]
  }
  recommendedActions: string[]
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const resolveSummaryPath = () => process.env.GITHUB_STEP_SUMMARY ?? null

const resolveEvidencePath = () =>
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_PATH ??
  join(
    process.cwd(),
    "artifacts",
    "stability-evidence",
    "e2e-smoke-stability-evidence.json",
  )

const parseEvidence = (raw: string) => {
  const parsed = JSON.parse(raw) as Partial<SmokeStabilityEvidenceReport>
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
    typeof parsed.qualifiedForPhaseTransition === "boolean",
    "Invalid evidence: qualifiedForPhaseTransition is missing",
  )
  assert(
    parsed.recommendation === "hold_phase6a" ||
      parsed.recommendation === "candidate_for_next_phase",
    "Invalid evidence: recommendation is invalid",
  )
  return parsed as SmokeStabilityEvidenceReport
}

const buildRecommendedActions = (evidence: SmokeStabilityEvidenceReport) => {
  if (evidence.qualifiedForPhaseTransition) {
    return [
      "Record the phase transition decision and choose next mainline (Phase 6B or Phase 5).",
      "Freeze smoke gate policy before starting next phase.",
    ]
  }

  const actions = [
    "Keep Phase 6A Round-2 active and continue collecting stability evidence.",
  ]
  if (!evidence.hasMinimumRuns) {
    actions.push(
      `Collect more runs: ${evidence.selectedWindowRuns}/${evidence.windowSize}.`,
    )
  }
  if (evidence.systemicBlockerDetected) {
    actions.push(
      `Fix systemic blocker: maxConsecutiveFailedGates=${evidence.maxConsecutiveFailedGates}.`,
    )
  }
  return actions
}

export const renderGateSummaryMarkdown = (report: PhaseExitGateReport) => {
  const lines = [
    "### Phase Exit Gate",
    "",
    `- status: \`${report.status}\``,
    `- qualifiedForPhaseTransition: \`${String(report.summary.qualifiedForPhaseTransition)}\``,
    `- selectedWindowRuns: \`${String(report.summary.selectedWindowRuns)}\``,
    `- windowSize: \`${String(report.summary.windowSize)}\``,
    `- hasMinimumRuns: \`${String(report.summary.hasMinimumRuns)}\``,
    `- systemicBlockerDetected: \`${String(report.summary.systemicBlockerDetected)}\``,
    `- recommendation: \`${report.summary.recommendation}\``,
    `- conclusion: ${report.conclusion}`,
    "",
    "Recommended actions:",
    ...report.recommendedActions.map((x) => `- ${x}`),
    "",
  ]
  return `${lines.join("\n")}\n`
}

export const run = async () => {
  const evidencePath = resolveEvidencePath()
  const raw = await readFile(evidencePath, "utf8")
  const evidence = parseEvidence(raw)

  const status: "passed" | "failed" = evidence.qualifiedForPhaseTransition
    ? "passed"
    : "failed"
  const conclusion =
    status === "passed"
      ? "Phase 6A Round-2 exit gate passed."
      : `Phase 6A Round-2 exit gate failed: hasMinimumRuns=${String(evidence.hasMinimumRuns)}, systemicBlockerDetected=${String(evidence.systemicBlockerDetected)}.`

  const report: PhaseExitGateReport = {
    generatedAt: new Date().toISOString(),
    evidencePath,
    status,
    conclusion,
    summary: {
      windowSize: evidence.windowSize,
      selectedWindowRuns: evidence.selectedWindowRuns,
      hasMinimumRuns: evidence.hasMinimumRuns,
      systemicBlockerDetected: evidence.systemicBlockerDetected,
      qualifiedForPhaseTransition: evidence.qualifiedForPhaseTransition,
      recommendation: evidence.recommendation,
    },
    recommendedActions: buildRecommendedActions(evidence),
  }

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(summaryPath, renderGateSummaryMarkdown(report), "utf8")
    console.log(`[e2e-smoke-phase-gate] summary: ${summaryPath}`)
  }

  console.log(`[e2e-smoke-phase-gate] ${report.conclusion}`)
  if (report.status === "failed") {
    for (const action of report.recommendedActions) {
      console.error(`[e2e-smoke-phase-gate] suggested-action: ${action}`)
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
    console.error(`[e2e-smoke-phase-gate] failed: ${message}`)
    process.exitCode = 1
  }
}
