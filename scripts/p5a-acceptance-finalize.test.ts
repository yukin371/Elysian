import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run } from "./p5a-acceptance-finalize"

const tempDirs: string[] = []
const envKeys = ["ELYSIAN_REPORT_DIR"] as const
const envSnapshot = new Map<string, string | undefined>()

for (const key of envKeys) {
  envSnapshot.set(key, process.env[key])
}

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }

  for (const key of envKeys) {
    const value = envSnapshot.get(key)
    if (value === undefined) {
      delete process.env[key]
      continue
    }
    process.env[key] = value
  }

  process.exitCode = 0
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("p5a-acceptance-finalize", () => {
  test("runs acceptance and gate in sequence", async () => {
    const reportDir = await createTempDir("elysian-p5a-acceptance-finalize-")
    process.env.ELYSIAN_REPORT_DIR = reportDir

    const report = await run()

    expect(report.status).toBe("passed")
    expect(report.steps.acceptance).toBe("passed")
    expect(report.steps.gate).toBe("passed")

    const acceptanceReport = JSON.parse(
      await readFile(report.outputs.acceptanceReportPath, "utf8"),
    ) as { status: string; cases: Array<{ caseId: string }> }
    const gateReport = JSON.parse(
      await readFile(report.outputs.gateReportPath, "utf8"),
    ) as { status: string; summary: { caseCount: number } }

    expect(acceptanceReport.status).toBe("passed")
    expect(acceptanceReport.cases).toHaveLength(3)
    expect(gateReport.status).toBe("passed")
    expect(gateReport.summary.caseCount).toBe(3)
  })
})
