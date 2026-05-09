<script setup lang="ts">
import { computed } from "vue"

import { Textarea as TTextarea } from "tdesign-vue-next/es/textarea"

import type { GeneratorPreviewTranslation } from "./types"

interface GeneratorPreviewWorkspaceSchemaEditorSectionProps {
  t: GeneratorPreviewTranslation
  manualSchemaDraft: string
  manualSchemaDraftError: string | null
  manualSchemaDraftErrorDetails: string | null
  showSchemaEditor: boolean
  schemaEditorFacts: Array<{ label: string; value: string }>
}

const props = defineProps<GeneratorPreviewWorkspaceSchemaEditorSectionProps>()

const emit = defineEmits<{
  (e: "schema-editor-toggle"): void
  (e: "manual-schema-draft-input", value: string | number): void
}>()

const hasManualSchemaDraftErrorDetails = computed(() =>
  Boolean(props.manualSchemaDraftErrorDetails?.trim()),
)
</script>

<template>
  <section class="generator-group generator-schema-group">
    <div class="generator-panel-head">
      <h4 class="generator-group-title">
        {{ t("app.generatorPreview.input.manualSchemaDraftLabel") }}
      </h4>
      <button
        type="button"
        class="enterprise-button enterprise-button-ghost"
        @click="emit('schema-editor-toggle')"
      >
        {{
          showSchemaEditor
            ? t("app.generatorPreview.action.collapseSchemaEditor")
            : t("app.generatorPreview.action.expandSchemaEditor")
        }}
      </button>
    </div>

    <div class="generator-status-facts generator-status-facts-compact">
      <div
        v-for="fact in schemaEditorFacts"
        :key="fact.label"
        class="generator-status-fact"
      >
        <span>{{ fact.label }}</span>
        <strong>{{ fact.value }}</strong>
      </div>
    </div>

    <label
      v-if="showSchemaEditor"
      class="generator-config-field generator-manual-draft"
    >
      <TTextarea
        :model-value="manualSchemaDraft"
        :maxlength="12000"
        :autosize="{ minRows: 10, maxRows: 24 }"
        :placeholder="t('app.generatorPreview.input.manualSchemaDraftPlaceholder')"
        @update:model-value="emit('manual-schema-draft-input', $event)"
      />
    </label>

    <div
      v-if="manualSchemaDraftError"
      class="enterprise-message enterprise-message-danger"
    >
      {{ manualSchemaDraftError }}
    </div>

    <pre
      v-if="hasManualSchemaDraftErrorDetails"
      class="generator-validation-details"
    ><strong>{{ t("app.generatorPreview.input.validationDetails") }}</strong>
{{ manualSchemaDraftErrorDetails }}</pre>
  </section>
</template>

<style scoped>
.generator-group {
  display: grid;
  gap: 0.7rem;
}

.generator-schema-group {
  padding-top: 0.9rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.generator-panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: 0.75rem 1rem;
}

.generator-group-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 700;
}

.generator-status-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
  gap: 0.6rem;
}

.generator-status-facts-compact {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.generator-status-fact {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.96);
}

.generator-status-fact span {
  color: #64748b;
  font-size: 0.75rem;
}

.generator-status-fact strong {
  color: #0f172a;
  font-size: 0.84rem;
  line-height: 1.45;
  word-break: break-word;
}

.generator-config-field {
  display: grid;
  gap: 0.5rem;
  min-width: 0;
}

.generator-manual-draft {
  display: grid;
}

.generator-validation-details {
  margin: 0;
  padding: 0.85rem 0.95rem;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.04);
  color: #334155;
  font-size: 0.82rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

@media (max-width: 640px) {
  .generator-status-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .generator-status-facts-compact {
    grid-template-columns: 1fr;
  }

  .generator-status-fact {
    padding: 0.65rem 0.7rem;
  }

  .generator-panel-head {
    align-items: stretch;
  }
}
</style>
