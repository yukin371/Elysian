import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  buildP5aHandoffCorpusGitHubOutputLines,
  readP5aHandoffCorpusManifest,
  renderP5aHandoffCorpusStepSummaryMarkdown,
  runP5aHandoffCorpus,
} from "./p5a-handoff-corpus"

describe("readP5aHandoffCorpusManifest", () => {
  test("rejects invalid expected decisions", async () => {
    const workspace = await mkdtemp(
      join(tmpdir(), "elysian-p5a-corpus-manifest-"),
    )

    try {
      const manifestPath = join(workspace, "invalid-manifest.json")

      await writeFile(
        manifestPath,
        JSON.stringify(
          {
            cases: [
              {
                id: "invalid",
                description: "invalid case",
                inputFilePath: "./input.txt",
                schemaFilePath: "./schema.json",
                expectedDecision: "not-a-real-decision",
                expectedStatus: "failed",
              },
            ],
          },
          null,
          2,
        ),
        "utf8",
      )

      await expect(readP5aHandoffCorpusManifest(manifestPath)).rejects.toThrow(
        'Corpus case "invalid" has an invalid expectedDecision.',
      )
    } finally {
      await rm(workspace, { recursive: true, force: true })
    }
  })
})

describe("runP5aHandoffCorpus", () => {
  test("runs mixed corpus cases and reports pass/fail counts", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "elysian-p5a-corpus-"))

    try {
      const inputPath = join(workspace, "task-input.txt")
      const validSchemaPath = join(workspace, "valid.module-schema.json")
      const invalidSchemaPath = join(workspace, "invalid.module-schema.json")
      const manifestPath = join(workspace, "corpus.json")
      const reportDir = join(workspace, "report")

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
        validSchemaPath,
        JSON.stringify(
          {
            name: "supplier",
            label: "Supplier",
            fields: [{ key: "id", label: "ID", kind: "id", required: true }],
          },
          null,
          2,
        ),
        "utf8",
      )
      await writeFile(
        invalidSchemaPath,
        JSON.stringify(
          {
            name: "supplier",
            label: "Supplier",
            permissions: ["supplier:view"],
            fields: [{ key: "id", label: "ID", kind: "id", required: true }],
          },
          null,
          2,
        ),
        "utf8",
      )
      await writeFile(
        manifestPath,
        JSON.stringify(
          {
            cases: [
              {
                id: "ready-case",
                description: "clean handoff should pass",
                inputFilePath: inputPath,
                schemaFilePath: validSchemaPath,
                expectedDecision: "ready_for_generator",
                expectedStatus: "passed",
              },
              {
                id: "retry-case",
                description: "top-level out-of-bound should retry",
                inputFilePath: inputPath,
                schemaFilePath: invalidSchemaPath,
                expectedDecision: "retry_ai_generation",
                expectedStatus: "failed",
              },
              {
                id: "mismatch-case",
                description: "wrong expectation should fail the corpus gate",
                inputFilePath: inputPath,
                schemaFilePath: validSchemaPath,
                expectedDecision: "manual_fix_required",
                expectedStatus: "failed",
              },
            ],
          },
          null,
          2,
        ),
        "utf8",
      )

      const report = await runP5aHandoffCorpus(manifestPath, reportDir)

      expect(report.status).toBe("failed")
      expect(report.passedCount).toBe(2)
      expect(report.failedCount).toBe(1)
      expect(report.cases).toContainEqual(
        expect.objectContaining({
          caseId: "ready-case",
          status: "passed",
          actualDecision: "ready_for_generator",
          actualStatus: "passed",
        }),
      )
      expect(report.cases).toContainEqual(
        expect.objectContaining({
          caseId: "retry-case",
          status: "passed",
          actualDecision: "retry_ai_generation",
          actualStatus: "failed",
        }),
      )
      expect(report.cases).toContainEqual(
        expect.objectContaining({
          caseId: "mismatch-case",
          status: "failed",
          mismatchReasons: [
            "Expected decision=manual_fix_required, got ready_for_generator.",
            "Expected status=failed, got passed.",
          ],
        }),
      )

      const caseReport = JSON.parse(
        await readFile(
          join(reportDir, "ready-case", "p5a-schema-handoff-report.json"),
          "utf8",
        ),
      ) as { decision: string; status: string }

      expect(caseReport.decision).toBe("ready_for_generator")
      expect(caseReport.status).toBe("passed")
    } finally {
      await rm(workspace, { recursive: true, force: true })
    }
  })
})

describe("p5a-handoff-corpus presentation helpers", () => {
  test("renders failed case details for GitHub step summary", () => {
    const markdown = renderP5aHandoffCorpusStepSummaryMarkdown({
      generatedAt: "2026-04-23T00:00:00.000Z",
      manifestPath: "corpus.json",
      reportDir: "report-dir",
      status: "failed",
      passedCount: 2,
      failedCount: 1,
      cases: [
        {
          caseId: "retry-case",
          description: "retry case",
          expectedDecision: "retry_ai_generation",
          actualDecision: "manual_fix_required",
          expectedStatus: "failed",
          actualStatus: "failed",
          status: "failed",
          reportMarkdownPath:
            "report-dir/retry-case/p5a-schema-handoff-summary.md",
          reportJsonPath:
            "report-dir/retry-case/p5a-schema-handoff-report.json",
          mismatchReasons: [
            "Expected decision=retry_ai_generation, got manual_fix_required.",
          ],
        },
      ],
    })

    expect(markdown).toContain("### P5A Handoff Corpus")
    expect(markdown).toContain("- status: `failed`")
    expect(markdown).toContain(
      "report-dir/retry-case/p5a-schema-handoff-summary.md",
    )
    expect(markdown).toContain(
      "Expected decision=retry_ai_generation, got manual_fix_required.",
    )
  })

  test("builds GitHub output lines for corpus status", () => {
    expect(
      buildP5aHandoffCorpusGitHubOutputLines({
        generatedAt: "2026-04-23T00:00:00.000Z",
        manifestPath: "corpus.json",
        reportDir: "report-dir",
        status: "passed",
        passedCount: 7,
        failedCount: 0,
        cases: [],
      }),
    ).toEqual([
      "p5a_corpus_status=passed",
      "p5a_corpus_passed_count=7",
      "p5a_corpus_failed_count=0",
    ])
  })
})
