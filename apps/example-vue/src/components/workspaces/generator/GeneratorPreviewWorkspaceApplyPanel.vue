<script setup lang="ts">
import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceApplyPanelProps {
  t: GeneratorPreviewTranslation
  applyEvidence: GeneratorPreviewApplyEvidence
  applyActorLabel: string
}

defineProps<GeneratorPreviewWorkspaceApplyPanelProps>()
</script>

<template>
  <section class="panel-section">
    <div class="generator-facts">
      <span>{{ applyEvidence.appliedAt ?? "-" }}</span>
      <span>{{ applyActorLabel }}</span>
      <span v-if="applyEvidence.requestId">{{ applyEvidence.requestId }}</span>
    </div>
    <code v-if="applyEvidence.manifestPath" class="generator-path">
      {{ applyEvidence.manifestPath }}
    </code>
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

.generator-path {
  overflow-x: auto;
  color: #475569;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 0.8rem;
  white-space: nowrap;
}
</style>
