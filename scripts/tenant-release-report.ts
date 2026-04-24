import { spawnSync } from "node:child_process"
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

interface TenantStabilityEvidenceReport {
  generatedAt: string
  windowSize: number
  selectedWindowRuns: number
  hasMinimumRuns: boolean
  failedRunCount: number
  maxConsecutiveFailedRuns: number
  systemicBlockerDetected: boolean
  qualifiedForNextStep: boolean
  recommendation: "continue_observation" | "candidate_for_next_step"
  topRunIds: string[]
}

interface TenantReleaseCheckSummary {
  sourceBranch: string
  targetBranch: string
  releaseEnvironment: string
  gitWorktreeClean: boolean
  headMatchesObservationWindow: boolean
  docsSynced: boolean
  rollbackPrepared: boolean
  databaseRoleConfirmed: boolean
  backupReady: boolean
  checkPassed: boolean
  buildVuePassed: boolean
  tenantFullPassed: boolean
  defaultTenantLoginVerified: boolean
  superAdminTenantAccessVerified: boolean
  tenantAdminDeniedVerified: boolean
  nonDefaultTenantLoginVerified: boolean
  crossTenantIsolationVerified: boolean
}

export interface TenantReleaseReport {
  generatedAt: string
  evidencePath: string
  decisionPath: string
  outputPath: string
  metadata: {
    releaseCommit: string | null
    releasePr: string | null
    releaseEnvironment: string
    migrationList: string[]
    tenantInitCodes: string[]
    defaultSeedRequired: boolean
    gitStatusOutput: string
  }
  summary: TenantReleaseCheckSummary & {
    qualifiedForNextStep: boolean
    recommendation: TenantStabilityEvidenceReport["recommendation"]
  }
  status: "passed" | "failed"
  blockers: string[]
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

const readBooleanEnv = (key: string, fallback = false) => {
  const value = readNonEmptyEnv(key)
  if (value === null) {
    return fallback
  }
  if (value === "true") {
    return true
  }
  if (value === "false") {
    return false
  }
  throw new Error(`Invalid boolean env ${key}: ${value}`)
}

const readCsvEnv = (key: string) => {
  const value = readNonEmptyEnv(key)
  if (!value) {
    return []
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

const resolveSummaryPath = () => readNonEmptyEnv("GITHUB_STEP_SUMMARY")

const resolveEvidencePath = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH") ??
  join(
    process.cwd(),
    "artifacts",
    "tenant-stability-evidence",
    "e2e-tenant-stability-evidence.json",
  )

const resolveDecisionPath = (evidencePath: string) =>
  readNonEmptyEnv("ELYSIAN_TENANT_RELEASE_DECISION_PATH") ??
  join(dirname(evidencePath), "e2e-tenant-upgrade-decision.md")

const resolveOutputPath = () =>
  readNonEmptyEnv("ELYSIAN_TENANT_RELEASE_REPORT_PATH") ??
  join(
    process.cwd(),
    "artifacts",
    "tenant-release-rehearsal",
    "tenant-release-report.json",
  )

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
    typeof parsed.failedRunCount === "number" &&
      Number.isFinite(parsed.failedRunCount),
    "Invalid evidence: failedRunCount is missing",
  )
  assert(
    typeof parsed.maxConsecutiveFailedRuns === "number" &&
      Number.isFinite(parsed.maxConsecutiveFailedRuns),
    "Invalid evidence: maxConsecutiveFailedRuns is missing",
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
  assert(Array.isArray(parsed.topRunIds), "Invalid evidence: topRunIds missing")

  return parsed as TenantStabilityEvidenceReport
}

const readGitStatusOutput = () => {
  const overridden = process.env.ELYSIAN_TENANT_RELEASE_GIT_STATUS_OUTPUT
  if (typeof overridden === "string") {
    return overridden
  }

  const result = spawnSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  })

  if (result.status !== 0) {
    const message = result.stderr?.trim() || result.stdout?.trim() || "unknown"
    throw new Error(`git status --short failed: ${message}`)
  }

  return result.stdout.trim()
}

const buildSummary = (
  evidence: TenantStabilityEvidenceReport,
  gitStatusOutput: string,
): TenantReleaseReport["summary"] => ({
  sourceBranch:
    readNonEmptyEnv("ELYSIAN_TENANT_RELEASE_SOURCE_BRANCH") ?? "dev",
  targetBranch:
    readNonEmptyEnv("ELYSIAN_TENANT_RELEASE_TARGET_BRANCH") ?? "main",
  releaseEnvironment:
    readNonEmptyEnv("ELYSIAN_TENANT_RELEASE_ENVIRONMENT") ??
    "release-rehearsal",
  gitWorktreeClean: gitStatusOutput.length === 0,
  headMatchesObservationWindow: readBooleanEnv(
    "ELYSIAN_TENANT_RELEASE_HEAD_MATCHES_WINDOW",
  ),
  docsSynced: readBooleanEnv("ELYSIAN_TENANT_RELEASE_DOCS_SYNCED"),
  rollbackPrepared: readBooleanEnv("ELYSIAN_TENANT_RELEASE_ROLLBACK_PREPARED"),
  databaseRoleConfirmed: readBooleanEnv(
    "ELYSIAN_TENANT_RELEASE_DATABASE_ROLE_CONFIRMED",
  ),
  backupReady: readBooleanEnv("ELYSIAN_TENANT_RELEASE_BACKUP_READY"),
  checkPassed: readBooleanEnv("ELYSIAN_TENANT_RELEASE_CHECK_PASSED"),
  buildVuePassed: readBooleanEnv("ELYSIAN_TENANT_RELEASE_BUILD_VUE_PASSED"),
  tenantFullPassed: readBooleanEnv("ELYSIAN_TENANT_RELEASE_TENANT_FULL_PASSED"),
  defaultTenantLoginVerified: readBooleanEnv(
    "ELYSIAN_TENANT_RELEASE_DEFAULT_TENANT_LOGIN_VERIFIED",
  ),
  superAdminTenantAccessVerified: readBooleanEnv(
    "ELYSIAN_TENANT_RELEASE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED",
  ),
  tenantAdminDeniedVerified: readBooleanEnv(
    "ELYSIAN_TENANT_RELEASE_TENANT_ADMIN_DENIED_VERIFIED",
  ),
  nonDefaultTenantLoginVerified: readBooleanEnv(
    "ELYSIAN_TENANT_RELEASE_NON_DEFAULT_TENANT_LOGIN_VERIFIED",
  ),
  crossTenantIsolationVerified: readBooleanEnv(
    "ELYSIAN_TENANT_RELEASE_CROSS_TENANT_ISOLATION_VERIFIED",
  ),
  qualifiedForNextStep: evidence.qualifiedForNextStep,
  recommendation: evidence.recommendation,
})

const pushBlocker = (
  condition: boolean,
  blockers: string[],
  message: string,
) => {
  if (!condition) {
    blockers.push(message)
  }
}

const buildBlockers = (
  evidence: TenantStabilityEvidenceReport,
  summary: TenantReleaseReport["summary"],
) => {
  const blockers: string[] = []

  pushBlocker(
    evidence.qualifiedForNextStep,
    blockers,
    "tenant 稳定性结论尚未达到 candidate_for_next_step。",
  )
  pushBlocker(
    summary.sourceBranch === "dev" && summary.targetBranch === "main",
    blockers,
    `发布流转不符合当前仓库基线：source=${summary.sourceBranch}, target=${summary.targetBranch}。`,
  )
  pushBlocker(
    summary.gitWorktreeClean,
    blockers,
    "工作区不干净，存在未收口改动。",
  )
  pushBlocker(
    summary.headMatchesObservationWindow,
    blockers,
    "待发布 head 与观察窗口 head 未确认一致。",
  )
  pushBlocker(
    summary.docsSynced,
    blockers,
    "roadmap / PROJECT_PROFILE / plans 未确认同步。",
  )
  pushBlocker(
    summary.rollbackPrepared,
    blockers,
    "回滚路径与冻结阈值未确认可执行。",
  )
  pushBlocker(
    summary.databaseRoleConfirmed,
    blockers,
    "目标环境数据库角色未确认满足 NOSUPERUSER + NOBYPASSRLS。",
  )
  pushBlocker(
    summary.backupReady,
    blockers,
    "数据库快照或等价回退手段未确认就绪。",
  )
  pushBlocker(summary.checkPassed, blockers, "`bun run check` 未确认通过。")
  pushBlocker(
    summary.buildVuePassed,
    blockers,
    "`bun run build:vue` 未确认通过。",
  )
  pushBlocker(
    summary.tenantFullPassed,
    blockers,
    "`bun run e2e:tenant:full` 未确认通过。",
  )
  pushBlocker(
    summary.defaultTenantLoginVerified,
    blockers,
    "默认租户登录未完成发布后验证。",
  )
  pushBlocker(
    summary.superAdminTenantAccessVerified,
    blockers,
    "super-admin `/system/tenants` 验证未完成。",
  )
  pushBlocker(
    summary.tenantAdminDeniedVerified,
    blockers,
    "tenant admin 禁止管理 `/system/tenants` 验证未完成。",
  )
  pushBlocker(
    summary.nonDefaultTenantLoginVerified,
    blockers,
    "非默认租户 tenant admin 登录验证未完成。",
  )
  pushBlocker(
    summary.crossTenantIsolationVerified,
    blockers,
    "跨租户实体隔离验证未完成。",
  )

  return blockers
}

const buildRecommendedActions = (blockers: string[]) => {
  const actions: string[] = []

  if (
    blockers.some(
      (item) =>
        item.includes("candidate_for_next_step") || item.includes("观察窗口"),
    )
  ) {
    actions.push(
      "先重建最新 head 的 tenant 观察窗口，并重新生成 evidence / decision。",
    )
  }
  if (blockers.some((item) => item.includes("工作区不干净"))) {
    actions.push("先清理工作区噪音或拆分无关改动，再继续发布演练。")
  }
  if (blockers.some((item) => item.includes("同步"))) {
    actions.push("先同步 roadmap、PROJECT_PROFILE 与相关 plans。")
  }
  if (
    blockers.some((item) => item.includes("NOSUPERUSER")) ||
    blockers.some((item) => item.includes("快照")) ||
    blockers.some((item) => item.includes("回滚"))
  ) {
    actions.push("先确认数据库角色、备份快照与回滚步骤，再进入迁移执行。")
  }
  if (
    blockers.some((item) => item.includes("bun run check")) ||
    blockers.some((item) => item.includes("build:vue")) ||
    blockers.some((item) => item.includes("e2e:tenant:full"))
  ) {
    actions.push("先补齐发布前验证命令，再重新生成 release report。")
  }
  if (
    blockers.some((item) => item.includes("登录")) ||
    blockers.some((item) => item.includes("`/system/tenants`")) ||
    blockers.some((item) => item.includes("隔离"))
  ) {
    actions.push(
      "按 migration/release runbook 完成发布后最小验证，再执行 release gate。",
    )
  }
  if (actions.length === 0) {
    actions.push("发布演练条件已满足，可归档本次 release rehearsal 结论。")
  }

  return actions
}

export const renderReleaseSummaryMarkdown = (report: TenantReleaseReport) => {
  const lines = [
    "### Tenant Release Rehearsal",
    "",
    `- status: \`${report.status}\``,
    `- source -> target: \`${report.summary.sourceBranch} -> ${report.summary.targetBranch}\``,
    `- environment: \`${report.summary.releaseEnvironment}\``,
    `- qualifiedForNextStep: \`${String(report.summary.qualifiedForNextStep)}\``,
    `- recommendation: \`${report.summary.recommendation}\``,
    `- gitWorktreeClean: \`${String(report.summary.gitWorktreeClean)}\``,
    `- blockers: \`${String(report.blockers.length)}\``,
    "",
    "关键检查：",
    `- headMatchesObservationWindow: \`${String(report.summary.headMatchesObservationWindow)}\``,
    `- docsSynced: \`${String(report.summary.docsSynced)}\``,
    `- rollbackPrepared: \`${String(report.summary.rollbackPrepared)}\``,
    `- databaseRoleConfirmed: \`${String(report.summary.databaseRoleConfirmed)}\``,
    `- backupReady: \`${String(report.summary.backupReady)}\``,
    `- checkPassed: \`${String(report.summary.checkPassed)}\``,
    `- buildVuePassed: \`${String(report.summary.buildVuePassed)}\``,
    `- tenantFullPassed: \`${String(report.summary.tenantFullPassed)}\``,
    `- defaultTenantLoginVerified: \`${String(report.summary.defaultTenantLoginVerified)}\``,
    `- superAdminTenantAccessVerified: \`${String(report.summary.superAdminTenantAccessVerified)}\``,
    `- tenantAdminDeniedVerified: \`${String(report.summary.tenantAdminDeniedVerified)}\``,
    `- nonDefaultTenantLoginVerified: \`${String(report.summary.nonDefaultTenantLoginVerified)}\``,
    `- crossTenantIsolationVerified: \`${String(report.summary.crossTenantIsolationVerified)}\``,
    "",
    "Blockers:",
    ...(report.blockers.length > 0
      ? report.blockers.map((item) => `- ${item}`)
      : ["- none"]),
    "",
    "Recommended actions:",
    ...report.recommendedActions.map((item) => `- ${item}`),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const run = async () => {
  const evidencePath = resolveEvidencePath()
  const decisionPath = resolveDecisionPath(evidencePath)
  const outputPath = resolveOutputPath()
  const evidence = parseEvidence(await readFile(evidencePath, "utf8"))
  await readFile(decisionPath, "utf8")

  const gitStatusOutput = readGitStatusOutput()
  const summary = buildSummary(evidence, gitStatusOutput)
  const blockers = buildBlockers(evidence, summary)
  const report: TenantReleaseReport = {
    generatedAt: new Date().toISOString(),
    evidencePath,
    decisionPath,
    outputPath,
    metadata: {
      releaseCommit: readNonEmptyEnv("ELYSIAN_TENANT_RELEASE_COMMIT"),
      releasePr: readNonEmptyEnv("ELYSIAN_TENANT_RELEASE_PR"),
      releaseEnvironment: summary.releaseEnvironment,
      migrationList: readCsvEnv("ELYSIAN_TENANT_RELEASE_MIGRATIONS"),
      tenantInitCodes: readCsvEnv("ELYSIAN_TENANT_RELEASE_TENANT_INIT_CODES"),
      defaultSeedRequired: readBooleanEnv(
        "ELYSIAN_TENANT_RELEASE_DEFAULT_SEED_REQUIRED",
      ),
      gitStatusOutput,
    },
    summary,
    status: blockers.length === 0 ? "passed" : "failed",
    blockers,
    recommendedActions: buildRecommendedActions(blockers),
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(report, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(summaryPath, renderReleaseSummaryMarkdown(report), "utf8")
    console.log(`[tenant-release-report] summary: ${summaryPath}`)
  }

  console.log(`[tenant-release-report] report: ${outputPath}`)
  console.log(
    `[tenant-release-report] status=${report.status} blockers=${String(report.blockers.length)} recommendation=${report.summary.recommendation}`,
  )

  if (report.status === "failed") {
    for (const blocker of report.blockers) {
      console.error(`[tenant-release-report] blocker: ${blocker}`)
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
    console.error(`[tenant-release-report] failed: ${message}`)
    process.exitCode = 1
  }
}
