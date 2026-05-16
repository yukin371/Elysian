import type { Ref } from "vue"

import {
  type GeneratorPreviewDiffSummary,
  type GeneratorPreviewReport,
  type GeneratorPreviewSessionDetail,
  type GeneratorPreviewSessionRecord,
  type GeneratorPreviewSqlProposal,
  type GeneratorPreviewSqlProposalHandoff,
  applyGeneratorPreviewSession,
  confirmGeneratorPreviewSession,
  reviewGeneratorPreviewSession,
} from "../lib/platform-api"

import {
  buildGeneratorPreviewSessionDetail,
  generatorPreviewErrorCodes,
  isGeneratorPreviewErrorCode,
  isGeneratorPreviewErrorCodeOneOf,
  isGeneratorPreviewRecoverableAuthError,
} from "./generator-preview-session-helpers"

type CreateGeneratorPreviewSessionActionsOptions = {
  applyLoading: Ref<boolean>
  applySessionDetail: (session: GeneratorPreviewSessionDetail) => boolean
  canApplyPreview: Readonly<Ref<boolean>>
  canApprovePreview: Readonly<Ref<boolean>>
  canConfirmPreview: Readonly<Ref<boolean>>
  canRejectPreview: Readonly<Ref<boolean>>
  currentDiffSummary: Ref<GeneratorPreviewDiffSummary | null>
  currentReport: Ref<GeneratorPreviewReport | null>
  currentSession: Ref<GeneratorPreviewSessionRecord | null>
  currentSqlProposal: Ref<GeneratorPreviewSqlProposal | null>
  currentSqlProposalHandoff: Ref<GeneratorPreviewSqlProposalHandoff | null>
  onRecoverableAuthError: (error: unknown) => void
  persistCurrentSelection: () => void
  refreshPreviewAfterApplyStale: () => Promise<boolean>
  refreshSessionDetailAfterStateDrift: (
    sessionId: string,
    staleMessage: string,
  ) => Promise<boolean>
  reviewLoading: Ref<boolean>
  resolveErrorMessage: (error: unknown, fallback: string) => string
  selectedRecentSessionId: Ref<string>
  setErrorMessage: (message: string) => void
  upsertRecentSession: (session: GeneratorPreviewSessionRecord) => void
}

export const createGeneratorPreviewSessionActions = (
  options: CreateGeneratorPreviewSessionActionsOptions,
) => {
  const applyPreview = async () => {
    const sessionId = options.currentSession.value?.id
    if (!sessionId || !options.canApplyPreview.value) {
      return
    }

    options.applyLoading.value = true
    options.setErrorMessage("")

    try {
      const response = await applyGeneratorPreviewSession(sessionId)

      if (response.session.id !== sessionId) {
        options.setErrorMessage(
          "Generator apply response does not match current session",
        )
        return
      }

      if (options.currentReport.value) {
        options.applySessionDetail(
          buildGeneratorPreviewSessionDetail(
            response.session,
            response.diff,
            options.currentReport.value,
            response.sqlProposal,
            response.sqlProposalHandoff,
          ),
        )
      } else {
        options.upsertRecentSession(response.session)
        options.currentSession.value = response.session
        options.currentDiffSummary.value = response.diff
        options.currentSqlProposal.value = response.sqlProposal
        options.currentSqlProposalHandoff.value = response.sqlProposalHandoff
        options.selectedRecentSessionId.value = response.session.id
        options.persistCurrentSelection()
      }
    } catch (error) {
      const applyErrorMessage = options.resolveErrorMessage(
        error,
        "Generator apply failed",
      )

      if (
        isGeneratorPreviewErrorCodeOneOf(error, [
          generatorPreviewErrorCodes.GENERATOR_SESSION_STALE,
          generatorPreviewErrorCodes.GENERATOR_SESSION_APPLY_CONFLICT,
        ])
      ) {
        if (await options.refreshPreviewAfterApplyStale()) {
          options.setErrorMessage(applyErrorMessage)
          return
        }

        return
      }

      if (
        isGeneratorPreviewErrorCodeOneOf(error, [
          generatorPreviewErrorCodes.GENERATOR_SESSION_NOT_READY,
          generatorPreviewErrorCodes.GENERATOR_SESSION_REJECTED,
          generatorPreviewErrorCodes.GENERATOR_SESSION_CONFIRMATION_REQUIRED,
          generatorPreviewErrorCodes.GENERATOR_SESSION_BLOCKING_CONFLICTS,
        ])
      ) {
        if (
          await options.refreshSessionDetailAfterStateDrift(
            sessionId,
            applyErrorMessage,
          )
        ) {
          return
        }
      }

      if (isGeneratorPreviewRecoverableAuthError(error)) {
        options.onRecoverableAuthError(error)
      }
      options.setErrorMessage(applyErrorMessage)
    } finally {
      options.applyLoading.value = false
    }
  }

  const reviewPreview = async (
    decision: "approve" | "reject",
    comment?: string,
  ) => {
    const sessionId = options.currentSession.value?.id
    const canReview =
      decision === "approve"
        ? options.canApprovePreview.value
        : options.canRejectPreview.value

    if (!sessionId || !canReview) {
      return
    }

    options.reviewLoading.value = true
    options.setErrorMessage("")

    try {
      const response = await reviewGeneratorPreviewSession(sessionId, {
        comment: comment?.trim() ? comment.trim() : undefined,
        decision,
      })

      if (response.session.id !== sessionId) {
        options.setErrorMessage(
          "Generator review response does not match current session",
        )
        return
      }

      if (options.currentReport.value) {
        options.applySessionDetail(
          buildGeneratorPreviewSessionDetail(
            response.session,
            response.diff,
            options.currentReport.value,
            response.sqlProposal,
            response.sqlProposalHandoff,
          ),
        )
      } else {
        options.upsertRecentSession(response.session)
        options.currentSession.value = response.session
        options.currentDiffSummary.value = response.diff
        options.currentSqlProposal.value = response.sqlProposal
        options.currentSqlProposalHandoff.value = response.sqlProposalHandoff
        options.selectedRecentSessionId.value = response.session.id
        options.persistCurrentSelection()
      }
    } catch (error) {
      const reviewErrorMessage = options.resolveErrorMessage(
        error,
        "Generator review failed",
      )

      if (
        isGeneratorPreviewErrorCode(
          error,
          generatorPreviewErrorCodes.GENERATOR_SESSION_REVIEW_NOT_PENDING,
        )
      ) {
        if (
          await options.refreshSessionDetailAfterStateDrift(
            sessionId,
            reviewErrorMessage,
          )
        ) {
          return
        }
      }

      if (isGeneratorPreviewRecoverableAuthError(error)) {
        options.onRecoverableAuthError(error)
      }
      options.setErrorMessage(reviewErrorMessage)
    } finally {
      options.reviewLoading.value = false
    }
  }

  const confirmPreview = async () => {
    const sessionId = options.currentSession.value?.id
    const handoff = options.currentSqlProposalHandoff.value
    if (!sessionId || !handoff || !options.canConfirmPreview.value) {
      return
    }

    options.reviewLoading.value = true
    options.setErrorMessage("")

    try {
      const response = await confirmGeneratorPreviewSession(sessionId, {
        displayedRecoveryStatus:
          handoff.migrationProposalSnapshotRecovery?.status ?? "none",
        displayedSnapshotPath: handoff.migrationProposalSnapshotPath,
      })

      if (response.session.id !== sessionId) {
        options.setErrorMessage(
          "Generator confirmation response does not match current session",
        )
        return
      }

      options.upsertRecentSession(response.session)
      options.currentSession.value = {
        ...options.currentSession.value,
        ...response.session,
      }
      options.currentSqlProposalHandoff.value = response.sqlProposalHandoff
      options.selectedRecentSessionId.value = response.session.id
      options.persistCurrentSelection()
    } catch (error) {
      const confirmationErrorMessage = options.resolveErrorMessage(
        error,
        "Generator confirmation failed",
      )

      if (
        isGeneratorPreviewErrorCodeOneOf(error, [
          generatorPreviewErrorCodes.GENERATOR_SESSION_CONFIRMATION_HANDOFF_MISMATCH,
          generatorPreviewErrorCodes.GENERATOR_SESSION_SQL_PROPOSAL_NOT_READY,
          generatorPreviewErrorCodes.GENERATOR_SESSION_CONFIRMATION_NOT_READY,
        ])
      ) {
        if (
          await options.refreshSessionDetailAfterStateDrift(
            sessionId,
            confirmationErrorMessage,
          )
        ) {
          return
        }
      }

      if (isGeneratorPreviewRecoverableAuthError(error)) {
        options.onRecoverableAuthError(error)
      }
      options.setErrorMessage(confirmationErrorMessage)
    } finally {
      options.reviewLoading.value = false
    }
  }

  return {
    applyPreview,
    confirmPreview,
    reviewPreview,
  }
}
