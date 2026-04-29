import type { ElyQueryValues } from "@elysian/ui-enterprise-vue"

import type { OperationLogListQuery, OperationLogRecord } from "./platform-api"

type OperationLogDetailValues = Record<string, unknown>

const operationLogAuthEventTypes = [
  "login",
  "logout",
  "refresh",
  "session_revoke",
] as const

const isOperationLogAuthEventType = (
  value: unknown,
): value is NonNullable<OperationLogRecord["authEventType"]> =>
  typeof value === "string" &&
  operationLogAuthEventTypes.includes(
    value as NonNullable<OperationLogRecord["authEventType"]>,
  )

export interface OperationLogWorkspaceQuery {
  category?: string
  action?: string
  authEventType?: NonNullable<OperationLogRecord["authEventType"]> | ""
  authFailureReason?: string
  actorUserId?: string
  result?: OperationLogRecord["result"] | ""
}

export interface OperationLogTableItem
  extends Omit<OperationLogRecord, "authEventType" | "result" | "createdAt"> {
  authEventType: string
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

  if (isOperationLogAuthEventType(values.authEventType)) {
    query.authEventType = values.authEventType
  }

  if (
    typeof values.authFailureReason === "string" &&
    values.authFailureReason.trim()
  ) {
    query.authFailureReason = values.authFailureReason.trim()
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
  const authEventType = query.authEventType ?? ""
  const authFailureReason = normalizeQueryValue(query.authFailureReason)
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

    if (authEventType && item.authEventType !== authEventType) {
      return false
    }

    if (
      authFailureReason.length > 0 &&
      !(item.authFailureReason ?? "").toLowerCase().includes(authFailureReason)
    ) {
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
    localizeAuthEventType: (
      authEventType: NonNullable<OperationLogRecord["authEventType"]>,
    ) => string
    localizeResult: (result: OperationLogRecord["result"]) => string
    formatDateTime: (value: string) => string
  },
): OperationLogTableItem[] =>
  items.map((item) => ({
    ...item,
    authEventType: item.authEventType
      ? options.localizeAuthEventType(item.authEventType)
      : "",
    result: options.localizeResult(item.result),
    createdAt: options.formatDateTime(item.createdAt),
  }))

export const createOperationLogDetailValues = (
  item: OperationLogRecord | null,
  options: {
    localizeAuthEventType: (
      authEventType: NonNullable<OperationLogRecord["authEventType"]>,
    ) => string
    localizeResult: (result: OperationLogRecord["result"]) => string
  },
): OperationLogDetailValues => {
  if (!item) {
    return {}
  }

  return {
    category: item.category,
    action: item.action,
    authEventType: item.authEventType
      ? options.localizeAuthEventType(item.authEventType)
      : "",
    authFailureReason: item.authFailureReason ?? "",
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
