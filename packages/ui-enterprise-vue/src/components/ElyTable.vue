<script setup lang="ts">
import {
  Button as AButton,
  Space as ASpace,
  Table as ATable,
  TableColumn as ATableColumn,
  Tag as ATag,
} from "@arco-design/web-vue"

import type { ElyTableAction, ElyTableEmits, ElyTableProps } from "../contracts"

const props = defineProps<ElyTableProps>()
const emit = defineEmits<ElyTableEmits>()

const TONE_MAP: Record<NonNullable<ElyTableAction["tone"]>, string> = {
  primary: "arcoblue",
  secondary: "gray",
  danger: "red",
}

const formatCell = (value: unknown): string => {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "active" : "inactive"
  if (value instanceof Date) return value.toLocaleString()
  return String(value)
}

const handleRowClick = (row: Record<string, unknown>) => {
  emit("row-click", row)
}
</script>

<template>
  <div class="ely-table">
    <a-table
      :columns="columns"
      :data="props.items"
      :loading="loading"
      :row-key="rowKey ?? 'id'"
      :pagination="false"
      :scroll="{ y: 420 }"
      class="ely-table-inner"
      @row-click="handleRowClick"
    >
      <template #columns>
        <a-table-column
          v-for="col in columns"
          :key="col.key"
          :data-index="col.key"
          :title="col.label"
          :width="col.width"
        >
          <template #cell="{ record }">
            <ATag v-if="col.key === 'status'" :color="record.status === 'active' ? 'green' : 'gray'">
              {{ record.status }}
            </ATag>
            <span v-else>{{ formatCell(record[col.key]) }}</span>
          </template>
        </a-table-column>

        <a-table-column
          v-if="actions && actions.length > 0"
          :width="120"
          :title="'Actions'"
          :fixed="'right'"
        >
          <template #cell="{ record }">
            <ASpace>
              <template v-for="action in actions" :key="action.key">
                <AButton
                  v-if="action.enabled !== false"
                  size="small"
                  :type="action.tone === 'danger' ? 'outline' : 'text'"
                  :status="action.tone === 'danger' ? 'danger' : undefined"
                  @click.stop="emit('action', action.key, record)"
                >
                  {{ action.label }}
                </AButton>
              </template>
            </ASpace>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </div>
</template>

<style scoped>
.ely-table {
  border-radius: 16px;
  overflow: hidden;
}

.ely-table-inner {
  border-radius: 16px;
}

.ely-table-inner :deep(.arco-table-tr) {
  cursor: pointer;
}
</style>
