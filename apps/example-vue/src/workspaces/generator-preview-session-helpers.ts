import type {
  GeneratorPreviewBlockerReason,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewDriftStatus,
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

const generatorPreviewDriftStatuses = new Set<GeneratorPreviewDriftStatus>([
  "clean",
  "stale",
  "apply-conflict",
])

const generatorPreviewBlockerReasonCodes = new Set<
  GeneratorPreviewBlockerReason["code"]
>([
  "review-required",
  "rejected",
  "blocking-conflicts",
  "confirmation-required",
])

const generatorPreviewBlockerReasonStages = new Set<
  GeneratorPreviewBlockerReason["stage"]
>(["review", "confirm", "apply"])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const readGeneratorPreviewDriftStatus = (
  details: Record<string, unknown>,
): GeneratorPreviewDriftStatus | null => {
  const driftStatus = details.driftStatus

  return typeof driftStatus === "string" &&
    generatorPreviewDriftStatuses.has(
      driftStatus as GeneratorPreviewDriftStatus,
    )
    ? (driftStatus as GeneratorPreviewDriftStatus)
    : null
}

const readGeneratorPreviewBlockerReasons = (
  details: Record<string, unknown>,
): GeneratorPreviewBlockerReason[] => {
  const blockerReasons = details.blockerReasons

  if (!Array.isArray(blockerReasons)) {
    return []
  }

  return blockerReasons.flatMap((reason) => {
    if (!isRecord(reason)) {
      return []
    }

    const code = reason.code
    const message = reason.message
    const stage = reason.stage

    if (
      typeof code !== "string" ||
      typeof message !== "string" ||
      typeof stage !== "string" ||
      !generatorPreviewBlockerReasonCodes.has(
        code as GeneratorPreviewBlockerReason["code"],
      ) ||
      !generatorPreviewBlockerReasonStages.has(
        stage as GeneratorPreviewBlockerReason["stage"],
      )
    ) {
      return []
    }

    return [
      {
        code: code as GeneratorPreviewBlockerReason["code"],
        message,
        stage: stage as GeneratorPreviewBlockerReason["stage"],
      },
    ]
  })
}

export const getGeneratorPreviewErrorDetails = (error: unknown) => {
  if (!(error instanceof ApiError) || !isRecord(error.details)) {
    return null
  }

  return {
    blockerReasons: readGeneratorPreviewBlockerReasons(error.details),
    driftStatus: readGeneratorPreviewDriftStatus(error.details),
  }
}

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
