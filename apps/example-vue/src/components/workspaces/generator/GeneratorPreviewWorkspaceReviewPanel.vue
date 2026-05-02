<script setup lang="ts">
import type {
  GeneratorPreviewReviewEvidence,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceReviewPanelProps {
  t: GeneratorPreviewTranslation
  reviewEvidence: GeneratorPreviewReviewEvidence
  reviewActorLabel: string
  reviewDecisionLabel: string
  reviewedAtCopyLabel: string
  reviewActorCopyLabel: string
  reviewDecisionCopyLabel: string
  reviewCommentCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceReviewPanelProps>()

const emit = defineEmits<{
  (event: "copy-reviewed-at"): void
  (event: "copy-review-actor"): void
  (event: "copy-review-decision"): void
  (event: "copy-review-comment"): void
}>()
</script>

<template>
  <section class="panel-section">
    <p class="enterprise-subheading">{{ t("app.generatorPreview.reviewTitle") }}</p>
    <div class="enterprise-metadata">
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.reviewedAt") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="(reviewEvidence.reviewedAt ?? '').trim().length === 0"
            @click="emit('copy-reviewed-at')"
          >
            {{ reviewedAtCopyLabel }}
          </button>
        </div>
        <strong>{{ reviewEvidence.reviewedAt ?? "-" }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.actor") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="reviewActorLabel.trim().length === 0 || reviewActorLabel === '-'"
            @click="emit('copy-review-actor')"
          >
            {{ reviewActorCopyLabel }}
          </button>
        </div>
        <strong>{{ reviewActorLabel }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.reviewDecision") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="
              reviewDecisionLabel.trim().length === 0 ||
              reviewDecisionLabel === '-'
            "
            @click="emit('copy-review-decision')"
          >
            {{ reviewDecisionCopyLabel }}
          </button>
        </div>
        <strong>{{ reviewDecisionLabel }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.reviewComment") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="(reviewEvidence.comment ?? '').trim().length === 0"
            @click="emit('copy-review-comment')"
          >
            {{ reviewCommentCopyLabel }}
          </button>
        </div>
        <strong>{{ reviewEvidence.comment ?? "-" }}</strong>
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
