import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  renderDecisionMarkdown,
  run,
} from "./e2e-smoke-phase-transition-report"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_PATH = ""
  process.env.ELYSIAN_SMOKE_PHASE_DECISION_REPORT_PATH = ""
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("e2e-smoke-phase-transition-report", () => {
  test("generates decision markdown for qualified evidence", async () => {
    const dir = await createTempDir("elysian-phase-decision-")
    const evidencePath = join(dir, "e2e-smoke-stability-evidence.json")
    const outputPath = join(dir, "phase-decision.md")

    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_PATH = evidencePath
    process.env.ELYSIAN_SMOKE_PHASE_DECISION_REPORT_PATH = outputPath

    await writeFile(
      evidencePath,
      JSON.stringify({
        generatedAt: "2026-04-23T00:00:00.000Z",
        inputDir: "/tmp/input",
        outputDir: "/tmp/output",
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
        suggestedNextMainline: "phase6b_or_phase5_decision_required",
        topRunIds: ["7005", "7004", "7003", "7002", "7001"],
      }),
      "utf8",
    )

    const result = await run()
    expect(result.qualifiedForPhaseTransition).toBeTrue()
    expect(result.outputPath).toBe(outputPath)

    const markdown = await readFile(outputPath, "utf8")
    expect(markdown).toContain("是否达标：是")
    expect(markdown).toContain("建议主线：Phase 6B / Phase 5（待评审确认）")
    expect(markdown).toContain("runIds: 7005, 7004, 7003, 7002, 7001")
  })

  test("renders hold decision when evidence is not qualified", () => {
    const markdown = renderDecisionMarkdown({
      generatedAt: "2026-04-23T00:00:00.000Z",
      inputDir: "/tmp/input",
      outputDir: "/tmp/output",
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
      suggestedNextMainline: null,
      topRunIds: ["7103", "7102", "7101"],
    })

    expect(markdown).toContain("是否达标：否")
    expect(markdown).toContain("建议主线：继续 Phase 6A Round-2")
    expect(markdown).toContain("样本不足：仅 3 次，未达到窗口要求 5 次。")
    expect(markdown).toContain("存在系统性阻断：连续失败门禁次数达到 2。")
  })
})
