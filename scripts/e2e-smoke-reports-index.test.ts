import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  buildGitHubOutputLines,
  renderSmokeIndexSummaryMarkdown,
  run,
} from "./e2e-smoke-reports-index"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_SMOKE_REPORT_DIR = undefined
})

const createTempSmokeDir = async () => {
  const dir = await mkdtemp(join(tmpdir(), "elysian-smoke-index-"))
  tempDirs.push(dir)
  process.env.ELYSIAN_SMOKE_REPORT_DIR = dir
  return dir
}

describe("e2e-smoke-reports-index", () => {
  test("creates index for a recovered retry flow", async () => {
    const dir = await createTempSmokeDir()
    await mkdir(dir, { recursive: true })

    await writeFile(
      join(dir, "e2e-smoke-report-attempt1.json"),
      JSON.stringify({
        generatedAt: "2026-04-22T00:00:00.000Z",
        status: "failed",
        baseUrl: "http://127.0.0.1:3100",
        durationMs: 1000,
        lastStage: "module_readiness",
        failureCategory: "dependency",
        failureMessage: "timed out",
      }),
      "utf8",
    )
    await writeFile(
      join(dir, "e2e-smoke-diagnosis-attempt1.json"),
      JSON.stringify({
        generatedAt: "2026-04-22T00:00:01.000Z",
        sourceReportPath: "e2e-smoke-report-attempt1.json",
        status: "failed",
        failureCategory: "dependency",
        lastStage: "module_readiness",
        conclusion: "failed",
        retryRecommendation: {
          shouldRetry: true,
          reason: "transient",
        },
        recommendedActions: ["retry"],
      }),
      "utf8",
    )
    await writeFile(
      join(dir, "e2e-smoke-report-attempt2.json"),
      JSON.stringify({
        generatedAt: "2026-04-22T00:00:02.000Z",
        status: "passed",
        baseUrl: "http://127.0.0.1:3100",
        durationMs: 900,
        lastStage: "customer_verify_deleted",
        failureCategory: null,
        failureMessage: null,
      }),
      "utf8",
    )

    await run()

    const indexRaw = await readFile(
      join(dir, "e2e-smoke-reports-index.json"),
      "utf8",
    )
    const index = JSON.parse(indexRaw) as {
      finalStatus: "passed" | "failed"
      recoveredByRetry: boolean
      attempts: Array<{
        attempt: "attempt1" | "attempt2"
        status: "passed" | "failed"
      }>
    }

    expect(index.finalStatus).toBe("passed")
    expect(index.recoveredByRetry).toBeTrue()
    expect(index.attempts).toHaveLength(2)
    expect(index.attempts[0]).toMatchObject({
      attempt: "attempt1",
      status: "failed",
      shouldRetry: true,
      diagnosisPath: "e2e-smoke-diagnosis-attempt1.json",
    })
    expect(index.attempts[1]).toMatchObject({
      attempt: "attempt2",
      status: "passed",
      shouldRetry: null,
      diagnosisPath: null,
    })
  })

  test("renders summary markdown and github output lines", () => {
    const summary = renderSmokeIndexSummaryMarkdown({
      generatedAt: "2026-04-22T00:00:00.000Z",
      reportDir: "/tmp",
      finalStatus: "passed",
      recoveredByRetry: true,
      attempts: [
        {
          attempt: "attempt1",
          reportPath: "a1.json",
          diagnosisPath: "d1.json",
          status: "failed",
          failureCategory: "dependency",
          lastStage: "module_readiness",
          shouldRetry: true,
        },
        {
          attempt: "attempt2",
          reportPath: "a2.json",
          diagnosisPath: "d2.json",
          status: "passed",
          failureCategory: null,
          lastStage: "customer_verify_deleted",
          shouldRetry: false,
        },
      ],
    })
    expect(summary).toContain("### E2E Smoke Index")
    expect(summary).toContain("- finalStatus: `passed`")
    expect(summary).toContain("- recoveredByRetry: `true`")

    expect(
      buildGitHubOutputLines({
        generatedAt: "2026-04-22T00:00:00.000Z",
        reportDir: "/tmp",
        finalStatus: "passed",
        recoveredByRetry: true,
        attempts: [
          {
            attempt: "attempt1",
            reportPath: "a1.json",
            diagnosisPath: "d1.json",
            status: "failed",
            failureCategory: "dependency",
            lastStage: "module_readiness",
            shouldRetry: true,
          },
        ],
      }),
    ).toEqual([
      "smoke_final_status=passed",
      "smoke_recovered_by_retry=true",
      "smoke_attempt_count=1",
    ])
  })
})
