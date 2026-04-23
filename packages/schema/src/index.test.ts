import { describe, expect, it } from "bun:test"

import {
  customerModuleSchema,
  isModuleSchema,
  validateModuleSchema,
} from "./index"

describe("validateModuleSchema", () => {
  it("accepts an existing module schema contract", () => {
    expect(validateModuleSchema(customerModuleSchema)).toEqual([])
    expect(isModuleSchema(customerModuleSchema)).toBe(true)
  })

  it("rejects schemas without a required id field", () => {
    const issues = validateModuleSchema({
      name: "feedback",
      label: "Feedback",
      fields: [
        { key: "title", label: "Title", kind: "string", required: true },
      ],
    })

    expect(issues).toContainEqual({
      path: "fields",
      message: 'Module schema must contain exactly one "id" field.',
    })
    expect(
      isModuleSchema({
        name: "feedback",
        label: "Feedback",
        fields: [
          { key: "title", label: "Title", kind: "string", required: true },
        ],
      }),
    ).toBe(false)
  })

  it("rejects duplicate keys and malformed enum options", () => {
    const issues = validateModuleSchema({
      name: "supplier",
      label: "Supplier",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        { key: "status", label: "Status", kind: "enum", options: [{}] },
        { key: "status", label: "Status Copy", kind: "enum" },
      ],
    })

    expect(issues).toContainEqual({
      path: "fields[2].key",
      message: 'Field key "status" duplicates fields[1].key.',
    })
    expect(issues).toContainEqual({
      path: "fields[1].options[0].label",
      message: "Field option label must be a non-empty string.",
    })
    expect(issues).toContainEqual({
      path: "fields[1].options[0].value",
      message: "Field option value must be a non-empty string.",
    })
  })
})
