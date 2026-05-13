import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

interface GoLiveReportSummary {
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

interface GoLiveReport {
  generatedAt: string
  outputPath: string
  status: "passed" | "failed"
  blockers: string[]
  blockerDetails?: Array<{
    code: string
    message: string
    category: string
    defaultOwner: string
    milestoneId: string
    envKeys: string[]
  }>
  recommendedActions: string[]
  nextMilestone?: string | null
  summary: GoLiveReportSummary
}

interface GoLiveHandoffBundle {
  id: string
  label: string
  description: string
  markdownPath: string
  envPath: string
  blockerCount: number
  blockers: string[]
  envKeys: string[]
}

interface GoLiveHandoffReport {
  generatedAt: string
  reportPath: string
  outputPath: string
  summaryPath: string
  envTemplatePath: string
  bundleDir: string
  status: "passed" | "failed"
  nextMilestone: string | null
  ownerBundles: GoLiveHandoffBundle[]
}

type EnvValue = boolean | string | string[] | null

interface EnvFieldDefinition {
  key: string
  getValue: (summary: GoLiveReportSummary) => EnvValue
}

interface EnvFieldGroup {
  title: string
  keys: string[]
}

interface OwnerBundleDefinition {
  id: string
  label: string
  description: string
  envKeys: string[]
}

const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) {
    throw new Error(message)
  }
}

const GO_LIVE_ENV_FIELDS: EnvFieldDefinition[] = [
  {
    key: "ELYSIAN_GO_LIVE_SOURCE_BRANCH",
    getValue: (summary) => summary.sourceBranch,
  },
  {
    key: "ELYSIAN_GO_LIVE_TARGET_BRANCH",
    getValue: (summary) => summary.targetBranch,
  },
  {
    key: "ELYSIAN_GO_LIVE_RELEASE_COMMIT",
    getValue: (summary) => summary.releaseCommit,
  },
  {
    key: "ELYSIAN_GO_LIVE_RELEASE_TAG",
    getValue: (summary) => summary.releaseTag,
  },
  {
    key: "ELYSIAN_GO_LIVE_RELEASE_PR",
    getValue: (summary) => summary.releasePr,
  },
  {
    key: "ELYSIAN_GO_LIVE_ENVIRONMENT",
    getValue: (summary) => summary.releaseEnvironment,
  },
  {
    key: "ELYSIAN_GO_LIVE_MIGRATIONS",
    getValue: (summary) => summary.migrationList,
  },
  {
    key: "ELYSIAN_GO_LIVE_TENANT_IMPACT",
    getValue: (summary) => summary.tenantImpact,
  },
  {
    key: "ELYSIAN_GO_LIVE_CHECK_PASSED",
    getValue: (summary) => summary.checkPassed,
  },
  {
    key: "ELYSIAN_GO_LIVE_BUILD_VUE_PASSED",
    getValue: (summary) => summary.buildVuePassed,
  },
  {
    key: "ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED",
    getValue: (summary) => summary.smokeFullPassed,
  },
  {
    key: "ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED",
    getValue: (summary) => summary.serverImageVerifyPassed,
  },
  {
    key: "ELYSIAN_GO_LIVE_TENANT_FULL_PASSED",
    getValue: (summary) => summary.tenantFullPassed,
  },
  {
    key: "ELYSIAN_GO_LIVE_BACKUP_READY",
    getValue: (summary) => summary.backupReady,
  },
  {
    key: "ELYSIAN_GO_LIVE_RELEASE_ROLES_READY",
    getValue: (summary) => summary.releaseRolesReady,
  },
  {
    key: "ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY",
    getValue: (summary) => summary.proxyTlsOwnerReady,
  },
  {
    key: "ELYSIAN_GO_LIVE_HEALTH_VERIFIED",
    getValue: (summary) => summary.healthVerified,
  },
  {
    key: "ELYSIAN_GO_LIVE_METRICS_VERIFIED",
    getValue: (summary) => summary.metricsVerified,
  },
  {
    key: "ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED",
    getValue: (summary) => summary.adminLoginVerified,
  },
  {
    key: "ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED",
    getValue: (summary) => summary.menuPermissionGateVerified,
  },
  {
    key: "ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED",
    getValue: (summary) => summary.coreWorkspaceListVerified,
  },
  {
    key: "ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED",
    getValue: (summary) => summary.coreWriteActionVerified,
  },
  {
    key: "ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED",
    getValue: (summary) => summary.superAdminTenantAccessVerified,
  },
  {
    key: "ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED",
    getValue: (summary) => summary.tenantAdminDeniedVerified,
  },
  {
    key: "ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED",
    getValue: (summary) => summary.nonDefaultTenantLoginVerified,
  },
  {
    key: "ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED",
    getValue: (summary) => summary.crossTenantIsolationVerified,
  },
]

const GO_LIVE_ENV_FIELD_GROUPS: EnvFieldGroup[] = [
  {
    title: "发布元数据",
    keys: [
      "ELYSIAN_GO_LIVE_SOURCE_BRANCH",
      "ELYSIAN_GO_LIVE_TARGET_BRANCH",
      "ELYSIAN_GO_LIVE_RELEASE_COMMIT",
      "ELYSIAN_GO_LIVE_RELEASE_TAG",
      "ELYSIAN_GO_LIVE_RELEASE_PR",
      "ELYSIAN_GO_LIVE_ENVIRONMENT",
      "ELYSIAN_GO_LIVE_MIGRATIONS",
      "ELYSIAN_GO_LIVE_TENANT_IMPACT",
    ],
  },
  {
    title: "仓库内已验证项",
    keys: [
      "ELYSIAN_GO_LIVE_CHECK_PASSED",
      "ELYSIAN_GO_LIVE_BUILD_VUE_PASSED",
      "ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED",
      "ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED",
      "ELYSIAN_GO_LIVE_TENANT_FULL_PASSED",
    ],
  },
  {
    title: "环境与责任前提",
    keys: [
      "ELYSIAN_GO_LIVE_BACKUP_READY",
      "ELYSIAN_GO_LIVE_RELEASE_ROLES_READY",
      "ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY",
    ],
  },
  {
    title: "发布后最小冒烟",
    keys: [
      "ELYSIAN_GO_LIVE_HEALTH_VERIFIED",
      "ELYSIAN_GO_LIVE_METRICS_VERIFIED",
      "ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED",
      "ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED",
      "ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED",
      "ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED",
    ],
  },
  {
    title: "Tenant 附加验证",
    keys: [
      "ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED",
      "ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED",
      "ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED",
      "ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED",
    ],
  },
]

const OWNER_BUNDLE_DEFINITIONS: OwnerBundleDefinition[] = [
  {
    id: "release-coordinator",
    label: "发布负责人",
    description: "锁定 release 输入、目标环境和角色值守信息。",
    envKeys: [
      "ELYSIAN_GO_LIVE_SOURCE_BRANCH",
      "ELYSIAN_GO_LIVE_TARGET_BRANCH",
      "ELYSIAN_GO_LIVE_RELEASE_COMMIT",
      "ELYSIAN_GO_LIVE_RELEASE_TAG",
      "ELYSIAN_GO_LIVE_RELEASE_PR",
      "ELYSIAN_GO_LIVE_ENVIRONMENT",
      "ELYSIAN_GO_LIVE_TENANT_IMPACT",
      "ELYSIAN_GO_LIVE_RELEASE_ROLES_READY",
    ],
  },
  {
    id: "environment-dba",
    label: "环境 / DBA owner",
    description: "锁定 migration、备份恢复、proxy/TLS 和环境侧基础冒烟。",
    envKeys: [
      "ELYSIAN_GO_LIVE_ENVIRONMENT",
      "ELYSIAN_GO_LIVE_MIGRATIONS",
      "ELYSIAN_GO_LIVE_BACKUP_READY",
      "ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY",
      "ELYSIAN_GO_LIVE_HEALTH_VERIFIED",
      "ELYSIAN_GO_LIVE_METRICS_VERIFIED",
      "ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED",
    ],
  },
  {
    id: "application-owner",
    label: "应用 owner",
    description: "补齐仓库验证与发布后功能冒烟，按需覆盖 tenant 安全项。",
    envKeys: [
      "ELYSIAN_GO_LIVE_CHECK_PASSED",
      "ELYSIAN_GO_LIVE_BUILD_VUE_PASSED",
      "ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED",
      "ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED",
      "ELYSIAN_GO_LIVE_TENANT_FULL_PASSED",
      "ELYSIAN_GO_LIVE_HEALTH_VERIFIED",
      "ELYSIAN_GO_LIVE_METRICS_VERIFIED",
      "ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED",
      "ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED",
      "ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED",
      "ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED",
      "ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED",
      "ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED",
      "ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED",
      "ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED",
    ],
  },
]

const ENV_FIELD_MAP = new Map(
  GO_LIVE_ENV_FIELDS.map((definition) => [definition.key, definition]),
)

const readNonEmptyEnv = (key: string) => {
  const value = process.env[key]
  return value && value.trim().length > 0 ? value.trim() : null
}

const resolveSummaryPath = () => readNonEmptyEnv("GITHUB_STEP_SUMMARY")

const resolveReportPath = () =>
  readNonEmptyEnv("ELYSIAN_GO_LIVE_REPORT_PATH") ??
  join(process.cwd(), "artifacts", "go-live", "go-live-report.json")

const resolveOutputPath = () =>
  readNonEmptyEnv("ELYSIAN_GO_LIVE_HANDOFF_REPORT_PATH") ??
  join(process.cwd(), "artifacts", "go-live", "go-live-handoff-report.json")

const resolveMarkdownSummaryPath = (outputPath: string) =>
  readNonEmptyEnv("ELYSIAN_GO_LIVE_HANDOFF_SUMMARY_PATH") ??
  join(dirname(outputPath), "go-live-handoff-summary.md")

const resolveEnvTemplatePath = (outputPath: string) =>
  readNonEmptyEnv("ELYSIAN_GO_LIVE_HANDOFF_ENV_PATH") ??
  join(dirname(outputPath), "go-live-input.prefill.env")

const resolveBundleDir = (outputPath: string) =>
  readNonEmptyEnv("ELYSIAN_GO_LIVE_HANDOFF_DIR") ??
  join(dirname(outputPath), "handoffs")

const parseReport = (raw: string) => {
  const parsed = JSON.parse(raw) as Partial<GoLiveReport>

  assert(
    parsed.status === "passed" || parsed.status === "failed",
    "Invalid go-live report: status is invalid",
  )
  assert(
    typeof parsed.summary === "object" && parsed.summary !== null,
    "Invalid go-live report: summary missing",
  )
  assert(
    typeof parsed.summary.sourceBranch === "string" &&
      typeof parsed.summary.targetBranch === "string" &&
      typeof parsed.summary.tenantImpact === "boolean",
    "Invalid go-live report: summary is incomplete",
  )
  assert(
    Array.isArray(parsed.recommendedActions),
    "Invalid go-live report: recommendedActions missing",
  )

  return {
    ...parsed,
    blockerDetails: Array.isArray(parsed.blockerDetails)
      ? parsed.blockerDetails
      : [],
    nextMilestone:
      typeof parsed.nextMilestone === "string" ? parsed.nextMilestone : null,
  } as GoLiveReport
}

const formatEnvValue = (value: EnvValue) => {
  if (value === null) {
    return ""
  }
  if (Array.isArray(value)) {
    return value.join(",")
  }
  return String(value)
}

const formatDisplayValue = (value: EnvValue) => {
  const rendered = formatEnvValue(value)
  return rendered.length > 0 ? rendered : "unset"
}

const resolveEnvFieldValue = (
  summary: GoLiveReportSummary,
  key: string,
): EnvValue => {
  const field = ENV_FIELD_MAP.get(key)
  assert(field, `Unknown go-live env key: ${key}`)
  return field.getValue(summary)
}

export const renderEnvTemplate = (
  summary: GoLiveReportSummary,
  keys = GO_LIVE_ENV_FIELDS.map((field) => field.key),
) =>
  `${keys
    .map(
      (key) => `${key}=${formatEnvValue(resolveEnvFieldValue(summary, key))}`,
    )
    .join("\n")}\n`

const renderGroupedEnvTemplate = (
  summary: GoLiveReportSummary,
  groups: EnvFieldGroup[],
) => {
  const lines: string[] = []

  for (const group of groups) {
    if (lines.length > 0) {
      lines.push("")
    }
    lines.push(`# ${group.title}`)
    lines.push(...renderEnvTemplate(summary, group.keys).trimEnd().split("\n"))
  }

  return `${lines.join("\n")}\n`
}

export const buildOwnerBundles = (
  report: GoLiveReport,
  bundleDir: string,
): GoLiveHandoffBundle[] =>
  OWNER_BUNDLE_DEFINITIONS.map((definition) => {
    const blockers = (report.blockerDetails ?? [])
      .filter((detail) =>
        detail.envKeys.some((envKey) => definition.envKeys.includes(envKey)),
      )
      .map((detail) => detail.message)

    return {
      id: definition.id,
      label: definition.label,
      description: definition.description,
      markdownPath: join(bundleDir, `${definition.id}.md`),
      envPath: join(bundleDir, `${definition.id}.env`),
      blockerCount: blockers.length,
      blockers,
      envKeys: definition.envKeys,
    }
  })

export const renderOwnerBundleMarkdown = (
  bundle: GoLiveHandoffBundle,
  report: GoLiveReport,
) => {
  const lines = [
    `# Go-live Handoff - ${bundle.label}`,
    "",
    bundle.description,
    "",
    `- 当前 gate 状态：\`${report.status}\``,
    `- 当前 nextMilestone：\`${report.nextMilestone ?? "none"}\``,
    `- 当前 blocker 数：\`${String(bundle.blockerCount)}\``,
    `- 参考总报告：\`${report.outputPath}\``,
    "",
    "## 当前 blocker",
    ...(bundle.blockers.length > 0
      ? bundle.blockers.map((blocker) => `- ${blocker}`)
      : ["- 当前没有直接分配给该角色的 blocker。"]),
    "",
    "## 当前字段值",
    ...bundle.envKeys.map(
      (envKey) =>
        `- \`${envKey}\`: \`${formatDisplayValue(resolveEnvFieldValue(report.summary, envKey))}\``,
    ),
    "",
    "## 可直接回填块",
    "```text",
    ...bundle.envKeys.map(
      (envKey) =>
        `${envKey}=${formatEnvValue(resolveEnvFieldValue(report.summary, envKey))}`,
    ),
    "```",
  ]

  return `${lines.join("\n")}\n`
}

export const renderSummaryMarkdown = (report: GoLiveHandoffReport) => {
  const lines = [
    "### Go-live Handoff",
    "",
    `- status: \`${report.status}\``,
    `- nextMilestone: \`${report.nextMilestone ?? "none"}\``,
    `- reportPath: \`${report.reportPath}\``,
    `- envTemplatePath: \`${report.envTemplatePath}\``,
    `- summaryPath: \`${report.summaryPath}\``,
    `- bundleDir: \`${report.bundleDir}\``,
    "",
    "Owner bundles:",
    ...report.ownerBundles.map(
      (bundle) =>
        `- ${bundle.label}: \`${bundle.markdownPath}\` / \`${bundle.envPath}\` (${String(bundle.blockerCount)} blocker(s))`,
    ),
    "",
  ]

  return `${lines.join("\n")}\n`
}

export const run = async () => {
  const reportPath = resolveReportPath()
  const outputPath = resolveOutputPath()
  const summaryPath = resolveMarkdownSummaryPath(outputPath)
  const envTemplatePath = resolveEnvTemplatePath(outputPath)
  const bundleDir = resolveBundleDir(outputPath)
  const report = parseReport(await readFile(reportPath, "utf8"))
  const ownerBundles = buildOwnerBundles(report, bundleDir)

  await mkdir(dirname(outputPath), { recursive: true })
  await mkdir(bundleDir, { recursive: true })

  await writeFile(
    envTemplatePath,
    renderGroupedEnvTemplate(report.summary, GO_LIVE_ENV_FIELD_GROUPS),
    "utf8",
  )

  for (const bundle of ownerBundles) {
    await writeFile(
      bundle.envPath,
      renderEnvTemplate(report.summary, bundle.envKeys),
      "utf8",
    )
    await writeFile(
      bundle.markdownPath,
      renderOwnerBundleMarkdown(bundle, report),
      "utf8",
    )
  }

  const handoffReport: GoLiveHandoffReport = {
    generatedAt: new Date().toISOString(),
    reportPath,
    outputPath,
    summaryPath,
    envTemplatePath,
    bundleDir,
    status: report.status,
    nextMilestone: report.nextMilestone ?? null,
    ownerBundles,
  }

  await writeFile(outputPath, JSON.stringify(handoffReport, null, 2), "utf8")
  await writeFile(summaryPath, renderSummaryMarkdown(handoffReport), "utf8")

  const githubSummaryPath = resolveSummaryPath()
  if (githubSummaryPath) {
    await appendFile(
      githubSummaryPath,
      renderSummaryMarkdown(handoffReport),
      "utf8",
    )
    console.log(`[go-live-handoff] github-summary: ${githubSummaryPath}`)
  }

  console.log(`[go-live-handoff] report: ${outputPath}`)
  console.log(`[go-live-handoff] summary: ${summaryPath}`)
  console.log(`[go-live-handoff] env-template: ${envTemplatePath}`)
  console.log(`[go-live-handoff] bundle-dir: ${bundleDir}`)

  return handoffReport
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[go-live-handoff] failed: ${message}`)
    process.exitCode = 1
  }
}
