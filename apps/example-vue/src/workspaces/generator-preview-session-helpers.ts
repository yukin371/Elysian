import type {
  GeneratorPreviewDiffSummary,
  GeneratorPreviewReport,
  GeneratorPreviewSessionDetail,
  GeneratorPreviewSessionRecord,
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
} from "../lib/platform-api"
import { ApiError } from "../lib/platform-api/core"
import { generatorPreviewErrorCodes } from "../lib/platform-api/error-codes"

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
  error instanceof ApiError && error.status === 401

export const isGeneratorPreviewErrorCode = (
  error: unknown,
  expectedCode: number,
) => error instanceof ApiError && error.code === expectedCode

export const isGeneratorPreviewErrorCodeOneOf = (
  error: unknown,
  expectedCodes: readonly number[],
) => error instanceof ApiError && expectedCodes.includes(error.code ?? -1)

export { generatorPreviewErrorCodes }

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
