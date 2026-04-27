<script setup lang="ts">
import { Input as TInput } from "tdesign-vue-next/es/input"

import type {
  WorkflowDefinitionCard,
  WorkflowStatusFilter,
  WorkflowTranslation,
} from "./types"

interface WorkflowWorkspaceMainProps {
  t: WorkflowTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewDefinitions: boolean
  errorMessage: string
  loading: boolean
  query: string
  statusFilter: WorkflowStatusFilter
  filterSummary: string
  definitionCards: WorkflowDefinitionCard[]
  definitionCount: number
  selectedDefinitionId: string | null
}

const props = defineProps<WorkflowWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "update:query", value: string): void
  (e: "select-definition", definitionId: string): void
  (e: "select-status-filter", filter: WorkflowStatusFilter): void
  (e: "reset-filters"): void
}>()

const handleQueryInput = (value: string | number) => {
  emit("update:query", String(value))
}

const isStatusFilterActive = (filter: WorkflowStatusFilter) =>
  props.statusFilter === filter
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <p class="enterprise-eyebrow">{{ t("app.workflow.listEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ t("app.workflow.listTitle") }}</h3>
    <p class="enterprise-copy">{{ t("app.workflow.listDescription") }}</p>

    <div
      v-if="!moduleReady"
      class="enterprise-message enterprise-message-warning section-gap"
    >
      {{ t("app.message.workflowModuleOffline") }}
    </div>

    <div
      v-else-if="authModuleReady && !isAuthenticated"
      class="enterprise-message enterprise-message-info section-gap"
    >
      {{ t("app.message.workflowSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewDefinitions"
      class="enterprise-message enterprise-message-warning section-gap"
    >
      {{ t("app.message.workflowNoListPermission") }}
    </div>

    <div
      v-else-if="errorMessage"
      class="enterprise-message enterprise-message-danger section-gap"
    >
      {{ errorMessage }}
    </div>

    <div
      v-else-if="loading"
      class="enterprise-message enterprise-message-info section-gap"
    >
      {{ t("app.workflow.loading") }}
    </div>

    <div v-else class="workspace-stack">
      <div class="workflow-filter-bar">
        <label class="enterprise-field workflow-filter-search">
          <span>{{ t("app.workflow.filter.searchLabel") }}</span>
          <TInput
            :model-value="query"
            :placeholder="t('app.workflow.filter.searchPlaceholder')"
            clearable
            @update:model-value="handleQueryInput"
          />
        </label>

        <div class="workflow-filter-panel">
          <p class="enterprise-subheading">
            {{ t("app.workflow.filter.statusTitle") }}
          </p>
          <div class="workflow-filter-pills">
            <button
              type="button"
              class="workflow-filter-pill"
              :class="isStatusFilterActive('all') ? 'workflow-filter-pill-active' : ''"
              @click="emit('select-status-filter', 'all')"
            >
              {{ t("app.workflow.filter.all") }}
            </button>
            <button
              type="button"
              class="workflow-filter-pill"
              :class="isStatusFilterActive('active') ? 'workflow-filter-pill-active' : ''"
              @click="emit('select-status-filter', 'active')"
            >
              {{ t("app.workflow.filter.active") }}
            </button>
            <button
              type="button"
              class="workflow-filter-pill"
              :class="
                isStatusFilterActive('disabled') ? 'workflow-filter-pill-active' : ''
              "
              @click="emit('select-status-filter', 'disabled')"
            >
              {{ t("app.workflow.filter.disabled") }}
            </button>
          </div>
        </div>
      </div>

      <div class="workflow-filter-summary">
        <span class="enterprise-toolbar-pill">
          {{ filterSummary }}
        </span>
        <button
          v-if="query.trim().length > 0 || statusFilter !== 'all'"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('reset-filters')"
        >
          {{ t("app.workflow.filter.reset") }}
        </button>
      </div>

      <div
        v-if="definitionCards.length === 0"
        class="enterprise-message enterprise-message-info"
      >
        {{
          definitionCount === 0
            ? t("app.workflow.empty")
            : t("app.workflow.emptyFiltered")
        }}
      </div>

      <div v-else class="workflow-definition-list">
        <button
          v-for="definition in definitionCards"
          :key="definition.id"
          type="button"
          class="workflow-definition-card"
          :class="
            selectedDefinitionId === definition.id
              ? 'workflow-definition-card-active'
              : ''
          "
          @click="emit('select-definition', definition.id)"
        >
          <div class="workflow-definition-card-header">
            <div>
              <strong>{{ definition.name }}</strong>
              <p>{{ definition.key }}</p>
            </div>
            <span class="workflow-status-pill">
              {{ definition.statusLabel }}
            </span>
          </div>

          <div class="workflow-definition-card-meta">
            <span>v{{ definition.version }}</span>
            <span>
              {{ definition.nodeCount }}
              {{ t("app.workflow.meta.nodes") }}
            </span>
            <span>
              {{ definition.edgeCount }}
              {{ t("app.workflow.meta.edges") }}
            </span>
            <span>{{ definition.updatedAtLabel }}</span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.enterprise-eyebrow,
.enterprise-subheading {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-heading {
  margin: 0.7rem 0 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-copy {
  margin: 0.75rem 0 0;
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

.enterprise-message-danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.08);
  color: #991b1b;
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

.workflow-filter-bar {
  display: grid;
  gap: 1rem;
}

.workflow-filter-search {
  margin: 0;
}

.workflow-filter-panel,
.workflow-filter-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.workflow-filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.workflow-filter-pill {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.45rem 0.8rem;
}

.workflow-filter-pill-active {
  border-color: rgba(36, 87, 214, 0.3);
  background: rgba(36, 87, 214, 0.1);
  color: #173ea6;
}

.workflow-definition-list {
  display: grid;
  gap: 0.85rem;
}

.workflow-definition-card {
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

.workflow-definition-card:hover {
  transform: translateY(-1px);
  border-color: rgba(36, 87, 214, 0.24);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.08);
}

.workflow-definition-card-active {
  border-color: rgba(36, 87, 214, 0.45);
  box-shadow: 0 18px 32px rgba(36, 87, 214, 0.12);
}

.workflow-definition-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
}

.workflow-definition-card-header strong {
  display: block;
  font-size: 1rem;
}

.workflow-definition-card-header p {
  margin: 0.35rem 0 0;
  color: #64748b;
}

.workflow-definition-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 0.85rem;
  margin-top: 0.9rem;
  font-size: 0.8rem;
  color: #475569;
}

.workflow-status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(36, 87, 214, 0.1);
  color: #173ea6;
  padding: 0.28rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}
</style>
