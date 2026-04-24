import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run } from "./e2e-tenant-upgrade-finalize-from-downloads"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_TENANT_STABILITY_COLLECT_INPUT_DIR = ""
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

describe("e2e-tenant-upgrade-finalize-from-downloads", () => {
  test("runs collect and finalize in sequence", async () => {
    const downloadsDir = await createTempDir("elysian-tenant-downloads-")
    const collectedDir = await createTempDir("elysian-tenant-collected-")
    const outputDir = await createTempDir("elysian-tenant-output-")

    process.env.ELYSIAN_TENANT_STABILITY_COLLECT_INPUT_DIR = downloadsDir
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_INPUT_DIR = collectedDir
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR = outputDir
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_PATH = join(
      outputDir,
      "e2e-tenant-stability-evidence.json",
    )
    process.env.ELYSIAN_TENANT_UPGRADE_DECISION_REPORT_PATH = join(
      outputDir,
      "tenant-upgrade-decision.md",
    )
    process.env.ELYSIAN_TENANT_STABILITY_WINDOW_SIZE = "2"

    await mkdir(join(downloadsDir, "run-a"), { recursive: true })
    await mkdir(join(downloadsDir, "run-b", "nested"), { recursive: true })
    await writeFile(
      join(downloadsDir, "run-a", "e2e-tenant-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-24T10:00:00.000Z",
        githubRunId: "9302",
        tenantE2eStatus: "passed",
        lastStage: "db_fk_constraint",
        failureCategory: null,
        durationMs: 3100,
        notes: [],
      }),
      "utf8",
    )
    await writeFile(
      join(
        downloadsDir,
        "run-b",
        "nested",
        "e2e-tenant-stability-snapshot.json",
      ),
      JSON.stringify({
        generatedAt: "2026-04-24T09:00:00.000Z",
        githubRunId: "9301",
        tenantE2eStatus: "passed",
        lastStage: "db_fk_constraint",
        failureCategory: null,
        durationMs: 3200,
        notes: [],
      }),
      "utf8",
    )

    const report = await run()
    expect(report.status).toBe("passed")
    expect(report.steps.collect).toBe("passed")
    expect(report.steps.finalize).toBe("passed")
    expect(report.outputs.collectOutputDir).toBe(collectedDir)
  })
})
