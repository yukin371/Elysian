<script setup lang="ts">
import type { GeneratorPreviewFileCard, GeneratorPreviewTranslation } from "./types"

interface GeneratorPreviewWorkspaceFileDecisionPanelProps {
  t: GeneratorPreviewTranslation
  selectedFile: GeneratorPreviewFileCard
  selectedExistsLabel: string
  selectedManagedLabel: string
  absolutePathCopyLabel: string
  existsCopyLabel: string
  managedCopyLabel: string
  templateReasonCopyLabel: string
  plannedReasonCopyLabel: string
}

defineProps<GeneratorPreviewWorkspaceFileDecisionPanelProps>()

const emit = defineEmits<{
  (event: "copy-absolute-path"): void
  (event: "copy-exists"): void
  (event: "copy-managed"): void
  (event: "copy-template-reason"): void
  (event: "copy-planned-reason"): void
}>()
</script>

<template>
  <section class="panel-section mt-5">
    <div class="generator-code-toolbar">
      <p class="enterprise-subheading">
        {{ t("app.generatorPreview.fileDecisionTitle") }}
      </p>
      <button
        type="button"
        class="enterprise-button enterprise-button-ghost"
        :disabled="selectedFile.absolutePath.trim().length === 0"
        @click="emit('copy-absolute-path')"
      >
        {{ absolutePathCopyLabel }}
      </button>
    </div>
    <div class="enterprise-metadata">
      <div>
        <span>{{ t("app.generatorPreview.meta.absolutePath") }}</span>
        <strong>{{ selectedFile.absolutePath }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.exists") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('copy-exists')"
          >
            {{ existsCopyLabel }}
          </button>
        </div>
        <strong>{{ selectedExistsLabel }}</strong>
      </div>
      <div>
        <div class="generator-metadata-label">
          <span>{{ t("app.generatorPreview.meta.managed") }}</span>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('copy-managed')"
          >
            {{ managedCopyLabel }}
          </button>
        </div>
        <strong>{{ selectedManagedLabel }}</strong>
      </div>
    </div>
    <div class="generator-explanation-grid">
      <article>
        <div class="generator-metadata-label">
          <strong>{{ t("app.generatorPreview.meta.templateReason") }}</strong>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="selectedFile.reason.trim().length === 0"
            @click="emit('copy-template-reason')"
          >
            {{ templateReasonCopyLabel }}
          </button>
        </div>
        <p>{{ selectedFile.reason }}</p>
      </article>
      <article>
        <div class="generator-metadata-label">
          <strong>{{ t("app.generatorPreview.meta.plannedReason") }}</strong>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="selectedFile.plannedReason.trim().length === 0"
            @click="emit('copy-planned-reason')"
          >
            {{ plannedReasonCopyLabel }}
          </button>
        </div>
        <p>{{ selectedFile.plannedReason }}</p>
      </article>
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

.generator-code-toolbar,
.generator-metadata-label {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

.generator-explanation-grid {
  display: grid;
  gap: 0.75rem;
}

.generator-explanation-grid article {
  display: grid;
  gap: 0.35rem;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.72);
  padding: 0.85rem 0.95rem;
}

.generator-explanation-grid p {
  margin: 0;
  color: #475569;
}
</style>
