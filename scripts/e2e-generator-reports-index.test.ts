import { describe, expect, test } from "bun:test"

import {
  buildGitHubOutputLines,
  parseReportEnvelope,
  renderIndexSummaryMarkdown,
  resolveReportSource,
  shouldIndexGeneratorReportFile,
} from "./e2e-generator-reports-index"

describe("resolveReportSource", () => {
  test("recognizes matrix, cli, studio, and browser prefixes", () => {
    expect(resolveReportSource("matrix/report.json")).toBe("matrix")
    expect(resolveReportSource("cli/report.json")).toBe("cli")
    expect(resolveReportSource("studio/report.json")).toBe("studio")
    expect(resolveReportSource("browser/report.json")).toBe("browser")
  })

  test("recognizes flat report file names", () => {
    expect(resolveReportSource("e2e-generator-matrix-report.json")).toBe(
      "matrix",
    )
    expect(resolveReportSource("e2e-generator-cli-report.json")).toBe("cli")
    expect(resolveReportSource("e2e-generator-studio-report.json")).toBe(
      "studio",
    )
    expect(resolveReportSource("e2e-generator-browser-smoke-report.json")).toBe(
      "browser",
    )
  })

  test("falls back to unknown for unprefixed reports", () => {
    expect(resolveReportSource("report.json")).toBe("unknown")
  })
})

describe("shouldIndexGeneratorReportFile", () => {
  test("skips generated index and gate reports", () => {
    expect(
      shouldIndexGeneratorReportFile("e2e-generator-reports-index.json"),
    ).toBe(false)
    expect(
      shouldIndexGeneratorReportFile("e2e-generator-reports-gate.json"),
    ).toBe(false)
    expect(shouldIndexGeneratorReportFile("studio/report.json")).toBe(true)
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

describe("presentation", () => {
  test("renders CI summary and output lines", () => {
    const index = {
      gitSha: "test",
      generatedAt: "2026-05-19T00:00:00.000Z",
      inputDir: "inputs",
      totalReports: 2,
      passedReports: 1,
      failedReports: 1,
      overallStatus: "failed" as const,
      conclusion: "1 generator e2e report(s) failed.",
      failedItems: [
        {
          source: "browser" as const,
          reportPath: "browser/report.json",
          fileName: "report.json",
          status: "failed" as const,
          passedCount: 0,
          failedCount: 1,
        },
      ],
      items: [
        {
          source: "browser" as const,
          reportPath: "browser/report.json",
          fileName: "report.json",
          status: "failed" as const,
          passedCount: 0,
          failedCount: 1,
        },
        {
          source: "studio" as const,
          reportPath: "studio/report.json",
          fileName: "report.json",
          status: "passed" as const,
          passedCount: 1,
          failedCount: 0,
        },
      ],
    }

    expect(renderIndexSummaryMarkdown(index)).toContain(
      "### Generator Reports Index",
    )
    expect(renderIndexSummaryMarkdown(index)).toContain(
      "- `browser`: `browser/report.json`",
    )
    expect(buildGitHubOutputLines(index)).toEqual([
      "generator_reports_index_status=failed",
      "generator_reports_index_total_reports=2",
      "generator_reports_index_failed_reports=1",
      "generator_reports_index_failed_sources=browser",
    ])
  })
})
