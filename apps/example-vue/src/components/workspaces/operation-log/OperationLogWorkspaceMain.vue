<script setup lang="ts">
import {
  ElyCrudWorkbench,
  type ElyCrudWorkspaceCopy,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"

import type { OperationLogRecord } from "../../../lib/platform-api"

type OperationLogWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface OperationLogWorkspaceMainProps {
  t: OperationLogWorkspaceTranslation
  loading: boolean
  tableColumns: ElyTableColumn[]
  items: OperationLogRecord[]
  emptyTitle: string
  emptyDescription: string
  copy: ElyCrudWorkspaceCopy
}

defineProps<OperationLogWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "row-click", row: OperationLogRecord): void
  (e: "search", value: string): void
}>()

const handleSearch = (value: string) => {
  emit("search", value)
}

const handleRowClick = (row: Record<string, unknown>) => {
  emit("row-click", row as unknown as OperationLogRecord)
}
</script>

<template>
  <ElyCrudWorkbench
    :title="t('app.operationLog.workspaceTitle')"
    :table-columns="tableColumns"
    :items="items"
    :table-loading="loading"
    :table-actions="[]"
    :search-placeholder="t('app.operationLog.searchPlaceholder', '搜索操作日志...')"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :copy="copy"
    row-key="id"
    @search="handleSearch"
    @row-click="handleRowClick"
  />
</template>
