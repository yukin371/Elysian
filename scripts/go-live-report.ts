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
  smokeFullPassed: boolean
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

export type GoLiveMilestoneId = "M1" | "M2" | "M3" | "M4"

type GoLiveBlockerCategory =
  | "release-input"
  | "application-verification"
  | "environment-prerequisite"
  | "post-release-smoke"
  | "tenant-safety"

interface GoLiveBlockerDetail {
  code: string
  message: string
  category: GoLiveBlockerCategory
  defaultOwner: string
  milestoneId: Exclude<GoLiveMilestoneId, "M4">
  envKeys: string[]
}

interface GoLiveMilestone {
  id: GoLiveMilestoneId
  title: string
  status: "passed" | "blocked"
  blockerCount: number
  blockers: string[]
}

interface GoLiveOwnerHandoff {
  owner: string
  blockerCount: number
  blockers: string[]
  envKeys: string[]
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
  blockerDetails: GoLiveBlockerDetail[]
  recommendedActions: string[]
  milestones: GoLiveMilestone[]
  nextMilestone: GoLiveMilestoneId | null
  ownerHandoffs: GoLiveOwnerHandoff[]
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
  smokeFullPassed: readBooleanEnv("ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED"),
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
  blockers: GoLiveBlockerDetail[],
  detail: GoLiveBlockerDetail,
) => {
  if (!condition) {
    blockers.push(detail)
  }
}

export const buildBlockerDetails = (summary: GoLiveCheckSummary) => {
  const blockers: GoLiveBlockerDetail[] = []

  pushBlocker(
    summary.sourceBranch === "dev" && summary.targetBranch === "main",
    blockers,
    {
      code: "release-branch-flow",
      message: `发布流转不符合当前仓库基线：source=${summary.sourceBranch}, target=${summary.targetBranch}。`,
      category: "release-input",
      defaultOwner: "发布负责人",
      milestoneId: "M1",
      envKeys: [
        "ELYSIAN_GO_LIVE_SOURCE_BRANCH",
        "ELYSIAN_GO_LIVE_TARGET_BRANCH",
      ],
    },
  )
  pushBlocker(summary.releaseCommit !== null, blockers, {
    code: "release-commit-missing",
    message: "release commit 未锁定。",
    category: "release-input",
    defaultOwner: "发布负责人",
    milestoneId: "M1",
    envKeys: ["ELYSIAN_GO_LIVE_RELEASE_COMMIT"],
  })
  pushBlocker(
    summary.releaseTag !== null || summary.releasePr !== null,
    blockers,
    {
      code: "release-tag-or-pr-missing",
      message: "release tag / release PR 未锁定。",
      category: "release-input",
      defaultOwner: "发布负责人",
      milestoneId: "M1",
      envKeys: ["ELYSIAN_GO_LIVE_RELEASE_TAG", "ELYSIAN_GO_LIVE_RELEASE_PR"],
    },
  )
  pushBlocker(summary.checkPassed, blockers, {
    code: "check-not-passed",
    message: "`bun run check` 未确认通过。",
    category: "application-verification",
    defaultOwner: "应用 owner",
    milestoneId: "M1",
    envKeys: ["ELYSIAN_GO_LIVE_CHECK_PASSED"],
  })
  pushBlocker(summary.buildVuePassed, blockers, {
    code: "build-vue-not-passed",
    message: "`bun run build:vue` 未确认通过。",
    category: "application-verification",
    defaultOwner: "应用 owner",
    milestoneId: "M1",
    envKeys: ["ELYSIAN_GO_LIVE_BUILD_VUE_PASSED"],
  })
  pushBlocker(summary.smokeFullPassed, blockers, {
    code: "smoke-full-not-passed",
    message: "`bun run e2e:smoke:full` 未确认通过。",
    category: "application-verification",
    defaultOwner: "应用 owner",
    milestoneId: "M1",
    envKeys: ["ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED"],
  })
  pushBlocker(summary.serverImageVerifyPassed, blockers, {
    code: "server-image-verify-not-passed",
    message: "`bun run server:image:verify` 未确认通过。",
    category: "application-verification",
    defaultOwner: "应用 owner",
    milestoneId: "M1",
    envKeys: ["ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED"],
  })
  pushBlocker(summary.releaseEnvironment !== null, blockers, {
    code: "release-environment-missing",
    message: "release environment 未锁定。",
    category: "release-input",
    defaultOwner: "发布负责人",
    milestoneId: "M2",
    envKeys: ["ELYSIAN_GO_LIVE_ENVIRONMENT"],
  })
  pushBlocker(summary.migrationList.length > 0, blockers, {
    code: "migration-list-missing",
    message: "migration list 未锁定。",
    category: "release-input",
    defaultOwner: "发布负责人 / DBA / 环境 owner",
    milestoneId: "M2",
    envKeys: ["ELYSIAN_GO_LIVE_MIGRATIONS"],
  })
  pushBlocker(summary.backupReady, blockers, {
    code: "backup-evidence-missing",
    message: "database backup / restore evidence 缺失。",
    category: "environment-prerequisite",
    defaultOwner: "DBA / 环境 owner",
    milestoneId: "M2",
    envKeys: ["ELYSIAN_GO_LIVE_BACKUP_READY"],
  })
  pushBlocker(summary.releaseRolesReady, blockers, {
    code: "release-roles-missing",
    message: "release roles / oncall evidence 缺失。",
    category: "environment-prerequisite",
    defaultOwner: "发布负责人",
    milestoneId: "M2",
    envKeys: ["ELYSIAN_GO_LIVE_RELEASE_ROLES_READY"],
  })
  pushBlocker(summary.proxyTlsOwnerReady, blockers, {
    code: "proxy-tls-owner-missing",
    message: "proxy / tls owner 未明确。",
    category: "environment-prerequisite",
    defaultOwner: "环境 owner",
    milestoneId: "M2",
    envKeys: ["ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY"],
  })
  pushBlocker(summary.healthVerified, blockers, {
    code: "health-not-verified",
    message: "发布后 `/health` 未验证。",
    category: "post-release-smoke",
    defaultOwner: "应用 owner / 环境 owner",
    milestoneId: "M3",
    envKeys: ["ELYSIAN_GO_LIVE_HEALTH_VERIFIED"],
  })
  pushBlocker(summary.metricsVerified, blockers, {
    code: "metrics-not-verified",
    message: "发布后 `/metrics` 未验证。",
    category: "post-release-smoke",
    defaultOwner: "应用 owner / 环境 owner",
    milestoneId: "M3",
    envKeys: ["ELYSIAN_GO_LIVE_METRICS_VERIFIED"],
  })
  pushBlocker(summary.adminLoginVerified, blockers, {
    code: "admin-login-not-verified",
    message: "发布后管理员登录未验证。",
    category: "post-release-smoke",
    defaultOwner: "应用 owner",
    milestoneId: "M3",
    envKeys: ["ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED"],
  })
  pushBlocker(summary.menuPermissionGateVerified, blockers, {
    code: "menu-permission-gate-not-verified",
    message: "发布后菜单与权限 gate 未验证。",
    category: "post-release-smoke",
    defaultOwner: "应用 owner",
    milestoneId: "M3",
    envKeys: ["ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED"],
  })
  pushBlocker(summary.coreWorkspaceListVerified, blockers, {
    code: "core-workspace-list-not-verified",
    message: "发布后核心工作区列表未验证。",
    category: "post-release-smoke",
    defaultOwner: "应用 owner",
    milestoneId: "M3",
    envKeys: ["ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED"],
  })
  pushBlocker(summary.coreWriteActionVerified, blockers, {
    code: "core-write-action-not-verified",
    message: "发布后核心写操作未验证。",
    category: "post-release-smoke",
    defaultOwner: "应用 owner",
    milestoneId: "M3",
    envKeys: ["ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED"],
  })

  if (summary.tenantImpact) {
    pushBlocker(summary.tenantFullPassed, blockers, {
      code: "tenant-full-not-passed",
      message: "`bun run e2e:tenant:full` 未确认通过。",
      category: "application-verification",
      defaultOwner: "应用 owner",
      milestoneId: "M1",
      envKeys: ["ELYSIAN_GO_LIVE_TENANT_FULL_PASSED"],
    })
    pushBlocker(summary.superAdminTenantAccessVerified, blockers, {
      code: "super-admin-tenant-access-not-verified",
      message: "super-admin `/system/tenants` 未验证。",
      category: "tenant-safety",
      defaultOwner: "应用 owner",
      milestoneId: "M3",
      envKeys: ["ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED"],
    })
    pushBlocker(summary.tenantAdminDeniedVerified, blockers, {
      code: "tenant-admin-denied-not-verified",
      message: "tenant admin 禁止访问 `/system/tenants` 未验证。",
      category: "tenant-safety",
      defaultOwner: "应用 owner",
      milestoneId: "M3",
      envKeys: ["ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED"],
    })
    pushBlocker(summary.nonDefaultTenantLoginVerified, blockers, {
      code: "non-default-tenant-login-not-verified",
      message: "非默认 tenant 登录未验证。",
      category: "tenant-safety",
      defaultOwner: "应用 owner",
      milestoneId: "M3",
      envKeys: ["ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED"],
    })
    pushBlocker(summary.crossTenantIsolationVerified, blockers, {
      code: "cross-tenant-isolation-not-verified",
      message: "跨租户隔离未验证。",
      category: "tenant-safety",
      defaultOwner: "应用 owner / DBA / 环境 owner",
      milestoneId: "M3",
      envKeys: ["ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED"],
    })
  }

  return blockers
}

export const buildBlockers = (summary: GoLiveCheckSummary) =>
  buildBlockerDetails(summary).map((item) => item.message)

export const buildOwnerHandoffs = (blockerDetails: GoLiveBlockerDetail[]) => {
  const handoffMap = new Map<string, GoLiveOwnerHandoff>()

  for (const detail of blockerDetails) {
    const current = handoffMap.get(detail.defaultOwner) ?? {
      owner: detail.defaultOwner,
      blockerCount: 0,
      blockers: [],
      envKeys: [],
    }

    current.blockerCount += 1
    current.blockers.push(detail.message)

    for (const envKey of detail.envKeys) {
      if (!current.envKeys.includes(envKey)) {
        current.envKeys.push(envKey)
      }
    }

    handoffMap.set(detail.defaultOwner, current)
  }

  return Array.from(handoffMap.values()).sort(
    (left, right) => right.blockerCount - left.blockerCount,
  )
}

export const buildMilestones = (blockerDetails: GoLiveBlockerDetail[]) => {
  const orderedMilestones: Array<{
    id: GoLiveMilestoneId
    title: string
  }> = [
    { id: "M1", title: "候选冻结" },
    { id: "M2", title: "环境前提锁定" },
    { id: "M3", title: "目标环境演练" },
    { id: "M4", title: "首发放行结论" },
  ]

  const milestones = orderedMilestones.map<GoLiveMilestone>((milestone) => {
    if (milestone.id === "M4") {
      const hasBlockedPrerequisite = blockerDetails.length > 0
      return {
        id: milestone.id,
        title: milestone.title,
        status: hasBlockedPrerequisite ? "blocked" : "passed",
        blockerCount: hasBlockedPrerequisite ? 1 : 0,
        blockers: hasBlockedPrerequisite
          ? ["前序里程碑未全部通过，当前不可给出首发放行结论。"]
          : [],
      }
    }

    const blockers = blockerDetails
      .filter((item) => item.milestoneId === milestone.id)
      .map((item) => item.message)

    return {
      id: milestone.id,
      title: milestone.title,
      status: blockers.length === 0 ? "passed" : "blocked",
      blockerCount: blockers.length,
      blockers,
    }
  })

  const nextMilestone =
    milestones.find(
      (milestone) => milestone.id !== "M4" && milestone.status === "blocked",
    )?.id ?? null

  return {
    milestones,
    nextMilestone,
  }
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

  if (summary.releaseCommit === null) {
    actions.add("先锁定 release commit，避免候选工作区与最终发布对象漂移。")
  }

  if (summary.migrationList.length === 0) {
    actions.add("锁定 migration list，并由 DBA / 环境 owner 明确执行顺序。")
  }

  if (!summary.checkPassed || !summary.buildVuePassed) {
    actions.add("先补齐仓库基线验证，再继续推进 release 候选冻结。")
  }

  if (!summary.smokeFullPassed) {
    actions.add("先执行 `bun run e2e:smoke:full`，再推进真实环境 go-live。")
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
    `- nextMilestone: \`${report.nextMilestone ?? "none"}\``,
    "",
    "Milestones:",
    ...report.milestones.map(
      (item) =>
        `- ${item.id} ${item.title}: \`${item.status}\` (${String(item.blockerCount)} blocker(s))`,
    ),
    "",
    "Blockers:",
    ...report.blockers.map((item) => `- ${item}`),
    "",
    "Recommended actions:",
    ...report.recommendedActions.map((item) => `- ${item}`),
    "",
    "Owner handoffs:",
    ...(report.ownerHandoffs.length > 0
      ? report.ownerHandoffs.flatMap((item) => [
          `- ${item.owner}: ${String(item.blockerCount)} blocker(s)`,
          ...item.blockers.map((blocker) => `  - ${blocker}`),
          `  - envKeys: ${item.envKeys.join(", ")}`,
        ])
      : ["- none"]),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const run = async () => {
  const summary = buildSummary()
  const blockerDetails = buildBlockerDetails(summary)
  const blockers = blockerDetails.map((item) => item.message)
  const recommendedActions = buildRecommendedActions(blockers, summary)
  const { milestones, nextMilestone } = buildMilestones(blockerDetails)
  const ownerHandoffs = buildOwnerHandoffs(blockerDetails)
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
    blockerDetails,
    recommendedActions,
    milestones,
    nextMilestone,
    ownerHandoffs,
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
