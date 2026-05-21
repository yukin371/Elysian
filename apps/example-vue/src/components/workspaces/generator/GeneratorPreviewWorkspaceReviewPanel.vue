<script setup lang="ts">
import { computed } from "vue"

import { formatGeneratorPreviewDateTime } from "./generator-preview-main-state-facts"
import type {
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceReviewPanelProps {
  t: GeneratorPreviewTranslation
  reviewEvidence: GeneratorPreviewReviewEvidence
  reviewActorLabel: string
  reviewDecisionLabel: string
}

const props = defineProps<GeneratorPreviewWorkspaceReviewPanelProps>()

const reviewedAtLabel = computed(() =>
  formatGeneratorPreviewDateTime(props.reviewEvidence.reviewedAt),
)
</script>

<template>
  <section class="panel-section">
    <div class="generator-facts">
      <span>{{ reviewedAtLabel }}</span>
      <span>{{ reviewActorLabel }}</span>
      <span>{{ reviewDecisionLabel }}</span>
    </div>
    <p v-if="reviewEvidence.comment" class="generator-note">
      {{ reviewEvidence.comment }}
    </p>
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

.generator-note {
  margin: 0;
  color: #475569;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
