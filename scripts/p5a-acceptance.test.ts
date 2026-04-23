import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run } from "./p5a-acceptance"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.exitCode = 0
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("p5a-acceptance", () => {
  test("runs corpus and replay/generator as a single acceptance flow", async () => {
    const reportDir = await createTempDir("elysian-p5a-acceptance-report-")
    const outputDir = await createTempDir("elysian-p5a-acceptance-output-")

    const report = await run({
      reportDir,
      outputDir,
    })

    expect(report.status).toBe("passed")
    expect(report.steps.corpus).toBe("passed")
    expect(report.steps.replay).toBe("passed")
    expect(report.steps.generator).toBe("passed")

    const acceptanceReport = JSON.parse(
      await readFile(join(reportDir, "p5a-acceptance-report.json"), "utf8"),
    ) as {
      status: string
      outputs: { generatedSchemaArtifactPath: string }
    }

    expect(acceptanceReport.status).toBe("passed")
    expect(acceptanceReport.outputs.generatedSchemaArtifactPath).toContain(
      "supplier.schema.ts",
    )

    const generatedSchemaArtifact = await readFile(
      join(outputDir, "modules", "supplier", "supplier.schema.ts"),
      "utf8",
    )

    expect(generatedSchemaArtifact).toContain(
      "export const supplierModuleSchema",
    )
  })
})
