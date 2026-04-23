import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { renderGateSummaryMarkdown, run } from "./e2e-smoke-phase-exit-gate"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_PATH = ""
  process.exitCode = 0
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("e2e-smoke-phase-exit-gate", () => {
  test("passes when evidence is qualified", async () => {
    const dir = await createTempDir("elysian-phase-gate-pass-")
    const evidencePath = join(dir, "e2e-smoke-stability-evidence.json")
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_PATH = evidencePath

    await writeFile(
      evidencePath,
      JSON.stringify({
        generatedAt: "2026-04-23T00:00:00.000Z",
        windowSize: 5,
        totalSnapshots: 5,
        selectedWindowRuns: 5,
        hasMinimumRuns: true,
        failedGateCount: 0,
        maxConsecutiveFailedGates: 0,
        recoveredByRetryCount: 1,
        systemicBlockerDetected: false,
        qualifiedForPhaseTransition: true,
        recommendation: "candidate_for_next_phase",
        topRunIds: ["8005", "8004", "8003", "8002", "8001"],
      }),
      "utf8",
    )

    const report = await run()
    expect(report.status).toBe("passed")
    expect(report.summary.hasMinimumRuns).toBeTrue()
  })

  test("fails when evidence is not qualified", async () => {
    const dir = await createTempDir("elysian-phase-gate-fail-")
    const evidencePath = join(dir, "e2e-smoke-stability-evidence.json")
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_PATH = evidencePath

    await writeFile(
      evidencePath,
      JSON.stringify({
        generatedAt: "2026-04-23T00:00:00.000Z",
        windowSize: 5,
        totalSnapshots: 3,
        selectedWindowRuns: 3,
        hasMinimumRuns: false,
        failedGateCount: 2,
        maxConsecutiveFailedGates: 2,
        recoveredByRetryCount: 0,
        systemicBlockerDetected: true,
        qualifiedForPhaseTransition: false,
        recommendation: "hold_phase6a",
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
      generatedAt: "2026-04-23T00:00:00.000Z",
      evidencePath: "/tmp/evidence.json",
      status: "failed",
      conclusion: "failed",
      summary: {
        windowSize: 5,
        selectedWindowRuns: 3,
        hasMinimumRuns: false,
        systemicBlockerDetected: true,
        qualifiedForPhaseTransition: false,
        recommendation: "hold_phase6a",
      },
      recommendedActions: ["a", "b"],
    })

    expect(markdown).toContain("### Phase Exit Gate")
    expect(markdown).toContain("- status: `failed`")
    expect(markdown).toContain("- recommendation: `hold_phase6a`")
  })
})
