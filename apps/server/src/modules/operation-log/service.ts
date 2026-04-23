import { AppError } from "../../errors"
import type {
  ListOperationLogsInput,
  OperationLogRepository,
} from "./repository"

export interface ListOperationLogsPayload extends ListOperationLogsInput {}

export const createOperationLogService = (
  repository: OperationLogRepository,
) => ({
  list: (filter?: ListOperationLogsPayload) => repository.list(filter),
  async getById(id: string) {
    const item = await repository.getById(id)

    if (!item) {
      throw new AppError({
        code: "OPERATION_LOG_NOT_FOUND",
        message: "Operation log not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return item
  },
  async exportCsv(filter?: ListOperationLogsPayload) {
    const items = await repository.list(filter)
    const header = [
      "id",
      "category",
      "action",
      "actorUserId",
      "targetType",
      "targetId",
      "result",
      "requestId",
      "ip",
      "userAgent",
      "createdAt",
    ]
    const lines = [
      header.join(","),
      ...items.map((item) =>
        [
          item.id,
          item.category,
          item.action,
          item.actorUserId ?? "",
          item.targetType ?? "",
          item.targetId ?? "",
          item.result,
          item.requestId ?? "",
          item.ip ?? "",
          item.userAgent ?? "",
          item.createdAt,
        ]
          .map(escapeCsv)
          .join(","),
      ),
    ]

    return lines.join("\n")
  },
})

const escapeCsv = (value: string) => {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replaceAll('"', '""')}"`
  }

  return value
}

export type OperationLogService = ReturnType<typeof createOperationLogService>
