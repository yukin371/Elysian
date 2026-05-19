import { mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, test } from "bun:test"

import {
  buildGitHubOutputLines,
  buildMissingRequiredSources,
  buildRecommendedActions,
  parseAllowFailedSourcesRaw,
  parseRequiredSourcesRaw,
  renderGateSummaryMarkdown,
  validateReportsIndex,
} from "./e2e-generator-reports-gate"

const createReportsIndexFixture = async (
  items: Array<{
    source: "matrix" | "cli" | "studio" | "browser" | "unknown"
    reportPath: string
    fileName: string
    status: "passed" | "failed"
    passedCount: number
    failedCount: number
  }>,
) => {
  const outputDir = await mkdtemp(join(tmpdir(), "elysian-generator-gate-"))
  const indexPath = join(outputDir, "e2e-generator-reports-index.json")
  const failedItems = items.filter((item) => item.status === "failed")
  const index = {
    gitSha: "test",
    generatedAt: "2026-05-19T00:00:00.000Z",
    inputDir: outputDir,
    totalReports: items.length,
    passedReports: items.length - failedItems.length,
    failedReports: failedItems.length,
    overallStatus: failedItems.length > 0 ? "failed" : "passed",
    conclusion: failedItems.length > 0 ? `${failedItems.length} failed` : "ok",
    failedItems,
    items,
  }

  await writeFile(indexPath, JSON.stringify(index, null, 2), "utf8")

  return {
    outputDir,
    indexPath,
  }
}

const runGateProcess = async (env: Record<string, string>) => {
  const child = Bun.spawn(
    [process.execPath, "scripts/e2e-generator-reports-gate.ts"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...env,
      },
      stdout: "pipe",
      stderr: "pipe",
    },
  )

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ])

  return {
    stdout,
    stderr,
    exitCode,
  }
}

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

describe("parseRequiredSourcesRaw", () => {
  test("returns unique required sources", () => {
    expect(
      parseRequiredSourcesRaw("matrix, cli, studio, browser, matrix"),
    ).toEqual(["matrix", "cli", "studio", "browser"])
  })

  test("throws on unsupported required sources", () => {
    expect(() => parseRequiredSourcesRaw("browser,unknown")).toThrow(
      "Invalid required source: unknown",
    )
  })
})

describe("buildMissingRequiredSources", () => {
  test("returns missing required browser source", () => {
    expect(
      buildMissingRequiredSources(
        [
          {
            source: "matrix",
            reportPath: "matrix/report.json",
            fileName: "report.json",
            status: "passed",
            passedCount: 1,
            failedCount: 0,
          },
          {
            source: "cli",
            reportPath: "cli/report.json",
            fileName: "report.json",
            status: "passed",
            passedCount: 1,
            failedCount: 0,
          },
        ],
        ["matrix", "cli", "browser"],
      ),
    ).toEqual(["browser"])
  })

  test("returns no missing source when browser report is present", () => {
    expect(
      buildMissingRequiredSources(
        [
          {
            source: "browser",
            reportPath: "browser/report.json",
            fileName: "report.json",
            status: "passed",
            passedCount: 1,
            failedCount: 0,
          },
        ],
        ["browser"],
      ),
    ).toEqual([])
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

describe("presentation", () => {
  test("renders CI summary and output lines", () => {
    const report = {
      gitSha: "test",
      generatedAt: "2026-05-19T00:00:00.000Z",
      indexPath: "index.json",
      status: "failed" as const,
      maxFailedReports: 0,
      requiredSources: ["matrix", "cli", "studio", "browser"],
      allowFailedSources: [],
      effectiveFailedReports: 2,
      allFailedItems: [
        {
          source: "browser" as const,
          reportPath: "browser/report.json",
          fileName: "report.json",
          status: "failed" as const,
          passedCount: 0,
          failedCount: 1,
        },
      ],
      missingRequiredSources: ["studio"],
      blockedFailedItems: [
        {
          source: "browser" as const,
          reportPath: "browser/report.json",
          fileName: "report.json",
          status: "failed" as const,
          passedCount: 0,
          failedCount: 1,
        },
      ],
      conclusion: "Generator reports gate failed.",
      recommendedActions: ["Inspect browser report."],
      appliedPolicy: {
        maxFailedReports: 0,
        requiredSources: ["matrix", "cli", "studio", "browser"],
        allowFailedSources: [],
        policyInputs: {
          gateMaxFailedReportsRaw: null,
          gateRequiredSourcesRaw: "matrix,cli,studio,browser",
          gateAllowFailedSourcesRaw: null,
          gateIndexPathRaw: null,
        },
        context: {
          githubEventName: null,
          githubRef: null,
        },
      },
    }

    expect(renderGateSummaryMarkdown(report)).toContain(
      "### Generator Reports Gate",
    )
    expect(renderGateSummaryMarkdown(report)).toContain(
      "- `browser`: `browser/report.json`",
    )
    expect(buildGitHubOutputLines(report)).toEqual([
      "generator_gate_status=failed",
      "generator_gate_effective_failed_reports=2",
      "generator_gate_missing_required_sources=studio",
      "generator_gate_blocked_failed_items=1",
    ])
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

describe("run", () => {
  test("fails when required browser report source is missing", async () => {
    const { outputDir, indexPath } = await createReportsIndexFixture([
      {
        source: "matrix",
        reportPath: "matrix/report.json",
        fileName: "report.json",
        status: "passed",
        passedCount: 1,
        failedCount: 0,
      },
      {
        source: "cli",
        reportPath: "cli/report.json",
        fileName: "report.json",
        status: "passed",
        passedCount: 1,
        failedCount: 0,
      },
      {
        source: "studio",
        reportPath: "studio/report.json",
        fileName: "report.json",
        status: "passed",
        passedCount: 1,
        failedCount: 0,
      },
    ])
    const summaryPath = join(outputDir, "summary.md")
    const outputPath = join(outputDir, "github-output.txt")

    const result = await runGateProcess({
      ELYSIAN_REPORT_DIR: outputDir,
      ELYSIAN_REPORT_GATE_INDEX_PATH: indexPath,
      ELYSIAN_REPORT_GATE_REQUIRED_SOURCES: "matrix,cli,studio,browser",
      GITHUB_STEP_SUMMARY: summaryPath,
      GITHUB_OUTPUT: outputPath,
    })

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain("missing-required-source=browser")

    const report = JSON.parse(
      await readFile(
        join(outputDir, "e2e-generator-reports-gate.json"),
        "utf8",
      ),
    ) as {
      status: "passed" | "failed"
      effectiveFailedReports: number
      missingRequiredSources: string[]
      recommendedActions: string[]
    }

    expect(report.status).toBe("failed")
    expect(report.effectiveFailedReports).toBe(1)
    expect(report.missingRequiredSources).toEqual(["browser"])
    expect(report.recommendedActions[0]).toContain(
      "Required generator report source(s) missing: browser.",
    )

    expect(await readFile(summaryPath, "utf8")).toContain(
      "missingRequiredSources: `browser`",
    )
    expect(await readFile(outputPath, "utf8")).toContain(
      "generator_gate_missing_required_sources=browser",
    )
  })

  test("passes when every required report source is present", async () => {
    const { outputDir, indexPath } = await createReportsIndexFixture([
      {
        source: "matrix",
        reportPath: "matrix/report.json",
        fileName: "report.json",
        status: "passed",
        passedCount: 1,
        failedCount: 0,
      },
      {
        source: "cli",
        reportPath: "cli/report.json",
        fileName: "report.json",
        status: "passed",
        passedCount: 1,
        failedCount: 0,
      },
      {
        source: "studio",
        reportPath: "studio/report.json",
        fileName: "report.json",
        status: "passed",
        passedCount: 1,
        failedCount: 0,
      },
      {
        source: "browser",
        reportPath: "browser/report.json",
        fileName: "report.json",
        status: "passed",
        passedCount: 1,
        failedCount: 0,
      },
    ])

    const result = await runGateProcess({
      ELYSIAN_REPORT_DIR: outputDir,
      ELYSIAN_REPORT_GATE_INDEX_PATH: indexPath,
      ELYSIAN_REPORT_GATE_REQUIRED_SOURCES: "matrix,cli,studio,browser",
    })

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("[e2e-generator-reports-gate] passed")
  })

  test("fails when required browser report source is present but failed", async () => {
    const { outputDir, indexPath } = await createReportsIndexFixture([
      {
        source: "matrix",
        reportPath: "matrix/report.json",
        fileName: "report.json",
        status: "passed",
        passedCount: 1,
        failedCount: 0,
      },
      {
        source: "cli",
        reportPath: "cli/report.json",
        fileName: "report.json",
        status: "passed",
        passedCount: 1,
        failedCount: 0,
      },
      {
        source: "studio",
        reportPath: "studio/report.json",
        fileName: "report.json",
        status: "passed",
        passedCount: 1,
        failedCount: 0,
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
    const summaryPath = join(outputDir, "summary.md")

    const result = await runGateProcess({
      ELYSIAN_REPORT_DIR: outputDir,
      ELYSIAN_REPORT_GATE_INDEX_PATH: indexPath,
      ELYSIAN_REPORT_GATE_REQUIRED_SOURCES: "matrix,cli,studio,browser",
      GITHUB_STEP_SUMMARY: summaryPath,
    })

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain(
      "[gate] fail source=browser reportPath=browser/report.json",
    )
    expect(result.stderr).toContain("For browser failures")

    const report = JSON.parse(
      await readFile(
        join(outputDir, "e2e-generator-reports-gate.json"),
        "utf8",
      ),
    ) as {
      status: "passed" | "failed"
      effectiveFailedReports: number
      missingRequiredSources: string[]
      blockedFailedItems: Array<{ source: string; reportPath: string }>
      recommendedActions: string[]
    }

    expect(report.status).toBe("failed")
    expect(report.effectiveFailedReports).toBe(1)
    expect(report.missingRequiredSources).toEqual([])
    expect(report.blockedFailedItems).toEqual([
      expect.objectContaining({
        source: "browser",
        reportPath: "browser/report.json",
      }),
    ])
    expect(
      report.recommendedActions.some((action) =>
        action.includes("For browser failures"),
      ),
    ).toBeTrue()
    expect(await readFile(summaryPath, "utf8")).toContain(
      "- `browser`: `browser/report.json`",
    )
  })
})
