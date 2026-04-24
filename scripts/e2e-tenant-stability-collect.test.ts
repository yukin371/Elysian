import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run } from "./e2e-tenant-stability-collect"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_TENANT_STABILITY_COLLECT_INPUT_DIR = ""
  process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_INPUT_DIR = ""
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("e2e-tenant-stability-collect", () => {
  test("collects snapshots into normalized run folders", async () => {
    const inputDir = await createTempDir("elysian-tenant-collect-input-")
    const outputDir = await createTempDir("elysian-tenant-collect-output-")
    process.env.ELYSIAN_TENANT_STABILITY_COLLECT_INPUT_DIR = inputDir
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_INPUT_DIR = outputDir

    await mkdir(join(inputDir, "a"), { recursive: true })
    await mkdir(join(inputDir, "b", "nested"), { recursive: true })

    await writeFile(
      join(inputDir, "a", "e2e-tenant-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-24T10:00:00.000Z",
        githubRunId: "11001",
      }),
      "utf8",
    )
    await writeFile(
      join(inputDir, "b", "nested", "e2e-tenant-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-24T11:00:00.000Z",
        githubRunId: "11002",
      }),
      "utf8",
    )

    const report = await run()
    expect(report.totalCollected).toBe(2)
    expect(report.items.map((item) => item.runKey).sort()).toEqual([
      "run-11001",
      "run-11002",
    ])

    const reportRaw = await readFile(
      join(outputDir, "e2e-tenant-stability-collect-report.json"),
      "utf8",
    )
    const parsed = JSON.parse(reportRaw) as { totalCollected: number }
    expect(parsed.totalCollected).toBe(2)
  })
})
