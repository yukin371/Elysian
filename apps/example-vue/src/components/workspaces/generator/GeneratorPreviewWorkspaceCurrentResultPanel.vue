<script setup lang="ts">
import { computed } from "vue"

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

interface GeneratorOperationProgressMessage {
  description: string
  title: string
}

interface GeneratorPreviewWorkspaceCurrentResultPanelProps {
  t: GeneratorPreviewTranslation
  loading: boolean
  reviewLoading: boolean
  applyLoading: boolean
  hasCurrentResult: boolean
  hasRecentSessions: boolean
  recentSessionOptions: Array<{ label: string; value: string }>
  selectedRecentSessionId: string
  statusFacts: GeneratorStatusFact[]
  currentStateMessage: GeneratorCurrentStateMessage | null
  operationProgressMessage: GeneratorOperationProgressMessage | null
  blockedFileCount: number
  firstBlockedFilePath: string | null
  resultErrorRecoverySteps: string[]
  confirmationChecklist: string[]
  showReviewCommentInput: boolean
  reviewComment: string
  rejectCommentRequired: boolean
  reviewEvidence: GeneratorPreviewReviewEvidence | null
  applyEvidence: GeneratorPreviewApplyEvidence | null
  showReviewActions: boolean
  isRejectConfirming: boolean
  canReject: boolean
  canSubmitReject: boolean
  canApprove: boolean
  showConfirmAction: boolean
  canConfirm: boolean
  showApplyAction: boolean
  isApplyConfirming: boolean
  canApply: boolean
  resultPrimaryActionLabel: string
}

const props = defineProps<GeneratorPreviewWorkspaceCurrentResultPanelProps>()

const emit = defineEmits<{
  (e: "recent-session-change", value: string | number | string[]): void
  (e: "restore-current-result"): void
  (e: "refresh-preview"): void
  (e: "review-comment-input", value: string | number): void
  (e: "cancel-reject-confirm"): void
  (e: "review-preview", decision: "approve" | "reject"): void
  (e: "cancel-apply-confirm"): void
  (e: "confirm-preview"): void
  (e: "apply-preview"): void
  (e: "select-file", value: string): void
}>()

const verdictTone = computed<"warning" | "info" | "success">(() => {
  if (props.blockedFileCount > 0) {
    return "warning"
  }

  if (props.applyEvidence) {
    return "success"
  }

  return props.currentStateMessage?.tone ?? "info"
})

const verdictTitle = computed(() => {
  if (props.blockedFileCount > 0) {
    return props.t("app.generatorPreview.verdict.blockedTitle")
  }

  if (props.showReviewActions) {
    return props.t("app.generatorPreview.verdict.reviewTitle")
  }

  if (props.showConfirmAction) {
    return props.t("app.generatorPreview.verdict.confirmTitle")
  }

  if (props.showApplyAction) {
    return props.t("app.generatorPreview.verdict.applyTitle")
  }

  if (props.applyEvidence) {
    return props.t("app.generatorPreview.verdict.doneTitle")
  }

  return props.t("app.generatorPreview.verdict.idleTitle")
})

const verdictDescription = computed(() => {
  if (props.blockedFileCount > 0) {
    return props.t("app.generatorPreview.verdict.blockedDescription", {
      count: props.blockedFileCount,
    })
  }

  if (props.currentStateMessage) {
    return props.currentStateMessage.text
  }

  if (props.reviewEvidence) {
    return props.t(
      props.reviewEvidence.decision === "approve"
        ? "app.generatorPreview.message.reviewApproved"
        : "app.generatorPreview.message.reviewRejected",
      {
        value: props.reviewEvidence.reviewedAt ?? "-",
      },
    )
  }

  if (props.applyEvidence) {
    return props.t("app.generatorPreview.message.applied", {
      value: props.applyEvidence.appliedAt ?? "-",
    })
  }

  return props.t("app.generatorPreview.verdict.idleDescription")
})

const nextStepTitle = computed(() => {
  if (props.blockedFileCount > 0) {
    return props.t("app.generatorPreview.next.resolveConflicts")
  }

  if (props.showReviewActions) {
    return props.t("app.generatorPreview.next.review")
  }

  if (props.showConfirmAction) {
    return props.t("app.generatorPreview.next.confirmChecklist")
  }

  if (props.showApplyAction && props.isApplyConfirming) {
    return props.t("app.generatorPreview.next.confirmApply")
  }

  if (props.showApplyAction) {
    return props.t("app.generatorPreview.next.apply")
  }

  if (props.applyEvidence) {
    return props.t("app.generatorPreview.next.done")
  }

  return props.t("app.generatorPreview.next.wait")
})

const nextStepDescription = computed(() => {
  if (props.blockedFileCount > 0) {
    return props.t("app.generatorPreview.nextSummary.resolveConflicts")
  }

  if (props.showReviewActions) {
    return props.t("app.generatorPreview.nextSummary.review")
  }

  if (props.showConfirmAction) {
    return props.t("app.generatorPreview.nextSummary.confirmChecklist")
  }

  if (props.showApplyAction && props.isApplyConfirming) {
    return props.t("app.generatorPreview.nextSummary.confirmApply")
  }

  if (props.showApplyAction) {
    return props.t("app.generatorPreview.nextSummary.apply")
  }

  if (props.applyEvidence) {
    return props.t("app.generatorPreview.nextSummary.done")
  }

  return props.t("app.generatorPreview.nextSummary.wait")
})

const showPrimaryBlockedAction = computed(
  () => props.blockedFileCount > 0 && Boolean(props.firstBlockedFilePath),
)

const showPrimaryReviewAction = computed(
  () =>
    !showPrimaryBlockedAction.value &&
    props.showReviewActions &&
    props.canApprove &&
    !props.isRejectConfirming,
)

const showPrimaryConfirmAction = computed(
  () =>
    !showPrimaryBlockedAction.value &&
    props.showConfirmAction &&
    props.canConfirm,
)

const showPrimaryApplyAction = computed(
  () => !showPrimaryBlockedAction.value && props.showApplyAction,
)

const showAnyPrimaryAction = computed(
  () =>
    showPrimaryBlockedAction.value ||
    showPrimaryReviewAction.value ||
    showPrimaryConfirmAction.value ||
    showPrimaryApplyAction.value,
)
</script>

<template>
  <section class="generator-block generator-session-panel">
    <div class="generator-panel-head">
      <div class="generator-panel-copy">
        <p class="generator-panel-eyebrow">
          {{ t("app.generatorPreview.sessionTitle") }}
        </p>
        <h3 class="generator-panel-title">
          {{ t("app.generatorPreview.reviewHeadline") }}
        </h3>
        <p class="generator-panel-description">
          {{ t("app.generatorPreview.reviewDescription") }}
        </p>
      </div>

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

    <div
      v-if="!hasCurrentResult"
      class="generator-empty-result"
    >
      <strong>{{ t("app.generatorPreview.emptyResultTitle") }}</strong>
      <span>{{ t("app.generatorPreview.emptyResultDescription") }}</span>
    </div>

    <div
      v-else
      class="generator-result-summary"
    >
      <section
        :class="[
          'generator-result-verdict',
          `generator-result-verdict-${verdictTone}`,
        ]"
      >
        <span class="generator-result-verdict-label">
          {{ t("app.generatorPreview.verdict.label") }}
        </span>
        <strong>{{ verdictTitle }}</strong>
        <p>{{ verdictDescription }}</p>
      </section>

      <section class="generator-next-step-card">
        <div class="generator-next-step-copy">
          <span>{{ nextStepTitle }}</span>
          <strong>{{ nextStepDescription }}</strong>
        </div>

        <div
          v-if="showAnyPrimaryAction"
          class="generator-next-step-actions"
        >
          <button
            v-if="showPrimaryBlockedAction && firstBlockedFilePath"
            type="button"
            class="enterprise-button"
            :disabled="loading || reviewLoading || applyLoading"
            @click="emit('select-file', firstBlockedFilePath)"
          >
            {{ t("app.generatorPreview.blockedPrimaryAction") }}
          </button>
          <button
            v-else-if="showPrimaryReviewAction"
            type="button"
            class="enterprise-button"
            :disabled="reviewLoading"
            @click="emit('review-preview', 'approve')"
          >
            {{ resultPrimaryActionLabel }}
          </button>
          <button
            v-else-if="showPrimaryConfirmAction"
            type="button"
            class="enterprise-button"
            :disabled="loading || reviewLoading || applyLoading"
            @click="emit('confirm-preview')"
          >
            {{ resultPrimaryActionLabel }}
          </button>
          <button
            v-else-if="showPrimaryApplyAction"
            type="button"
            class="enterprise-button"
            :disabled="!canApply"
            @click="emit('apply-preview')"
          >
            {{ resultPrimaryActionLabel }}
          </button>
        </div>
      </section>

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
    </div>

    <section
      v-if="resultErrorRecoverySteps.length > 0"
      class="generator-result-recovery"
    >
      <strong>{{ t("app.generatorPreview.resultRecoveryTitle") }}</strong>
      <ol>
        <li
          v-for="step in resultErrorRecoverySteps"
          :key="step"
        >
          {{ step }}
        </li>
      </ol>
      <div class="generator-result-recovery-actions">
        <button
          v-if="selectedRecentSessionId"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="loading || reviewLoading || applyLoading"
          @click="emit('restore-current-result')"
        >
          {{ t("app.generatorPreview.action.restoreCurrentResult") }}
        </button>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="loading || reviewLoading || applyLoading"
          @click="emit('refresh-preview')"
        >
          {{ t("app.generatorPreview.action.regeneratePreview") }}
        </button>
      </div>
    </section>

    <section
      v-if="operationProgressMessage"
      class="generator-progress-message"
    >
      <strong>{{ operationProgressMessage.title }}</strong>
      <span>{{ operationProgressMessage.description }}</span>
    </section>

    <section
      v-if="confirmationChecklist.length > 0"
      class="generator-confirmation-checklist"
    >
      <h4>{{ t("app.generatorPreview.confirmationChecklistTitle") }}</h4>
      <ol>
        <li
          v-for="item in confirmationChecklist"
          :key="item"
        >
          {{ item }}
        </li>
      </ol>
    </section>

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
      v-if="rejectCommentRequired"
      class="enterprise-message enterprise-message-warning"
    >
      {{ t("app.generatorPreview.message.rejectCommentRequired") }}
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
        :disabled="reviewLoading || !canSubmitReject"
        @click="emit('review-preview', 'reject')"
      >
        {{
          isRejectConfirming
            ? t("app.generatorPreview.action.confirmReject")
            : t("app.generatorPreview.action.reject")
        }}
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
        v-if="selectedRecentSessionId"
        type="button"
        class="enterprise-button enterprise-button-ghost"
        :disabled="loading || reviewLoading || applyLoading"
        @click="emit('restore-current-result')"
      >
        {{ t("app.generatorPreview.action.restoreCurrentResult") }}
      </button>
      <button
        type="button"
        class="enterprise-button enterprise-button-ghost"
        :disabled="loading || reviewLoading || applyLoading"
        @click="emit('refresh-preview')"
      >
        {{ t("app.generatorPreview.action.regeneratePreview") }}
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

.generator-panel-copy {
  display: grid;
  gap: 0.25rem;
}

.generator-panel-eyebrow {
  margin: 0;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.generator-panel-title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
}

.generator-panel-description {
  margin: 0;
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.55;
}

.generator-inline-field {
  display: grid;
  gap: 0.35rem;
}

.generator-session-select {
  min-width: min(18rem, 100%);
  flex: 1 1 15rem;
}

.generator-result-summary {
  display: grid;
  gap: 0.8rem;
}

.generator-result-verdict,
.generator-next-step-card {
  display: grid;
  gap: 0.35rem;
  padding: 0.95rem 1rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.92);
}

.generator-result-verdict {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-result-verdict-warning {
  border-color: rgba(180, 83, 9, 0.22);
  background: rgba(245, 158, 11, 0.1);
}

.generator-result-verdict-info {
  border-color: rgba(36, 87, 214, 0.18);
  background: rgba(36, 87, 214, 0.05);
}

.generator-result-verdict-success {
  border-color: rgba(5, 150, 105, 0.2);
  background: rgba(16, 185, 129, 0.08);
}

.generator-result-verdict-label,
.generator-next-step-copy span {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.generator-result-verdict strong,
.generator-next-step-copy strong {
  color: #0f172a;
  font-size: 0.94rem;
  line-height: 1.5;
}

.generator-result-verdict p {
  margin: 0;
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.55;
}

.generator-next-step-card {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.8rem 1rem;
  border: 1px dashed rgba(36, 87, 214, 0.24);
  background: rgba(255, 255, 255, 0.86);
}

.generator-next-step-copy {
  display: grid;
  gap: 0.18rem;
}

.generator-next-step-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem;
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

.generator-empty-result {
  display: grid;
  gap: 0.28rem;
  padding: 0.8rem 0.9rem;
  border: 1px dashed rgba(15, 23, 42, 0.14);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.74);
}

.generator-empty-result strong {
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 700;
}

.generator-empty-result span {
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.45;
}

.generator-confirmation-checklist {
  display: grid;
  gap: 0.55rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid rgba(36, 87, 214, 0.14);
  border-radius: 6px;
  background: rgba(36, 87, 214, 0.05);
}

.generator-progress-message {
  display: grid;
  gap: 0.28rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid rgba(36, 87, 214, 0.14);
  border-radius: 6px;
  background: rgba(36, 87, 214, 0.05);
}

.generator-progress-message strong {
  color: #173ea6;
  font-size: 0.82rem;
  font-weight: 700;
}

.generator-progress-message span {
  color: #475569;
  font-size: 0.77rem;
  line-height: 1.45;
}

.generator-result-recovery {
  display: grid;
  gap: 0.42rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.82);
}

.generator-result-recovery strong {
  color: #0f172a;
  font-size: 0.81rem;
  font-weight: 700;
}

.generator-result-recovery ol {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding-left: 1.1rem;
  color: #475569;
  font-size: 0.78rem;
  line-height: 1.45;
}

.generator-result-recovery-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.generator-confirmation-checklist h4 {
  margin: 0;
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 700;
}

.generator-confirmation-checklist ol {
  display: grid;
  gap: 0.38rem;
  margin: 0;
  padding-left: 1.2rem;
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.45;
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
  justify-content: flex-end;
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

  .generator-next-step-card {
    grid-template-columns: minmax(0, 1fr);
  }

  .generator-next-step-actions {
    justify-content: stretch;
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
