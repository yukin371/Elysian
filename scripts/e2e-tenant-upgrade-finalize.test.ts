import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run } from "./e2e-tenant-upgrade-finalize"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_INPUT_DIR = ""
  process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR = ""
  process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH = ""
  process.env.ELYSIAN_TENANT_UPGRADE_DECISION_REPORT_PATH = ""
  process.env.ELYSIAN_TENANT_STABILITY_WINDOW_SIZE = ""
  process.exitCode = 0
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("e2e-tenant-upgrade-finalize", () => {
  test("runs evidence, decision, and gate in sequence", async () => {
    const inputDir = await createTempDir("elysian-tenant-finalize-input-")
    const outputDir = await createTempDir("elysian-tenant-finalize-output-")
    const decisionPath = join(outputDir, "tenant-upgrade-decision.md")

    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_INPUT_DIR = inputDir
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR = outputDir
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH = join(
      outputDir,
      "e2e-tenant-stability-evidence.json",
    )
    process.env.ELYSIAN_TENANT_UPGRADE_DECISION_REPORT_PATH = decisionPath
    process.env.ELYSIAN_TENANT_STABILITY_WINDOW_SIZE = "3"

    await mkdir(join(inputDir, "run1"), { recursive: true })
    await mkdir(join(inputDir, "run2"), { recursive: true })
    await mkdir(join(inputDir, "run3"), { recursive: true })

    for (const [index, runId] of ["9203", "9202", "9201"].entries()) {
      await writeFile(
        join(inputDir, `run${index + 1}`, "e2e-tenant-stability-snapshot.json"),
        JSON.stringify({
          generatedAt: `2026-04-24T0${3 - index}:00:00.000Z`,
          githubRunId: runId,
          tenantE2eStatus: "passed",
          lastStage: "db_fk_constraint",
          failureCategory: null,
          durationMs: 3000,
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
