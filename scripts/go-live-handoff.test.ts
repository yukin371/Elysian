import { mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { beforeEach, describe, expect, test } from "bun:test"

import {
  buildOwnerBundles,
  renderEnvTemplate,
  renderOwnerBundleMarkdown,
  renderSummaryMarkdown,
} from "./go-live-handoff"

const createReportFixture = async (status: "passed" | "failed") => {
  const outputDir = await mkdtemp(join(tmpdir(), "elysian-go-live-handoff-"))
  const reportPath = join(outputDir, "go-live-report.json")
  const handoffPath = join(outputDir, "go-live-handoff-report.json")
  const summaryPath = join(outputDir, "go-live-handoff-summary.md")
  const envTemplatePath = join(outputDir, "go-live-input.prefill.env")
  const bundleDir = join(outputDir, "handoffs")

  await writeFile(
    reportPath,
    JSON.stringify(
      {
        generatedAt: "2026-05-13T00:00:00.000Z",
        outputPath: reportPath,
        status,
        blockers:
          status === "failed"
            ? [
                "release environment 未锁定。",
                "database backup / restore evidence 缺失。",
                "发布后 `/health` 未验证。",
              ]
            : [],
        blockerDetails:
          status === "failed"
            ? [
                {
                  code: "release-environment-missing",
                  message: "release environment 未锁定。",
                  category: "release-input",
                  defaultOwner: "发布负责人",
                  milestoneId: "M2",
                  envKeys: ["ELYSIAN_GO_LIVE_ENVIRONMENT"],
                },
                {
                  code: "backup-evidence-missing",
                  message: "database backup / restore evidence 缺失。",
                  category: "environment-prerequisite",
                  defaultOwner: "DBA / 环境 owner",
                  milestoneId: "M2",
                  envKeys: ["ELYSIAN_GO_LIVE_BACKUP_READY"],
                },
                {
                  code: "health-not-verified",
                  message: "发布后 `/health` 未验证。",
                  category: "post-release-smoke",
                  defaultOwner: "应用 owner / 环境 owner",
                  milestoneId: "M3",
                  envKeys: ["ELYSIAN_GO_LIVE_HEALTH_VERIFIED"],
                },
              ]
            : [],
        recommendedActions:
          status === "failed"
            ? [
                "先锁定目标发布环境，并把环境标识写入 go-live 准备包。",
                "由环境 / DBA owner 填写数据库备份与恢复模板，并补齐恢复点证据。",
              ]
            : ["No action required."],
        nextMilestone: status === "failed" ? "M2" : null,
        summary: {
          sourceBranch: "dev",
          targetBranch: "main",
          releaseCommit: "1134dcf",
          releaseTag: "v0.3.0",
          releasePr: null,
          releaseEnvironment: status === "failed" ? null : "production",
          migrationList: ["0001_auth_rbac", "0002_customer"],
          tenantImpact: false,
          checkPassed: true,
          buildVuePassed: true,
          smokeFullPassed: true,
          serverImageVerifyPassed: true,
          tenantFullPassed: false,
          backupReady: status === "passed",
          releaseRolesReady: true,
          proxyTlsOwnerReady: status === "passed",
          healthVerified: status === "passed",
          metricsVerified: status === "passed",
          adminLoginVerified: status === "passed",
          menuPermissionGateVerified: status === "passed",
          coreWorkspaceListVerified: status === "passed",
          coreWriteActionVerified: status === "passed",
          superAdminTenantAccessVerified: false,
          tenantAdminDeniedVerified: false,
          nonDefaultTenantLoginVerified: false,
          crossTenantIsolationVerified: false,
        },
      },
      null,
      2,
    ),
    "utf8",
  )

  return {
    reportPath,
    handoffPath,
    summaryPath,
    envTemplatePath,
    bundleDir,
  }
}

const runHandoffProcess = async (paths: {
  reportPath: string
  handoffPath: string
  summaryPath: string
  envTemplatePath: string
  bundleDir: string
}) => {
  const child = Bun.spawn(["bun", "scripts/go-live-handoff.ts"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ELYSIAN_GO_LIVE_REPORT_PATH: paths.reportPath,
      ELYSIAN_GO_LIVE_HANDOFF_REPORT_PATH: paths.handoffPath,
      ELYSIAN_GO_LIVE_HANDOFF_SUMMARY_PATH: paths.summaryPath,
      ELYSIAN_GO_LIVE_HANDOFF_ENV_PATH: paths.envTemplatePath,
      ELYSIAN_GO_LIVE_HANDOFF_DIR: paths.bundleDir,
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

describe("renderEnvTemplate", () => {
  test("renders strings, csv arrays and booleans", () => {
    const envTemplate = renderEnvTemplate(
      {
        sourceBranch: "dev",
        targetBranch: "main",
        releaseCommit: "1134dcf",
        releaseTag: "v0.3.0",
        releasePr: null,
        releaseEnvironment: "production",
        migrationList: ["0001_auth_rbac", "0002_customer"],
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
      },
      [
        "ELYSIAN_GO_LIVE_RELEASE_COMMIT",
        "ELYSIAN_GO_LIVE_MIGRATIONS",
        "ELYSIAN_GO_LIVE_TENANT_IMPACT",
      ],
    )

    expect(envTemplate).toBe(
      [
        "ELYSIAN_GO_LIVE_RELEASE_COMMIT=1134dcf",
        "ELYSIAN_GO_LIVE_MIGRATIONS=0001_auth_rbac,0002_customer",
        "ELYSIAN_GO_LIVE_TENANT_IMPACT=false",
        "",
      ].join("\n"),
    )
  })
})

describe("buildOwnerBundles", () => {
  test("duplicates shared blockers into both environment and application bundles", () => {
    const bundles = buildOwnerBundles(
      {
        generatedAt: "2026-05-13T00:00:00.000Z",
        outputPath: "artifacts/go-live/go-live-report.json",
        status: "failed",
        blockers: [
          "database backup / restore evidence 缺失。",
          "发布后 `/health` 未验证。",
        ],
        blockerDetails: [
          {
            code: "backup-evidence-missing",
            message: "database backup / restore evidence 缺失。",
            category: "environment-prerequisite",
            defaultOwner: "DBA / 环境 owner",
            milestoneId: "M2",
            envKeys: ["ELYSIAN_GO_LIVE_BACKUP_READY"],
          },
          {
            code: "health-not-verified",
            message: "发布后 `/health` 未验证。",
            category: "post-release-smoke",
            defaultOwner: "应用 owner / 环境 owner",
            milestoneId: "M3",
            envKeys: ["ELYSIAN_GO_LIVE_HEALTH_VERIFIED"],
          },
        ],
        recommendedActions: [],
        nextMilestone: "M2",
        summary: {
          sourceBranch: "dev",
          targetBranch: "main",
          releaseCommit: "1134dcf",
          releaseTag: "v0.3.0",
          releasePr: null,
          releaseEnvironment: null,
          migrationList: [],
          tenantImpact: false,
          checkPassed: true,
          buildVuePassed: true,
          smokeFullPassed: true,
          serverImageVerifyPassed: true,
          tenantFullPassed: false,
          backupReady: false,
          releaseRolesReady: true,
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
      },
      "artifacts/go-live/handoffs",
    )

    const environmentBundle = bundles.find(
      (bundle) => bundle.id === "environment-dba",
    )
    const applicationBundle = bundles.find(
      (bundle) => bundle.id === "application-owner",
    )

    expect(environmentBundle?.blockers).toContain(
      "database backup / restore evidence 缺失。",
    )
    expect(environmentBundle?.blockers).toContain("发布后 `/health` 未验证。")
    expect(applicationBundle?.blockers).toContain("发布后 `/health` 未验证。")
  })
})

describe("presentation", () => {
  test("renders owner markdown and summary paths", () => {
    const report = {
      generatedAt: "2026-05-13T00:00:00.000Z",
      outputPath: "artifacts/go-live/go-live-report.json",
      status: "failed" as const,
      blockers: ["release environment 未锁定。"],
      blockerDetails: [
        {
          code: "release-environment-missing",
          message: "release environment 未锁定。",
          category: "release-input",
          defaultOwner: "发布负责人",
          milestoneId: "M2",
          envKeys: ["ELYSIAN_GO_LIVE_ENVIRONMENT"],
        },
      ],
      recommendedActions: [],
      nextMilestone: "M2",
      summary: {
        sourceBranch: "dev",
        targetBranch: "main",
        releaseCommit: "1134dcf",
        releaseTag: "v0.3.0",
        releasePr: null,
        releaseEnvironment: null,
        migrationList: [],
        tenantImpact: false,
        checkPassed: true,
        buildVuePassed: true,
        smokeFullPassed: true,
        serverImageVerifyPassed: true,
        tenantFullPassed: false,
        backupReady: false,
        releaseRolesReady: true,
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
    }
    const bundle = buildOwnerBundles(report, "artifacts/go-live/handoffs")[0]

    expect(bundle).toBeDefined()
    if (!bundle) {
      throw new Error("Expected release coordinator bundle")
    }

    expect(renderOwnerBundleMarkdown(bundle, report)).toContain(
      "# Go-live Handoff - 发布负责人",
    )
    expect(renderOwnerBundleMarkdown(bundle, report)).toContain(
      "ELYSIAN_GO_LIVE_ENVIRONMENT=",
    )
    expect(
      renderSummaryMarkdown({
        generatedAt: "2026-05-13T00:00:00.000Z",
        reportPath: "artifacts/go-live/go-live-report.json",
        outputPath: "artifacts/go-live/go-live-handoff-report.json",
        summaryPath: "artifacts/go-live/go-live-handoff-summary.md",
        envTemplatePath: "artifacts/go-live/go-live-input.prefill.env",
        bundleDir: "artifacts/go-live/handoffs",
        status: "failed",
        nextMilestone: "M2",
        ownerBundles: [bundle],
      }),
    ).toContain("### Go-live Handoff")
  })
})

describe("run", () => {
  beforeEach(() => {
    process.env.ELYSIAN_GO_LIVE_REPORT_PATH = undefined
    process.env.ELYSIAN_GO_LIVE_HANDOFF_REPORT_PATH = undefined
    process.env.ELYSIAN_GO_LIVE_HANDOFF_SUMMARY_PATH = undefined
    process.env.ELYSIAN_GO_LIVE_HANDOFF_ENV_PATH = undefined
    process.env.ELYSIAN_GO_LIVE_HANDOFF_DIR = undefined
  })

  test("writes prefilled handoff artifacts from go-live report", async () => {
    const paths = await createReportFixture("failed")

    const result = await runHandoffProcess(paths)

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("[go-live-handoff] report:")

    const handoffReport = JSON.parse(
      await readFile(paths.handoffPath, "utf8"),
    ) as {
      status: string
      nextMilestone: string | null
      ownerBundles: Array<{ id: string; blockerCount: number }>
    }
    expect(handoffReport.status).toBe("failed")
    expect(handoffReport.nextMilestone).toBe("M2")
    expect(handoffReport.ownerBundles).toHaveLength(3)

    const envTemplate = await readFile(paths.envTemplatePath, "utf8")
    expect(envTemplate).toContain("# 发布元数据")
    expect(envTemplate).toContain("ELYSIAN_GO_LIVE_RELEASE_COMMIT=1134dcf")
    expect(envTemplate).toContain(
      "ELYSIAN_GO_LIVE_MIGRATIONS=0001_auth_rbac,0002_customer",
    )

    const releaseMarkdown = await readFile(
      join(paths.bundleDir, "release-coordinator.md"),
      "utf8",
    )
    expect(releaseMarkdown).toContain("release environment 未锁定。")
    expect(releaseMarkdown).toContain("ELYSIAN_GO_LIVE_ENVIRONMENT=")

    const environmentMarkdown = await readFile(
      join(paths.bundleDir, "environment-dba.md"),
      "utf8",
    )
    expect(environmentMarkdown).toContain(
      "database backup / restore evidence 缺失。",
    )
    expect(environmentMarkdown).toContain("发布后 `/health` 未验证。")
  })

  test("fails fast when the go-live report is malformed", async () => {
    const outputDir = await mkdtemp(
      join(tmpdir(), "elysian-go-live-handoff-bad-"),
    )
    const paths = {
      reportPath: join(outputDir, "go-live-report.json"),
      handoffPath: join(outputDir, "go-live-handoff-report.json"),
      summaryPath: join(outputDir, "go-live-handoff-summary.md"),
      envTemplatePath: join(outputDir, "go-live-input.prefill.env"),
      bundleDir: join(outputDir, "handoffs"),
    }
    await writeFile(
      paths.reportPath,
      JSON.stringify(
        {
          status: "unknown",
          recommendedActions: [],
          summary: {
            sourceBranch: "dev",
            targetBranch: "main",
            tenantImpact: false,
          },
        },
        null,
        2,
      ),
      "utf8",
    )

    const result = await runHandoffProcess(paths)

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain("Invalid go-live report")
  })
})
