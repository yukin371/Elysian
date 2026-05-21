<script setup lang="ts">
import { onBeforeUnmount } from "vue"

import GeneratorPreviewWorkspaceCurrentResultPanel from "./GeneratorPreviewWorkspaceCurrentResultPanel.vue"
import GeneratorPreviewWorkspaceDraftStartPanel from "./GeneratorPreviewWorkspaceDraftStartPanel.vue"
import GeneratorPreviewWorkspaceResultListSection from "./GeneratorPreviewWorkspaceResultListSection.vue"
import { useGeneratorPreviewCopyFeedback } from "./use-generator-preview-copy-feedback"
import type {
  GeneratorPreviewWorkspaceMainEmit,
  GeneratorPreviewWorkspaceMainProps,
} from "./use-generator-preview-workspace-main-state"
import { useGeneratorPreviewWorkspaceMainState } from "./use-generator-preview-workspace-main-state"

const props = defineProps<GeneratorPreviewWorkspaceMainProps>()
const emit = defineEmits<GeneratorPreviewWorkspaceMainEmit>()

const {
  canPatchDraftMeta,
  canSubmitReject,
  confirmationChecklist,
  confirmationEvidenceFacts,
  confirmationEvidenceSummary,
  cancelApplyConfirmation,
  cancelRejectConfirmation,
  blockedFileCount,
  blockerReasonMessages,
  configPrimaryActionLabel,
  configErrorRecoverySteps,
  conflictStrategyCards,
  currentStateMessage,
  deliveryBoundaryDescription,
  deliveryBoundaryFacts,
  deliveryBoundaryTitle,
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
  handleConfirmPreview,
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
  hasCurrentResult,
  hasRecentSessions,
  hiddenReferenceSchemaCount,
  isApplyConfirming,
  isRejectConfirming,
  operationProgressMessage,
  pendingManualIntegrationStepCount,
  firstPendingManualIntegrationStep,
  referenceSchemaQuery,
  recoveryStatusMessage,
  rejectCommentRequired,
  resultErrorRecoverySteps,
  resultPrimaryActionLabel,
  prioritizedReviewEvidenceFilePath,
  reviewComment,
  schemaEditorFacts,
  schemaTemplates,
  selectedTemplateId,
  showApplyAction,
  showConfirmAction,
  showFileList,
  showFileTools,
  showPrimaryHandoffCommandsAction,
  showPrimaryReviewEvidenceAction,
  showReviewActions,
  showReviewCommentInput,
  showSchemaEditor,
  statusFacts,
} = useGeneratorPreviewWorkspaceMainState(props, emit)

const {
  copySuggestedCommandsByKey,
  disposeCopyFeedbackTimers,
  resolveCopyLabel,
} = useGeneratorPreviewCopyFeedback(props.t)

const handleCopyHandoffCommands = async () => {
  await copySuggestedCommandsByKey(
    props.sqlProposalHandoff?.suggestedCommands ?? [],
  )
}

onBeforeUnmount(() => {
  disposeCopyFeedbackTimers()
})
</script>

<template>
  <GeneratorPreviewWorkspaceDraftStartPanel
    :t="t"
    :loading="loading"
    :review-loading="reviewLoading"
    :apply-loading="applyLoading"
    :error-message="errorMessage"
    :selected-schema-name="selectedSchemaName"
    :selected-frontend-target="selectedFrontendTarget"
    :selected-conflict-strategy="selectedConflictStrategy"
    :manual-schema-draft="manualSchemaDraft"
    :manual-schema-draft-error="manualSchemaDraftError"
    :manual-schema-draft-error-details="manualSchemaDraftErrorDetails"
    :manual-schema-draft-error-suggestion="manualSchemaDraftErrorSuggestion"
    :draft-module-name="draftModuleName"
    :draft-module-label="draftModuleLabel"
    :can-patch-draft-meta="canPatchDraftMeta"
    :draft-source-mode="draftSourceMode"
    :selected-template-id="selectedTemplateId"
    :reference-schema-query="referenceSchemaQuery"
    :filtered-reference-schema-options="filteredReferenceSchemaOptions"
    :hidden-reference-schema-count="hiddenReferenceSchemaCount"
    :frontend-option-cards="frontendOptionCards"
    :conflict-strategy-cards="conflictStrategyCards"
    :draft-source-mode-options="draftSourceModeOptions"
    :schema-templates="schemaTemplates"
    :config-primary-action-label="configPrimaryActionLabel"
    :config-error-recovery-steps="configErrorRecoverySteps"
    :show-schema-editor="showSchemaEditor"
    :schema-editor-facts="schemaEditorFacts"
    :draft-summary-facts="draftSummaryFacts"
    @module-name-input="handleModuleNameInput"
    @module-label-input="handleModuleLabelInput"
    @draft-source-mode-change="handleDraftSourceModeChange"
    @load-schema-template="handleLoadSchemaTemplate"
    @reference-schema-query-input="handleReferenceSchemaQueryInput"
    @load-reference-schema-draft="handleLoadReferenceSchemaDraft"
    @frontend-change="handleFrontendChange"
    @conflict-strategy-change="handleConflictStrategyChange"
    @refresh-preview="handleRefreshPreview"
    @schema-editor-toggle="handleSchemaEditorToggle"
    @manual-schema-draft-input="handleManualSchemaDraftInput"
  />

  <GeneratorPreviewWorkspaceCurrentResultPanel
    :t="t"
    :loading="loading"
    :review-loading="reviewLoading"
    :apply-loading="applyLoading"
    :has-current-result="hasCurrentResult"
    :has-recent-sessions="hasRecentSessions"
    :recent-session-options="recentSessionOptions"
    :selected-recent-session-id="selectedRecentSessionId"
    :status-facts="statusFacts"
    :current-state-message="currentStateMessage"
    :operation-progress-message="operationProgressMessage"
    :blocked-file-count="blockedFileCount"
    :blocker-reason-messages="blockerReasonMessages"
    :first-blocked-file-path="firstBlockedFilePath"
    :recovery-status-message="recoveryStatusMessage"
    :result-error-recovery-steps="resultErrorRecoverySteps"
    :confirmation-checklist="confirmationChecklist"
    :confirmation-evidence-summary="confirmationEvidenceSummary"
    :confirmation-evidence-facts="confirmationEvidenceFacts"
    :delivery-boundary-title="deliveryBoundaryTitle"
    :delivery-boundary-description="deliveryBoundaryDescription"
    :delivery-boundary-facts="deliveryBoundaryFacts"
    :pending-manual-integration-step-count="pendingManualIntegrationStepCount"
    :first-pending-manual-integration-step="firstPendingManualIntegrationStep"
    :show-primary-handoff-commands-action="showPrimaryHandoffCommandsAction"
    :handoff-commands-copy-label="
      resolveCopyLabel(
        'commands',
        'app.generatorPreview.action.copyHandoffCommands',
      )
    "
    :show-review-comment-input="showReviewCommentInput"
    :review-comment="reviewComment"
    :reject-comment-required="rejectCommentRequired"
    :review-evidence="reviewEvidence"
    :apply-evidence="applyEvidence"
    :show-review-actions="showReviewActions"
    :show-primary-review-evidence-action="showPrimaryReviewEvidenceAction"
    :primary-review-evidence-file-path="prioritizedReviewEvidenceFilePath"
    :is-reject-confirming="isRejectConfirming"
    :can-reject="canReject"
    :can-submit-reject="canSubmitReject"
    :can-approve="canApprove"
    :show-confirm-action="showConfirmAction"
    :can-confirm="canConfirm"
    :show-apply-action="showApplyAction"
    :is-apply-confirming="isApplyConfirming"
    :can-apply="canApply"
    :result-primary-action-label="resultPrimaryActionLabel"
    @recent-session-change="handleRecentSessionChange"
    @restore-current-result="handleRestoreCurrentResult"
    @refresh-preview="handleRefreshPreview"
    @review-comment-input="handleReviewCommentInput"
    @cancel-reject-confirm="cancelRejectConfirmation"
    @review-preview="handleReviewPreview"
    @cancel-apply-confirm="cancelApplyConfirmation"
    @confirm-preview="handleConfirmPreview"
    @apply-preview="handleApplyPreview"
    @copy-handoff-commands="handleCopyHandoffCommands"
    @select-file="handleFileSelection"
  />

  <GeneratorPreviewWorkspaceResultListSection
    v-if="showFileList"
    :t="t"
    :loading="loading"
    :show-file-tools="showFileTools"
    :query="query"
    :files="files"
    :selected-file-path="selectedFilePath"
    @query-input="handleQueryInput"
    @select-file="handleFileSelection"
  />
</template>
