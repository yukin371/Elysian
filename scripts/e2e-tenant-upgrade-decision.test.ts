import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { renderDecisionMarkdown, run } from "./e2e-tenant-upgrade-decision"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH = ""
  process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR = ""
  process.env.ELYSIAN_TENANT_UPGRADE_DECISION_REPORT_PATH = ""
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("e2e-tenant-upgrade-decision", () => {
  test("generates decision markdown for qualified evidence", async () => {
    const dir = await createTempDir("elysian-tenant-upgrade-decision-")
    const evidencePath = join(dir, "e2e-tenant-stability-evidence.json")
    const outputPath = join(dir, "tenant-upgrade-decision.md")

    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH = evidencePath
    process.env.ELYSIAN_TENANT_UPGRADE_DECISION_REPORT_PATH = outputPath

    await writeFile(
      evidencePath,
      JSON.stringify({
        generatedAt: "2026-04-24T00:00:00.000Z",
        inputDir: "/tmp/input",
        outputDir: "/tmp/output",
        windowSize: 5,
        totalSnapshots: 5,
        selectedWindowRuns: 5,
        hasMinimumRuns: true,
        failedRunCount: 0,
        maxConsecutiveFailedRuns: 0,
        dependencyFailureCount: 1,
        environmentFailureCount: 0,
        systemicBlockerDetected: false,
        qualifiedForNextStep: true,
        recommendation: "candidate_for_next_step",
        topRunIds: ["9005", "9004", "9003", "9002", "9001"],
      }),
      "utf8",
    )

    const result = await run()
    expect(result.qualifiedForNextStep).toBeTrue()
    expect(result.outputPath).toBe(outputPath)

    const markdown = await readFile(outputPath, "utf8")
    expect(markdown).toContain("是否达标：是")
    expect(markdown).toContain("执行建议：可进入下一步升级执行")
    expect(markdown).toContain("runIds: 9005, 9004, 9003, 9002, 9001")
  })

  test("renders continue-observation decision when evidence is not qualified", () => {
    const markdown = renderDecisionMarkdown({
      generatedAt: "2026-04-24T00:00:00.000Z",
      inputDir: "/tmp/input",
      outputDir: "/tmp/output",
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
      topRunIds: ["9103", "9102", "9101"],
    })

    expect(markdown).toContain("是否达标：否")
    expect(markdown).toContain("执行建议：继续稳定性观察")
    expect(markdown).toContain("样本不足：仅 3 次，未达到窗口要求 5 次。")
    expect(markdown).toContain("存在系统性阻断：连续失败次数达到 2。")
  })

  test("falls back to evidence output dir when explicit evidence path is absent", async () => {
    const dir = await createTempDir(
      "elysian-tenant-upgrade-decision-output-dir-",
    )
    const outputPath = join(dir, "tenant-upgrade-decision.md")

    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR = dir
    process.env.ELYSIAN_TENANT_UPGRADE_DECISION_REPORT_PATH = outputPath

    await writeFile(
      join(dir, "e2e-tenant-stability-evidence.json"),
      JSON.stringify({
        generatedAt: "2026-04-24T00:00:00.000Z",
        inputDir: "/tmp/input",
        outputDir: dir,
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
        topRunIds: ["9205", "9204", "9203", "9202", "9201"],
      }),
      "utf8",
    )

    const result = await run()
    expect(result.evidencePath).toBe(
      join(dir, "e2e-tenant-stability-evidence.json"),
    )
    expect(result.outputPath).toBe(outputPath)
  })
})
