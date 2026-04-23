import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run } from "./e2e-smoke-phase-finalize"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_INPUT_DIR = ""
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_OUTPUT_DIR = ""
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_PATH = ""
  process.env.ELYSIAN_SMOKE_PHASE_DECISION_REPORT_PATH = ""
  process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE = ""
  process.exitCode = 0
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("e2e-smoke-phase-finalize", () => {
  test("runs evidence, decision, and gate in sequence", async () => {
    const inputDir = await createTempDir("elysian-phase-finalize-input-")
    const outputDir = await createTempDir("elysian-phase-finalize-output-")
    const decisionPath = join(outputDir, "phase-decision.md")

    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_INPUT_DIR = inputDir
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_OUTPUT_DIR = outputDir
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_PATH = join(
      outputDir,
      "e2e-smoke-stability-evidence.json",
    )
    process.env.ELYSIAN_SMOKE_PHASE_DECISION_REPORT_PATH = decisionPath
    process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE = "3"

    await mkdir(join(inputDir, "run1"), { recursive: true })
    await mkdir(join(inputDir, "run2"), { recursive: true })
    await mkdir(join(inputDir, "run3"), { recursive: true })

    for (const [index, runId] of ["9003", "9002", "9001"].entries()) {
      await writeFile(
        join(inputDir, `run${index + 1}`, "e2e-smoke-stability-snapshot.json"),
        JSON.stringify({
          generatedAt: `2026-04-23T0${3 - index}:00:00.000Z`,
          githubRunId: runId,
          gateStatus: "passed",
          smokeFinalStatus: "passed",
          recoveredByRetry: false,
          notes: [],
        }),
        "utf8",
      )
    }

    const report = await run()
    expect(report.status).toBe("passed")
    expect(report.steps.evidence).toBe("passed")
    expect(report.steps.decision).toBe("passed")
    expect(report.steps.gate).toBe("passed")
    expect(report.outputs.decisionPath).toBe(decisionPath)
  })
})
