<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"
import { Space as TSpace } from "tdesign-vue-next/es/space"
import { Table as TTable } from "tdesign-vue-next/es/table"
import { Tag as TTag } from "tdesign-vue-next/es/tag"
import { computed, h } from "vue"

import type { ElyTableAction, ElyTableEmits, ElyTableProps } from "../contracts"

const props = defineProps<ElyTableProps>()
const emit = defineEmits<ElyTableEmits>()

const TONE_MAP: Record<
  NonNullable<ElyTableAction["tone"]>,
  "default" | "primary" | "danger"
> = {
  primary: "primary",
  secondary: "default",
  danger: "danger",
}

const formatCell = (value: unknown): string => {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") {
    return value
      ? (props.copy?.statusActive ?? "启用")
      : (props.copy?.statusInactive ?? "停用")
  }
  if (value instanceof Date) return value.toLocaleString()
  return String(value)
}

const handleRowClick = (row: Record<string, unknown>) => {
  emit("row-click", row)
}

const resolvedColumns = computed(() => {
  const baseColumns = props.columns.map((col) => ({
    colKey: col.key,
    title: col.label,
    width: col.width,
    cell: (_h: typeof h, { row }: { row: Record<string, unknown> }) => {
      if (col.key === "status") {
        return h(
          TTag,
          {
            theme: row.status === "active" ? "success" : "default",
            variant: "light",
          },
          () =>
            row.status === "active"
              ? (props.copy?.statusActive ?? "启用")
              : row.status === "inactive"
                ? (props.copy?.statusInactive ?? "停用")
                : (props.copy?.statusUnknown ?? "未知"),
        )
      }

      return formatCell(row[col.key])
    },
  }))

  if (!props.actions?.length) {
    return baseColumns
  }

  return [
    ...baseColumns,
    {
      colKey: "actions",
      title: props.copy?.actionsTitle ?? "操作",
      width: 160,
      fixed: "right" as const,
      cell: (_h: typeof h, { row }: { row: Record<string, unknown> }) =>
        h(TSpace, null, () =>
          props.actions
            ?.filter((action) => action.enabled !== false)
            .map((action) =>
              h(
                TButton,
                {
                  key: action.key,
                  size: "small",
                  theme: TONE_MAP[action.tone ?? "secondary"],
                  variant: action.tone === "danger" ? "outline" : "text",
                  onClick: (event: MouseEvent) => {
                    event.stopPropagation()
                    emit("action", action.key, row)
                  },
                },
                () => action.label,
              ),
            ),
        ),
    },
  ]
})
</script>

<template>
  <div class="ely-table">
    <TTable
      :columns="resolvedColumns"
      :data="props.items"
      :loading="loading"
      :row-key="rowKey ?? 'id'"
      :pagination="false"
      :scroll="{ y: 420 }"
      table-layout="fixed"
      hover
      class="ely-table-inner"
      :on-row-click="({ row }) => handleRowClick(row)"
    />
  </div>
</template>

<style scoped>
.ely-table {
  border-radius: 12px;
  overflow: hidden;
}

.ely-table-inner {
  border-radius: 12px;
}

.ely-table-inner :deep(tbody tr) {
  cursor: pointer;
}
</style>
