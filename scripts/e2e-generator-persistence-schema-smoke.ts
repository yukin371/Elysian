import { resolve } from "node:path"

import { renderModuleFiles } from "@elysian/generator"

interface CommandResult {
  code: number
  stderr: string
  stdout: string
}

const REPO_ROOT = resolve(import.meta.dir, "..")

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const runGeneratorCli = async (args: string[]): Promise<CommandResult> => {
  const process = Bun.spawn(
    ["bun", "--filter", "@elysian/generator", "generate", ...args],
    {
      cwd: REPO_ROOT,
      stdout: "pipe",
      stderr: "pipe",
    },
  )
  const code = await process.exited
  const stdout = await new Response(process.stdout).text()
  const stderr = await new Response(process.stderr).text()

  return {
    code,
    stderr,
    stdout,
  }
}

const run = async () => {
  const schema: ModuleSchema = {
    name: "supplier",
    label: "Supplier",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "name", label: "Name", kind: "string", required: true },
      {
        key: "status",
        label: "Status",
        kind: "enum",
        required: true,
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
      {
        key: "type",
        label: "Type",
        kind: "enum",
        dictionaryTypeCode: "supplier_type",
        options: [{ label: "Hardware", value: "hardware" }],
      },
      { key: "description", label: "Description", kind: "text" },
      { key: "metadata", label: "Metadata", kind: "json" },
      { key: "createdAt", label: "Created At", kind: "datetime" },
    ],
  }

  const files = renderModuleFiles(schema, { frontendTarget: "vue" })
  const persistenceFile = files.find((file) =>
    file.path.endsWith("supplier.persistence.ts"),
  )

  assert(
    persistenceFile,
    "Expected generated files to include supplier.persistence.ts.",
  )
  assert(
    persistenceFile.contents.includes(
      'import type { InferInsertModel, InferSelectModel } from "drizzle-orm"',
    ),
    "Expected persistence schema template to include Drizzle model type imports.",
  )
  assert(
    persistenceFile.contents.includes("export const supplierStatus = pgEnum("),
    "Expected enum fields to generate pgEnum declarations.",
  )
  assert(
    persistenceFile.contents.includes('pgTable("suppliers"'),
    'Expected persistence schema template to target the pluralized "suppliers" table.',
  )
  assert(
    persistenceFile.contents.includes('text("type")'),
    "Expected dictionary-backed enum fields to render as text columns.",
  )
  assert(
    !persistenceFile.contents.includes('pgEnum("supplier_type"'),
    "Expected dictionary-backed enum fields to skip pgEnum generation.",
  )
  assert(
    persistenceFile.contents.includes('jsonb("metadata")'),
    "Expected json fields to map to jsonb columns.",
  )
  assert(
    persistenceFile.contents.includes('text("description")'),
    "Expected text fields to map to text columns.",
  )
  assert(
    persistenceFile.contents.includes(
      'createdAt: timestamp("created_at", { withTimezone: true })',
    ),
    "Expected datetime fields to use timestamptz-compatible timestamp columns with snake_case names.",
  )
  assert(
    persistenceFile.contents.includes("export type SupplierRow"),
    "Expected persistence schema template to export the select row type.",
  )

  const modulePreview = await runGeneratorCli([
    "--schema",
    "customer",
    "--target",
    "module",
    "--frontend",
    "vue",
    "--preview",
  ])

  assert(
    modulePreview.code === 0,
    `Expected module target preview to succeed.\\n${modulePreview.stdout}\\n${modulePreview.stderr}`,
  )
  assert(
    modulePreview.stdout.includes(
      "Copy customer.persistence.ts to packages/persistence/src/schema/customer.ts",
    ),
    "Expected module target checklist to include the persistence schema copy step.",
  )
  assert(
    modulePreview.stdout.includes(
      "Add the schema re-export in packages/persistence/src/schema/index.ts",
    ),
    "Expected module target checklist to include the schema index re-export step.",
  )

  console.log("[e2e-generator-persistence-schema-smoke] passed")
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[e2e-generator-persistence-schema-smoke] failed: ${message}`)
  process.exitCode = 1
})
