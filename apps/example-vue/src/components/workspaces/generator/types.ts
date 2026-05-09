import type {
  GeneratorPreviewDiffLine,
  GeneratorPreviewFileCard,
  GeneratorPreviewFileDiffStats,
} from "../../../lib/generator-preview-workspace"
import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewMigrationProposalSnapshot,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewSessionRecord,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
} from "../../../lib/platform-api"

export type GeneratorPreviewTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

export type GeneratorPreviewStep =
  | "configure"
  | "review"
  | "confirm"
  | "apply"
  | "done"

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
  GeneratorPreviewMigrationProposalSnapshot,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
  GeneratorPreviewSessionRecord,
}
