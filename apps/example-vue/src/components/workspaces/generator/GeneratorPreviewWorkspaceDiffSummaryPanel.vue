<script setup lang="ts">
import type {
  GeneratorPreviewDiffSummary,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceDiffSummaryPanelProps {
  t: GeneratorPreviewTranslation
  diffSummary: GeneratorPreviewDiffSummary
  changedCountCopyLabel: string
  createCountCopyLabel: string
  overwriteCountCopyLabel: string
  skipCountCopyLabel: string
  blockCountCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceDiffSummaryPanelProps>()

const emit = defineEmits<{
  (event: "copy-changed-count"): void
  (event: "copy-create-count"): void
  (event: "copy-overwrite-count"): void
  (event: "copy-skip-count"): void
  (event: "copy-block-count"): void
}>()
</script>

<template>
  <section class="panel-section">
    <p class="enterprise-subheading">{{ t("app.generatorPreview.diffTitle") }}</p>
    <div class="enterprise-metadata">
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.summary.changed") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('copy-changed-count')"
          >
            {{ changedCountCopyLabel }}
          </button>
        </div>
        <strong>{{ diffSummary.changedFileCount }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.summary.create") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('copy-create-count')"
          >
            {{ createCountCopyLabel }}
          </button>
        </div>
        <strong>{{ diffSummary.actionCounts.create }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.summary.overwrite") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('copy-overwrite-count')"
          >
            {{ overwriteCountCopyLabel }}
          </button>
        </div>
        <strong>{{ diffSummary.actionCounts.overwrite }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.summary.skip") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('copy-skip-count')"
          >
            {{ skipCountCopyLabel }}
          </button>
        </div>
        <strong>{{ diffSummary.actionCounts.skip }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.summary.block") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('copy-block-count')"
          >
            {{ blockCountCopyLabel }}
          </button>
        </div>
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

.generator-metadata-label {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}
</style>
