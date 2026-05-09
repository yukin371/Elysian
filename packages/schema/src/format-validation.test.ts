import { describe, expect, it } from "bun:test"

import { formatValidationIssues } from "./format-validation"
import type { ModuleSchemaValidationIssue } from "./index"

describe("formatValidationIssues", () => {
  it("formats single issue", () => {
    const issues: ModuleSchemaValidationIssue[] = [
      { path: "name", message: "Module name must be a non-empty string." },
    ]
    const result = formatValidationIssues(issues)

    expect(result).toContain("name")
    expect(result).toContain("Module name must be a non-empty string")
    expect(result).toContain("1 issue")
  })

  it("formats multiple issues with field index", () => {
    const issues: ModuleSchemaValidationIssue[] = [
      {
        path: "fields[2].kind",
        message:
          "Field kind must be one of: id, string, number, boolean, enum, datetime.",
      },
      {
        path: "fields[2].key",
        message: "Field key must be a non-empty string.",
      },
    ]
    const result = formatValidationIssues(issues)

    expect(result).toContain("fields[2].kind")
    expect(result).toContain("2 issues")
  })

  it("returns no-issues message for empty array", () => {
    const result = formatValidationIssues([])

    expect(result).toContain("No issues")
  })

  it("suggests fix for missing id field", () => {
    const issues: ModuleSchemaValidationIssue[] = [
      {
        path: "fields",
        message: 'Module schema must contain exactly one "id" field.',
      },
    ]
    const result = formatValidationIssues(issues)

    expect(result).toContain('Add a field with key "id" and kind "id"')
  })

  it("suggests fix for enum without options", () => {
    const issues: ModuleSchemaValidationIssue[] = [
      {
        path: "fields[1]",
        message:
          "Enum field must provide non-empty options or dictionaryTypeCode.",
      },
    ]
    const result = formatValidationIssues(issues)

    expect(result).toContain("Add 'options' array or 'dictionaryTypeCode'")
  })

  it("suggests fix for unknown field kind", () => {
    const issues: ModuleSchemaValidationIssue[] = [
      {
        path: "fields[0].kind",
        message:
          "Field kind must be one of: id, string, number, boolean, enum, datetime.",
      },
    ]
    const result = formatValidationIssues(issues)

    expect(result).toContain(
      "Supported kinds: id, string, text, number, boolean, enum, json, datetime",
    )
  })

  it("includes text and json in supported kinds suggestion", () => {
    const result = formatValidationIssues([
      {
        path: "fields[0].kind",
        message:
          "Field kind must be one of: id, string, text, number, boolean, enum, json, datetime.",
      },
    ])

    expect(result).toContain("text")
    expect(result).toContain("json")
  })
})
