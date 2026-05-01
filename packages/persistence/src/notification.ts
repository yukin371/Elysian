import { type SQL, and, desc, eq, ilike, inArray, sql } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import {
  type PaginatedResult,
  type PaginationQuery,
  buildPaginatedResult,
  normalizePagination,
} from "./query-utils"
import { type NotificationRow, notifications } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export interface CreateNotificationPersistenceInput {
  id?: string
  recipientUserId: string
  title: string
  content: string
  level?: "info" | "success" | "warning" | "error"
  status?: "unread" | "read"
  createdByUserId?: string | null
  deptId?: string | null
  readAt?: Date | null
  tenantId?: string
}

export interface ListNotificationsPersistenceFilter {
  recipientUserId?: string
  title?: string
  content?: string
  level?: "info" | "success" | "warning" | "error"
  status?: "unread" | "read"
  page?: number
  pageSize?: number
  accessCondition?: SQL<unknown>
}

export interface NotificationPersistenceListQuery extends PaginationQuery {
  recipientUserId?: string
  title?: string
  content?: string
  level?: "info" | "success" | "warning" | "error"
  status?: "unread" | "read"
}

export type NotificationPersistenceListResult = PaginatedResult<NotificationRow>

const DEFAULT_NOTIFICATION_PAGE_SIZE = 20

export const listNotifications = async (
  db: DatabaseClient,
  filter: ListNotificationsPersistenceFilter = {},
): Promise<NotificationPersistenceListResult> => {
  const pagination = normalizePagination(filter, DEFAULT_NOTIFICATION_PAGE_SIZE)
  const conditions = [
    filter.recipientUserId
      ? eq(notifications.recipientUserId, filter.recipientUserId)
      : undefined,
    filter.title?.trim()
      ? ilike(notifications.title, `%${filter.title.trim()}%`)
      : undefined,
    filter.content?.trim()
      ? ilike(notifications.content, `%${filter.content.trim()}%`)
      : undefined,
    filter.level ? eq(notifications.level, filter.level) : undefined,
    filter.status ? eq(notifications.status, filter.status) : undefined,
    filter.accessCondition,
  ].filter(Boolean)

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined
  const [countRow] = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(notifications)
    .where(whereCondition)

  const total = countRow?.total ?? 0
  const paginated = buildPaginatedResult([], total, pagination)
  const items = await db
    .select()
    .from(notifications)
    .where(whereCondition)
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(pagination.pageSize)
    .offset((paginated.page - 1) * pagination.pageSize)

  return {
    ...paginated,
    items,
  }
}

export const getNotificationById = async (
  db: DatabaseClient,
  id: string,
  accessCondition?: SQL<unknown>,
): Promise<NotificationRow | null> => {
  const conditions = [eq(notifications.id, id), accessCondition].filter(Boolean)
  const [row] = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .limit(1)

  return row ?? null
}

export const insertNotification = async (
  db: DatabaseClient,
  input: CreateNotificationPersistenceInput,
): Promise<NotificationRow> => {
  const [row] = await db
    .insert(notifications)
    .values({
      ...(input.id ? { id: input.id } : {}),
      recipientUserId: input.recipientUserId,
      title: input.title,
      content: input.content,
      level: input.level ?? "info",
      status: input.status ?? "unread",
      createdByUserId: input.createdByUserId ?? null,
      deptId: input.deptId ?? null,
      readAt: input.readAt ?? null,
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Notification insert did not return a row")
  }

  return row
}

export const markNotificationAsRead = async (
  db: DatabaseClient,
  id: string,
  readAt: Date = new Date(),
  accessCondition?: SQL<unknown>,
): Promise<NotificationRow | null> => {
  const conditions = [eq(notifications.id, id), accessCondition].filter(Boolean)
  const [row] = await db
    .update(notifications)
    .set({
      status: "read",
      readAt,
    })
    .where(and(...conditions))
    .returning()

  return row ?? null
}

export const markNotificationsAsRead = async (
  db: DatabaseClient,
  ids: string[],
  readAt: Date = new Date(),
  accessCondition?: SQL<unknown>,
): Promise<NotificationRow[]> => {
  const uniqueIds = [...new Set(ids.filter((id) => id.trim().length > 0))]

  if (uniqueIds.length === 0) {
    return []
  }

  const conditions = [
    inArray(notifications.id, uniqueIds),
    eq(notifications.status, "unread"),
    accessCondition,
  ].filter(Boolean)

  return db
    .update(notifications)
    .set({
      status: "read",
      readAt,
    })
    .where(and(...conditions))
    .returning()
}
