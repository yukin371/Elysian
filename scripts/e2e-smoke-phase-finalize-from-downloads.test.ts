import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run } from "./e2e-smoke-phase-finalize-from-downloads"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_SMOKE_STABILITY_COLLECT_INPUT_DIR = ""
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

describe("e2e-smoke-phase-finalize-from-downloads", () => {
  test("collects snapshots and finalizes phase in one command", async () => {
    const downloadsDir = await createTempDir("elysian-phase-downloads-")
    const smokeDir = await createTempDir("elysian-phase-smoke-")
    const evidenceOutDir = await createTempDir("elysian-phase-evidence-out-")
    const decisionPath = join(evidenceOutDir, "phase-decision.md")

    process.env.ELYSIAN_SMOKE_STABILITY_COLLECT_INPUT_DIR = downloadsDir
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_INPUT_DIR = smokeDir
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_OUTPUT_DIR = evidenceOutDir
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_PATH = join(
      evidenceOutDir,
      "e2e-smoke-stability-evidence.json",
    )
    process.env.ELYSIAN_SMOKE_PHASE_DECISION_REPORT_PATH = decisionPath
    process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE = "3"

    await mkdir(join(downloadsDir, "r1"), { recursive: true })
    await mkdir(join(downloadsDir, "r2"), { recursive: true })
    await mkdir(join(downloadsDir, "r3"), { recursive: true })

    for (const [idx, runId] of ["9203", "9202", "9201"].entries()) {
      await writeFile(
        join(downloadsDir, `r${idx + 1}`, "e2e-smoke-stability-snapshot.json"),
        JSON.stringify({
          generatedAt: `2026-04-23T0${3 - idx}:00:00.000Z`,
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
    expect(report.steps.collect).toBe("passed")
    expect(report.steps.finalize).toBe("passed")
    expect(report.outputs.collectOutputDir).toBe(smokeDir)
  })
})
