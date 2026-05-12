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

const totalDefinitionCount = computed(() =>
  props.definitionCount > 0
    ? props.definitionCount
    : props.definitionCards.length,
)

const workspaceStateMessage = computed(() => {
  if (!props.moduleReady) {
    return {
      tone: "warning" as const,
      text: props.t("app.message.workflowModuleOffline"),
    }
  }

  if (props.authModuleReady && !props.isAuthenticated) {
    return {
      tone: "info" as const,
      text: props.t("app.message.workflowSignInToLoad"),
    }
  }

  if (props.canEnterWorkspace && !props.canViewDefinitions) {
    return {
      tone: "warning" as const,
      text: props.t("app.message.workflowNoListPermission"),
    }
  }

  if (props.errorMessage) {
    return {
      tone: "danger" as const,
      text: props.errorMessage,
    }
  }

  if (props.loading) {
    return {
      tone: "info" as const,
      text: props.t("app.workflow.loading"),
    }
  }

  return null
})

const selectedDefinitionUpdatedAtLabel = computed(() =>
  props.selectedDefinition
    ? new Date(props.selectedDefinition.updatedAt).toLocaleString()
    : "",
)

const selectedNodeTypeSummary = computed(() => {
  const nodes = props.selectedDefinition?.definition.nodes ?? []

  return ["start", "approval", "condition", "end"].map((type) => ({
    key: type,
    label: props.t(`app.workflow.nodeType.${type}`),
    count: nodes.filter((node) => node.type === type).length,
  }))
})

const selectedTotalNodeCount = computed(
  () => props.selectedDefinition?.definition.nodes.length ?? 0,
)

const selectedTotalEdgeCount = computed(
  () => props.selectedDefinition?.definition.edges.length ?? 0,
)
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <div
      v-if="workspaceStateMessage"
      :class="[
        'enterprise-message',
        `enterprise-message-${workspaceStateMessage.tone}`,
        'workflow-state-note',
      ]"
    >
      {{ workspaceStateMessage.text }}
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

        <button
          v-if="query.trim().length > 0"
          type="button"
          class="enterprise-button enterprise-button-ghost workflow-filter-reset"
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
          totalDefinitionCount === 0
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

        <div v-if="selectedDefinition" class="workflow-detail-structure">
          <div class="workflow-detail-rail" aria-label="workflow structure">
            <span
              v-for="segment in selectedNodeTypeSummary"
              :key="segment.key"
              class="workflow-detail-segment"
            >
              <strong>{{ segment.count }}</strong>
              <span>{{ segment.label }}</span>
            </span>
          </div>

          <div class="workflow-detail-strip">
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
                {{ selectedTotalNodeCount }} {{ t("app.workflow.meta.nodes") }} /
                {{ selectedTotalEdgeCount }} {{ t("app.workflow.meta.edges") }}
              </strong>
            </div>
            <div>
              <span>{{ t("app.workflow.meta.updatedAt") }}</span>
              <strong>{{ selectedDefinitionUpdatedAtLabel }}</strong>
            </div>
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
.workflow-state-note {
  margin-top: 0.2rem;
}

.workflow-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.75rem;
}

.workflow-filter-search {
  margin: 0;
  flex: 1 1 20rem;
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

.workflow-detail-structure {
  display: grid;
  gap: 0.85rem;
}

.workflow-detail-rail {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.workflow-detail-segment {
  display: grid;
  gap: 0.2rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.92);
  padding: 0.65rem 0.75rem;
  min-width: 0;
}

.workflow-detail-segment strong {
  color: #0f172a;
  font-size: 1rem;
}

.workflow-detail-segment span {
  color: #64748b;
  font-size: 0.76rem;
}

.workflow-detail-strip {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  padding: 0.75rem 0;
}

.workflow-detail-strip > div {
  display: grid;
  gap: 0.2rem;
}

.workflow-detail-strip span,
.workflow-detail-strip strong {
  min-width: 0;
}

.workflow-detail-strip span {
  color: #64748b;
  font-size: 0.76rem;
}

.workflow-detail-strip strong {
  color: #0f172a;
  font-size: 0.92rem;
}

.workflow-detail-dialog {
  display: grid;
  gap: 0.85rem;
}

@media (max-width: 900px) {
  .workflow-filter-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .workflow-detail-rail,
  .workflow-detail-strip {
    grid-template-columns: 1fr;
  }
}
</style>
