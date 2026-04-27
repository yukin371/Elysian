import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { renderGateSummaryMarkdown, run } from "./tenant-release-gate"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_TENANT_RELEASE_REPORT_PATH = ""
  process.env.ELYSIAN_TENANT_RELEASE_GATE_REPORT_PATH = ""
  process.exitCode = 0
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("tenant-release-gate", () => {
  test("passes when report status is passed", async () => {
    const dir = await createTempDir("elysian-tenant-release-gate-pass-")
    const reportPath = join(dir, "tenant-release-report.json")
    const gatePath = join(dir, "tenant-release-gate-report.json")
    process.env.ELYSIAN_TENANT_RELEASE_REPORT_PATH = reportPath
    process.env.ELYSIAN_TENANT_RELEASE_GATE_REPORT_PATH = gatePath

    await writeFile(
      reportPath,
      JSON.stringify({
        generatedAt: "2026-04-24T00:00:00.000Z",
        outputPath: reportPath,
        status: "passed",
        blockers: [],
        recommendedActions: ["归档结论"],
        summary: {
          sourceBranch: "dev",
          targetBranch: "main",
          releaseEnvironment: "staging",
          qualifiedForNextStep: true,
          recommendation: "candidate_for_next_step",
        },
      }),
      "utf8",
    )

    const gate = await run()
    expect(gate.status).toBe("passed")

    const saved = JSON.parse(await readFile(gatePath, "utf8")) as {
      status: string
    }
    expect(saved.status).toBe("passed")
  })

  test("fails when report status is failed", async () => {
    const dir = await createTempDir("elysian-tenant-release-gate-fail-")
    const reportPath = join(dir, "tenant-release-report.json")
    process.env.ELYSIAN_TENANT_RELEASE_REPORT_PATH = reportPath
    process.env.ELYSIAN_TENANT_RELEASE_GATE_REPORT_PATH = join(
      dir,
      "tenant-release-gate-report.json",
    )

    await writeFile(
      reportPath,
      JSON.stringify({
        generatedAt: "2026-04-24T00:00:00.000Z",
        outputPath: reportPath,
        status: "failed",
        blockers: ["docs 未同步"],
        recommendedActions: ["先同步 docs"],
        summary: {
          sourceBranch: "dev",
          targetBranch: "main",
          releaseEnvironment: "staging",
          qualifiedForNextStep: true,
          recommendation: "candidate_for_next_step",
        },
      }),
      "utf8",
    )

    const gate = await run()
    expect(gate.status).toBe("failed")
    expect(gate.blockerCount).toBe(1)
  })

  test("renders summary markdown", () => {
    const markdown = renderGateSummaryMarkdown({
      generatedAt: "2026-04-24T00:00:00.000Z",
      reportPath: "/tmp/report.json",
      outputPath: "/tmp/gate.json",
      status: "failed",
      conclusion: "failed",
      blockerCount: 2,
      summary: {
        sourceBranch: "dev",
        targetBranch: "main",
        releaseEnvironment: "staging",
        qualifiedForNextStep: true,
        recommendation: "candidate_for_next_step",
      },
      recommendedActions: ["a", "b"],
    })

    expect(markdown).toContain("### Tenant Release Gate")
    expect(markdown).toContain("- blockerCount: `2`")
  })
})
