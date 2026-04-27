#!/usr/bin/env bun
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { type ModuleSchema, validateModuleSchema } from "@elysian/schema"

import { parseCliArgs } from "./cli-args"
import { DEFAULT_GENERATION_TARGET, listTargetPresets } from "./conventions"
import {
  buildGenerationPreviewReport,
  writeGenerationPreviewReport,
} from "./preview"
import { getRegisteredSchema, listRegisteredSchemaNames } from "./schemas"
import { writeModuleFiles } from "./write"

const loadSchemaFromFile = async (
  schemaFilePath: string,
): Promise<ModuleSchema> => {
  const rawContents = await readFile(schemaFilePath, "utf8")
  const parsed = JSON.parse(rawContents.replace(/^\uFEFF/, "")) as unknown
  const issues = validateModuleSchema(parsed)

  if (issues.length > 0) {
    throw new Error(
      [
        `Invalid module schema file "${schemaFilePath}":`,
        ...issues.map((issue) => `- ${issue.path}: ${issue.message}`),
      ].join("\n"),
    )
  }

  return parsed as ModuleSchema
}

const WORKSPACE_ROOT = resolve(import.meta.dir, "..", "..", "..")

const resolveCliPath = (targetPath: string) =>
  resolve(WORKSPACE_ROOT, targetPath)

const main = async () => {
  const options = parseCliArgs(Bun.argv.slice(2))

  if (!options) {
    printUsage()
    process.exitCode = 1
    return
  }

  let schema: ModuleSchema | null = null
  let schemaArtifactSource: "package" | "inline" = "package"

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
  } catch (error) {
    console.error(
      `[generator] ${error instanceof Error ? error.message : String(error)}`,
    )
    process.exitCode = 1
  }
}

const printUsage = () => {
  console.log(
    [
      "Usage:",
      "  bun --filter @elysian/generator generate --schema customer --target staging --frontend vue [--conflict skip|overwrite|overwrite-generated-only|fail]",
      "  bun --filter @elysian/generator generate --schema-file ./docs/ai-playbooks/examples/supplier.module-schema.json --target staging --frontend vue [--conflict skip|overwrite|overwrite-generated-only|fail]",
      "  bun --filter @elysian/generator generate --schema customer --out ./custom/generated --frontend vue [--conflict skip|overwrite|overwrite-generated-only|fail]",
      "  bun --filter @elysian/generator generate --schema customer --target staging --frontend vue --preview [--report ./generated/reports/customer.preview.json]",
      "  Exactly one of --schema or --schema-file must be provided.",
      "  --report requires --preview.",
      "  --overwrite is kept as a shortcut for --conflict overwrite",
      "",
      `Target presets: ${listTargetPresets().join(", ")}`,
      `Available schemas: ${listRegisteredSchemaNames().join(", ")}`,
    ].join("\n"),
  )
}

void main()
