import { computed, ref, watch } from "vue"

import { shouldSelectGeneratorPreviewFile } from "../../../lib/generator-preview-workspace"
import {
  clearGeneratorPreviewReviewDraft,
  loadGeneratorPreviewReviewDraft,
  persistGeneratorPreviewReviewDraft,
} from "./generator-preview-review-draft"
import {
  getSchemaTemplate,
  listSchemaTemplates,
} from "./generator-preview-schema-templates"
import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewFileCard,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewSchemaOption,
  GeneratorPreviewStep,
  GeneratorPreviewSqlProposalHandoff,
  GeneratorPreviewTranslation,
} from "./types"

export interface GeneratorPreviewWorkspaceMainProps {
  t: GeneratorPreviewTranslation
  loading: boolean
  reviewLoading: boolean
  applyLoading: boolean
  errorMessage: string
  schemaOptions: GeneratorPreviewSchemaOption[]
  conflictStrategyOptions: Array<{ label: string; value: string }>
  selectedInputMode: "registered-schema" | "manual-schema-json"
  selectedConflictStrategy: string
  recentSessionOptions: Array<{ label: string; value: string }>
  selectedRecentSessionId: string
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  currentStep: GeneratorPreviewStep
  manualSchemaDraft: string
  manualSchemaDraftError: string | null
  manualSchemaDraftErrorDetails: string | null
  manualSchemaDraftErrorSuggestion: string | null
  query: string
  files: GeneratorPreviewFileCard[]
  selectedFilePath: string | null
  canApprove: boolean
  canReject: boolean
  canApply: boolean
  canConfirm: boolean
  diffSummary: GeneratorPreviewDiffSummary | null
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff | null
  sessionStatus: "pending_review" | "ready" | "rejected" | "applied" | null
  reviewEvidence: GeneratorPreviewReviewEvidence | null
  applyEvidence: GeneratorPreviewApplyEvidence | null
  hasBlockingConflicts: boolean
}

interface GeneratorDraftSummaryFact {
  label: string
  value: string
}

interface GeneratorOperationProgressMessage {
  description: string
  title: string
}

export type GeneratorPreviewWorkspaceMainEmit = {
  (
    e: "update:selected-input-mode",
    value: "registered-schema" | "manual-schema-json",
  ): void
  (e: "update:selected-schema-name", value: string): void
  (e: "update:selected-conflict-strategy", value: string): void
  (e: "update:selected-frontend-target", value: "vue" | "react"): void
  (e: "update:manual-schema-draft", value: string): void
  (e: "update:query", value: string): void
  (e: "load-current-schema-draft"): void
  (e: "load-template", value: string): void
  (e: "restore-session", value: string): void
  (e: "restore-current-result"): void
  (e: "select-file", value: string): void
  (e: "reset-filters"): void
  (e: "refresh-preview"): void
  (
    e: "review-preview",
    value: { decision: "approve" | "reject"; comment?: string },
  ): void
  (e: "confirm-preview"): void
  (e: "apply-preview"): void
}

type EditableSchemaDraft = Record<string, unknown> & {
  fields?: unknown[]
  label?: string
  name?: string
}

type GeneratorDraftSourceMode = "template" | "reference" | "json"

const frontendOptions = [
  { label: "Vue", value: "vue" },
  { label: "React", value: "react" },
] as const

const schemaTemplates = listSchemaTemplates()

const parseManualSchemaDraft = (raw: string): EditableSchemaDraft | null => {
  if (raw.trim().length === 0) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as EditableSchemaDraft
    }
  } catch {
    return null
  }

  return null
}

export const useGeneratorPreviewWorkspaceMainState = (
  props: GeneratorPreviewWorkspaceMainProps,
  emit: GeneratorPreviewWorkspaceMainEmit,
) => {
  const reviewComment = ref("")
  const draftModuleName = ref("")
  const draftModuleLabel = ref("")
  const isApplyConfirming = ref(false)
  const isRejectConfirming = ref(false)
  const isSchemaEditorExpanded = ref(false)
  const selectedTemplateId = ref<string | null>(null)
  const draftSourceMode = ref<GeneratorDraftSourceMode>("template")
  const referenceSchemaQuery = ref("")
  const fallbackTemplateId = schemaTemplates[0]?.id ?? "simple-crud"

  const resolveCurrentReviewDraftSessionId = () =>
    props.selectedRecentSessionId.trim() || null

  const draftSourceModeOptions = computed(
    () =>
      [
        {
          label: props.t("app.generatorPreview.draftSource.template"),
          value: "template",
        },
        {
          label: props.t("app.generatorPreview.draftSource.reference"),
          value: "reference",
        },
        {
          label: props.t("app.generatorPreview.draftSource.json"),
          value: "json",
        },
      ] as const,
  )

  const showReviewActions = computed(() => props.currentStep === "review")
  const showConfirmAction = computed(() => props.currentStep === "confirm")
  const showApplyAction = computed(() => props.currentStep === "apply")
  const hasCurrentResult = computed(
    () =>
      props.selectedRecentSessionId.trim().length > 0 ||
      props.sessionStatus !== null ||
      props.files.length > 0 ||
      props.reviewEvidence !== null ||
      props.applyEvidence !== null,
  )
  const showFileTools = computed(
    () =>
      props.files.length > 0 &&
      hasCurrentResult.value &&
      !showConfirmAction.value &&
      !showApplyAction.value,
  )
  const showFileList = computed(
    () => hasCurrentResult.value && !showConfirmAction.value && !showApplyAction.value,
  )
  const blockedFiles = computed(() =>
    props.files.filter((file) => file.plannedAction === "block"),
  )
  const blockedFileCount = computed(() => blockedFiles.value.length)
  const firstBlockedFilePath = computed(
    () => blockedFiles.value[0]?.path ?? null,
  )
  const hasRecentSessions = computed(
    () => props.recentSessionOptions.length > 0,
  )
  const showReviewCommentInput = computed(
    () => isRejectConfirming.value || Boolean(props.reviewEvidence?.comment),
  )
  const rejectCommentRequired = computed(
    () => isRejectConfirming.value && reviewComment.value.trim().length === 0,
  )
  const canSubmitReject = computed(
    () => !isRejectConfirming.value || !rejectCommentRequired.value,
  )
  const selectedFrontendTargetLabel = computed(() =>
    props.selectedFrontendTarget === "react" ? "React" : "Vue",
  )
  const currentStatusLabel = computed(() => {
    if (props.sessionStatus === "pending_review") {
      return props.t("app.generatorPreview.status.pendingReview")
    }

    if (props.sessionStatus === "ready") {
      return props.t("app.generatorPreview.status.ready")
    }

    if (props.sessionStatus === "rejected") {
      return props.t("app.generatorPreview.status.rejected")
    }

    if (props.sessionStatus === "applied") {
      return props.t("app.generatorPreview.status.applied")
    }

    return props.t("app.generatorPreview.status.notGenerated")
  })
  const previewArtifactCount = computed(
    () => props.diffSummary?.totalFileCount ?? props.files.length,
  )
  const selectedConflictStrategyLabel = computed(
    () =>
      props.conflictStrategyOptions.find(
        (option) => option.value === props.selectedConflictStrategy,
      )?.label ?? props.selectedConflictStrategy,
  )
  const editableSchemaDraft = computed(() =>
    parseManualSchemaDraft(props.manualSchemaDraft),
  )
  const draftHasContent = computed(
    () => props.manualSchemaDraft.trim().length > 0,
  )
  const canPatchDraftMeta = computed(
    () => !draftHasContent.value || editableSchemaDraft.value !== null,
  )
  const draftFieldCount = computed(() =>
    Array.isArray(editableSchemaDraft.value?.fields)
      ? editableSchemaDraft.value.fields.length
      : 0,
  )
  const showSchemaEditor = computed(
    () => isSchemaEditorExpanded.value || Boolean(props.manualSchemaDraftError),
  )
  const schemaEditorFacts = computed(() => [
    {
      label: props.t("app.generatorPreview.input.moduleNameLabel"),
      value: draftModuleName.value.trim() || "-",
    },
    {
      label: props.t("app.generatorPreview.input.moduleLabelLabel"),
      value: draftModuleLabel.value.trim() || "-",
    },
    {
      label: props.t("app.generatorPreview.input.schemaFieldCountLabel"),
      value: String(draftFieldCount.value),
    },
  ])
  const draftSummaryFacts = computed<GeneratorDraftSummaryFact[]>(() => [
    {
      label: props.t("app.generatorPreview.inputModeLabel"),
      value:
        draftSourceModeOptions.value.find(
          (option) => option.value === draftSourceMode.value,
        )?.label ?? "-",
    },
    {
      label: props.t("app.generatorPreview.input.schemaFieldCountLabel"),
      value: String(draftFieldCount.value),
    },
    {
      label: props.t("app.generatorPreview.filter.frontendLabel"),
      value: selectedFrontendTargetLabel.value,
    },
    {
      label: props.t("app.generatorPreview.filter.conflictLabel"),
      value: selectedConflictStrategyLabel.value || "-",
    },
  ])
  const statusFacts = computed(() => [
    {
      label: props.t("app.generatorPreview.filter.schemaLabel"),
      value: props.selectedSchemaName || draftModuleName.value.trim() || "-",
    },
    {
      label: props.t("app.generatorPreview.meta.frontendTarget"),
      value: selectedFrontendTargetLabel.value,
    },
    {
      label: props.t("app.generatorPreview.meta.status"),
      value: currentStatusLabel.value,
    },
    {
      label: props.t("app.generatorPreview.statsHint"),
      value: String(previewArtifactCount.value),
    },
    {
      label: props.t("app.generatorPreview.filter.conflictLabel"),
      value: selectedConflictStrategyLabel.value || "-",
    },
    {
      label: props.t("app.generatorPreview.meta.targetPreset"),
      value: "staging",
    },
  ])
  const confirmationChecklist = computed(() => {
    if (!showConfirmAction.value && !showApplyAction.value) {
      return []
    }

    const diff = props.diffSummary
    const fileSummary = diff
      ? props.t("app.generatorPreview.checklist.fileActions", {
          block: diff.actionCounts.block,
          changed: diff.changedFileCount,
          create: diff.actionCounts.create,
          overwrite: diff.actionCounts.overwrite,
          skip: diff.actionCounts.skip,
          total: diff.totalFileCount,
        })
      : props.t("app.generatorPreview.checklist.fileActionsMissing")

    const conflictSummary = props.hasBlockingConflicts
      ? props.t("app.generatorPreview.checklist.conflictBlocking")
      : props.t("app.generatorPreview.checklist.conflictClear")

    const sqlProposalSummary = props.sqlProposalHandoff
      ? props.sqlProposalHandoff.proposalStatus === "ready"
        ? props.t("app.generatorPreview.checklist.sqlProposalReady")
        : props.t("app.generatorPreview.checklist.sqlProposalUnsupported")
      : props.t("app.generatorPreview.checklist.sqlProposalMissing")

    return [
      fileSummary,
      conflictSummary,
      props.t("app.generatorPreview.checklist.targetStaging"),
      props.t("app.generatorPreview.checklist.conflictStrategy", {
        value: selectedConflictStrategyLabel.value || "-",
      }),
      sqlProposalSummary,
      props.t("app.generatorPreview.checklist.manualConfirmation"),
    ]
  })
  const currentStateMessage = computed(() => {
    if (props.hasBlockingConflicts) {
      return {
        text: props.t("app.generatorPreview.message.blockingConflicts"),
        tone: "warning",
      } as const
    }

    if (props.currentStep === "apply") {
      return {
        text: props.t("app.generatorPreview.message.confirmedReady"),
        tone: "info",
      } as const
    }

    if (props.sessionStatus === "pending_review") {
      return {
        text: props.t("app.generatorPreview.message.pendingReview"),
        tone: "info",
      } as const
    }

    if (props.sessionStatus === "rejected") {
      return {
        text: props.t("app.generatorPreview.message.rejected"),
        tone: "warning",
      } as const
    }

    return null
  })
  const operationProgressMessage =
    computed<GeneratorOperationProgressMessage | null>(() => {
      if (props.loading) {
        return {
          title: hasCurrentResult.value
            ? props.t("app.generatorPreview.progress.regeneratingTitle")
            : props.t("app.generatorPreview.progress.generatingTitle"),
          description: props.t(
            "app.generatorPreview.progress.generatingDescription",
          ),
        }
      }

      if (props.reviewLoading) {
        return {
          title:
            props.currentStep === "confirm"
              ? props.t("app.generatorPreview.progress.confirmingTitle")
              : props.t("app.generatorPreview.progress.reviewingTitle"),
          description: props.t(
            props.currentStep === "confirm"
              ? "app.generatorPreview.progress.confirmingDescription"
              : "app.generatorPreview.progress.reviewingDescription",
          ),
        }
      }

      if (props.applyLoading) {
        return {
          title: props.t("app.generatorPreview.progress.applyingTitle"),
          description: props.t(
            "app.generatorPreview.progress.applyingDescription",
          ),
        }
      }

      return null
    })
  const resultPrimaryActionLabel = computed(() => {
    if (showReviewActions.value && isRejectConfirming.value) {
      return props.t("app.generatorPreview.action.confirmReject")
    }

    if (showReviewActions.value && props.canApprove) {
      return props.t("app.generatorPreview.action.approve")
    }

    if (showConfirmAction.value && props.canConfirm) {
      return props.t("app.generatorPreview.action.confirmChecklist")
    }

    if (showApplyAction.value) {
      if (props.applyLoading) {
        return props.t("app.generatorPreview.action.applying")
      }

      if (isApplyConfirming.value) {
        return props.t("app.generatorPreview.action.confirmApply")
      }

      return props.t("app.generatorPreview.action.apply")
    }

    return props.t("app.generatorPreview.action.refresh")
  })
  const configPrimaryActionLabel = computed(() =>
    props.loading
      ? hasCurrentResult.value
        ? props.t("app.generatorPreview.action.regeneratingPreview")
        : props.t("app.generatorPreview.action.generatingPreview")
      : hasCurrentResult.value
        ? props.t("app.generatorPreview.action.regeneratePreview")
        : props.t("app.generatorPreview.action.generatePreview"),
  )
  const configErrorRecoverySteps = computed(() => {
    if (props.errorMessage.trim().length === 0) {
      return []
    }

    const steps = new Set<string>()
    const normalizedError = props.errorMessage.toLowerCase()

    if (
      props.manualSchemaDraftError ||
      normalizedError.includes("schema") ||
      normalizedError.includes("json")
    ) {
      steps.add(props.t("app.generatorPreview.errorRecoveryStep.fixSchema"))
    }

    if (
      props.hasBlockingConflicts ||
      normalizedError.includes("conflict") ||
      normalizedError.includes("already exists")
    ) {
      steps.add(
        props.t("app.generatorPreview.errorRecoveryStep.changeConflictStrategy"),
      )
    }

    steps.add(props.t("app.generatorPreview.errorRecoveryStep.retryPreview"))
    steps.add(props.t("app.generatorPreview.errorRecoveryStep.manualReview"))

    return Array.from(steps)
  })
  const resultErrorRecoverySteps = computed(() => {
    if (props.errorMessage.trim().length === 0 || !hasCurrentResult.value) {
      return []
    }

    const steps = new Set<string>()
    const normalizedError = props.errorMessage.toLowerCase()

    if (
      normalizedError.includes("stale") ||
      normalizedError.includes("drift") ||
      normalizedError.includes("apply conflict")
    ) {
      steps.add(props.t("app.generatorPreview.resultRecoveryStep.refreshDrift"))
    }

    if (
      props.hasBlockingConflicts ||
      normalizedError.includes("blocking conflict") ||
      normalizedError.includes("cannot be applied directly")
    ) {
      steps.add(
        props.t("app.generatorPreview.resultRecoveryStep.reviewBlockedFiles"),
      )
    }

    if (
      props.currentStep === "apply" ||
      normalizedError.includes("apply") ||
      normalizedError.includes("confirmation")
    ) {
      steps.add(
        props.t("app.generatorPreview.resultRecoveryStep.recheckChecklist"),
      )
    }

    steps.add(props.t("app.generatorPreview.resultRecoveryStep.restoreSession"))
    steps.add(props.t("app.generatorPreview.resultRecoveryStep.regenerate"))

    return Array.from(steps)
  })
  const conflictStrategyCards = computed(() =>
    props.conflictStrategyOptions.map((option) => ({
      ...option,
      description: props.t(
        `app.generatorPreview.conflictStrategyDescription.${option.value}`,
      ),
    })),
  )
  const frontendOptionCards = computed(() =>
    frontendOptions.map((option) => ({
      ...option,
      description: props.t(
        `app.generatorPreview.frontendTargetDescription.${option.value}`,
      ),
    })),
  )
  const filteredReferenceSchemaOptions = computed(() => {
    const query = referenceSchemaQuery.value.trim().toLowerCase()

    if (query.length === 0) {
      return props.schemaOptions.slice(0, 8)
    }

    return props.schemaOptions
      .filter((option) => {
        const haystack = `${option.label} ${option.value}`.toLowerCase()
        return haystack.includes(query)
      })
      .slice(0, 8)
  })
  const hiddenReferenceSchemaCount = computed(() => {
    const query = referenceSchemaQuery.value.trim().toLowerCase()

    const totalMatches =
      query.length === 0
        ? props.schemaOptions.length
        : props.schemaOptions.filter((option) => {
            const haystack = `${option.label} ${option.value}`.toLowerCase()
            return haystack.includes(query)
          }).length

    return Math.max(
      0,
      totalMatches - filteredReferenceSchemaOptions.value.length,
    )
  })

  const resolveEditableSchemaDraft = (): EditableSchemaDraft | null => {
    if (editableSchemaDraft.value) {
      return { ...editableSchemaDraft.value }
    }

    if (!draftHasContent.value) {
      return parseManualSchemaDraft(getSchemaTemplate(fallbackTemplateId))
    }

    return null
  }

  const patchDraftMeta = (
    patch: Partial<Pick<EditableSchemaDraft, "name" | "label">>,
  ) => {
    const nextDraft = resolveEditableSchemaDraft()

    if (!nextDraft) {
      isSchemaEditorExpanded.value = true
      return
    }

    if (typeof patch.name === "string") {
      nextDraft.name = patch.name
    }

    if (typeof patch.label === "string") {
      nextDraft.label = patch.label
    }

    emit("update:manual-schema-draft", JSON.stringify(nextDraft, null, 2))
  }

  const handleQueryInput = (value: string | number) => {
    const nextValue = String(value)

    if (nextValue === props.query) {
      return
    }

    emit("update:query", nextValue)
  }

  const handleConflictStrategyChange = (
    value: string | number | Array<string | number>,
  ) => {
    if (typeof value === "string" && value !== props.selectedConflictStrategy) {
      emit("update:selected-conflict-strategy", value)
    }
  }

  const handleFrontendChange = (
    value: string | number | Array<string | number>,
  ) => {
    if (
      (value === "vue" || value === "react") &&
      value !== props.selectedFrontendTarget
    ) {
      emit("update:selected-frontend-target", value)
    }
  }

  const handleManualSchemaDraftInput = (value: string | number) => {
    const nextValue = String(value)

    if (nextValue === props.manualSchemaDraft) {
      return
    }

    draftSourceMode.value = "json"
    selectedTemplateId.value = null
    emit("update:manual-schema-draft", nextValue)
  }

  const handleModuleNameInput = (value: string | number) => {
    const nextValue = String(value)
    draftModuleName.value = nextValue
    patchDraftMeta({ name: nextValue.trim() })
  }

  const handleModuleLabelInput = (value: string | number) => {
    const nextValue = String(value)
    draftModuleLabel.value = nextValue
    patchDraftMeta({ label: nextValue.trim() })
  }

  const handleLoadReferenceSchemaDraft = (schemaName: string) => {
    draftSourceMode.value = "reference"
    selectedTemplateId.value = null

    if (schemaName !== props.selectedSchemaName) {
      emit("update:selected-schema-name", schemaName)
    }

    emit("load-current-schema-draft")
  }

  const handleLoadSchemaTemplate = (templateId: string) => {
    draftSourceMode.value = "template"
    selectedTemplateId.value = templateId
    emit("update:selected-input-mode", "manual-schema-json")
    emit("load-template", templateId)
  }

  const handleDraftSourceModeChange = (mode: GeneratorDraftSourceMode) => {
    if (draftSourceMode.value === mode) {
      return
    }

    draftSourceMode.value = mode

    if (mode === "json") {
      isSchemaEditorExpanded.value = true
      selectedTemplateId.value = null
      emit("update:selected-input-mode", "manual-schema-json")
      return
    }

    isSchemaEditorExpanded.value = false
  }

  const handleReferenceSchemaQueryInput = (value: string | number) => {
    referenceSchemaQuery.value = String(value)
  }

  const handleRecentSessionChange = (
    value: string | number | Array<string | number>,
  ) => {
    if (
      typeof value === "string" &&
      value.length > 0 &&
      value !== props.selectedRecentSessionId
    ) {
      isApplyConfirming.value = false
      isRejectConfirming.value = false
      emit("restore-session", value)
    }
  }

  const handleRestoreCurrentResult = () => {
    if (
      props.loading ||
      props.reviewLoading ||
      props.applyLoading ||
      props.selectedRecentSessionId.trim().length === 0
    ) {
      return
    }

    isApplyConfirming.value = false
    isRejectConfirming.value = false
    emit("restore-current-result")
  }

  const handleRefreshPreview = () => {
    isApplyConfirming.value = false
    isRejectConfirming.value = false
    emit("refresh-preview")
  }

  const handleReviewCommentInput = (value: string | number) => {
    reviewComment.value = String(value)

    const sessionId = resolveCurrentReviewDraftSessionId()

    if (!sessionId || props.sessionStatus !== "pending_review") {
      return
    }

    persistGeneratorPreviewReviewDraft(sessionId, reviewComment.value)
  }

  const handleReviewPreview = (decision: "approve" | "reject") => {
    const canReview =
      decision === "approve" ? props.canApprove : props.canReject

    if (
      !canReview ||
      props.loading ||
      props.reviewLoading ||
      props.applyLoading
    ) {
      return
    }

    if (decision === "approve" && isRejectConfirming.value) {
      return
    }

    if (decision === "reject" && !isRejectConfirming.value) {
      isApplyConfirming.value = false
      isRejectConfirming.value = true
      return
    }

    if (decision === "reject" && rejectCommentRequired.value) {
      return
    }

    emit("review-preview", {
      comment: reviewComment.value,
      decision,
    })
  }

  const handleApplyPreview = () => {
    if (
      !props.canApply ||
      props.loading ||
      props.reviewLoading ||
      props.applyLoading
    ) {
      return
    }

    if (!isApplyConfirming.value) {
      isRejectConfirming.value = false
      isApplyConfirming.value = true
      return
    }

    emit("apply-preview")
  }

  const handleConfirmPreview = () => {
    if (
      !props.canConfirm ||
      props.loading ||
      props.reviewLoading ||
      props.applyLoading
    ) {
      return
    }

    emit("confirm-preview")
  }

  const handleSchemaEditorToggle = () => {
    isSchemaEditorExpanded.value = !isSchemaEditorExpanded.value

    if (isSchemaEditorExpanded.value) {
      draftSourceMode.value = "json"
      emit("update:selected-input-mode", "manual-schema-json")
    }
  }

  const cancelApplyConfirmation = () => {
    isApplyConfirming.value = false
  }

  const cancelRejectConfirmation = () => {
    isRejectConfirming.value = false
  }

  const handleFileSelection = (path: string) => {
    if (!shouldSelectGeneratorPreviewFile(props.selectedFilePath, path)) {
      return
    }

    emit("select-file", path)
  }

  watch(
    [() => props.manualSchemaDraft, editableSchemaDraft],
    ([draft, parsedDraft]) => {
      if (parsedDraft) {
        draftModuleName.value =
          typeof parsedDraft.name === "string" ? parsedDraft.name : ""
        draftModuleLabel.value =
          typeof parsedDraft.label === "string" ? parsedDraft.label : ""
        return
      }

      if (String(draft).trim().length === 0) {
        draftModuleName.value = ""
        draftModuleLabel.value = ""
      }
    },
    { immediate: true },
  )

  watch(
    () => props.manualSchemaDraftError,
    (error) => {
      if (error) {
        isSchemaEditorExpanded.value = true
        draftSourceMode.value = "json"
      }
    },
    { immediate: true },
  )

  watch(
    () => [props.selectedRecentSessionId, props.selectedInputMode] as const,
    ([sessionId, inputMode]) => {
      if (sessionId.trim().length === 0) {
        return
      }

      if (inputMode === "registered-schema") {
        draftSourceMode.value = "reference"
        return
      }

      if (selectedTemplateId.value) {
        draftSourceMode.value = "template"
        return
      }

      draftSourceMode.value = "template"
    },
    { immediate: true },
  )

  watch(
    () => [
      props.sessionStatus,
      props.canApply,
      props.canReject,
      props.loading,
      props.applyLoading,
      props.reviewLoading,
      props.selectedRecentSessionId,
      props.selectedSchemaName,
      props.selectedConflictStrategy,
      props.selectedFrontendTarget,
      props.reviewEvidence?.comment ?? null,
    ],
    ([
      status,
      canApply,
      canReject,
      loading,
      applyLoading,
      reviewLoading,
      sessionId,
    ]) => {
      const resolvedSessionId =
        typeof sessionId === "string" && sessionId.trim().length > 0
          ? sessionId.trim()
          : null

      if (!canApply || loading || applyLoading || status !== "ready") {
        isApplyConfirming.value = false
      }

      if (
        !canReject ||
        loading ||
        reviewLoading ||
        status !== "pending_review"
      ) {
        isRejectConfirming.value = false
      }

      if (status === "pending_review") {
        reviewComment.value = resolvedSessionId
          ? (loadGeneratorPreviewReviewDraft(resolvedSessionId) ??
            props.reviewEvidence?.comment ??
            "")
          : (props.reviewEvidence?.comment ?? "")
        return
      }

      if (resolvedSessionId) {
        clearGeneratorPreviewReviewDraft(resolvedSessionId)
      }

      reviewComment.value = props.reviewEvidence?.comment ?? ""
    },
    { immediate: true },
  )

  return {
    canPatchDraftMeta,
    canSubmitReject,
    confirmationChecklist,
    cancelApplyConfirmation,
    cancelRejectConfirmation,
    blockedFileCount,
    configPrimaryActionLabel,
    configErrorRecoverySteps,
    conflictStrategyCards,
    currentStateMessage,
    draftModuleLabel,
    draftModuleName,
    draftSourceMode,
    draftSourceModeOptions,
    draftSummaryFacts,
    filteredReferenceSchemaOptions,
    frontendOptionCards,
    firstBlockedFilePath,
    handleApplyPreview,
    handleConflictStrategyChange,
    handleDraftSourceModeChange,
    handleFileSelection,
    handleFrontendChange,
    handleLoadReferenceSchemaDraft,
    handleLoadSchemaTemplate,
    handleManualSchemaDraftInput,
    handleModuleLabelInput,
    handleModuleNameInput,
    handleQueryInput,
    handleRecentSessionChange,
    handleReferenceSchemaQueryInput,
    handleRefreshPreview,
    handleRestoreCurrentResult,
    handleReviewCommentInput,
    handleReviewPreview,
    handleSchemaEditorToggle,
    handleConfirmPreview,
    hasCurrentResult,
    hasRecentSessions,
    hiddenReferenceSchemaCount,
    isApplyConfirming,
    isRejectConfirming,
    operationProgressMessage,
    referenceSchemaQuery,
    rejectCommentRequired,
    resultErrorRecoverySteps,
    resultPrimaryActionLabel,
    reviewComment,
    schemaEditorFacts,
    schemaTemplates,
    selectedTemplateId,
    showApplyAction,
    showConfirmAction,
    showFileList,
    showFileTools,
    showReviewActions,
    showReviewCommentInput,
    showSchemaEditor,
    statusFacts,
  }
}
