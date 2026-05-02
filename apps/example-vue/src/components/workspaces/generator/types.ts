import type { GeneratorPreviewFileCard } from "../../../lib/generator-preview-workspace"
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
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewFileCard,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewSessionRecord,
}
