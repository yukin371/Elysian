import type { ElyQueryValues } from "@elysian/ui-enterprise-vue"

import type { OperationLogListQuery, OperationLogRecord } from "./platform-api"

type OperationLogDetailValues = Record<string, unknown>

export interface OperationLogWorkspaceQuery {
  category?: string
  action?: string
  actorUserId?: string
  result?: OperationLogRecord["result"] | ""
}

export interface OperationLogTableItem
  extends Omit<OperationLogRecord, "result" | "createdAt"> {
  result: string
  createdAt: string
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const buildOperationLogListQuery = (
  values: ElyQueryValues,
): OperationLogListQuery => {
  const query: OperationLogListQuery = {}

  if (typeof values.category === "string" && values.category.trim()) {
    query.category = values.category.trim()
  }

  if (typeof values.action === "string" && values.action.trim()) {
    query.action = values.action.trim()
  }

  if (typeof values.actorUserId === "string" && values.actorUserId.trim()) {
    query.actorUserId = values.actorUserId.trim()
  }

  if (values.result === "success" || values.result === "failure") {
    query.result = values.result
  }

  return query
}

export const filterOperationLogs = (
  items: OperationLogRecord[],
  query: OperationLogWorkspaceQuery,
) => {
  const category = normalizeQueryValue(query.category)
  const action = normalizeQueryValue(query.action)
  const actorUserId = normalizeQueryValue(query.actorUserId)
  const result = query.result ?? ""

  return items.filter((item) => {
    if (
      category.length > 0 &&
      !item.category.toLowerCase().includes(category)
    ) {
      return false
    }

    if (action.length > 0 && !item.action.toLowerCase().includes(action)) {
      return false
    }

    if (
      actorUserId.length > 0 &&
      !(item.actorUserId ?? "").toLowerCase().includes(actorUserId)
    ) {
      return false
    }

    if (result && item.result !== result) {
      return false
    }

    return true
  })
}

export const resolveOperationLogSelection = (
  items: Array<Pick<OperationLogRecord, "id">>,
  selectedId: string | null,
) => {
  if (items.length === 0) {
    return null
  }

  if (selectedId && items.some((item) => item.id === selectedId)) {
    return selectedId
  }

  return items[0]?.id ?? null
}

export const createOperationLogTableItems = (
  items: OperationLogRecord[],
  options: {
    localizeResult: (result: OperationLogRecord["result"]) => string
    formatDateTime: (value: string) => string
  },
): OperationLogTableItem[] =>
  items.map((item) => ({
    ...item,
    result: options.localizeResult(item.result),
    createdAt: options.formatDateTime(item.createdAt),
  }))

export const createOperationLogDetailValues = (
  item: OperationLogRecord | null,
  options: {
    localizeResult: (result: OperationLogRecord["result"]) => string
  },
): OperationLogDetailValues => {
  if (!item) {
    return {}
  }

  return {
    category: item.category,
    action: item.action,
    actorUserId: item.actorUserId ?? "",
    targetType: item.targetType ?? "",
    targetId: item.targetId ?? "",
    result: options.localizeResult(item.result),
    requestId: item.requestId ?? "",
    ip: item.ip ?? "",
    userAgent: item.userAgent ?? "",
    createdAt: item.createdAt,
  }
}

export const formatOperationLogDetailsText = (
  item: OperationLogRecord | null,
  emptyLabel: string,
) => {
  if (!item?.details) {
    return emptyLabel
  }

  return JSON.stringify(item.details, null, 2)
}
