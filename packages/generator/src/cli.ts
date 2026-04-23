#!/usr/bin/env bun
import { resolve } from "node:path"

import { parseCliArgs } from "./cli-args"
import { DEFAULT_GENERATION_TARGET, listTargetPresets } from "./conventions"
import { getRegisteredSchema, listRegisteredSchemaNames } from "./schemas"
import { writeModuleFiles } from "./write"

const main = async () => {
  const options = parseCliArgs(Bun.argv.slice(2))

  if (!options) {
    printUsage()
    process.exitCode = 1
    return
  }

  const schema = getRegisteredSchema(options.schemaName)

  if (!schema) {
    console.error(
      `[generator] Unknown schema "${options.schemaName}". Available schemas: ${listRegisteredSchemaNames().join(", ")}`,
    )
    process.exitCode = 1
    return
  }

  const result = await writeModuleFiles(schema, {
    outputDir: resolve(options.outputDir),
    frontendTarget: options.frontendTarget,
    conflictStrategy: options.conflictStrategy,
    targetPreset:
      options.targetPreset === "custom" ? undefined : options.targetPreset,
  })

  for (const file of result) {
    const status = file.written ? "written" : "skipped"
    console.log(`[generator] ${status} ${file.absolutePath}`)
  }
}

const printUsage = () => {
  console.log(
    [
      "Usage:",
      "  bun --filter @elysian/generator generate --schema customer --target staging --frontend vue [--conflict skip|overwrite|overwrite-generated-only|fail]",
      "  bun --filter @elysian/generator generate --schema customer --out ./custom/generated --frontend vue [--conflict skip|overwrite|overwrite-generated-only|fail]",
      "  --overwrite is kept as a shortcut for --conflict overwrite",
      "",
      `Target presets: ${listTargetPresets().join(", ")}`,
      `Available schemas: ${listRegisteredSchemaNames().join(", ")}`,
    ].join("\n"),
  )
}

void main()
