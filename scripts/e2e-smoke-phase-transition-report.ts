import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

interface SmokeStabilityEvidenceReport {
  generatedAt: string
  inputDir: string
  outputDir: string
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
  suggestedNextMainline: "phase6b_or_phase5_decision_required" | null
  topRunIds: string[]
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

const resolveOutputPath = (evidencePath: string) =>
  process.env.ELYSIAN_SMOKE_PHASE_DECISION_REPORT_PATH ??
  join(dirname(evidencePath), "e2e-smoke-phase-transition-decision.md")

const parseEvidence = (raw: string) => {
  const parsed = JSON.parse(raw) as Partial<SmokeStabilityEvidenceReport>
  assert(
    typeof parsed.generatedAt === "string",
    "Invalid evidence: generatedAt is missing",
  )
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

const buildBlockers = (evidence: SmokeStabilityEvidenceReport) => {
  const blockers: string[] = []
  if (!evidence.hasMinimumRuns) {
    blockers.push(
      `样本不足：仅 ${evidence.selectedWindowRuns} 次，未达到窗口要求 ${evidence.windowSize} 次。`,
    )
  }
  if (evidence.systemicBlockerDetected) {
    blockers.push(
      `存在系统性阻断：连续失败门禁次数达到 ${evidence.maxConsecutiveFailedGates}。`,
    )
  }
  if (blockers.length === 0) {
    blockers.push("无阻断项。")
  }
  return blockers
}

const buildNextActions = (evidence: SmokeStabilityEvidenceReport) => {
  if (evidence.qualifiedForPhaseTransition) {
    return [
      "组织主线评审，确认进入 `Phase 6B` 或 `Phase 5`。",
      "将本报告链接写入 `docs/roadmap.md` 的 Round-2 Exit Checklist 结论记录。",
      "冻结当前 smoke gate 策略参数，避免阶段切换前漂移。",
    ]
  }

  return [
    "继续执行 `Phase 6A Round-2`，补齐稳定性窗口证据。",
    "逐条复盘失败运行并清理系统性阻断根因。",
    "在达到窗口标准后重新生成 evidence 与 decision report。",
  ]
}

export const renderDecisionMarkdown = (
  evidence: SmokeStabilityEvidenceReport,
) => {
  const blockers = buildBlockers(evidence)
  const nextActions = buildNextActions(evidence)
  const mainline = evidence.qualifiedForPhaseTransition
    ? "Phase 6B / Phase 5（待评审确认）"
    : "继续 Phase 6A Round-2"

  const lines = [
    "# Phase 6A Round-2 阶段切换决策记录",
    "",
    `生成时间：\`${new Date().toISOString()}\``,
    `证据时间：\`${evidence.generatedAt}\``,
    "",
    "窗口结论：",
    `- 是否达标：${evidence.qualifiedForPhaseTransition ? "是" : "否"}`,
    `- 主要证据：窗口 ${evidence.windowSize} 次，已采样 ${evidence.selectedWindowRuns} 次，失败门禁 ${evidence.failedGateCount} 次，连续失败上限 ${evidence.maxConsecutiveFailedGates} 次，重试恢复 ${evidence.recoveredByRetryCount} 次。`,
    "- 阻断项（如有）：",
    ...blockers.map((item) => `  - ${item}`),
    `- 建议主线：${mainline}`,
    "- 进入下一阶段前置动作：",
    ...nextActions.map((item) => `  - ${item}`),
    "",
    "运行样本：",
    `- runIds: ${evidence.topRunIds.join(", ") || "n/a"}`,
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const run = async () => {
  const evidencePath = resolveEvidencePath()
  const evidenceRaw = await readFile(evidencePath, "utf8")
  const evidence = parseEvidence(evidenceRaw)
  const outputPath = resolveOutputPath(evidencePath)
  const markdown = renderDecisionMarkdown(evidence)

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, markdown, "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(summaryPath, markdown, "utf8")
    console.log(`[e2e-smoke-phase-decision] summary: ${summaryPath}`)
  }

  console.log(`[e2e-smoke-phase-decision] report: ${outputPath}`)
  console.log(
    `[e2e-smoke-phase-decision] qualified=${String(evidence.qualifiedForPhaseTransition)} recommendation=${evidence.recommendation}`,
  )

  return {
    evidencePath,
    outputPath,
    qualifiedForPhaseTransition: evidence.qualifiedForPhaseTransition,
  }
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-smoke-phase-decision] failed: ${message}`)
    process.exitCode = 1
  }
}
