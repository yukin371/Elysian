import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, test } from "bun:test"

interface StudioReportFixture {
  failedCount: number
  passedCount: number
  scenarios: Array<{
    evidence?: Record<string, unknown>
    name: string
    status: "passed" | "failed"
    message?: string
  }>
  status: "passed" | "failed"
}

const runStudioSmokeProcess = async () => {
  const reportDir = await mkdtemp(join(tmpdir(), "elysian-generator-studio-"))
  const child = Bun.spawn(
    [process.execPath, "scripts/e2e-generator-studio-guided-flow-smoke.ts"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ELYSIAN_REPORT_DIR: reportDir,
      },
      stderr: "pipe",
      stdout: "pipe",
    },
  )

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ])

  const reportPath = join(reportDir, "e2e-generator-studio-report.json")
  const report = JSON.parse(
    await readFile(reportPath, "utf8"),
  ) as StudioReportFixture

  return {
    exitCode,
    report,
    reportDir,
    stderr,
    stdout,
  }
}

const findScenario = (report: StudioReportFixture, name: string) => {
  const scenario = report.scenarios.find((item) => item.name === name)

  expect(scenario).toBeDefined()
  expect(scenario?.status).toBe("passed")

  return scenario
}

describe("e2e-generator-studio-guided-flow-smoke report", () => {
  test("records replayable happy, blocked, and stale apply evidence", async () => {
    const result = await runStudioSmokeProcess()

    expect(result.exitCode, result.stderr || result.stdout).toBe(0)
    expect(result.report.status).toBe("passed")
    expect(result.report.failedCount).toBe(0)
    expect(result.report.passedCount).toBe(4)

    const happy = findScenario(
      result.report,
      "guided workspace happy path reaches apply completion",
    )
    expect(happy?.evidence).toMatchObject({
      applyManifestPath:
        "generated/reports/guided-flow-happy-apply.manifest.json",
      applyReportPath: "generated/reports/guided-flow-happy.preview.json",
      applyRequestId: "apply-request-1",
      confirmationChecklistCount: 2,
      confirmationRecoveryStatus: "none",
      confirmationReportPath:
        "generated/reports/guided-flow-happy.preview.json",
      confirmationSnapshotPath:
        "/tmp/generator-session-report/guided-flow-happy.migration-proposal.json",
      finalStep: "done",
      finalStatus: "applied",
    })

    const blocked = findScenario(
      result.report,
      "guided workspace blocked apply keeps evidence visible",
    )
    expect(blocked?.evidence).toMatchObject({
      applyRequestCount: 1,
      canApply: false,
      detailRequestCount: 1,
      driftStatus: "clean",
      errorMessage: "Blocking files still need manual review before apply.",
      finalStep: "apply",
      finalStatus: "ready",
      hasBlockingConflicts: true,
    })
    expect(blocked?.evidence?.blockerReasons).toEqual([
      {
        code: "blocking-conflicts",
        message: "Blocking files still need manual review before apply.",
        stage: "apply",
      },
    ])

    const stale = findScenario(
      result.report,
      "guided workspace stale apply regenerates with report evidence",
    )
    expect(stale?.evidence).toMatchObject({
      applyRequestCount: 1,
      canApply: false,
      driftStatus: "stale",
      finalStep: "review",
      finalStatus: "pending_review",
      originalSessionId: "guided-flow-stale",
      previewRequestCount: 1,
      regeneratedSessionId: "guided-flow-stale-regenerated",
    })
    expect(stale?.evidence?.blockerReasons).toEqual([
      {
        code: "blocking-conflicts",
        message: "Target files drifted since the last preview.",
        stage: "apply",
      },
    ])
  })
})
