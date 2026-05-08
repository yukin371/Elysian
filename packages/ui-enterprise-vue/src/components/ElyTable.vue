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

const isActiveStatus = (value: unknown, activeLabel: string) =>
  value === "active" || value === activeLabel

const isInactiveStatus = (value: unknown, inactiveLabel: string) =>
  value === "inactive" || value === "disabled" || value === inactiveLabel

const resolvedRowKey = computed(() => props.rowKey ?? "id")

const handleRowClick = (row: Record<string, unknown>) => {
  emit("row-click", row)
}

const resolveRowAttributes = ({
  row,
  type,
}: {
  row: Record<string, unknown>
  type: "body" | "foot"
}) => {
  if (type !== "body") {
    return {}
  }

  return {
    "data-row-key": String(row[resolvedRowKey.value] ?? ""),
    onClick: () => handleRowClick(row),
  }
}

const resolvedColumns = computed(() => {
  const baseColumns = props.columns.map((col) => ({
    colKey: col.key,
    title: col.label,
    width: col.width,
    cell: (_h: typeof h, { row }: { row: Record<string, unknown> }) => {
      if (col.key === "status") {
        const activeLabel = props.copy?.statusActive ?? "启用"
        const inactiveLabel = props.copy?.statusInactive ?? "停用"

        return h(
          TTag,
          {
            theme: isActiveStatus(row.status, activeLabel)
              ? "success"
              : "default",
            variant: "light",
          },
          () =>
            isActiveStatus(row.status, activeLabel)
              ? activeLabel
              : isInactiveStatus(row.status, inactiveLabel)
                ? inactiveLabel
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
      :row-key="resolvedRowKey"
      :row-attributes="resolveRowAttributes"
      :scroll="{ y: 420 }"
      table-layout="fixed"
      hover
      class="ely-table-inner"
    />
  </div>
</template>

<style scoped>
.ely-table {
  border-radius: 6px;
  overflow: hidden;
}

.ely-table-inner {
  border-radius: 6px;
}

.ely-table-inner :deep(tbody tr) {
  cursor: pointer;
}
</style>
