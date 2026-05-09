<script setup lang="ts">
import { Input as TInput } from "tdesign-vue-next/es/input"

import GeneratorPreviewWorkspaceDraftOptionsSection from "./GeneratorPreviewWorkspaceDraftOptionsSection.vue"
import GeneratorPreviewWorkspaceSchemaEditorSection from "./GeneratorPreviewWorkspaceSchemaEditorSection.vue"
import type { GeneratorPreviewSchemaTemplate } from "./generator-preview-schema-templates"
import type {
  GeneratorPreviewSchemaOption,
  GeneratorPreviewTranslation,
} from "./types"

type GeneratorDraftSourceMode = "template" | "reference" | "json"

interface GeneratorOptionCard {
  description: string
  label: string
  value: string
}

interface GeneratorPreviewWorkspaceDraftStartPanelProps {
  t: GeneratorPreviewTranslation
  loading: boolean
  reviewLoading: boolean
  applyLoading: boolean
  errorMessage: string
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  selectedConflictStrategy: string
  manualSchemaDraft: string
  manualSchemaDraftError: string | null
  manualSchemaDraftErrorDetails: string | null
  draftModuleName: string
  draftModuleLabel: string
  canPatchDraftMeta: boolean
  draftSourceMode: GeneratorDraftSourceMode
  selectedTemplateId: string | null
  referenceSchemaQuery: string
  filteredReferenceSchemaOptions: GeneratorPreviewSchemaOption[]
  hiddenReferenceSchemaCount: number
  frontendOptionCards: GeneratorOptionCard[]
  conflictStrategyCards: GeneratorOptionCard[]
  draftSourceModeOptions: ReadonlyArray<{
    label: string
    value: GeneratorDraftSourceMode
  }>
  schemaTemplates: GeneratorPreviewSchemaTemplate[]
  configPrimaryActionLabel: string
  showSchemaEditor: boolean
  schemaEditorFacts: Array<{ label: string; value: string }>
}

const props = defineProps<GeneratorPreviewWorkspaceDraftStartPanelProps>()

const emit = defineEmits<{
  (e: "module-name-input", value: string | number): void
  (e: "module-label-input", value: string | number): void
  (e: "draft-source-mode-change", value: GeneratorDraftSourceMode): void
  (e: "load-schema-template", value: string): void
  (e: "reference-schema-query-input", value: string | number): void
  (e: "load-reference-schema-draft", value: string): void
  (e: "frontend-change", value: string): void
  (e: "conflict-strategy-change", value: string): void
  (e: "refresh-preview"): void
  (e: "schema-editor-toggle"): void
  (e: "manual-schema-draft-input", value: string | number): void
}>()

const showConfigError = () => props.errorMessage.trim().length > 0
</script>

<template>
  <section class="generator-block generator-config-block">
    <div class="generator-panel-head">
      <h3 class="generator-panel-title">
        {{ t("app.generatorPreview.inputTitle") }}
      </h3>
    </div>

    <div class="generator-config-grid">
      <label class="generator-config-field">
        <span class="generator-config-label">
          {{ t("app.generatorPreview.input.moduleNameLabel") }}
        </span>
        <TInput
          :model-value="draftModuleName"
          :disabled="loading || reviewLoading || applyLoading || !canPatchDraftMeta"
          :placeholder="t('app.generatorPreview.input.moduleNamePlaceholder')"
          @update:model-value="emit('module-name-input', $event)"
        />
      </label>

      <label class="generator-config-field">
        <span class="generator-config-label">
          {{ t("app.generatorPreview.input.moduleLabelLabel") }}
        </span>
        <TInput
          :model-value="draftModuleLabel"
          :disabled="loading || reviewLoading || applyLoading || !canPatchDraftMeta"
          :placeholder="t('app.generatorPreview.input.moduleLabelPlaceholder')"
          @update:model-value="emit('module-label-input', $event)"
        />
      </label>
    </div>

    <GeneratorPreviewWorkspaceDraftOptionsSection
      :t="t"
      :loading="loading"
      :review-loading="reviewLoading"
      :apply-loading="applyLoading"
      :selected-schema-name="selectedSchemaName"
      :selected-frontend-target="selectedFrontendTarget"
      :selected-conflict-strategy="selectedConflictStrategy"
      :draft-source-mode="draftSourceMode"
      :selected-template-id="selectedTemplateId"
      :reference-schema-query="referenceSchemaQuery"
      :filtered-reference-schema-options="filteredReferenceSchemaOptions"
      :hidden-reference-schema-count="hiddenReferenceSchemaCount"
      :frontend-option-cards="frontendOptionCards"
      :conflict-strategy-cards="conflictStrategyCards"
      :draft-source-mode-options="draftSourceModeOptions"
      :schema-templates="schemaTemplates"
      :config-primary-action-label="configPrimaryActionLabel"
      @draft-source-mode-change="emit('draft-source-mode-change', $event)"
      @load-schema-template="emit('load-schema-template', $event)"
      @reference-schema-query-input="emit('reference-schema-query-input', $event)"
      @load-reference-schema-draft="emit('load-reference-schema-draft', $event)"
      @frontend-change="emit('frontend-change', $event)"
      @conflict-strategy-change="emit('conflict-strategy-change', $event)"
      @refresh-preview="emit('refresh-preview')"
    />

    <GeneratorPreviewWorkspaceSchemaEditorSection
      :t="t"
      :manual-schema-draft="manualSchemaDraft"
      :manual-schema-draft-error="manualSchemaDraftError"
      :manual-schema-draft-error-details="manualSchemaDraftErrorDetails"
      :show-schema-editor="showSchemaEditor"
      :schema-editor-facts="schemaEditorFacts"
      @schema-editor-toggle="emit('schema-editor-toggle')"
      @manual-schema-draft-input="emit('manual-schema-draft-input', $event)"
    />

    <div
      v-if="showConfigError"
      class="enterprise-message enterprise-message-danger"
    >
      {{ errorMessage }}
    </div>
  </section>
</template>

<style scoped>
.generator-block {
  display: grid;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.92);
}

.generator-panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: 0.75rem 1rem;
}

.generator-panel-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.generator-config-grid {
  display: grid;
  gap: 0.9rem 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.generator-config-field {
  display: grid;
  gap: 0.5rem;
  min-width: 0;
}

.generator-config-label {
  color: #64748b;
  font-size: 0.77rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .generator-config-grid {
    grid-template-columns: 1fr;
  }
  .generator-panel-head {
    align-items: stretch;
  }
}
</style>
