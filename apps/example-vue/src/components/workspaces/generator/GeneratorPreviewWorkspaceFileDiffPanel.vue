<script setup lang="ts">
import type {
  GeneratorPreviewFileCard,
  GeneratorPreviewTranslation,
} from "./types"

type GeneratorPreviewFileDiffStats = NonNullable<GeneratorPreviewFileCard["diffStats"]>

interface GeneratorPreviewWorkspaceFileDiffPanelProps {
  t: GeneratorPreviewTranslation
  selectedDiffStats: GeneratorPreviewFileDiffStats
}

defineProps<GeneratorPreviewWorkspaceFileDiffPanelProps>()
</script>

<template>
  <section class="panel-section">
    <p class="enterprise-subheading">{{ t("app.generatorPreview.fileDiffTitle") }}</p>
    <div class="enterprise-metadata">
      <div>
        <span>{{ t("app.generatorPreview.meta.addedLines") }}</span>
        <strong>{{ selectedDiffStats.addedLineCount }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.removedLines") }}</span>
        <strong>{{ selectedDiffStats.removedLineCount }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.meta.unchangedLines") }}</span>
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
</style>
