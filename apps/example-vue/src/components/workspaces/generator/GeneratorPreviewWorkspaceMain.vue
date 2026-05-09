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
import { listSchemaTemplates } from "./generator-preview-schema-templates"
import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewFileCard,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewSchemaOption,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceMainProps {
  t: GeneratorPreviewTranslation
  loading: boolean
  reviewLoading: boolean
  applyLoading: boolean
  errorMessage: string
  inputModeOptions: Array<{ label: string; value: string }>
  schemaOptions: GeneratorPreviewSchemaOption[]
  conflictStrategyOptions: Array<{ label: string; value: string }>
  selectedInputMode: string
  selectedConflictStrategy: string
  recentSessionOptions: Array<{ label: string; value: string }>
  selectedRecentSessionId: string
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
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

const props = defineProps<GeneratorPreviewWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "update:selected-schema-name", value: string): void
  (e: "update:selected-conflict-strategy", value: string): void
  (e: "update:selected-frontend-target", value: "vue" | "react"): void
  (e: "update:selected-input-mode", value: string): void
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
const isApplyConfirming = ref(false)
const isRejectConfirming = ref(false)
const resolveCurrentReviewDraftSessionId = () =>
  props.selectedRecentSessionId.trim() || null

const frontendOptions = [
  { label: "Vue", value: "vue" },
  { label: "React", value: "react" },
] as const
const schemaTemplates = listSchemaTemplates()

const isManualSchemaMode = computed(
  () => props.selectedInputMode === "manual-schema-json",
)
const showSchemaTemplates = computed(
  () => isManualSchemaMode.value && props.manualSchemaDraft.trim().length === 0,
)

const hasRecentSessions = computed(() => props.recentSessionOptions.length > 0)
const showReviewCommentInput = computed(
  () => isRejectConfirming.value || Boolean(props.reviewEvidence?.comment),
)
const hasManualSchemaDraftErrorDetails = computed(() =>
  Boolean(props.manualSchemaDraftErrorDetails?.trim()),
)

const handleQueryInput = (value: string | number) => {
  const nextValue = String(value)

  if (nextValue === props.query) {
    return
  }

  emit("update:query", nextValue)
}

const handleSchemaChange = (
  value: string | number | Array<string | number>,
) => {
  if (typeof value === "string" && value !== props.selectedSchemaName) {
    emit("update:selected-schema-name", value)
  }
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

const handleInputModeChange = (
  value: string | number | Array<string | number>,
) => {
  if (
    (value === "registered-schema" || value === "manual-schema-json") &&
    value !== props.selectedInputMode
  ) {
    emit("update:selected-input-mode", value)
  }
}

const handleManualSchemaDraftInput = (value: string | number) => {
  const nextValue = String(value)

  if (nextValue === props.manualSchemaDraft) {
    return
  }

  emit("update:manual-schema-draft", nextValue)
}

const handleLoadCurrentSchemaDraft = () => {
  emit("load-current-schema-draft")
}

const handleLoadSchemaTemplate = (templateId: string) => {
  emit("load-template", templateId)
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
  <section class="enterprise-card enterprise-main-card">
    <div class="enterprise-workspace-stack">
      <section class="panel-section generator-input-section">
        <div class="generator-input-mode">
          <button
            v-for="option in inputModeOptions"
            :key="option.value"
            type="button"
            class="generator-mode-button"
            :class="
              selectedInputMode === option.value
                ? 'generator-mode-button-active'
                : ''
            "
            :disabled="loading || reviewLoading || applyLoading"
            @click="handleInputModeChange(option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="generator-control-row">
          <TSelect
            class="generator-schema-select"
            :model-value="selectedSchemaName"
            :options="schemaOptions"
            :disabled="loading || reviewLoading || applyLoading"
            @update:model-value="handleSchemaChange"
          />

          <div class="generator-option-group">
            <button
              v-for="option in frontendOptions"
              :key="option.value"
              type="button"
              class="generator-option-button"
              :class="
                selectedFrontendTarget === option.value
                  ? 'generator-option-button-active'
                  : ''
              "
              :disabled="loading || reviewLoading || applyLoading"
              @click="handleFrontendChange(option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <div class="generator-option-group">
            <button
              v-for="option in conflictStrategyOptions"
              :key="option.value"
              type="button"
              class="generator-option-button"
              :class="
                selectedConflictStrategy === option.value
                  ? 'generator-option-button-active'
                  : ''
              "
              :disabled="loading || reviewLoading || applyLoading"
              @click="handleConflictStrategyChange(option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <TSelect
            v-if="hasRecentSessions"
            class="generator-session-select"
            :model-value="selectedRecentSessionId"
            :options="recentSessionOptions"
            :placeholder="t('app.generatorPreview.filter.sessionPlaceholder')"
            :disabled="loading || reviewLoading || applyLoading"
            @update:model-value="handleRecentSessionChange"
          />
        </div>

        <div v-if="isManualSchemaMode" class="generator-toolbar">
          <div class="generator-toolbar-actions">
            <button
              type="button"
              class="enterprise-button enterprise-button-ghost"
              :disabled="loading || reviewLoading || applyLoading || !selectedSchemaName"
              @click="handleLoadCurrentSchemaDraft"
            >
              {{ t("app.generatorPreview.action.loadCurrentSchemaDraft") }}
            </button>
          </div>
        </div>

        <div v-if="showSchemaTemplates" class="generator-template-strip">
          <span class="generator-template-label">
            {{ t("app.generatorPreview.input.templateLabel") }}
          </span>
          <div class="generator-template-actions">
            <button
              v-for="template in schemaTemplates"
              :key="template.id"
              type="button"
              class="generator-template-button"
              :title="template.description"
              :disabled="loading || reviewLoading || applyLoading"
              @click="handleLoadSchemaTemplate(template.id)"
            >
              {{ template.label }}
            </button>
          </div>
          <p class="generator-template-hint">
            {{ t("app.generatorPreview.input.templateHint") }}
          </p>
        </div>

        <label
          v-if="isManualSchemaMode"
          class="generator-manual-draft"
        >
          <TTextarea
            :model-value="manualSchemaDraft"
            :maxlength="12000"
            :autosize="{ minRows: 10, maxRows: 24 }"
            :placeholder="t('app.generatorPreview.input.manualSchemaDraftPlaceholder')"
            @update:model-value="handleManualSchemaDraftInput"
          />
        </label>

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

      <div class="generator-toolbar">
        <div class="generator-toolbar-actions">
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="loading || reviewLoading || applyLoading"
            @click="handleRefreshPreview"
          >
            {{
              loading
                ? t("app.generatorPreview.action.refreshing")
                : t("app.generatorPreview.action.refresh")
            }}
          </button>
          <span class="generator-toolbar-divider" />
          <button
            v-if="isRejectConfirming"
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="reviewLoading"
            @click="cancelRejectConfirmation"
          >
            {{ t("app.generatorPreview.action.cancelRejectConfirm") }}
          </button>
          <button
            v-if="isRejectConfirming"
            type="button"
            class="enterprise-button"
            :disabled="reviewLoading"
            @click="handleReviewPreview('reject')"
          >
            {{ t("app.generatorPreview.action.confirmReject") }}
          </button>
          <button
            v-else-if="canReject"
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="handleReviewPreview('reject')"
          >
            {{ t("app.generatorPreview.action.reject") }}
          </button>
          <button
            v-if="canApprove && !isRejectConfirming"
            type="button"
            class="enterprise-button"
            @click="handleReviewPreview('approve')"
          >
            {{ t("app.generatorPreview.action.approve") }}
          </button>
          <button
            v-if="isApplyConfirming"
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="applyLoading"
            @click="cancelApplyConfirmation"
          >
            {{ t("app.generatorPreview.action.cancelApplyConfirm") }}
          </button>
          <button
            v-if="canConfirm"
            type="button"
            class="enterprise-button"
            :disabled="loading || reviewLoading || applyLoading"
            @click="handleConfirmPreview"
          >
            {{ t("app.generatorPreview.action.confirmChecklist") }}
          </button>
          <button
            v-else
            type="button"
            class="enterprise-button"
            :disabled="!canApply"
            @click="handleApplyPreview"
          >
            {{
              applyLoading
                ? t("app.generatorPreview.action.applying")
                : isApplyConfirming
                  ? t("app.generatorPreview.action.confirmApply")
                  : t("app.generatorPreview.action.apply")
            }}
          </button>
        </div>
      </div>

      <div class="generator-list-tools">
        <label class="generator-filter-search">
          <TInput
            :model-value="query"
            :placeholder="t('app.generatorPreview.filter.searchPlaceholder')"
            clearable
            @update:model-value="handleQueryInput"
          />
        </label>
      </div>

      <div
        v-if="errorMessage"
        class="enterprise-message enterprise-message-danger"
      >
        {{ errorMessage }}
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

      <div v-if="reviewEvidence" class="enterprise-message enterprise-message-info">
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

      <div v-if="applyEvidence" class="enterprise-message enterprise-message-success">
        {{
          t("app.generatorPreview.message.applied", {
            value: applyEvidence.appliedAt ?? "-",
          })
        }}
      </div>

      <GeneratorPreviewWorkspaceFileList
        :t="t"
        :loading="loading"
        :files="files"
        :selected-file-path="selectedFilePath"
        @select-file="handleFileSelection"
      />
    </div>
  </section>
</template>

<style scoped>
.panel-section {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-input-mode {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.generator-mode-button {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.85);
  color: #334155;
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.generator-mode-button-active {
  border-color: rgba(36, 87, 214, 0.4);
  background: rgba(36, 87, 214, 0.08);
  color: #173ea6;
}

.generator-control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.generator-schema-select {
  min-width: min(22rem, 100%);
  flex: 1 1 18rem;
}

.generator-session-select {
  min-width: min(18rem, 100%);
  flex: 1 1 15rem;
}

.generator-option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.generator-option-button {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.85);
  color: #334155;
  padding: 0.5rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
}

.generator-option-button-active {
  border-color: rgba(36, 87, 214, 0.36);
  background: rgba(36, 87, 214, 0.08);
  color: #173ea6;
}

.generator-manual-draft {
  display: grid;
}

.generator-template-strip {
  display: grid;
  gap: 0.5rem;
  padding: 0.85rem 0.95rem;
  border: 1px dashed rgba(36, 87, 214, 0.24);
  border-radius: 10px;
  background: rgba(36, 87, 214, 0.04);
}

.generator-template-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #173ea6;
}

.generator-template-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.generator-template-button {
  border: 1px solid rgba(36, 87, 214, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #173ea6;
  padding: 0.45rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.generator-template-hint {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #475569;
}

.generator-filter-search {
  grid-column: 1 / -1;
}

.generator-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
}

.generator-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.generator-toolbar-divider {
  width: 1px;
  height: 1.5rem;
  background: rgba(15, 23, 42, 0.08);
}

.generator-review-comment {
  display: grid;
  gap: 0.5rem;
}

.generator-list-tools {
  display: grid;
  gap: 0.75rem;
}

.generator-validation-details {
  margin: 0;
  padding: 0.85rem 0.95rem;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.04);
  color: #334155;
  font-size: 0.82rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

@media (max-width: 640px) {
  .generator-control-row {
    align-items: stretch;
  }

  .generator-option-group {
    width: 100%;
  }
}
</style>
