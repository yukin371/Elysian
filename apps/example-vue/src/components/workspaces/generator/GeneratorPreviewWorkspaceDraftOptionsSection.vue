<script setup lang="ts">
import { Input as TInput } from "tdesign-vue-next/es/input"

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

interface GeneratorPreviewWorkspaceDraftOptionsSectionProps {
  t: GeneratorPreviewTranslation
  loading: boolean
  reviewLoading: boolean
  applyLoading: boolean
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  selectedConflictStrategy: string
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
}

defineProps<GeneratorPreviewWorkspaceDraftOptionsSectionProps>()

const emit = defineEmits<{
  (e: "draft-source-mode-change", value: GeneratorDraftSourceMode): void
  (e: "load-schema-template", value: string): void
  (e: "reference-schema-query-input", value: string | number): void
  (e: "load-reference-schema-draft", value: string): void
  (e: "frontend-change", value: string): void
  (e: "conflict-strategy-change", value: string): void
  (e: "refresh-preview"): void
}>()
</script>

<template>
  <div class="generator-option-matrix">
    <div class="generator-option-row">
      <div class="generator-option-label">
        <h4 class="generator-group-title">
          {{ t("app.generatorPreview.inputModeLabel") }}
        </h4>
      </div>
      <div class="generator-option-values generator-option-values-mode">
        <button
          v-for="option in draftSourceModeOptions"
          :key="option.value"
          type="button"
          class="generator-option-item generator-option-mode"
          :class="
            draftSourceMode === option.value
              ? 'generator-option-item-active'
              : ''
          "
          :disabled="loading || reviewLoading || applyLoading"
          @click="emit('draft-source-mode-change', option.value)"
        >
          <strong>{{ option.label }}</strong>
        </button>
      </div>
    </div>

    <div v-if="draftSourceMode === 'template'" class="generator-option-row">
      <div class="generator-option-label">
        <h4 class="generator-group-title">
          {{ t("app.generatorPreview.input.templateLabel") }}
        </h4>
      </div>
      <div class="generator-option-values generator-option-values-templates">
        <button
          v-for="template in schemaTemplates"
          :key="template.id"
          type="button"
          class="generator-option-item generator-option-item-detail"
          :class="
            selectedTemplateId === template.id
              ? 'generator-option-item-active'
              : ''
          "
          :disabled="loading || reviewLoading || applyLoading"
          @click="emit('load-schema-template', template.id)"
        >
          <strong>{{ template.label }}</strong>
          <span>{{ template.description }}</span>
        </button>
      </div>
    </div>

    <div v-else-if="draftSourceMode === 'reference'" class="generator-option-row">
      <div class="generator-option-label">
        <h4 class="generator-group-title">
          {{ t("app.generatorPreview.inputTemplateLabel") }}
        </h4>
      </div>
      <div class="generator-reference-picker">
        <TInput
          :model-value="referenceSchemaQuery"
          clearable
          :placeholder="t('app.generatorPreview.referenceSearchPlaceholder')"
          @update:model-value="emit('reference-schema-query-input', $event)"
        />
        <div class="generator-option-values generator-option-values-reference">
          <button
            v-for="option in filteredReferenceSchemaOptions"
            :key="option.value"
            type="button"
            class="generator-option-item generator-option-chip"
            :class="
              selectedSchemaName === option.value
                ? 'generator-option-item-active'
                : ''
            "
            :disabled="loading || reviewLoading || applyLoading"
            @click="emit('load-reference-schema-draft', option.value)"
          >
            <strong>{{ option.label }}</strong>
            <span>{{ option.value }}</span>
          </button>
        </div>
        <div
          v-if="filteredReferenceSchemaOptions.length === 0"
          class="generator-option-empty"
        >
          {{ t("app.generatorPreview.referenceSearchEmpty") }}
        </div>
        <div
          v-else-if="hiddenReferenceSchemaCount > 0"
          class="generator-option-meta"
        >
          {{
            t("app.generatorPreview.referenceSearchMore", {
              count: hiddenReferenceSchemaCount,
            })
          }}
        </div>
      </div>
    </div>

    <div class="generator-option-row">
      <div class="generator-option-label">
        <h4 class="generator-group-title">
          {{ t("app.generatorPreview.filter.frontendLabel") }}
        </h4>
      </div>
      <div class="generator-option-values generator-option-values-inline">
        <button
          v-for="option in frontendOptionCards"
          :key="option.value"
          type="button"
          class="generator-option-item generator-option-item-inline"
          :class="
            selectedFrontendTarget === option.value
              ? 'generator-option-item-active'
              : ''
          "
          :disabled="loading || reviewLoading || applyLoading"
          @click="emit('frontend-change', option.value)"
        >
          <strong>{{ option.label }}</strong>
          <span>{{ option.description }}</span>
        </button>
      </div>
    </div>

    <div class="generator-option-row">
      <div class="generator-option-label">
        <h4 class="generator-group-title">
          {{ t("app.generatorPreview.filter.conflictLabel") }}
        </h4>
      </div>
      <div class="generator-option-values generator-option-values-inline">
        <button
          v-for="option in conflictStrategyCards"
          :key="option.value"
          type="button"
          class="generator-option-item generator-option-item-inline"
          :class="
            selectedConflictStrategy === option.value
              ? 'generator-option-item-active'
              : ''
          "
          :disabled="loading || reviewLoading || applyLoading"
          @click="emit('conflict-strategy-change', option.value)"
        >
          <strong>{{ option.label }}</strong>
          <span>{{ option.description }}</span>
        </button>
      </div>
    </div>
  </div>

  <div class="generator-toolbar-actions">
    <button
      type="button"
      class="enterprise-button"
      :disabled="loading || reviewLoading || applyLoading"
      @click="emit('refresh-preview')"
    >
      {{ configPrimaryActionLabel }}
    </button>
  </div>
</template>

<style scoped>
.generator-option-matrix {
  display: grid;
  gap: 0;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.5);
}

.generator-option-row {
  display: grid;
  grid-template-columns: 8.5rem minmax(0, 1fr);
  gap: 0.9rem;
  padding: 0.72rem 0.85rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-option-row:first-child {
  border-top: 0;
}

.generator-option-label {
  display: flex;
  align-items: flex-start;
  padding-top: 0.2rem;
}

.generator-group-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 700;
}

.generator-option-values {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-width: 0;
}

.generator-option-values-mode {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.generator-option-values-templates {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.generator-reference-picker {
  display: grid;
  gap: 0.5rem;
}

.generator-option-values-reference {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8.2rem, 1fr));
  gap: 0.35rem;
}

.generator-option-values-inline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
}

.generator-option-item {
  display: grid;
  gap: 0.2rem;
  text-align: left;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 4px;
  background: #fff;
  color: #0f172a;
  padding: 0.55rem 0.7rem;
}

.generator-option-item strong {
  font-size: 0.79rem;
  font-weight: 700;
}

.generator-option-item span {
  color: #475569;
  font-size: 0.72rem;
  line-height: 1.35;
}

.generator-option-mode {
  min-height: 0;
  align-items: center;
}

.generator-option-mode strong {
  font-size: 0.78rem;
}

.generator-option-item-detail {
  min-height: 4.1rem;
}

.generator-option-item-inline {
  min-height: 3.3rem;
}

.generator-option-chip {
  gap: 0.1rem;
  min-height: 0;
  padding: 0.45rem 0.6rem;
}

.generator-option-chip strong {
  font-size: 0.76rem;
}

.generator-option-chip span {
  font-size: 0.7rem;
  line-height: 1.25;
}

.generator-option-item-active {
  border-color: rgba(36, 87, 214, 0.32);
  background: rgba(36, 87, 214, 0.08);
}

.generator-option-empty,
.generator-option-meta {
  color: #64748b;
  font-size: 0.74rem;
  line-height: 1.4;
}

.generator-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

@media (max-width: 640px) {
  .generator-option-row,
  .generator-option-values-mode,
  .generator-option-values-templates,
  .generator-option-values-inline {
    grid-template-columns: 1fr;
  }

  .generator-option-row {
    gap: 0.6rem;
  }

  .generator-option-values-reference {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .generator-toolbar-actions {
    width: 100%;
  }
}
</style>
