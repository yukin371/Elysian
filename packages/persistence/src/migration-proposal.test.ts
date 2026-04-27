import { describe, expect, it } from "bun:test"

import {
  type DatabaseChangePlanLike,
  buildMigrationProposalFromChangePlan,
} from "./migration-proposal"

const ticketChangePlan: DatabaseChangePlanLike = {
  canonicalMigrationOwner: "packages/persistence",
  dialect: "postgresql",
  operations: [
    {
      columns: [
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
      ],
      notes: [
        "Enum fields remain review-only at this stage; packages/persistence chooses the final enum/check/dictionary persistence strategy.",
      ],
      operation: "create-table",
      sourceSchemaName: "ticket",
      tableName: "ticket",
    },
  ],
  reviewRequired: true,
  sourceSchemaName: "ticket",
}

describe("buildMigrationProposalFromChangePlan", () => {
  it("builds sql draft, drizzle snippet, and review risks", () => {
    const proposal = buildMigrationProposalFromChangePlan(ticketChangePlan)

    expect(proposal).toMatchObject({
      canonicalMigrationOwner: "packages/persistence",
      dialect: "postgresql",
      operationCount: 1,
      sourceSchemaName: "ticket",
      tableName: "ticket",
    })
    expect(proposal.sqlDraft).toContain("CREATE TABLE ticket (")
    expect(proposal.sqlDraft).toContain(
      "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
    )
    expect(proposal.sqlDraft).toContain("-- status options: open, closed")
    expect(proposal.sqlDraft).toContain(
      "-- status dictionaryTypeCode: ticket_status",
    )
    expect(proposal.drizzleImportSnippet).toContain(
      'import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"',
    )
    expect(proposal.drizzleSchemaSnippet).toContain(
      'export const ticket = pgTable("ticket", {',
    )
    expect(proposal.drizzleSchemaSnippet).toContain(
      'id: uuid("id").primaryKey().defaultRandom(),',
    )
    expect(proposal.drizzleSchemaSnippet).toContain(
      'openedAt: timestamp("opened_at", { withTimezone: true }),',
    )
    expect(proposal.risks.map((risk) => risk.code)).toEqual([
      "review-required",
      "enum-review-required",
      "dictionary-review-required",
    ])
  })

  it("rejects unsupported operation shapes", () => {
    const firstOperation = ticketChangePlan.operations[0]
    if (!firstOperation) {
      throw new Error("Missing test operation fixture.")
    }

    const invalidPlan: DatabaseChangePlanLike = {
      ...ticketChangePlan,
      operations: [
        {
          ...firstOperation,
          operation: "create-table",
        },
        {
          ...firstOperation,
          tableName: "ticket_shadow",
        },
      ],
    }

    expect(() => buildMigrationProposalFromChangePlan(invalidPlan)).toThrow(
      "Only single create-table change plans are supported.",
    )
  })
})
