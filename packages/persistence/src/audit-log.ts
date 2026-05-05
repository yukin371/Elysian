import { and, desc, eq, ilike, sql } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import {
  type PaginatedResult,
  type PaginationQuery,
  buildPaginatedResult,
  normalizePagination,
} from "./query-utils"
import type { AuditLogRow } from "./schema"
import { auditLogs } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export type AuditLogResult = "success" | "failure"

export interface CreateAuditLogPersistenceInput {
  id?: string
  category: string
  action: string
  actorUserId?: string | null
  targetType?: string | null
  targetId?: string | null
  result: AuditLogResult
  requestId?: string | null
  ip?: string | null
  userAgent?: string | null
  details?: Record<string, unknown> | null
  createdAt?: Date
  tenantId?: string
}

export interface ListAuditLogsPersistenceFilter extends PaginationQuery {
  category?: string
  action?: string
  actorUserId?: string
  targetType?: string
  targetId?: string
  requestId?: string
  ip?: string
  userAgent?: string
  result?: AuditLogResult
  detailsReason?: string
}

export type AuditLogPersistenceListQuery = ListAuditLogsPersistenceFilter

export type AuditLogPersistenceListResult = PaginatedResult<AuditLogRow>

const DEFAULT_AUDIT_LOG_PAGE_SIZE = 20

export const insertAuditLog = async (
  db: DatabaseClient,
  input: CreateAuditLogPersistenceInput,
): Promise<AuditLogRow> => {
  const [row] = await db
    .insert(auditLogs)
    .values({
      ...(input.id ? { id: input.id } : {}),
      category: input.category,
      action: input.action,
      actorUserId: input.actorUserId ?? null,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      result: input.result,
      requestId: input.requestId ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      details: input.details ?? null,
      ...(input.createdAt ? { createdAt: input.createdAt } : {}),
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Audit log insert did not return a row")
  }

  return row
}

export const listAuditLogs = async (
  db: DatabaseClient,
  actorUserId?: string,
): Promise<AuditLogRow[]> => {
  const baseQuery = db.select().from(auditLogs)

  if (actorUserId === undefined) {
    return baseQuery.orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
  }

  return baseQuery
    .where(eq(auditLogs.actorUserId, actorUserId))
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
}

export const getAuditLogById = async (
  db: DatabaseClient,
  id: string,
): Promise<AuditLogRow | null> => {
  const [row] = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.id, id))
    .limit(1)

  return row ?? null
}

export const listAuditLogsByFilter = async (
  db: DatabaseClient,
  filter: ListAuditLogsPersistenceFilter = {},
): Promise<AuditLogPersistenceListResult> => {
  const pagination = normalizePagination(filter, DEFAULT_AUDIT_LOG_PAGE_SIZE)
  const conditions = [
    filter.category?.trim()
      ? ilike(auditLogs.category, `%${filter.category.trim()}%`)
      : undefined,
    filter.action?.trim()
      ? ilike(auditLogs.action, `%${filter.action.trim()}%`)
      : undefined,
    filter.actorUserId?.trim()
      ? sql`${auditLogs.actorUserId}::text ilike ${`%${filter.actorUserId.trim()}%`}`
      : undefined,
    filter.targetType?.trim()
      ? ilike(auditLogs.targetType, `%${filter.targetType.trim()}%`)
      : undefined,
    filter.targetId?.trim()
      ? ilike(auditLogs.targetId, `%${filter.targetId.trim()}%`)
      : undefined,
    filter.requestId?.trim()
      ? ilike(auditLogs.requestId, `%${filter.requestId.trim()}%`)
      : undefined,
    filter.ip?.trim()
      ? ilike(auditLogs.ip, `%${filter.ip.trim()}%`)
      : undefined,
    filter.userAgent?.trim()
      ? ilike(auditLogs.userAgent, `%${filter.userAgent.trim()}%`)
      : undefined,
    filter.result ? eq(auditLogs.result, filter.result) : undefined,
    filter.detailsReason
      ? sql`${auditLogs.details} ->> 'reason' = ${filter.detailsReason}`
      : undefined,
  ].filter(Boolean)
  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined
  const [countRow] = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(auditLogs)
    .where(whereCondition)

  const total = countRow?.total ?? 0
  const paginated = buildPaginatedResult([], total, pagination)
  const items = await db
    .select()
    .from(auditLogs)
    .where(whereCondition)
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
    .limit(pagination.pageSize)
    .offset((paginated.page - 1) * pagination.pageSize)

  return {
    ...paginated,
    items,
  }
}
