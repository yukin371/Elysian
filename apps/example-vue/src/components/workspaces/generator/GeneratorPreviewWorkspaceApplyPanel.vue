<script setup lang="ts">
import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceApplyPanelProps {
  t: GeneratorPreviewTranslation
  applyEvidence: GeneratorPreviewApplyEvidence
  applyActorLabel: string
  appliedAtCopyLabel: string
  applyActorCopyLabel: string
  manifestPathCopyLabel: string
  requestIdCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceApplyPanelProps>()

const emit = defineEmits<{
  (event: "copy-applied-at"): void
  (event: "copy-apply-actor"): void
  (event: "copy-manifest-path"): void
  (event: "copy-request-id"): void
}>()
</script>

<template>
  <section class="panel-section">
    <p class="enterprise-subheading">{{ t("app.generatorPreview.applyTitle") }}</p>
    <div class="enterprise-metadata">
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.appliedAt") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="(applyEvidence.appliedAt ?? '').trim().length === 0"
            @click="emit('copy-applied-at')"
          >
            {{ appliedAtCopyLabel }}
          </button>
        </div>
        <strong>{{ applyEvidence.appliedAt ?? "-" }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.actor") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="applyActorLabel.trim().length === 0 || applyActorLabel === '-'"
            @click="emit('copy-apply-actor')"
          >
            {{ applyActorCopyLabel }}
          </button>
        </div>
        <strong>{{ applyActorLabel }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.manifestPath") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="(applyEvidence.manifestPath ?? '').trim().length === 0"
            @click="emit('copy-manifest-path')"
          >
            {{ manifestPathCopyLabel }}
          </button>
        </div>
        <strong>{{ applyEvidence.manifestPath ?? "-" }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.requestId") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="(applyEvidence.requestId ?? '').trim().length === 0"
            @click="emit('copy-request-id')"
          >
            {{ requestIdCopyLabel }}
          </button>
        </div>
        <strong>{{ applyEvidence.requestId ?? "-" }}</strong>
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
