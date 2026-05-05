import {
  type AuditLogPersistenceListResult,
  type AuditLogResult,
  type AuditLogRow,
  type DatabaseClient,
  getAuditLogById,
  listAuditLogsByFilter,
} from "@elysian/persistence"
import type { OperationLogRecord, OperationLogResult } from "@elysian/schema"

export interface ListOperationLogsInput {
  category?: string
  action?: string
  authEventType?: NonNullable<OperationLogRecord["authEventType"]>
  authFailureReason?: string
  actorUserId?: string
  targetType?: string
  targetId?: string
  requestId?: string
  ip?: string
  userAgent?: string
  result?: OperationLogResult
  page?: number
  pageSize?: number
}

export interface OperationLogListResult {
  items: OperationLogRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface OperationLogRepository {
  list: (filter?: ListOperationLogsInput) => Promise<OperationLogListResult>
  getById: (id: string) => Promise<OperationLogRecord | null>
}

type OperationLogSeedRecord = Omit<
  OperationLogRecord,
  "authEventType" | "authFailureReason"
> & {
  authEventType?: OperationLogRecord["authEventType"]
  authFailureReason?: string | null
}

export const createOperationLogRepository = (
  db: DatabaseClient,
): OperationLogRepository => ({
  async list(filter = {}) {
    const payload = await listAuditLogsByFilter(db, {
      category:
        filter.category ??
        (filter.authEventType || filter.authFailureReason ? "auth" : undefined),
      action: filter.action ?? filter.authEventType,
      actorUserId: filter.actorUserId,
      targetType: filter.targetType,
      targetId: filter.targetId,
      requestId: filter.requestId,
      ip: filter.ip,
      userAgent: filter.userAgent,
      result: filter.result,
      detailsReason: filter.authFailureReason,
      page: filter.page,
      pageSize: filter.pageSize,
    })

    return mapAuditLogListResult(payload, filter)
  },
  async getById(id) {
    const row = await getAuditLogById(db, id)
    return row ? mapAuditLogRow(row) : null
  },
})

const mapAuditLogListResult = (
  payload: AuditLogPersistenceListResult,
  filter: ListOperationLogsInput,
): OperationLogListResult => ({
  ...payload,
  items: payload.items
    .map(mapAuditLogRow)
    .filter((item) =>
      filter.authEventType === undefined
        ? true
        : item.authEventType === filter.authEventType,
    )
    .filter((item) =>
      filter.authFailureReason === undefined
        ? true
        : item.authFailureReason === filter.authFailureReason,
    ),
})

export const createInMemoryOperationLogRepository = (
  seed: OperationLogSeedRecord[] = [],
): OperationLogRepository => {
  const items = new Map(
    seed.map((item) => {
      const normalizedItem = normalizeOperationLogRecord(item)
      return [normalizedItem.id, normalizedItem] as const
    }),
  )

  return {
    async list(filter = {}) {
      const page =
        typeof filter.page === "number" && Number.isFinite(filter.page)
          ? Math.max(1, Math.trunc(filter.page))
          : 1
      const pageSize =
        typeof filter.pageSize === "number" && Number.isFinite(filter.pageSize)
          ? Math.min(100, Math.max(1, Math.trunc(filter.pageSize)))
          : 20
      const category = normalizeOperationLogFilterValue(filter.category)
      const action = normalizeOperationLogFilterValue(filter.action)
      const actorUserId = normalizeOperationLogFilterValue(filter.actorUserId)
      const targetType = normalizeOperationLogFilterValue(filter.targetType)
      const targetId = normalizeOperationLogFilterValue(filter.targetId)
      const requestId = normalizeOperationLogFilterValue(filter.requestId)
      const ip = normalizeOperationLogFilterValue(filter.ip)
      const userAgent = normalizeOperationLogFilterValue(filter.userAgent)
      const filteredItems = [...items.values()]
        .filter((item) =>
          category.length === 0
            ? true
            : item.category.toLowerCase().includes(category),
        )
        .filter((item) =>
          action.length === 0
            ? true
            : item.action.toLowerCase().includes(action),
        )
        .filter((item) =>
          filter.authEventType === undefined
            ? true
            : item.authEventType === filter.authEventType,
        )
        .filter((item) =>
          filter.authFailureReason === undefined
            ? true
            : item.authFailureReason === filter.authFailureReason,
        )
        .filter((item) =>
          actorUserId.length === 0
            ? true
            : (item.actorUserId ?? "").toLowerCase().includes(actorUserId),
        )
        .filter((item) =>
          targetType.length === 0
            ? true
            : (item.targetType ?? "").toLowerCase().includes(targetType),
        )
        .filter((item) =>
          targetId.length === 0
            ? true
            : (item.targetId ?? "").toLowerCase().includes(targetId),
        )
        .filter((item) =>
          requestId.length === 0
            ? true
            : (item.requestId ?? "").toLowerCase().includes(requestId),
        )
        .filter((item) =>
          ip.length === 0 ? true : (item.ip ?? "").toLowerCase().includes(ip),
        )
        .filter((item) =>
          userAgent.length === 0
            ? true
            : (item.userAgent ?? "").toLowerCase().includes(userAgent),
        )
        .filter((item) =>
          filter.result === undefined ? true : item.result === filter.result,
        )
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      const total = filteredItems.length
      const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize)
      const resolvedPage = Math.min(page, totalPages)

      return {
        items: filteredItems.slice(
          (resolvedPage - 1) * pageSize,
          resolvedPage * pageSize,
        ),
        total,
        page: resolvedPage,
        pageSize,
        totalPages,
      }
    },
    async getById(id) {
      return items.get(id) ?? null
    },
  }
}

const mapAuditLogRow = (row: AuditLogRow): OperationLogRecord => ({
  id: row.id,
  category: row.category,
  action: row.action,
  authEventType: resolveAuthEventType(row.category, row.action),
  authFailureReason: resolveAuthFailureReason(row.details),
  actorUserId: row.actorUserId ?? null,
  targetType: row.targetType ?? null,
  targetId: row.targetId ?? null,
  result: row.result,
  requestId: row.requestId ?? null,
  ip: row.ip ?? null,
  userAgent: row.userAgent ?? null,
  details: row.details ?? null,
  createdAt: row.createdAt.toISOString(),
})

const normalizeOperationLogRecord = (
  item: OperationLogSeedRecord,
): OperationLogRecord => ({
  ...item,
  authEventType:
    item.authEventType ?? resolveAuthEventType(item.category, item.action),
  authFailureReason:
    item.authFailureReason ?? resolveAuthFailureReason(item.details),
})

const AUTH_EVENT_ACTIONS = [
  "login",
  "logout",
  "refresh",
  "session_revoke",
] as const

const isAuthEventAction = (
  action: string,
): action is NonNullable<OperationLogRecord["authEventType"]> =>
  AUTH_EVENT_ACTIONS.some((candidate) => candidate === action)

const resolveAuthEventType = (
  category: string,
  action: string,
): OperationLogRecord["authEventType"] =>
  category === "auth" && isAuthEventAction(action) ? action : null

const resolveAuthFailureReason = (
  details: Record<string, unknown> | null,
): string | null =>
  typeof details?.reason === "string" ? details.reason : null

const normalizeOperationLogFilterValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""
