#!/usr/bin/env bun
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { type ModuleSchema, expandSimplifiedSchema } from "@elysian/schema"

import { parseCliArgs } from "./cli-args"
import { DEFAULT_GENERATION_TARGET, listTargetPresets } from "./conventions"
import { generateScaffoldSchema } from "./init"
import {
  buildGenerationPreviewReport,
  writeGenerationPreviewReport,
} from "./preview"
import {
  getRegisteredSchema,
  listRegisteredSchemaNames,
  listRegisteredSchemas,
} from "./schemas"
import { writeModuleFiles } from "./write"

const loadSchemaFromFile = async (
  schemaFilePath: string,
): Promise<ModuleSchema> => {
  const rawContents = await readFile(schemaFilePath, "utf8")
  const normalizedContents = rawContents.replace(/^\uFEFF/, "")
  let parsed: unknown

  try {
    parsed = JSON.parse(normalizedContents) as unknown
  } catch {
    throw new Error(
      `Invalid module schema file "${schemaFilePath}": file must contain valid JSON.`,
    )
  }

  try {
    return expandSimplifiedSchema(parsed)
  } catch (error) {
    throw new Error(
      `Invalid module schema file "${schemaFilePath}":\n${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

const WORKSPACE_ROOT = resolve(import.meta.dir, "..", "..", "..")

const resolveCliPath = (targetPath: string) =>
  resolve(WORKSPACE_ROOT, targetPath)

const printModuleIntegrationChecklist = (schemaName: string) => {
  console.log("")
  console.log("Integration Checklist:")
  console.log(
    `  1. Copy ${schemaName}.persistence.ts to packages/persistence/src/schema/${schemaName}.ts`,
  )
  console.log(
    "  2. Add the schema re-export in packages/persistence/src/schema/index.ts",
  )
  console.log("  3. Run: bun run db:generate && bun run db:migrate")
  console.log("  4. Wire route details and authorization in the module stub")
  console.log(
    `  5. Implement repository methods in apps/server/src/modules/${schemaName}/${schemaName}.module.ts`,
  )
  console.log(
    "  6. Register the module in apps/server/src/modules/compose-business.ts or compose-system.ts",
  )
  console.log(
    "  7. Register the frontend workspace in apps/example-vue/src/modules/",
  )
  console.log(
    "  See docs/plans/2026-05-09-generator-module-apply-path-plan.md for the full handoff checklist.",
  )
}

const main = async () => {
  const options = parseCliArgs(Bun.argv.slice(2))

  if (!options) {
    printUsage()
    process.exitCode = 1
    return
  }

  let schema: ModuleSchema | null = null
  let schemaArtifactSource: "package" | "inline" = "package"

  if (options.listSchemas) {
    printSchemaList()
    return
  }

  if (options.initModule) {
    const moduleName = options.initModule.trim()
    const outPath = resolveCliPath(`./${moduleName}.module-schema.json`)
    await Bun.write(outPath, generateScaffoldSchema(moduleName))
    console.log(`[generator] scaffold written to ${outPath}`)
    console.log("[generator] edit the file, then run:")
    console.log(
      `  bun --filter @elysian/generator generate --schema-file ./${moduleName}.module-schema.json --target staging --frontend vue --preview`,
    )
    return
  }

  if (options.schemaName) {
    schema = getRegisteredSchema(options.schemaName)

    if (!schema) {
      console.error(
        `[generator] Unknown schema "${options.schemaName}". Available schemas: ${listRegisteredSchemaNames().join(", ")}`,
      )
      process.exitCode = 1
      return
    }
  } else if (options.schemaFilePath) {
    try {
      schema = await loadSchemaFromFile(resolveCliPath(options.schemaFilePath))
      schemaArtifactSource = "inline"
    } catch (error) {
      console.error(
        `[generator] ${error instanceof Error ? error.message : String(error)}`,
      )
      process.exitCode = 1
      return
    }
  }

  if (!schema) {
    printUsage()
    process.exitCode = 1
    return
  }

  try {
    if (options.preview) {
      const previewReport = await buildGenerationPreviewReport(schema, {
        outputDir: resolveCliPath(options.outputDir),
        frontendTarget: options.frontendTarget,
        schemaArtifactSource,
        conflictStrategy: options.conflictStrategy,
        targetPreset:
          options.targetPreset === "custom" ? undefined : options.targetPreset,
      })

      for (const file of previewReport.files) {
        const diffSuffix = file.hasChanges ? "" : " (no diff)"
        console.log(
          `[generator] preview ${file.plannedAction} ${file.absolutePath}${diffSuffix}`,
        )
      }

      if (options.reportPath) {
        const reportPath = resolveCliPath(options.reportPath)
        await writeGenerationPreviewReport(reportPath, previewReport)
        console.log(`[generator] report ${reportPath}`)
      }

      console.log("[generator] sql-preview")
      console.log(previewReport.sqlPreview.contents)

      if (options.targetPreset === "module") {
        printModuleIntegrationChecklist(schema.name)
      }
      return
    }

    const result = await writeModuleFiles(schema, {
      outputDir: resolveCliPath(options.outputDir),
      frontendTarget: options.frontendTarget,
      schemaArtifactSource,
      conflictStrategy: options.conflictStrategy,
      targetPreset:
        options.targetPreset === "custom" ? undefined : options.targetPreset,
    })

    for (const file of result) {
      const status = file.written ? "written" : "skipped"
      console.log(`[generator] ${status} ${file.absolutePath}`)
    }

    if (options.targetPreset === "module") {
      printModuleIntegrationChecklist(schema.name)
    }
  } catch (error) {
    console.error(
      `[generator] ${error instanceof Error ? error.message : String(error)}`,
    )
    process.exitCode = 1
  }
}

const printUsage = () => {
  const schemas = listRegisteredSchemaNames()
  const targets = listTargetPresets()

  console.log(
    `
Elysian Code Generator

Usage:
  bun --filter @elysian/generator generate <input> [options]

Input (choose one):
  --schema <name>          Use a registered schema: ${schemas.join(", ")}
  --schema-file <path>     Use a JSON schema file
  --init <module-name>     Create a starter simplified schema file
  --list-schemas           Show registered schemas with labels and domains

Output:
  --target <preset>        Target preset: ${targets.join(", ")}
                           staging  - Generate into ./generated for safe review
                           module   - Generate into apps/server/src/modules for integration stubs
  --out <dir>              Custom output directory

Options:
  --frontend <vue|react>   Frontend framework (default: vue)
  --conflict <strategy>    skip | overwrite | overwrite-generated-only | fail
  --overwrite              Shortcut for --conflict overwrite
  --preview                Preview only, do not write files
  --report <path>          Save preview report to file (requires --preview)

Quick Start:
  bun --filter @elysian/generator generate --init supplier
  bun --filter @elysian/generator generate --schema-file ./supplier.module-schema.json --target staging --frontend vue --preview
  bun --filter @elysian/generator generate --schema customer --target module --frontend vue --preview
  bun --filter @elysian/generator generate --schema customer --target staging --frontend vue --conflict overwrite
`.trim(),
  )
}

const printSchemaList = () => {
  console.log("Available schemas:\n")

  for (const schema of listRegisteredSchemas()) {
    const domain = schema.frontend?.workspaceDomain ?? "business"
    console.log(
      `  ${schema.name.padEnd(20)} ${schema.label} (${schema.fields.length} fields, ${domain})`,
    )
  }
}

void main()
