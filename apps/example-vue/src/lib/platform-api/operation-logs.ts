import { requestJson } from "./core"
import type {
  OperationLogListQuery,
  OperationLogRecord,
  OperationLogsResponse,
} from "../platform-api"

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
