import {
  buildModuleDatabaseChangePlan,
  renderModuleFiles,
} from "@elysian/generator"
import { expandSimplifiedSchema } from "@elysian/schema"

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const run = async () => {
  const schema = expandSimplifiedSchema({
    name: "article",
    fields: [
      { key: "title", kind: "string", required: true, searchable: true },
      { key: "body", kind: "text" },
      { key: "metadata", kind: "json" },
    ],
  })

  assert(
    schema.fields.find((field) => field.key === "body")?.kind === "text",
    'Expected expandSimplifiedSchema to preserve the "text" field kind.',
  )
  assert(
    schema.fields.find((field) => field.key === "metadata")?.kind === "json",
    'Expected expandSimplifiedSchema to preserve the "json" field kind.',
  )

  const files = renderModuleFiles(schema, { frontendTarget: "vue" })
  const schemaFile = files.find((file) =>
    file.path.endsWith("article.schema.ts"),
  )
  const serviceFile = files.find((file) =>
    file.path.endsWith("article.service.ts"),
  )
  const routeFile = files.find((file) =>
    file.path.endsWith("article.routes.ts"),
  )
  const workspaceFile = files.find((file) =>
    file.path.endsWith("article-workspace.ts"),
  )

  assert(schemaFile, "Expected generated files to include article.schema.ts.")
  assert(
    schemaFile.contents.includes("metadata: Record<string, unknown>"),
    "Expected generated schema to render json fields as Record<string, unknown>.",
  )

  assert(serviceFile, "Expected generated files to include article.service.ts.")
  assert(
    serviceFile.contents.includes("input.title.trim()"),
    "Expected string fields to keep trim normalization in the service template.",
  )
  assert(
    serviceFile.contents.includes("body: input.body"),
    "Expected text fields to bypass trim normalization in the service template.",
  )

  assert(routeFile, "Expected generated files to include article.routes.ts.")
  assert(
    routeFile.contents.includes(
      "metadata: t.Optional(t.Record(t.String(), t.Unknown()))",
    ),
    "Expected generated routes to accept json fields as JSON objects.",
  )

  assert(
    workspaceFile,
    "Expected generated files to include article-workspace.ts.",
  )
  assert(
    workspaceFile.contents.includes(
      "const metadataValueResult = normalizeJsonInput(values.metadata)",
    ),
    "Expected workspace normalization to parse JSON textarea input.",
  )
  assert(
    workspaceFile.contents.includes(
      "metadata: stringifyJsonValue(record.metadata)",
    ),
    "Expected workspace edit drafts to stringify JSON record values.",
  )

  const databasePlan = buildModuleDatabaseChangePlan(schema)
  const metadataColumn = databasePlan.operations[0]?.columns.find(
    (column) => column.name === "metadata",
  )

  assert(metadataColumn, 'Expected database plan to include "metadata" column.')
  assert(
    metadataColumn.sqlType === "jsonb",
    'Expected json fields to map to "jsonb" in the database plan.',
  )

  console.log("[e2e-generator-field-kinds-smoke] passed")
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[e2e-generator-field-kinds-smoke] failed: ${message}`)
  process.exitCode = 1
})
