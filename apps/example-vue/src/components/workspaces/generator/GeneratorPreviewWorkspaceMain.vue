<script setup lang="ts">
import { computed, ref, watch } from "vue"

import { Input as TInput } from "tdesign-vue-next/es/input"
import { Select as TSelect } from "tdesign-vue-next/es/select"
import { Textarea as TTextarea } from "tdesign-vue-next/es/textarea"

import { shouldSelectGeneratorPreviewFile } from "../../../lib/generator-preview-workspace"
import GeneratorPreviewWorkspaceFileList from "./GeneratorPreviewWorkspaceFileList.vue"
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
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceMainProps {
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
  query: string
  files: GeneratorPreviewFileCard[]
  selectedFilePath: string | null
  canApprove: boolean
  canReject: boolean
  canApply: boolean
  canConfirm: boolean
  diffSummary: GeneratorPreviewDiffSummary | null
  sessionStatus: "pending_review" | "ready" | "rejected" | "applied" | null
  reviewEvidence: GeneratorPreviewReviewEvidence | null
  applyEvidence: GeneratorPreviewApplyEvidence | null
  hasBlockingConflicts: boolean
}

type EditableSchemaDraft = Record<string, unknown> & {
  fields?: unknown[]
  label?: string
  name?: string
}

type GeneratorDraftSourceMode = "template" | "reference" | "json"

const props = defineProps<GeneratorPreviewWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "update:selected-input-mode", value: "registered-schema" | "manual-schema-json"): void
  (e: "update:selected-schema-name", value: string): void
  (e: "update:selected-conflict-strategy", value: string): void
  (e: "update:selected-frontend-target", value: "vue" | "react"): void
  (e: "update:manual-schema-draft", value: string): void
  (e: "update:query", value: string): void
  (e: "load-current-schema-draft"): void
  (e: "load-template", value: string): void
  (e: "restore-session", value: string): void
  (e: "select-file", value: string): void
  (e: "reset-filters"): void
  (e: "refresh-preview"): void
  (
    e: "review-preview",
    value: { decision: "approve" | "reject"; comment?: string },
  ): void
  (e: "confirm-preview"): void
  (e: "apply-preview"): void
}>()

const reviewComment = ref("")
const draftModuleName = ref("")
const draftModuleLabel = ref("")
const isApplyConfirming = ref(false)
const isRejectConfirming = ref(false)
const isSchemaEditorExpanded = ref(false)
const selectedTemplateId = ref<string | null>(null)
const draftSourceMode = ref<GeneratorDraftSourceMode>("template")
const referenceSchemaQuery = ref("")
const resolveCurrentReviewDraftSessionId = () =>
  props.selectedRecentSessionId.trim() || null

const frontendOptions = [
  { label: "Vue", value: "vue" },
  { label: "React", value: "react" },
] as const
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
const schemaTemplates = listSchemaTemplates()
const fallbackTemplateId = schemaTemplates[0]?.id ?? "simple-crud"

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
  () => props.files.length > 0 && hasCurrentResult.value,
)
const showFileList = computed(() => hasCurrentResult.value)
const showConfigError = computed(() => props.errorMessage.trim().length > 0)
const hasRecentSessions = computed(() => props.recentSessionOptions.length > 0)
const showReviewCommentInput = computed(
  () => isRejectConfirming.value || Boolean(props.reviewEvidence?.comment),
)
const hasManualSchemaDraftErrorDetails = computed(() =>
  Boolean(props.manualSchemaDraftErrorDetails?.trim()),
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
const editableSchemaDraft = computed(() =>
  parseManualSchemaDraft(props.manualSchemaDraft),
)
const draftHasContent = computed(() => props.manualSchemaDraft.trim().length > 0)
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
])
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

  return Math.max(0, totalMatches - filteredReferenceSchemaOptions.value.length)
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

const patchDraftMeta = (patch: Partial<Pick<EditableSchemaDraft, "name" | "label">>) => {
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
  const canReview = decision === "approve" ? props.canApprove : props.canReject

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

    draftSourceMode.value = "json"
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

    if (!canReject || loading || reviewLoading || status !== "pending_review") {
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
</script>

<template>
  <section class="generator-block generator-config-block">
        <div class="generator-panel-head">
          <h3 class="generator-panel-title">
            {{ t("app.generatorPreview.inputTitle") }}
          </h3>
        </div>

        <div class="generator-config-grid">
          <label class="generator-config-field">
            <span class="generator-config-label">
              {{ t("app.generatorPreview.input.moduleNameLabel") }}
            </span>
            <TInput
              :model-value="draftModuleName"
              :disabled="
                loading ||
                reviewLoading ||
                applyLoading ||
                !canPatchDraftMeta
              "
              :placeholder="t('app.generatorPreview.input.moduleNamePlaceholder')"
              @update:model-value="handleModuleNameInput"
            />
          </label>

          <label class="generator-config-field">
            <span class="generator-config-label">
              {{ t("app.generatorPreview.input.moduleLabelLabel") }}
            </span>
            <TInput
              :model-value="draftModuleLabel"
              :disabled="
                loading ||
                reviewLoading ||
                applyLoading ||
                !canPatchDraftMeta
              "
              :placeholder="t('app.generatorPreview.input.moduleLabelPlaceholder')"
              @update:model-value="handleModuleLabelInput"
            />
          </label>
        </div>

        <div class="generator-option-matrix">
          <div class="generator-option-row">
            <div class="generator-option-label">
              <h4 class="generator-group-title">
                {{ t("app.generatorPreview.inputModeLabel") }}
              </h4>
            </div>
            <div class="generator-option-values generator-option-values-mode">
              <button
                v-for="option in draftSourceModeOptions"
                :key="option.value"
                type="button"
                class="generator-option-item generator-option-mode"
                :class="
                  draftSourceMode === option.value
                    ? 'generator-option-item-active'
                    : ''
                "
                :disabled="loading || reviewLoading || applyLoading"
                @click="handleDraftSourceModeChange(option.value)"
              >
                <strong>{{ option.label }}</strong>
              </button>
            </div>
          </div>

          <div
            v-if="draftSourceMode === 'template'"
            class="generator-option-row"
          >
            <div class="generator-option-label">
              <h4 class="generator-group-title">
                {{ t("app.generatorPreview.input.templateLabel") }}
              </h4>
            </div>
            <div class="generator-option-values generator-option-values-templates">
              <button
                v-for="template in schemaTemplates"
                :key="template.id"
                type="button"
                class="generator-option-item generator-option-item-detail"
                :class="
                  selectedTemplateId === template.id
                    ? 'generator-option-item-active'
                    : ''
                "
                :disabled="loading || reviewLoading || applyLoading"
                @click="handleLoadSchemaTemplate(template.id)"
              >
                <strong>{{ template.label }}</strong>
                <span>{{ template.description }}</span>
              </button>
            </div>
          </div>

          <div
            v-else-if="draftSourceMode === 'reference'"
            class="generator-option-row"
          >
            <div class="generator-option-label">
              <h4 class="generator-group-title">
                {{ t("app.generatorPreview.inputTemplateLabel") }}
              </h4>
            </div>
            <div class="generator-reference-picker">
              <TInput
                :model-value="referenceSchemaQuery"
                clearable
                :placeholder="
                  t('app.generatorPreview.referenceSearchPlaceholder')
                "
                @update:model-value="handleReferenceSchemaQueryInput"
              />
              <div class="generator-option-values generator-option-values-reference">
                <button
                  v-for="option in filteredReferenceSchemaOptions"
                  :key="option.value"
                  type="button"
                  class="generator-option-item generator-option-chip"
                  :class="
                    props.selectedSchemaName === option.value
                      ? 'generator-option-item-active'
                      : ''
                  "
                  :disabled="loading || reviewLoading || applyLoading"
                  @click="handleLoadReferenceSchemaDraft(option.value)"
                >
                  <strong>{{ option.label }}</strong>
                  <span>{{ option.value }}</span>
                </button>
              </div>
              <div
                v-if="filteredReferenceSchemaOptions.length === 0"
                class="generator-option-empty"
              >
                {{ t("app.generatorPreview.referenceSearchEmpty") }}
              </div>
              <div
                v-else-if="hiddenReferenceSchemaCount > 0"
                class="generator-option-meta"
              >
                {{
                  t("app.generatorPreview.referenceSearchMore", {
                    count: hiddenReferenceSchemaCount,
                  })
                }}
              </div>
            </div>
          </div>

          <div class="generator-option-row">
            <div class="generator-option-label">
              <h4 class="generator-group-title">
                {{ t("app.generatorPreview.filter.frontendLabel") }}
              </h4>
            </div>
            <div class="generator-option-values generator-option-values-inline">
              <button
                v-for="option in frontendOptionCards"
                :key="option.value"
                type="button"
                class="generator-option-item generator-option-item-inline"
                :class="
                  selectedFrontendTarget === option.value
                    ? 'generator-option-item-active'
                    : ''
                "
                :disabled="loading || reviewLoading || applyLoading"
                @click="handleFrontendChange(option.value)"
              >
                <strong>{{ option.label }}</strong>
                <span>{{ option.description }}</span>
              </button>
            </div>
          </div>

          <div class="generator-option-row">
            <div class="generator-option-label">
              <h4 class="generator-group-title">
                {{ t("app.generatorPreview.filter.conflictLabel") }}
              </h4>
            </div>
            <div class="generator-option-values generator-option-values-inline">
              <button
                v-for="option in conflictStrategyCards"
                :key="option.value"
                type="button"
                class="generator-option-item generator-option-item-inline"
                :class="
                  selectedConflictStrategy === option.value
                    ? 'generator-option-item-active'
                    : ''
                "
                :disabled="loading || reviewLoading || applyLoading"
                @click="handleConflictStrategyChange(option.value)"
              >
                <strong>{{ option.label }}</strong>
                <span>{{ option.description }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="generator-toolbar-actions">
          <button
            type="button"
            class="enterprise-button"
            :disabled="loading || reviewLoading || applyLoading"
            @click="handleRefreshPreview"
          >
            {{ configPrimaryActionLabel }}
          </button>
        </div>

        <section class="generator-group generator-schema-group">
          <div class="generator-panel-head">
            <h4 class="generator-group-title">
              {{ t("app.generatorPreview.input.manualSchemaDraftLabel") }}
            </h4>
            <button
              type="button"
              class="enterprise-button enterprise-button-ghost"
              @click="handleSchemaEditorToggle"
            >
              {{
                showSchemaEditor
                  ? t("app.generatorPreview.action.collapseSchemaEditor")
                  : t("app.generatorPreview.action.expandSchemaEditor")
              }}
            </button>
          </div>

          <div class="generator-status-facts generator-status-facts-compact">
            <div
              v-for="fact in schemaEditorFacts"
              :key="fact.label"
              class="generator-status-fact"
            >
              <span>{{ fact.label }}</span>
              <strong>{{ fact.value }}</strong>
            </div>
          </div>

          <label
            v-if="showSchemaEditor"
            class="generator-config-field generator-manual-draft"
          >
            <TTextarea
              :model-value="manualSchemaDraft"
              :maxlength="12000"
              :autosize="{ minRows: 10, maxRows: 24 }"
              :placeholder="
                t('app.generatorPreview.input.manualSchemaDraftPlaceholder')
              "
              @update:model-value="handleManualSchemaDraftInput"
            />
          </label>
        </section>

        <div
          v-if="showConfigError"
          class="enterprise-message enterprise-message-danger"
        >
          {{ errorMessage }}
        </div>

        <div
          v-if="manualSchemaDraftError"
          class="enterprise-message enterprise-message-danger"
        >
          {{ manualSchemaDraftError }}
        </div>

        <pre
          v-if="hasManualSchemaDraftErrorDetails"
          class="generator-validation-details"
        ><strong>{{ t("app.generatorPreview.input.validationDetails") }}</strong>
{{ manualSchemaDraftErrorDetails }}</pre>
  </section>

  <section
    v-if="hasCurrentResult"
    class="generator-block generator-session-panel"
  >
        <div class="generator-panel-head">
          <h3 class="generator-panel-title">
            {{ t("app.generatorPreview.sessionTitle") }}
          </h3>

          <label
            v-if="hasRecentSessions"
            class="generator-inline-field generator-status-session"
          >
            <span>{{ t("app.generatorPreview.filter.sessionLabel") }}</span>
            <TSelect
              class="generator-session-select"
              :model-value="selectedRecentSessionId"
              :options="recentSessionOptions"
              :placeholder="t('app.generatorPreview.filter.sessionPlaceholder')"
              :disabled="loading || reviewLoading || applyLoading"
              @update:model-value="handleRecentSessionChange"
            />
          </label>
        </div>

        <div class="generator-status-facts">
          <div
            v-for="fact in statusFacts"
            :key="fact.label"
            class="generator-status-fact"
          >
            <span>{{ fact.label }}</span>
            <strong>{{ fact.value }}</strong>
          </div>
        </div>

        <div
          v-if="currentStateMessage"
          :class="[
            'enterprise-message',
            `enterprise-message-${currentStateMessage.tone}`,
          ]"
        >
          {{ currentStateMessage.text }}
        </div>

        <label
          v-if="showReviewCommentInput"
          class="enterprise-field generator-review-comment"
        >
          <TTextarea
            :model-value="reviewComment"
            :maxlength="240"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :placeholder="t('app.generatorPreview.reviewCommentPlaceholder')"
            @update:model-value="handleReviewCommentInput"
          />
        </label>

        <div
          v-if="reviewEvidence"
          class="enterprise-message enterprise-message-info"
        >
          {{
            t(
              reviewEvidence.decision === "approve"
                ? "app.generatorPreview.message.reviewApproved"
                : "app.generatorPreview.message.reviewRejected",
              {
                value: reviewEvidence.reviewedAt ?? "-",
              },
            )
          }}
        </div>

        <div
          v-if="applyEvidence"
          class="enterprise-message enterprise-message-success"
        >
          {{
            t("app.generatorPreview.message.applied", {
              value: applyEvidence.appliedAt ?? "-",
            })
          }}
        </div>

        <div class="generator-toolbar-actions">
          <button
            v-if="showReviewActions && isRejectConfirming"
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="reviewLoading"
            @click="cancelRejectConfirmation"
          >
            {{ t("app.generatorPreview.action.cancelRejectConfirm") }}
          </button>
          <button
            v-if="showReviewActions && canReject"
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="reviewLoading"
            @click="handleReviewPreview('reject')"
          >
            {{
              isRejectConfirming
                ? t("app.generatorPreview.action.confirmReject")
                : t("app.generatorPreview.action.reject")
            }}
          </button>
          <button
            v-if="showReviewActions && canApprove && !isRejectConfirming"
            type="button"
            class="enterprise-button"
            :disabled="reviewLoading"
            @click="handleReviewPreview('approve')"
          >
            {{ resultPrimaryActionLabel }}
          </button>
          <button
            v-if="showApplyAction && isApplyConfirming"
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="applyLoading"
            @click="cancelApplyConfirmation"
          >
            {{ t("app.generatorPreview.action.cancelApplyConfirm") }}
          </button>
          <button
            v-if="showConfirmAction && canConfirm"
            type="button"
            class="enterprise-button"
            :disabled="loading || reviewLoading || applyLoading"
            @click="handleConfirmPreview"
          >
            {{ resultPrimaryActionLabel }}
          </button>
          <button
            v-else-if="showApplyAction"
            type="button"
            class="enterprise-button"
            :disabled="!canApply"
            @click="handleApplyPreview"
          >
            {{ resultPrimaryActionLabel }}
          </button>
        </div>
  </section>

  <section
    v-if="showFileList"
    class="generator-block generator-results-panel"
  >
        <div class="generator-panel-head">
          <h3 class="generator-panel-title">
            {{ t("app.generatorPreview.workspaceTitle") }}
          </h3>
        </div>

        <div v-if="showFileTools" class="generator-list-tools">
          <label class="generator-filter-search">
            <TInput
              :model-value="query"
              :placeholder="t('app.generatorPreview.filter.searchPlaceholder')"
              clearable
              @update:model-value="handleQueryInput"
            />
          </label>
        </div>

        <GeneratorPreviewWorkspaceFileList
          :t="t"
          :loading="loading"
          :files="files"
          :selected-file-path="selectedFilePath"
          @select-file="handleFileSelection"
        />
  </section>
</template>

<style scoped>
.generator-block {
  display: grid;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.92);
}

.generator-session-panel {
  background: rgba(248, 250, 252, 0.56);
}

.generator-panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: 0.75rem 1rem;
}

.generator-panel-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.generator-group {
  display: grid;
  gap: 0.7rem;
}

.generator-group-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 700;
}

.generator-inline-field {
  display: grid;
  gap: 0.35rem;
}

.generator-config-grid {
  display: grid;
  gap: 0.9rem 1rem;
}

.generator-config-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.generator-config-field {
  display: grid;
  gap: 0.5rem;
  min-width: 0;
}

.generator-config-label {
  color: #64748b;
  font-size: 0.77rem;
  font-weight: 700;
}

.generator-option-matrix {
  display: grid;
  gap: 0;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.5);
}

.generator-option-row {
  display: grid;
  grid-template-columns: 8.5rem minmax(0, 1fr);
  gap: 0.9rem;
  padding: 0.72rem 0.85rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-option-row:first-child {
  border-top: 0;
}

.generator-option-label {
  display: flex;
  align-items: flex-start;
  padding-top: 0.2rem;
}

.generator-option-values {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-width: 0;
}

.generator-option-values-mode {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.generator-option-values-templates {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.generator-reference-picker {
  display: grid;
  gap: 0.5rem;
}

.generator-option-values-reference {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8.2rem, 1fr));
  gap: 0.35rem;
}

.generator-option-values-inline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
}

.generator-option-item {
  display: grid;
  gap: 0.2rem;
  text-align: left;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 4px;
  background: #fff;
  color: #0f172a;
  padding: 0.55rem 0.7rem;
}

.generator-option-item strong {
  font-size: 0.79rem;
  font-weight: 700;
}

.generator-option-item span {
  color: #475569;
  font-size: 0.72rem;
  line-height: 1.35;
}

.generator-option-mode {
  min-height: 0;
  align-items: center;
}

.generator-option-mode strong {
  font-size: 0.78rem;
}

.generator-option-item-detail {
  min-height: 4.1rem;
}

.generator-option-item-inline {
  min-height: 3.3rem;
}

.generator-option-chip {
  gap: 0.1rem;
  min-height: 0;
  padding: 0.45rem 0.6rem;
}

.generator-option-chip strong {
  font-size: 0.76rem;
}

.generator-option-chip span {
  font-size: 0.7rem;
  line-height: 1.25;
}

.generator-option-item-active {
  border-color: rgba(36, 87, 214, 0.32);
  background: rgba(36, 87, 214, 0.08);
}

.generator-option-empty,
.generator-option-meta {
  color: #64748b;
  font-size: 0.74rem;
  line-height: 1.4;
}

.generator-session-select {
  min-width: min(18rem, 100%);
  flex: 1 1 15rem;
}

.generator-status-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
  gap: 0.6rem;
}

.generator-status-facts-compact {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.generator-status-fact {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.96);
}

.generator-status-fact span {
  color: #64748b;
  font-size: 0.75rem;
}

.generator-status-fact strong {
  color: #0f172a;
  font-size: 0.84rem;
  line-height: 1.45;
  word-break: break-word;
}

.generator-status-session {
  min-width: min(17rem, 100%);
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 600;
}

.generator-manual-draft {
  display: grid;
}

.generator-schema-group {
  padding-top: 0.9rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.generator-review-comment {
  display: grid;
  gap: 0.5rem;
}

.generator-list-tools {
  display: grid;
  gap: 0.75rem;
}

.generator-filter-search {
  grid-column: 1 / -1;
}

.generator-validation-details {
  margin: 0;
  padding: 0.85rem 0.95rem;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.04);
  color: #334155;
  font-size: 0.82rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

@media (max-width: 640px) {
  .generator-option-row,
  .generator-option-values-mode,
  .generator-option-values-templates,
  .generator-option-values-inline,
  .generator-config-grid,
  .generator-status-facts-compact {
    grid-template-columns: 1fr;
  }

  .generator-option-row {
    gap: 0.6rem;
  }

  .generator-option-values-reference {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .generator-status-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .generator-status-fact {
    padding: 0.65rem 0.7rem;
  }

  .generator-status-session {
    min-width: 100%;
  }

  .generator-panel-head {
    align-items: stretch;
  }

  .generator-toolbar-actions {
    width: 100%;
  }

  .generator-session-select {
    min-width: 100%;
    flex-basis: 100%;
  }
}
</style>
