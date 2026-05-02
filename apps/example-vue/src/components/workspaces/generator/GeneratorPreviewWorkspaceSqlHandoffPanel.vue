<script setup lang="ts">
import type {
  GeneratorPreviewSqlProposalHandoff,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceSqlHandoffPanelProps {
  t: GeneratorPreviewTranslation
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff
  suggestedCommandsText: string
  commandsCopyLabel: string
  schemaDirCopyLabel: string
  drizzleDirCopyLabel: string
  schemaIndexFileCopyLabel: string
  persistenceIndexFileCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceSqlHandoffPanelProps>()

const emit = defineEmits<{
  (event: "copy-suggested-commands"): void
  (event: "copy-schema-dir", path: string): void
  (event: "copy-drizzle-dir", path: string): void
  (event: "copy-schema-index-file", path: string): void
  (event: "copy-persistence-index-file", path: string): void
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
    </div>
    <ol class="generator-handoff-steps">
      <li
        v-for="step in sqlProposalHandoff.steps"
        :key="step"
      >
        {{ step }}
      </li>
    </ol>
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
