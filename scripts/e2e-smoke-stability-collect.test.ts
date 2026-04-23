import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run } from "./e2e-smoke-stability-collect"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_SMOKE_STABILITY_COLLECT_INPUT_DIR = ""
  process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_INPUT_DIR = ""
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("e2e-smoke-stability-collect", () => {
  test("collects snapshots into normalized run folders", async () => {
    const inputDir = await createTempDir("elysian-smoke-collect-input-")
    const outputDir = await createTempDir("elysian-smoke-collect-output-")
    process.env.ELYSIAN_SMOKE_STABILITY_COLLECT_INPUT_DIR = inputDir
    process.env.ELYSIAN_SMOKE_STABILITY_EVIDENCE_INPUT_DIR = outputDir

    await mkdir(join(inputDir, "a"), { recursive: true })
    await mkdir(join(inputDir, "b", "nested"), { recursive: true })

    await writeFile(
      join(inputDir, "a", "e2e-smoke-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T10:00:00.000Z",
        githubRunId: "10001",
      }),
      "utf8",
    )
    await writeFile(
      join(inputDir, "b", "nested", "e2e-smoke-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T11:00:00.000Z",
        githubRunId: "10002",
      }),
      "utf8",
    )

    const report = await run()
    expect(report.totalCollected).toBe(2)
    expect(report.items.map((item) => item.runKey).sort()).toEqual([
      "run-10001",
      "run-10002",
    ])

    const reportRaw = await readFile(
      join(outputDir, "e2e-smoke-stability-collect-report.json"),
      "utf8",
    )
    const parsed = JSON.parse(reportRaw) as { totalCollected: number }
    expect(parsed.totalCollected).toBe(2)
  })
})
