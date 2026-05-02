import type {
  GeneratorPreviewDiffLine,
  GeneratorPreviewFileCard,
  GeneratorPreviewFileDiffStats,
} from "../../../lib/generator-preview-workspace"
import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewSessionRecord,
  GeneratorPreviewSqlPreview,
} from "../../../lib/platform-api"

export type GeneratorPreviewTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

export interface GeneratorPreviewSchemaOption {
  label: string
  value: string
}

export type {
  GeneratorPreviewDiffLine,
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewFileCard,
  GeneratorPreviewFileDiffStats,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewSessionRecord,
}
