<script setup lang="ts">
import { computed, ref } from "vue"

import type {
  GeneratorPreviewMigrationProposalSnapshot,
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
  GeneratorPreviewTranslation,
} from "./types"

type SqlViewKey = "proposal" | "handoff"

interface GeneratorPreviewWorkspaceSqlHandoffPanelProps {
  t: GeneratorPreviewTranslation
  sqlProposal: GeneratorPreviewSqlProposal | null
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff
  proposalStatusLabel: string
  migrationProposalSnapshot: GeneratorPreviewMigrationProposalSnapshot
  recoveryNoteText: string | null
  recoveryNoteTone: "info" | "warning" | null
  sessionConfirmedAtLabel: string
  sessionConfirmedByLabel: string
  sessionConfirmationNote: string | null
  suggestedCommandsText: string
  commandsCopyLabel: string
  sqlDraftCopyLabel: string
  drizzleImportCopyLabel: string
  drizzleSchemaCopyLabel: string
}

const props = defineProps<GeneratorPreviewWorkspaceSqlHandoffPanelProps>()

const emit = defineEmits<{
  (event: "copy-suggested-commands"): void
  (event: "copy-sql-draft"): void
  (event: "copy-drizzle-import"): void
  (event: "copy-drizzle-schema"): void
}>()

const activeView = ref<SqlViewKey>("proposal")

const sqlViews = computed(() => [
  {
    key: "proposal" as const,
    label: props.t("app.generatorPreview.sqlProposalTitle"),
  },
  {
    key: "handoff" as const,
    label: props.t("app.generatorPreview.sqlHandoffTitle"),
  },
])
</script>

<template>
  <section class="panel-section">
    <div class="generator-sql-toolbar">
      <div class="generator-sql-switches">
        <button
          v-for="view in sqlViews"
          :key="view.key"
          type="button"
          class="generator-sql-switch"
          :class="
            activeView === view.key ? 'generator-sql-switch-active' : ''
          "
          @click="activeView = view.key"
        >
          {{ view.label }}
        </button>
      </div>
    </div>

    <div class="generator-facts">
      <span>{{ proposalStatusLabel }}</span>
      <span>{{ sqlProposalHandoff.canonicalMigrationOwner }}</span>
      <span>{{ sqlProposalHandoff.reviewMode }}</span>
      <span>{{ migrationProposalSnapshot.generatedAt }}</span>
      <span v-if="sessionConfirmedAtLabel !== '-'">{{ sessionConfirmedAtLabel }}</span>
      <span v-if="sessionConfirmedByLabel !== '-'">{{ sessionConfirmedByLabel }}</span>
    </div>

    <template v-if="activeView === 'proposal'">
      <p
        v-if="sqlProposalHandoff.unsupportedReason"
        class="enterprise-message enterprise-message-warning"
      >
        {{ sqlProposalHandoff.unsupportedReason }}
      </p>

      <div
        v-else-if="sqlProposal"
        class="enterprise-panel-stack"
      >
        <div v-if="sqlProposal.risks.length > 0" class="generator-risk-list">
          <p
            v-for="risk in sqlProposal.risks"
            :key="risk.code"
            class="generator-risk-item"
          >
            {{ risk.code }} · {{ risk.message }}
          </p>
        </div>

        <section class="generator-code-section">
          <div class="generator-code-toolbar">
            <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlDraftTitle") }}</p>
            <button
              type="button"
              class="enterprise-button enterprise-button-ghost"
              :disabled="sqlProposal.sqlDraft.trim().length === 0"
              @click="emit('copy-sql-draft')"
            >
              {{ sqlDraftCopyLabel }}
            </button>
          </div>
          <pre class="generator-code-block"><code>{{ sqlProposal.sqlDraft }}</code></pre>
        </section>

        <section class="generator-code-section">
          <div class="generator-code-toolbar">
            <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlProposalDrizzleImportTitle") }}</p>
            <button
              type="button"
              class="enterprise-button enterprise-button-ghost"
              :disabled="sqlProposal.drizzleImportSnippet.trim().length === 0"
              @click="emit('copy-drizzle-import')"
            >
              {{ drizzleImportCopyLabel }}
            </button>
          </div>
          <pre class="generator-code-block"><code>{{ sqlProposal.drizzleImportSnippet }}</code></pre>
        </section>

        <section class="generator-code-section">
          <div class="generator-code-toolbar">
            <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlProposalDrizzleSchemaTitle") }}</p>
            <button
              type="button"
              class="enterprise-button enterprise-button-ghost"
              :disabled="sqlProposal.drizzleSchemaSnippet.trim().length === 0"
              @click="emit('copy-drizzle-schema')"
            >
              {{ drizzleSchemaCopyLabel }}
            </button>
          </div>
          <pre class="generator-code-block"><code>{{ sqlProposal.drizzleSchemaSnippet }}</code></pre>
        </section>
      </div>
    </template>

    <template v-else>
      <div class="generator-path-list">
        <code>{{ sqlProposalHandoff.targetPaths.schemaDir }}</code>
        <code>{{ sqlProposalHandoff.targetPaths.drizzleDir }}</code>
        <code>{{ sqlProposalHandoff.targetPaths.schemaIndexFile }}</code>
        <code>{{ sqlProposalHandoff.targetPaths.persistenceIndexFile }}</code>
        <code>{{ sqlProposalHandoff.migrationProposalSnapshotPath }}</code>
      </div>

      <p
        v-if="migrationProposalSnapshot.migrationProposalResolution.unsupportedReason"
        class="enterprise-message enterprise-message-warning"
      >
        {{
          migrationProposalSnapshot.migrationProposalResolution.unsupportedReason
        }}
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

      <p
        v-if="sessionConfirmationNote"
        class="enterprise-message enterprise-message-info"
      >
        {{ sessionConfirmationNote }}
      </p>

      <ol
        v-if="sqlProposalHandoff.confirmationChecklist.length > 0"
        class="generator-steps"
      >
        <li
          v-for="item in sqlProposalHandoff.confirmationChecklist"
          :key="item"
        >
          {{ item }}
        </li>
      </ol>

      <ol v-if="sqlProposalHandoff.steps.length > 0" class="generator-steps">
        <li v-for="step in sqlProposalHandoff.steps" :key="step">
          {{ step }}
        </li>
      </ol>

      <div class="generator-code-toolbar">
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
      <pre class="generator-code-block"><code>{{ suggestedCommandsText }}</code></pre>
    </template>
  </section>
</template>

<style scoped>
.panel-section {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-sql-toolbar,
.generator-code-toolbar {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

.generator-sql-switches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.generator-sql-switch {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.85);
  color: #334155;
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.generator-sql-switch-active {
  border-color: rgba(36, 87, 214, 0.36);
  background: rgba(36, 87, 214, 0.08);
  color: #173ea6;
}

.generator-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  color: #64748b;
  font-size: 0.82rem;
}

.generator-risk-list,
.generator-path-list {
  display: grid;
  gap: 0.45rem;
}

.generator-risk-item {
  margin: 0;
  color: #9a3412;
}

.generator-path-list code {
  overflow-x: auto;
  color: #475569;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 0.8rem;
  white-space: nowrap;
}

.generator-steps {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding-left: 1.2rem;
  color: #475569;
}

.generator-code-section {
  display: grid;
  gap: 0.75rem;
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
</style>
