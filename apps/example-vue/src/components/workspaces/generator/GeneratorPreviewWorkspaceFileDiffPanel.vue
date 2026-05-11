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
    <div class="generator-section-head">
      <h4>{{ t("app.generatorPreview.diffTitle") }}</h4>
      <p>{{ t("app.generatorPreview.diffDescription") }}</p>
    </div>
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

.generator-section-head {
  display: grid;
  gap: 0.25rem;
}

.generator-section-head h4 {
  margin: 0;
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 700;
}

.generator-section-head p {
  margin: 0;
  color: #64748b;
  font-size: 0.77rem;
  line-height: 1.5;
}

.generator-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  color: #64748b;
  font-size: 0.82rem;
}
</style>
