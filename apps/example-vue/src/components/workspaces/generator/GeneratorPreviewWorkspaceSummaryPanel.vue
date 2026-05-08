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
}

defineProps<GeneratorPreviewWorkspaceSummaryPanelProps>()
</script>

<template>
  <h3 class="enterprise-heading">
    {{ selectedFile?.path ?? t("app.generatorPreview.detailEmptyTitle") }}
  </h3>

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

  <div class="generator-facts mt-5">
    <span>{{ selectedSchemaName }}</span>
    <span>{{ selectedFrontendTarget }}</span>
    <span>{{ sessionStatusLabel }}</span>
    <span>{{ selectedActionLabel }}</span>
    <span>{{ selectedSourceLineCount }} {{ t("app.generatorPreview.meta.lines") }}</span>
    <span>{{ t("app.generatorPreview.meta.changed") }} {{ selectedChangeLabel }}</span>
    <span v-if="selectedFile?.mergeStrategy">{{ selectedFile.mergeStrategy }}</span>
  </div>
</template>

<style scoped>
.generator-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  color: #64748b;
  font-size: 0.82rem;
}
</style>
