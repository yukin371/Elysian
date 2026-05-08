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
import type { DepartmentRecord } from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolveDepartmentWorkspaceMainState,
} from "./department-workspace-state"

type DepartmentWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface DepartmentWorkspaceMainProps {
  t: DepartmentWorkspaceTranslation
  tableColumns: ElyTableColumn[]
  tableActions: ElyTableAction[]
  emptyTitle: string
  emptyDescription: string
  copy: ElyCrudWorkspaceCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<DepartmentWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "action", key: string, row: DepartmentRecord): void
  (e: "row-click", row: DepartmentRecord): void
  (e: "search", value: string): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedDepartmentWorkspaceState = computed(() =>
  resolveDepartmentWorkspaceMainState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(
    () => resolvedDepartmentWorkspaceState.value?.departmentLoading ?? null,
  ),
  false,
)
const resolvedItems = readInjectedValue(
  computed(() => resolvedDepartmentWorkspaceState.value?.tableItems ?? null),
  [] as DepartmentRecord[],
)

const panelTitle = computed(() => props.t("app.department.workspaceTitle"))

const handleSearch = (value: string) => {
  emit("search", value)
}

const handleAction = (key: string, row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const department = resolvedItems.value.find(
    (item: DepartmentRecord) => item.id === rowId,
  )
  if (department) {
    emit("action", key, department)
  }
}

const handleRowClick = (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const department = resolvedItems.value.find(
    (item: DepartmentRecord) => item.id === rowId,
  )
  if (department) {
    emit("row-click", department)
  }
}

const handleCreate = () => {
  emit("action", "create", {} as DepartmentRecord)
}
</script>

<template>
  <ElyCrudWorkbench
    :title="panelTitle"
    :table-columns="tableColumns"
    :items="resolvedItems"
    :table-loading="resolvedLoading"
    :table-actions="tableActions"
    :search-placeholder="t('app.department.searchPlaceholder', '搜索部门...')"
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
        {{ t("app.department.action.create", "新建部门") }}
      </t-button>
    </template>
  </ElyCrudWorkbench>
</template>
