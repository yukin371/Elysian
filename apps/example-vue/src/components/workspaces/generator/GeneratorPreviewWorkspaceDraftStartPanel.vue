<script setup lang="ts">
import { Input as TInput } from "tdesign-vue-next/es/input"

import GeneratorPreviewWorkspaceDraftOptionsSection from "./GeneratorPreviewWorkspaceDraftOptionsSection.vue"
import GeneratorPreviewWorkspaceSchemaEditorSection from "./GeneratorPreviewWorkspaceSchemaEditorSection.vue"
import type { GeneratorPreviewSchemaTemplate } from "./generator-preview-schema-templates"
import type {
  GeneratorPreviewSchemaOption,
  GeneratorPreviewTranslation,
} from "./types"

type GeneratorDraftSourceMode = "template" | "reference"

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
  manualSchemaDraftErrorSuggestion: string | null
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
  configErrorRecoverySteps: string[]
  showSchemaEditor: boolean
  schemaEditorFacts: Array<{ label: string; value: string }>
  draftSummaryFacts: Array<{ label: string; value: string }>
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
      <div class="generator-panel-copy">
        <p class="generator-panel-eyebrow">
          {{ t("app.generatorPreview.inputTitle") }}
        </p>
        <h3 class="generator-panel-title">
          {{ t("app.generatorPreview.startHeadline") }}
        </h3>
        <p class="generator-panel-description">
          {{ t("app.generatorPreview.startDescription") }}
        </p>
      </div>
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
        <span class="generator-config-helper">
          {{ t("app.generatorPreview.input.moduleNameHelper") }}
        </span>
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
        <span class="generator-config-helper">
          {{ t("app.generatorPreview.input.moduleLabelHelper") }}
        </span>
      </label>
    </div>

    <div class="generator-draft-summary">
      <div
        v-for="fact in draftSummaryFacts"
        :key="fact.label"
        class="generator-draft-summary-item"
      >
        <span>{{ fact.label }}</span>
        <strong>{{ fact.value }}</strong>
      </div>
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

    <section class="generator-next-step">
      <div class="generator-next-step-copy">
        <span>{{ t("app.generatorPreview.startNextStepLabel") }}</span>
        <strong>{{ t("app.generatorPreview.startNextStepValue") }}</strong>
      </div>
      <button
        type="button"
        class="enterprise-button"
        :disabled="loading || reviewLoading || applyLoading"
        @click="emit('refresh-preview')"
      >
        {{ configPrimaryActionLabel }}
      </button>
    </section>

    <GeneratorPreviewWorkspaceSchemaEditorSection
      :t="t"
      :manual-schema-draft="manualSchemaDraft"
      :manual-schema-draft-error="manualSchemaDraftError"
      :manual-schema-draft-error-details="manualSchemaDraftErrorDetails"
      :manual-schema-draft-error-suggestion="manualSchemaDraftErrorSuggestion"
      :show-schema-editor="showSchemaEditor"
      :schema-editor-facts="schemaEditorFacts"
      @schema-editor-toggle="emit('schema-editor-toggle')"
      @manual-schema-draft-input="emit('manual-schema-draft-input', $event)"
    />

    <div
      v-if="showConfigError"
      class="generator-config-error"
    >
      <div class="enterprise-message enterprise-message-danger">
        {{ errorMessage }}
      </div>
      <section
        v-if="configErrorRecoverySteps.length > 0"
        class="generator-config-recovery"
      >
        <strong>{{ t("app.generatorPreview.errorRecoveryTitle") }}</strong>
        <ol>
          <li
            v-for="step in configErrorRecoverySteps"
            :key="step"
          >
            {{ step }}
          </li>
        </ol>
      </section>
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

.generator-panel-copy {
  display: grid;
  gap: 0.25rem;
}

.generator-panel-eyebrow {
  margin: 0;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.generator-panel-title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
}

.generator-panel-description {
  margin: 0;
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.55;
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

.generator-config-helper {
  color: #64748b;
  font-size: 0.73rem;
  line-height: 1.45;
}

.generator-draft-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
}

.generator-draft-summary-item {
  display: grid;
  gap: 0.22rem;
  min-width: 0;
  padding: 0.7rem 0.78rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.68);
}

.generator-draft-summary-item span {
  color: #64748b;
  font-size: 0.74rem;
}

.generator-draft-summary-item strong {
  color: #0f172a;
  font-size: 0.83rem;
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
}

.generator-config-error {
  display: grid;
  gap: 0.7rem;
}

.generator-next-step {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem 1rem;
  padding: 0.9rem 1rem;
  border: 1px dashed rgba(36, 87, 214, 0.26);
  border-radius: 6px;
  background: rgba(36, 87, 214, 0.04);
}

.generator-next-step-copy {
  display: grid;
  gap: 0.2rem;
}

.generator-next-step-copy span {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
}

.generator-next-step-copy strong {
  color: #0f172a;
  font-size: 0.82rem;
  line-height: 1.45;
}

.generator-config-recovery {
  display: grid;
  gap: 0.42rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.72);
}

.generator-config-recovery strong {
  color: #0f172a;
  font-size: 0.81rem;
  font-weight: 700;
}

.generator-config-recovery ol {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding-left: 1.1rem;
  color: #475569;
  font-size: 0.78rem;
  line-height: 1.45;
}

@media (max-width: 640px) {
  .generator-config-grid {
    grid-template-columns: 1fr;
  }

  .generator-draft-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .generator-panel-head {
    align-items: stretch;
  }
}
</style>
