import {
  DEFAULT_GENERATION_TARGET,
  type GenerationTargetPreset,
  resolveTargetPresetOutputDir,
} from "./conventions"

export interface CliOptions {
  schemaName?: string
  schemaFilePath?: string
  outputDir: string
  targetPreset: GenerationTargetPreset | "custom"
  frontendTarget: "vue" | "react"
  conflictStrategy: "skip" | "overwrite" | "overwrite-generated-only" | "fail"
  preview: boolean
  reportPath?: string
}

export const parseCliArgs = (args: string[]): CliOptions | null => {
  let schemaName = ""
  let schemaFilePath = ""
  let outputDir = resolveTargetPresetOutputDir(DEFAULT_GENERATION_TARGET)
  let targetPreset: GenerationTargetPreset | "custom" =
    DEFAULT_GENERATION_TARGET
  let frontendTarget: "vue" | "react" = "vue"
  let conflictStrategy:
    | "skip"
    | "overwrite"
    | "overwrite-generated-only"
    | "fail" = "skip"
  let preview = false
  let reportPath = ""

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index]

    if (current === "--schema") {
      schemaName = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--schema-file") {
      schemaFilePath = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--out") {
      outputDir = args[index + 1] ?? ""
      targetPreset = "custom"
      index += 1
      continue
    }

    if (current === "--target") {
      const value = args[index + 1]

      if (value === "staging") {
        targetPreset = value
        outputDir = resolveTargetPresetOutputDir(value)
        index += 1
        continue
      }

      return null
    }

    if (current === "--frontend") {
      const value = args[index + 1]

      if (value === "vue" || value === "react") {
        frontendTarget = value
        index += 1
        continue
      }

      return null
    }

    if (current === "--overwrite") {
      conflictStrategy = "overwrite"
      continue
    }

    if (current === "--preview") {
      preview = true
      continue
    }

    if (current === "--report") {
      reportPath = args[index + 1] ?? ""
      index += 1
      continue
    }

    if (current === "--conflict") {
      const value = args[index + 1]

      if (
        value === "skip" ||
        value === "overwrite" ||
        value === "overwrite-generated-only" ||
        value === "fail"
      ) {
        conflictStrategy = value
        index += 1
        continue
      }

      return null
    }
  }

  const hasSchemaName = schemaName.length > 0
  const hasSchemaFilePath = schemaFilePath.length > 0

  if (hasSchemaName === hasSchemaFilePath || !outputDir) {
    return null
  }

  if (reportPath && !preview) {
    return null
  }

  return {
    ...(hasSchemaName ? { schemaName } : {}),
    ...(hasSchemaFilePath ? { schemaFilePath } : {}),
    outputDir,
    targetPreset,
    frontendTarget,
    conflictStrategy,
    preview,
    ...(reportPath ? { reportPath } : {}),
  }
}
