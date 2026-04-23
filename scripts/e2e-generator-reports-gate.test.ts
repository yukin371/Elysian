import { describe, expect, test } from "bun:test"

import {
  buildRecommendedActions,
  parseAllowFailedSourcesRaw,
  validateReportsIndex,
} from "./e2e-generator-reports-gate"

describe("parseAllowFailedSourcesRaw", () => {
  test("returns unique supported sources", () => {
    expect(parseAllowFailedSourcesRaw("matrix, cli, matrix")).toEqual([
      "matrix",
      "cli",
    ])
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

  test("includes source-specific suggested actions for matrix and cli", () => {
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
    ])

    expect(
      actions.some((action) => action.includes("For matrix failures")),
    ).toBeTrue()
    expect(
      actions.some((action) => action.includes("For cli failures")),
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
        totalReports: 2,
        passedReports: 1,
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
