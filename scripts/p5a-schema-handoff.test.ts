import { describe, expect, test } from "bun:test"

import {
  buildP5aRecommendedActions,
  decideP5aHandoff,
  renderP5aSummaryMarkdown,
  validateTaskInputTemplate,
} from "./p5a-schema-handoff"

describe("validateTaskInputTemplate", () => {
  test("accepts a task input that contains all required sections", () => {
    const issues = validateTaskInputTemplate(`任务目标：
业务背景：
范围边界（必须/禁止）：
影响模块：
验收标准：
验证命令：
文档同步要求：`)

    expect(issues).toEqual([])
  })

  test("reports missing required sections", () => {
    const issues = validateTaskInputTemplate(`任务目标：
业务背景：`)

    expect(
      issues.some((issue) => issue.section === "范围边界（必须/禁止）："),
    ).toBeTrue()
    expect(
      issues.some((issue) => issue.section === "文档同步要求："),
    ).toBeTrue()
  })
})

describe("decideP5aHandoff", () => {
  test("returns rollback_to_template when task input sections are missing", () => {
    expect(
      decideP5aHandoff([{ section: "验证命令：", message: "missing" }], []),
    ).toBe("rollback_to_template")
  })

  test("returns retry_ai_generation for top-level schema shape issues", () => {
    expect(
      decideP5aHandoff(
        [],
        [
          {
            path: "fields",
            message: "Module fields must be a non-empty array.",
          },
        ],
      ),
    ).toBe("retry_ai_generation")
  })

  test("returns manual_fix_required for field-level schema issues", () => {
    expect(
      decideP5aHandoff(
        [],
        [
          {
            path: "fields[1].key",
            message: 'Field key "status" duplicates fields[0].key.',
          },
        ],
      ),
    ).toBe("manual_fix_required")
  })
})

describe("buildP5aRecommendedActions", () => {
  test("returns generator continuation actions when ready", () => {
    expect(buildP5aRecommendedActions("ready_for_generator", [], [])).toEqual([
      "Handoff is ready. Continue with generator using --schema-file.",
      "Keep the validated schema file as the canonical replay input.",
    ])
  })
})

describe("renderP5aSummaryMarkdown", () => {
  test("renders a compact summary", () => {
    const markdown = renderP5aSummaryMarkdown({
      generatedAt: "2026-04-23T00:00:00.000Z",
      inputFilePath: "input.txt",
      schemaFilePath: "schema.json",
      reportDir: "report-dir",
      status: "failed",
      decision: "manual_fix_required",
      taskInputIssues: [],
      schemaIssues: [{ path: "fields[1].key", message: "duplicate" }],
      recommendedActions: ["Fix duplicate field key."],
    })

    expect(markdown).toContain("# P5A Schema Handoff Summary")
    expect(markdown).toContain("- decision: manual_fix_required")
    expect(markdown).toContain("- Fix duplicate field key.")
  })
})
