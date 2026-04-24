import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

interface TenantStabilityEvidenceReport {
  generatedAt: string
  inputDir: string
  outputDir: string
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

const resolveOutputPath = (evidencePath: string) =>
  readNonEmptyEnv("ELYSIAN_TENANT_UPGRADE_DECISION_REPORT_PATH") ??
  join(dirname(evidencePath), "e2e-tenant-upgrade-decision.md")

const parseEvidence = (raw: string) => {
  const parsed = JSON.parse(raw) as Partial<TenantStabilityEvidenceReport>

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

const buildBlockers = (evidence: TenantStabilityEvidenceReport) => {
  const blockers: string[] = []

  if (!evidence.hasMinimumRuns) {
    blockers.push(
      `样本不足：仅 ${evidence.selectedWindowRuns} 次，未达到窗口要求 ${evidence.windowSize} 次。`,
    )
  }
  if (evidence.systemicBlockerDetected) {
    blockers.push(
      `存在系统性阻断：连续失败次数达到 ${evidence.maxConsecutiveFailedRuns}。`,
    )
  }
  if (blockers.length === 0) {
    blockers.push("无阻断项。")
  }

  return blockers
}

const buildNextActions = (evidence: TenantStabilityEvidenceReport) => {
  if (evidence.qualifiedForNextStep) {
    return [
      "进入下一步多租户升级执行评审，确认 runbook、回滚路径与放大样本策略。",
      "冻结当前 tenant e2e 与稳定性观察阈值，避免升级执行前策略漂移。",
      "把本次决策结论同步到 roadmap 与阶段计划，作为下一阶段输入。",
    ]
  }

  return [
    "继续积累 tenant 稳定性观察窗口样本。",
    "逐条复盘失败运行，优先处理系统性阻断与环境/依赖类抖动。",
    "在达到窗口标准后重新生成 evidence 与 upgrade decision。",
  ]
}

export const renderDecisionMarkdown = (
  evidence: TenantStabilityEvidenceReport,
) => {
  const blockers = buildBlockers(evidence)
  const nextActions = buildNextActions(evidence)
  const executionStatus = evidence.qualifiedForNextStep
    ? "可进入下一步升级执行"
    : "继续稳定性观察"

  const lines = [
    "# Tenant Isolation 升级执行决策记录",
    "",
    `生成时间：\`${new Date().toISOString()}\``,
    `证据时间：\`${evidence.generatedAt}\``,
    "",
    "窗口结论：",
    `- 是否达标：${evidence.qualifiedForNextStep ? "是" : "否"}`,
    `- 主要证据：窗口 ${evidence.windowSize} 次，已采样 ${evidence.selectedWindowRuns} 次，失败运行 ${evidence.failedRunCount} 次，连续失败上限 ${evidence.maxConsecutiveFailedRuns} 次，dependency 失败 ${evidence.dependencyFailureCount} 次，environment 失败 ${evidence.environmentFailureCount} 次。`,
    "- 阻断项（如有）：",
    ...blockers.map((item) => `  - ${item}`),
    `- 执行建议：${executionStatus}`,
    "- 下一步动作：",
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
    console.log(`[e2e-tenant-upgrade-decision] summary: ${summaryPath}`)
  }

  console.log(`[e2e-tenant-upgrade-decision] report: ${outputPath}`)
  console.log(
    `[e2e-tenant-upgrade-decision] qualified=${String(evidence.qualifiedForNextStep)} recommendation=${evidence.recommendation}`,
  )

  return {
    evidencePath,
    outputPath,
    qualifiedForNextStep: evidence.qualifiedForNextStep,
  }
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-tenant-upgrade-decision] failed: ${message}`)
    process.exitCode = 1
  }
}
