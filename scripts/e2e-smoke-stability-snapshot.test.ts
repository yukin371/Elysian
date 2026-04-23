import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run } from "./e2e-smoke-stability-snapshot"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_SMOKE_REPORT_DIR = ""
  process.env.GITHUB_SHA = ""
  process.env.GITHUB_RUN_ID = ""
  process.env.GITHUB_RUN_NUMBER = ""
  process.env.GITHUB_EVENT_NAME = ""
  process.env.GITHUB_REF = ""
})

const createTempSmokeDir = async () => {
  const dir = await mkdtemp(join(tmpdir(), "elysian-smoke-stability-"))
  tempDirs.push(dir)
  process.env.ELYSIAN_SMOKE_REPORT_DIR = dir
  return dir
}

describe("e2e-smoke-stability-snapshot", () => {
  test("creates snapshot from smoke gate and index reports", async () => {
    const dir = await createTempSmokeDir()
    await mkdir(dir, { recursive: true })
    process.env.GITHUB_SHA = "abc123"
    process.env.GITHUB_RUN_ID = "1001"
    process.env.GITHUB_RUN_NUMBER = "88"
    process.env.GITHUB_EVENT_NAME = "push"
    process.env.GITHUB_REF = "refs/heads/dev"

    await writeFile(
      join(dir, "e2e-smoke-reports-gate.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T00:00:00.000Z",
        indexPath: join(dir, "e2e-smoke-reports-index.json"),
        status: "passed",
        conclusion: "Smoke reports gate passed.",
      }),
      "utf8",
    )
    await writeFile(
      join(dir, "e2e-smoke-reports-index.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T00:00:00.000Z",
        reportDir: dir,
        finalStatus: "passed",
        recoveredByRetry: true,
        attempts: [
          {
            attempt: "attempt1",
            reportPath: "e2e-smoke-report-attempt1.json",
            diagnosisPath: "e2e-smoke-diagnosis-attempt1.json",
            status: "failed",
            failureCategory: "dependency",
            lastStage: "module_readiness",
            shouldRetry: true,
          },
          {
            attempt: "attempt2",
            reportPath: "e2e-smoke-report-attempt2.json",
            diagnosisPath: "e2e-smoke-diagnosis-attempt2.json",
            status: "passed",
            failureCategory: null,
            lastStage: "customer_verify_deleted",
            shouldRetry: false,
          },
        ],
      }),
      "utf8",
    )

    const snapshot = await run()
    expect(snapshot.gateStatus).toBe("passed")
    expect(snapshot.smokeFinalStatus).toBe("passed")
    expect(snapshot.recoveredByRetry).toBeTrue()
    expect(snapshot.attempts).toBe(2)
    expect(snapshot.gitSha).toBe("abc123")
    expect(snapshot.notes).toEqual([])

    const snapshotRaw = await readFile(
      join(dir, "e2e-smoke-stability-snapshot.json"),
      "utf8",
    )
    const snapshotFile = JSON.parse(snapshotRaw) as {
      gateStatus: "passed" | "failed" | "unknown"
      smokeFinalStatus: "passed" | "failed" | null
      attempts: number | null
    }
    expect(snapshotFile.gateStatus).toBe("passed")
    expect(snapshotFile.smokeFinalStatus).toBe("passed")
    expect(snapshotFile.attempts).toBe(2)
  })

  test("creates unknown snapshot with notes when reports are missing", async () => {
    const dir = await createTempSmokeDir()
    const snapshot = await run()

    expect(snapshot.gateStatus).toBe("unknown")
    expect(snapshot.smokeFinalStatus).toBeNull()
    expect(snapshot.recoveredByRetry).toBeNull()
    expect(snapshot.attempts).toBeNull()
    expect(snapshot.gateConclusion).toBeNull()
    expect(snapshot.notes).toEqual([
      "Missing smoke gate report.",
      "Missing smoke index report.",
    ])

    const snapshotRaw = await readFile(
      join(dir, "e2e-smoke-stability-snapshot.json"),
      "utf8",
    )
    const snapshotFile = JSON.parse(snapshotRaw) as {
      reportDir: string
      gateStatus: "passed" | "failed" | "unknown"
      notes: string[]
    }
    expect(snapshotFile.reportDir).toBe(dir)
    expect(snapshotFile.gateStatus).toBe("unknown")
    expect(snapshotFile.notes).toHaveLength(2)
  })
})
