import {
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
  result?: OperationLogResult
}

export interface OperationLogRepository {
  list: (filter?: ListOperationLogsInput) => Promise<OperationLogRecord[]>
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
    const rows = await listAuditLogsByFilter(db, {
      category:
        filter.category ??
        (filter.authEventType || filter.authFailureReason ? "auth" : undefined),
      action: filter.action ?? filter.authEventType,
      actorUserId: filter.actorUserId,
      result: filter.result as AuditLogResult | undefined,
      detailsReason: filter.authFailureReason,
    })

    return rows
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
      )
  },
  async getById(id) {
    const row = await getAuditLogById(db, id)
    return row ? mapAuditLogRow(row) : null
  },
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
      return [...items.values()]
        .filter((item) =>
          filter.category === undefined
            ? true
            : item.category === filter.category,
        )
        .filter((item) =>
          filter.action === undefined ? true : item.action === filter.action,
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
          filter.actorUserId === undefined
            ? true
            : item.actorUserId === filter.actorUserId,
        )
        .filter((item) =>
          filter.result === undefined ? true : item.result === filter.result,
        )
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
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

const resolveAuthEventType = (
  category: string,
  action: string,
): OperationLogRecord["authEventType"] =>
  category === "auth" &&
  AUTH_EVENT_ACTIONS.includes(action as (typeof AUTH_EVENT_ACTIONS)[number])
    ? (action as OperationLogRecord["authEventType"])
    : null

const resolveAuthFailureReason = (
  details: Record<string, unknown> | null,
): string | null =>
  typeof details?.reason === "string" ? details.reason : null
