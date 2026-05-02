<script setup lang="ts">
import type { GeneratorPreviewFileCard, GeneratorPreviewTranslation } from "./types"

interface GeneratorPreviewWorkspaceSummaryPanelProps {
  t: GeneratorPreviewTranslation
  selectedFile: GeneratorPreviewFileCard | null
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  sessionStatusLabel: string
  selectedSourceLineCount: number
  selectedActionLabel: string
  selectedChangeLabel: string
  schemaNameCopyLabel: string
  frontendTargetCopyLabel: string
  statusCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceSummaryPanelProps>()

const emit = defineEmits<{
  (event: "copy-schema-name"): void
  (event: "copy-frontend-target"): void
  (event: "copy-status"): void
}>()
</script>

<template>
  <p class="enterprise-eyebrow">{{ t("app.generatorPreview.detailEyebrow") }}</p>
  <h3 class="enterprise-heading">
    {{
      selectedFile?.path ?? t("app.generatorPreview.detailEmptyTitle")
    }}
  </h3>
  <p class="enterprise-copy">
    {{
      selectedFile
        ? t("app.generatorPreview.detailDescription")
        : t("app.generatorPreview.detailEmptyDescription")
    }}
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
          :disabled="sessionStatusLabel.trim().length === 0"
          @click="emit('copy-status')"
        >
          {{ statusCopyLabel }}
        </button>
      </div>
      <strong>{{ sessionStatusLabel }}</strong>
    </div>
    <div>
      <span>{{ t("app.generatorPreview.meta.lines") }}</span>
      <strong>{{ selectedSourceLineCount }}</strong>
    </div>
    <div>
      <span>{{ t("app.generatorPreview.meta.mergeStrategy") }}</span>
      <strong>{{ selectedFile?.mergeStrategy ?? "-" }}</strong>
    </div>
    <div>
      <span>{{ t("app.generatorPreview.meta.fileAction") }}</span>
      <strong>{{ selectedActionLabel }}</strong>
    </div>
    <div>
      <span>{{ t("app.generatorPreview.meta.changed") }}</span>
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
