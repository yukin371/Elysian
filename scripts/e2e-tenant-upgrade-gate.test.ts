import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { renderGateSummaryMarkdown, run } from "./e2e-tenant-upgrade-gate"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH = ""
  process.exitCode = 0
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("e2e-tenant-upgrade-gate", () => {
  test("passes when evidence is qualified", async () => {
    const dir = await createTempDir("elysian-tenant-upgrade-gate-pass-")
    const evidencePath = join(dir, "e2e-tenant-stability-evidence.json")
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH = evidencePath

    await writeFile(
      evidencePath,
      JSON.stringify({
        generatedAt: "2026-04-24T00:00:00.000Z",
        windowSize: 5,
        totalSnapshots: 5,
        selectedWindowRuns: 5,
        hasMinimumRuns: true,
        failedRunCount: 0,
        maxConsecutiveFailedRuns: 0,
        dependencyFailureCount: 0,
        environmentFailureCount: 0,
        systemicBlockerDetected: false,
        qualifiedForNextStep: true,
        recommendation: "candidate_for_next_step",
        topRunIds: ["8005", "8004", "8003", "8002", "8001"],
      }),
      "utf8",
    )

    const report = await run()
    expect(report.status).toBe("passed")
    expect(report.summary.hasMinimumRuns).toBeTrue()
  })

  test("fails when evidence is not qualified", async () => {
    const dir = await createTempDir("elysian-tenant-upgrade-gate-fail-")
    const evidencePath = join(dir, "e2e-tenant-stability-evidence.json")
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH = evidencePath

    await writeFile(
      evidencePath,
      JSON.stringify({
        generatedAt: "2026-04-24T00:00:00.000Z",
        windowSize: 5,
        totalSnapshots: 3,
        selectedWindowRuns: 3,
        hasMinimumRuns: false,
        failedRunCount: 2,
        maxConsecutiveFailedRuns: 2,
        dependencyFailureCount: 1,
        environmentFailureCount: 1,
        systemicBlockerDetected: true,
        qualifiedForNextStep: false,
        recommendation: "continue_observation",
        topRunIds: ["8103", "8102", "8101"],
      }),
      "utf8",
    )

    const report = await run()
    expect(report.status).toBe("failed")
    expect(report.summary.systemicBlockerDetected).toBeTrue()
  })

  test("renders summary markdown", () => {
    const markdown = renderGateSummaryMarkdown({
      generatedAt: "2026-04-24T00:00:00.000Z",
      evidencePath: "/tmp/evidence.json",
      status: "failed",
      conclusion: "failed",
      summary: {
        windowSize: 5,
        selectedWindowRuns: 3,
        hasMinimumRuns: false,
        systemicBlockerDetected: true,
        qualifiedForNextStep: false,
        recommendation: "continue_observation",
      },
      recommendedActions: ["a", "b"],
    })

    expect(markdown).toContain("### Tenant Upgrade Gate")
    expect(markdown).toContain("- status: `failed`")
    expect(markdown).toContain("- recommendation: `continue_observation`")
  })
})
