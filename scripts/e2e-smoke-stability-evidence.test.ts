import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  buildGitHubOutputLines,
  renderEvidenceSummaryMarkdown,
  run,
} from "./e2e-smoke-stability-evidence"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_INPUT_DIR = ""
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_OUTPUT_DIR = ""
  process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE = ""
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("e2e-smoke-stability-evidence", () => {
  test("builds evidence and qualifies for phase transition", async () => {
    const inputDir = await createTempDir("elysian-smoke-evidence-input-")
    const outputDir = await createTempDir("elysian-smoke-evidence-output-")
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_INPUT_DIR = inputDir
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_OUTPUT_DIR = outputDir
    process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE = "3"

    await mkdir(join(inputDir, "run1"), { recursive: true })
    await mkdir(join(inputDir, "run2"), { recursive: true })
    await mkdir(join(inputDir, "run3"), { recursive: true })
    await writeFile(
      join(inputDir, "run1", "e2e-smoke-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T10:00:00.000Z",
        githubRunId: "5003",
        gateStatus: "passed",
        smokeFinalStatus: "passed",
        recoveredByRetry: false,
        notes: [],
      }),
      "utf8",
    )
    await writeFile(
      join(inputDir, "run2", "e2e-smoke-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T09:00:00.000Z",
        githubRunId: "5002",
        gateStatus: "passed",
        smokeFinalStatus: "passed",
        recoveredByRetry: true,
        notes: [],
      }),
      "utf8",
    )
    await writeFile(
      join(inputDir, "run3", "e2e-smoke-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T08:00:00.000Z",
        githubRunId: "5001",
        gateStatus: "passed",
        smokeFinalStatus: "passed",
        recoveredByRetry: false,
        notes: [],
      }),
      "utf8",
    )

    const report = await run()
    expect(report.totalSnapshots).toBe(3)
    expect(report.selectedWindowRuns).toBe(3)
    expect(report.hasMinimumRuns).toBeTrue()
    expect(report.systemicBlockerDetected).toBeFalse()
    expect(report.qualifiedForPhaseTransition).toBeTrue()
    expect(report.recommendation).toBe("candidate_for_next_phase")
    expect(report.suggestedNextMainline).toBe(
      "phase6b_or_phase5_decision_required",
    )

    const outputRaw = await readFile(
      join(outputDir, "e2e-smoke-stability-evidence.json"),
      "utf8",
    )
    const output = JSON.parse(outputRaw) as { topRunIds: string[] }
    expect(output.topRunIds).toEqual(["5003", "5002", "5001"])
  })

  test("holds phase when systemic blocker exists", async () => {
    const inputDir = await createTempDir("elysian-smoke-evidence-block-input-")
    const outputDir = await createTempDir(
      "elysian-smoke-evidence-block-output-",
    )
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_INPUT_DIR = inputDir
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_OUTPUT_DIR = outputDir
    process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE = "3"

    await mkdir(join(inputDir, "run1"), { recursive: true })
    await mkdir(join(inputDir, "run2"), { recursive: true })
    await mkdir(join(inputDir, "run3"), { recursive: true })
    await writeFile(
      join(inputDir, "run1", "e2e-smoke-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T10:00:00.000Z",
        githubRunId: "5103",
        gateStatus: "failed",
        smokeFinalStatus: "failed",
        recoveredByRetry: false,
        notes: [],
      }),
      "utf8",
    )
    await writeFile(
      join(inputDir, "run2", "e2e-smoke-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T09:00:00.000Z",
        githubRunId: "5102",
        gateStatus: "failed",
        smokeFinalStatus: "failed",
        recoveredByRetry: false,
        notes: [],
      }),
      "utf8",
    )
    await writeFile(
      join(inputDir, "run3", "e2e-smoke-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T08:00:00.000Z",
        githubRunId: "5101",
        gateStatus: "passed",
        smokeFinalStatus: "passed",
        recoveredByRetry: false,
        notes: [],
      }),
      "utf8",
    )

    const report = await run()
    expect(report.hasMinimumRuns).toBeTrue()
    expect(report.failedGateCount).toBe(2)
    expect(report.maxConsecutiveFailedGates).toBe(2)
    expect(report.systemicBlockerDetected).toBeTrue()
    expect(report.qualifiedForPhaseTransition).toBeFalse()
    expect(report.recommendation).toBe("hold_phase6a")
    expect(report.suggestedNextMainline).toBeNull()
  })

  test("renders summary markdown and github output lines", () => {
    const summary = renderEvidenceSummaryMarkdown({
      generatedAt: "2026-04-23T00:00:00.000Z",
      inputDir: "/tmp/input",
      outputDir: "/tmp/output",
      windowSize: 5,
      totalSnapshots: 6,
      selectedWindowRuns: 5,
      hasMinimumRuns: true,
      failedGateCount: 0,
      maxConsecutiveFailedGates: 0,
      recoveredByRetryCount: 1,
      systemicBlockerDetected: false,
      qualifiedForPhaseTransition: true,
      recommendation: "candidate_for_next_phase",
      suggestedNextMainline: "phase6b_or_phase5_decision_required",
      topRunIds: ["a", "b"],
    })
    expect(summary).toContain("### E2E Smoke Stability Evidence")
    expect(summary).toContain("- recommendation: `candidate_for_next_phase`")

    expect(
      buildGitHubOutputLines({
        generatedAt: "2026-04-23T00:00:00.000Z",
        inputDir: "/tmp/input",
        outputDir: "/tmp/output",
        windowSize: 5,
        totalSnapshots: 4,
        selectedWindowRuns: 4,
        hasMinimumRuns: false,
        failedGateCount: 1,
        maxConsecutiveFailedGates: 1,
        recoveredByRetryCount: 2,
        systemicBlockerDetected: false,
        qualifiedForPhaseTransition: false,
        recommendation: "hold_phase6a",
        suggestedNextMainline: null,
        topRunIds: ["a"],
      }),
    ).toEqual([
      "smoke_evidence_total_snapshots=4",
      "smoke_evidence_window_size=5",
      "smoke_evidence_selected_runs=4",
      "smoke_evidence_has_minimum_runs=false",
      "smoke_evidence_systemic_blocker=false",
      "smoke_evidence_qualified=false",
      "smoke_evidence_recommendation=hold_phase6a",
    ])
  })
})
