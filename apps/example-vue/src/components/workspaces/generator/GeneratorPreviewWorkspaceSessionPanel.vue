<script setup lang="ts">
import type {
  GeneratorPreviewSessionRecord,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceSessionPanelProps {
  t: GeneratorPreviewTranslation
  session: GeneratorPreviewSessionRecord
  sessionActorLabel: string
  sessionSourceTypeLabel: string
  sessionConflictStrategyLabel: string
  sessionConfirmedAtLabel: string
  sessionConfirmedByLabel: string
  sessionConfirmationNote: string | null
  reportPathCopyLabel: string
  sessionIdCopyLabel: string
  createdAtCopyLabel: string
  actorCopyLabel: string
  outputDirCopyLabel: string
  sourceTypeCopyLabel: string
  sourceValueCopyLabel: string
  conflictStrategyCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceSessionPanelProps>()

const emit = defineEmits<{
  (event: "copy-report-path"): void
  (event: "copy-session-id"): void
  (event: "copy-created-at"): void
  (event: "copy-actor"): void
  (event: "copy-output-dir"): void
  (event: "copy-source-type"): void
  (event: "copy-source-value"): void
  (event: "copy-conflict-strategy"): void
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
    <p
      v-if="sessionConfirmationNote"
      class="enterprise-message enterprise-message-info"
    >
      {{ sessionConfirmationNote }}
    </p>
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
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.actor") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="sessionActorLabel.trim().length === 0 || sessionActorLabel === '-'"
            @click="emit('copy-actor')"
          >
            {{ actorCopyLabel }}
          </button>
        </div>
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
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.sourceType") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="
              sessionSourceTypeLabel.trim().length === 0 ||
              sessionSourceTypeLabel === '-'
            "
            @click="emit('copy-source-type')"
          >
            {{ sourceTypeCopyLabel }}
          </button>
        </div>
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
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.conflictStrategy") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="
              sessionConflictStrategyLabel.trim().length === 0 ||
              sessionConflictStrategyLabel === '-'
            "
            @click="emit('copy-conflict-strategy')"
          >
            {{ conflictStrategyCopyLabel }}
          </button>
        </div>
        <strong>{{ sessionConflictStrategyLabel }}</strong>
      </div>
      <div v-if="session.confirmedAt">
        <span>{{ t("app.generatorPreview.meta.confirmedAt") }}</span>
        <strong>{{ sessionConfirmedAtLabel }}</strong>
      </div>
      <div v-if="session.confirmedAt">
        <span>{{ t("app.generatorPreview.meta.confirmedBy") }}</span>
        <strong>{{ sessionConfirmedByLabel }}</strong>
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
