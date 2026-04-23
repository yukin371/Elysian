import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  buildP5aAcceptanceGateGitHubOutputLines,
  renderP5aAcceptanceGateSummaryMarkdown,
  run,
  validateP5aAcceptanceReport,
} from "./p5a-acceptance-gate"

const tempDirs: string[] = []
const envKeys = [
  "ELYSIAN_REPORT_DIR",
  "ELYSIAN_P5A_ACCEPTANCE_REPORT_PATH",
  "ELYSIAN_P5A_ACCEPTANCE_GATE_MIN_CASE_COUNT",
  "ELYSIAN_P5A_ACCEPTANCE_GATE_REQUIRE_GENERATED_ARTIFACTS",
] as const
const envSnapshot = new Map<string, string | undefined>()

for (const key of envKeys) {
  envSnapshot.set(key, process.env[key])
}

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }

  for (const key of envKeys) {
    const value = envSnapshot.get(key)
    if (value === undefined) {
      delete process.env[key]
      continue
    }
    process.env[key] = value
  }

  process.exitCode = 0
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("p5a-acceptance-gate", () => {
  test("passes when acceptance report meets the default policy", async () => {
    const reportDir = await createTempDir("elysian-p5a-acceptance-gate-")
    const acceptanceReportPath = join(reportDir, "p5a-acceptance-report.json")

    await writeFile(
      acceptanceReportPath,
      JSON.stringify(
        {
          generatedAt: "2026-04-23T00:00:00.000Z",
          status: "passed",
          steps: {
            corpus: "passed",
            replay: "passed",
            generator: "passed",
          },
          cases: [
            {
              caseId: "manual-fix-supplier",
              replay: "passed",
              generator: "passed",
              status: "passed",
              generatedSchemaArtifactPath: "generated/supplier.schema.ts",
            },
            {
              caseId: "visitor-pass-ready",
              replay: "passed",
              generator: "passed",
              status: "passed",
              generatedSchemaArtifactPath: "generated/visitor-pass.schema.ts",
            },
            {
              caseId: "service-ticket-ready",
              replay: "passed",
              generator: "passed",
              status: "passed",
              generatedSchemaArtifactPath: "generated/service-ticket.schema.ts",
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    )

    process.env.ELYSIAN_P5A_ACCEPTANCE_REPORT_PATH = acceptanceReportPath
    process.env.ELYSIAN_REPORT_DIR = reportDir

    const report = await run()

    expect(report.status).toBe("passed")
    expect(report.summary.caseCount).toBe(3)
    expect(report.summary.generatedArtifactCoverage).toBe("complete")

    const persisted = JSON.parse(
      await readFile(
        join(reportDir, "acceptance", "p5a-acceptance-gate.json"),
        "utf8",
      ),
    ) as { status: string }

    expect(persisted.status).toBe("passed")
  })

  test("fails when acceptance report drops below the minimum case boundary", async () => {
    const reportDir = await createTempDir(
      "elysian-p5a-acceptance-gate-min-case-",
    )
    const acceptanceReportPath = join(reportDir, "p5a-acceptance-report.json")

    await writeFile(
      acceptanceReportPath,
      JSON.stringify(
        {
          generatedAt: "2026-04-23T00:00:00.000Z",
          status: "passed",
          steps: {
            corpus: "passed",
            replay: "passed",
            generator: "passed",
          },
          cases: [
            {
              caseId: "manual-fix-supplier",
              replay: "passed",
              generator: "passed",
              status: "passed",
              generatedSchemaArtifactPath: "generated/supplier.schema.ts",
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    )

    process.env.ELYSIAN_P5A_ACCEPTANCE_REPORT_PATH = acceptanceReportPath
    process.env.ELYSIAN_P5A_ACCEPTANCE_GATE_MIN_CASE_COUNT = "2"
    process.env.ELYSIAN_REPORT_DIR = reportDir

    const report = await run()

    expect(report.status).toBe("failed")
    expect(report.conclusion).toContain("caseCount=1")
  })

  test("allows incomplete artifact coverage when policy disables artifact requirement", async () => {
    const reportDir = await createTempDir(
      "elysian-p5a-acceptance-gate-artifact-policy-",
    )
    const acceptanceReportPath = join(reportDir, "p5a-acceptance-report.json")

    await writeFile(
      acceptanceReportPath,
      JSON.stringify(
        {
          generatedAt: "2026-04-23T00:00:00.000Z",
          status: "passed",
          steps: {
            corpus: "passed",
            replay: "passed",
            generator: "passed",
          },
          cases: [
            {
              caseId: "manual-fix-supplier",
              replay: "passed",
              generator: "passed",
              status: "passed",
            },
            {
              caseId: "visitor-pass-ready",
              replay: "passed",
              generator: "passed",
              status: "passed",
            },
            {
              caseId: "service-ticket-ready",
              replay: "passed",
              generator: "passed",
              status: "passed",
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    )

    process.env.ELYSIAN_P5A_ACCEPTANCE_REPORT_PATH = acceptanceReportPath
    process.env.ELYSIAN_P5A_ACCEPTANCE_GATE_REQUIRE_GENERATED_ARTIFACTS =
      "false"
    process.env.ELYSIAN_REPORT_DIR = reportDir

    const report = await run()

    expect(report.status).toBe("passed")
    expect(report.summary.generatedArtifactCoverage).toBe("incomplete")
    expect(report.policy.requireGeneratedArtifacts).toBe(false)
  })
})

describe("p5a-acceptance-gate helpers", () => {
  test("renders summary and output lines", () => {
    const summary = renderP5aAcceptanceGateSummaryMarkdown({
      generatedAt: "2026-04-23T00:00:00.000Z",
      acceptanceReportPath: "report.json",
      status: "failed",
      policy: {
        minCaseCount: 3,
        requireGeneratedArtifacts: true,
        policyInputs: {
          minCaseCountRaw: "3",
          requireGeneratedArtifactsRaw: "true",
          acceptanceReportPathRaw: "report.json",
        },
      },
      summary: {
        acceptanceStatus: "passed",
        corpus: "passed",
        replay: "passed",
        generator: "passed",
        caseCount: 2,
        generatedArtifactCoverage: "incomplete",
      },
      conclusion: "P5A acceptance gate failed.",
      recommendedActions: ["Expand the acceptance manifest."],
    })

    expect(summary).toContain("### P5A Acceptance Gate")
    expect(summary).toContain("- caseCount: `2`")
    expect(summary).toContain("- generatedArtifactCoverage: `incomplete`")

    expect(
      buildP5aAcceptanceGateGitHubOutputLines({
        generatedAt: "2026-04-23T00:00:00.000Z",
        acceptanceReportPath: "report.json",
        status: "passed",
        policy: {
          minCaseCount: 3,
          requireGeneratedArtifacts: true,
          policyInputs: {
            minCaseCountRaw: "3",
            requireGeneratedArtifactsRaw: "true",
            acceptanceReportPathRaw: "report.json",
          },
        },
        summary: {
          acceptanceStatus: "passed",
          corpus: "passed",
          replay: "passed",
          generator: "passed",
          caseCount: 3,
          generatedArtifactCoverage: "complete",
        },
        conclusion: "P5A acceptance gate passed.",
        recommendedActions: ["No action required."],
      }),
    ).toEqual([
      "p5a_acceptance_gate_status=passed",
      "p5a_acceptance_gate_case_count=3",
      "p5a_acceptance_gate_min_case_count=3",
      "p5a_acceptance_gate_generated_artifact_coverage=complete",
    ])
  })

  test("rejects inconsistent acceptance reports", () => {
    expect(() =>
      validateP5aAcceptanceReport({
        generatedAt: "2026-04-23T00:00:00.000Z",
        status: "passed",
        steps: {
          corpus: "passed",
          replay: "failed",
          generator: "passed",
        },
        cases: [
          {
            caseId: "supplier",
            replay: "passed",
            generator: "passed",
            status: "passed",
            generatedSchemaArtifactPath: "generated/supplier.schema.ts",
          },
        ],
      }),
    ).toThrow(
      "Invalid P5A acceptance report: steps.replay does not match case replay results",
    )
  })
})
