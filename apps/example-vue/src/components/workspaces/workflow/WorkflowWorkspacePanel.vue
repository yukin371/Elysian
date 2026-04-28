<script setup lang="ts">
import { computed } from "vue"

import type { WorkflowDefinitionRecord } from "@elysian/schema"

import type {
  WorkflowDefinitionCard,
  WorkflowDefinitionDetailCard,
  WorkflowTranslation,
} from "./types"

interface WorkflowWorkspacePanelProps {
  t: WorkflowTranslation
  locale: string
  detailLoading: boolean
  detailErrorMessage: string
  selectedDefinition: WorkflowDefinitionRecord | null
  selectedDefinitionId: string | null
  versionHistoryCards: WorkflowDefinitionCard[]
  detailCards: WorkflowDefinitionDetailCard[]
  localizeStatus: (status: WorkflowDefinitionRecord["status"]) => string
}

const props = defineProps<WorkflowWorkspacePanelProps>()

const emit =
  defineEmits<(e: "select-definition", definitionId: string) => void>()

const selectedDefinitionUpdatedAtLabel = computed(() =>
  props.selectedDefinition
    ? new Date(props.selectedDefinition.updatedAt).toLocaleString(props.locale)
    : "",
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.workflow.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">
      {{
        selectedDefinition?.name ??
        t("app.workflow.detailEmptyTitle")
      }}
    </h3>
    <p class="enterprise-copy">
      {{
        selectedDefinition
          ? t("app.workflow.detailDescription")
          : t("app.workflow.detailEmpty")
      }}
    </p>

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

    <div v-if="selectedDefinition" class="panel-stack">
      <div>
        <p class="enterprise-subheading">
          {{ t("app.workflow.versionHistoryTitle") }}
        </p>
        <div
          v-if="versionHistoryCards.length > 0"
          class="workflow-version-history"
        >
          <button
            v-for="definition in versionHistoryCards"
            :key="definition.id"
            type="button"
            class="workflow-version-card"
            :class="
              selectedDefinitionId === definition.id
                ? 'workflow-version-card-active'
                : ''
            "
            @click="emit('select-definition', definition.id)"
          >
            <strong>v{{ definition.version }}</strong>
            <span>{{ definition.statusLabel }}</span>
            <small>{{ definition.updatedAtLabel }}</small>
          </button>
        </div>
      </div>

      <div>
        <p class="enterprise-subheading">
          {{ t("app.workflow.nodeFlowTitle") }}
        </p>
        <ul class="workflow-node-list">
          <li
            v-for="node in detailCards"
            :key="node.id"
            class="workflow-node-item"
          >
            <div class="workflow-node-item-header">
              <strong>{{ node.name }}</strong>
              <span>{{ node.typeLabel }}</span>
            </div>
            <p v-if="node.description" class="workflow-node-copy">
              {{ node.description }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.enterprise-eyebrow,
.enterprise-subheading,
.enterprise-metadata span {
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

.enterprise-inline-warning {
  margin-top: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.16);
  background: rgba(255, 251, 235, 0.96);
  padding: 0.85rem 0.95rem;
  color: #92400e;
}

.enterprise-metadata {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.enterprise-metadata div {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.92);
  padding: 0.85rem 0.95rem;
}

.enterprise-metadata strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
}

.panel-stack {
  display: grid;
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.workflow-version-history {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.75rem;
}

.workflow-version-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.7rem 0.85rem;
}

.workflow-version-card-active {
  border-color: rgba(36, 87, 214, 0.3);
  background: rgba(36, 87, 214, 0.1);
  color: #173ea6;
}

.workflow-version-card small {
  color: #64748b;
}

.workflow-node-list {
  display: grid;
  gap: 0.85rem;
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
}

.workflow-node-item {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.96);
  padding: 1rem;
  text-align: left;
  color: #0f172a;
}

.workflow-node-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
}

.workflow-node-item-header strong {
  display: block;
  font-size: 1rem;
}

.workflow-node-item-header span {
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

.workflow-node-copy {
  margin: 0.7rem 0 0;
  color: #475569;
  line-height: 1.65;
}
</style>
