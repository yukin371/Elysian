import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { renderReleaseSummaryMarkdown, run } from "./tenant-release-report"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }

  for (const key of Object.keys(process.env)) {
    if (key.startsWith("ELYSIAN_TENANT_RELEASE_")) {
      process.env[key] = ""
    }
  }
  process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH = ""
  process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR = ""
  process.exitCode = 0
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

const writeEvidence = async (dir: string, qualifiedForNextStep: boolean) => {
  const evidencePath = join(dir, "e2e-tenant-stability-evidence.json")
  await writeFile(
    evidencePath,
    JSON.stringify({
      generatedAt: "2026-04-24T00:00:00.000Z",
      windowSize: 5,
      selectedWindowRuns: 5,
      hasMinimumRuns: true,
      failedRunCount: qualifiedForNextStep ? 0 : 1,
      maxConsecutiveFailedRuns: qualifiedForNextStep ? 0 : 1,
      systemicBlockerDetected: !qualifiedForNextStep,
      qualifiedForNextStep,
      recommendation: qualifiedForNextStep
        ? "candidate_for_next_step"
        : "continue_observation",
      topRunIds: ["9005", "9004", "9003", "9002", "9001"],
    }),
    "utf8",
  )
  await writeFile(
    join(dir, "e2e-tenant-upgrade-decision.md"),
    "# decision\n",
    "utf8",
  )
  return evidencePath
}

const setPassingReleaseEnv = (dir: string) => {
  process.env.ELYSIAN_TENANT_RELEASE_REPORT_PATH = join(
    dir,
    "tenant-release-report.json",
  )
  process.env.ELYSIAN_TENANT_RELEASE_DECISION_PATH = join(
    dir,
    "e2e-tenant-upgrade-decision.md",
  )
  process.env.ELYSIAN_TENANT_RELEASE_GIT_STATUS_OUTPUT = ""
  process.env.ELYSIAN_TENANT_RELEASE_HEAD_MATCHES_WINDOW = "true"
  process.env.ELYSIAN_TENANT_RELEASE_DOCS_SYNCED = "true"
  process.env.ELYSIAN_TENANT_RELEASE_ROLLBACK_PREPARED = "true"
  process.env.ELYSIAN_TENANT_RELEASE_DATABASE_ROLE_CONFIRMED = "true"
  process.env.ELYSIAN_TENANT_RELEASE_BACKUP_READY = "true"
  process.env.ELYSIAN_TENANT_RELEASE_CHECK_PASSED = "true"
  process.env.ELYSIAN_TENANT_RELEASE_BUILD_VUE_PASSED = "true"
  process.env.ELYSIAN_TENANT_RELEASE_TENANT_FULL_PASSED = "true"
  process.env.ELYSIAN_TENANT_RELEASE_DEFAULT_TENANT_LOGIN_VERIFIED = "true"
  process.env.ELYSIAN_TENANT_RELEASE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED = "true"
  process.env.ELYSIAN_TENANT_RELEASE_TENANT_ADMIN_DENIED_VERIFIED = "true"
  process.env.ELYSIAN_TENANT_RELEASE_NON_DEFAULT_TENANT_LOGIN_VERIFIED = "true"
  process.env.ELYSIAN_TENANT_RELEASE_CROSS_TENANT_ISOLATION_VERIFIED = "true"
}

describe("tenant-release-report", () => {
  test("passes when release rehearsal inputs are fully satisfied", async () => {
    const dir = await createTempDir("elysian-tenant-release-report-pass-")
    const evidencePath = await writeEvidence(dir, true)
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH = evidencePath
    setPassingReleaseEnv(dir)

    const report = await run()

    expect(report.status).toBe("passed")
    expect(report.blockers).toEqual([])
    expect(report.summary.gitWorktreeClean).toBeTrue()

    const savedReport = JSON.parse(
      await readFile(join(dir, "tenant-release-report.json"), "utf8"),
    ) as { status: string }
    expect(savedReport.status).toBe("passed")
  })

  test("fails when evidence or manual checkpoints are incomplete", async () => {
    const dir = await createTempDir("elysian-tenant-release-report-fail-")
    const evidencePath = await writeEvidence(dir, false)
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH = evidencePath
    setPassingReleaseEnv(dir)
    process.env.ELYSIAN_TENANT_RELEASE_DOCS_SYNCED = "false"
    process.env.ELYSIAN_TENANT_RELEASE_GIT_STATUS_OUTPUT = " M docs/roadmap.md"

    const report = await run()

    expect(report.status).toBe("failed")
    expect(report.blockers).toContain(
      "tenant 稳定性结论尚未达到 candidate_for_next_step。",
    )
    expect(report.blockers).toContain(
      "roadmap / PROJECT_PROFILE / plans 未确认同步。",
    )
    expect(report.blockers).toContain("工作区不干净，存在未收口改动。")
  })

  test("renders markdown summary", () => {
    const markdown = renderReleaseSummaryMarkdown({
      generatedAt: "2026-04-24T00:00:00.000Z",
      evidencePath: "/tmp/evidence.json",
      decisionPath: "/tmp/decision.md",
      outputPath: "/tmp/report.json",
      metadata: {
        releaseCommit: "abc123",
        releasePr: "12",
        releaseEnvironment: "staging",
        migrationList: ["0009_tenant_id_columns.sql"],
        tenantInitCodes: ["acme"],
        defaultSeedRequired: false,
        gitStatusOutput: "",
      },
      summary: {
        sourceBranch: "dev",
        targetBranch: "main",
        releaseEnvironment: "staging",
        gitWorktreeClean: true,
        headMatchesObservationWindow: true,
        docsSynced: true,
        rollbackPrepared: true,
        databaseRoleConfirmed: true,
        backupReady: true,
        checkPassed: true,
        buildVuePassed: true,
        tenantFullPassed: true,
        defaultTenantLoginVerified: true,
        superAdminTenantAccessVerified: true,
        tenantAdminDeniedVerified: true,
        nonDefaultTenantLoginVerified: true,
        crossTenantIsolationVerified: true,
        qualifiedForNextStep: true,
        recommendation: "candidate_for_next_step",
      },
      status: "passed",
      blockers: [],
      recommendedActions: ["归档结论"],
    })

    expect(markdown).toContain("### Tenant Release Rehearsal")
    expect(markdown).toContain("- status: `passed`")
    expect(markdown).toContain("- blockers: `0`")
  })

  test("falls back to evidence output dir when explicit evidence path is absent", async () => {
    const dir = await createTempDir("elysian-tenant-release-report-output-dir-")
    await writeEvidence(dir, true)
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR = dir
    setPassingReleaseEnv(dir)

    const report = await run()

    expect(report.status).toBe("passed")
    expect(report.evidencePath).toBe(
      join(dir, "e2e-tenant-stability-evidence.json"),
    )
    expect(report.decisionPath).toBe(
      join(dir, "e2e-tenant-upgrade-decision.md"),
    )
  })
})
