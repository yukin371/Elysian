import { describe, expect, it } from "bun:test"

import {
  customerModuleSchema,
  isModuleSchema,
  validateModuleSchema,
  validateWorkflowDefinitionDraft,
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

describe("validateWorkflowDefinitionDraft", () => {
  it("accepts a minimal round-1 workflow definition draft", () => {
    expect(
      validateWorkflowDefinitionDraft({
        nodes: [
          { id: "start", type: "start", name: "Start" },
          {
            id: "manager-review",
            type: "approval",
            name: "Manager Review",
            assignee: "role:manager",
          },
          {
            id: "amount-check",
            type: "condition",
            name: "Amount Check",
            conditions: [
              {
                expression: "${amount > 5000}",
                target: "finance-review",
              },
              {
                expression: "default",
                target: "approved",
              },
            ],
          },
          {
            id: "finance-review",
            type: "approval",
            name: "Finance Review",
            assignee: "role:finance",
          },
          { id: "approved", type: "end", name: "Approved" },
        ],
        edges: [
          { from: "start", to: "manager-review" },
          { from: "manager-review", to: "amount-check" },
          { from: "amount-check", to: "finance-review" },
          { from: "amount-check", to: "approved" },
          { from: "finance-review", to: "approved" },
        ],
      }),
    ).toEqual([])
  })

  it("rejects missing start nodes and unknown edge targets", () => {
    const issues = validateWorkflowDefinitionDraft({
      nodes: [
        {
          id: "manager-review",
          type: "approval",
          name: "Manager Review",
          assignee: "role:manager",
        },
        { id: "approved", type: "end", name: "Approved" },
      ],
      edges: [
        { from: "manager-review", to: "approved" },
        { from: "manager-review", to: "missing-node" },
      ],
    })

    expect(issues).toContainEqual({
      path: "nodes",
      message: 'Workflow definition must contain exactly one "start" node.',
    })
    expect(issues).toContainEqual({
      path: "edges[1].to",
      message:
        'Workflow edge target "missing-node" does not match any node id.',
    })
    expect(issues).toContainEqual({
      path: "nodes[0]",
      message:
        'Workflow node "manager-review" must have at least one incoming edge.',
    })
  })

  it("rejects unsupported condition expressions and missing default branches", () => {
    const issues = validateWorkflowDefinitionDraft({
      nodes: [
        { id: "start", type: "start", name: "Start" },
        {
          id: "amount-check",
          type: "condition",
          name: "Amount Check",
          conditions: [
            {
              expression: "${amount + 1}",
              target: "finance-review",
            },
          ],
        },
        {
          id: "finance-review",
          type: "approval",
          name: "Finance Review",
          assignee: "role:finance",
        },
        { id: "approved", type: "end", name: "Approved" },
      ],
      edges: [
        { from: "start", to: "amount-check" },
        { from: "amount-check", to: "finance-review" },
        { from: "amount-check", to: "approved" },
      ],
    })

    expect(issues).toContainEqual({
      path: "nodes[1].conditions[0].expression",
      message:
        'Condition branch expression must be "default" or a comparison like ${amount > 5000}.',
    })
    expect(issues).toContainEqual({
      path: "nodes[1].conditions",
      message: 'Condition node must provide exactly one "default" branch.',
    })
    expect(issues).toContainEqual({
      path: "nodes[1]",
      message:
        "Condition node outgoing edges must match condition branch targets one-to-one.",
    })
  })
})
