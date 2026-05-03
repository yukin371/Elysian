import { type Ref, computed, ref, watch } from "vue"

import {
  type FrontendTarget,
  getRegisteredSchema,
  listRegisteredSchemas,
} from "../lib/generator-preview-browser"
import {
  type GeneratorPreviewConflictStrategy,
  type GeneratorPreviewDiffSummary,
  type GeneratorPreviewReport,
  type GeneratorPreviewSessionDetail,
  type GeneratorPreviewSessionRecord,
  type GeneratorPreviewSqlProposal,
  type GeneratorPreviewSqlProposalHandoff,
  applyGeneratorPreviewSession,
  confirmGeneratorPreviewSession,
  createGeneratorPreviewSession,
  fetchGeneratorPreviewSession,
  listGeneratorPreviewSessions,
  reviewGeneratorPreviewSession,
} from "../lib/platform-api"

import {
  filterGeneratorPreviewFiles,
  resolveGeneratorPreviewSelection,
  toGeneratorPreviewFileCard,
} from "../lib/generator-preview-workspace"
import {
  createGeneratorPreviewSelectionCacheKey,
  loadStoredGeneratorPreviewSelection,
  persistGeneratorPreviewSelection,
} from "./generator-preview-selection-storage"
import {
  buildGeneratorPreviewSessionDetail,
  generatorPreviewSessionStatusPriority,
  isGeneratorPreviewRecoverableAuthError,
  isGeneratorPreviewSessionDetailConsistent,
} from "./generator-preview-session-helpers"

export const useGeneratorPreviewWorkspace = (
  t: (key: string, params?: Record<string, unknown>) => string,
  enabled: Readonly<Ref<boolean>>,
  onRecoverableAuthError: (error: unknown) => void,
) => {
  const availableSchemas = listRegisteredSchemas()
  const availableSchemaNames = availableSchemas.map((schema) => schema.name)
  const storedSelection =
    loadStoredGeneratorPreviewSelection(availableSchemaNames)
  const selectedSchemaName = ref(
    storedSelection?.schemaName ?? availableSchemaNames[0] ?? "",
  )
  const selectedFrontendTarget = ref<FrontendTarget>(
    storedSelection?.frontendTarget ?? "vue",
  )
  const previewQuery = ref("")
  const selectedFilePath = ref<string | null>(null)
  const loading = ref(false)
  const reviewLoading = ref(false)
  const applyLoading = ref(false)
  const errorMessage = ref("")
  const currentSession = ref<GeneratorPreviewSessionRecord | null>(null)
  const currentDiffSummary = ref<GeneratorPreviewDiffSummary | null>(null)
  const currentReport = ref<GeneratorPreviewReport | null>(null)
  const currentSqlProposal = ref<GeneratorPreviewSqlProposal | null>(null)
  const currentSqlProposalHandoff =
    ref<GeneratorPreviewSqlProposalHandoff | null>(null)
  const recentSessions = ref<GeneratorPreviewSessionRecord[]>([])
  const selectedRecentSessionId = ref("")
  const selectedConflictStrategy = ref<GeneratorPreviewConflictStrategy>(
    storedSelection?.conflictStrategy ?? "fail",
  )
  const sessionDetailCache = new Map<string, GeneratorPreviewSessionDetail>()
  const selectionSessionCache = new Map<string, GeneratorPreviewSessionDetail>()
  let latestPreviewRequestId = 0

  const schemaOptions = computed(() =>
    availableSchemas.map((schema) => ({
      label: `${schema.label} (${schema.name})`,
      value: schema.name,
    })),
  )

  const selectedSchema = computed(() =>
    selectedSchemaName.value
      ? getRegisteredSchema(selectedSchemaName.value)
      : null,
  )

  const previewFiles = computed(
    () => currentReport.value?.files.map(toGeneratorPreviewFileCard) ?? [],
  )

  const filteredPreviewFiles = computed(() =>
    filterGeneratorPreviewFiles(previewFiles.value, previewQuery.value),
  )

  const selectedPreviewFile = computed(
    () =>
      filteredPreviewFiles.value.find(
        (file) => file.path === selectedFilePath.value,
      ) ?? null,
  )

  const sqlPreview = computed(() => currentReport.value?.sqlPreview ?? null)

  const localizeSessionStatus = (
    status: GeneratorPreviewSessionRecord["status"],
  ) => {
    if (status === "applied") {
      return t("app.generatorPreview.status.applied")
    }

    if (status === "ready") {
      return t("app.generatorPreview.status.ready")
    }

    if (status === "rejected") {
      return t("app.generatorPreview.status.rejected")
    }

    return t("app.generatorPreview.status.pendingReview")
  }

  const localizeConflictStrategy = (
    strategy: GeneratorPreviewConflictStrategy,
  ) => t(`app.generatorPreview.conflictStrategy.${strategy}`)

  const isSessionMatchingSelection = (session: GeneratorPreviewSessionRecord) =>
    session.schemaName === selectedSchemaName.value &&
    session.frontendTarget === selectedFrontendTarget.value &&
    session.conflictStrategy === selectedConflictStrategy.value

  const prioritizeRecentSessions = (
    sessions: GeneratorPreviewSessionRecord[],
  ) => {
    const matchingSelection: Array<{
      index: number
      session: GeneratorPreviewSessionRecord
    }> = []
    const otherSessions: Array<{
      index: number
      session: GeneratorPreviewSessionRecord
    }> = []

    for (const [index, session] of sessions.entries()) {
      if (isSessionMatchingSelection(session)) {
        matchingSelection.push({ index, session })
        continue
      }

      otherSessions.push({ index, session })
    }

    const sortByReviewPriority = (
      left: { index: number; session: GeneratorPreviewSessionRecord },
      right: { index: number; session: GeneratorPreviewSessionRecord },
    ) => {
      const statusPriorityDelta =
        generatorPreviewSessionStatusPriority[left.session.status] -
        generatorPreviewSessionStatusPriority[right.session.status]

      if (statusPriorityDelta !== 0) {
        return statusPriorityDelta
      }

      return left.index - right.index
    }

    return [
      ...matchingSelection.sort(sortByReviewPriority),
      ...otherSessions,
    ].map(({ session }) => session)
  }

  const recentSessionOptions = computed(() =>
    prioritizeRecentSessions(recentSessions.value)
      .slice(0, 8)
      .map((session) => ({
        label: [
          session.schemaName,
          session.frontendTarget,
          localizeConflictStrategy(session.conflictStrategy),
          localizeSessionStatus(session.status),
          session.createdAt,
        ].join(" · "),
        value: session.id,
      })),
  )

  const conflictStrategyOptions = computed(() => [
    {
      label: t("app.generatorPreview.conflictStrategy.skip"),
      value: "skip",
    },
    {
      label: t("app.generatorPreview.conflictStrategy.overwrite"),
      value: "overwrite",
    },
    {
      label: t(
        "app.generatorPreview.conflictStrategy.overwrite-generated-only",
      ),
      value: "overwrite-generated-only",
    },
    {
      label: t("app.generatorPreview.conflictStrategy.fail"),
      value: "fail",
    },
  ])

  const filterSummary = computed(() => {
    const fragments = [
      t("app.generatorPreview.filter.schemaSummary", {
        value: selectedSchema.value?.name ?? "-",
      }),
      t("app.generatorPreview.filter.frontendSummary", {
        value: selectedFrontendTarget.value,
      }),
      t("app.generatorPreview.filter.conflictSummary", {
        value: t(
          `app.generatorPreview.conflictStrategy.${selectedConflictStrategy.value}`,
        ),
      }),
    ]

    if (previewQuery.value.trim().length > 0) {
      fragments.push(
        t("app.generatorPreview.filter.querySummary", {
          value: previewQuery.value.trim(),
        }),
      )
    }

    return fragments.join(" / ")
  })

  const canApplyPreview = computed(
    () =>
      currentSession.value !== null &&
      currentSession.value.status === "ready" &&
      currentSession.value.confirmedAt !== null &&
      !currentSession.value.hasBlockingConflicts &&
      enabled.value &&
      !loading.value &&
      !reviewLoading.value &&
      !applyLoading.value,
  )

  const canConfirmPreview = computed(
    () =>
      currentSession.value !== null &&
      currentSession.value.status === "ready" &&
      currentSession.value.confirmedAt === null &&
      currentSqlProposalHandoff.value !== null &&
      currentSqlProposalHandoff.value.proposalStatus === "ready" &&
      enabled.value &&
      !loading.value &&
      !reviewLoading.value &&
      !applyLoading.value,
  )

  const canApprovePreview = computed(
    () =>
      currentSession.value !== null &&
      currentSession.value.status === "pending_review" &&
      enabled.value &&
      !loading.value &&
      !reviewLoading.value &&
      !applyLoading.value,
  )

  const canRejectPreview = computed(() => canApprovePreview.value)

  const resetFilters = () => {
    previewQuery.value = ""
  }

  const resetPreviewState = () => {
    currentSession.value = null
    currentDiffSummary.value = null
    currentReport.value = null
    currentSqlProposal.value = null
    currentSqlProposalHandoff.value = null
    selectedRecentSessionId.value = ""
  }

  const currentSelectionMatchesSession = () =>
    currentSession.value?.schemaName === selectedSchemaName.value &&
    currentSession.value?.frontendTarget === selectedFrontendTarget.value &&
    currentSession.value?.conflictStrategy === selectedConflictStrategy.value &&
    currentReport.value?.schemaName === selectedSchemaName.value &&
    currentReport.value?.frontendTarget === selectedFrontendTarget.value

  const canPreservePreviewState = () =>
    currentSession.value?.schemaName === selectedSchemaName.value &&
    currentSession.value?.frontendTarget === selectedFrontendTarget.value &&
    currentSession.value?.conflictStrategy === selectedConflictStrategy.value &&
    currentReport.value?.schemaName === selectedSchemaName.value &&
    currentReport.value?.frontendTarget === selectedFrontendTarget.value &&
    currentReport.value?.conflictStrategy === selectedConflictStrategy.value

  const findMatchingRecentSession = (
    sessions: GeneratorPreviewSessionRecord[],
  ) =>
    prioritizeRecentSessions(sessions).find(isSessionMatchingSelection) ?? null

  const getCurrentSelectionCacheKey = () =>
    createGeneratorPreviewSelectionCacheKey(
      selectedSchemaName.value,
      selectedFrontendTarget.value,
      selectedConflictStrategy.value,
    )

  const cacheSessionDetail = (session: GeneratorPreviewSessionDetail) => {
    sessionDetailCache.set(session.id, session)
    selectionSessionCache.set(
      createGeneratorPreviewSelectionCacheKey(
        session.schemaName,
        session.frontendTarget,
        session.conflictStrategy,
      ),
      session,
    )
  }

  const upsertRecentSession = (session: GeneratorPreviewSessionRecord) => {
    recentSessions.value = [
      session,
      ...recentSessions.value.filter(
        (item: GeneratorPreviewSessionRecord) => item.id !== session.id,
      ),
    ]
  }

  const persistCurrentSelection = () => {
    if (!selectedSchemaName.value) {
      return
    }

    persistGeneratorPreviewSelection({
      conflictStrategy: selectedConflictStrategy.value,
      frontendTarget: selectedFrontendTarget.value,
      schemaName: selectedSchemaName.value,
      sessionId: currentSelectionMatchesSession()
        ? (currentSession.value?.id ?? null)
        : null,
    })
  }

  const applySessionDetail = (session: GeneratorPreviewSessionDetail) => {
    if (!isGeneratorPreviewSessionDetailConsistent(session)) {
      errorMessage.value = "Generator session detail does not match its report"
      return false
    }

    cacheSessionDetail(session)
    upsertRecentSession(session)
    selectedSchemaName.value = session.schemaName
    selectedFrontendTarget.value = session.frontendTarget
    selectedConflictStrategy.value = session.conflictStrategy
    currentSession.value = session
    currentDiffSummary.value = session.diffSummary
    currentReport.value = session.report
    currentSqlProposal.value = session.sqlProposal
    currentSqlProposalHandoff.value = session.sqlProposalHandoff
    selectedRecentSessionId.value = session.id
    persistCurrentSelection()
    return true
  }

  const refreshSessionDetailAfterStateDrift = async (
    sessionId: string,
    staleMessage: string,
  ) => {
    try {
      const session = await fetchGeneratorPreviewSession(sessionId)

      if (applySessionDetail(session)) {
        errorMessage.value = staleMessage
        return true
      }

      resetPreviewState()
      return false
    } catch (refreshError) {
      onRecoverableAuthError(refreshError)
      errorMessage.value =
        refreshError instanceof Error
          ? refreshError.message
          : "Generator session restore failed"
      return true
    }
  }

  const restoreStoredSession = async () => {
    const storedSessionId = storedSelection?.sessionId

    if (!storedSessionId) {
      return false
    }

    loading.value = true
    errorMessage.value = ""

    try {
      const session =
        sessionDetailCache.get(storedSessionId) ??
        (await fetchGeneratorPreviewSession(storedSessionId))

      if (
        session.schemaName !== selectedSchemaName.value ||
        session.frontendTarget !== selectedFrontendTarget.value ||
        session.conflictStrategy !== selectedConflictStrategy.value ||
        !isGeneratorPreviewSessionDetailConsistent(session)
      ) {
        return false
      }

      return applySessionDetail(session)
    } catch (error) {
      if (isGeneratorPreviewRecoverableAuthError(error)) {
        onRecoverableAuthError(error)
        errorMessage.value = error.message
        return true
      }

      return false
    } finally {
      loading.value = false
    }
  }

  const restoreCachedMatchingSession = () => {
    const cachedSession = selectionSessionCache.get(
      getCurrentSelectionCacheKey(),
    )

    if (!cachedSession) {
      return false
    }

    if (!isGeneratorPreviewSessionDetailConsistent(cachedSession)) {
      return false
    }

    return applySessionDetail(cachedSession)
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
      recentSessions.value = response.items

      const matchedSession = findMatchingRecentSession(response.items)

      if (!matchedSession) {
        return false
      }

      loading.value = true
      errorMessage.value = ""

      try {
        const session =
          sessionDetailCache.get(matchedSession.id) ??
          (await fetchGeneratorPreviewSession(matchedSession.id))

        if (
          !isSessionMatchingSelection(session) ||
          !isGeneratorPreviewSessionDetailConsistent(session)
        ) {
          return false
        }

        return applySessionDetail(session)
      } finally {
        loading.value = false
      }
    } catch (error) {
      if (isGeneratorPreviewRecoverableAuthError(error)) {
        onRecoverableAuthError(error)
        errorMessage.value = error.message
        return true
      }

      recentSessions.value = []
      return false
    }
  }

  const refreshPreview = async () => {
    if (
      loading.value ||
      applyLoading.value ||
      reviewLoading.value ||
      !enabled.value ||
      !selectedSchemaName.value
    ) {
      return
    }

    const requestId = latestPreviewRequestId + 1
    latestPreviewRequestId = requestId
    loading.value = true
    errorMessage.value = ""

    try {
      const response = await createGeneratorPreviewSession({
        conflictStrategy: selectedConflictStrategy.value,
        schemaName: selectedSchemaName.value,
        frontendTarget: selectedFrontendTarget.value,
        targetPreset: "staging",
      })

      if (requestId !== latestPreviewRequestId) {
        return
      }

      if (
        !applySessionDetail(
          buildGeneratorPreviewSessionDetail(
            response.session,
            response.diff,
            response.report,
            response.sqlProposal,
            response.sqlProposalHandoff,
          ),
        )
      ) {
        resetPreviewState()
      }
    } catch (error) {
      if (requestId !== latestPreviewRequestId) {
        return
      }

      if (!canPreservePreviewState()) {
        resetPreviewState()
      }
      onRecoverableAuthError(error)
      errorMessage.value =
        error instanceof Error ? error.message : "Generator preview failed"
    } finally {
      if (requestId === latestPreviewRequestId) {
        loading.value = false
      }
    }
  }

  const applyPreview = async () => {
    const sessionId = currentSession.value?.id
    if (!sessionId || !canApplyPreview.value) {
      return
    }

    applyLoading.value = true
    errorMessage.value = ""

    try {
      const response = await applyGeneratorPreviewSession(sessionId)

      if (response.session.id !== sessionId) {
        errorMessage.value =
          "Generator apply response does not match current session"
        return
      }

      if (currentReport.value) {
        applySessionDetail(
          buildGeneratorPreviewSessionDetail(
            response.session,
            response.diff,
            currentReport.value,
            response.sqlProposal,
            response.sqlProposalHandoff,
          ),
        )
      } else {
        upsertRecentSession(response.session)
        currentSession.value = response.session
        currentDiffSummary.value = response.diff
        currentSqlProposal.value = response.sqlProposal
        currentSqlProposalHandoff.value = response.sqlProposalHandoff
        selectedRecentSessionId.value = response.session.id
        persistCurrentSelection()
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("GENERATOR_SESSION_NOT_READY") ||
          error.message.includes("GENERATOR_SESSION_REJECTED") ||
          error.message.includes("GENERATOR_SESSION_CONFIRMATION_REQUIRED"))
      ) {
        if (
          await refreshSessionDetailAfterStateDrift(sessionId, error.message)
        ) {
          return
        }
      }

      onRecoverableAuthError(error)
      errorMessage.value =
        error instanceof Error ? error.message : "Generator apply failed"
    } finally {
      applyLoading.value = false
    }
  }

  const reviewPreview = async (
    decision: "approve" | "reject",
    comment?: string,
  ) => {
    const sessionId = currentSession.value?.id
    const canReview =
      decision === "approve" ? canApprovePreview.value : canRejectPreview.value

    if (!sessionId || !canReview) {
      return
    }

    reviewLoading.value = true
    errorMessage.value = ""

    try {
      const response = await reviewGeneratorPreviewSession(sessionId, {
        comment: comment?.trim() ? comment.trim() : undefined,
        decision,
      })

      if (response.session.id !== sessionId) {
        errorMessage.value =
          "Generator review response does not match current session"
        return
      }

      if (currentReport.value) {
        applySessionDetail(
          buildGeneratorPreviewSessionDetail(
            response.session,
            response.diff,
            currentReport.value,
            response.sqlProposal,
            response.sqlProposalHandoff,
          ),
        )
      } else {
        upsertRecentSession(response.session)
        currentSession.value = response.session
        currentDiffSummary.value = response.diff
        currentSqlProposal.value = response.sqlProposal
        currentSqlProposalHandoff.value = response.sqlProposalHandoff
        selectedRecentSessionId.value = response.session.id
        persistCurrentSelection()
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("GENERATOR_SESSION_REVIEW_NOT_PENDING")
      ) {
        if (
          await refreshSessionDetailAfterStateDrift(sessionId, error.message)
        ) {
          return
        }
      }

      onRecoverableAuthError(error)
      errorMessage.value =
        error instanceof Error ? error.message : "Generator review failed"
    } finally {
      reviewLoading.value = false
    }
  }

  const confirmPreview = async () => {
    const sessionId = currentSession.value?.id
    const handoff = currentSqlProposalHandoff.value
    if (!sessionId || !handoff || !canConfirmPreview.value) {
      return
    }

    reviewLoading.value = true
    errorMessage.value = ""

    try {
      const response = await confirmGeneratorPreviewSession(sessionId, {
        displayedRecoveryStatus:
          handoff.migrationProposalSnapshotRecovery?.status ?? "none",
        displayedSnapshotPath: handoff.migrationProposalSnapshotPath,
      })

      if (response.session.id !== sessionId) {
        errorMessage.value =
          "Generator confirmation response does not match current session"
        return
      }

      upsertRecentSession(response.session)
      currentSession.value = {
        ...currentSession.value,
        ...response.session,
      }
      currentSqlProposalHandoff.value = response.sqlProposalHandoff
      selectedRecentSessionId.value = response.session.id
      persistCurrentSelection()
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes(
          "GENERATOR_SESSION_CONFIRMATION_HANDOFF_MISMATCH",
        ) ||
          error.message.includes(
            "GENERATOR_SESSION_CONFIRMATION_NOT_READY",
          ))
      ) {
        if (
          await refreshSessionDetailAfterStateDrift(sessionId, error.message)
        ) {
          return
        }
      }

      onRecoverableAuthError(error)
      errorMessage.value =
        error instanceof Error ? error.message : "Generator confirmation failed"
    } finally {
      reviewLoading.value = false
    }
  }

  const restorePreviewSession = async (sessionId: string) => {
    if (
      !sessionId ||
      loading.value ||
      reviewLoading.value ||
      applyLoading.value
    ) {
      return
    }

    if (
      currentSession.value?.id === sessionId &&
      currentReport.value !== null &&
      selectedRecentSessionId.value === sessionId
    ) {
      return
    }

    loading.value = true
    errorMessage.value = ""

    try {
      const session =
        sessionDetailCache.get(sessionId) ??
        (await fetchGeneratorPreviewSession(sessionId))

      if (!applySessionDetail(session)) {
        resetPreviewState()
      }
    } catch (error) {
      onRecoverableAuthError(error)
      errorMessage.value =
        error instanceof Error
          ? error.message
          : "Generator session restore failed"
    } finally {
      loading.value = false
    }
  }

  watch(
    filteredPreviewFiles,
    (files) => {
      selectedFilePath.value = resolveGeneratorPreviewSelection(
        files,
        selectedFilePath.value,
      )
    },
    { immediate: true },
  )

  watch(
    [selectedSchemaName, selectedFrontendTarget, selectedConflictStrategy],
    () => {
      resetFilters()

      if (!currentSelectionMatchesSession()) {
        selectedRecentSessionId.value = ""
      }
    },
  )

  watch(
    [selectedSchemaName, selectedFrontendTarget, selectedConflictStrategy],
    ([schemaName, frontendTarget, conflictStrategy]) => {
      if (!schemaName) {
        return
      }

      persistGeneratorPreviewSelection({
        conflictStrategy,
        frontendTarget,
        schemaName,
        sessionId: currentSelectionMatchesSession()
          ? (currentSession.value?.id ?? null)
          : null,
      })
    },
    { immediate: true },
  )

  watch(
    [
      selectedSchemaName,
      selectedFrontendTarget,
      selectedConflictStrategy,
      enabled,
    ],
    async ([, , , nextEnabled]) => {
      if (!nextEnabled) {
        return
      }

      if (currentSelectionMatchesSession()) {
        return
      }

      if (await restoreLatestMatchingSession()) {
        return
      }

      void refreshPreview()
    },
    { immediate: true },
  )

  return {
    applyLoading,
    applyPreview,
    canApplyPreview,
    canApprovePreview,
    canConfirmPreview,
    canRejectPreview,
    currentDiffSummary,
    currentSession,
    currentSqlProposal,
    currentSqlProposalHandoff,
    conflictStrategyOptions,
    errorMessage,
    filterSummary,
    filteredPreviewFiles,
    loading,
    previewQuery,
    recentSessionOptions,
    refreshPreview,
    resetFilters,
    restorePreviewSession,
    confirmPreview,
    reviewLoading,
    reviewPreview,
    schemaOptions,
    selectedRecentSessionId,
    selectedConflictStrategy,
    selectedFilePath,
    selectedFrontendTarget,
    selectedPreviewFile,
    selectedSchema,
    selectedSchemaName,
    sqlProposal: currentSqlProposal,
    sqlProposalHandoff: currentSqlProposalHandoff,
    sqlPreview,
  }
}
