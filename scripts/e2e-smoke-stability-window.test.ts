import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  buildGitHubOutputLines,
  renderStabilityWindowSummaryMarkdown,
  run,
} from "./e2e-smoke-stability-window"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.env.ELYSIAN_SMOKE_REPORT_DIR = ""
  process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE = ""
  process.env.GITHUB_RUN_ID = ""
  process.env.GITHUB_RUN_NUMBER = ""
  process.env.GITHUB_EVENT_NAME = ""
  process.env.GITHUB_REF = ""
  process.env.GITHUB_SHA = ""
})

const createTempSmokeDir = async () => {
  const dir = await mkdtemp(join(tmpdir(), "elysian-smoke-stability-window-"))
  tempDirs.push(dir)
  process.env.ELYSIAN_SMOKE_REPORT_DIR = dir
  return dir
}

describe("e2e-smoke-stability-window", () => {
  test("aggregates entries and marks window as qualified", async () => {
    const dir = await createTempSmokeDir()
    process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE = "3"
    await mkdir(dir, { recursive: true })

    await writeFile(
      join(dir, "e2e-smoke-stability-window.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T10:00:00.000Z",
        sourceSnapshotPath: join(dir, "e2e-smoke-stability-snapshot.json"),
        windowSize: 3,
        totalEntries: 2,
        entries: [
          {
            generatedAt: "2026-04-23T09:00:00.000Z",
            githubRunId: "2002",
            githubRunNumber: "12",
            githubEventName: "push",
            githubRef: "refs/heads/dev",
            gitSha: "sha-2002",
            gateStatus: "passed",
            smokeFinalStatus: "passed",
            recoveredByRetry: false,
            attempts: 1,
            notes: [],
          },
          {
            generatedAt: "2026-04-23T08:00:00.000Z",
            githubRunId: "2001",
            githubRunNumber: "11",
            githubEventName: "push",
            githubRef: "refs/heads/dev",
            gitSha: "sha-2001",
            gateStatus: "passed",
            smokeFinalStatus: "passed",
            recoveredByRetry: true,
            attempts: 2,
            notes: [],
          },
        ],
        window: {
          collectedRuns: 2,
          hasMinimumRuns: false,
          failedGateCount: 0,
          maxConsecutiveFailedGates: 0,
          systemicBlockerDetected: false,
          qualifiedForPhaseTransition: false,
        },
        recommendation: "hold_phase6a",
      }),
      "utf8",
    )

    await writeFile(
      join(dir, "e2e-smoke-stability-snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T10:30:00.000Z",
        gitSha: "sha-2003",
        githubRunId: "2003",
        githubRunNumber: "13",
        githubEventName: "push",
        githubRef: "refs/heads/dev",
        reportDir: dir,
        gateStatus: "passed",
        smokeFinalStatus: "passed",
        recoveredByRetry: false,
        attempts: 1,
        gateConclusion: "Smoke reports gate passed.",
        notes: [],
      }),
      "utf8",
    )

    const report = await run()
    expect(report.window.collectedRuns).toBe(3)
    expect(report.window.hasMinimumRuns).toBeTrue()
    expect(report.window.systemicBlockerDetected).toBeFalse()
    expect(report.window.qualifiedForPhaseTransition).toBeTrue()
    expect(report.recommendation).toBe("candidate_for_next_phase")

    const reportRaw = await readFile(
      join(dir, "e2e-smoke-stability-window.json"),
      "utf8",
    )
    const reportFile = JSON.parse(reportRaw) as {
      totalEntries: number
      entries: Array<{ githubRunId: string | null }>
    }
    expect(reportFile.totalEntries).toBe(3)
    expect(reportFile.entries[0]?.githubRunId).toBe("2003")
  })

  test("detects systemic blocker when two failed gates are consecutive", async () => {
    const dir = await createTempSmokeDir()
    process.env.ELYSIAN_SMOKE_STABILITY_WINDOW_SIZE = "3"
    await mkdir(dir, { recursive: true })
    process.env.GITHUB_RUN_ID = "3003"
    process.env.GITHUB_SHA = "sha-3003"

    await writeFile(
      join(dir, "e2e-smoke-stability-window.json"),
      JSON.stringify({
        generatedAt: "2026-04-23T10:00:00.000Z",
        sourceSnapshotPath: join(dir, "e2e-smoke-stability-snapshot.json"),
        windowSize: 3,
        totalEntries: 2,
        entries: [
          {
            generatedAt: "2026-04-23T09:00:00.000Z",
            githubRunId: "3002",
            githubRunNumber: "22",
            githubEventName: "push",
            githubRef: "refs/heads/dev",
            gitSha: "sha-3002",
            gateStatus: "failed",
            smokeFinalStatus: "failed",
            recoveredByRetry: false,
            attempts: 2,
            notes: [],
          },
          {
            generatedAt: "2026-04-23T08:00:00.000Z",
            githubRunId: "3001",
            githubRunNumber: "21",
            githubEventName: "push",
            githubRef: "refs/heads/dev",
            gitSha: "sha-3001",
            gateStatus: "failed",
            smokeFinalStatus: "failed",
            recoveredByRetry: false,
            attempts: 2,
            notes: [],
          },
        ],
        window: {
          collectedRuns: 2,
          hasMinimumRuns: false,
          failedGateCount: 2,
          maxConsecutiveFailedGates: 2,
          systemicBlockerDetected: true,
          qualifiedForPhaseTransition: false,
        },
        recommendation: "hold_phase6a",
      }),
      "utf8",
    )

    const report = await run()
    expect(report.window.collectedRuns).toBe(3)
    expect(report.window.hasMinimumRuns).toBeTrue()
    expect(report.window.failedGateCount).toBe(2)
    expect(report.window.maxConsecutiveFailedGates).toBe(2)
    expect(report.window.systemicBlockerDetected).toBeTrue()
    expect(report.window.qualifiedForPhaseTransition).toBeFalse()
    expect(report.recommendation).toBe("hold_phase6a")
    const fallbackEntry = report.entries.find(
      (entry) => entry.githubRunId === "3003",
    )
    expect(fallbackEntry).toBeDefined()
    expect(fallbackEntry?.gateStatus).toBe("unknown")
    expect(fallbackEntry?.notes).toContain(
      "Missing smoke stability snapshot; fallback entry generated.",
    )
  })

  test("renders summary markdown and github output lines", () => {
    const summary = renderStabilityWindowSummaryMarkdown({
      generatedAt: "2026-04-23T00:00:00.000Z",
      sourceSnapshotPath: "/tmp/snapshot.json",
      windowSize: 5,
      totalEntries: 2,
      entries: [
        {
          generatedAt: "2026-04-23T01:00:00.000Z",
          githubRunId: "4002",
          githubRunNumber: "32",
          githubEventName: "push",
          githubRef: "refs/heads/dev",
          gitSha: "sha-4002",
          gateStatus: "passed",
          smokeFinalStatus: "passed",
          recoveredByRetry: false,
          attempts: 1,
          notes: [],
        },
        {
          generatedAt: "2026-04-23T00:00:00.000Z",
          githubRunId: "4001",
          githubRunNumber: "31",
          githubEventName: "push",
          githubRef: "refs/heads/dev",
          gitSha: "sha-4001",
          gateStatus: "passed",
          smokeFinalStatus: "passed",
          recoveredByRetry: true,
          attempts: 2,
          notes: [],
        },
      ],
      window: {
        collectedRuns: 2,
        hasMinimumRuns: false,
        failedGateCount: 0,
        maxConsecutiveFailedGates: 0,
        systemicBlockerDetected: false,
        qualifiedForPhaseTransition: false,
      },
      recommendation: "hold_phase6a",
    })
    expect(summary).toContain("### E2E Smoke Stability Window")
    expect(summary).toContain("- collectedRuns: `2`")
    expect(summary).toContain("- recommendation: `hold_phase6a`")

    expect(
      buildGitHubOutputLines({
        generatedAt: "2026-04-23T00:00:00.000Z",
        sourceSnapshotPath: "/tmp/snapshot.json",
        windowSize: 5,
        totalEntries: 5,
        entries: [],
        window: {
          collectedRuns: 5,
          hasMinimumRuns: true,
          failedGateCount: 0,
          maxConsecutiveFailedGates: 0,
          systemicBlockerDetected: false,
          qualifiedForPhaseTransition: true,
        },
        recommendation: "candidate_for_next_phase",
      }),
    ).toEqual([
      "smoke_stability_window_size=5",
      "smoke_stability_collected_runs=5",
      "smoke_stability_has_minimum_runs=true",
      "smoke_stability_systemic_blocker=false",
      "smoke_stability_qualified=true",
      "smoke_stability_recommendation=candidate_for_next_phase",
    ])
  })
})
