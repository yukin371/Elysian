<script setup lang="ts">
import type { GeneratorPreviewSessionRecord, GeneratorPreviewTranslation } from "./types"

interface GeneratorPreviewWorkspaceSessionPanelProps {
  t: GeneratorPreviewTranslation
  session: GeneratorPreviewSessionRecord
  sessionActorLabel: string
  sessionSourceTypeLabel: string
  sessionConflictStrategyLabel: string
  reportPathCopyLabel: string
  sessionIdCopyLabel: string
  createdAtCopyLabel: string
  outputDirCopyLabel: string
  sourceValueCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceSessionPanelProps>()

const emit = defineEmits<{
  (event: "copy-report-path"): void
  (event: "copy-session-id"): void
  (event: "copy-created-at"): void
  (event: "copy-output-dir"): void
  (event: "copy-source-value"): void
}>()
</script>

<template>
  <section class="panel-section">
    <div class="generator-code-toolbar">
      <p class="enterprise-subheading">{{ t("app.generatorPreview.sessionTitle") }}</p>
      <button
        type="button"
        class="enterprise-button enterprise-button-ghost"
        :disabled="session.reportPath.trim().length === 0"
        @click="emit('copy-report-path')"
      >
        {{ reportPathCopyLabel }}
      </button>
    </div>
    <div class="enterprise-metadata">
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.sessionId") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="session.id.trim().length === 0"
            @click="emit('copy-session-id')"
          >
            {{ sessionIdCopyLabel }}
          </button>
        </div>
        <strong>{{ session.id }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.createdAt") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="session.createdAt.trim().length === 0"
            @click="emit('copy-created-at')"
          >
            {{ createdAtCopyLabel }}
          </button>
        </div>
        <strong>{{ session.createdAt }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.actor") }}</span>
        <strong>{{ sessionActorLabel }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.reportPath") }}</span>
        <strong>{{ session.reportPath }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.outputDir") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="session.outputDir.trim().length === 0"
            @click="emit('copy-output-dir')"
          >
            {{ outputDirCopyLabel }}
          </button>
        </div>
        <strong>{{ session.outputDir }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.sourceType") }}</span>
        <strong>{{ sessionSourceTypeLabel }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.sourceValue") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="session.sourceValue.trim().length === 0"
            @click="emit('copy-source-value')"
          >
            {{ sourceValueCopyLabel }}
          </button>
        </div>
        <strong>{{ session.sourceValue }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.conflictStrategy") }}</span>
        <strong>{{ sessionConflictStrategyLabel }}</strong>
      </div>
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
