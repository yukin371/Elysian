<script setup lang="ts">
import { Space as TSpace } from "tdesign-vue-next/es/space"
import { Table as TTable } from "tdesign-vue-next/es/table"
import { Tag as TTag } from "tdesign-vue-next/es/tag"
import { type VNode, computed, type h } from "vue"

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

const isInteractiveRowTarget = (target: EventTarget | null) =>
  Boolean(
    target &&
      "closest" in target &&
      typeof target.closest === "function" &&
      target.closest(
        "button,a,input,textarea,select,[role='button'],[data-row-action]",
      ),
  )

const resolveRowActionKey = (target: EventTarget | null) => {
  if (
    !target ||
    !("closest" in target) ||
    typeof target.closest !== "function"
  ) {
    return null
  }

  const actionTarget = target.closest("[data-row-action]")
  if (!actionTarget || !("getAttribute" in actionTarget)) {
    return null
  }

  return actionTarget.getAttribute("data-row-action")
}

const handleCellClick = (context: {
  row?: Record<string, unknown>
  col?: { colKey?: string }
  e?: MouseEvent
}) => {
  if (context.col?.colKey !== "actions" || !context.row) {
    return
  }

  const actionKey = resolveRowActionKey(context.e?.target ?? null)
  if (actionKey) {
    emit("action", actionKey, context.row)
  }
}

const handleTDesignRowClick = (context: {
  row?: Record<string, unknown>
  e?: MouseEvent | KeyboardEvent
}) => {
  if (!context.row) {
    return
  }

  const actionKey = resolveRowActionKey(context.e?.target ?? null)
  if (actionKey) {
    emit("action", actionKey, context.row)
    return
  }

  if (isInteractiveRowTarget(context.e?.target ?? null)) {
    return
  }

  handleRowClick(context.row)
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
    onClick: (event: MouseEvent) => {
      const actionKey = resolveRowActionKey(event.target)
      if (actionKey) {
        emit("action", actionKey, row)
        return
      }

      if (isInteractiveRowTarget(event.target)) {
        return
      }

      handleRowClick(row)
    },
  }
}

const resolvedColumns = computed(() => {
  const baseColumns = props.columns.map((col) => ({
    colKey: col.key,
    title: col.label,
    width: col.width,
    cell: (
      createElement: typeof h,
      { row }: { row: Record<string, unknown> },
    ) => {
      if (col.key === "status") {
        const activeLabel = props.copy?.statusActive ?? "启用"
        const inactiveLabel = props.copy?.statusInactive ?? "停用"

        return createElement(
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
      cell: (
        createElement: typeof h,
        { row }: { row: Record<string, unknown> },
      ): VNode =>
        createElement(TSpace, null, () =>
          props.actions
            ?.filter((action) => action.enabled !== false)
            .map((action) =>
              createElement(
                "span",
                {
                  key: action.key,
                  title: action.label,
                  class: [
                    "ely-table-action",
                    `ely-table-action--${TONE_MAP[action.tone ?? "secondary"]}`,
                  ],
                  "data-row-action": action.key,
                },
                action.label,
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
      :on-cell-click="handleCellClick"
      :on-row-click="handleTDesignRowClick"
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

.ely-table-action {
  border-radius: 4px;
  color: #2457d6;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  line-height: 22px;
  padding: 0 4px;
}

.ely-table-action:hover {
  color: #1d4ed8;
  background: rgba(36, 87, 214, 0.08);
}

.ely-table-action--danger {
  color: #b91c1c;
}

.ely-table-action--danger:hover {
  color: #991b1b;
  background: rgba(185, 28, 28, 0.08);
}
</style>
