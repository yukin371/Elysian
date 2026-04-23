import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  buildGitHubOutputLines,
  renderGateSummaryMarkdown,
  run,
} from "./e2e-smoke-reports-gate"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_SMOKE_REPORT_DIR = ""
  process.env.ELYSIAN_SMOKE_GATE_ALLOW_RECOVERED_BY_RETRY = ""
  process.env.ELYSIAN_SMOKE_GATE_MAX_ATTEMPTS = ""
})

const createTempSmokeDir = async () => {
  const dir = await mkdtemp(join(tmpdir(), "elysian-smoke-gate-"))
  tempDirs.push(dir)
  process.env.ELYSIAN_SMOKE_REPORT_DIR = dir
  return dir
}

describe("e2e-smoke-reports-gate", () => {
  test("passes when finalStatus is passed and recovery is allowed", async () => {
    const dir = await createTempSmokeDir()
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
            reportPath: "r1.json",
            diagnosisPath: "d1.json",
            status: "failed",
            failureCategory: "dependency",
            lastStage: "module_readiness",
            shouldRetry: true,
          },
          {
            attempt: "attempt2",
            reportPath: "r2.json",
            diagnosisPath: "d2.json",
            status: "passed",
            failureCategory: null,
            lastStage: "customer_verify_deleted",
            shouldRetry: false,
          },
        ],
      }),
      "utf8",
    )

    const report = await run()

    const gateRaw = await readFile(
      join(dir, "e2e-smoke-reports-gate.json"),
      "utf8",
    )
    const gate = JSON.parse(gateRaw) as { status: "passed" | "failed" }
    expect(report.status).toBe("passed")
    expect(gate.status).toBe("passed")
  })

  test("fails gate when recovery is disallowed", async () => {
    const dir = await createTempSmokeDir()
    process.env.ELYSIAN_SMOKE_GATE_ALLOW_RECOVERED_BY_RETRY = "false"
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
            reportPath: "r1.json",
            diagnosisPath: "d1.json",
            status: "failed",
            failureCategory: "dependency",
            lastStage: "module_readiness",
            shouldRetry: true,
          },
          {
            attempt: "attempt2",
            reportPath: "r2.json",
            diagnosisPath: "d2.json",
            status: "passed",
            failureCategory: null,
            lastStage: "customer_verify_deleted",
            shouldRetry: false,
          },
        ],
      }),
      "utf8",
    )

    const report = await run()

    const gateRaw = await readFile(
      join(dir, "e2e-smoke-reports-gate.json"),
      "utf8",
    )
    const gate = JSON.parse(gateRaw) as { status: "passed" | "failed" }
    expect(report.status).toBe("failed")
    expect(gate.status).toBe("failed")
  })

  test("fails gate when attempts exceed maxAttempts", async () => {
    const dir = await createTempSmokeDir()
    process.env.ELYSIAN_SMOKE_GATE_MAX_ATTEMPTS = "1"
    await writeFile(
      join(dir, "e2e-smoke-reports-index.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T00:00:00.000Z",
        reportDir: dir,
        finalStatus: "passed",
        recoveredByRetry: false,
        attempts: [
          {
            attempt: "attempt1",
            reportPath: "r1.json",
            diagnosisPath: "d1.json",
            status: "failed",
            failureCategory: "dependency",
            lastStage: "module_readiness",
            shouldRetry: true,
          },
          {
            attempt: "attempt2",
            reportPath: "r2.json",
            diagnosisPath: "d2.json",
            status: "passed",
            failureCategory: null,
            lastStage: "customer_verify_deleted",
            shouldRetry: false,
          },
        ],
      }),
      "utf8",
    )

    const report = await run()
    expect(report.status).toBe("failed")
    expect(report.summary.attempts).toBe(2)
    expect(report.policy.maxAttempts).toBe(1)
  })

  test("throws on invalid boolean policy input", async () => {
    const dir = await createTempSmokeDir()
    process.env.ELYSIAN_SMOKE_GATE_ALLOW_RECOVERED_BY_RETRY = "yes"
    await writeFile(
      join(dir, "e2e-smoke-reports-index.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T00:00:00.000Z",
        reportDir: dir,
        finalStatus: "passed",
        recoveredByRetry: false,
        attempts: [
          {
            attempt: "attempt1",
            reportPath: "r1.json",
            diagnosisPath: "d1.json",
            status: "passed",
            failureCategory: null,
            lastStage: "customer_verify_deleted",
            shouldRetry: false,
          },
        ],
      }),
      "utf8",
    )

    await expect(run()).rejects.toThrow(
      "Invalid ELYSIAN_SMOKE_GATE_ALLOW_RECOVERED_BY_RETRY: yes",
    )
  })

  test("renders summary markdown and github output lines", () => {
    const summary = renderGateSummaryMarkdown({
      generatedAt: "2026-04-23T00:00:00.000Z",
      indexPath: "/tmp/e2e-smoke-reports-index.json",
      status: "passed",
      policy: {
        allowRecoveredByRetry: true,
        maxAttempts: 2,
        policyInputs: {
          allowRecoveredByRetryRaw: null,
          maxAttemptsRaw: null,
          indexPathRaw: null,
        },
      },
      summary: {
        finalStatus: "passed",
        recoveredByRetry: true,
        attempts: 2,
      },
      conclusion: "Smoke reports gate passed.",
      recommendedActions: ["No action required."],
    })
    expect(summary).toContain("### E2E Smoke Gate")
    expect(summary).toContain("- status: `passed`")
    expect(summary).toContain("- recoveredByRetry: `true`")

    expect(
      buildGitHubOutputLines({
        generatedAt: "2026-04-23T00:00:00.000Z",
        indexPath: "/tmp/e2e-smoke-reports-index.json",
        status: "failed",
        policy: {
          allowRecoveredByRetry: false,
          maxAttempts: 2,
          policyInputs: {
            allowRecoveredByRetryRaw: "false",
            maxAttemptsRaw: "2",
            indexPathRaw: null,
          },
        },
        summary: {
          finalStatus: "failed",
          recoveredByRetry: false,
          attempts: 2,
        },
        conclusion: "Smoke reports gate failed.",
        recommendedActions: ["Fix it."],
      }),
    ).toEqual([
      "smoke_gate_status=failed",
      "smoke_gate_final_status=failed",
      "smoke_gate_recovered_by_retry=false",
      "smoke_gate_attempts=2",
    ])
  })
})
