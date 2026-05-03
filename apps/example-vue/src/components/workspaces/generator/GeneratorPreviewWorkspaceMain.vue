<script setup lang="ts">
import { computed, ref, watch } from "vue"

import { Input as TInput } from "tdesign-vue-next/es/input"
import { Select as TSelect } from "tdesign-vue-next/es/select"
import { Textarea as TTextarea } from "tdesign-vue-next/es/textarea"

import { shouldSelectGeneratorPreviewFile } from "../../../lib/generator-preview-workspace"
import GeneratorPreviewWorkspaceBlockedFiles from "./GeneratorPreviewWorkspaceBlockedFiles.vue"
import GeneratorPreviewWorkspaceFileList from "./GeneratorPreviewWorkspaceFileList.vue"
import {
  clearGeneratorPreviewReviewDraft,
  loadGeneratorPreviewReviewDraft,
  persistGeneratorPreviewReviewDraft,
} from "./generator-preview-review-draft"
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
  schemaOptions: GeneratorPreviewSchemaOption[]
  conflictStrategyOptions: Array<{ label: string; value: string }>
  selectedConflictStrategy: string
  recentSessionOptions: Array<{ label: string; value: string }>
  selectedRecentSessionId: string
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  query: string
  filterSummary: string
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
  (e: "update:query", value: string): void
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

const operationHint = computed<{
  key: string
  tone: "info" | "warning" | "success"
} | null>(() => {
  if (props.loading) {
    return {
      key: "app.generatorPreview.message.operationLoading",
      tone: "info",
    }
  }

  if (props.reviewLoading || props.applyLoading) {
    return {
      key: "app.generatorPreview.message.operationBusy",
      tone: "info",
    }
  }

  if (!props.sessionStatus) {
    return {
      key: "app.generatorPreview.message.operationNoSession",
      tone: "info",
    }
  }

  if (isRejectConfirming.value) {
    return {
      key: "app.generatorPreview.message.confirmReject",
      tone: "warning",
    }
  }

  if (isApplyConfirming.value) {
    return {
      key: "app.generatorPreview.message.confirmApply",
      tone: "warning",
    }
  }

  if (props.sessionStatus === "pending_review") {
    return {
      key: "app.generatorPreview.message.pendingReview",
      tone: "info",
    }
  }

  if (props.sessionStatus === "rejected") {
    return {
      key: "app.generatorPreview.message.rejected",
      tone: "warning",
    }
  }

  if (props.sessionStatus === "applied") {
    return {
      key: "app.generatorPreview.message.operationApplied",
      tone: "success",
    }
  }

  if (props.hasBlockingConflicts) {
    return {
      key: "app.generatorPreview.message.blockingConflicts",
      tone: "warning",
    }
  }

  if (props.sessionStatus === "ready" && !props.canApply) {
    return {
      key: "app.generatorPreview.message.operationApplyUnavailable",
      tone: "info",
    }
  }

  return null
})

const operationHintClass = computed(() =>
  operationHint.value
    ? `enterprise-message enterprise-message-${operationHint.value.tone}`
    : "",
)

const nextOperationKey = computed(() => {
  if (props.loading) {
    return "app.generatorPreview.next.refreshing"
  }

  if (isRejectConfirming.value) {
    return "app.generatorPreview.next.confirmReject"
  }

  if (isApplyConfirming.value) {
    return "app.generatorPreview.next.confirmApply"
  }

  if (props.reviewLoading) {
    return "app.generatorPreview.next.reviewing"
  }

  if (props.applyLoading) {
    return "app.generatorPreview.next.applying"
  }

  if (!props.sessionStatus || props.sessionStatus === "rejected") {
    return "app.generatorPreview.next.refresh"
  }

  if (props.sessionStatus === "pending_review") {
    return "app.generatorPreview.next.review"
  }

  if (props.sessionStatus === "applied") {
    return "app.generatorPreview.next.done"
  }

  if (props.hasBlockingConflicts) {
    return "app.generatorPreview.next.resolveConflicts"
  }

  if (props.sessionStatus === "ready" && props.canConfirm) {
    return "app.generatorPreview.next.confirmChecklist"
  }

  if (props.sessionStatus === "ready" && props.canApply) {
    return "app.generatorPreview.next.apply"
  }

  return "app.generatorPreview.next.wait"
})

const resolveEvidenceActorLabel = (
  evidence:
    | GeneratorPreviewReviewEvidence
    | GeneratorPreviewApplyEvidence
    | null,
) =>
  evidence?.actorDisplayName ??
  evidence?.actorUsername ??
  evidence?.actorUserId ??
  "-"

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

const resolveStatusLabel = (
  status: GeneratorPreviewWorkspaceMainProps["sessionStatus"],
) => {
  if (status === "applied") {
    return props.t("app.generatorPreview.status.applied")
  }

  if (status === "ready") {
    return props.t("app.generatorPreview.status.ready")
  }

  if (status === "rejected") {
    return props.t("app.generatorPreview.status.rejected")
  }

  return props.t("app.generatorPreview.status.pendingReview")
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
      <div class="generator-filter-grid">
        <label class="enterprise-field">
          <span>{{ t("app.generatorPreview.filter.schemaLabel") }}</span>
          <TSelect
            :model-value="selectedSchemaName"
            :options="schemaOptions"
            :disabled="loading || reviewLoading || applyLoading"
            @update:model-value="handleSchemaChange"
          />
        </label>

        <label class="enterprise-field">
          <span>{{ t("app.generatorPreview.filter.conflictLabel") }}</span>
          <TSelect
            :model-value="selectedConflictStrategy"
            :options="conflictStrategyOptions"
            :disabled="loading || reviewLoading || applyLoading"
            @update:model-value="handleConflictStrategyChange"
          />
        </label>

        <label class="enterprise-field">
          <span>{{ t("app.generatorPreview.filter.frontendLabel") }}</span>
          <TSelect
            :model-value="selectedFrontendTarget"
            :options="frontendOptions"
            :disabled="loading || reviewLoading || applyLoading"
            @update:model-value="handleFrontendChange"
          />
        </label>

        <label class="enterprise-field generator-filter-search">
          <span>{{ t("app.generatorPreview.filter.searchLabel") }}</span>
          <TInput
            :model-value="query"
            :placeholder="t('app.generatorPreview.filter.searchPlaceholder')"
            clearable
            @update:model-value="handleQueryInput"
          />
        </label>

        <label
          v-if="recentSessionOptions.length > 0"
          class="enterprise-field generator-filter-search"
        >
          <span>{{ t("app.generatorPreview.filter.sessionLabel") }}</span>
          <TSelect
            :model-value="selectedRecentSessionId"
            :options="recentSessionOptions"
            :placeholder="t('app.generatorPreview.filter.sessionPlaceholder')"
            :disabled="loading || reviewLoading || applyLoading"
            @update:model-value="handleRecentSessionChange"
          />
        </label>
      </div>

      <div class="generator-toolbar">
        <div class="generator-toolbar-meta">
          <span class="enterprise-toolbar-pill">{{ filterSummary }}</span>
          <span v-if="sessionStatus" class="enterprise-toolbar-pill">
            {{ resolveStatusLabel(sessionStatus) }}
          </span>
          <span class="enterprise-toolbar-pill generator-next-action-pill">
            {{ t(nextOperationKey) }}
          </span>
        </div>

        <div class="generator-toolbar-actions">
          <button
            v-if="query.trim().length > 0"
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('reset-filters')"
          >
            {{ t("app.generatorPreview.filter.reset") }}
          </button>
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
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="!canReject"
            @click="handleReviewPreview('reject')"
          >
            {{
              isRejectConfirming
                ? t("app.generatorPreview.action.confirmReject")
                : t("app.generatorPreview.action.reject")
            }}
          </button>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="!canApprove || isRejectConfirming"
            @click="handleReviewPreview('approve')"
          >
            {{ t("app.generatorPreview.action.approve") }}
          </button>
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
            class="enterprise-button enterprise-button-ghost"
            :disabled="loading || reviewLoading || applyLoading"
            @click="handleConfirmPreview"
          >
            {{ t("app.generatorPreview.action.confirmChecklist") }}
          </button>
          <button
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

      <div
        v-if="errorMessage"
        class="enterprise-message enterprise-message-danger"
      >
        {{ errorMessage }}
      </div>

      <div
        v-else-if="operationHint"
        :class="operationHintClass"
      >
        {{ t(operationHint.key) }}
      </div>

      <GeneratorPreviewWorkspaceBlockedFiles
        :t="t"
        :files="files"
        :selected-file-path="selectedFilePath"
        @select-file="handleFileSelection"
      />

      <label
        v-if="canApprove || canReject"
        class="enterprise-field generator-review-comment"
      >
        <span>{{ t("app.generatorPreview.reviewCommentLabel") }}</span>
        <TTextarea
          :model-value="reviewComment"
          :maxlength="240"
          :autosize="{ minRows: 2, maxRows: 4 }"
          :placeholder="t('app.generatorPreview.reviewCommentPlaceholder')"
          @update:model-value="handleReviewCommentInput"
        />
      </label>

      <div
        v-if="diffSummary"
        class="generator-summary-grid"
      >
        <article>
          <small>{{ t("app.generatorPreview.summary.changed") }}</small>
          <strong>{{ diffSummary.changedFileCount }}</strong>
        </article>
        <article>
          <small>{{ t("app.generatorPreview.summary.create") }}</small>
          <strong>{{ diffSummary.actionCounts.create }}</strong>
        </article>
        <article>
          <small>{{ t("app.generatorPreview.summary.overwrite") }}</small>
          <strong>{{ diffSummary.actionCounts.overwrite }}</strong>
        </article>
        <article>
          <small>{{ t("app.generatorPreview.summary.skip") }}</small>
          <strong>{{ diffSummary.actionCounts.skip }}</strong>
        </article>
        <article>
          <small>{{ t("app.generatorPreview.summary.block") }}</small>
          <strong>{{ diffSummary.actionCounts.block }}</strong>
        </article>
      </div>

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

      <p
        v-if="
          reviewEvidence &&
          (resolveEvidenceActorLabel(reviewEvidence) !== '-' ||
            Boolean(reviewEvidence.comment))
        "
        class="generator-status-note"
      >
        <span v-if="resolveEvidenceActorLabel(reviewEvidence) !== '-'">
          {{ t("app.generatorPreview.meta.actor") }}:
          {{ resolveEvidenceActorLabel(reviewEvidence) }}
        </span>
        <span
          v-if="
            resolveEvidenceActorLabel(reviewEvidence) !== '-' &&
            reviewEvidence.comment
          "
        >
          ·
        </span>
        <span v-if="reviewEvidence.comment">
          {{ t("app.generatorPreview.meta.reviewComment") }}:
          {{ reviewEvidence.comment }}
        </span>
      </p>

      <p
        v-if="
          applyEvidence &&
          (resolveEvidenceActorLabel(applyEvidence) !== '-' ||
            Boolean(applyEvidence.requestId))
        "
        class="generator-status-note"
      >
        <span v-if="resolveEvidenceActorLabel(applyEvidence) !== '-'">
          {{ t("app.generatorPreview.meta.actor") }}:
          {{ resolveEvidenceActorLabel(applyEvidence) }}
        </span>
        <span
          v-if="
            resolveEvidenceActorLabel(applyEvidence) !== '-' &&
            applyEvidence.requestId
          "
        >
          ·
        </span>
        <span v-if="applyEvidence.requestId">
          {{ t("app.generatorPreview.meta.requestId") }}:
          {{ applyEvidence.requestId }}
        </span>
      </p>

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
.enterprise-field span {
  margin: 0;
}

.generator-filter-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.generator-toolbar-meta,
.generator-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.generator-next-action-pill {
  border-color: rgba(36, 87, 214, 0.18);
  background: rgba(239, 246, 255, 0.72);
  color: #1d4ed8;
}

.generator-review-comment {
  display: grid;
  gap: 0.5rem;
}

.generator-status-note {
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
}

.generator-summary-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
}

.generator-summary-grid article {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(248, 250, 252, 0.56);
  padding: 0.9rem 1rem;
}

.generator-summary-grid small,
.generator-summary-grid strong {
  display: block;
}

.generator-summary-grid small {
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.generator-summary-grid strong {
  margin-top: 0.45rem;
  color: #0f172a;
  font-size: 1.05rem;
}

@media (max-width: 900px) {
  .generator-filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
