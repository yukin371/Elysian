import { requestBlob, requestJson } from "./core"
import type { OperationLogRecord } from "./types"
export type { OperationLogRecord } from "./types"

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

export interface OperationLogsResponse {
  items: OperationLogRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface OperationLogListQuery {
  category?: string
  action?: string
  authEventType?: NonNullable<OperationLogRecord["authEventType"]>
  authFailureReason?: string
  actorUserId?: string
  result?: OperationLogRecord["result"]
  page?: number
  pageSize?: number
}

const buildOperationLogSearch = (query: OperationLogListQuery = {}) => {
  const search = new URLSearchParams()

  if (query.category?.trim()) {
    search.set("category", query.category.trim())
  }

  if (query.action?.trim()) {
    search.set("action", query.action.trim())
  }

  if (isOperationLogAuthEventType(query.authEventType)) {
    search.set("authEventType", query.authEventType)
  }

  if (query.authFailureReason?.trim()) {
    search.set("authFailureReason", query.authFailureReason.trim())
  }

  if (query.actorUserId?.trim()) {
    search.set("actorUserId", query.actorUserId.trim())
  }

  if (query.result) {
    search.set("result", query.result)
  }

  if (typeof query.page === "number" && Number.isFinite(query.page)) {
    search.set("page", String(Math.trunc(query.page)))
  }

  if (typeof query.pageSize === "number" && Number.isFinite(query.pageSize)) {
    search.set("pageSize", String(Math.trunc(query.pageSize)))
  }

  return search
}

export const fetchOperationLogs = async (
  query: OperationLogListQuery = {},
): Promise<OperationLogsResponse> => {
  const search = buildOperationLogSearch(query)

  return requestJson<OperationLogsResponse>(
    `/system/operation-logs${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const exportOperationLogsCsv = async (
  query: OperationLogListQuery = {},
): Promise<Blob> => {
  const search = buildOperationLogSearch(query)

  return requestBlob(
    `/system/operation-logs/export${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const fetchOperationLogById = async (
  id: string,
): Promise<OperationLogRecord> =>
  requestJson<OperationLogRecord>(
    `/system/operation-logs/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  )
