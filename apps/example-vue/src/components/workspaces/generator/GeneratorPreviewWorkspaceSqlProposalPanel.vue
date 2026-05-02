<script setup lang="ts">
import type {
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceSqlProposalPanelProps {
  t: GeneratorPreviewTranslation
  sqlProposal: GeneratorPreviewSqlProposal | null
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff
  proposalStatusLabel: string
  sqlDraftCopyLabel: string
  drizzleImportCopyLabel: string
  drizzleSchemaCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceSqlProposalPanelProps>()

const emit = defineEmits<{
  (event: "copy-sql-draft"): void
  (event: "copy-drizzle-import"): void
  (event: "copy-drizzle-schema"): void
}>()
</script>

<template>
  <section class="panel-section">
    <p class="enterprise-subheading">{{ t("app.generatorPreview.sqlProposalTitle") }}</p>
    <div class="enterprise-metadata">
      <div>
        <span>{{ t("app.generatorPreview.meta.proposalStatus") }}</span>
        <strong>{{ proposalStatusLabel }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.canonicalOwner") }}</span>
        <strong>{{ sqlProposalHandoff.canonicalMigrationOwner }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.reviewMode") }}</span>
        <strong>{{ sqlProposalHandoff.reviewMode }}</strong>
      </div>
    </div>
    <div
      v-if="sqlProposalHandoff.unsupportedReason"
      class="enterprise-message enterprise-message-warning"
    >
      {{ sqlProposalHandoff.unsupportedReason }}
    </div>
    <div v-else-if="sqlProposal" class="enterprise-panel-stack">
      <div v-if="sqlProposal.risks.length > 0" class="generator-risk-list">
        <div
          v-for="risk in sqlProposal.risks"
          :key="risk.code"
          class="generator-risk-card"
        >
          <strong>{{ risk.code }}</strong>
          <p>{{ risk.message }}</p>
        </div>
      </div>
      <section class="panel-section">
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
      <section class="panel-section">
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
      <section class="panel-section">
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
  </section>
</template>

<style scoped>
.panel-section {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-code-toolbar {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
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

.generator-risk-list {
  display: grid;
  gap: 0.75rem;
}

.generator-risk-card {
  display: grid;
  gap: 0.35rem;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.72);
  padding: 0.85rem 0.95rem;
}

.generator-risk-card p {
  margin: 0;
  color: #475569;
}

.generator-risk-card strong {
  color: #9a3412;
}
</style>
