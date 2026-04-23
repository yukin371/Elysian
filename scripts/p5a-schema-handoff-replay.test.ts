import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

describe("p5a-schema-handoff-replay", () => {
  test("fails on invalid schema and passes after manual fix", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "elysian-p5a-replay-"))

    try {
      const inputPath = join(workspace, "task-input.txt")
      const invalidSchemaPath = join(workspace, "invalid.module-schema.json")
      const fixedSchemaPath = join(workspace, "fixed.module-schema.json")
      const invalidReportDir = join(workspace, "invalid-report")
      const replayReportDir = join(workspace, "replay-report")
      const reportSummaryPath = join(workspace, "report-step-summary.md")
      const reportOutputPath = join(workspace, "report-github-output.txt")
      const replaySummaryPath = join(workspace, "replay-step-summary.md")
      const replayOutputPath = join(workspace, "replay-github-output.txt")

      await writeFile(
        inputPath,
        `任务目标：
业务背景：
范围边界（必须/禁止）：
影响模块：
验收标准：
验证命令：
文档同步要求：`,
        "utf8",
      )
      await writeFile(
        invalidSchemaPath,
        JSON.stringify(
          {
            name: "supplier",
            label: "Supplier",
            fields: [{ key: "name", label: "Name", kind: "string" }],
          },
          null,
          2,
        ),
        "utf8",
      )
      await writeFile(
        fixedSchemaPath,
        JSON.stringify(
          {
            name: "supplier",
            label: "Supplier",
            fields: [
              { key: "id", label: "ID", kind: "id", required: true },
              {
                key: "name",
                label: "Name",
                kind: "string",
                required: true,
                searchable: true,
              },
            ],
          },
          null,
          2,
        ),
        "utf8",
      )

      const invalidRun = Bun.spawn(
        [
          "bun",
          "scripts/p5a-schema-handoff-report.ts",
          "--input-file",
          inputPath,
          "--schema-file",
          invalidSchemaPath,
          "--report-dir",
          invalidReportDir,
        ],
        {
          cwd: process.cwd(),
          env: {
            ...process.env,
            GITHUB_STEP_SUMMARY: reportSummaryPath,
            GITHUB_OUTPUT: reportOutputPath,
          },
          stdout: "pipe",
          stderr: "pipe",
        },
      )
      const invalidCode = await invalidRun.exited

      expect(invalidCode).toBe(1)

      const replayRun = Bun.spawn(
        [
          "bun",
          "scripts/p5a-schema-handoff-replay.ts",
          "--input-file",
          inputPath,
          "--schema-file",
          fixedSchemaPath,
          "--report-dir",
          replayReportDir,
          "--generate",
          "--out",
          join(workspace, "generated"),
        ],
        {
          cwd: process.cwd(),
          env: {
            ...process.env,
            GITHUB_STEP_SUMMARY: replaySummaryPath,
            GITHUB_OUTPUT: replayOutputPath,
          },
          stdout: "pipe",
          stderr: "pipe",
        },
      )
      const replayCode = await replayRun.exited

      expect(replayCode).toBe(0)

      const handoffReportRaw = await readFile(
        join(replayReportDir, "p5a-schema-handoff-report.json"),
        "utf8",
      )
      const handoffReport = JSON.parse(handoffReportRaw) as {
        decision: string
        status: string
      }
      const replayReportRaw = await readFile(
        join(replayReportDir, "p5a-schema-handoff-replay-report.json"),
        "utf8",
      )
      const replayReport = JSON.parse(replayReportRaw) as {
        status: string
        steps: {
          handoff: string
          generator: string
        }
        outputs: {
          generatedSchemaArtifactPath?: string | null
        }
      }

      expect(handoffReport.decision).toBe("ready_for_generator")
      expect(handoffReport.status).toBe("passed")
      expect(replayReport.status).toBe("passed")
      expect(replayReport.steps.handoff).toBe("passed")
      expect(replayReport.steps.generator).toBe("passed")
      expect(replayReport.outputs.generatedSchemaArtifactPath).toContain(
        "supplier.schema.ts",
      )

      const generatedSchema = await readFile(
        join(
          workspace,
          "generated",
          "modules",
          "supplier",
          "supplier.schema.ts",
        ),
        "utf8",
      )

      expect(generatedSchema).toContain("export const supplierModuleSchema")
      const replaySummary = await readFile(
        join(replayReportDir, "p5a-schema-handoff-replay-summary.md"),
        "utf8",
      )

      expect(replaySummary).toContain("# P5A Handoff Replay Summary")
      expect(replaySummary).toContain("generator: passed")
      const reportStepSummary = await readFile(reportSummaryPath, "utf8")
      const reportGitHubOutput = await readFile(reportOutputPath, "utf8")
      const replayStepSummary = await readFile(replaySummaryPath, "utf8")
      const replayGitHubOutput = await readFile(replayOutputPath, "utf8")

      expect(reportStepSummary).toContain("### P5A Schema Handoff")
      expect(reportGitHubOutput).toContain(
        "p5a_handoff_decision=retry_ai_generation",
      )
      expect(replayStepSummary).toContain("### P5A Handoff Replay")
      expect(replayGitHubOutput).toContain("p5a_replay_status=passed")
      expect(replayGitHubOutput).toContain("p5a_replay_generator=passed")
    } finally {
      await rm(workspace, { recursive: true, force: true })
    }
  })
})
