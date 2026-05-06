import { appendFile, mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

interface GoLiveCheckSummary {
  sourceBranch: string
  targetBranch: string
  releaseCommit: string | null
  releaseTag: string | null
  releasePr: string | null
  releaseEnvironment: string | null
  migrationList: string[]
  tenantImpact: boolean
  checkPassed: boolean
  buildVuePassed: boolean
  serverImageVerifyPassed: boolean
  tenantFullPassed: boolean
  backupReady: boolean
  releaseRolesReady: boolean
  proxyTlsOwnerReady: boolean
  healthVerified: boolean
  metricsVerified: boolean
  adminLoginVerified: boolean
  menuPermissionGateVerified: boolean
  coreWorkspaceListVerified: boolean
  coreWriteActionVerified: boolean
  superAdminTenantAccessVerified: boolean
  tenantAdminDeniedVerified: boolean
  nonDefaultTenantLoginVerified: boolean
  crossTenantIsolationVerified: boolean
}

export interface GoLiveReport {
  generatedAt: string
  outputPath: string
  metadata: {
    releaseCommit: string | null
    releaseTag: string | null
    releasePr: string | null
    releaseEnvironment: string | null
    migrationList: string[]
    tenantImpact: boolean
  }
  summary: GoLiveCheckSummary
  status: "passed" | "failed"
  blockers: string[]
  recommendedActions: string[]
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
  if (value === null) {
    return []
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

const resolveSummaryPath = () => readNonEmptyEnv("GITHUB_STEP_SUMMARY")

const resolveOutputPath = () =>
  readNonEmptyEnv("ELYSIAN_GO_LIVE_REPORT_PATH") ??
  join(process.cwd(), "artifacts", "go-live", "go-live-report.json")

const buildSummary = (): GoLiveCheckSummary => ({
  sourceBranch: readNonEmptyEnv("ELYSIAN_GO_LIVE_SOURCE_BRANCH") ?? "dev",
  targetBranch: readNonEmptyEnv("ELYSIAN_GO_LIVE_TARGET_BRANCH") ?? "main",
  releaseCommit: readNonEmptyEnv("ELYSIAN_GO_LIVE_RELEASE_COMMIT"),
  releaseTag: readNonEmptyEnv("ELYSIAN_GO_LIVE_RELEASE_TAG"),
  releasePr: readNonEmptyEnv("ELYSIAN_GO_LIVE_RELEASE_PR"),
  releaseEnvironment: readNonEmptyEnv("ELYSIAN_GO_LIVE_ENVIRONMENT"),
  migrationList: readCsvEnv("ELYSIAN_GO_LIVE_MIGRATIONS"),
  tenantImpact: readBooleanEnv("ELYSIAN_GO_LIVE_TENANT_IMPACT"),
  checkPassed: readBooleanEnv("ELYSIAN_GO_LIVE_CHECK_PASSED"),
  buildVuePassed: readBooleanEnv("ELYSIAN_GO_LIVE_BUILD_VUE_PASSED"),
  serverImageVerifyPassed: readBooleanEnv(
    "ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED",
  ),
  tenantFullPassed: readBooleanEnv("ELYSIAN_GO_LIVE_TENANT_FULL_PASSED"),
  backupReady: readBooleanEnv("ELYSIAN_GO_LIVE_BACKUP_READY"),
  releaseRolesReady: readBooleanEnv("ELYSIAN_GO_LIVE_RELEASE_ROLES_READY"),
  proxyTlsOwnerReady: readBooleanEnv("ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY"),
  healthVerified: readBooleanEnv("ELYSIAN_GO_LIVE_HEALTH_VERIFIED"),
  metricsVerified: readBooleanEnv("ELYSIAN_GO_LIVE_METRICS_VERIFIED"),
  adminLoginVerified: readBooleanEnv("ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED"),
  menuPermissionGateVerified: readBooleanEnv(
    "ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED",
  ),
  coreWorkspaceListVerified: readBooleanEnv(
    "ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED",
  ),
  coreWriteActionVerified: readBooleanEnv(
    "ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED",
  ),
  superAdminTenantAccessVerified: readBooleanEnv(
    "ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED",
  ),
  tenantAdminDeniedVerified: readBooleanEnv(
    "ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED",
  ),
  nonDefaultTenantLoginVerified: readBooleanEnv(
    "ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED",
  ),
  crossTenantIsolationVerified: readBooleanEnv(
    "ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED",
  ),
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

export const buildBlockers = (summary: GoLiveCheckSummary) => {
  const blockers: string[] = []

  pushBlocker(
    summary.sourceBranch === "dev" && summary.targetBranch === "main",
    blockers,
    `发布流转不符合当前仓库基线：source=${summary.sourceBranch}, target=${summary.targetBranch}。`,
  )
  pushBlocker(
    summary.releaseCommit !== null,
    blockers,
    "release commit 未锁定。",
  )
  pushBlocker(
    summary.releaseTag !== null || summary.releasePr !== null,
    blockers,
    "release tag / release PR 未锁定。",
  )
  pushBlocker(
    summary.releaseEnvironment !== null,
    blockers,
    "release environment 未锁定。",
  )
  pushBlocker(
    summary.migrationList.length > 0,
    blockers,
    "migration list 未锁定。",
  )
  pushBlocker(summary.checkPassed, blockers, "`bun run check` 未确认通过。")
  pushBlocker(
    summary.buildVuePassed,
    blockers,
    "`bun run build:vue` 未确认通过。",
  )
  pushBlocker(
    summary.serverImageVerifyPassed,
    blockers,
    "`bun run server:image:verify` 未确认通过。",
  )
  pushBlocker(
    summary.backupReady,
    blockers,
    "database backup / restore evidence 缺失。",
  )
  pushBlocker(
    summary.releaseRolesReady,
    blockers,
    "release roles / oncall evidence 缺失。",
  )
  pushBlocker(
    summary.proxyTlsOwnerReady,
    blockers,
    "proxy / tls owner 未明确。",
  )
  pushBlocker(summary.healthVerified, blockers, "发布后 `/health` 未验证。")
  pushBlocker(summary.metricsVerified, blockers, "发布后 `/metrics` 未验证。")
  pushBlocker(summary.adminLoginVerified, blockers, "发布后管理员登录未验证。")
  pushBlocker(
    summary.menuPermissionGateVerified,
    blockers,
    "发布后菜单与权限 gate 未验证。",
  )
  pushBlocker(
    summary.coreWorkspaceListVerified,
    blockers,
    "发布后核心工作区列表未验证。",
  )
  pushBlocker(
    summary.coreWriteActionVerified,
    blockers,
    "发布后核心写操作未验证。",
  )

  if (summary.tenantImpact) {
    pushBlocker(
      summary.tenantFullPassed,
      blockers,
      "`bun run e2e:tenant:full` 未确认通过。",
    )
    pushBlocker(
      summary.superAdminTenantAccessVerified,
      blockers,
      "super-admin `/system/tenants` 未验证。",
    )
    pushBlocker(
      summary.tenantAdminDeniedVerified,
      blockers,
      "tenant admin 禁止访问 `/system/tenants` 未验证。",
    )
    pushBlocker(
      summary.nonDefaultTenantLoginVerified,
      blockers,
      "非默认 tenant 登录未验证。",
    )
    pushBlocker(
      summary.crossTenantIsolationVerified,
      blockers,
      "跨租户隔离未验证。",
    )
  }

  return blockers
}

export const buildRecommendedActions = (
  blockers: string[],
  summary: GoLiveCheckSummary,
) => {
  if (blockers.length === 0) {
    return ["No action required."]
  }

  const actions = new Set<string>()

  if (summary.releaseEnvironment === null) {
    actions.add("先锁定目标发布环境，并把环境标识写入 go-live 准备包。")
  }

  if (summary.releaseTag === null && summary.releasePr === null) {
    actions.add("补齐 release tag 或 release PR，避免上线对象漂移。")
  }

  if (summary.migrationList.length === 0) {
    actions.add("锁定 migration list，并由 DBA / 环境 owner 明确执行顺序。")
  }

  if (!summary.backupReady) {
    actions.add(
      "由环境 / DBA owner 填写数据库备份与恢复模板，并补齐恢复点证据。",
    )
  }

  if (!summary.releaseRolesReady) {
    actions.add("由发布负责人填写角色与值守模板。")
  }

  if (!summary.proxyTlsOwnerReady) {
    actions.add("明确 proxy / TLS owner 与对应升级路径。")
  }

  if (
    !summary.healthVerified ||
    !summary.metricsVerified ||
    !summary.adminLoginVerified ||
    !summary.coreWorkspaceListVerified ||
    !summary.coreWriteActionVerified
  ) {
    actions.add("在目标环境完成发布后最小冒烟，并把结果回填到 go-live 准备包。")
  }

  if (summary.tenantImpact) {
    if (!summary.tenantFullPassed) {
      actions.add("若本次触及 tenant 主链路，先补 `bun run e2e:tenant:full`。")
    }

    if (
      !summary.superAdminTenantAccessVerified ||
      !summary.tenantAdminDeniedVerified ||
      !summary.nonDefaultTenantLoginVerified ||
      !summary.crossTenantIsolationVerified
    ) {
      actions.add("补齐 tenant 相关发布后验证，避免租户边界回归。")
    }
  }

  if (!summary.serverImageVerifyPassed) {
    actions.add("先执行 `bun run server:image:verify`，再推进目标环境发布。")
  }

  return Array.from(actions)
}

export const renderSummaryMarkdown = (report: GoLiveReport) => {
  const lines = [
    "### Go-live Report",
    "",
    `- status: \`${report.status}\``,
    `- source -> target: \`${report.summary.sourceBranch} -> ${report.summary.targetBranch}\``,
    `- releaseEnvironment: \`${report.summary.releaseEnvironment ?? "unset"}\``,
    `- releaseCommit: \`${report.summary.releaseCommit ?? "unset"}\``,
    `- releaseTag: \`${report.summary.releaseTag ?? "unset"}\``,
    `- releasePr: \`${report.summary.releasePr ?? "unset"}\``,
    `- tenantImpact: \`${String(report.summary.tenantImpact)}\``,
    `- blockerCount: \`${String(report.blockers.length)}\``,
    "",
    "Blockers:",
    ...report.blockers.map((item) => `- ${item}`),
    "",
    "Recommended actions:",
    ...report.recommendedActions.map((item) => `- ${item}`),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const run = async () => {
  const summary = buildSummary()
  const blockers = buildBlockers(summary)
  const recommendedActions = buildRecommendedActions(blockers, summary)
  const outputPath = resolveOutputPath()

  const report: GoLiveReport = {
    generatedAt: new Date().toISOString(),
    outputPath,
    metadata: {
      releaseCommit: summary.releaseCommit,
      releaseTag: summary.releaseTag,
      releasePr: summary.releasePr,
      releaseEnvironment: summary.releaseEnvironment,
      migrationList: summary.migrationList,
      tenantImpact: summary.tenantImpact,
    },
    summary,
    status: blockers.length === 0 ? "passed" : "failed",
    blockers,
    recommendedActions,
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(report, null, 2), "utf8")

  const summaryPath = resolveSummaryPath()
  if (summaryPath) {
    await appendFile(summaryPath, renderSummaryMarkdown(report), "utf8")
    console.log(`[go-live-report] summary: ${summaryPath}`)
  }

  console.log(`[go-live-report] report: ${outputPath}`)
  console.log(
    `[go-live-report] status=${report.status} blockerCount=${String(report.blockers.length)}`,
  )

  if (report.status === "failed") {
    for (const action of report.recommendedActions) {
      console.error(`[go-live-report] suggested-action: ${action}`)
    }
  }

  return report
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[go-live-report] failed: ${message}`)
    process.exitCode = 1
  }
}
