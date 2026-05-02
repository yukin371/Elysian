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

const GENERATOR_PREVIEW_SELECTION_STORAGE_KEY =
  "elysian.example-vue.generator-preview.selection"

type GeneratorPreviewStoredSelection = {
  conflictStrategy: GeneratorPreviewConflictStrategy
  frontendTarget: FrontendTarget
  schemaName: string
  sessionId: string | null
}

const generatorPreviewSessionStatusPriority: Record<
  GeneratorPreviewSessionRecord["status"],
  number
> = {
  pending_review: 0,
  ready: 1,
  rejected: 2,
  applied: 3,
}

const createGeneratorPreviewSelectionCacheKey = (
  schemaName: string,
  frontendTarget: FrontendTarget,
  conflictStrategy: GeneratorPreviewConflictStrategy,
) => `${schemaName}::${frontendTarget}::${conflictStrategy}`

const isGeneratorPreviewConflictStrategy = (
  value: unknown,
): value is GeneratorPreviewConflictStrategy =>
  value === "skip" ||
  value === "overwrite" ||
  value === "overwrite-generated-only" ||
  value === "fail"

const isFrontendTarget = (value: unknown): value is FrontendTarget =>
  value === "vue" || value === "react"

const loadStoredGeneratorPreviewSelection = (
  availableSchemaNames: readonly string[],
): GeneratorPreviewStoredSelection | null => {
  const storage = globalThis.localStorage

  if (!storage) {
    return null
  }

  try {
    const raw = storage.getItem(GENERATOR_PREVIEW_SELECTION_STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<GeneratorPreviewStoredSelection>

    if (
      typeof parsed.schemaName !== "string" ||
      !availableSchemaNames.includes(parsed.schemaName) ||
      !isFrontendTarget(parsed.frontendTarget) ||
      !isGeneratorPreviewConflictStrategy(parsed.conflictStrategy)
    ) {
      return null
    }

    return {
      conflictStrategy: parsed.conflictStrategy,
      frontendTarget: parsed.frontendTarget,
      schemaName: parsed.schemaName,
      sessionId: typeof parsed.sessionId === "string" ? parsed.sessionId : null,
    }
  } catch {
    return null
  }
}

const persistGeneratorPreviewSelection = (
  selection: GeneratorPreviewStoredSelection,
) => {
  const storage = globalThis.localStorage

  if (!storage) {
    return
  }

  storage.setItem(
    GENERATOR_PREVIEW_SELECTION_STORAGE_KEY,
    JSON.stringify(selection),
  )
}

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
  const selectionSessionCache = new Map<
    string,
    GeneratorPreviewSessionDetail
  >()
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

  const isSessionMatchingSelection = (
    session: GeneratorPreviewSessionRecord,
  ) =>
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

    return [...matchingSelection.sort(sortByReviewPriority), ...otherSessions]
      .map(({ session }) => session)
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
      label: t("app.generatorPreview.conflictStrategy.overwrite-generated-only"),
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
      !currentSession.value.hasBlockingConflicts &&
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

  const findMatchingRecentSession = (sessions: GeneratorPreviewSessionRecord[]) =>
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

  const buildSessionDetail = (
    session: GeneratorPreviewSessionRecord,
    diffSummary: GeneratorPreviewDiffSummary,
    report: GeneratorPreviewReport,
    sqlProposal: GeneratorPreviewSqlProposal | null,
    sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff | null,
  ): GeneratorPreviewSessionDetail => ({
    ...session,
    diffSummary,
    report,
    sqlProposal,
    sqlProposalHandoff,
  })

  const upsertRecentSession = (session: GeneratorPreviewSessionRecord) => {
    recentSessions.value = [
      session,
      ...recentSessions.value.filter((item) => item.id !== session.id),
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
        ? currentSession.value?.id ?? null
        : null,
    })
  }

  const applySessionDetail = (session: GeneratorPreviewSessionDetail) => {
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
  }

  const loadRecentSessions = async () => {
    try {
      const response = await listGeneratorPreviewSessions()
      recentSessions.value = response.items
    } catch {
      recentSessions.value = []
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
        session.conflictStrategy !== selectedConflictStrategy.value
      ) {
        return false
      }

      applySessionDetail(session)
      return true
    } catch {
      return false
    } finally {
      loading.value = false
    }
  }

  const restoreCachedMatchingSession = () => {
    const cachedSession = selectionSessionCache.get(getCurrentSelectionCacheKey())

    if (!cachedSession) {
      return false
    }

    applySessionDetail(cachedSession)
    return true
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

        if (!isSessionMatchingSelection(session)) {
          return false
        }

        applySessionDetail(session)
        return true
      } finally {
        loading.value = false
      }
    } catch {
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

      applySessionDetail(
        buildSessionDetail(
          response.session,
          response.diff,
          response.report,
          response.sqlProposal,
          response.sqlProposalHandoff,
        ),
      )
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

      if (currentReport.value) {
        applySessionDetail(
          buildSessionDetail(
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
      decision === "approve"
        ? canApprovePreview.value
        : canRejectPreview.value

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

      if (currentReport.value) {
        applySessionDetail(
          buildSessionDetail(
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
      onRecoverableAuthError(error)
      errorMessage.value =
        error instanceof Error ? error.message : "Generator review failed"
    } finally {
      reviewLoading.value = false
    }
  }

  const restorePreviewSession = async (sessionId: string) => {
    if (!sessionId || loading.value || reviewLoading.value || applyLoading.value) {
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
      applySessionDetail(session)
    } catch (error) {
      onRecoverableAuthError(error)
      errorMessage.value =
        error instanceof Error ? error.message : "Generator session restore failed"
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
    [
      selectedSchemaName,
      selectedFrontendTarget,
      selectedConflictStrategy,
    ],
    ([schemaName, frontendTarget, conflictStrategy]) => {
      if (!schemaName) {
        return
      }

      persistGeneratorPreviewSelection({
        conflictStrategy,
        frontendTarget,
        schemaName,
        sessionId: currentSelectionMatchesSession()
          ? currentSession.value?.id ?? null
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
