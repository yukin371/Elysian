<script setup lang="ts">
import type {
  GeneratorPreviewFileCard,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceSummaryPanelProps {
  t: GeneratorPreviewTranslation
  selectedFile: GeneratorPreviewFileCard | null
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  sessionStatusLabel: string
  selectedSourceLineCount: number
  selectedActionLabel: string
  selectedChangeLabel: string
  recoveryNoteText: string | null
  recoveryNoteTone: "info" | "warning" | null
  schemaNameCopyLabel: string
  frontendTargetCopyLabel: string
  statusCopyLabel: string
  lineCountCopyLabel: string
  mergeStrategyCopyLabel: string
  fileActionCopyLabel: string
  changedCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceSummaryPanelProps>()

const emit = defineEmits<{
  (event: "copy-schema-name"): void
  (event: "copy-frontend-target"): void
  (event: "copy-status"): void
  (event: "copy-line-count"): void
  (event: "copy-merge-strategy"): void
  (event: "copy-file-action"): void
  (event: "copy-changed"): void
}>()
</script>

<template>
  <p class="enterprise-eyebrow">{{ t("app.generatorPreview.detailEyebrow") }}</p>
  <h3 class="enterprise-heading">
    {{ selectedFile?.path ?? t("app.generatorPreview.detailEmptyTitle") }}
  </h3>
  <p class="enterprise-copy">
    {{
      selectedFile
        ? t("app.generatorPreview.detailDescription")
        : t("app.generatorPreview.detailEmptyDescription")
    }}
  </p>

  <p
    v-if="recoveryNoteText"
    :class="[
      'enterprise-message',
      recoveryNoteTone === 'warning'
        ? 'enterprise-message-warning'
        : 'enterprise-message-info',
      'mt-5',
    ]"
  >
    {{ recoveryNoteText }}
  </p>

  <div class="enterprise-metadata mt-5">
    <div>
      <div class="generator-metadata-label">
        <span>{{ t("app.generatorPreview.meta.schemaName") }}</span>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="selectedSchemaName.trim().length === 0"
          @click="emit('copy-schema-name')"
        >
          {{ schemaNameCopyLabel }}
        </button>
      </div>
      <strong>{{ selectedSchemaName }}</strong>
    </div>
    <div>
      <div class="generator-metadata-label">
        <span>{{ t("app.generatorPreview.meta.frontendTarget") }}</span>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="selectedFrontendTarget.trim().length === 0"
          @click="emit('copy-frontend-target')"
        >
          {{ frontendTargetCopyLabel }}
        </button>
      </div>
      <strong>{{ selectedFrontendTarget }}</strong>
    </div>
    <div>
      <div class="generator-metadata-label">
        <span>{{ t("app.generatorPreview.meta.status") }}</span>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="
            sessionStatusLabel.trim().length === 0 || sessionStatusLabel === '-'
          "
          @click="emit('copy-status')"
        >
          {{ statusCopyLabel }}
        </button>
      </div>
      <strong>{{ sessionStatusLabel }}</strong>
    </div>
    <div>
      <div class="generator-metadata-label">
        <span>{{ t("app.generatorPreview.meta.lines") }}</span>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="selectedSourceLineCount <= 0"
          @click="emit('copy-line-count')"
        >
          {{ lineCountCopyLabel }}
        </button>
      </div>
      <strong>{{ selectedSourceLineCount }}</strong>
    </div>
    <div>
      <div class="generator-metadata-label">
        <span>{{ t("app.generatorPreview.meta.mergeStrategy") }}</span>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="!selectedFile?.mergeStrategy"
          @click="emit('copy-merge-strategy')"
        >
          {{ mergeStrategyCopyLabel }}
        </button>
      </div>
      <strong>{{ selectedFile?.mergeStrategy ?? "-" }}</strong>
    </div>
    <div>
      <div class="generator-metadata-label">
        <span>{{ t("app.generatorPreview.meta.fileAction") }}</span>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="
            !selectedFile ||
            selectedActionLabel.trim().length === 0 ||
            selectedActionLabel === '-'
          "
          @click="emit('copy-file-action')"
        >
          {{ fileActionCopyLabel }}
        </button>
      </div>
      <strong>{{ selectedActionLabel }}</strong>
    </div>
    <div>
      <div class="generator-metadata-label">
        <span>{{ t("app.generatorPreview.meta.changed") }}</span>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="
            !selectedFile ||
            selectedChangeLabel.trim().length === 0 ||
            selectedChangeLabel === '-'
          "
          @click="emit('copy-changed')"
        >
          {{ changedCopyLabel }}
        </button>
      </div>
      <strong>{{ selectedChangeLabel }}</strong>
    </div>
  </div>
</template>

<style scoped>
.generator-metadata-label {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}
</style>
