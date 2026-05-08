<script setup lang="ts">
import type { WorkflowDefinitionRecord } from "@elysian/schema"
import { computed } from "vue"

import type { WorkflowTranslation } from "./types"

interface WorkflowWorkspacePanelProps {
  t: WorkflowTranslation
  locale: string
  detailLoading: boolean
  detailErrorMessage: string
  selectedDefinition: WorkflowDefinitionRecord | null
  localizeStatus: (status: WorkflowDefinitionRecord["status"]) => string
}

const props = defineProps<WorkflowWorkspacePanelProps>()

const selectedDefinitionUpdatedAtLabel = computed(() =>
  props.selectedDefinition
    ? new Date(props.selectedDefinition.updatedAt).toLocaleString(props.locale)
    : "",
)

const nodeTypeSummary = computed(() => {
  const nodes = props.selectedDefinition?.definition.nodes ?? []

  return ["start", "approval", "condition", "end"].map((type) => ({
    key: type,
    label: props.t(`app.workflow.nodeType.${type}`),
    count: nodes.filter((node) => node.type === type).length,
  }))
})

const totalNodeCount = computed(
  () => props.selectedDefinition?.definition.nodes.length ?? 0,
)

const totalEdgeCount = computed(
  () => props.selectedDefinition?.definition.edges.length ?? 0,
)
</script>

<template>
  <section class="enterprise-card workflow-panel-card">
    <div class="workflow-panel-head">
      <h3 class="enterprise-heading">
        {{
          selectedDefinition?.name ??
          t("app.workflow.detailEmptyTitle")
        }}
      </h3>

      <span v-if="selectedDefinition" class="workflow-panel-status-pill">
        {{ localizeStatus(selectedDefinition.status) }}
      </span>
    </div>

    <div
      v-if="detailLoading && selectedDefinition"
      class="enterprise-inline-warning"
    >
      {{ t("app.workflow.detailLoading") }}
    </div>

    <div v-if="detailErrorMessage" class="enterprise-inline-warning">
      {{ detailErrorMessage }}
    </div>

    <div v-if="selectedDefinition" class="workflow-panel-structure">
      <div class="workflow-panel-rail" aria-label="workflow structure">
        <span
          v-for="segment in nodeTypeSummary"
          :key="segment.key"
          class="workflow-panel-segment"
        >
          <strong>{{ segment.count }}</strong>
          <span>{{ segment.label }}</span>
        </span>
      </div>

      <div class="workflow-panel-strip">
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
            {{ totalNodeCount }} {{ t("app.workflow.meta.nodes") }} / {{ totalEdgeCount }}
            {{ t("app.workflow.meta.edges") }}
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
  </section>
</template>

<style scoped>
.workflow-panel-card {
  display: grid;
  gap: 0.85rem;
}

.workflow-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.workflow-panel-status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(36, 87, 214, 0.1);
  color: #173ea6;
  padding: 0.32rem 0.7rem;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.workflow-panel-structure {
  display: grid;
  gap: 0.85rem;
}

.workflow-panel-rail {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.workflow-panel-segment {
  display: grid;
  gap: 0.2rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: rgba(248, 250, 252, 0.92);
  padding: 0.65rem 0.75rem;
  min-width: 0;
}

.workflow-panel-segment strong {
  color: #0f172a;
  font-size: 1rem;
}

.workflow-panel-segment span {
  color: #64748b;
  font-size: 0.76rem;
}

.workflow-panel-strip {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  padding: 0.75rem 0;
}

.workflow-panel-strip > div {
  display: grid;
  gap: 0.2rem;
}

.workflow-panel-strip span,
.workflow-panel-strip strong {
  min-width: 0;
}

.workflow-panel-strip span {
  color: #64748b;
  font-size: 0.76rem;
}

.workflow-panel-strip strong {
  color: #0f172a;
  font-size: 0.92rem;
}

@media (max-width: 720px) {
  .workflow-panel-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .workflow-panel-rail,
  .workflow-panel-strip {
    grid-template-columns: 1fr;
  }
}
</style>
