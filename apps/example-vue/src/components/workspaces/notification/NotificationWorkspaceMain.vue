<script setup lang="ts">
import {
  ElyCrudWorkbench,
  type ElyCrudWorkspaceCopy,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { NotificationRecord } from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolveNotificationWorkspaceMainState,
} from "./notification-workspace-state"

type NotificationWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface NotificationWorkspaceMainProps {
  t: NotificationWorkspaceTranslation
  tableColumns: ElyTableColumn[]
  emptyTitle: string
  emptyDescription: string
  copy: ElyCrudWorkspaceCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<NotificationWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "row-click", row: NotificationRecord): void
  (e: "search", value: string): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedNotificationWorkspaceState = computed(() =>
  resolveNotificationWorkspaceMainState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(
    () => resolvedNotificationWorkspaceState.value?.notificationLoading ?? null,
  ),
  false,
)
const resolvedItems = readInjectedValue(
  computed(() => resolvedNotificationWorkspaceState.value?.tableItems ?? null),
  [] as NotificationRecord[],
)

const panelTitle = computed(() => props.t("app.notification.workspaceTitle"))

const handleSearch = (value: string) => {
  emit("search", value)
}

const handleRowClick = (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const notification = resolvedItems.value.find(
    (item: NotificationRecord) => item.id === rowId,
  )
  if (notification) {
    emit("row-click", notification)
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
    :search-placeholder="t('app.notification.searchPlaceholder', '搜索通知...')"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :copy="copy"
    row-key="id"
    @search="handleSearch"
    @row-click="handleRowClick"
  />
</template>
