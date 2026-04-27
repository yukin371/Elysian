import type { ModuleSchema } from "@elysian/schema"

import {
  type DatabaseColumnPlan,
  buildModuleDatabaseChangePlan,
} from "./database-change-plan"

export interface ModuleSqlPreview {
  dialect: "postgresql"
  tableName: string
  contents: string
}

const renderSqlColumn = (column: DatabaseColumnPlan) => {
  const parts = [`  ${column.name}`, column.sqlType]

  if (column.primaryKey) {
    parts.push("PRIMARY KEY")
  }

  if (column.required && !column.primaryKey) {
    parts.push("NOT NULL")
  }

  if (column.defaultExpression) {
    parts.push(`DEFAULT ${column.defaultExpression}`)
  }

  return parts.join(" ")
}

const renderEnumComment = (column: DatabaseColumnPlan) => {
  if (column.sourceFieldKind !== "enum") {
    return null
  }

  if (column.enumOptions.length > 0) {
    return `-- ${column.name} options: ${column.enumOptions.join(", ")}`
  }

  if (column.dictionaryTypeCode) {
    return `-- ${column.name} dictionaryTypeCode: ${column.dictionaryTypeCode}`
  }

  return null
}

export const renderModuleSqlPreview = (
  schema: ModuleSchema,
): ModuleSqlPreview => {
  const plan = buildModuleDatabaseChangePlan(schema)
  const table = plan.operations[0]

  if (!table) {
    throw new Error("Database change plan did not include a table operation.")
  }

  const columnLines = table.columns.flatMap((column) => {
    const enumComment = renderEnumComment(column)

    return enumComment === null
      ? [renderSqlColumn(column)]
      : [enumComment, renderSqlColumn(column)]
  })

  return {
    dialect: "postgresql",
    tableName: table.tableName,
    contents: [
      "-- Preview only: generated from ModuleSchema for review.",
      "-- Canonical migration ownership remains in packages/persistence.",
      `CREATE TABLE ${table.tableName} (`,
      `${columnLines.join(",\n")}`,
      ");",
    ].join("\n"),
  }
}
