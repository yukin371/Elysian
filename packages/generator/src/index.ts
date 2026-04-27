export {
  buildModuleDatabaseChangePlan,
  type DatabaseChangeDialect,
  type DatabaseChangeOperationType,
  type DatabaseChangePlan,
  type DatabaseColumnPlan,
  type DatabaseColumnSqlType,
  type DatabaseTableChangePlan,
} from "./database-change-plan"
export {
  planModuleFiles,
  renderModuleFiles,
  type FrontendTarget,
  type GeneratedFilePlan,
  type RenderedModuleFile,
  type RenderModuleTemplatesOptions,
} from "./core"
export {
  getRegisteredSchema,
  listRegisteredSchemaNames,
  type RegisteredSchemaName,
} from "./schemas"
export {
  DEFAULT_GENERATION_TARGET,
  DEFAULT_MERGE_STRATEGY,
  DEFAULT_OUTPUT_DIR,
  listTargetPresets,
  resolveTargetPresetOutputDir,
  type GenerationTargetPreset,
  type MergeStrategy,
} from "./conventions"
export {
  buildGenerationPreviewReport,
  previewModuleFiles,
  type GenerationPreviewReport,
  type PreviewedModuleFile,
  type PreviewModuleFilesOptions,
  type PreviewPlannedAction,
  writeGenerationPreviewReport,
} from "./preview"
export { renderModuleSqlPreview, type ModuleSqlPreview } from "./sql-preview"
export {
  applyGenerationPreviewReport,
  PreviewReportApplyError,
  type AppliedGenerationPreviewReport,
  type ApplyGenerationPreviewReportOptions,
  writeModuleFiles,
  type GenerationManifest,
  type PreviewReportApplyErrorCode,
  type WriteConflictStrategy,
  type WriteModuleFilesOptions,
  type WrittenModuleFile,
} from "./write"
