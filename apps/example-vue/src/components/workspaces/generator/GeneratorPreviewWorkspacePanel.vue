<script setup lang="ts">
import { computed, onBeforeUnmount } from "vue"

import GeneratorPreviewWorkspaceApplyPanel from "./GeneratorPreviewWorkspaceApplyPanel.vue"
import GeneratorPreviewWorkspaceDiffSummaryPanel from "./GeneratorPreviewWorkspaceDiffSummaryPanel.vue"
import GeneratorPreviewWorkspaceFileDecisionPanel from "./GeneratorPreviewWorkspaceFileDecisionPanel.vue"
import GeneratorPreviewWorkspaceFileDiffPanel from "./GeneratorPreviewWorkspaceFileDiffPanel.vue"
import GeneratorPreviewWorkspaceReviewPanel from "./GeneratorPreviewWorkspaceReviewPanel.vue"
import GeneratorPreviewWorkspaceSessionPanel from "./GeneratorPreviewWorkspaceSessionPanel.vue"
import GeneratorPreviewWorkspaceSourcePanel from "./GeneratorPreviewWorkspaceSourcePanel.vue"
import GeneratorPreviewWorkspaceSqlHandoffPanel from "./GeneratorPreviewWorkspaceSqlHandoffPanel.vue"
import GeneratorPreviewWorkspaceSqlProposalPanel from "./GeneratorPreviewWorkspaceSqlProposalPanel.vue"
import GeneratorPreviewWorkspaceSummaryPanel from "./GeneratorPreviewWorkspaceSummaryPanel.vue"
import { resolveGeneratorPreviewConfirmationEvidenceSummary } from "./generator-preview-confirmation-evidence"
import { joinGeneratorPreviewSuggestedCommands } from "./generator-preview-handoff"
import { resolveGeneratorPreviewRecoveryNote } from "./generator-preview-recovery-note"
import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewCopyFeedbackKey,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewFileCard,
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewSessionRecord,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
  GeneratorPreviewTranslation,
} from "./types"
import { useGeneratorPreviewCopyFeedback } from "./use-generator-preview-copy-feedback"

interface GeneratorPreviewWorkspacePanelProps {
  t: GeneratorPreviewTranslation
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  selectedFile: GeneratorPreviewFileCard | null
  sqlPreview: GeneratorPreviewSqlPreview | null
  sqlProposal: GeneratorPreviewSqlProposal | null
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff | null
  session: GeneratorPreviewSessionRecord | null
  diffSummary: GeneratorPreviewDiffSummary | null
  reviewEvidence: GeneratorPreviewReviewEvidence | null
  applyEvidence: GeneratorPreviewApplyEvidence | null
}

const props = defineProps<GeneratorPreviewWorkspacePanelProps>()
const {
  copySuggestedCommandsByKey,
  copyTextByKey,
  disposeCopyFeedbackTimers,
  resolveCopyLabel,
} = useGeneratorPreviewCopyFeedback(props.t)

const selectedSourceLineCount = computed(
  () => props.selectedFile?.lineCount ?? 0,
)

const selectedActionLabel = computed(() =>
  props.selectedFile
    ? props.t(
        `app.generatorPreview.actionLabel.${props.selectedFile.plannedAction}`,
      )
    : "-",
)

const sessionStatusLabel = computed(() =>
  props.session
    ? props.t(
        props.session.status === "applied"
          ? "app.generatorPreview.status.applied"
          : props.session.status === "ready"
            ? "app.generatorPreview.status.ready"
            : props.session.status === "rejected"
              ? "app.generatorPreview.status.rejected"
              : "app.generatorPreview.status.pendingReview",
      )
    : "-",
)

const sessionActorLabel = computed(() => {
  if (!props.session) {
    return "-"
  }

  return (
    props.session.actorDisplayName ??
    props.session.actorUsername ??
    props.session.actorUserId ??
    "-"
  )
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

const sessionSourceTypeLabel = computed(() =>
  props.session?.sourceType === "registered-schema"
    ? props.t("app.generatorPreview.sourceType.registeredSchema")
    : "-",
)

const sessionConflictStrategyLabel = computed(() => {
  if (!props.session) {
    return "-"
  }

  return props.t(
    `app.generatorPreview.conflictStrategy.${props.session.conflictStrategy}`,
  )
})

const sessionConfirmedAtLabel = computed(
  () => props.session?.confirmedAt ?? "-",
)

const sessionConfirmedByLabel = computed(() => {
  if (!props.session) {
    return "-"
  }

  return (
    props.session.confirmedByDisplayName ??
    props.session.confirmedByUsername ??
    props.session.confirmedByUserId ??
    "-"
  )
})

const sessionConfirmationNote = computed(() =>
  props.session?.confirmedAt
    ? props.t("app.generatorPreview.message.confirmedReady")
    : null,
)

const confirmationEvidenceSummary = computed(() => {
  if (!props.session?.confirmedAt) {
    return null
  }

  return resolveGeneratorPreviewConfirmationEvidenceSummary(
    props.t,
    props.session.confirmationEvidence,
  )
})

const reviewActorLabel = computed(() =>
  resolveEvidenceActorLabel(props.reviewEvidence),
)

const reviewDecisionLabel = computed(() =>
  props.reviewEvidence
    ? props.t(
        props.reviewEvidence.decision === "approve"
          ? "app.generatorPreview.action.approve"
          : "app.generatorPreview.action.reject",
      )
    : "-",
)

const applyActorLabel = computed(() =>
  resolveEvidenceActorLabel(props.applyEvidence),
)

const sqlProposalStatusLabel = computed(() =>
  props.sqlProposalHandoff
    ? props.t(
        props.sqlProposalHandoff.proposalStatus === "ready"
          ? "app.generatorPreview.sqlProposal.status.ready"
          : "app.generatorPreview.sqlProposal.status.unsupported",
      )
    : "-",
)

const selectedChangeLabel = computed(() =>
  props.selectedFile
    ? props.t(
        props.selectedFile.hasChanges
          ? "app.generatorPreview.meta.changedYes"
          : "app.generatorPreview.meta.changedNo",
      )
    : "-",
)

const selectedExistsLabel = computed(() =>
  props.selectedFile
    ? props.t(
        props.selectedFile.exists
          ? "app.generatorPreview.meta.changedYes"
          : "app.generatorPreview.meta.changedNo",
      )
    : "-",
)

const selectedManagedLabel = computed(() => {
  if (
    !props.selectedFile ||
    props.selectedFile.isManaged === undefined ||
    props.selectedFile.isManaged === null
  ) {
    return "-"
  }

  return props.t(
    props.selectedFile.isManaged
      ? "app.generatorPreview.meta.changedYes"
      : "app.generatorPreview.meta.changedNo",
  )
})

const selectedDiffStats = computed(
  () =>
    props.selectedFile?.diffStats ?? {
      addedLineCount: 0,
      changedLineCount: 0,
      removedLineCount: 0,
      unchangedLineCount: 0,
    },
)

const recoveryNote = computed(() =>
  props.sqlProposalHandoff
    ? resolveGeneratorPreviewRecoveryNote(
        props.t,
        props.sqlProposalHandoff.migrationProposalSnapshotRecovery,
      )
    : null,
)

const suggestedCommandsText = computed(() =>
  props.sqlProposalHandoff
    ? joinGeneratorPreviewSuggestedCommands(
        props.sqlProposalHandoff.suggestedCommands,
      )
    : "",
)

const sqlHandoffStepsText = computed(() =>
  props.sqlProposalHandoff ? props.sqlProposalHandoff.steps.join("\n") : "",
)

const sqlHandoffConfirmationChecklistText = computed(() =>
  props.sqlProposalHandoff
    ? props.sqlProposalHandoff.confirmationChecklist.join("\n")
    : "",
)

const copyPanelValue = async (
  key: GeneratorPreviewCopyFeedbackKey,
  value: string | null | undefined,
) => copyTextByKey(key, value ?? "")

const resolveSnippetCopyLabel = (key: GeneratorPreviewCopyFeedbackKey) =>
  resolveCopyLabel(key, "app.generatorPreview.action.copySnippet")

const copySuggestedCommands = async () => {
  await copySuggestedCommandsByKey(
    props.sqlProposalHandoff?.suggestedCommands ?? [],
  )
}

const copySqlHandoffSteps = async () =>
  copyPanelValue("steps", sqlHandoffStepsText.value)

const copySqlConfirmationChecklist = async () =>
  copyPanelValue(
    "confirmationChecklist",
    sqlHandoffConfirmationChecklistText.value,
  )

const copySqlDraft = async () =>
  copyPanelValue("sqlDraft", props.sqlProposal?.sqlDraft)

const copyDrizzleImportSnippet = async () => {
  await copyPanelValue("drizzleImport", props.sqlProposal?.drizzleImportSnippet)
}

const copyDrizzleSchemaSnippet = async () => {
  await copyPanelValue("drizzleSchema", props.sqlProposal?.drizzleSchemaSnippet)
}

const copySelectedAbsolutePath = async () =>
  copyPanelValue("absolutePath", props.selectedFile?.absolutePath)

const copySessionReportPath = async () =>
  copyPanelValue("reportPath", props.session?.reportPath)

const copyGeneratedSource = async () =>
  copyPanelValue("generatedSource", props.selectedFile?.contents)

const copyCurrentSource = async () => {
  await copyPanelValue("currentSource", props.selectedFile?.currentContents)
}

const copySqlPreview = async () =>
  copyPanelValue("sqlPreview", props.sqlPreview?.contents)

const copyHandoffTargetPath = async (
  key: "schemaDir" | "drizzleDir" | "schemaIndexFile" | "persistenceIndexFile",
  path: string,
) => {
  await copyPanelValue(key, path)
}

const copySessionId = async () => copyPanelValue("sessionId", props.session?.id)

const copyManifestPath = async () => {
  await copyPanelValue("manifestPath", props.applyEvidence?.manifestPath)
}

const copyRequestId = async () =>
  copyPanelValue("requestId", props.applyEvidence?.requestId)

const copyReviewComment = async () => {
  await copyPanelValue("reviewComment", props.reviewEvidence?.comment)
}

const copyReviewActor = async () =>
  copyPanelValue("reviewActor", reviewActorLabel.value)

const copyReviewDecision = async () =>
  copyPanelValue("reviewDecision", reviewDecisionLabel.value)

const copyOutputDir = async () =>
  copyPanelValue("outputDir", props.session?.outputDir)

const copySourceValue = async () =>
  copyPanelValue("sourceValue", props.session?.sourceValue)

const copyCreatedAt = async () =>
  copyPanelValue("createdAt", props.session?.createdAt)

const copySessionActor = async () =>
  copyPanelValue("actor", sessionActorLabel.value)

const copySessionSourceType = async () =>
  copyPanelValue("sourceType", sessionSourceTypeLabel.value)

const copySessionConflictStrategy = async () =>
  copyPanelValue("conflictStrategy", sessionConflictStrategyLabel.value)

const copyDiffChangedCount = async () =>
  copyPanelValue(
    "diffChangedCount",
    String(props.diffSummary?.changedFileCount ?? 0),
  )

const copyDiffCreateCount = async () =>
  copyPanelValue(
    "diffCreateCount",
    String(props.diffSummary?.actionCounts.create ?? 0),
  )

const copyDiffOverwriteCount = async () =>
  copyPanelValue(
    "diffOverwriteCount",
    String(props.diffSummary?.actionCounts.overwrite ?? 0),
  )

const copyDiffSkipCount = async () =>
  copyPanelValue(
    "diffSkipCount",
    String(props.diffSummary?.actionCounts.skip ?? 0),
  )

const copyDiffBlockCount = async () =>
  copyPanelValue(
    "diffBlockCount",
    String(props.diffSummary?.actionCounts.block ?? 0),
  )

const copyDiffAddedLines = async () =>
  copyPanelValue(
    "diffAddedLines",
    String(selectedDiffStats.value.addedLineCount),
  )

const copyDiffRemovedLines = async () =>
  copyPanelValue(
    "diffRemovedLines",
    String(selectedDiffStats.value.removedLineCount),
  )

const copyDiffUnchangedLines = async () =>
  copyPanelValue(
    "diffUnchangedLines",
    String(selectedDiffStats.value.unchangedLineCount),
  )

const copyProposalStatus = async () =>
  copyPanelValue("proposalStatus", sqlProposalStatusLabel.value)

const copyCanonicalOwner = async () =>
  copyPanelValue(
    "canonicalOwner",
    props.sqlProposalHandoff?.canonicalMigrationOwner,
  )

const copyMigrationProposalSnapshotPath = async () =>
  copyPanelValue(
    "migrationProposalSnapshotPath",
    props.sqlProposalHandoff?.migrationProposalSnapshotPath,
  )

const copyReviewMode = async () =>
  copyPanelValue("reviewMode", props.sqlProposalHandoff?.reviewMode)

const copyUnsupportedReason = async () =>
  copyPanelValue(
    "unsupportedReason",
    props.sqlProposalHandoff?.unsupportedReason,
  )

const copyReviewedAt = async () =>
  copyPanelValue("reviewedAt", props.reviewEvidence?.reviewedAt)

const copyAppliedAt = async () =>
  copyPanelValue("appliedAt", props.applyEvidence?.appliedAt)

const copyApplyActor = async () =>
  copyPanelValue("applyActor", applyActorLabel.value)

const copySelectedSchemaName = async () =>
  copyPanelValue("schemaName", props.selectedSchemaName)

const copySelectedFrontendTarget = async () =>
  copyPanelValue("frontendTarget", props.selectedFrontendTarget)

const copySessionStatus = async () =>
  copyPanelValue("status", sessionStatusLabel.value)

const copySelectedLineCount = async () =>
  copyPanelValue("lineCount", String(selectedSourceLineCount.value))

const copySelectedMergeStrategy = async () =>
  copyPanelValue("mergeStrategy", props.selectedFile?.mergeStrategy)

const copySelectedFileAction = async () =>
  copyPanelValue("fileAction", selectedActionLabel.value)

const copySelectedChanged = async () =>
  copyPanelValue("changed", selectedChangeLabel.value)

const copySelectedExists = async () =>
  copyPanelValue("exists", selectedExistsLabel.value)

const copySelectedManaged = async () =>
  copyPanelValue("managed", selectedManagedLabel.value)

const copyTemplateReason = async () =>
  copyPanelValue("templateReason", props.selectedFile?.reason)

const copyPlannedReason = async () =>
  copyPanelValue("plannedReason", props.selectedFile?.plannedReason)

onBeforeUnmount(disposeCopyFeedbackTimers)
</script>

<template>
  <section class="enterprise-card">
    <GeneratorPreviewWorkspaceSummaryPanel
      :t="t"
      :selected-file="selectedFile"
      :selected-schema-name="selectedSchemaName"
      :selected-frontend-target="selectedFrontendTarget"
      :session-status-label="sessionStatusLabel"
      :selected-source-line-count="selectedSourceLineCount"
      :selected-action-label="selectedActionLabel"
      :selected-change-label="selectedChangeLabel"
      :schema-name-copy-label="resolveSnippetCopyLabel('schemaName')"
      :frontend-target-copy-label="resolveSnippetCopyLabel('frontendTarget')"
      :status-copy-label="resolveSnippetCopyLabel('status')"
      :line-count-copy-label="resolveSnippetCopyLabel('lineCount')"
      :merge-strategy-copy-label="resolveSnippetCopyLabel('mergeStrategy')"
      :file-action-copy-label="resolveSnippetCopyLabel('fileAction')"
      :changed-copy-label="resolveSnippetCopyLabel('changed')"
      :recovery-note-text="recoveryNote?.text ?? null"
      :recovery-note-tone="recoveryNote?.tone ?? null"
      @copy-schema-name="copySelectedSchemaName"
      @copy-frontend-target="copySelectedFrontendTarget"
      @copy-status="copySessionStatus"
      @copy-line-count="copySelectedLineCount"
      @copy-merge-strategy="copySelectedMergeStrategy"
      @copy-file-action="copySelectedFileAction"
      @copy-changed="copySelectedChanged"
    />

    <GeneratorPreviewWorkspaceFileDecisionPanel
      v-if="selectedFile"
      :t="t"
      :selected-file="selectedFile"
      :selected-exists-label="selectedExistsLabel"
      :selected-managed-label="selectedManagedLabel"
      :absolute-path-copy-label="resolveSnippetCopyLabel('absolutePath')"
      :exists-copy-label="resolveSnippetCopyLabel('exists')"
      :managed-copy-label="resolveSnippetCopyLabel('managed')"
      :template-reason-copy-label="resolveSnippetCopyLabel('templateReason')"
      :planned-reason-copy-label="resolveSnippetCopyLabel('plannedReason')"
      @copy-absolute-path="copySelectedAbsolutePath"
      @copy-exists="copySelectedExists"
      @copy-managed="copySelectedManaged"
      @copy-template-reason="copyTemplateReason"
      @copy-planned-reason="copyPlannedReason"
    />

    <div v-if="session" class="enterprise-panel-stack">
      <GeneratorPreviewWorkspaceSessionPanel
        :t="t"
        :session="session"
        :session-actor-label="sessionActorLabel"
        :session-source-type-label="sessionSourceTypeLabel"
        :session-conflict-strategy-label="sessionConflictStrategyLabel"
        :session-confirmed-at-label="sessionConfirmedAtLabel"
        :session-confirmed-by-label="sessionConfirmedByLabel"
        :session-confirmation-note="sessionConfirmationNote"
        :confirmation-evidence-summary="confirmationEvidenceSummary"
        :report-path-copy-label="resolveSnippetCopyLabel('reportPath')"
        :session-id-copy-label="resolveSnippetCopyLabel('sessionId')"
        :created-at-copy-label="resolveSnippetCopyLabel('createdAt')"
        :actor-copy-label="resolveSnippetCopyLabel('actor')"
        :output-dir-copy-label="resolveSnippetCopyLabel('outputDir')"
        :source-type-copy-label="resolveSnippetCopyLabel('sourceType')"
        :source-value-copy-label="resolveSnippetCopyLabel('sourceValue')"
        :conflict-strategy-copy-label="
          resolveSnippetCopyLabel('conflictStrategy')
        "
        @copy-report-path="copySessionReportPath"
        @copy-session-id="copySessionId"
        @copy-created-at="copyCreatedAt"
        @copy-actor="copySessionActor"
        @copy-output-dir="copyOutputDir"
        @copy-source-type="copySessionSourceType"
        @copy-source-value="copySourceValue"
        @copy-conflict-strategy="copySessionConflictStrategy"
      />

      <GeneratorPreviewWorkspaceDiffSummaryPanel
        v-if="diffSummary"
        :t="t"
        :diff-summary="diffSummary"
        :changed-count-copy-label="resolveSnippetCopyLabel('diffChangedCount')"
        :create-count-copy-label="resolveSnippetCopyLabel('diffCreateCount')"
        :overwrite-count-copy-label="
          resolveSnippetCopyLabel('diffOverwriteCount')
        "
        :skip-count-copy-label="resolveSnippetCopyLabel('diffSkipCount')"
        :block-count-copy-label="resolveSnippetCopyLabel('diffBlockCount')"
        @copy-changed-count="copyDiffChangedCount"
        @copy-create-count="copyDiffCreateCount"
        @copy-overwrite-count="copyDiffOverwriteCount"
        @copy-skip-count="copyDiffSkipCount"
        @copy-block-count="copyDiffBlockCount"
      />

      <GeneratorPreviewWorkspaceFileDiffPanel
        v-if="selectedFile"
        :t="t"
        :selected-diff-stats="selectedDiffStats"
        :added-lines-copy-label="resolveSnippetCopyLabel('diffAddedLines')"
        :removed-lines-copy-label="resolveSnippetCopyLabel('diffRemovedLines')"
        :unchanged-lines-copy-label="
          resolveSnippetCopyLabel('diffUnchangedLines')
        "
        @copy-added-lines="copyDiffAddedLines"
        @copy-removed-lines="copyDiffRemovedLines"
        @copy-unchanged-lines="copyDiffUnchangedLines"
      />

      <GeneratorPreviewWorkspaceReviewPanel
        v-if="reviewEvidence"
        :t="t"
        :review-evidence="reviewEvidence"
        :review-actor-label="reviewActorLabel"
        :review-decision-label="reviewDecisionLabel"
        :reviewed-at-copy-label="resolveSnippetCopyLabel('reviewedAt')"
        :review-actor-copy-label="resolveSnippetCopyLabel('reviewActor')"
        :review-decision-copy-label="
          resolveSnippetCopyLabel('reviewDecision')
        "
        :review-comment-copy-label="resolveSnippetCopyLabel('reviewComment')"
        @copy-reviewed-at="copyReviewedAt"
        @copy-review-actor="copyReviewActor"
        @copy-review-decision="copyReviewDecision"
        @copy-review-comment="copyReviewComment"
      />

      <GeneratorPreviewWorkspaceApplyPanel
        v-if="applyEvidence"
        :t="t"
        :apply-evidence="applyEvidence"
        :apply-actor-label="applyActorLabel"
        :applied-at-copy-label="resolveSnippetCopyLabel('appliedAt')"
        :apply-actor-copy-label="resolveSnippetCopyLabel('applyActor')"
        :manifest-path-copy-label="resolveSnippetCopyLabel('manifestPath')"
        :request-id-copy-label="resolveSnippetCopyLabel('requestId')"
        @copy-applied-at="copyAppliedAt"
        @copy-apply-actor="copyApplyActor"
        @copy-manifest-path="copyManifestPath"
        @copy-request-id="copyRequestId"
      />

      <GeneratorPreviewWorkspaceSqlProposalPanel
        v-if="sqlProposalHandoff"
        :t="t"
        :sql-proposal="sqlProposal"
        :sql-proposal-handoff="sqlProposalHandoff"
        :proposal-status-label="sqlProposalStatusLabel"
        :proposal-status-copy-label="
          resolveSnippetCopyLabel('proposalStatus')
        "
        :canonical-owner-copy-label="resolveSnippetCopyLabel('canonicalOwner')"
        :review-mode-copy-label="resolveSnippetCopyLabel('reviewMode')"
        :unsupported-reason-copy-label="
          resolveSnippetCopyLabel('unsupportedReason')
        "
        :sql-draft-copy-label="resolveSnippetCopyLabel('sqlDraft')"
        :drizzle-import-copy-label="resolveSnippetCopyLabel('drizzleImport')"
        :drizzle-schema-copy-label="resolveSnippetCopyLabel('drizzleSchema')"
        @copy-proposal-status="copyProposalStatus"
        @copy-canonical-owner="copyCanonicalOwner"
        @copy-review-mode="copyReviewMode"
        @copy-unsupported-reason="copyUnsupportedReason"
        @copy-sql-draft="copySqlDraft"
        @copy-drizzle-import="copyDrizzleImportSnippet"
        @copy-drizzle-schema="copyDrizzleSchemaSnippet"
      />

      <GeneratorPreviewWorkspaceSqlHandoffPanel
        v-if="sqlProposalHandoff"
        :t="t"
        :sql-proposal-handoff="sqlProposalHandoff"
        :recovery-note-text="recoveryNote?.text ?? null"
        :recovery-note-tone="recoveryNote?.tone ?? null"
        :session-confirmed-at-label="sessionConfirmedAtLabel"
        :session-confirmed-by-label="sessionConfirmedByLabel"
        :session-confirmation-note="sessionConfirmationNote"
        :suggested-commands-text="suggestedCommandsText"
        :commands-copy-label="
          resolveCopyLabel(
            'commands',
            'app.generatorPreview.action.copyCommands',
          )
        "
        :migration-proposal-snapshot-path-copy-label="
          resolveSnippetCopyLabel('migrationProposalSnapshotPath')
        "
        :migration-proposal-snapshot="
          sqlProposalHandoff.migrationProposalSnapshot
        "
        :schema-dir-copy-label="resolveSnippetCopyLabel('schemaDir')"
        :drizzle-dir-copy-label="resolveSnippetCopyLabel('drizzleDir')"
        :schema-index-file-copy-label="
          resolveSnippetCopyLabel('schemaIndexFile')
        "
        :persistence-index-file-copy-label="
          resolveSnippetCopyLabel('persistenceIndexFile')
        "
        :confirmation-checklist-copy-label="
          resolveSnippetCopyLabel('confirmationChecklist')
        "
        :steps-copy-label="resolveSnippetCopyLabel('steps')"
        @copy-suggested-commands="copySuggestedCommands"
        @copy-migration-proposal-snapshot-path="
          copyMigrationProposalSnapshotPath
        "
        @copy-confirmation-checklist="copySqlConfirmationChecklist"
        @copy-schema-dir="
          (path) => copyHandoffTargetPath('schemaDir', path)
        "
        @copy-drizzle-dir="
          (path) => copyHandoffTargetPath('drizzleDir', path)
        "
        @copy-schema-index-file="
          (path) => copyHandoffTargetPath('schemaIndexFile', path)
        "
        @copy-persistence-index-file="
          (path) => copyHandoffTargetPath('persistenceIndexFile', path)
        "
        @copy-steps="copySqlHandoffSteps"
      />
    </div>

    <GeneratorPreviewWorkspaceSourcePanel
      v-if="selectedFile"
      :t="t"
      :selected-file="selectedFile"
      :sql-preview="sqlPreview"
      :generated-source-copy-label="
        resolveCopyLabel(
          'generatedSource',
          'app.generatorPreview.action.copySnippet',
        )
      "
      :current-source-copy-label="
        resolveCopyLabel(
          'currentSource',
          'app.generatorPreview.action.copySnippet',
        )
      "
      :sql-preview-copy-label="
        resolveCopyLabel(
          'sqlPreview',
          'app.generatorPreview.action.copySnippet',
        )
      "
      @copy-generated-source="copyGeneratedSource"
      @copy-current-source="copyCurrentSource"
      @copy-sql-preview="copySqlPreview"
    />

    <div v-else class="enterprise-inline-warning mt-5">
      {{ t("app.generatorPreview.detailEmptyDescription") }}
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

.generator-code-toolbar,
.generator-metadata-label {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

</style>
