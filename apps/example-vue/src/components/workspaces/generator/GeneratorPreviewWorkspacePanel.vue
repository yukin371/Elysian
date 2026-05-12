<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted } from "vue"

import GeneratorPreviewWorkspaceFileDecisionPanel from "./GeneratorPreviewWorkspaceFileDecisionPanel.vue"
import GeneratorPreviewWorkspaceFileDiffPanel from "./GeneratorPreviewWorkspaceFileDiffPanel.vue"
import GeneratorPreviewWorkspaceSessionPanel from "./GeneratorPreviewWorkspaceSessionPanel.vue"
import GeneratorPreviewWorkspaceSourcePanel from "./GeneratorPreviewWorkspaceSourcePanel.vue"
import GeneratorPreviewWorkspaceSqlHandoffPanel from "./GeneratorPreviewWorkspaceSqlHandoffPanel.vue"
import GeneratorPreviewWorkspaceSummaryPanel from "./GeneratorPreviewWorkspaceSummaryPanel.vue"
import { resolveGeneratorPreviewConfirmationEvidenceSummary } from "./generator-preview-confirmation-evidence"
import { resolveGeneratorPreviewFrontendImpact } from "./generator-preview-frontend-impact"
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
const emit = defineEmits<(e: "clear-selection") => void>()

const {
  copySuggestedCommandsByKey,
  copyTextByKey,
  disposeCopyFeedbackTimers,
  resolveCopyLabel,
} = useGeneratorPreviewCopyFeedback(props.t)

const selectedSourceLineCount = computed(
  () => props.selectedFile?.lineCount ?? 0,
)
const previewArtifactCount = computed(
  () => props.diffSummary?.totalFileCount ?? 0,
)

const frontendImpact = computed(() =>
  resolveGeneratorPreviewFrontendImpact(
    props.selectedFile?.path,
    props.selectedFile?.contents,
  ),
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

const sessionSourceTypeLabel = computed(() =>
  props.session?.sourceType === "manual-schema-json"
    ? props.t("app.generatorPreview.sourceType.manualSchemaJson")
    : props.session?.sourceType === "registered-schema"
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

const copySqlDraft = async () =>
  copyPanelValue("sqlDraft", props.sqlProposal?.sqlDraft)

const copyDrizzleImportSnippet = async () => {
  await copyPanelValue("drizzleImport", props.sqlProposal?.drizzleImportSnippet)
}

const copyDrizzleSchemaSnippet = async () => {
  await copyPanelValue("drizzleSchema", props.sqlProposal?.drizzleSchemaSnippet)
}

const copyGeneratedSource = async () =>
  copyPanelValue("generatedSource", props.selectedFile?.contents)

const copyCurrentSource = async () => {
  await copyPanelValue("currentSource", props.selectedFile?.currentContents)
}

const copySqlPreview = async () =>
  copyPanelValue("sqlPreview", props.sqlPreview?.contents)

const clearSelection = () => {
  if (!props.selectedFile) {
    return
  }

  emit("clear-selection")
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape" || !props.selectedFile) {
    return
  }

  event.preventDefault()
  clearSelection()
}

onMounted(() => document.addEventListener("keydown", handleKeydown))
onBeforeUnmount(disposeCopyFeedbackTimers)
onUnmounted(() => document.removeEventListener("keydown", handleKeydown))
</script>

<template>
  <section class="enterprise-card">
    <div
      v-if="selectedFile"
      class="generator-detail-toolbar"
    >
      <button
        type="button"
        class="enterprise-button enterprise-button-ghost"
        @click="clearSelection"
      >
        {{ t("app.generatorPreview.action.closeFileDetail") }}
      </button>
      <span class="generator-detail-toolbar-hint">
        {{ t("app.generatorPreview.detailCloseHint") }}
      </span>
    </div>

    <GeneratorPreviewWorkspaceSummaryPanel
      :t="t"
      :selected-file="selectedFile"
      :selected-schema-name="selectedSchemaName"
      :selected-frontend-target="selectedFrontendTarget"
      :session-status-label="sessionStatusLabel"
      :preview-artifact-count="previewArtifactCount"
      :selected-source-line-count="selectedSourceLineCount"
      :selected-action-label="selectedActionLabel"
      :selected-change-label="selectedChangeLabel"
      :frontend-impact="frontendImpact"
      :recovery-note-text="recoveryNote?.text ?? null"
      :recovery-note-tone="recoveryNote?.tone ?? null"
    />

    <GeneratorPreviewWorkspaceFileDecisionPanel
      v-if="selectedFile"
      :t="t"
      :selected-file="selectedFile"
      :selected-exists-label="selectedExistsLabel"
      :selected-managed-label="selectedManagedLabel"
    />

    <GeneratorPreviewWorkspaceFileDiffPanel
      v-if="selectedFile?.diffStats"
      :t="t"
      :selected-diff-stats="selectedFile.diffStats"
    />

    <div v-if="session" class="enterprise-panel-stack">
      <GeneratorPreviewWorkspaceSessionPanel
        :t="t"
        :session="session"
        :diff-summary="diffSummary"
        :review-evidence="reviewEvidence"
        :apply-evidence="applyEvidence"
        :session-actor-label="sessionActorLabel"
        :session-source-type-label="sessionSourceTypeLabel"
        :session-conflict-strategy-label="sessionConflictStrategyLabel"
        :session-confirmed-at-label="sessionConfirmedAtLabel"
        :session-confirmed-by-label="sessionConfirmedByLabel"
        :session-confirmation-note="sessionConfirmationNote"
        :confirmation-evidence-summary="confirmationEvidenceSummary"
      />

      <GeneratorPreviewWorkspaceSqlHandoffPanel
        v-if="sqlProposalHandoff"
        :t="t"
        :sql-proposal="sqlProposal"
        :sql-proposal-handoff="sqlProposalHandoff"
        :proposal-status-label="sqlProposalStatusLabel"
        :migration-proposal-snapshot="
          sqlProposalHandoff.migrationProposalSnapshot
        "
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
        :sql-draft-copy-label="resolveSnippetCopyLabel('sqlDraft')"
        :drizzle-import-copy-label="resolveSnippetCopyLabel('drizzleImport')"
        :drizzle-schema-copy-label="resolveSnippetCopyLabel('drizzleSchema')"
        @copy-suggested-commands="copySuggestedCommands"
        @copy-sql-draft="copySqlDraft"
        @copy-drizzle-import="copyDrizzleImportSnippet"
        @copy-drizzle-schema="copyDrizzleSchemaSnippet"
      />
    </div>

    <GeneratorPreviewWorkspaceSourcePanel
      v-if="selectedFile"
      :t="t"
      presentation="overlay"
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
  </section>
</template>

<style scoped>
.generator-detail-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem 0.9rem;
  margin-bottom: 1rem;
}

.generator-detail-toolbar-hint {
  color: #64748b;
  font-size: 0.77rem;
  line-height: 1.45;
}
</style>
