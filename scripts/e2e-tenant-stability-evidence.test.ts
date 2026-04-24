import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  buildGitHubOutputLines,
  renderEvidenceSummaryMarkdown,
  run,
} from "./e2e-tenant-stability-evidence"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_INPUT_DIR = ""
  process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR = ""
  process.env.ELYSIAN_TENANT_STABILITY_WINDOW_SIZE = ""
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("e2e-tenant-stability-evidence", () => {
  test("builds evidence and qualifies for next step", async () => {
    const inputDir = await createTempDir("elysian-tenant-evidence-input-")
    const outputDir = await createTempDir("elysian-tenant-evidence-output-")
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_INPUT_DIR = inputDir
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR = outputDir
    process.env.ELYSIAN_TENANT_STABILITY_WINDOW_SIZE = "3"

    await mkdir(join(inputDir, "run1"), { recursive: true })
    await mkdir(join(inputDir, "run2"), { recursive: true })
    await mkdir(join(inputDir, "run3"), { recursive: true })
    await writeFile(
      join(inputDir, "run1", "e2e-tenant-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-24T10:00:00.000Z",
        githubRunId: "9003",
        tenantE2eStatus: "passed",
        lastStage: "db_fk_constraint",
        failureCategory: null,
        durationMs: 3100,
        notes: [],
      }),
      "utf8",
    )
    await writeFile(
      join(inputDir, "run2", "e2e-tenant-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-24T09:00:00.000Z",
        githubRunId: "9002",
        tenantE2eStatus: "passed",
        lastStage: "db_fk_constraint",
        failureCategory: null,
        durationMs: 3200,
        notes: [],
      }),
      "utf8",
    )
    await writeFile(
      join(inputDir, "run3", "e2e-tenant-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-24T08:00:00.000Z",
        githubRunId: "9001",
        tenantE2eStatus: "passed",
        lastStage: "db_fk_constraint",
        failureCategory: null,
        durationMs: 3300,
        notes: [],
      }),
      "utf8",
    )

    const report = await run()
    expect(report.totalSnapshots).toBe(3)
    expect(report.selectedWindowRuns).toBe(3)
    expect(report.hasMinimumRuns).toBeTrue()
    expect(report.failedRunCount).toBe(0)
    expect(report.systemicBlockerDetected).toBeFalse()
    expect(report.qualifiedForNextStep).toBeTrue()
    expect(report.recommendation).toBe("candidate_for_next_step")

    const outputRaw = await readFile(
      join(outputDir, "e2e-tenant-stability-evidence.json"),
      "utf8",
    )
    const output = JSON.parse(outputRaw) as { topRunIds: string[] }
    expect(output.topRunIds).toEqual(["9003", "9002", "9001"])
  })

  test("continues observation when systemic blocker exists", async () => {
    const inputDir = await createTempDir("elysian-tenant-evidence-block-input-")
    const outputDir = await createTempDir(
      "elysian-tenant-evidence-block-output-",
    )
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_INPUT_DIR = inputDir
    process.env.ELYSIAN_TENANT_STABILITY_EVIDENCE_OUTPUT_DIR = outputDir
    process.env.ELYSIAN_TENANT_STABILITY_WINDOW_SIZE = "3"

    await mkdir(join(inputDir, "run1"), { recursive: true })
    await mkdir(join(inputDir, "run2"), { recursive: true })
    await mkdir(join(inputDir, "run3"), { recursive: true })
    await writeFile(
      join(inputDir, "run1", "e2e-tenant-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-24T10:00:00.000Z",
        githubRunId: "9103",
        tenantE2eStatus: "failed",
        lastStage: "module_readiness",
        failureCategory: "dependency",
        durationMs: 1500,
        notes: [],
      }),
      "utf8",
    )
    await writeFile(
      join(inputDir, "run2", "e2e-tenant-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-24T09:00:00.000Z",
        githubRunId: "9102",
        tenantE2eStatus: "failed",
        lastStage: "server_bootstrap",
        failureCategory: "dependency",
        durationMs: 1400,
        notes: [],
      }),
      "utf8",
    )
    await writeFile(
      join(inputDir, "run3", "e2e-tenant-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-24T08:00:00.000Z",
        githubRunId: "9101",
        tenantE2eStatus: "passed",
        lastStage: "db_fk_constraint",
        failureCategory: null,
        durationMs: 3000,
        notes: [],
      }),
      "utf8",
    )

    const report = await run()
    expect(report.hasMinimumRuns).toBeTrue()
    expect(report.failedRunCount).toBe(2)
    expect(report.maxConsecutiveFailedRuns).toBe(2)
    expect(report.dependencyFailureCount).toBe(2)
    expect(report.systemicBlockerDetected).toBeTrue()
    expect(report.qualifiedForNextStep).toBeFalse()
    expect(report.recommendation).toBe("continue_observation")
  })

  test("renders summary markdown and github output lines", () => {
    const summary = renderEvidenceSummaryMarkdown({
      generatedAt: "2026-04-24T00:00:00.000Z",
      inputDir: "/tmp/input",
      outputDir: "/tmp/output",
      windowSize: 5,
      totalSnapshots: 5,
      selectedWindowRuns: 5,
      hasMinimumRuns: true,
      failedRunCount: 1,
      maxConsecutiveFailedRuns: 1,
      dependencyFailureCount: 1,
      environmentFailureCount: 0,
      systemicBlockerDetected: false,
      qualifiedForNextStep: true,
      recommendation: "candidate_for_next_step",
      topRunIds: ["a", "b"],
    })
    expect(summary).toContain("### E2E Tenant Stability Evidence")
    expect(summary).toContain("- recommendation: `candidate_for_next_step`")

    expect(
      buildGitHubOutputLines({
        generatedAt: "2026-04-24T00:00:00.000Z",
        inputDir: "/tmp/input",
        outputDir: "/tmp/output",
        windowSize: 5,
        totalSnapshots: 4,
        selectedWindowRuns: 4,
        hasMinimumRuns: false,
        failedRunCount: 2,
        maxConsecutiveFailedRuns: 2,
        dependencyFailureCount: 1,
        environmentFailureCount: 1,
        systemicBlockerDetected: true,
        qualifiedForNextStep: false,
        recommendation: "continue_observation",
        topRunIds: ["a"],
      }),
    ).toEqual([
      "tenant_evidence_total_snapshots=4",
      "tenant_evidence_window_size=5",
      "tenant_evidence_selected_runs=4",
      "tenant_evidence_has_minimum_runs=false",
      "tenant_evidence_systemic_blocker=true",
      "tenant_evidence_qualified=false",
      "tenant_evidence_recommendation=continue_observation",
    ])
  })
})
