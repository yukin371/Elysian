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

  it("rejects enum fields without options or dictionary type code", () => {
    const issues = validateModuleSchema({
      name: "meetingBooking",
      label: "Meeting Booking",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        {
          key: "status",
          label: "Status",
          kind: "enum",
          required: true,
        },
      ],
    })

    expect(issues).toContainEqual({
      path: "fields[1]",
      message:
        "Enum field must provide non-empty options or dictionaryTypeCode.",
    })
  })

  it("rejects out-of-bound top-level metadata", () => {
    const issues = validateModuleSchema({
      name: "supplier",
      label: "Supplier",
      permissions: ["supplier:view"],
      menus: [{ code: "supplier" }],
      workflow: { approval: true },
      fields: [{ key: "id", label: "ID", kind: "id", required: true }],
    })

    expect(issues).toContainEqual({
      path: "permissions",
      message: 'Module schema does not allow unknown property "permissions".',
    })
    expect(issues).toContainEqual({
      path: "menus",
      message: 'Module schema does not allow unknown property "menus".',
    })
    expect(issues).toContainEqual({
      path: "workflow",
      message: 'Module schema does not allow unknown property "workflow".',
    })
    expect(
      isModuleSchema({
        name: "supplier",
        label: "Supplier",
        permissions: ["supplier:view"],
        fields: [{ key: "id", label: "ID", kind: "id", required: true }],
      }),
    ).toBe(false)
  })

  it("rejects out-of-bound field and option metadata", () => {
    const issues = validateModuleSchema({
      name: "supplier",
      label: "Supplier",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true, ui: "hidden" },
        {
          key: "status",
          label: "Status",
          kind: "enum",
          options: [{ label: "Enabled", value: "enabled", color: "green" }],
          source: "dictionary",
        },
      ],
    })

    expect(issues).toContainEqual({
      path: "fields[0].ui",
      message: 'Field does not allow unknown property "ui".',
    })
    expect(issues).toContainEqual({
      path: "fields[1].source",
      message: 'Field does not allow unknown property "source".',
    })
    expect(issues).toContainEqual({
      path: "fields[1].options[0].color",
      message: 'Field option does not allow unknown property "color".',
    })
  })
})
