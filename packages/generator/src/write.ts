import { randomUUID } from "node:crypto"
import { mkdir, rename, rm, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"

import type { ModuleSchema } from "@elysian/schema"

import type { GenerationTargetPreset } from "./conventions"
import {
  type FrontendTarget,
  type RenderedModuleFile,
  renderModuleFiles,
} from "./core"
import {
  type GeneratedConflictStrategy,
  type ResolvedGeneratedFileTarget,
  collectGeneratedFileTargets,
} from "./output-targets"
import type { GenerationPreviewReport, PreviewedModuleFile } from "./preview"

export type WriteConflictStrategy = GeneratedConflictStrategy

export interface WriteModuleFilesOptions {
  outputDir: string
  frontendTarget?: FrontendTarget
  schemaArtifactSource?: "package" | "inline"
  conflictStrategy?: WriteConflictStrategy
  writeManifest?: boolean
  targetPreset?: GenerationTargetPreset
}

export interface ApplyGenerationPreviewReportOptions {
  conflictStrategy?: WriteConflictStrategy
  writeManifest?: boolean
}

export interface WrittenModuleFile extends RenderedModuleFile {
  absolutePath: string
  written: boolean
}

export interface GenerationManifest {
  schemaName: string
  frontendTarget: FrontendTarget
  generatedAt: string
  conflictStrategy: WriteConflictStrategy
  outputDir: string
  targetPreset: GenerationTargetPreset | "custom"
  files: Array<{
    path: string
    absolutePath: string
    written: boolean
    reason: string
    mergeStrategy: string
  }>
}

export type PreviewReportApplyErrorCode =
  | "PREVIEW_REPORT_STALE"
  | "WRITE_CONFLICT"

export class PreviewReportApplyError extends Error {
  constructor(
    readonly code: PreviewReportApplyErrorCode,
    message: string,
  ) {
    super(message)
    this.name = "PreviewReportApplyError"
  }
}

export interface AppliedGenerationPreviewReport {
  files: WrittenModuleFile[]
  manifestPath: string | null
}

const buildTempPath = (absolutePath: string) =>
  `${absolutePath}.tmp-${process.pid}-${randomUUID()}`

const buildManifestPath = (
  outputDir: string,
  schemaName: string,
  frontendTarget: FrontendTarget,
) =>
  resolve(
    outputDir,
    ".elysian-generator",
    `${schemaName}.${frontendTarget}.json`,
  )

const RETRYABLE_RENAME_ERROR_CODES = new Set(["EPERM", "EBUSY", "EACCES"])
const MAX_RENAME_RETRIES = 5

const getErrorCode = (error: unknown): string | null =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof error.code === "string"
    ? error.code
    : null

const writeFileAtomically = async (absolutePath: string, contents: string) => {
  const tempPath = buildTempPath(absolutePath)

  await writeFile(tempPath, contents, "utf8")

  for (let attempt = 0; attempt <= MAX_RENAME_RETRIES; attempt += 1) {
    try {
      await rename(tempPath, absolutePath)
      return
    } catch (error) {
      const errorCode = getErrorCode(error)
      const canRetry =
        errorCode !== null &&
        RETRYABLE_RENAME_ERROR_CODES.has(errorCode) &&
        attempt < MAX_RENAME_RETRIES

      if (canRetry) {
        await Bun.sleep((attempt + 1) * 10)
        continue
      }

      await rm(tempPath, { force: true })
      throw error
    }
  }

  throw new Error(`Atomic write retries exhausted: ${absolutePath}`)
}

const validateConflictStrategy = (
  filesToWrite: ResolvedGeneratedFileTarget[],
  conflictStrategy: WriteConflictStrategy,
) => {
  if (conflictStrategy === "fail") {
    const conflict = filesToWrite.find((entry) => entry.exists)
    if (conflict) {
      throw new PreviewReportApplyError(
        "WRITE_CONFLICT",
        `Refusing to overwrite existing file: ${conflict.absolutePath}`,
      )
    }
  }

  if (conflictStrategy === "overwrite-generated-only") {
    const conflict = filesToWrite.find(
      (entry) => entry.exists && !entry.isManaged,
    )
    if (conflict) {
      throw new PreviewReportApplyError(
        "WRITE_CONFLICT",
        `Refusing to overwrite unmanaged file with overwrite-generated-only strategy: ${conflict.absolutePath}`,
      )
    }
  }
}

const writeResolvedTargets = async (
  filesToWrite: ResolvedGeneratedFileTarget[],
  conflictStrategy: WriteConflictStrategy,
): Promise<WrittenModuleFile[]> => {
  const results: WrittenModuleFile[] = []

  for (const entry of filesToWrite) {
    const { file, absolutePath, exists } = entry
    await mkdir(dirname(absolutePath), { recursive: true })

    if (exists && conflictStrategy === "skip") {
      results.push({
        ...file,
        absolutePath,
        written: false,
      })
      continue
    }

    await writeFileAtomically(absolutePath, file.contents)

    results.push({
      ...file,
      absolutePath,
      written: true,
    })
  }

  return results
}

const writeManifest = async (
  manifestPath: string,
  manifest: GenerationManifest,
) => {
  await mkdir(dirname(manifestPath), { recursive: true })
  await writeFileAtomically(manifestPath, JSON.stringify(manifest, null, 2))
}

const buildManifest = (
  schemaName: string,
  frontendTarget: FrontendTarget,
  conflictStrategy: WriteConflictStrategy,
  outputDir: string,
  targetPreset: GenerationTargetPreset | "custom",
  files: WrittenModuleFile[],
): GenerationManifest => ({
  schemaName,
  frontendTarget,
  generatedAt: new Date().toISOString(),
  conflictStrategy,
  outputDir: resolve(outputDir),
  targetPreset,
  files: files.map((file) => ({
    path: file.path,
    absolutePath: file.absolutePath,
    written: file.written,
    reason: file.reason,
    mergeStrategy: file.mergeStrategy,
  })),
})

const toRenderedFilesFromPreview = (
  files: PreviewedModuleFile[],
): RenderedModuleFile[] =>
  files.map((file) => ({
    contents: file.contents,
    mergeStrategy: file.mergeStrategy,
    path: file.path,
    reason: file.reason,
  }))

const ensurePreviewReportIsCurrent = (
  filesToWrite: ResolvedGeneratedFileTarget[],
  reportFiles: PreviewedModuleFile[],
) => {
  const reportFileMap = new Map(reportFiles.map((file) => [file.path, file]))

  for (const entry of filesToWrite) {
    const previous = reportFileMap.get(entry.file.path)
    if (!previous) {
      throw new PreviewReportApplyError(
        "PREVIEW_REPORT_STALE",
        `Preview report is stale or incomplete for file: ${entry.absolutePath}`,
      )
    }

    if (
      previous.exists !== entry.exists ||
      previous.currentContents !== entry.currentContents
    ) {
      throw new PreviewReportApplyError(
        "PREVIEW_REPORT_STALE",
        `Preview report is stale for file: ${entry.absolutePath}`,
      )
    }
  }
}

export const applyGenerationPreviewReport = async (
  report: GenerationPreviewReport,
  options: ApplyGenerationPreviewReportOptions = {},
): Promise<AppliedGenerationPreviewReport> => {
  const conflictStrategy = options.conflictStrategy ?? report.conflictStrategy
  const renderedFiles = toRenderedFilesFromPreview(report.files)
  const filesToWrite = await collectGeneratedFileTargets(
    renderedFiles,
    report.outputDir,
  )

  ensurePreviewReportIsCurrent(filesToWrite, report.files)
  validateConflictStrategy(filesToWrite, conflictStrategy)

  const files = await writeResolvedTargets(filesToWrite, conflictStrategy)

  if (options.writeManifest === false) {
    return {
      files,
      manifestPath: null,
    }
  }

  const manifestPath = buildManifestPath(
    report.outputDir,
    report.schemaName,
    report.frontendTarget,
  )

  await writeManifest(
    manifestPath,
    buildManifest(
      report.schemaName,
      report.frontendTarget,
      conflictStrategy,
      report.outputDir,
      report.targetPreset,
      files,
    ),
  )

  return {
    files,
    manifestPath,
  }
}

export const writeModuleFiles = async (
  schema: ModuleSchema,
  options: WriteModuleFilesOptions,
): Promise<WrittenModuleFile[]> => {
  const frontendTarget = options.frontendTarget ?? "vue"
  const conflictStrategy = options.conflictStrategy ?? "skip"
  const renderedFiles = renderModuleFiles(schema, {
    frontendTarget,
    schemaArtifactSource: options.schemaArtifactSource,
  })
  const filesToWrite = await collectGeneratedFileTargets(
    renderedFiles,
    options.outputDir,
  )

  validateConflictStrategy(filesToWrite, conflictStrategy)

  const results = await writeResolvedTargets(filesToWrite, conflictStrategy)

  if (options.writeManifest !== false) {
    const manifestPath = buildManifestPath(
      options.outputDir,
      schema.name,
      frontendTarget,
    )

    await writeManifest(
      manifestPath,
      buildManifest(
        schema.name,
        frontendTarget,
        conflictStrategy,
        options.outputDir,
        options.targetPreset ?? "custom",
        results,
      ),
    )
  }

  return results
}
