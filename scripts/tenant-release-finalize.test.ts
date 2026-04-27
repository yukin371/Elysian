import { describe, expect, test } from "bun:test"

import { runWith } from "./tenant-release-finalize"

describe("tenant-release-finalize", () => {
  test("runs report and gate in sequence", async () => {
    const order: string[] = []

    const result = await runWith({
      report: async () => {
        order.push("report")
        return {
          status: "passed" as const,
          outputPath: "/tmp/report.json",
        }
      },
      gate: async () => {
        order.push("gate")
        return {
          status: "passed" as const,
          outputPath: "/tmp/gate.json",
        }
      },
    })

    expect(order).toEqual(["report", "gate"])
    expect(result.status).toBe("passed")
    expect(result.outputs.reportPath).toBe("/tmp/report.json")
    expect(result.outputs.gatePath).toBe("/tmp/gate.json")
  })
})
