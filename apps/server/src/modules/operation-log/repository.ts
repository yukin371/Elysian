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
  actorUserId?: string
  result?: OperationLogResult
}

export interface OperationLogRepository {
  list: (filter?: ListOperationLogsInput) => Promise<OperationLogRecord[]>
  getById: (id: string) => Promise<OperationLogRecord | null>
}

export const createOperationLogRepository = (
  db: DatabaseClient,
): OperationLogRepository => ({
  async list(filter = {}) {
    const rows = await listAuditLogsByFilter(db, {
      category: filter.category,
      action: filter.action,
      actorUserId: filter.actorUserId,
      result: filter.result as AuditLogResult | undefined,
    })

    return rows.map(mapAuditLogRow)
  },
  async getById(id) {
    const row = await getAuditLogById(db, id)
    return row ? mapAuditLogRow(row) : null
  },
})

export const createInMemoryOperationLogRepository = (
  seed: OperationLogRecord[] = [],
): OperationLogRepository => {
  const items = new Map(seed.map((item) => [item.id, item]))

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
