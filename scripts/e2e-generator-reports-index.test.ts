import { describe, expect, test } from "bun:test"

import {
  parseReportEnvelope,
  resolveReportSource,
} from "./e2e-generator-reports-index"

describe("resolveReportSource", () => {
  test("recognizes matrix, cli, and studio prefixes", () => {
    expect(resolveReportSource("matrix/report.json")).toBe("matrix")
    expect(resolveReportSource("cli/report.json")).toBe("cli")
    expect(resolveReportSource("studio/report.json")).toBe("studio")
  })

  test("falls back to unknown for unprefixed reports", () => {
    expect(resolveReportSource("report.json")).toBe("unknown")
  })
})

describe("parseReportEnvelope", () => {
  test("accepts a valid report envelope", () => {
    expect(
      parseReportEnvelope(
        {
          status: "passed",
          passedCount: 3,
          failedCount: 0,
        },
        "studio/report.json",
      ),
    ).toEqual({
      status: "passed",
      passedCount: 3,
      failedCount: 0,
    })
  })

  test("rejects invalid report status", () => {
    expect(() =>
      parseReportEnvelope(
        {
          status: "partial" as "passed",
          passedCount: 1,
          failedCount: 0,
        },
        "studio/report.json",
      ),
    ).toThrow("Invalid report status: studio/report.json")
  })

  test("rejects invalid passedCount", () => {
    expect(() =>
      parseReportEnvelope(
        {
          status: "failed",
          passedCount: Number.NaN,
          failedCount: 1,
        },
        "studio/report.json",
      ),
    ).toThrow("Invalid passedCount: studio/report.json")
  })

  test("rejects invalid failedCount", () => {
    expect(() =>
      parseReportEnvelope(
        {
          status: "failed",
          passedCount: 0,
          failedCount: Number.POSITIVE_INFINITY,
        },
        "studio/report.json",
      ),
    ).toThrow("Invalid failedCount: studio/report.json")
  })
})
