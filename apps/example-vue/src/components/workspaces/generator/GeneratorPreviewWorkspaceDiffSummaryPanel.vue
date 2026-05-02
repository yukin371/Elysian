<script setup lang="ts">
import type { GeneratorPreviewDiffSummary, GeneratorPreviewTranslation } from "./types"

interface GeneratorPreviewWorkspaceDiffSummaryPanelProps {
  t: GeneratorPreviewTranslation
  diffSummary: GeneratorPreviewDiffSummary
}

defineProps<GeneratorPreviewWorkspaceDiffSummaryPanelProps>()
</script>

<template>
  <section class="panel-section">
    <p class="enterprise-subheading">{{ t("app.generatorPreview.diffTitle") }}</p>
    <div class="enterprise-metadata">
      <div>
        <span>{{ t("app.generatorPreview.summary.changed") }}</span>
        <strong>{{ diffSummary.changedFileCount }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.summary.create") }}</span>
        <strong>{{ diffSummary.actionCounts.create }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.summary.overwrite") }}</span>
        <strong>{{ diffSummary.actionCounts.overwrite }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.summary.skip") }}</span>
        <strong>{{ diffSummary.actionCounts.skip }}</strong>
      </div>
      <div>
        <span>{{ t("app.generatorPreview.summary.block") }}</span>
        <strong>{{ diffSummary.actionCounts.block }}</strong>
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
