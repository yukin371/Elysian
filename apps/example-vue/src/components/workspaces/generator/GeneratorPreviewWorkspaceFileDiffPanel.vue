<script setup lang="ts">
import type {
  GeneratorPreviewFileCard,
  GeneratorPreviewTranslation,
} from "./types"

type GeneratorPreviewFileDiffStats = NonNullable<
  GeneratorPreviewFileCard["diffStats"]
>

interface GeneratorPreviewWorkspaceFileDiffPanelProps {
  t: GeneratorPreviewTranslation
  selectedDiffStats: GeneratorPreviewFileDiffStats
  addedLinesCopyLabel: string
  removedLinesCopyLabel: string
  unchangedLinesCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceFileDiffPanelProps>()

const emit = defineEmits<{
  (event: "copy-added-lines"): void
  (event: "copy-removed-lines"): void
  (event: "copy-unchanged-lines"): void
}>()
</script>

<template>
  <section class="panel-section">
    <p class="enterprise-subheading">{{ t("app.generatorPreview.fileDiffTitle") }}</p>
    <div class="enterprise-metadata">
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.addedLines") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('copy-added-lines')"
          >
            {{ addedLinesCopyLabel }}
          </button>
        </div>
        <strong>{{ selectedDiffStats.addedLineCount }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.removedLines") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('copy-removed-lines')"
          >
            {{ removedLinesCopyLabel }}
          </button>
        </div>
        <strong>{{ selectedDiffStats.removedLineCount }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.unchangedLines") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('copy-unchanged-lines')"
          >
            {{ unchangedLinesCopyLabel }}
          </button>
        </div>
        <strong>{{ selectedDiffStats.unchangedLineCount }}</strong>
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

.generator-metadata-label {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}
</style>
