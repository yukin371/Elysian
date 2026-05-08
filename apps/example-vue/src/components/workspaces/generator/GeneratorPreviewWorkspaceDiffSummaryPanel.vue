<script setup lang="ts">
import type {
  GeneratorPreviewDiffSummary,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceDiffSummaryPanelProps {
  t: GeneratorPreviewTranslation
  diffSummary: GeneratorPreviewDiffSummary
}

defineProps<GeneratorPreviewWorkspaceDiffSummaryPanelProps>()
</script>

<template>
  <section class="panel-section">
    <div class="generator-facts">
      <span>
        {{ t("app.generatorPreview.summary.changed") }}
        {{ diffSummary.changedFileCount }}
      </span>
      <span>
        {{ t("app.generatorPreview.summary.create") }}
        {{ diffSummary.actionCounts.create }}
      </span>
      <span>
        {{ t("app.generatorPreview.summary.overwrite") }}
        {{ diffSummary.actionCounts.overwrite }}
      </span>
      <span>
        {{ t("app.generatorPreview.summary.skip") }}
        {{ diffSummary.actionCounts.skip }}
      </span>
      <span>
        {{ t("app.generatorPreview.summary.block") }}
        {{ diffSummary.actionCounts.block }}
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
