import { describe, expect, test } from "bun:test"

import {
  buildConclusion,
  buildGitHubOutputLines,
  buildRecommendedActions,
  buildRetryRecommendation,
  parseSmokeReport,
  renderDiagnosisSummaryMarkdown,
} from "./e2e-smoke-report-diagnose"

describe("parseSmokeReport", () => {
  test("parses valid passed report", () => {
    const report = parseSmokeReport(
      JSON.stringify({
        generatedAt: "2026-04-22T00:00:00.000Z",
        status: "passed",
        baseUrl: "http://127.0.0.1:3100",
        durationMs: 1000,
        lastStage: "customer_verify_deleted",
        failureCategory: null,
        failureMessage: null,
      }),
    )

    expect(report.status).toBe("passed")
    expect(report.failureCategory).toBeNull()
  })

  test("throws on invalid status", () => {
    expect(() =>
      parseSmokeReport(
        JSON.stringify({
          status: "unknown",
          lastStage: "auth_login",
          failureCategory: "dependency",
          failureMessage: "x",
        }),
      ),
    ).toThrow("Invalid smoke report: status is missing")
  })
})

describe("buildRecommendedActions", () => {
  test("returns no action on passed report", () => {
    expect(
      buildRecommendedActions({
        status: "passed",
        failureCategory: null,
        lastStage: "customer_verify_deleted",
      }),
    ).toEqual(["No action required."])
  })

  test("adds category and stage specific actions", () => {
    const actions = buildRecommendedActions({
      status: "failed",
      failureCategory: "test_case",
      lastStage: "customer_update",
    })

    expect(
      actions.some((item) => item.includes("Re-run smoke locally")),
    ).toBeTrue()
    expect(
      actions.some((item) => item.includes("customer module route/repository")),
    ).toBeTrue()
  })

  test("adds workflow specific action for workflow stages", () => {
    const actions = buildRecommendedActions({
      status: "failed",
      failureCategory: "test_case",
      lastStage: "workflow_conditional_branch_finance_complete",
    })

    expect(
      actions.some((item) =>
        item.includes("workflow definition/task transition"),
      ),
    ).toBeTrue()
  })
})

describe("buildConclusion", () => {
  test("returns failed conclusion with stage and category", () => {
    expect(
      buildConclusion({
        status: "failed",
        failureCategory: "dependency",
        lastStage: "module_readiness",
      }),
    ).toContain("stage=module_readiness, category=dependency")
  })
})

describe("renderDiagnosisSummaryMarkdown", () => {
  test("renders markdown summary with recommended actions", () => {
    const markdown = renderDiagnosisSummaryMarkdown({
      generatedAt: "2026-04-22T00:00:00.000Z",
      sourceReportPath: "tmp/e2e-smoke-report.json",
      status: "failed",
      failureCategory: "dependency",
      lastStage: "module_readiness",
      conclusion:
        "Smoke report failed at stage=module_readiness, category=dependency.",
      retryRecommendation: {
        shouldRetry: true,
        reason:
          "Dependency-type failures are usually transient in CI (service readiness/network).",
      },
      recommendedActions: ["Check PostgreSQL service health."],
    })

    expect(markdown).toContain("### E2E Smoke Diagnosis")
    expect(markdown).toContain("- status: `failed`")
    expect(markdown).toContain("- failureCategory: `dependency`")
    expect(markdown).toContain("- shouldRetry: `true`")
    expect(markdown).toContain("Check PostgreSQL service health.")
  })
})

describe("buildRetryRecommendation", () => {
  test("recommends retry for dependency failures", () => {
    expect(
      buildRetryRecommendation({
        status: "failed",
        failureCategory: "dependency",
      }),
    ).toEqual({
      shouldRetry: true,
      reason:
        "Dependency-type failures are usually transient in CI (service readiness/network).",
    })
  })

  test("does not recommend retry for environment failures", () => {
    expect(
      buildRetryRecommendation({
        status: "failed",
        failureCategory: "environment",
      }),
    ).toEqual({
      shouldRetry: false,
      reason: "Environment configuration issues should be fixed before retry.",
    })
  })
})

describe("buildGitHubOutputLines", () => {
  test("renders expected GitHub output key-value lines", () => {
    expect(
      buildGitHubOutputLines({
        generatedAt: "2026-04-22T00:00:00.000Z",
        sourceReportPath: "tmp/e2e-smoke-report.json",
        status: "failed",
        failureCategory: "dependency",
        lastStage: "module_readiness",
        conclusion:
          "Smoke report failed at stage=module_readiness, category=dependency.",
        retryRecommendation: {
          shouldRetry: true,
          reason:
            "Dependency-type failures are usually transient in CI (service readiness/network).",
        },
        recommendedActions: ["Check PostgreSQL service health."],
      }),
    ).toEqual([
      "smoke_status=failed",
      "smoke_should_retry=true",
      "smoke_failure_category=dependency",
      "smoke_last_stage=module_readiness",
    ])
  })
})
