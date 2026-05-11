<script setup lang="ts">
import { computed } from "vue"

import type {
  GeneratorPreviewFileCard,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceFileDecisionPanelProps {
  t: GeneratorPreviewTranslation
  selectedFile: GeneratorPreviewFileCard
  selectedExistsLabel: string
  selectedManagedLabel: string
}

const props = defineProps<GeneratorPreviewWorkspaceFileDecisionPanelProps>()

const decisionNote = computed(() => {
  const plannedReason = props.selectedFile.plannedReason.trim()
  if (plannedReason.length > 0) {
    return plannedReason
  }

  const reason = props.selectedFile.reason.trim()
  return reason.length > 0 ? reason : null
})
</script>

<template>
  <section class="panel-section mt-5">
    <div class="generator-section-head">
      <h4>{{ t("app.generatorPreview.fileDecisionTitle") }}</h4>
      <p>{{ t("app.generatorPreview.fileDecisionDescription") }}</p>
    </div>

    <p v-if="decisionNote" class="generator-note">
      {{ decisionNote }}
    </p>

    <div class="generator-facts">
      <span>
        {{ t("app.generatorPreview.meta.exists") }}
        {{ selectedExistsLabel }}
      </span>
      <span>
        {{ t("app.generatorPreview.meta.managed") }}
        {{ selectedManagedLabel }}
      </span>
      <span v-if="selectedFile.mergeStrategy">
        {{ t("app.generatorPreview.meta.mergeStrategy") }}
        {{ selectedFile.mergeStrategy }}
      </span>
    </div>
    <div class="generator-path-block">
      <span>{{ t("app.generatorPreview.meta.absolutePath") }}</span>
      <code class="generator-path">{{ selectedFile.absolutePath }}</code>
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

.generator-path-block {
  display: grid;
  gap: 0.25rem;
}

.generator-path-block span {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.generator-path {
  overflow-x: auto;
  color: #475569;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 0.8rem;
  white-space: nowrap;
}

.generator-note {
  margin: 0;
  color: #475569;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
