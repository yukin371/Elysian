import type { Ref } from "vue"

import type { FrontendTarget } from "../lib/generator-preview-browser"
import {
  fetchGeneratorPreviewSession,
  listGeneratorPreviewSessions,
  type GeneratorPreviewConflictStrategy,
  type GeneratorPreviewSessionDetail,
  type GeneratorPreviewSessionRecord,
} from "../lib/platform-api"

import { isGeneratorPreviewRecoverableAuthError } from "./generator-preview-session-helpers"
import {
  generatorPreviewErrorCodes,
  isGeneratorPreviewErrorCode,
} from "./generator-preview-session-helpers"

type CreateGeneratorPreviewSessionRestoreOptions = {
  applySessionDetail: (session: GeneratorPreviewSessionDetail) => boolean
  findMatchingRecentSession: (
    sessions: GeneratorPreviewSessionRecord[],
  ) => GeneratorPreviewSessionRecord | null
  getCurrentSelectionCacheKey: () => string
  isSessionMatchingSelection: (
    session: GeneratorPreviewSessionRecord,
  ) => boolean
  loading: Ref<boolean>
  onRecoverableAuthError: (error: unknown) => void
  prioritizeRecentSessions: (
    sessions: GeneratorPreviewSessionRecord[],
  ) => GeneratorPreviewSessionRecord[]
  recentSessions: Ref<GeneratorPreviewSessionRecord[]>
  resetPreviewState: () => void
  selectedConflictStrategy: Readonly<Ref<GeneratorPreviewConflictStrategy>>
  selectedFrontendTarget: Readonly<Ref<FrontendTarget>>
  selectedSchemaName: Readonly<Ref<string>>
  selectionSessionCache: Map<string, GeneratorPreviewSessionDetail>
  sessionDetailCache: Map<string, GeneratorPreviewSessionDetail>
  setErrorMessage: (message: string) => void
  storedSessionId: string | null | undefined
}

export const createGeneratorPreviewSessionRestore = (
  options: CreateGeneratorPreviewSessionRestoreOptions,
) => {
  const refreshSessionDetailAfterStateDrift = async (
    sessionId: string,
    staleMessage: string,
  ) => {
    try {
      const session = await fetchGeneratorPreviewSession(sessionId)

      if (options.applySessionDetail(session)) {
        options.setErrorMessage(staleMessage)
        return true
      }

      options.resetPreviewState()
      return false
    } catch (refreshError) {
      if (isGeneratorPreviewRecoverableAuthError(refreshError)) {
        options.onRecoverableAuthError(refreshError)
      }
      options.setErrorMessage(
        refreshError instanceof Error
          ? refreshError.message
          : "Generator session restore failed",
      )
      return true
    }
  }

  const restoreStoredSession = async () => {
    if (!options.storedSessionId) {
      return false
    }

    options.loading.value = true
    options.setErrorMessage("")

    try {
      const session =
        options.sessionDetailCache.get(options.storedSessionId) ??
        (await fetchGeneratorPreviewSession(options.storedSessionId))

      if (
        session.schemaName !== options.selectedSchemaName.value ||
        session.frontendTarget !== options.selectedFrontendTarget.value ||
        session.conflictStrategy !== options.selectedConflictStrategy.value
      ) {
        return false
      }

      return options.applySessionDetail(session)
    } catch (error) {
      if (isGeneratorPreviewRecoverableAuthError(error)) {
        options.onRecoverableAuthError(error)
        options.setErrorMessage(
          error instanceof Error ? error.message : "Generator session restore failed",
        )
        return true
      }

      if (
        isGeneratorPreviewErrorCode(
          error,
          generatorPreviewErrorCodes.GENERATOR_SESSION_NOT_FOUND,
        )
      ) {
        return false
      }

      options.setErrorMessage(
        error instanceof Error
          ? error.message
          : "Generator session restore failed",
      )
      return true
    } finally {
      options.loading.value = false
    }
  }

  const restoreCachedMatchingSession = () => {
    const cachedSession = options.selectionSessionCache.get(
      options.getCurrentSelectionCacheKey(),
    )

    if (!cachedSession) {
      return false
    }

    return options.applySessionDetail(cachedSession)
  }

  const restoreLatestMatchingSession = async () => {
    if (await restoreStoredSession()) {
      return true
    }

    if (restoreCachedMatchingSession()) {
      return true
    }

    try {
      const response = await listGeneratorPreviewSessions()
      options.recentSessions.value = response.items

      const matchedSession = options.findMatchingRecentSession(response.items)

      if (!matchedSession) {
        return false
      }

      options.loading.value = true
      options.setErrorMessage("")

      try {
        const orderedMatchingSessions = options
          .prioritizeRecentSessions(response.items)
          .filter(options.isSessionMatchingSelection)

        for (const candidateSession of orderedMatchingSessions) {
          try {
            const session =
              options.sessionDetailCache.get(candidateSession.id) ??
              (await fetchGeneratorPreviewSession(candidateSession.id))

            if (!options.isSessionMatchingSelection(session)) {
              continue
            }

            if (options.applySessionDetail(session)) {
              return true
            }
          } catch (error) {
            if (isGeneratorPreviewRecoverableAuthError(error)) {
              options.onRecoverableAuthError(error)
              options.setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "Generator session restore failed",
              )
              return true
            }

            if (
              isGeneratorPreviewErrorCode(
                error,
                generatorPreviewErrorCodes.GENERATOR_SESSION_NOT_FOUND,
              )
            ) {
              continue
            }

            options.setErrorMessage(
              error instanceof Error
                ? error.message
                : "Generator session restore failed",
            )
            return true
          }
        }

        return false
      } finally {
        options.loading.value = false
      }
    } catch (error) {
      if (isGeneratorPreviewRecoverableAuthError(error)) {
        options.onRecoverableAuthError(error)
        options.setErrorMessage(
          error instanceof Error ? error.message : "Generator session restore failed",
        )
        return true
      }

      if (error instanceof Error && error.message.includes("status 404")) {
        options.recentSessions.value = []
        return false
      }

      options.recentSessions.value = []
      options.setErrorMessage(
        error instanceof Error
          ? error.message
          : "Generator session restore failed",
      )
      return true
    }
  }

  return {
    refreshSessionDetailAfterStateDrift,
    restoreCachedMatchingSession,
    restoreLatestMatchingSession,
    restoreStoredSession,
  }
}
