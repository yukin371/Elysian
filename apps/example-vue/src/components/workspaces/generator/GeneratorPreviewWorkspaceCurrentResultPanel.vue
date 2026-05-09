<script setup lang="ts">
import { Select as TSelect } from "tdesign-vue-next/es/select"
import { Textarea as TTextarea } from "tdesign-vue-next/es/textarea"

import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorStatusFact {
  label: string
  value: string
}

interface GeneratorCurrentStateMessage {
  text: string
  tone: "warning" | "info" | "success"
}

interface GeneratorPreviewWorkspaceCurrentResultPanelProps {
  t: GeneratorPreviewTranslation
  loading: boolean
  reviewLoading: boolean
  applyLoading: boolean
  hasRecentSessions: boolean
  recentSessionOptions: Array<{ label: string; value: string }>
  selectedRecentSessionId: string
  statusFacts: GeneratorStatusFact[]
  currentStateMessage: GeneratorCurrentStateMessage | null
  showReviewCommentInput: boolean
  reviewComment: string
  reviewEvidence: GeneratorPreviewReviewEvidence | null
  applyEvidence: GeneratorPreviewApplyEvidence | null
  showReviewActions: boolean
  isRejectConfirming: boolean
  canReject: boolean
  canApprove: boolean
  showConfirmAction: boolean
  canConfirm: boolean
  showApplyAction: boolean
  isApplyConfirming: boolean
  canApply: boolean
  resultPrimaryActionLabel: string
}

defineProps<GeneratorPreviewWorkspaceCurrentResultPanelProps>()

const emit = defineEmits<{
  (e: "recent-session-change", value: string | number | string[]): void
  (e: "review-comment-input", value: string | number): void
  (e: "cancel-reject-confirm"): void
  (e: "review-preview", decision: "approve" | "reject"): void
  (e: "cancel-apply-confirm"): void
  (e: "confirm-preview"): void
  (e: "apply-preview"): void
}>()
</script>

<template>
  <section class="generator-block generator-session-panel">
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
          @update:model-value="emit('recent-session-change', $event)"
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
        @update:model-value="emit('review-comment-input', $event)"
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

    <div v-if="applyEvidence" class="enterprise-message enterprise-message-success">
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
        @click="emit('cancel-reject-confirm')"
      >
        {{ t("app.generatorPreview.action.cancelRejectConfirm") }}
      </button>
      <button
        v-if="showReviewActions && canReject"
        type="button"
        class="enterprise-button enterprise-button-ghost"
        :disabled="reviewLoading"
        @click="emit('review-preview', 'reject')"
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
        @click="emit('review-preview', 'approve')"
      >
        {{ resultPrimaryActionLabel }}
      </button>
      <button
        v-if="showApplyAction && isApplyConfirming"
        type="button"
        class="enterprise-button enterprise-button-ghost"
        :disabled="applyLoading"
        @click="emit('cancel-apply-confirm')"
      >
        {{ t("app.generatorPreview.action.cancelApplyConfirm") }}
      </button>
      <button
        v-if="showConfirmAction && canConfirm"
        type="button"
        class="enterprise-button"
        :disabled="loading || reviewLoading || applyLoading"
        @click="emit('confirm-preview')"
      >
        {{ resultPrimaryActionLabel }}
      </button>
      <button
        v-else-if="showApplyAction"
        type="button"
        class="enterprise-button"
        :disabled="!canApply"
        @click="emit('apply-preview')"
      >
        {{ resultPrimaryActionLabel }}
      </button>
    </div>
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

.generator-inline-field {
  display: grid;
  gap: 0.35rem;
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

@media (max-width: 640px) {
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
