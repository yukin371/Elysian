<script setup lang="ts">
import {
  ElyCrudWorkbench,
  type ElyCrudWorkspaceCopy,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { RoleRecord } from "../../../lib/platform-api"

type RoleWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface RoleWorkspaceMainProps {
  t: RoleWorkspaceTranslation
  tableColumns: ElyTableColumn[]
  emptyTitle: string
  emptyDescription: string
  copy: ElyCrudWorkspaceCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<RoleWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "row-click", row: RoleRecord): void
  (e: "search", value: string): void
}>()

interface RoleWorkspaceInjectedState {
  roleErrorMessage: { value: string }
  roleLoading: { value: boolean }
  tableItems: { value: RoleRecord[] }
}

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedRoleWorkspaceState = computed<RoleWorkspaceInjectedState | null>(
  () => {
    const context = injectedWorkspaceState.value

    if (!props.workspaceStateInjected || context?.kind !== "role") {
      return null
    }

    return context.state as RoleWorkspaceInjectedState
  },
)

const resolvedLoading = computed(
  () => resolvedRoleWorkspaceState.value?.roleLoading.value ?? false,
)
const resolvedItems = computed(
  () => resolvedRoleWorkspaceState.value?.tableItems.value ?? [],
)

const panelTitle = computed(() => props.t("app.role.workspaceTitle"))

const handleSearch = (value: string) => {
  emit("search", value)
}

const handleRowClick = (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const role = resolvedItems.value.find((item: RoleRecord) => item.id === rowId)
  if (role) {
    emit("row-click", role)
  }
}
</script>

<template>
  <ElyCrudWorkbench
    :title="panelTitle"
    :table-columns="tableColumns"
    :items="resolvedItems"
    :table-loading="resolvedLoading"
    :table-actions="[]"
    :search-placeholder="t('app.role.searchPlaceholder', '搜索角色...')"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :copy="copy"
    row-key="id"
    @search="handleSearch"
    @row-click="handleRowClick"
  />
</template>
