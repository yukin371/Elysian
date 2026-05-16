import type {
  GeneratorPreviewDiffLine,
  GeneratorPreviewFileCard,
  GeneratorPreviewFileDiffStats,
} from "../../../lib/generator-preview-workspace"
import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewBlockerReason,
  GeneratorPreviewConfirmationEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewDriftStatus,
  GeneratorPreviewMigrationProposalSnapshot,
  GeneratorPreviewMigrationProposalSnapshotRecovery,
  GeneratorPreviewRecoveryStatus,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewSessionRecord,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
} from "../../../lib/platform-api"
import type { GeneratorPreviewFrontendImpact } from "./generator-preview-frontend-impact"

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
  GeneratorPreviewBlockerReason,
  GeneratorPreviewConfirmationEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewDriftStatus,
  GeneratorPreviewFrontendImpact,
  GeneratorPreviewFileCard,
  GeneratorPreviewFileDiffStats,
  GeneratorPreviewMigrationProposalSnapshotRecovery,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewMigrationProposalSnapshot,
  GeneratorPreviewRecoveryStatus,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
  GeneratorPreviewSessionRecord,
}
