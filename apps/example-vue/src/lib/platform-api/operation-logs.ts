import { requestJson } from "./core"

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

export interface OperationLogRecord {
  id: string
  category: string
  action: string
  authEventType: "login" | "logout" | "refresh" | "session_revoke" | null
  authFailureReason: string | null
  actorUserId: string | null
  targetType: string | null
  targetId: string | null
  result: "success" | "failure"
  requestId: string | null
  ip: string | null
  userAgent: string | null
  details: Record<string, unknown> | null
  createdAt: string
}

export interface OperationLogsResponse {
  items: OperationLogRecord[]
}

export interface OperationLogListQuery {
  category?: string
  action?: string
  authEventType?: NonNullable<OperationLogRecord["authEventType"]>
  authFailureReason?: string
  actorUserId?: string
  result?: OperationLogRecord["result"]
}

export const fetchOperationLogs = async (
  query: OperationLogListQuery = {},
): Promise<OperationLogsResponse> => {
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

  return requestJson<OperationLogsResponse>(
    `/system/operation-logs${search.size > 0 ? `?${search.toString()}` : ""}`,
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
