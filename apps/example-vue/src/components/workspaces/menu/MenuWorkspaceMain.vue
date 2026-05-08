<script setup lang="ts">
import {
  ElyCrudWorkbench,
  type ElyCrudWorkspaceCopy,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { MenuRecord } from "../../../lib/platform-api"
import { resolveMenuWorkspaceMainState } from "./menu-workspace-state"

type MenuWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface MenuWorkspaceMainProps {
  t: MenuWorkspaceTranslation
  tableColumns: ElyTableColumn[]
  emptyTitle: string
  emptyDescription: string
  copy: ElyCrudWorkspaceCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<MenuWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "row-click", row: MenuRecord): void
  (e: "search", value: string): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedMenuWorkspaceState = computed(() =>
  resolveMenuWorkspaceMainState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = computed(
  () => resolvedMenuWorkspaceState.value?.menuLoading.value ?? false,
)
const resolvedItems = computed(
  () => resolvedMenuWorkspaceState.value?.tableItems.value ?? [],
)

const panelTitle = computed(() => props.t("app.menu.workspaceTitle"))

const handleSearch = (value: string) => {
  emit("search", value)
}

const handleRowClick = (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const menu = resolvedItems.value.find((item: MenuRecord) => item.id === rowId)
  if (menu) {
    emit("row-click", menu)
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
    :search-placeholder="t('app.menu.searchPlaceholder', '搜索菜单...')"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :copy="copy"
    row-key="id"
    @search="handleSearch"
    @row-click="handleRowClick"
  />
</template>
