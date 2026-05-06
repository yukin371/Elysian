import { describe, expect, test } from "bun:test"

import { runWith } from "./go-live-finalize"

describe("runWith", () => {
  test("returns passed when report and gate both passed", async () => {
    const result = await runWith({
      report: async () => ({
        status: "passed" as const,
        outputPath: "artifacts/go-live/go-live-report.json",
      }),
      gate: async () => ({
        status: "passed" as const,
        outputPath: "artifacts/go-live/go-live-gate-report.json",
      }),
    })

    expect(result.status).toBe("passed")
    expect(result.steps).toEqual({
      report: "passed",
      gate: "passed",
    })
    expect(result.outputs).toEqual({
      reportPath: "artifacts/go-live/go-live-report.json",
      gatePath: "artifacts/go-live/go-live-gate-report.json",
    })
  })

  test("returns failed when gate failed", async () => {
    const result = await runWith({
      report: async () => ({
        status: "passed" as const,
        outputPath: "artifacts/go-live/go-live-report.json",
      }),
      gate: async () => ({
        status: "failed" as const,
        outputPath: "artifacts/go-live/go-live-gate-report.json",
      }),
    })

    expect(result.status).toBe("failed")
    expect(result.steps).toEqual({
      report: "passed",
      gate: "failed",
    })
  })
})
