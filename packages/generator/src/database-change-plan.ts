import type { ModuleField, ModuleSchema } from "@elysian/schema"

import { toSnakeCase } from "./naming"

export type DatabaseChangeDialect = "postgresql"

export type DatabaseChangeOperationType = "create-table"

export type DatabaseColumnSqlType =
  | "boolean"
  | "integer"
  | "text"
  | "timestamptz"
  | "uuid"

export interface DatabaseColumnPlan {
  defaultExpression: string | null
  dictionaryTypeCode: string | null
  enumOptions: string[]
  name: string
  primaryKey: boolean
  required: boolean
  sourceFieldKey: string
  sourceFieldKind: ModuleField["kind"]
  sqlType: DatabaseColumnSqlType
}

export interface DatabaseTableChangePlan {
  columns: DatabaseColumnPlan[]
  notes: string[]
  operation: DatabaseChangeOperationType
  sourceSchemaName: string
  tableName: string
}

export interface DatabaseChangePlan {
  canonicalMigrationOwner: "packages/persistence"
  dialect: DatabaseChangeDialect
  operations: DatabaseTableChangePlan[]
  reviewRequired: true
  sourceSchemaName: string
}

const getSqlType = (field: ModuleField): DatabaseColumnSqlType => {
  switch (field.kind) {
    case "id":
      return "uuid"
    case "number":
      return "integer"
    case "boolean":
      return "boolean"
    case "datetime":
      return "timestamptz"
    default:
      return "text"
  }
}

const buildColumnPlan = (field: ModuleField): DatabaseColumnPlan => ({
  defaultExpression: field.kind === "id" ? "gen_random_uuid()" : null,
  dictionaryTypeCode: field.dictionaryTypeCode ?? null,
  enumOptions: field.options?.map((option) => option.value) ?? [],
  name: toSnakeCase(field.key),
  primaryKey: field.kind === "id",
  required: field.required ?? false,
  sourceFieldKey: field.key,
  sourceFieldKind: field.kind,
  sqlType: getSqlType(field),
})

const buildTableNotes = (columns: DatabaseColumnPlan[]) => {
  const notes: string[] = []

  if (
    columns.some(
      (column) =>
        column.sourceFieldKind === "enum" &&
        (column.enumOptions.length > 0 || column.dictionaryTypeCode !== null),
    )
  ) {
    notes.push(
      "Enum fields remain review-only at this stage; packages/persistence chooses the final enum/check/dictionary persistence strategy.",
    )
  }

  return notes
}

export const buildModuleDatabaseChangePlan = (
  schema: ModuleSchema,
): DatabaseChangePlan => {
  const columns = schema.fields.map(buildColumnPlan)

  return {
    canonicalMigrationOwner: "packages/persistence",
    dialect: "postgresql",
    operations: [
      {
        columns,
        notes: buildTableNotes(columns),
        operation: "create-table",
        sourceSchemaName: schema.name,
        tableName: toSnakeCase(schema.name),
      },
    ],
    reviewRequired: true,
    sourceSchemaName: schema.name,
  }
}
