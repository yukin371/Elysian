import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run } from "./e2e-tenant-stability-snapshot"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_TENANT_E2E_REPORT_DIR = ""
  process.env.ELYSIAN_TENANT_E2E_REPORT_PATH = ""
  process.env.ELYSIAN_TENANT_STABILITY_SNAPSHOT_PATH = ""
  process.env.GITHUB_SHA = ""
  process.env.GITHUB_RUN_ID = ""
  process.env.GITHUB_RUN_NUMBER = ""
  process.env.GITHUB_EVENT_NAME = ""
  process.env.GITHUB_REF = ""
})

const createTempTenantDir = async () => {
  const dir = await mkdtemp(join(tmpdir(), "elysian-tenant-stability-"))
  tempDirs.push(dir)
  process.env.ELYSIAN_TENANT_E2E_REPORT_DIR = dir
  return dir
}

describe("e2e-tenant-stability-snapshot", () => {
  test("creates snapshot from tenant e2e report", async () => {
    const dir = await createTempTenantDir()
    await mkdir(dir, { recursive: true })
    process.env.GITHUB_SHA = "tenant-sha"
    process.env.GITHUB_RUN_ID = "7001"
    process.env.GITHUB_RUN_NUMBER = "42"
    process.env.GITHUB_EVENT_NAME = "pull_request"
    process.env.GITHUB_REF = "refs/pull/3/head"

    await writeFile(
      join(dir, "e2e-tenant-report.json"),
      JSON.stringify({
        generatedAt: "2026-04-24T00:00:00.000Z",
        status: "passed",
        baseUrl: "http://127.0.0.1:31001",
        durationMs: 3021,
        lastStage: "db_fk_constraint",
        failureCategory: null,
        failureMessage: null,
        tenantCodes: {
          alpha: "tenant-alpha",
          beta: "tenant-beta",
        },
      }),
      "utf8",
    )

    const snapshot = await run()
    expect(snapshot.tenantE2eStatus).toBe("passed")
    expect(snapshot.lastStage).toBe("db_fk_constraint")
    expect(snapshot.failureCategory).toBeNull()
    expect(snapshot.durationMs).toBe(3021)
    expect(snapshot.gitSha).toBe("tenant-sha")
    expect(snapshot.notes).toEqual([])

    const snapshotRaw = await readFile(
      join(dir, "e2e-tenant-stability-snapshot.json"),
      "utf8",
    )
    const snapshotFile = JSON.parse(snapshotRaw) as {
      tenantE2eStatus: "passed" | "failed" | null
      lastStage: string | null
    }
    expect(snapshotFile.tenantE2eStatus).toBe("passed")
    expect(snapshotFile.lastStage).toBe("db_fk_constraint")
  })

  test("creates unknown snapshot with notes when tenant report is missing", async () => {
    const dir = await createTempTenantDir()
    const snapshot = await run()

    expect(snapshot.tenantE2eStatus).toBeNull()
    expect(snapshot.lastStage).toBeNull()
    expect(snapshot.failureCategory).toBeNull()
    expect(snapshot.durationMs).toBeNull()
    expect(snapshot.notes).toEqual(["Missing tenant e2e report."])

    const snapshotRaw = await readFile(
      join(dir, "e2e-tenant-stability-snapshot.json"),
      "utf8",
    )
    const snapshotFile = JSON.parse(snapshotRaw) as {
      reportDir: string
      notes: string[]
    }
    expect(snapshotFile.reportDir).toBe(dir)
    expect(snapshotFile.notes).toEqual(["Missing tenant e2e report."])
  })
})
