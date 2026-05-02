<script setup lang="ts">
import { computed, ref, watch } from "vue"

import { Input as TInput } from "tdesign-vue-next/es/input"
import { Select as TSelect } from "tdesign-vue-next/es/select"
import { Textarea as TTextarea } from "tdesign-vue-next/es/textarea"

import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewFileCard,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewSchemaOption,
  GeneratorPreviewTranslation,
} from "./types"
import {
  clearGeneratorPreviewReviewDraft,
  loadGeneratorPreviewReviewDraft,
  persistGeneratorPreviewReviewDraft,
} from "./generator-preview-review-draft"
import { shouldSelectGeneratorPreviewFile } from "../../../lib/generator-preview-workspace"

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

const blockedFiles = computed(() =>
  props.files.filter((file) => file.plannedAction === "block"),
)

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
  if (
    typeof value === "string" &&
    value !== props.selectedConflictStrategy
  ) {
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
    emit("restore-session", value)
  }
}

const resolveStatusLabel = (status: GeneratorPreviewWorkspaceMainProps["sessionStatus"]) => {
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
  if (decision === "reject" && !isRejectConfirming.value) {
    isRejectConfirming.value = true
    return
  }

  emit("review-preview", {
    comment: reviewComment.value,
    decision,
  })
}

const handleApplyPreview = () => {
  if (!props.canApply || props.applyLoading) {
    return
  }

  if (!isApplyConfirming.value) {
    isApplyConfirming.value = true
    return
  }

  emit("apply-preview")
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
    props.applyLoading,
    props.reviewLoading,
    props.selectedRecentSessionId,
    props.selectedSchemaName,
    props.selectedFrontendTarget,
    props.reviewEvidence?.comment ?? null,
  ],
  ([status, canApply, canReject, applyLoading, reviewLoading, sessionId]) => {
    const resolvedSessionId =
      typeof sessionId === "string" && sessionId.trim().length > 0
        ? sessionId.trim()
        : null

    if (!canApply || applyLoading || status !== "ready") {
      isApplyConfirming.value = false
    }

    if (!canReject || reviewLoading || status !== "pending_review") {
      isRejectConfirming.value = false
    }

    if (status === "pending_review") {
      reviewComment.value = resolvedSessionId
        ? loadGeneratorPreviewReviewDraft(resolvedSessionId) ??
          props.reviewEvidence?.comment ??
          ""
        : props.reviewEvidence?.comment ?? ""
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
            @click="emit('refresh-preview')"
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
            :disabled="!canApprove"
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

      <section
        v-if="blockedFiles.length > 0"
        class="generator-blocked-section"
      >
        <div class="generator-blocked-header">
          <strong>{{ t("app.generatorPreview.blockedTitle") }}</strong>
          <span>
            {{
              t("app.generatorPreview.blockedCount", {
                count: blockedFiles.length,
              })
            }}
          </span>
        </div>
        <div class="generator-blocked-list">
          <button
            v-for="file in blockedFiles"
            :key="file.path"
            type="button"
            class="generator-blocked-card"
            :class="
              selectedFilePath === file.path ? 'generator-blocked-card-active' : ''
            "
            @click="handleFileSelection(file.path)"
          >
            <strong>{{ file.path }}</strong>
            <p>{{ file.plannedReason }}</p>
            <span class="generator-blocked-card-hint">
              {{ t("app.generatorPreview.blockedAction") }}
            </span>
          </button>
        </div>
      </section>

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

      <div
        v-if="loading"
        class="enterprise-message enterprise-message-info"
      >
        {{ t("app.generatorPreview.loading") }}
      </div>

      <div
        v-else-if="files.length === 0"
        class="enterprise-message enterprise-message-warning"
      >
        {{ t("app.generatorPreview.emptyFiltered") }}
      </div>

      <div v-else class="generator-file-list">
        <button
          v-for="file in files"
          :key="file.path"
          type="button"
          class="generator-file-card"
          :class="
            selectedFilePath === file.path ? 'generator-file-card-active' : ''
          "
          @click="handleFileSelection(file.path)"
        >
          <div class="generator-file-card-header">
            <strong>{{ file.path }}</strong>
            <span>{{ file.lineCount }} {{ t("app.generatorPreview.meta.lines") }}</span>
          </div>
          <p>{{ file.reason }}</p>
          <div class="generator-file-card-meta">
            <span class="generator-file-card-action">
              {{ t(`app.generatorPreview.actionLabel.${file.plannedAction}`) }}
            </span>
            <span>{{ file.mergeStrategy }}</span>
            <span class="generator-file-card-diff generator-file-card-diff-added">
              +{{ file.diffStats.addedLineCount }}
            </span>
            <span class="generator-file-card-diff generator-file-card-diff-removed">
              -{{ file.diffStats.removedLineCount }}
            </span>
            <span>{{ file.charCount }} chars</span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.enterprise-field span,
.generator-file-card p,
.generator-file-card-meta {
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

.generator-blocked-section,
.generator-blocked-list {
  display: grid;
  gap: 0.75rem;
}

.generator-blocked-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  color: #9a3412;
}

.generator-blocked-card {
  display: grid;
  gap: 0.35rem;
  width: 100%;
  border-radius: 6px;
  border: 1px solid rgba(154, 52, 18, 0.18);
  background: rgba(255, 247, 237, 0.9);
  padding: 0.85rem 0.95rem;
  text-align: left;
  color: #7c2d12;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 140ms ease;
}

.generator-blocked-card:hover {
  transform: translateY(-1px);
  border-color: rgba(154, 52, 18, 0.38);
  box-shadow: 0 10px 18px rgba(124, 45, 18, 0.08);
}

.generator-blocked-card p {
  margin: 0;
  color: #7c2d12;
}

.generator-blocked-card-active {
  border-color: rgba(194, 65, 12, 0.56);
  box-shadow: 0 12px 22px rgba(194, 65, 12, 0.12);
}

.generator-blocked-card-hint {
  color: #9a3412;
  font-size: 0.78rem;
}

.generator-file-list {
  display: grid;
  gap: 0.85rem;
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

.generator-file-card {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.88);
  padding: 1rem;
  text-align: left;
  color: #0f172a;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 140ms ease;
}

.generator-file-card:hover {
  transform: translateY(-1px);
  border-color: rgba(36, 87, 214, 0.2);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.06);
}

.generator-file-card-active {
  border-color: rgba(36, 87, 214, 0.45);
  box-shadow: 0 12px 22px rgba(36, 87, 214, 0.1);
}

.generator-file-card-header,
.generator-file-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  justify-content: space-between;
  align-items: center;
}

.generator-file-card p {
  margin-top: 0.7rem;
  color: #475569;
  line-height: 1.65;
}

.generator-file-card-meta {
  margin-top: 0.8rem;
  font-size: 0.78rem;
  color: #64748b;
}

.generator-file-card-action {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.8);
  padding: 0.2rem 0.55rem;
  color: #334155;
}

.generator-file-card-diff {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.generator-file-card-diff-added {
  color: #15803d;
}

.generator-file-card-diff-removed {
  color: #b91c1c;
}

@media (max-width: 900px) {
  .generator-filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
