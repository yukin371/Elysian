<script setup lang="ts">
import { computed } from "vue"

import type { WorkflowDefinitionRecord } from "@elysian/schema"

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
</script>

<template>
  <section class="enterprise-card">
    <h3 class="enterprise-heading">
      {{
        selectedDefinition?.name ??
        t("app.workflow.detailEmptyTitle")
      }}
    </h3>

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

  </section>
</template>

<style scoped>
</style>
