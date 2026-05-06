import { describe, expect, test } from "bun:test"

import {
  buildBlockers,
  buildRecommendedActions,
  renderSummaryMarkdown,
} from "./go-live-report"

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
      recommendedActions: ["由发布负责人填写角色与值守模板。"],
    })

    expect(markdown).toContain("### Go-live Report")
    expect(markdown).toContain("- status: `failed`")
    expect(markdown).toContain("- releaseEnvironment: `production`")
    expect(markdown).toContain("database backup / restore evidence 缺失。")
  })
})
