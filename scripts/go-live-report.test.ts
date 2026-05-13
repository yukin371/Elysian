import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, test } from "bun:test"

import {
  buildBlockerDetails,
  buildBlockers,
  buildMilestones,
  buildOwnerHandoffs,
  buildRecommendedActions,
  renderSummaryMarkdown,
} from "./go-live-report"

const runReportProcess = async (
  env: Record<string, string | undefined>,
  reportPath: string,
) => {
  const child = Bun.spawn(["bun", "scripts/go-live-report.ts"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...env,
      ELYSIAN_GO_LIVE_REPORT_PATH: reportPath,
    },
    stdout: "pipe",
    stderr: "pipe",
  })

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ])

  return {
    stdout,
    stderr,
    exitCode,
  }
}

const createReportOutputPath = async () => {
  const outputDir = await mkdtemp(join(tmpdir(), "elysian-go-live-report-"))
  return join(outputDir, "go-live-report.json")
}

describe("buildBlockers", () => {
  test("requires tenant post-release evidence when tenant impact is true", () => {
    const blockers = buildBlockers({
      sourceBranch: "dev",
      targetBranch: "main",
      releaseCommit: "abc",
      releaseTag: "v0.1.0",
      releasePr: null,
      releaseEnvironment: "production",
      migrationList: ["001_init"],
      tenantImpact: true,
      checkPassed: true,
      buildVuePassed: true,
      smokeFullPassed: true,
      serverImageVerifyPassed: true,
      tenantFullPassed: false,
      backupReady: true,
      releaseRolesReady: true,
      proxyTlsOwnerReady: true,
      healthVerified: true,
      metricsVerified: true,
      adminLoginVerified: true,
      menuPermissionGateVerified: true,
      coreWorkspaceListVerified: true,
      coreWriteActionVerified: true,
      superAdminTenantAccessVerified: false,
      tenantAdminDeniedVerified: false,
      nonDefaultTenantLoginVerified: false,
      crossTenantIsolationVerified: false,
    })

    expect(blockers).toContain("`bun run e2e:tenant:full` 未确认通过。")
    expect(blockers).toContain("super-admin `/system/tenants` 未验证。")
    expect(blockers).toContain("跨租户隔离未验证。")
  })

  test("does not require tenant evidence when tenant impact is false", () => {
    const blockers = buildBlockers({
      sourceBranch: "dev",
      targetBranch: "main",
      releaseCommit: "abc",
      releaseTag: "v0.1.0",
      releasePr: null,
      releaseEnvironment: "production",
      migrationList: ["001_init"],
      tenantImpact: false,
      checkPassed: true,
      buildVuePassed: true,
      smokeFullPassed: true,
      serverImageVerifyPassed: true,
      tenantFullPassed: false,
      backupReady: true,
      releaseRolesReady: true,
      proxyTlsOwnerReady: true,
      healthVerified: true,
      metricsVerified: true,
      adminLoginVerified: true,
      menuPermissionGateVerified: true,
      coreWorkspaceListVerified: true,
      coreWriteActionVerified: true,
      superAdminTenantAccessVerified: false,
      tenantAdminDeniedVerified: false,
      nonDefaultTenantLoginVerified: false,
      crossTenantIsolationVerified: false,
    })

    expect(
      blockers.some((item) => item.includes("tenant") || item.includes("租户")),
    ).toBeFalse()
  })
})

describe("buildRecommendedActions", () => {
  test("returns no action when there are no blockers", () => {
    expect(
      buildRecommendedActions([], {
        sourceBranch: "dev",
        targetBranch: "main",
        releaseCommit: "abc",
        releaseTag: "v0.1.0",
        releasePr: null,
        releaseEnvironment: "production",
        migrationList: ["001_init"],
        tenantImpact: false,
        checkPassed: true,
        buildVuePassed: true,
        smokeFullPassed: true,
        serverImageVerifyPassed: true,
        tenantFullPassed: true,
        backupReady: true,
        releaseRolesReady: true,
        proxyTlsOwnerReady: true,
        healthVerified: true,
        metricsVerified: true,
        adminLoginVerified: true,
        menuPermissionGateVerified: true,
        coreWorkspaceListVerified: true,
        coreWriteActionVerified: true,
        superAdminTenantAccessVerified: true,
        tenantAdminDeniedVerified: true,
        nonDefaultTenantLoginVerified: true,
        crossTenantIsolationVerified: true,
      }),
    ).toEqual(["No action required."])
  })
})

describe("buildMilestones", () => {
  test("tracks next blocked milestone from blocker details", () => {
    const blockerDetails = buildBlockerDetails({
      sourceBranch: "dev",
      targetBranch: "main",
      releaseCommit: "abc",
      releaseTag: null,
      releasePr: null,
      releaseEnvironment: null,
      migrationList: [],
      tenantImpact: false,
      checkPassed: true,
      buildVuePassed: true,
      smokeFullPassed: false,
      serverImageVerifyPassed: true,
      tenantFullPassed: false,
      backupReady: false,
      releaseRolesReady: false,
      proxyTlsOwnerReady: false,
      healthVerified: false,
      metricsVerified: false,
      adminLoginVerified: false,
      menuPermissionGateVerified: false,
      coreWorkspaceListVerified: false,
      coreWriteActionVerified: false,
      superAdminTenantAccessVerified: false,
      tenantAdminDeniedVerified: false,
      nonDefaultTenantLoginVerified: false,
      crossTenantIsolationVerified: false,
    })

    const milestoneState = buildMilestones(blockerDetails)

    expect(milestoneState.nextMilestone).toBe("M1")
    expect(milestoneState.milestones[0]?.status).toBe("blocked")
    expect(milestoneState.milestones[1]?.status).toBe("blocked")
    expect(milestoneState.milestones[3]?.status).toBe("blocked")
  })
})

describe("buildOwnerHandoffs", () => {
  test("groups blockers and env keys by owner", () => {
    const handoffs = buildOwnerHandoffs([
      {
        code: "release-commit-missing",
        message: "release commit 未锁定。",
        category: "release-input",
        defaultOwner: "发布负责人",
        milestoneId: "M1",
        envKeys: ["ELYSIAN_GO_LIVE_RELEASE_COMMIT"],
      },
      {
        code: "release-tag-or-pr-missing",
        message: "release tag / release PR 未锁定。",
        category: "release-input",
        defaultOwner: "发布负责人",
        milestoneId: "M1",
        envKeys: ["ELYSIAN_GO_LIVE_RELEASE_TAG", "ELYSIAN_GO_LIVE_RELEASE_PR"],
      },
      {
        code: "backup-evidence-missing",
        message: "database backup / restore evidence 缺失。",
        category: "environment-prerequisite",
        defaultOwner: "DBA / 环境 owner",
        milestoneId: "M2",
        envKeys: ["ELYSIAN_GO_LIVE_BACKUP_READY"],
      },
    ])

    expect(handoffs[0]).toEqual({
      owner: "发布负责人",
      blockerCount: 2,
      blockers: [
        "release commit 未锁定。",
        "release tag / release PR 未锁定。",
      ],
      envKeys: [
        "ELYSIAN_GO_LIVE_RELEASE_COMMIT",
        "ELYSIAN_GO_LIVE_RELEASE_TAG",
        "ELYSIAN_GO_LIVE_RELEASE_PR",
      ],
    })
    expect(handoffs[1]?.owner).toBe("DBA / 环境 owner")
  })
})

describe("renderSummaryMarkdown", () => {
  test("renders blocker summary", () => {
    const markdown = renderSummaryMarkdown({
      generatedAt: "2026-05-06T00:00:00.000Z",
      outputPath: "artifacts/go-live/go-live-report.json",
      metadata: {
        releaseCommit: "abc",
        releaseTag: "v0.1.0",
        releasePr: null,
        releaseEnvironment: "production",
        migrationList: ["001_init"],
        tenantImpact: false,
      },
      summary: {
        sourceBranch: "dev",
        targetBranch: "main",
        releaseCommit: "abc",
        releaseTag: "v0.1.0",
        releasePr: null,
        releaseEnvironment: "production",
        migrationList: ["001_init"],
        tenantImpact: false,
        checkPassed: true,
        buildVuePassed: true,
        smokeFullPassed: true,
        serverImageVerifyPassed: true,
        tenantFullPassed: true,
        backupReady: false,
        releaseRolesReady: false,
        proxyTlsOwnerReady: false,
        healthVerified: false,
        metricsVerified: false,
        adminLoginVerified: false,
        menuPermissionGateVerified: false,
        coreWorkspaceListVerified: false,
        coreWriteActionVerified: false,
        superAdminTenantAccessVerified: false,
        tenantAdminDeniedVerified: false,
        nonDefaultTenantLoginVerified: false,
        crossTenantIsolationVerified: false,
      },
      status: "failed",
      blockers: ["database backup / restore evidence 缺失。"],
      blockerDetails: [
        {
          code: "backup-evidence-missing",
          message: "database backup / restore evidence 缺失。",
          category: "environment-prerequisite",
          defaultOwner: "DBA / 环境 owner",
          milestoneId: "M2",
          envKeys: ["ELYSIAN_GO_LIVE_BACKUP_READY"],
        },
      ],
      recommendedActions: ["由发布负责人填写角色与值守模板。"],
      milestones: [
        {
          id: "M1",
          title: "候选冻结",
          status: "passed",
          blockerCount: 0,
          blockers: [],
        },
        {
          id: "M2",
          title: "环境前提锁定",
          status: "blocked",
          blockerCount: 1,
          blockers: ["database backup / restore evidence 缺失。"],
        },
        {
          id: "M3",
          title: "目标环境演练",
          status: "blocked",
          blockerCount: 1,
          blockers: ["发布后 `/health` 未验证。"],
        },
        {
          id: "M4",
          title: "首发放行结论",
          status: "blocked",
          blockerCount: 1,
          blockers: ["前序里程碑未全部通过，当前不可给出首发放行结论。"],
        },
      ],
      nextMilestone: "M2",
      ownerHandoffs: [
        {
          owner: "DBA / 环境 owner",
          blockerCount: 1,
          blockers: ["database backup / restore evidence 缺失。"],
          envKeys: ["ELYSIAN_GO_LIVE_BACKUP_READY"],
        },
      ],
    })

    expect(markdown).toContain("### Go-live Report")
    expect(markdown).toContain("- status: `failed`")
    expect(markdown).toContain("- releaseEnvironment: `production`")
    expect(markdown).toContain("- nextMilestone: `M2`")
    expect(markdown).toContain("- M2 环境前提锁定: `blocked` (1 blocker(s))")
    expect(markdown).toContain("- DBA / 环境 owner: 1 blocker(s)")
    expect(markdown).toContain("envKeys: ELYSIAN_GO_LIVE_BACKUP_READY")
    expect(markdown).toContain("database backup / restore evidence 缺失。")
  })
})

describe("run", () => {
  test("writes a passed report when required env is complete", async () => {
    const reportPath = await createReportOutputPath()
    const result = await runReportProcess(
      {
        ELYSIAN_GO_LIVE_SOURCE_BRANCH: "dev",
        ELYSIAN_GO_LIVE_TARGET_BRANCH: "main",
        ELYSIAN_GO_LIVE_RELEASE_COMMIT: "845983b",
        ELYSIAN_GO_LIVE_RELEASE_TAG: "verify-go-live-report",
        ELYSIAN_GO_LIVE_ENVIRONMENT: "production",
        ELYSIAN_GO_LIVE_MIGRATIONS: "001_init",
        ELYSIAN_GO_LIVE_TENANT_IMPACT: "false",
        ELYSIAN_GO_LIVE_CHECK_PASSED: "true",
        ELYSIAN_GO_LIVE_BUILD_VUE_PASSED: "true",
        ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED: "true",
        ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED: "true",
        ELYSIAN_GO_LIVE_TENANT_FULL_PASSED: "true",
        ELYSIAN_GO_LIVE_BACKUP_READY: "true",
        ELYSIAN_GO_LIVE_RELEASE_ROLES_READY: "true",
        ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY: "true",
        ELYSIAN_GO_LIVE_HEALTH_VERIFIED: "true",
        ELYSIAN_GO_LIVE_METRICS_VERIFIED: "true",
        ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED: "true",
        ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED: "true",
        ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED: "true",
        ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED: "true",
      },
      reportPath,
    )

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("status=passed blockerCount=0")

    const report = JSON.parse(await readFile(reportPath, "utf8")) as {
      status: string
      blockers: string[]
      nextMilestone: string | null
      milestones: Array<{ id: string; status: string }>
      ownerHandoffs: Array<{ owner: string; envKeys: string[] }>
    }
    expect(report.status).toBe("passed")
    expect(report.blockers).toEqual([])
    expect(report.nextMilestone).toBeNull()
    expect(report.milestones.map((item) => item.status)).toEqual([
      "passed",
      "passed",
      "passed",
      "passed",
    ])
    expect(report.ownerHandoffs).toEqual([])
  })

  test("fails fast when a boolean env is invalid", async () => {
    const reportPath = await createReportOutputPath()
    const result = await runReportProcess(
      {
        ELYSIAN_GO_LIVE_TENANT_IMPACT: "not-a-boolean",
      },
      reportPath,
    )

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain(
      "Invalid boolean env ELYSIAN_GO_LIVE_TENANT_IMPACT",
    )
  })
})
