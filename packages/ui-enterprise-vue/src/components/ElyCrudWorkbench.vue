<script setup lang="ts">
import { Empty as TEmpty } from "tdesign-vue-next/es/empty"

import type { ElyCrudWorkbenchEmits, ElyCrudWorkbenchProps } from "../contracts"
import ElyTable from "./ElyTable.vue"
import ElyWorkbenchToolbar from "./ElyWorkbenchToolbar.vue"

const props = withDefaults(defineProps<ElyCrudWorkbenchProps>(), {
  rowKey: "id",
  searchPlaceholder: "搜索...",
  emptyTitle: "暂无数据",
})

const emit = defineEmits<ElyCrudWorkbenchEmits>()

const handleSearch = (value: string) => {
  emit("search", value)
}

const handleToolbarAction = (key: string) => {
  emit("action", key, {} as Record<string, unknown>)
}

const handleTableAction = (key: string, row: Record<string, unknown>) => {
  emit("action", key, row)
}

const handleRowClick = (row: Record<string, unknown>) => {
  emit("row-click", row)
}
</script>

<template>
  <div class="ely-crud-workbench">
    <div class="ely-crud-workbench__toolbar">
      <slot name="toolbar" />
    </div>
    <ElyWorkbenchToolbar
      :search-placeholder="searchPlaceholder"
      :loading="queryLoading || tableLoading"
      @search="handleSearch"
      @action="handleToolbarAction"
      @more-action="handleToolbarAction"
    />
    <div class="ely-crud-workbench__table">
      <div v-if="itemCountLabel" class="ely-crud-workbench__summary">
        {{ itemCountLabel }}
      </div>

      <ElyTable
        v-if="props.items.length > 0 || tableLoading"
        :columns="tableColumns"
        :items="props.items"
        :loading="tableLoading"
        :actions="tableActions"
        :row-key="rowKey"
        :copy="copy?.tableCopy"
        @action="handleTableAction"
        @row-click="handleRowClick"
      />
      <div v-else class="ely-crud-workbench__empty">
        <TEmpty :title="emptyTitle" :description="emptyDescription" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ely-crud-workbench {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ely-crud-workbench__toolbar {
  padding: 0 16px;
}

.ely-crud-workbench__table {
  flex: 1;
  overflow: auto;
  padding: 0 16px;
}

.ely-crud-workbench__summary {
  padding: 12px 0 0;
  color: #64748b;
  font-size: 0.82rem;
}

.ely-crud-workbench__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}
</style>
