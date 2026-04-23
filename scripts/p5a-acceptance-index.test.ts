import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  buildP5aAcceptanceIndexGitHubOutputLines,
  renderP5aAcceptanceIndexSummaryMarkdown,
  run,
  validateP5aAcceptanceIndexInputs,
} from "./p5a-acceptance-index"

const tempDirs: string[] = []
const envKeys = [
  "ELYSIAN_REPORT_DIR",
  "ELYSIAN_P5A_ACCEPTANCE_REPORT_PATH",
  "ELYSIAN_P5A_ACCEPTANCE_GATE_REPORT_PATH",
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

describe("p5a-acceptance-index", () => {
  test("builds a single index from acceptance and gate reports", async () => {
    const reportDir = await createTempDir("elysian-p5a-acceptance-index-")
    const acceptanceReportPath = join(reportDir, "p5a-acceptance-report.json")
    const gateReportPath = join(reportDir, "p5a-acceptance-gate.json")

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
              caseId: "supplier",
              generator: "passed",
              generatedSchemaArtifactPath: "generated/supplier.schema.ts",
            },
            {
              caseId: "visitorPass",
              generator: "passed",
              generatedSchemaArtifactPath: "generated/visitorPass.schema.ts",
            },
            {
              caseId: "serviceTicket",
              generator: "passed",
              generatedSchemaArtifactPath: "generated/serviceTicket.schema.ts",
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    )

    await writeFile(
      gateReportPath,
      JSON.stringify(
        {
          generatedAt: "2026-04-23T00:05:00.000Z",
          status: "passed",
          summary: {
            acceptanceStatus: "passed",
            corpus: "passed",
            replay: "passed",
            generator: "passed",
            caseCount: 3,
            generatedArtifactCoverage: "complete",
          },
          recommendedActions: ["No action required."],
        },
        null,
        2,
      ),
      "utf8",
    )

    process.env.ELYSIAN_REPORT_DIR = reportDir
    process.env.ELYSIAN_P5A_ACCEPTANCE_REPORT_PATH = acceptanceReportPath
    process.env.ELYSIAN_P5A_ACCEPTANCE_GATE_REPORT_PATH = gateReportPath

    const report = await run()

    expect(report.status).toBe("passed")
    expect(report.summary.caseCount).toBe(3)
    expect(report.summary.generatedArtifactCoverage).toBe("complete")

    const persisted = JSON.parse(
      await readFile(
        join(reportDir, "acceptance", "p5a-acceptance-index.json"),
        "utf8",
      ),
    ) as { status: string }
    expect(persisted.status).toBe("passed")
  })
})

describe("p5a-acceptance-index helpers", () => {
  test("renders summary and output lines", () => {
    const summary = renderP5aAcceptanceIndexSummaryMarkdown({
      generatedAt: "2026-04-23T00:00:00.000Z",
      reportDir: "report-dir",
      status: "passed",
      inputs: {
        acceptanceReportPath: "acceptance.json",
        gateReportPath: "gate.json",
      },
      summary: {
        acceptanceStatus: "passed",
        gateStatus: "passed",
        corpus: "passed",
        replay: "passed",
        generator: "passed",
        caseCount: 3,
        generatedArtifactCoverage: "complete",
      },
      conclusion:
        "P5A acceptance index confirms the current gate boundary passed.",
      recommendedActions: ["No action required."],
    })

    expect(summary).toContain("### P5A Acceptance Index")
    expect(summary).toContain("- caseCount: `3`")

    expect(
      buildP5aAcceptanceIndexGitHubOutputLines({
        generatedAt: "2026-04-23T00:00:00.000Z",
        reportDir: "report-dir",
        status: "passed",
        inputs: {
          acceptanceReportPath: "acceptance.json",
          gateReportPath: "gate.json",
        },
        summary: {
          acceptanceStatus: "passed",
          gateStatus: "passed",
          corpus: "passed",
          replay: "passed",
          generator: "passed",
          caseCount: 3,
          generatedArtifactCoverage: "complete",
        },
        conclusion:
          "P5A acceptance index confirms the current gate boundary passed.",
        recommendedActions: ["No action required."],
      }),
    ).toEqual([
      "p5a_acceptance_index_status=passed",
      "p5a_acceptance_index_case_count=3",
      "p5a_acceptance_index_gate_status=passed",
      "p5a_acceptance_index_generated_artifact_coverage=complete",
    ])
  })

  test("rejects drift between acceptance and gate reports", () => {
    expect(() =>
      validateP5aAcceptanceIndexInputs(
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
              caseId: "supplier",
              generator: "passed",
              generatedSchemaArtifactPath: "generated/supplier.schema.ts",
            },
          ],
        },
        {
          generatedAt: "2026-04-23T00:05:00.000Z",
          status: "passed",
          summary: {
            acceptanceStatus: "failed",
            corpus: "passed",
            replay: "passed",
            generator: "passed",
            caseCount: 1,
            generatedArtifactCoverage: "complete",
          },
          recommendedActions: ["Inspect reports."],
        },
      ),
    ).toThrow(
      "Invalid P5A acceptance index input: gate acceptanceStatus does not match acceptance report",
    )
  })
})
