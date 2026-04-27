<script setup lang="ts">
import { Input as TInput } from "tdesign-vue-next/es/input"
import { Select as TSelect } from "tdesign-vue-next/es/select"

import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewFileCard,
  GeneratorPreviewSchemaOption,
  GeneratorPreviewTranslation,
} from "./types"

interface GeneratorPreviewWorkspaceMainProps {
  t: GeneratorPreviewTranslation
  loading: boolean
  actionLoading: boolean
  errorMessage: string
  schemaOptions: GeneratorPreviewSchemaOption[]
  selectedSchemaName: string
  selectedFrontendTarget: "vue" | "react"
  query: string
  filterSummary: string
  files: GeneratorPreviewFileCard[]
  selectedFilePath: string | null
  canApply: boolean
  diffSummary: GeneratorPreviewDiffSummary | null
  sessionStatus: "ready" | "applied" | null
  applyEvidence: GeneratorPreviewApplyEvidence | null
  hasBlockingConflicts: boolean
}

const props = defineProps<GeneratorPreviewWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "update:selected-schema-name", value: string): void
  (e: "update:selected-frontend-target", value: "vue" | "react"): void
  (e: "update:query", value: string): void
  (e: "select-file", value: string): void
  (e: "reset-filters"): void
  (e: "refresh-preview"): void
  (e: "apply-preview"): void
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

      <div class="generator-toolbar">
        <div class="generator-toolbar-meta">
          <span class="enterprise-toolbar-pill">{{ filterSummary }}</span>
          <span v-if="sessionStatus" class="enterprise-toolbar-pill">
            {{
              t(
                sessionStatus === "applied"
                  ? "app.generatorPreview.status.applied"
                  : "app.generatorPreview.status.ready",
              )
            }}
          </span>
        </div>

        <div class="generator-toolbar-actions">
          <button
            v-if="query.trim().length > 0"
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('reset-filters')"
          >
            {{ t("app.generatorPreview.filter.reset") }}
          </button>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="loading || actionLoading"
            @click="emit('refresh-preview')"
          >
            {{
              loading
                ? t("app.generatorPreview.action.refreshing")
                : t("app.generatorPreview.action.refresh")
            }}
          </button>
          <button
            type="button"
            class="enterprise-button"
            :disabled="!canApply"
            @click="emit('apply-preview')"
          >
            {{
              actionLoading
                ? t("app.generatorPreview.action.applying")
                : t("app.generatorPreview.action.apply")
            }}
          </button>
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="enterprise-message enterprise-message-danger"
      >
        {{ errorMessage }}
      </div>

      <div
        v-else-if="hasBlockingConflicts"
        class="enterprise-message enterprise-message-warning"
      >
        {{ t("app.generatorPreview.message.blockingConflicts") }}
      </div>

      <div
        v-if="diffSummary"
        class="generator-summary-grid"
      >
        <article>
          <small>{{ t("app.generatorPreview.summary.changed") }}</small>
          <strong>{{ diffSummary.changedFileCount }}</strong>
        </article>
        <article>
          <small>{{ t("app.generatorPreview.summary.create") }}</small>
          <strong>{{ diffSummary.actionCounts.create }}</strong>
        </article>
        <article>
          <small>{{ t("app.generatorPreview.summary.overwrite") }}</small>
          <strong>{{ diffSummary.actionCounts.overwrite }}</strong>
        </article>
        <article>
          <small>{{ t("app.generatorPreview.summary.skip") }}</small>
          <strong>{{ diffSummary.actionCounts.skip }}</strong>
        </article>
        <article>
          <small>{{ t("app.generatorPreview.summary.block") }}</small>
          <strong>{{ diffSummary.actionCounts.block }}</strong>
        </article>
      </div>

      <div
        v-if="applyEvidence"
        class="enterprise-message enterprise-message-success"
      >
        {{
          t("app.generatorPreview.message.applied", {
            value: applyEvidence.appliedAt ?? "-",
          })
        }}
      </div>

      <div
        v-if="loading"
        class="enterprise-message enterprise-message-info"
      >
        {{ t("app.generatorPreview.loading") }}
      </div>

      <div
        v-else-if="files.length === 0"
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
            <span class="generator-file-card-action">
              {{ t(`app.generatorPreview.actionLabel.${file.plannedAction}`) }}
            </span>
            <span>{{ file.mergeStrategy }}</span>
            <span>{{ file.charCount }} chars</span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.enterprise-field span,
.generator-file-card p,
.generator-file-card-meta {
  margin: 0;
}

.enterprise-field {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  color: #334155;
}

.enterprise-message {
  border-radius: 12px;
  padding: 0.9rem 1rem;
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

.enterprise-message-danger {
  border: 1px solid rgba(239, 68, 68, 0.2);
  background: rgba(254, 242, 242, 0.95);
  color: #991b1b;
}

.enterprise-message-success {
  border: 1px solid rgba(34, 197, 94, 0.2);
  background: rgba(240, 253, 244, 0.96);
  color: #166534;
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

.workspace-stack {
  display: grid;
  gap: 1.25rem;
}

.generator-filter-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.generator-filter-search {
  grid-column: 1 / -1;
}

.generator-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
}

.generator-toolbar-meta,
.generator-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.generator-file-list {
  display: grid;
  gap: 0.85rem;
}

.generator-summary-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
}

.generator-summary-grid article {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(248, 250, 252, 0.56);
  padding: 0.9rem 1rem;
}

.generator-summary-grid small,
.generator-summary-grid strong {
  display: block;
}

.generator-summary-grid small {
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.generator-summary-grid strong {
  margin-top: 0.45rem;
  color: #0f172a;
  font-size: 1.05rem;
}

.generator-file-card {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.88);
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
  border-color: rgba(36, 87, 214, 0.2);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.06);
}

.generator-file-card-active {
  border-color: rgba(36, 87, 214, 0.45);
  box-shadow: 0 12px 22px rgba(36, 87, 214, 0.1);
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

.generator-file-card-action {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.8);
  padding: 0.2rem 0.55rem;
  color: #334155;
}

@media (max-width: 900px) {
  .generator-filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
