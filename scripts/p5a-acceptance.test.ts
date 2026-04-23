import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  buildP5aAcceptanceGitHubOutputLines,
  renderP5aAcceptanceStepSummaryMarkdown,
  run,
} from "./p5a-acceptance"

const tempDirs: string[] = []

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true })
  }
  process.exitCode = 0
})

const createTempDir = async (prefix: string) => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

describe("p5a-acceptance", () => {
  test("runs corpus and multiple replay/generator cases as a single acceptance flow", async () => {
    const reportDir = await createTempDir("elysian-p5a-acceptance-report-")
    const outputDir = await createTempDir("elysian-p5a-acceptance-output-")

    const report = await run({
      reportDir,
      outputDir,
    })

    expect(report.status).toBe("passed")
    expect(report.steps.corpus).toBe("passed")
    expect(report.steps.replay).toBe("passed")
    expect(report.steps.generator).toBe("passed")
    expect(report.cases).toHaveLength(6)
    expect(report.cases.map((item) => item.caseId)).toEqual([
      "manual-fix-supplier",
      "supplier-ready",
      "visitor-pass-ready",
      "asset-ready",
      "service-ticket-ready",
      "meeting-booking-ready",
    ])

    const acceptanceReport = JSON.parse(
      await readFile(join(reportDir, "p5a-acceptance-report.json"), "utf8"),
    ) as {
      status: string
      cases: Array<{
        caseId: string
        reportPath?: string
        summaryPath?: string
        generatedSchemaArtifactPath?: string
      }>
    }

    expect(acceptanceReport.status).toBe("passed")
    expect(acceptanceReport.cases).toHaveLength(6)
    expect(acceptanceReport.cases[0]?.reportPath).toContain(
      "p5a-schema-handoff-replay-report.json",
    )
    expect(acceptanceReport.cases[0]?.summaryPath).toContain(
      "p5a-schema-handoff-replay-summary.md",
    )
    expect(acceptanceReport.cases[0]?.generatedSchemaArtifactPath).toContain(
      "supplier.schema.ts",
    )

    const supplierSchemaArtifact = await readFile(
      join(
        outputDir,
        "manual-fix-supplier",
        "modules",
        "supplier",
        "supplier.schema.ts",
      ),
      "utf8",
    )
    const visitorPassSchemaArtifact = await readFile(
      join(
        outputDir,
        "visitor-pass-ready",
        "modules",
        "visitorPass",
        "visitorPass.schema.ts",
      ),
      "utf8",
    )
    const supplierReadySchemaArtifact = await readFile(
      join(
        outputDir,
        "supplier-ready",
        "modules",
        "supplier",
        "supplier.schema.ts",
      ),
      "utf8",
    )
    const assetSchemaArtifact = await readFile(
      join(outputDir, "asset-ready", "modules", "asset", "asset.schema.ts"),
      "utf8",
    )
    const serviceTicketSchemaArtifact = await readFile(
      join(
        outputDir,
        "service-ticket-ready",
        "modules",
        "serviceTicket",
        "serviceTicket.schema.ts",
      ),
      "utf8",
    )
    const meetingBookingSchemaArtifact = await readFile(
      join(
        outputDir,
        "meeting-booking-ready",
        "modules",
        "meetingBooking",
        "meetingBooking.schema.ts",
      ),
      "utf8",
    )

    expect(supplierSchemaArtifact).toContain(
      "export const supplierModuleSchema",
    )
    expect(supplierReadySchemaArtifact).toContain(
      "export const supplierModuleSchema",
    )
    expect(visitorPassSchemaArtifact).toContain(
      "export const visitorPassModuleSchema",
    )
    expect(assetSchemaArtifact).toContain("export const assetModuleSchema")
    expect(serviceTicketSchemaArtifact).toContain(
      "export const serviceTicketModuleSchema",
    )
    expect(meetingBookingSchemaArtifact).toContain(
      "export const meetingBookingModuleSchema",
    )
  })
})

describe("p5a-acceptance presentation helpers", () => {
  test("renders failed case details for GitHub step summary", () => {
    const markdown = renderP5aAcceptanceStepSummaryMarkdown({
      generatedAt: "2026-04-23T00:00:00.000Z",
      status: "failed",
      steps: {
        corpus: "passed",
        replay: "failed",
        generator: "failed",
      },
      inputs: {
        manifestPath: "corpus.json",
        acceptanceCasesPath: "acceptance.json",
        frontendTarget: "vue",
        conflictStrategy: "skip",
      },
      outputs: {
        reportDir: "report-dir",
        corpusReportPath: "report-dir/corpus.json",
        corpusSummaryPath: "report-dir/corpus.md",
        outputDir: "report-dir/generated",
      },
      cases: [
        {
          caseId: "service-ticket-ready",
          description: "service ticket",
          inputFilePath: "service-ticket-input.txt",
          schemaFilePath: "service-ticket.module-schema.json",
          replay: "failed",
          generator: "failed",
          status: "failed",
          summaryPath:
            "report-dir/replay/service-ticket-ready/p5a-schema-handoff-summary.md",
          outputDir: "report-dir/generated/service-ticket-ready",
        },
      ],
    })

    expect(markdown).toContain("### P5A Acceptance")
    expect(markdown).toContain("- status: `failed`")
    expect(markdown).toContain("service-ticket-ready")
    expect(markdown).toContain(
      "report-dir/replay/service-ticket-ready/p5a-schema-handoff-summary.md",
    )
  })

  test("builds GitHub output lines for acceptance status", () => {
    expect(
      buildP5aAcceptanceGitHubOutputLines({
        generatedAt: "2026-04-23T00:00:00.000Z",
        status: "passed",
        steps: {
          corpus: "passed",
          replay: "passed",
          generator: "passed",
        },
        inputs: {
          manifestPath: "corpus.json",
          acceptanceCasesPath: "acceptance.json",
          frontendTarget: "vue",
          conflictStrategy: "skip",
        },
        outputs: {
          reportDir: "report-dir",
          corpusReportPath: "report-dir/corpus.json",
          corpusSummaryPath: "report-dir/corpus.md",
          outputDir: "report-dir/generated",
        },
        cases: [
          {
            caseId: "supplier",
            description: "supplier",
            inputFilePath: "supplier-input.txt",
            schemaFilePath: "supplier.module-schema.json",
            replay: "passed",
            generator: "passed",
            status: "passed",
            outputDir: "report-dir/generated/supplier",
          },
        ],
      }),
    ).toEqual([
      "p5a_acceptance_status=passed",
      "p5a_acceptance_case_count=1",
      "p5a_acceptance_replay=passed",
      "p5a_acceptance_generator=passed",
    ])
  })
})
