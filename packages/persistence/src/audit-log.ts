import { and, desc, eq } from "drizzle-orm"

import type { DatabaseClient } from "./client"
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

export interface ListAuditLogsPersistenceFilter {
  category?: string
  action?: string
  actorUserId?: string
  result?: AuditLogResult
}

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
): Promise<AuditLogRow[]> => {
  const conditions = [
    filter.category ? eq(auditLogs.category, filter.category) : undefined,
    filter.action ? eq(auditLogs.action, filter.action) : undefined,
    filter.actorUserId
      ? eq(auditLogs.actorUserId, filter.actorUserId)
      : undefined,
    filter.result ? eq(auditLogs.result, filter.result) : undefined,
  ].filter(Boolean)

  if (conditions.length === 0) {
    return db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
  }

  return db
    .select()
    .from(auditLogs)
    .where(and(...conditions))
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
}
