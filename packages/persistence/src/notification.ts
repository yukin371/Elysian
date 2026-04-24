import { type SQL, and, desc, eq } from "drizzle-orm"

import type { DatabaseClient } from "./client"
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
  status?: "unread" | "read"
  accessCondition?: SQL<unknown>
}

export const listNotifications = async (
  db: DatabaseClient,
  filter: ListNotificationsPersistenceFilter = {},
): Promise<NotificationRow[]> => {
  const conditions = [
    filter.recipientUserId
      ? eq(notifications.recipientUserId, filter.recipientUserId)
      : undefined,
    filter.status ? eq(notifications.status, filter.status) : undefined,
    filter.accessCondition,
  ].filter(Boolean)

  if (conditions.length === 0) {
    return db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt), desc(notifications.id))
  }

  return db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
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
