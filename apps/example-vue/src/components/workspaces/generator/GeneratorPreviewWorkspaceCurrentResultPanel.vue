<script setup lang="ts">
import { computed } from "vue"

import { Select as TSelect } from "tdesign-vue-next/es/select"
import { Textarea as TTextarea } from "tdesign-vue-next/es/textarea"

import type { GeneratorPreviewConfirmationEvidenceFact } from "./generator-preview-confirmation-evidence"
import { formatGeneratorPreviewDateTime } from "./generator-preview-main-state-facts"
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

interface GeneratorDeliveryBoundaryFact {
  label: string
  value: string
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
  blockerReasonMessages: string[]
  firstBlockedFilePath: string | null
  recoveryStatusMessage: string | null
  resultErrorRecoverySteps: string[]
  confirmationChecklist: string[]
  confirmationEvidenceSummary: string | null
  confirmationEvidenceFacts: GeneratorPreviewConfirmationEvidenceFact[]
  deliveryBoundaryTitle: string
  deliveryBoundaryDescription: string | null
  deliveryBoundaryFacts: GeneratorDeliveryBoundaryFact[]
  pendingManualIntegrationStepCount: number
  firstPendingManualIntegrationStep: string | null
  showPrimaryHandoffCommandsAction: boolean
  handoffCommandsCopyLabel: string
  showReviewCommentInput: boolean
  reviewComment: string
  rejectCommentRequired: boolean
  reviewEvidence: GeneratorPreviewReviewEvidence | null
  applyEvidence: GeneratorPreviewApplyEvidence | null
  showReviewActions: boolean
  showPrimaryReviewEvidenceAction: boolean
  primaryReviewEvidenceFilePath: string | null
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
  (e: "copy-handoff-commands"): void
  (e: "select-file", value: string): void
}>()

const reviewedAtLabel = computed(() =>
  formatGeneratorPreviewDateTime(props.reviewEvidence?.reviewedAt),
)
const appliedAtLabel = computed(() =>
  formatGeneratorPreviewDateTime(props.applyEvidence?.appliedAt),
)
const reviewEvidenceFacts = computed(() => {
  if (!props.reviewEvidence) {
    return []
  }

  return [
    {
      label: props.t("app.generatorPreview.meta.reviewedAt"),
      value: reviewedAtLabel.value,
    },
    {
      label: props.t("app.generatorPreview.meta.reviewDecision"),
      value:
        props.reviewEvidence.decision === "approve"
          ? props.t("app.generatorPreview.action.approve")
          : props.t("app.generatorPreview.action.reject"),
    },
    {
      label: props.t("app.generatorPreview.meta.reviewedBy"),
      value:
        props.reviewEvidence.actorDisplayName ??
        props.reviewEvidence.actorUsername ??
        props.reviewEvidence.actorUserId ??
        "-",
    },
  ]
})
const applyEvidenceFacts = computed(() => {
  if (!props.applyEvidence) {
    return []
  }

  return [
    {
      label: props.t("app.generatorPreview.meta.appliedAt"),
      value: appliedAtLabel.value,
    },
    {
      label: props.t("app.generatorPreview.meta.appliedBy"),
      value:
        props.applyEvidence.actorDisplayName ??
        props.applyEvidence.actorUsername ??
        props.applyEvidence.actorUserId ??
        "-",
    },
    {
      label: props.t("app.generatorPreview.meta.requestId"),
      value: props.applyEvidence.requestId || "-",
    },
    {
      label: props.t("app.generatorPreview.meta.manifestPath"),
      value: props.applyEvidence.manifestPath || "-",
    },
  ]
})
const showEvidenceSection = computed(
  () =>
    reviewEvidenceFacts.value.length > 0 ||
    Boolean(props.confirmationEvidenceSummary) ||
    props.confirmationEvidenceFacts.length > 0 ||
    applyEvidenceFacts.value.length > 0,
)
const showDeliveryBoundarySection = computed(
  () =>
    Boolean(props.deliveryBoundaryDescription) ||
    props.deliveryBoundaryFacts.length > 0,
)
const showHandoffPendingSection = computed(
  () =>
    Boolean(props.applyEvidence) && props.pendingManualIntegrationStepCount > 0,
)

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
        value: reviewedAtLabel.value,
      },
    )
  }

  if (props.applyEvidence) {
    return props.t("app.generatorPreview.message.applied", {
      value: appliedAtLabel.value,
    })
  }

  return props.t("app.generatorPreview.verdict.idleDescription")
})

const nextStepTitle = computed(() => {
  if (props.blockedFileCount > 0) {
    return props.t("app.generatorPreview.next.resolveConflicts")
  }

  if (props.showPrimaryReviewEvidenceAction) {
    return props.t("app.generatorPreview.next.reviewEvidence")
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

  if (showHandoffPendingSection.value) {
    return props.t("app.generatorPreview.next.handoff")
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

  if (props.showPrimaryReviewEvidenceAction) {
    return props.t("app.generatorPreview.nextSummary.reviewEvidence")
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

  if (showHandoffPendingSection.value) {
    return props.t("app.generatorPreview.nextSummary.handoff")
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
    !props.showPrimaryReviewEvidenceAction &&
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
    props.showPrimaryReviewEvidenceAction ||
    showPrimaryReviewAction.value ||
    showPrimaryConfirmAction.value ||
    showPrimaryApplyAction.value ||
    props.showPrimaryHandoffCommandsAction,
)

const showChecklistStage = computed(
  () => props.showConfirmAction || props.showApplyAction,
)

const checklistVerdictTitle = computed(() => {
  if (props.blockedFileCount > 0) {
    return props.t("app.generatorPreview.applyChecklist.blockedTitle")
  }

  if (props.showConfirmAction) {
    return props.t("app.generatorPreview.applyChecklist.pendingTitle")
  }

  if (props.showApplyAction && !props.canApply) {
    return props.t("app.generatorPreview.applyChecklist.notReadyTitle")
  }

  if (props.showApplyAction) {
    return props.t("app.generatorPreview.applyChecklist.readyTitle")
  }

  return props.t("app.generatorPreview.applyChecklist.idleTitle")
})

const checklistVerdictDescription = computed(() => {
  if (props.blockedFileCount > 0) {
    return props.t("app.generatorPreview.applyChecklist.blockedDescription")
  }

  if (props.showConfirmAction) {
    return props.t("app.generatorPreview.applyChecklist.pendingDescription")
  }

  if (props.showApplyAction && !props.canApply) {
    return props.t("app.generatorPreview.applyChecklist.notReadyDescription")
  }

  if (props.showApplyAction) {
    return props.t("app.generatorPreview.applyChecklist.readyDescription")
  }

  return props.t("app.generatorPreview.applyChecklist.idleDescription")
})

const checklistRiskTitle = computed(() => {
  if (props.blockedFileCount > 0) {
    return props.t("app.generatorPreview.applyChecklist.riskBlockedTitle")
  }

  if (props.showConfirmAction) {
    return props.t("app.generatorPreview.applyChecklist.riskConfirmTitle")
  }

  if (props.showApplyAction) {
    return props.t("app.generatorPreview.applyChecklist.riskApplyTitle")
  }

  return props.t("app.generatorPreview.applyChecklist.riskIdleTitle")
})

const checklistRiskDescription = computed(() => {
  if (props.blockedFileCount > 0) {
    return props.t("app.generatorPreview.applyChecklist.riskBlockedDescription")
  }

  if (props.showConfirmAction) {
    return props.t("app.generatorPreview.applyChecklist.riskConfirmDescription")
  }

  if (props.showApplyAction) {
    return props.t("app.generatorPreview.applyChecklist.riskApplyDescription")
  }

  return props.t("app.generatorPreview.applyChecklist.riskIdleDescription")
})
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
          :input-props="{ name: 'generator-preview-recent-session' }"
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
            v-else-if="
              showPrimaryReviewEvidenceAction && primaryReviewEvidenceFilePath
            "
            type="button"
            class="enterprise-button"
            :disabled="loading || reviewLoading || applyLoading"
            @click="emit('select-file', primaryReviewEvidenceFilePath)"
          >
            {{ t("app.generatorPreview.action.reviewPrimaryEvidence") }}
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
          <button
            v-else-if="showPrimaryHandoffCommandsAction"
            type="button"
            class="enterprise-button"
            @click="emit('copy-handoff-commands')"
          >
            {{ handoffCommandsCopyLabel }}
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
      v-if="blockerReasonMessages.length > 0"
      class="generator-result-recovery"
    >
      <strong>{{ t("app.generatorPreview.blockerReasonTitle") }}</strong>
      <ol>
        <li
          v-for="reason in blockerReasonMessages"
          :key="reason"
        >
          {{ reason }}
        </li>
      </ol>
    </section>

    <div
      v-if="recoveryStatusMessage"
      class="enterprise-message enterprise-message-info"
    >
      {{ recoveryStatusMessage }}
    </div>

    <section
      v-if="operationProgressMessage"
      class="generator-progress-message"
    >
      <strong>{{ operationProgressMessage.title }}</strong>
      <span>{{ operationProgressMessage.description }}</span>
    </section>

    <section
      v-if="showEvidenceSection"
      class="generator-evidence-summary"
    >
      <strong>{{ t("app.generatorPreview.evidenceTitle") }}</strong>

      <article
        v-if="reviewEvidenceFacts.length > 0"
        class="generator-evidence-card"
      >
        <span>{{ t("app.generatorPreview.evidence.reviewTitle") }}</span>
        <div class="generator-evidence-facts">
          <p
            v-for="fact in reviewEvidenceFacts"
            :key="fact.label"
          >
            {{ fact.label }} · {{ fact.value }}
          </p>
        </div>
        <p
          v-if="reviewEvidence?.comment"
          class="generator-evidence-note"
        >
          {{ reviewEvidence.comment }}
        </p>
      </article>

      <article
        v-if="confirmationEvidenceSummary || confirmationEvidenceFacts.length > 0"
        class="generator-evidence-card"
      >
        <span>{{ t("app.generatorPreview.evidence.confirmTitle") }}</span>
        <p
          v-if="confirmationEvidenceSummary"
          class="generator-evidence-note"
        >
          {{ confirmationEvidenceSummary }}
        </p>
        <div
          v-if="confirmationEvidenceFacts.length > 0"
          class="generator-evidence-facts"
        >
          <p
            v-for="fact in confirmationEvidenceFacts"
            :key="fact.label"
          >
            {{ fact.label }} · {{ fact.value }}
          </p>
        </div>
      </article>

      <article
        v-if="applyEvidenceFacts.length > 0"
        class="generator-evidence-card"
      >
        <span>{{ t("app.generatorPreview.evidence.applyTitle") }}</span>
        <div class="generator-evidence-facts">
          <p
            v-for="fact in applyEvidenceFacts"
            :key="fact.label"
          >
            {{ fact.label }} · {{ fact.value }}
          </p>
        </div>
      </article>
    </section>

    <section
      v-if="showDeliveryBoundarySection"
      class="generator-delivery-boundary"
    >
      <strong>{{ deliveryBoundaryTitle }}</strong>
      <p v-if="deliveryBoundaryDescription">
        {{ deliveryBoundaryDescription }}
      </p>
      <div
        v-if="deliveryBoundaryFacts.length > 0"
        class="generator-evidence-facts"
      >
        <p
          v-for="fact in deliveryBoundaryFacts"
          :key="fact.label"
        >
          {{ fact.label }} · {{ fact.value }}
        </p>
      </div>
    </section>

    <section
      v-if="showHandoffPendingSection"
      class="generator-handoff-pending"
    >
      <strong>{{ t("app.generatorPreview.handoffPendingTitle") }}</strong>
      <p>
        {{
          t("app.generatorPreview.handoffPendingCount", {
            count: pendingManualIntegrationStepCount,
          })
        }}
      </p>
      <p v-if="firstPendingManualIntegrationStep">
        {{
          t("app.generatorPreview.handoffPendingFirstStep", {
            value: firstPendingManualIntegrationStep,
          })
        }}
      </p>
    </section>

    <section
      v-if="confirmationChecklist.length > 0"
      class="generator-confirmation-checklist"
    >
      <div
        v-if="showChecklistStage"
        class="generator-checklist-intro"
      >
        <div class="generator-checklist-verdict">
          <span>{{ t("app.generatorPreview.applyChecklist.verdictLabel") }}</span>
          <strong>{{ checklistVerdictTitle }}</strong>
          <p>{{ checklistVerdictDescription }}</p>
        </div>
        <div class="generator-checklist-risk">
          <span>{{ t("app.generatorPreview.applyChecklist.riskLabel") }}</span>
          <strong>{{ checklistRiskTitle }}</strong>
          <p>{{ checklistRiskDescription }}</p>
        </div>
      </div>
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

.generator-checklist-intro {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.generator-checklist-verdict,
.generator-checklist-risk {
  display: grid;
  gap: 0.18rem;
  padding: 0.8rem 0.85rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.88);
}

.generator-checklist-verdict {
  border: 1px solid rgba(36, 87, 214, 0.16);
}

.generator-checklist-risk {
  border: 1px solid rgba(180, 83, 9, 0.16);
}

.generator-checklist-verdict span,
.generator-checklist-risk span {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.generator-checklist-verdict strong,
.generator-checklist-risk strong {
  color: #0f172a;
  font-size: 0.84rem;
  line-height: 1.45;
}

.generator-checklist-verdict p,
.generator-checklist-risk p {
  margin: 0;
  color: #475569;
  font-size: 0.77rem;
  line-height: 1.5;
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

.generator-evidence-summary {
  display: grid;
  gap: 0.6rem;
  padding: 0.85rem 0.9rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
}

.generator-evidence-summary > strong {
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 700;
}

.generator-evidence-card {
  display: grid;
  gap: 0.38rem;
  padding: 0.8rem 0.85rem;
  border: 1px solid rgba(36, 87, 214, 0.12);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.72);
}

.generator-evidence-card > span {
  color: #173ea6;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.generator-evidence-facts {
  display: grid;
  gap: 0.32rem;
}

.generator-evidence-facts p,
.generator-evidence-note {
  margin: 0;
  color: #475569;
  font-size: 0.78rem;
  line-height: 1.5;
}

.generator-delivery-boundary {
  display: grid;
  gap: 0.42rem;
  padding: 0.85rem 0.9rem;
  border: 1px solid rgba(180, 83, 9, 0.14);
  border-radius: 6px;
  background: rgba(255, 247, 237, 0.72);
}

.generator-delivery-boundary strong {
  color: #9a3412;
  font-size: 0.82rem;
  font-weight: 700;
}

.generator-delivery-boundary p {
  margin: 0;
  color: #7c2d12;
  font-size: 0.78rem;
  line-height: 1.52;
}

.generator-handoff-pending {
  display: grid;
  gap: 0.42rem;
  padding: 0.85rem 0.9rem;
  border: 1px solid rgba(36, 87, 214, 0.16);
  border-radius: 6px;
  background: rgba(239, 246, 255, 0.88);
}

.generator-handoff-pending strong {
  color: #1d4ed8;
  font-size: 0.82rem;
  font-weight: 700;
}

.generator-handoff-pending p {
  margin: 0;
  color: #334155;
  font-size: 0.78rem;
  line-height: 1.52;
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

  .generator-checklist-intro {
    grid-template-columns: minmax(0, 1fr);
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
