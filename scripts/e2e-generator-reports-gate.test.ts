import { describe, expect, test } from "bun:test"

import {
  buildRecommendedActions,
  parseAllowFailedSourcesRaw,
  validateReportsIndex,
} from "./e2e-generator-reports-gate"

describe("parseAllowFailedSourcesRaw", () => {
  test("returns unique supported sources", () => {
    expect(
      parseAllowFailedSourcesRaw("matrix, cli, studio, browser, matrix"),
    ).toEqual(["matrix", "cli", "studio", "browser"])
  })

  test("throws on unsupported sources", () => {
    expect(() => parseAllowFailedSourcesRaw("matrix,foo")).toThrow(
      "Invalid allow-failed source: foo",
    )
  })
})

describe("buildRecommendedActions", () => {
  test("returns no-action suggestion when passed", () => {
    expect(buildRecommendedActions("passed", [])).toEqual([
      "No action required.",
    ])
  })

  test("includes source-specific suggested actions for matrix, cli, studio, and browser", () => {
    const actions = buildRecommendedActions("failed", [
      {
        source: "matrix",
        reportPath: "matrix/report.json",
        fileName: "report.json",
        status: "failed",
        passedCount: 0,
        failedCount: 1,
      },
      {
        source: "cli",
        reportPath: "cli/report.json",
        fileName: "report.json",
        status: "failed",
        passedCount: 0,
        failedCount: 1,
      },
      {
        source: "studio",
        reportPath: "studio/report.json",
        fileName: "report.json",
        status: "failed",
        passedCount: 0,
        failedCount: 1,
      },
      {
        source: "browser",
        reportPath: "browser/report.json",
        fileName: "report.json",
        status: "failed",
        passedCount: 0,
        failedCount: 1,
      },
    ])

    expect(
      actions.some((action) => action.includes("For matrix failures")),
    ).toBeTrue()
    expect(
      actions.some((action) => action.includes("For cli failures")),
    ).toBeTrue()
    expect(
      actions.some((action) => action.includes("For studio failures")),
    ).toBeTrue()
    expect(
      actions.some((action) => action.includes("For browser failures")),
    ).toBeTrue()
  })
})

describe("validateReportsIndex", () => {
  test("passes on consistent index", () => {
    expect(() =>
      validateReportsIndex({
        gitSha: "abc",
        generatedAt: "2026-04-22T00:00:00.000Z",
        inputDir: "tmp",
        totalReports: 4,
        passedReports: 3,
        failedReports: 1,
        overallStatus: "failed",
        conclusion: "1 failed",
        failedItems: [
          {
            source: "matrix",
            reportPath: "matrix/a.json",
            fileName: "a.json",
            status: "failed",
            passedCount: 1,
            failedCount: 1,
          },
        ],
        items: [
          {
            source: "matrix",
            reportPath: "matrix/a.json",
            fileName: "a.json",
            status: "failed",
            passedCount: 1,
            failedCount: 1,
          },
          {
            source: "cli",
            reportPath: "cli/b.json",
            fileName: "b.json",
            status: "passed",
            passedCount: 2,
            failedCount: 0,
          },
          {
            source: "studio",
            reportPath: "studio/c.json",
            fileName: "c.json",
            status: "passed",
            passedCount: 3,
            failedCount: 0,
          },
          {
            source: "browser",
            reportPath: "browser/d.json",
            fileName: "d.json",
            status: "passed",
            passedCount: 4,
            failedCount: 0,
          },
        ],
      }),
    ).not.toThrow()
  })

  test("throws when summary counters drift from items", () => {
    expect(() =>
      validateReportsIndex({
        gitSha: "abc",
        generatedAt: "2026-04-22T00:00:00.000Z",
        inputDir: "tmp",
        totalReports: 1,
        passedReports: 1,
        failedReports: 0,
        overallStatus: "passed",
        conclusion: "ok",
        failedItems: [],
        items: [
          {
            source: "matrix",
            reportPath: "matrix/a.json",
            fileName: "a.json",
            status: "failed",
            passedCount: 1,
            failedCount: 1,
          },
        ],
      }),
    ).toThrow(
      "Invalid reports index: failedReports does not match failed item count",
    )
  })
})
