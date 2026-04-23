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
  test("runs corpus and multiple replay/generator cases as a single acceptance flow", async () => {
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
    expect(report.cases).toHaveLength(3)
    expect(report.cases.map((item) => item.caseId)).toEqual([
      "manual-fix-supplier",
      "visitor-pass-ready",
      "service-ticket-ready",
    ])

    const acceptanceReport = JSON.parse(
      await readFile(join(reportDir, "p5a-acceptance-report.json"), "utf8"),
    ) as {
      status: string
      cases: Array<{ caseId: string; generatedSchemaArtifactPath?: string }>
    }

    expect(acceptanceReport.status).toBe("passed")
    expect(acceptanceReport.cases).toHaveLength(3)
    expect(acceptanceReport.cases[0]?.generatedSchemaArtifactPath).toContain(
      "supplier.schema.ts",
    )

    const supplierSchemaArtifact = await readFile(
      join(
        outputDir,
        "manual-fix-supplier",
        "modules",
        "supplier",
        "supplier.schema.ts",
      ),
      "utf8",
    )
    const visitorPassSchemaArtifact = await readFile(
      join(
        outputDir,
        "visitor-pass-ready",
        "modules",
        "visitorPass",
        "visitorPass.schema.ts",
      ),
      "utf8",
    )
    const serviceTicketSchemaArtifact = await readFile(
      join(
        outputDir,
        "service-ticket-ready",
        "modules",
        "serviceTicket",
        "serviceTicket.schema.ts",
      ),
      "utf8",
    )

    expect(supplierSchemaArtifact).toContain(
      "export const supplierModuleSchema",
    )
    expect(visitorPassSchemaArtifact).toContain(
      "export const visitorPassModuleSchema",
    )
    expect(serviceTicketSchemaArtifact).toContain(
      "export const serviceTicketModuleSchema",
    )
  })
})
