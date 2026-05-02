import { type Ref, computed, ref, watch } from "vue"

import {
  type FrontendTarget,
  getRegisteredSchema,
  listRegisteredSchemas,
} from "../lib/generator-preview-browser"
import {
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

export const useGeneratorPreviewWorkspace = (
  t: (key: string, params?: Record<string, unknown>) => string,
  enabled: Readonly<Ref<boolean>>,
  onRecoverableAuthError: (error: unknown) => void,
) => {
  const availableSchemas = listRegisteredSchemas()
  const availableSchemaNames = availableSchemas.map((schema) => schema.name)
  const selectedSchemaName = ref(availableSchemaNames[0] ?? "")
  const selectedFrontendTarget = ref<FrontendTarget>("vue")
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

  const recentSessionOptions = computed(() =>
    recentSessions.value.slice(0, 8).map((session) => ({
      label: `${session.schemaName} · ${session.frontendTarget} · ${localizeSessionStatus(session.status)} · ${session.createdAt}`,
      value: session.id,
    })),
  )

  const filterSummary = computed(() => {
    const fragments = [
      t("app.generatorPreview.filter.schemaSummary", {
        value: selectedSchema.value?.name ?? "-",
      }),
      t("app.generatorPreview.filter.frontendSummary", {
        value: selectedFrontendTarget.value,
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
      !loading.value &&
      !applyLoading.value,
  )

  const canApprovePreview = computed(
    () =>
      currentSession.value !== null &&
      currentSession.value.status === "pending_review" &&
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

  const canPreservePreviewState = () =>
    currentSession.value?.schemaName === selectedSchemaName.value &&
    currentSession.value?.frontendTarget === selectedFrontendTarget.value &&
    currentReport.value?.schemaName === selectedSchemaName.value &&
    currentReport.value?.frontendTarget === selectedFrontendTarget.value

  const applySessionDetail = (session: GeneratorPreviewSessionDetail) => {
    selectedSchemaName.value = session.schemaName
    selectedFrontendTarget.value = session.frontendTarget
    currentSession.value = session
    currentDiffSummary.value = session.diffSummary
    currentReport.value = session.report
    currentSqlProposal.value = session.sqlProposal
    currentSqlProposalHandoff.value = session.sqlProposalHandoff
    selectedRecentSessionId.value = session.id
  }

  const loadRecentSessions = async () => {
    try {
      const response = await listGeneratorPreviewSessions()
      recentSessions.value = response.items
    } catch {
      recentSessions.value = []
    }
  }

  const refreshPreview = async () => {
    if (
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
        schemaName: selectedSchemaName.value,
        frontendTarget: selectedFrontendTarget.value,
        targetPreset: "staging",
      })

      if (requestId !== latestPreviewRequestId) {
        return
      }

      currentSession.value = response.session
      currentDiffSummary.value = response.diff
      currentReport.value = response.report
      currentSqlProposal.value = response.sqlProposal
      currentSqlProposalHandoff.value = response.sqlProposalHandoff
      selectedRecentSessionId.value = response.session.id
      void loadRecentSessions()
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
      currentSession.value = response.session
      currentDiffSummary.value = response.diff
      currentSqlProposal.value = response.sqlProposal
      currentSqlProposalHandoff.value = response.sqlProposalHandoff
      selectedRecentSessionId.value = response.session.id
      void loadRecentSessions()
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
      currentSession.value = response.session
      currentDiffSummary.value = response.diff
      currentSqlProposal.value = response.sqlProposal
      currentSqlProposalHandoff.value = response.sqlProposalHandoff
      selectedRecentSessionId.value = response.session.id
      void loadRecentSessions()
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

    loading.value = true
    errorMessage.value = ""

    try {
      const session = await fetchGeneratorPreviewSession(sessionId)
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

  watch(selectedSchemaName, () => {
    resetFilters()
  })

  watch(
    [selectedSchemaName, selectedFrontendTarget, enabled],
    ([, , nextEnabled]) => {
      if (!nextEnabled) {
        return
      }

      void loadRecentSessions()
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
