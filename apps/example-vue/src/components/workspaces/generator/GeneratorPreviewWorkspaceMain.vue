<script setup lang="ts">
import { Input as TInput } from "tdesign-vue-next/es/input"
import { Select as TSelect } from "tdesign-vue-next/es/select"

import type {
  GeneratorPreviewFileCard,
  GeneratorPreviewSchemaOption,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceMainProps {
  t: GeneratorPreviewTranslation
  schemaOptions: GeneratorPreviewSchemaOption[]
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  query: string
  filterSummary: string
  files: GeneratorPreviewFileCard[]
  selectedFilePath: string | null
}

const props = defineProps<GeneratorPreviewWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "update:selected-schema-name", value: string): void
  (e: "update:selected-frontend-target", value: "vue" | "react"): void
  (e: "update:query", value: string): void
  (e: "select-file", value: string): void
  (e: "reset-filters"): void
}>()

const frontendOptions = [
  { label: "Vue", value: "vue" },
  { label: "React", value: "react" },
] as const

const handleQueryInput = (value: string | number) => {
  emit("update:query", String(value))
}

const handleSchemaChange = (
  value: string | number | Array<string | number>,
) => {
  if (typeof value === "string") {
    emit("update:selected-schema-name", value)
  }
}

const handleFrontendChange = (
  value: string | number | Array<string | number>,
) => {
  if (value === "vue" || value === "react") {
    emit("update:selected-frontend-target", value)
  }
}
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <p class="enterprise-eyebrow">{{ t("app.generatorPreview.workspaceEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ t("app.generatorPreview.workspaceTitle") }}</h3>
    <p class="enterprise-copy">
      {{ t("app.generatorPreview.workspaceDescription") }}
    </p>

    <div class="enterprise-message enterprise-message-info section-gap">
      {{ t("app.generatorPreview.message.localOnly") }}
    </div>

    <div class="workspace-stack">
      <div class="generator-filter-grid">
        <label class="enterprise-field">
          <span>{{ t("app.generatorPreview.filter.schemaLabel") }}</span>
          <TSelect
            :model-value="selectedSchemaName"
            :options="schemaOptions"
            @update:model-value="handleSchemaChange"
          />
        </label>

        <label class="enterprise-field">
          <span>{{ t("app.generatorPreview.filter.frontendLabel") }}</span>
          <TSelect
            :model-value="selectedFrontendTarget"
            :options="frontendOptions"
            @update:model-value="handleFrontendChange"
          />
        </label>

        <label class="enterprise-field generator-filter-search">
          <span>{{ t("app.generatorPreview.filter.searchLabel") }}</span>
          <TInput
            :model-value="query"
            :placeholder="t('app.generatorPreview.filter.searchPlaceholder')"
            clearable
            @update:model-value="handleQueryInput"
          />
        </label>
      </div>

      <div class="generator-filter-summary">
        <span class="enterprise-toolbar-pill">{{ filterSummary }}</span>
        <button
          v-if="query.trim().length > 0"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('reset-filters')"
        >
          {{ t("app.generatorPreview.filter.reset") }}
        </button>
      </div>

      <div
        v-if="files.length === 0"
        class="enterprise-message enterprise-message-warning"
      >
        {{ t("app.generatorPreview.emptyFiltered") }}
      </div>

      <div v-else class="generator-file-list">
        <button
          v-for="file in files"
          :key="file.path"
          type="button"
          class="generator-file-card"
          :class="
            selectedFilePath === file.path ? 'generator-file-card-active' : ''
          "
          @click="emit('select-file', file.path)"
        >
          <div class="generator-file-card-header">
            <strong>{{ file.path }}</strong>
            <span>{{ file.lineCount }} {{ t("app.generatorPreview.meta.lines") }}</span>
          </div>
          <p>{{ file.reason }}</p>
          <div class="generator-file-card-meta">
            <span>{{ file.mergeStrategy }}</span>
            <span>{{ file.charCount }} chars</span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.enterprise-eyebrow,
.enterprise-heading,
.enterprise-copy,
.enterprise-field span,
.generator-file-card p,
.generator-file-card-meta {
  margin: 0;
}

.enterprise-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-heading {
  margin-top: 0.7rem;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-copy {
  margin-top: 0.75rem;
  line-height: 1.75;
  color: #475569;
}

.enterprise-field {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  color: #334155;
}

.enterprise-message {
  border-radius: 14px;
  padding: 1rem 1.1rem;
  line-height: 1.75;
}

.enterprise-message-info {
  border: 1px solid rgba(14, 165, 233, 0.18);
  background: rgba(14, 165, 233, 0.08);
  color: #0c4a6e;
}

.enterprise-message-warning {
  border: 1px solid rgba(245, 158, 11, 0.18);
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.enterprise-toolbar-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  padding: 0.45rem 0.85rem;
  font-size: 0.78rem;
  color: #475569;
}

.enterprise-button {
  border: 1px solid rgba(36, 87, 214, 0.18);
  border-radius: 12px;
  background: linear-gradient(135deg, #2457d6, #173ea6);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.65rem 1rem;
}

.enterprise-button-ghost {
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
}

.section-gap {
  margin-top: 1.25rem;
}

.workspace-stack {
  display: grid;
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.generator-filter-grid {
  display: grid;
  gap: 1rem;
}

.generator-filter-search {
  grid-column: 1 / -1;
}

.generator-filter-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.generator-file-list {
  display: grid;
  gap: 0.85rem;
}

.generator-file-card {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.96);
  padding: 1rem;
  text-align: left;
  color: #0f172a;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 140ms ease;
}

.generator-file-card:hover {
  transform: translateY(-1px);
  border-color: rgba(36, 87, 214, 0.24);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.08);
}

.generator-file-card-active {
  border-color: rgba(36, 87, 214, 0.45);
  box-shadow: 0 18px 32px rgba(36, 87, 214, 0.12);
}

.generator-file-card-header,
.generator-file-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  justify-content: space-between;
  align-items: center;
}

.generator-file-card p {
  margin-top: 0.7rem;
  color: #475569;
  line-height: 1.65;
}

.generator-file-card-meta {
  margin-top: 0.8rem;
  font-size: 0.78rem;
  color: #64748b;
}
</style>
