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
}

defineProps<GeneratorPreviewWorkspaceFileDiffPanelProps>()
</script>

<template>
  <section class="panel-section">
    <div class="generator-facts">
      <span>
        {{ t("app.generatorPreview.meta.addedLines") }}
        {{ selectedDiffStats.addedLineCount }}
      </span>
      <span>
        {{ t("app.generatorPreview.meta.removedLines") }}
        {{ selectedDiffStats.removedLineCount }}
      </span>
      <span>
        {{ t("app.generatorPreview.meta.unchangedLines") }}
        {{ selectedDiffStats.unchangedLineCount }}
      </span>
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

.generator-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  color: #64748b;
  font-size: 0.82rem;
}
</style>
