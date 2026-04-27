import { mkdir, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

import type { ModuleSchema } from "@elysian/schema"

import type { GenerationTargetPreset, MergeStrategy } from "./conventions"
import {
  type FrontendTarget,
  type RenderModuleTemplatesOptions,
  renderModuleFiles,
} from "./core"
import {
  type DatabaseChangePlan,
  buildModuleDatabaseChangePlan,
} from "./database-change-plan"
import {
  type GeneratedConflictStrategy,
  collectGeneratedFileTargets,
} from "./output-targets"
import { type ModuleSqlPreview, renderModuleSqlPreview } from "./sql-preview"

export type PreviewPlannedAction = "create" | "overwrite" | "skip" | "block"

export interface PreviewedModuleFile {
  absolutePath: string
  currentContents: string | null
  exists: boolean
  hasChanges: boolean
  isManaged: boolean | null
  mergeStrategy: MergeStrategy
  path: string
  plannedAction: PreviewPlannedAction
  plannedReason: string
  reason: string
  contents: string
}

export interface GenerationPreviewReport {
  conflictStrategy: GeneratedConflictStrategy
  databaseChangePlan: DatabaseChangePlan
  files: PreviewedModuleFile[]
  frontendTarget: FrontendTarget
  generatedAt: string
  outputDir: string
  schemaName: string
  sqlPreview: ModuleSqlPreview
  targetPreset: GenerationTargetPreset | "custom"
}

export interface PreviewModuleFilesOptions
  extends RenderModuleTemplatesOptions {
  conflictStrategy?: GeneratedConflictStrategy
  outputDir: string
  targetPreset?: GenerationTargetPreset
}

const getPlannedAction = (
  exists: boolean,
  isManaged: boolean | null,
  conflictStrategy: GeneratedConflictStrategy,
): PreviewPlannedAction => {
  if (!exists) {
    return "create"
  }

  if (conflictStrategy === "skip") {
    return "skip"
  }

  if (conflictStrategy === "overwrite") {
    return "overwrite"
  }

  if (conflictStrategy === "overwrite-generated-only") {
    return isManaged ? "overwrite" : "block"
  }

  return "block"
}

const getPlannedReason = (
  action: PreviewPlannedAction,
  hasChanges: boolean,
  isManaged: boolean | null,
  conflictStrategy: GeneratedConflictStrategy,
) => {
  if (!hasChanges) {
    return "Existing contents already match the generated output."
  }

  if (action === "create") {
    return "Target file does not exist and would be created."
  }

  if (action === "skip") {
    return "Conflict strategy is skip, so the existing file would be preserved."
  }

  if (action === "overwrite") {
    if (conflictStrategy === "overwrite-generated-only") {
      return "Existing file is generator-managed and can be safely overwritten."
    }

    return "Conflict strategy allows overwriting the existing file."
  }

  if (conflictStrategy === "overwrite-generated-only" && isManaged === false) {
    return "Existing file is not generator-managed, so overwrite-generated-only would block the write."
  }

  return "Conflict strategy fail would block overwriting the existing file."
}

export const previewModuleFiles = async (
  schema: ModuleSchema,
  options: PreviewModuleFilesOptions,
): Promise<PreviewedModuleFile[]> => {
  const frontendTarget = options.frontendTarget ?? "vue"
  const conflictStrategy = options.conflictStrategy ?? "skip"
  const renderedFiles = renderModuleFiles(schema, {
    frontendTarget,
    schemaArtifactSource: options.schemaArtifactSource,
  })
  const targets = await collectGeneratedFileTargets(
    renderedFiles,
    options.outputDir,
  )

  return targets.map((entry) => {
    const plannedAction = getPlannedAction(
      entry.exists,
      entry.isManaged,
      conflictStrategy,
    )

    return {
      absolutePath: entry.absolutePath,
      currentContents: entry.currentContents,
      exists: entry.exists,
      hasChanges: entry.hasChanges,
      isManaged: entry.isManaged,
      mergeStrategy: entry.file.mergeStrategy,
      path: entry.file.path,
      plannedAction,
      plannedReason: getPlannedReason(
        plannedAction,
        entry.hasChanges,
        entry.isManaged,
        conflictStrategy,
      ),
      reason: entry.file.reason,
      contents: entry.file.contents,
    }
  })
}

export const buildGenerationPreviewReport = async (
  schema: ModuleSchema,
  options: PreviewModuleFilesOptions,
): Promise<GenerationPreviewReport> => {
  const frontendTarget = options.frontendTarget ?? "vue"
  const conflictStrategy = options.conflictStrategy ?? "skip"

  return {
    schemaName: schema.name,
    frontendTarget,
    generatedAt: new Date().toISOString(),
    conflictStrategy,
    outputDir: options.outputDir,
    targetPreset: options.targetPreset ?? "custom",
    databaseChangePlan: buildModuleDatabaseChangePlan(schema),
    files: await previewModuleFiles(schema, options),
    sqlPreview: renderModuleSqlPreview(schema),
  }
}

export const writeGenerationPreviewReport = async (
  reportPath: string,
  report: GenerationPreviewReport,
) => {
  await mkdir(dirname(reportPath), { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")
}
