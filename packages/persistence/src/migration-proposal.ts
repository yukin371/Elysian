const supportedDialects = ["postgresql"] as const
const supportedOperations = ["create-table"] as const
const supportedSqlTypes = [
  "boolean",
  "integer",
  "text",
  "timestamptz",
  "uuid",
] as const

type SupportedDialect = (typeof supportedDialects)[number]
type SupportedOperation = (typeof supportedOperations)[number]
type SupportedSqlType = (typeof supportedSqlTypes)[number]

export interface DatabaseColumnPlanLike {
  defaultExpression: string | null
  dictionaryTypeCode: string | null
  enumOptions: string[]
  name: string
  primaryKey: boolean
  required: boolean
  sourceFieldKey: string
  sourceFieldKind: string
  sqlType: SupportedSqlType
}

export interface DatabaseTableChangePlanLike {
  columns: DatabaseColumnPlanLike[]
  notes: string[]
  operation: SupportedOperation
  sourceSchemaName: string
  tableName: string
}

export interface DatabaseChangePlanLike {
  canonicalMigrationOwner: string
  dialect: SupportedDialect
  operations: DatabaseTableChangePlanLike[]
  reviewRequired: boolean
  sourceSchemaName: string
}

export type MigrationProposalRiskCode =
  | "canonical-owner-mismatch"
  | "dictionary-review-required"
  | "enum-review-required"
  | "review-required"

export interface MigrationProposalRisk {
  code: MigrationProposalRiskCode
  message: string
  severity: "warning"
}

export interface MigrationProposal {
  canonicalMigrationOwner: "packages/persistence"
  dialect: SupportedDialect
  drizzleImportSnippet: string
  drizzleSchemaSnippet: string
  operationCount: number
  risks: MigrationProposalRisk[]
  sourceSchemaName: string
  sqlDraft: string
  tableName: string
}

const toPascalCase = (value: string) =>
  value
    .split(/[^a-zA-Z0-9]+/)
    .filter((segment) => segment.length > 0)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join("")

const getSqlColumnDefinition = (column: DatabaseColumnPlanLike) => {
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

const getDrizzleColumnDefinition = (column: DatabaseColumnPlanLike) => {
  const base =
    column.sqlType === "uuid"
      ? `uuid("${column.name}")`
      : column.sqlType === "integer"
        ? `integer("${column.name}")`
        : column.sqlType === "boolean"
          ? `boolean("${column.name}")`
          : column.sqlType === "timestamptz"
            ? `timestamp("${column.name}", { withTimezone: true })`
            : `text("${column.name}")`

  const parts = [base]

  if (column.primaryKey) {
    parts.push(".primaryKey()")
  }

  if (column.required && !column.primaryKey) {
    parts.push(".notNull()")
  }

  if (column.defaultExpression === "gen_random_uuid()") {
    parts.push(".defaultRandom()")
  }

  return `  ${column.sourceFieldKey}: ${parts.join("")},`
}

const buildRisks = (plan: DatabaseChangePlanLike): MigrationProposalRisk[] => {
  const risks: MigrationProposalRisk[] = []

  if (plan.canonicalMigrationOwner !== "packages/persistence") {
    risks.push({
      code: "canonical-owner-mismatch",
      message:
        "The incoming plan does not target packages/persistence as canonical migration owner.",
      severity: "warning",
    })
  }

  if (plan.reviewRequired) {
    risks.push({
      code: "review-required",
      message:
        "This proposal is review-only and must still enter the formal Drizzle migration flow manually.",
      severity: "warning",
    })
  }

  if (
    plan.operations.some((operation) =>
      operation.columns.some((column) => column.enumOptions.length > 0),
    )
  ) {
    risks.push({
      code: "enum-review-required",
      message:
        "Enum columns currently stay as proposal-time review items; choose pgEnum or another persistence strategy before migration.",
      severity: "warning",
    })
  }

  if (
    plan.operations.some((operation) =>
      operation.columns.some((column) => column.dictionaryTypeCode !== null),
    )
  ) {
    risks.push({
      code: "dictionary-review-required",
      message:
        "Dictionary-backed enum hints need manual persistence review before becoming a formal migration.",
      severity: "warning",
    })
  }

  return risks
}

export const buildMigrationProposalFromChangePlan = (
  plan: DatabaseChangePlanLike,
): MigrationProposal => {
  const operation = plan.operations[0]

  if (!operation || plan.operations.length !== 1) {
    throw new Error("Only single create-table change plans are supported.")
  }

  if (operation.operation !== "create-table") {
    throw new Error("Only create-table change plans are supported.")
  }

  const sqlLines = operation.columns.flatMap((column) => {
    const comments: string[] = []

    if (column.enumOptions.length > 0) {
      comments.push(
        `-- ${column.name} options: ${column.enumOptions.join(", ")}`,
      )
    }

    if (column.dictionaryTypeCode) {
      comments.push(
        `-- ${column.name} dictionaryTypeCode: ${column.dictionaryTypeCode}`,
      )
    }

    return [...comments, getSqlColumnDefinition(column)]
  })
  const drizzleColumnLines = operation.columns.map(getDrizzleColumnDefinition)
  const requiredImports = new Set(["pgTable"])

  for (const column of operation.columns) {
    if (column.sqlType === "uuid") {
      requiredImports.add("uuid")
    } else if (column.sqlType === "integer") {
      requiredImports.add("integer")
    } else if (column.sqlType === "boolean") {
      requiredImports.add("boolean")
    } else if (column.sqlType === "timestamptz") {
      requiredImports.add("timestamp")
    } else {
      requiredImports.add("text")
    }
  }

  const tableConstName = operation.tableName
  const rowTypeName = `${toPascalCase(operation.tableName)}Row`
  const newRowTypeName = `New${toPascalCase(operation.tableName)}Row`

  return {
    canonicalMigrationOwner: "packages/persistence",
    dialect: plan.dialect,
    drizzleImportSnippet: `import type { InferInsertModel, InferSelectModel } from "drizzle-orm"\nimport { ${[...requiredImports].sort().join(", ")} } from "drizzle-orm/pg-core"`,
    drizzleSchemaSnippet: [
      `export const ${tableConstName} = pgTable("${operation.tableName}", {`,
      ...drizzleColumnLines,
      "})",
      "",
      `export type ${rowTypeName} = InferSelectModel<typeof ${tableConstName}>`,
      `export type ${newRowTypeName} = InferInsertModel<typeof ${tableConstName}>`,
    ].join("\n"),
    operationCount: 1,
    risks: buildRisks(plan),
    sourceSchemaName: plan.sourceSchemaName,
    sqlDraft: [
      "-- Proposal draft only: review before creating a formal Drizzle migration.",
      `CREATE TABLE ${operation.tableName} (`,
      sqlLines.join(",\n"),
      ");",
    ].join("\n"),
    tableName: operation.tableName,
  }
}
