import { requestJson } from "./core"

export interface OperationLogRecord {
  id: string
  category: string
  action: string
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
