import { describe, expect, it } from "bun:test"
import { t } from "elysia"

import {
  customerModuleSchema,
  deriveBodySchema,
  isModuleSchema,
  registeredModuleSchemas,
  roleModuleSchema,
  validateModuleSchema,
  validateWorkflowDefinitionDraft,
} from "./index"

type DerivedBodyObjectSchema = {
  properties: Record<string, { minLength?: number }>
  required?: string[]
}

function isDerivedBodyObjectSchema(
  schema: ReturnType<typeof deriveBodySchema>,
): schema is ReturnType<typeof deriveBodySchema> & DerivedBodyObjectSchema {
  return "properties" in schema
}

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

  it("accepts bounded frontend registration metadata", () => {
    const issues = validateModuleSchema({
      name: "supplier",
      label: "Supplier",
      frontend: {
        workspaceDomain: "system",
        routePath: "/system/suppliers",
        permissionPrefix: "system:supplier",
      },
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        { key: "name", label: "Name", kind: "string", required: true },
      ],
    })

    expect(issues).toEqual([])
  })

  it("accepts text field kind", () => {
    const issues = validateModuleSchema({
      name: "article",
      label: "Article",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        { key: "content", label: "Content", kind: "text" },
      ],
    })

    expect(issues).toEqual([])
  })

  it("accepts json field kind", () => {
    const issues = validateModuleSchema({
      name: "config",
      label: "Config",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        { key: "payload", label: "Payload", kind: "json" },
      ],
    })

    expect(issues).toEqual([])
  })

  it("rejects malformed frontend registration metadata", () => {
    const issues = validateModuleSchema({
      name: "supplier",
      label: "Supplier",
      frontend: {
        workspaceDomain: "admin",
        routePath: "system/suppliers",
        permissionPrefix: " ",
        icon: "briefcase",
      },
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        { key: "name", label: "Name", kind: "string", required: true },
      ],
    })

    expect(issues).toContainEqual({
      path: "frontend.workspaceDomain",
      message:
        'Frontend workspaceDomain must be either "business" or "system".',
    })
    expect(issues).toContainEqual({
      path: "frontend.routePath",
      message: 'Frontend routePath must start with "/".',
    })
    expect(issues).toContainEqual({
      path: "frontend.permissionPrefix",
      message:
        "Frontend permissionPrefix must be a non-empty string when provided.",
    })
    expect(issues).toContainEqual({
      path: "frontend.icon",
      message: 'Frontend metadata does not allow unknown property "icon".',
    })
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

  it("accepts bounded field validation metadata", () => {
    const issues = validateModuleSchema({
      name: "supplier",
      label: "Supplier",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        {
          key: "code",
          label: "Code",
          kind: "string",
          required: true,
          validation: { minLength: 1, maxLength: 32 },
        },
        {
          key: "sort",
          label: "Sort",
          kind: "number",
          validation: { minimum: 0, maximum: 999 },
        },
      ],
    })

    expect(issues).toEqual([])
  })

  it("rejects malformed field validation metadata", () => {
    const issues = validateModuleSchema({
      name: "supplier",
      label: "Supplier",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        {
          key: "code",
          label: "Code",
          kind: "string",
          required: true,
          validation: { minLength: -1, pattern: ".*" },
        },
        {
          key: "sort",
          label: "Sort",
          kind: "number",
          validation: { minimum: 10, maximum: 1 },
        },
      ],
    })

    expect(issues).toContainEqual({
      path: "fields[1].validation.pattern",
      message: 'Field validation does not allow unknown property "pattern".',
    })
    expect(issues).toContainEqual({
      path: "fields[1].validation.minLength",
      message:
        "Field validation minLength must be a non-negative integer when provided.",
    })
    expect(issues).toContainEqual({
      path: "fields[2].validation",
      message: "Field validation minimum must not exceed maximum.",
    })
  })
})

describe("deriveBodySchema", () => {
  it("derives a create body with validation and overrides", () => {
    const schema = deriveBodySchema(roleModuleSchema, {
      mode: "create",
      overrides: {
        dataScope: t.Optional(
          t.Union([
            t.Literal(1),
            t.Literal(2),
            t.Literal(3),
            t.Literal(4),
            t.Literal(5),
          ]),
        ),
        isSystem: t.Optional(t.Boolean()),
        permissionCodes: t.Optional(t.Array(t.String({ minLength: 1 }))),
        status: t.Optional(
          t.Union([t.Literal("active"), t.Literal("disabled")]),
        ),
      },
    })
    expect(isDerivedBodyObjectSchema(schema)).toBe(true)

    if (!isDerivedBodyObjectSchema(schema)) {
      throw new Error("Expected deriveBodySchema to return an object schema.")
    }

    expect(Object.keys(schema.properties)).toEqual([
      "code",
      "name",
      "description",
      "status",
      "isSystem",
      "dataScope",
      "permissionCodes",
    ])
    expect(schema.required).toEqual(["code", "name"])
    expect(schema.properties.code?.minLength).toBe(1)
    expect(schema.properties.name?.minLength).toBe(1)
  })

  it("derives an update body with excluded datetime fields", () => {
    const schema = deriveBodySchema(roleModuleSchema, {
      mode: "update",
    })
    expect(isDerivedBodyObjectSchema(schema)).toBe(true)

    if (!isDerivedBodyObjectSchema(schema)) {
      throw new Error("Expected deriveBodySchema to return an object schema.")
    }

    expect(schema.required).toBeUndefined()
    expect(Object.keys(schema.properties)).toEqual([
      "code",
      "name",
      "description",
      "status",
      "isSystem",
      "dataScope",
    ])
  })
})

describe("registeredModuleSchemas", () => {
  it("exports the registered schema registry without sample fixtures", () => {
    expect(registeredModuleSchemas.map((schema) => schema.name)).toEqual([
      "customer",
      "department",
      "dictionary",
      "file",
      "menu",
      "notification",
      "operation-log",
      "post",
      "product",
      "role",
      "setting",
      "tenant",
      "user",
      "workflow-definition",
    ])
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
