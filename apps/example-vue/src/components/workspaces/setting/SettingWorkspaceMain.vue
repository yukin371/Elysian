<script setup lang="ts">
import {
  ElyCrudWorkbench,
  type ElyCrudWorkspaceCopy,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { SettingRecord } from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolveSettingWorkspaceMainState,
} from "./setting-workspace-state"

type SettingWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface SettingWorkspaceMainProps {
  t: SettingWorkspaceTranslation
  tableColumns: ElyTableColumn[]
  emptyTitle: string
  emptyDescription: string
  copy: ElyCrudWorkspaceCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<SettingWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "row-click", row: SettingRecord): void
  (e: "search", value: string): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedSettingWorkspaceState = computed(() =>
  resolveSettingWorkspaceMainState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedSettingWorkspaceState.value?.settingLoading ?? null),
  false,
)
const resolvedItems = readInjectedValue(
  computed(() => resolvedSettingWorkspaceState.value?.tableItems ?? null),
  [] as SettingRecord[],
)

const panelTitle = computed(() => props.t("app.setting.workspaceTitle"))

const handleSearch = (value: string) => {
  emit("search", value)
}

const handleRowClick = (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const setting = resolvedItems.value.find(
    (item: SettingRecord) => item.id === rowId,
  )
  if (setting) {
    emit("row-click", setting)
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
    :search-placeholder="t('app.setting.searchPlaceholder', '搜索设置...')"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :copy="copy"
    row-key="id"
    @search="handleSearch"
    @row-click="handleRowClick"
  />
</template>
