import { describe, expect, it } from "bun:test"

import type { ModuleSchema } from "@elysian/schema"

import { buildModuleDatabaseChangePlan } from "./database-change-plan"

const ticketModuleSchema: ModuleSchema = {
  name: "ticket",
  label: "Ticket",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    { key: "title", label: "Title", kind: "string", required: true },
    {
      key: "status",
      label: "Status",
      kind: "enum",
      required: true,
      dictionaryTypeCode: "ticket_status",
      options: [
        { label: "Open", value: "open" },
        { label: "Closed", value: "closed" },
      ],
    },
    { key: "openedAt", label: "Opened At", kind: "datetime" },
  ],
}

describe("buildModuleDatabaseChangePlan", () => {
  it("builds a reviewable create-table plan from module schema", () => {
    const plan = buildModuleDatabaseChangePlan(ticketModuleSchema)
    const table = plan.operations[0]

    expect(plan).toMatchObject({
      canonicalMigrationOwner: "packages/persistence",
      dialect: "postgresql",
      reviewRequired: true,
      sourceSchemaName: "ticket",
    })
    expect(table).toMatchObject({
      operation: "create-table",
      sourceSchemaName: "ticket",
      tableName: "tickets",
    })
    expect(table?.columns).toEqual([
      {
        defaultExpression: "gen_random_uuid()",
        dictionaryTypeCode: null,
        enumOptions: [],
        name: "id",
        primaryKey: true,
        required: true,
        sourceFieldKey: "id",
        sourceFieldKind: "id",
        sqlType: "uuid",
      },
      {
        defaultExpression: null,
        dictionaryTypeCode: null,
        enumOptions: [],
        name: "title",
        primaryKey: false,
        required: true,
        sourceFieldKey: "title",
        sourceFieldKind: "string",
        sqlType: "text",
      },
      {
        defaultExpression: null,
        dictionaryTypeCode: "ticket_status",
        enumOptions: ["open", "closed"],
        name: "status",
        primaryKey: false,
        required: true,
        sourceFieldKey: "status",
        sourceFieldKind: "enum",
        sqlType: "text",
      },
      {
        defaultExpression: null,
        dictionaryTypeCode: null,
        enumOptions: [],
        name: "opened_at",
        primaryKey: false,
        required: false,
        sourceFieldKey: "openedAt",
        sourceFieldKind: "datetime",
        sqlType: "timestamptz",
      },
    ])
    expect(table?.notes).toEqual([
      "Enum fields remain review-only at this stage; packages/persistence chooses the final enum/check/dictionary persistence strategy.",
    ])
  })

  it("maps text kind to text sql type", () => {
    const plan = buildModuleDatabaseChangePlan({
      name: "article",
      label: "Article",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        { key: "body", label: "Body", kind: "text" },
      ],
    })
    const bodyColumn = plan.operations[0]?.columns.find(
      (column) => column.name === "body",
    )

    expect(bodyColumn).toBeDefined()
    expect(bodyColumn?.sqlType).toBe("text")
  })

  it("maps json kind to jsonb sql type", () => {
    const plan = buildModuleDatabaseChangePlan({
      name: "config",
      label: "Config",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        { key: "payload", label: "Payload", kind: "json" },
      ],
    })
    const payloadColumn = plan.operations[0]?.columns.find(
      (column) => column.name === "payload",
    )

    expect(payloadColumn).toBeDefined()
    expect(payloadColumn?.sqlType).toBe("jsonb")
  })

  it("pluralizes snake_case table names for schema names ending with s", () => {
    const plan = buildModuleDatabaseChangePlan({
      name: "visitorPass",
      label: "Visitor Pass",
      fields: [{ key: "id", label: "ID", kind: "id", required: true }],
    })

    expect(plan.operations[0]?.tableName).toBe("visitor_passes")
  })
})
