import { type Ref, computed, ref, watch } from "vue"

import {
  type FrontendTarget,
  expandSimplifiedSchema,
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
  createGeneratorPreviewSession,
  fetchGeneratorPreviewSession,
} from "../lib/platform-api"

import { getSchemaTemplate } from "../components/workspaces/generator/generator-preview-schema-templates"
import type { GeneratorPreviewStep } from "../components/workspaces/generator/types"
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
import { createGeneratorPreviewSessionActions } from "./generator-preview-session-actions"
import {
  buildGeneratorPreviewSessionDetail,
  generatorPreviewErrorCodes,
  isGeneratorPreviewErrorCode,
  isGeneratorPreviewRecoverableAuthError,
  isGeneratorPreviewSessionDetailConsistent,
} from "./generator-preview-session-helpers"
import {
  buildGeneratorPreviewConflictStrategyOptions,
  buildGeneratorPreviewRecentSessionOptions,
  prioritizeGeneratorPreviewRecentSessions,
} from "./generator-preview-session-presentation"
import { createGeneratorPreviewSessionRestore } from "./generator-preview-session-restore"

export const useGeneratorPreviewWorkspace = (
  t: (key: string, params?: Record<string, unknown>) => string,
  enabled: Readonly<Ref<boolean>>,
  onRecoverableAuthError: (error: unknown) => void,
) => {
  type GeneratorPreviewInputMode = "registered-schema" | "manual-schema-json"
  type GeneratorPreviewSchema = NonNullable<
    ReturnType<typeof getRegisteredSchema>
  >

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
  const selectedInputMode = ref<GeneratorPreviewInputMode>("manual-schema-json")
  const manualSchemaDraft = ref("")
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

  const inputModeOptions = computed(() => [
    {
      label: t("app.generatorPreview.inputMode.registeredSchema"),
      value: "registered-schema",
    },
    {
      label: t("app.generatorPreview.inputMode.manualSchemaJson"),
      value: "manual-schema-json",
    },
  ])

  const selectedSchema = computed(() =>
    selectedSchemaName.value
      ? getRegisteredSchema(selectedSchemaName.value)
      : null,
  )

  const resolveSchemaValidationSummaryLine = (details: string) => {
    const issueLine = details
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .find((line) => line.startsWith("- "))

    return issueLine ? issueLine.slice(2) : details.split(/\r?\n/u)[0]?.trim()
  }

  const resolveSchemaValidationSuggestion = (details: string) => {
    if (
      details.includes(
        "Enum field must provide non-empty options or dictionaryTypeCode.",
      )
    ) {
      return t("app.generatorPreview.input.manualSchemaDraftSuggestionEnum")
    }

    if (details.includes('must contain exactly one "id" field')) {
      return t("app.generatorPreview.input.manualSchemaDraftSuggestionId")
    }

    if (details.includes("Field kind must be one of:")) {
      return t("app.generatorPreview.input.manualSchemaDraftSuggestionKind")
    }

    return null
  }

  const manualSchemaDraftParsed = computed(() => {
    const raw = manualSchemaDraft.value.trim()

    if (raw.length === 0) {
      return {
        error: null as string | null,
        errorDetails: null as string | null,
        schema: null as GeneratorPreviewSchema | null,
      }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return {
        error: t("app.generatorPreview.input.manualSchemaDraftInvalidJson"),
        errorDetails: null as string | null,
        schema: null as GeneratorPreviewSchema | null,
      }
    }

    try {
      return {
        error: null as string | null,
        errorDetails: null as string | null,
        errorSuggestion: null as string | null,
        schema: expandSimplifiedSchema(parsed),
      }
    } catch (error) {
      const details =
        error instanceof Error ? error.message : "Schema validation failed."
      const summaryLine = resolveSchemaValidationSummaryLine(details) || details

      return {
        error: t("app.generatorPreview.input.manualSchemaDraftInvalid", {
          value: summaryLine,
        }),
        errorDetails: details,
        errorSuggestion: resolveSchemaValidationSuggestion(details),
        schema: null as GeneratorPreviewSchema | null,
      }
    }
  })

  const manualSchemaDraftError = computed(() =>
    selectedInputMode.value === "manual-schema-json"
      ? manualSchemaDraftParsed.value.error
      : null,
  )

  const manualSchemaDraftErrorDetails = computed(() =>
    selectedInputMode.value === "manual-schema-json"
      ? manualSchemaDraftParsed.value.errorDetails
      : null,
  )

  const manualSchemaDraftErrorSuggestion = computed(() =>
    selectedInputMode.value === "manual-schema-json"
      ? manualSchemaDraftParsed.value.errorSuggestion
      : null,
  )

  const loadSelectedSchemaDraft = () => {
    if (!selectedSchema.value) {
      return
    }

    manualSchemaDraft.value = JSON.stringify(selectedSchema.value, null, 2)
    selectedSchemaName.value = selectedSchema.value.name
    selectedInputMode.value = "manual-schema-json"
  }

  const loadSchemaTemplate = (templateId: string) => {
    manualSchemaDraft.value = getSchemaTemplate(templateId)
    selectedInputMode.value = "manual-schema-json"
  }

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

  const isSessionMatchingSelection = (session: GeneratorPreviewSessionRecord) =>
    session.schemaName === selectedSchemaName.value &&
    session.frontendTarget === selectedFrontendTarget.value &&
    session.conflictStrategy === selectedConflictStrategy.value &&
    session.sourceType === selectedInputMode.value

  const recentSessionOptions = computed(() =>
    buildGeneratorPreviewRecentSessionOptions(
      t,
      recentSessions.value,
      isSessionMatchingSelection,
    ),
  )

  const conflictStrategyOptions = computed(() =>
    buildGeneratorPreviewConflictStrategyOptions(t),
  )

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

  const currentStep = computed<GeneratorPreviewStep>(() => {
    const session = currentSession.value

    if (!session) {
      return "configure"
    }

    if (session.status === "pending_review" || session.status === "rejected") {
      return "review"
    }

    if (session.status === "applied") {
      return "done"
    }

    if (session.confirmedAt !== null) {
      return "apply"
    }

    if (currentSqlProposalHandoff.value?.proposalStatus === "ready") {
      return "confirm"
    }

    return "review"
  })

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
    currentSession.value?.sourceType === selectedInputMode.value &&
    currentReport.value?.schemaName === selectedSchemaName.value &&
    currentReport.value?.frontendTarget === selectedFrontendTarget.value

  const canPreservePreviewState = () =>
    currentSession.value?.schemaName === selectedSchemaName.value &&
    currentSession.value?.frontendTarget === selectedFrontendTarget.value &&
    currentSession.value?.conflictStrategy === selectedConflictStrategy.value &&
    currentSession.value?.sourceType === selectedInputMode.value &&
    currentReport.value?.schemaName === selectedSchemaName.value &&
    currentReport.value?.frontendTarget === selectedFrontendTarget.value &&
    currentReport.value?.conflictStrategy === selectedConflictStrategy.value

  const findMatchingRecentSession = (
    sessions: GeneratorPreviewSessionRecord[],
  ) =>
    prioritizeGeneratorPreviewRecentSessions(
      sessions,
      isSessionMatchingSelection,
    ).find(isSessionMatchingSelection) ?? null

  const getCurrentSelectionCacheKey = () =>
    createGeneratorPreviewSelectionCacheKey(
      selectedSchemaName.value,
      selectedFrontendTarget.value,
      selectedConflictStrategy.value,
      selectedInputMode.value,
    )

  const cacheSessionDetail = (session: GeneratorPreviewSessionDetail) => {
    sessionDetailCache.set(session.id, session)
    selectionSessionCache.set(
      createGeneratorPreviewSelectionCacheKey(
        session.schemaName,
        session.frontendTarget,
        session.conflictStrategy,
        session.sourceType,
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
      inputMode: selectedInputMode.value,
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
    if (session.sourceType === "manual-schema-json") {
      selectedInputMode.value = session.sourceType
    }
    currentSession.value = session
    currentDiffSummary.value = session.diffSummary
    currentReport.value = session.report
    currentSqlProposal.value = session.sqlProposal
    currentSqlProposalHandoff.value = session.sqlProposalHandoff
    selectedRecentSessionId.value = session.id
    persistCurrentSelection()
    return true
  }

  const { refreshSessionDetailAfterStateDrift, restoreLatestMatchingSession } =
    createGeneratorPreviewSessionRestore({
      applySessionDetail,
      findMatchingRecentSession,
      getCurrentSelectionCacheKey,
      isSessionMatchingSelection,
      loading,
      onRecoverableAuthError,
      prioritizeRecentSessions: (sessions) =>
        prioritizeGeneratorPreviewRecentSessions(
          sessions,
          isSessionMatchingSelection,
        ),
      recentSessions,
      resetPreviewState,
      selectedConflictStrategy,
      selectedFrontendTarget,
      selectedInputMode,
      selectedSchemaName,
      selectionSessionCache,
      sessionDetailCache,
      setErrorMessage: (message) => {
        errorMessage.value = message
      },
      storedSessionId: storedSelection?.sessionId,
    })

  const refreshPreview = async (options?: {
    ignoreApplyLoading?: boolean
  }) => {
    if (
      loading.value ||
      (!options?.ignoreApplyLoading && applyLoading.value) ||
      reviewLoading.value ||
      !enabled.value ||
      (selectedInputMode.value !== "manual-schema-json" &&
        !selectedSchemaName.value)
    ) {
      return false
    }

    const requestId = latestPreviewRequestId + 1
    latestPreviewRequestId = requestId
    loading.value = true
    errorMessage.value = ""

    try {
      const sourceType = selectedInputMode.value
      const schemaName =
        sourceType === "manual-schema-json"
          ? (manualSchemaDraftParsed.value.schema?.name ??
            selectedSchemaName.value)
          : selectedSchemaName.value
      const sourceValue =
        sourceType === "manual-schema-json"
          ? manualSchemaDraft.value.trim()
          : selectedSchemaName.value

      if (sourceType === "manual-schema-json") {
        if (manualSchemaDraftParsed.value.error) {
          errorMessage.value = manualSchemaDraftParsed.value.error
          return false
        }

        if (!manualSchemaDraftParsed.value.schema) {
          errorMessage.value = t(
            "app.generatorPreview.input.manualSchemaDraftEmpty",
          )
          return false
        }
      }

      const response = await createGeneratorPreviewSession({
        conflictStrategy: selectedConflictStrategy.value,
        schemaName,
        frontendTarget: selectedFrontendTarget.value,
        sourceType,
        sourceValue,
        targetPreset: "staging",
      })

      if (requestId !== latestPreviewRequestId) {
        return false
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
        return false
      }

      return true
    } catch (error) {
      if (requestId !== latestPreviewRequestId) {
        return false
      }

      if (
        isGeneratorPreviewErrorCode(
          error,
          generatorPreviewErrorCodes.GENERATOR_SCHEMA_NOT_FOUND,
        )
      ) {
        resetPreviewState()
      } else if (!canPreservePreviewState()) {
        resetPreviewState()
      }
      if (isGeneratorPreviewRecoverableAuthError(error)) {
        onRecoverableAuthError(error)
      }
      errorMessage.value =
        error instanceof Error ? error.message : "Generator preview failed"
      return false
    } finally {
      if (requestId === latestPreviewRequestId) {
        loading.value = false
      }
    }
  }

  const { applyPreview, confirmPreview, reviewPreview } =
    createGeneratorPreviewSessionActions({
      applyLoading,
      applySessionDetail,
      canApplyPreview,
      canApprovePreview,
      canConfirmPreview,
      canRejectPreview,
      currentDiffSummary,
      currentReport,
      currentSession,
      currentSqlProposal,
      currentSqlProposalHandoff,
      onRecoverableAuthError,
      persistCurrentSelection,
      refreshPreviewAfterApplyStale: () =>
        refreshPreview({ ignoreApplyLoading: true }),
      refreshSessionDetailAfterStateDrift,
      reviewLoading,
      selectedRecentSessionId,
      setErrorMessage: (message) => {
        errorMessage.value = message
      },
      upsertRecentSession,
    })

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
      if (
        isGeneratorPreviewErrorCode(
          error,
          generatorPreviewErrorCodes.GENERATOR_SESSION_NOT_FOUND,
        )
      ) {
        resetPreviewState()
      }

      if (isGeneratorPreviewRecoverableAuthError(error)) {
        onRecoverableAuthError(error)
      }
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
    [
      selectedSchemaName,
      selectedFrontendTarget,
      selectedConflictStrategy,
      selectedInputMode,
    ],
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
      selectedInputMode,
    ],
    ([schemaName, frontendTarget, conflictStrategy, inputMode]) => {
      if (!schemaName) {
        return
      }

      persistGeneratorPreviewSelection({
        conflictStrategy,
        inputMode,
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
      selectedInputMode,
      enabled,
    ],
    async ([, , , nextInputMode, nextEnabled]) => {
      if (!nextEnabled) {
        return
      }

      if (currentSelectionMatchesSession()) {
        return
      }

      if (await restoreLatestMatchingSession()) {
        return
      }

      await refreshPreview()
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
    currentStep,
    currentDiffSummary,
    currentSession,
    currentSqlProposal,
    currentSqlProposalHandoff,
    conflictStrategyOptions,
    errorMessage,
    filteredPreviewFiles,
    inputModeOptions,
    loading,
    manualSchemaDraft,
    manualSchemaDraftError,
    manualSchemaDraftErrorDetails,
    manualSchemaDraftErrorSuggestion,
    loadSchemaTemplate,
    loadSelectedSchemaDraft,
    previewQuery,
    recentSessionOptions,
    refreshPreview,
    resetFilters,
    resetPreviewState,
    restorePreviewSession,
    confirmPreview,
    reviewLoading,
    reviewPreview,
    schemaOptions,
    selectedRecentSessionId,
    selectedConflictStrategy,
    selectedFilePath,
    selectedFrontendTarget,
    selectedInputMode,
    selectedPreviewFile,
    selectedSchema,
    selectedSchemaName,
    sqlProposal: currentSqlProposal,
    sqlProposalHandoff: currentSqlProposalHandoff,
    sqlPreview,
  }
}
