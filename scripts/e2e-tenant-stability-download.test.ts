import { describe, expect, test } from "bun:test"

import {
  parseDownloadCliArgs,
  parseGitHubRepositoryFromRemoteUrl,
  selectRunsForDownload,
} from "./e2e-tenant-stability-download"

describe("e2e-tenant-stability-download", () => {
  test("parses GitHub repository from https and ssh remotes", () => {
    expect(
      parseGitHubRepositoryFromRemoteUrl(
        "https://github.com/yukin371/Elysian.git",
      ),
    ).toBe("yukin371/Elysian")
    expect(
      parseGitHubRepositoryFromRemoteUrl("git@github.com:yukin371/Elysian.git"),
    ).toBe("yukin371/Elysian")
    expect(
      parseGitHubRepositoryFromRemoteUrl("https://example.com/x/y.git"),
    ).toBeNull()
  })

  test("parses CLI args with repeated events", () => {
    const parsed = parseDownloadCliArgs([
      "--repo",
      "yukin371/Elysian",
      "--branch",
      "dev",
      "--workflow",
      "ci.yml",
      "--artifact-name",
      "e2e-tenant-report",
      "--limit",
      "5",
      "--scan-limit",
      "12",
      "--output-dir",
      "artifacts/downloads/tenant",
      "--event",
      "push",
      "--event",
      "workflow_dispatch",
    ])

    expect(parsed.repository).toBe("yukin371/Elysian")
    expect(parsed.branch).toBe("dev")
    expect(parsed.requestedRuns).toBe(5)
    expect(parsed.scanLimit).toBe(12)
    expect(parsed.events).toEqual(["push", "workflow_dispatch"])
  })

  test("selects completed runs and honors event filters", () => {
    const runs = [
      {
        databaseId: 1,
        status: "completed",
        conclusion: "success",
        event: "push",
        headBranch: "dev",
        createdAt: "2026-04-24T10:00:00.000Z",
        displayTitle: "run-1",
      },
      {
        databaseId: 2,
        status: "in_progress",
        conclusion: null,
        event: "push",
        headBranch: "dev",
        createdAt: "2026-04-24T09:00:00.000Z",
        displayTitle: "run-2",
      },
      {
        databaseId: 3,
        status: "completed",
        conclusion: "failure",
        event: "workflow_dispatch",
        headBranch: "dev",
        createdAt: "2026-04-24T08:00:00.000Z",
        displayTitle: "run-3",
      },
    ]

    expect(
      selectRunsForDownload(runs, {
        scanLimit: 5,
        events: [],
      }).map((item) => item.databaseId),
    ).toEqual([1, 3])

    expect(
      selectRunsForDownload(runs, {
        scanLimit: 5,
        events: ["workflow_dispatch"],
      }).map((item) => item.databaseId),
    ).toEqual([3])
  })
})
