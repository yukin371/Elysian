import type {
  GeneratorPreviewDiffSummary,
  GeneratorPreviewReport,
  GeneratorPreviewSessionDetail,
  GeneratorPreviewSessionRecord,
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
} from "../lib/platform-api"

export const generatorPreviewSessionStatusPriority: Record<
  GeneratorPreviewSessionRecord["status"],
  number
> = {
  pending_review: 0,
  ready: 1,
  rejected: 2,
  applied: 3,
}

export const isGeneratorPreviewRecoverableAuthError = (error: unknown) =>
  error instanceof Error && error.message.includes("status 401")

export const isGeneratorPreviewSessionDetailConsistent = (
  session: GeneratorPreviewSessionDetail,
) =>
  session.report.schemaName === session.schemaName &&
  session.report.frontendTarget === session.frontendTarget &&
  session.report.conflictStrategy === session.conflictStrategy

export const buildGeneratorPreviewSessionDetail = (
  session: GeneratorPreviewSessionRecord,
  diffSummary: GeneratorPreviewDiffSummary,
  report: GeneratorPreviewReport,
  sqlProposal: GeneratorPreviewSqlProposal | null,
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff,
): GeneratorPreviewSessionDetail => ({
  ...session,
  diffSummary,
  report,
  sqlProposal,
  sqlProposalHandoff,
})
