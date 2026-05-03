<script setup lang="ts">
import type {
  GeneratorPreviewMigrationProposalSnapshot,
  GeneratorPreviewSqlProposalHandoff,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceSqlHandoffPanelProps {
  t: GeneratorPreviewTranslation
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff
  migrationProposalSnapshot: GeneratorPreviewMigrationProposalSnapshot
  recoveryNoteText: string | null
  recoveryNoteTone: "info" | "warning" | null
  sessionConfirmedAtLabel: string
  sessionConfirmedByLabel: string
  sessionConfirmationNote: string | null
  suggestedCommandsText: string
  commandsCopyLabel: string
  migrationProposalSnapshotPathCopyLabel: string
  confirmationChecklistCopyLabel: string
  schemaDirCopyLabel: string
  drizzleDirCopyLabel: string
  schemaIndexFileCopyLabel: string
  persistenceIndexFileCopyLabel: string
  stepsCopyLabel: string
}

const {
  t,
  sqlProposalHandoff,
  migrationProposalSnapshot,
  recoveryNoteText,
  recoveryNoteTone,
  sessionConfirmedAtLabel,
  sessionConfirmedByLabel,
  sessionConfirmationNote,
  suggestedCommandsText,
  commandsCopyLabel,
  migrationProposalSnapshotPathCopyLabel,
  confirmationChecklistCopyLabel,
  schemaDirCopyLabel,
  drizzleDirCopyLabel,
  schemaIndexFileCopyLabel,
  persistenceIndexFileCopyLabel,
  stepsCopyLabel,
} = defineProps<GeneratorPreviewWorkspaceSqlHandoffPanelProps>()

const emit = defineEmits<{
  (event: "copy-suggested-commands"): void
  (event: "copy-migration-proposal-snapshot-path"): void
  (event: "copy-confirmation-checklist"): void
  (event: "copy-schema-dir", path: string): void
  (event: "copy-drizzle-dir", path: string): void
  (event: "copy-schema-index-file", path: string): void
  (event: "copy-persistence-index-file", path: string): void
  (event: "copy-steps"): void
}>()
</script>

<template>
  <section class="panel-section">
    <div class="generator-handoff-toolbar">
      <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlHandoffTitle") }}</p>
      <button
        type="button"
        class="enterprise-button enterprise-button-ghost"
        :disabled="sqlProposalHandoff.suggestedCommands.length === 0"
        @click="emit('copy-suggested-commands')"
      >
        {{ commandsCopyLabel }}
      </button>
    </div>
    <div class="generator-handoff-grid">
      <article>
        <div class="generator-handoff-card-header">
          <strong>{{ t("app.generatorPreview.meta.schemaDir") }}</strong>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="sqlProposalHandoff.targetPaths.schemaDir.trim().length === 0"
            @click="emit('copy-schema-dir', sqlProposalHandoff.targetPaths.schemaDir)"
          >
            {{ schemaDirCopyLabel }}
          </button>
        </div>
        <span>{{ sqlProposalHandoff.targetPaths.schemaDir }}</span>
      </article>
      <article>
        <div class="generator-handoff-card-header">
          <strong>{{ t("app.generatorPreview.meta.drizzleDir") }}</strong>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="sqlProposalHandoff.targetPaths.drizzleDir.trim().length === 0"
            @click="emit('copy-drizzle-dir', sqlProposalHandoff.targetPaths.drizzleDir)"
          >
            {{ drizzleDirCopyLabel }}
          </button>
        </div>
        <span>{{ sqlProposalHandoff.targetPaths.drizzleDir }}</span>
      </article>
      <article>
        <div class="generator-handoff-card-header">
          <strong>{{ t("app.generatorPreview.meta.schemaIndexFile") }}</strong>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="
              sqlProposalHandoff.targetPaths.schemaIndexFile.trim().length === 0
            "
            @click="
              emit(
                'copy-schema-index-file',
                sqlProposalHandoff.targetPaths.schemaIndexFile,
              )
            "
          >
            {{ schemaIndexFileCopyLabel }}
          </button>
        </div>
        <span>{{ sqlProposalHandoff.targetPaths.schemaIndexFile }}</span>
      </article>
      <article>
        <div class="generator-handoff-card-header">
          <strong>{{ t("app.generatorPreview.meta.persistenceIndexFile") }}</strong>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="
              sqlProposalHandoff.targetPaths.persistenceIndexFile.trim().length === 0
            "
            @click="
              emit(
                'copy-persistence-index-file',
                sqlProposalHandoff.targetPaths.persistenceIndexFile,
              )
            "
          >
            {{ persistenceIndexFileCopyLabel }}
          </button>
        </div>
        <span>{{ sqlProposalHandoff.targetPaths.persistenceIndexFile }}</span>
      </article>
      <article>
        <div class="generator-handoff-card-header">
          <strong>{{ t("app.generatorPreview.migrationProposalSnapshotTitle") }}</strong>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="
              sqlProposalHandoff.migrationProposalSnapshotPath.trim().length === 0
            "
            @click="emit('copy-migration-proposal-snapshot-path')"
          >
            {{ migrationProposalSnapshotPathCopyLabel }}
          </button>
        </div>
        <span>{{ sqlProposalHandoff.migrationProposalSnapshotPath }}</span>
      </article>
    </div>
    <section class="generator-handoff-step-block">
      <div class="generator-handoff-card-header">
        <strong>{{ t("app.generatorPreview.migrationProposalSnapshotTitle") }}</strong>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="
            migrationProposalSnapshot.snapshotPath.trim().length === 0
          "
          @click="emit('copy-migration-proposal-snapshot-path')"
        >
          {{ migrationProposalSnapshotPathCopyLabel }}
        </button>
      </div>
      <div class="enterprise-metadata">
        <div>
          <span>{{ t("app.generatorPreview.meta.generatedAt") }}</span>
          <strong>{{ migrationProposalSnapshot.generatedAt }}</strong>
        </div>
        <div>
          <span>{{ t("app.generatorPreview.meta.proposalStatus") }}</span>
          <strong>
            {{
              migrationProposalSnapshot.migrationProposalResolution.proposal
                ? t("app.generatorPreview.sqlProposal.status.ready")
                : t("app.generatorPreview.sqlProposal.status.unsupported")
            }}
          </strong>
        </div>
      </div>
      <p
        v-if="
          migrationProposalSnapshot.migrationProposalResolution.unsupportedReason
        "
        class="enterprise-message enterprise-message-warning"
      >
        {{
          migrationProposalSnapshot.migrationProposalResolution.unsupportedReason
        }}
      </p>
      <p class="generator-status-note">
        {{ migrationProposalSnapshot.snapshotPath }}
      </p>
      <p
        v-if="recoveryNoteText"
        :class="[
          'enterprise-message',
          recoveryNoteTone === 'warning'
            ? 'enterprise-message-warning'
            : 'enterprise-message-info',
        ]"
      >
        {{ recoveryNoteText }}
      </p>
    </section>
    <section class="generator-handoff-step-block">
      <div class="generator-handoff-card-header">
        <strong>{{ t("app.generatorPreview.sqlConfirmationTitle") }}</strong>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="sqlProposalHandoff.confirmationChecklist.length === 0"
          @click="emit('copy-confirmation-checklist')"
        >
          {{ confirmationChecklistCopyLabel }}
        </button>
      </div>
      <p
        v-if="sessionConfirmationNote"
        class="enterprise-message enterprise-message-info"
      >
        {{ sessionConfirmationNote }}
      </p>
      <div v-if="sessionConfirmedAtLabel !== '-'" class="enterprise-metadata">
        <div>
          <span>{{ t("app.generatorPreview.meta.confirmedAt") }}</span>
          <strong>{{ sessionConfirmedAtLabel }}</strong>
        </div>
        <div>
          <span>{{ t("app.generatorPreview.meta.confirmedBy") }}</span>
          <strong>{{ sessionConfirmedByLabel }}</strong>
        </div>
      </div>
      <ol class="generator-handoff-steps">
        <li v-for="item in sqlProposalHandoff.confirmationChecklist" :key="item">
          {{ item }}
        </li>
      </ol>
    </section>
    <section class="generator-handoff-step-block">
      <div class="generator-handoff-card-header">
        <strong>{{ t("app.generatorPreview.sqlHandoffTitle") }}</strong>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="sqlProposalHandoff.steps.length === 0"
          @click="emit('copy-steps')"
        >
          {{ stepsCopyLabel }}
        </button>
      </div>
      <ol class="generator-handoff-steps">
        <li v-for="step in sqlProposalHandoff.steps" :key="step">
          {{ step }}
        </li>
      </ol>
    </section>
    <pre class="generator-code-block"><code>{{ suggestedCommandsText }}</code></pre>
  </section>
</template>

<style scoped>
.panel-section {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-code-block {
  overflow: auto;
  margin: 0;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #0f172a;
  padding: 1rem;
  color: #dbeafe;
  font-family:
    "IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo,
    monospace;
  font-size: 0.8rem;
  line-height: 1.7;
  white-space: pre;
}

.generator-handoff-grid {
  display: grid;
  gap: 0.75rem;
}

.generator-handoff-toolbar,
.generator-handoff-card-header {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

.generator-handoff-step-block,
.generator-handoff-grid article {
  display: grid;
  gap: 0.35rem;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.72);
  padding: 0.85rem 0.95rem;
}

.generator-handoff-steps {
  margin: 0;
}

.generator-handoff-grid span,
.generator-handoff-steps {
  color: #475569;
}

.generator-handoff-steps {
  display: grid;
  gap: 0.5rem;
  padding-left: 1.2rem;
}
</style>
