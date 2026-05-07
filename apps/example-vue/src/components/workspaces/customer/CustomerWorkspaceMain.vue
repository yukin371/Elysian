<script setup lang="ts">
import {
  ElyCrudWorkbench,
  type ElyCrudWorkspaceCopy,
  type ElyTableAction,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { Button as TButton } from "tdesign-vue-next/es/button"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { CustomerRecord } from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolveCustomerWorkspaceMainState,
} from "./customer-workspace-state"

type CustomerWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface CustomerWorkspaceMainProps {
  t: CustomerWorkspaceTranslation
  tableColumns: ElyTableColumn[]
  tableActions: ElyTableAction[]
  emptyTitle: string
  emptyDescription: string
  copy: ElyCrudWorkspaceCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<CustomerWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "action", key: string, row: CustomerRecord): void
  (e: "row-click", row: CustomerRecord): void
  (e: "search", value: string): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedCustomerWorkspaceState = computed(() =>
  resolveCustomerWorkspaceMainState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedCustomerWorkspaceState.value?.customerLoading ?? null),
  false,
)
const resolvedItems = readInjectedValue(
  computed(() => resolvedCustomerWorkspaceState.value?.customerItems ?? null),
  [] as CustomerRecord[],
)

const panelTitle = computed(() => props.t("app.workspace.title"))

const handleSearch = (value: string) => {
  emit("search", value)
}

const handleAction = (key: string, row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const customer = resolvedItems.value.find(
    (item: CustomerRecord) => item.id === rowId,
  )
  if (customer) {
    emit("action", key, customer)
  }
}

const handleRowClick = (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const customer = resolvedItems.value.find(
    (item: CustomerRecord) => item.id === rowId,
  )
  if (customer) {
    emit("row-click", customer)
  }
}

const handleCreate = () => {
  emit("action", "create", {} as CustomerRecord)
}
</script>

<template>
  <ElyCrudWorkbench
    :title="panelTitle"
    :table-columns="tableColumns"
    :items="resolvedItems"
    :table-loading="resolvedLoading"
    :table-actions="tableActions"
    :search-placeholder="t('app.workspace.searchPlaceholder', '搜索客户...')"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :copy="copy"
    row-key="id"
    @search="handleSearch"
    @action="handleAction"
    @row-click="handleRowClick"
  >
    <template #toolbar>
      <t-button theme="primary" @click="handleCreate">
        {{ t("app.workspace.createButton", "新建客户") }}
      </t-button>
    </template>
  </ElyCrudWorkbench>
</template>
