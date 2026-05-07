<script setup lang="ts">
import type { WorkflowDefinitionRecord } from "@elysian/schema"
import { Dialog as TDialog } from "tdesign-vue-next/es/dialog"
import { Input as TInput } from "tdesign-vue-next/es/input"
import { computed } from "vue"

import type { WorkflowDefinitionCard, WorkflowTranslation } from "./types"

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
  definitionCards: WorkflowDefinitionCard[]
  definitionCount: number
  paginationSummary: string
  canGoToPreviousPage: boolean
  canGoToNextPage: boolean
  detailDialogOpen: boolean
  detailLoading: boolean
  detailErrorMessage: string
  selectedDefinition: WorkflowDefinitionRecord | null
  localizeStatus: (status: WorkflowDefinitionRecord["status"]) => string
  selectedDefinitionId: string | null
}

const props = defineProps<WorkflowWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "update:query", value: string): void
  (e: "select-definition", definitionId: string): void
  (e: "reset-filters"): void
  (e: "go-previous-page"): void
  (e: "go-next-page"): void
  (e: "close-detail"): void
}>()

const handleQueryInput = (value: string | number) => {
  emit("update:query", String(value))
}

const selectedDefinitionUpdatedAtLabel = computed(() =>
  props.selectedDefinition
    ? new Date(props.selectedDefinition.updatedAt).toLocaleString()
    : "",
)
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <div class="workflow-list-head">
      <h3 class="enterprise-heading">{{ t("app.workflow.listTitle") }}</h3>
    </div>

    <div
      v-if="!moduleReady"
      class="enterprise-message enterprise-message-warning enterprise-section-gap"
    >
      {{ t("app.message.workflowModuleOffline") }}
    </div>

    <div
      v-else-if="authModuleReady && !isAuthenticated"
      class="enterprise-message enterprise-message-info enterprise-section-gap"
    >
      {{ t("app.message.workflowSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewDefinitions"
      class="enterprise-message enterprise-message-warning enterprise-section-gap"
    >
      {{ t("app.message.workflowNoListPermission") }}
    </div>

    <div
      v-else-if="errorMessage"
      class="enterprise-message enterprise-message-danger enterprise-section-gap"
    >
      {{ errorMessage }}
    </div>

    <div
      v-else-if="loading"
      class="enterprise-message enterprise-message-info enterprise-section-gap"
    >
      {{ t("app.workflow.loading") }}
    </div>

    <div v-else class="enterprise-workspace-stack">
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

      </div>

      <button
        v-if="query.trim().length > 0"
        type="button"
        class="enterprise-button enterprise-button-ghost workflow-filter-reset"
        @click="emit('reset-filters')"
      >
        {{ t("app.workflow.filter.reset") }}
      </button>

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

      <div class="workflow-pagination">
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="!canGoToPreviousPage"
          @click="emit('go-previous-page')"
        >
          {{ t("app.workflow.pagination.previous") }}
        </button>
        <span>{{ paginationSummary }}</span>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="!canGoToNextPage"
          @click="emit('go-next-page')"
        >
          {{ t("app.workflow.pagination.next") }}
        </button>
      </div>
    </div>

    <TDialog
      :visible="detailDialogOpen"
      :header="
        selectedDefinition?.name ?? t('app.workflow.detailEmptyTitle')
      "
      width="760px"
      placement="center"
      :footer="false"
      destroy-on-close
      @close="emit('close-detail')"
      @update:visible="
        (visible) => {
          if (!visible) emit('close-detail')
        }
      "
    >
      <div class="workflow-detail-dialog">
        <div
          v-if="detailLoading && selectedDefinition"
          class="enterprise-inline-warning"
        >
          {{ t("app.workflow.detailLoading") }}
        </div>

        <div v-if="detailErrorMessage" class="enterprise-inline-warning">
          {{ detailErrorMessage }}
        </div>

        <div v-if="selectedDefinition" class="enterprise-metadata">
          <div>
            <span>{{ t("app.workflow.meta.status") }}</span>
            <strong>{{ localizeStatus(selectedDefinition.status) }}</strong>
          </div>
          <div>
            <span>{{ t("app.workflow.meta.key") }}</span>
            <strong>{{ selectedDefinition.key }}</strong>
          </div>
          <div>
            <span>{{ t("app.workflow.meta.version") }}</span>
            <strong>v{{ selectedDefinition.version }}</strong>
          </div>
          <div>
            <span>{{ t("app.workflow.meta.structure") }}</span>
            <strong>
              {{ selectedDefinition.definition.nodes.length }}
              {{ t("app.workflow.meta.nodes") }}
              / {{ selectedDefinition.definition.edges.length }}
              {{ t("app.workflow.meta.edges") }}
            </strong>
          </div>
          <div>
            <span>{{ t("app.workflow.meta.updatedAt") }}</span>
            <strong>{{ selectedDefinitionUpdatedAtLabel }}</strong>
          </div>
        </div>

        <div v-else class="enterprise-message enterprise-message-info">
          {{ t("app.workflow.detailEmpty") }}
        </div>
      </div>
    </TDialog>
  </section>
</template>

<style scoped>
.workflow-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.workflow-filter-bar {
  display: grid;
  gap: 0.75rem;
}

.workflow-filter-search {
  margin: 0;
}

.workflow-filter-reset {
  width: fit-content;
}

.workflow-definition-list {
  display: grid;
  gap: 0.6rem;
}

.workflow-definition-card {
  width: 100%;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.96);
  padding: 0.75rem 0.85rem;
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
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.06);
}

.workflow-definition-card-active {
  border-color: rgba(36, 87, 214, 0.45);
  box-shadow: 0 12px 22px rgba(36, 87, 214, 0.1);
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
  margin-top: 0.55rem;
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

.workflow-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  color: #475569;
  font-size: 0.82rem;
}

.workflow-detail-dialog {
  display: grid;
  gap: 0.85rem;
}
</style>
