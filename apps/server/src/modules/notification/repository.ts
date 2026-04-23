import {
  type DatabaseClient,
  getNotificationById,
  getUserById,
  insertNotification,
  listNotifications,
  markNotificationAsRead,
} from "@elysian/persistence"
import type {
  NotificationLevel,
  NotificationRecord,
  NotificationStatus,
} from "@elysian/schema"

export interface ListNotificationsInput {
  recipientUserId?: string
  status?: NotificationStatus
}

export interface CreateNotificationInput {
  recipientUserId: string
  title: string
  content: string
  level?: NotificationLevel
  createdByUserId?: string | null
}

export interface NotificationRepository {
  list: (filter?: ListNotificationsInput) => Promise<NotificationRecord[]>
  getById: (id: string) => Promise<NotificationRecord | null>
  create: (input: CreateNotificationInput) => Promise<NotificationRecord>
  markAsRead: (id: string) => Promise<NotificationRecord | null>
  recipientExists: (recipientUserId: string) => Promise<boolean>
}

export interface InMemoryNotificationRepositorySeed {
  notifications?: NotificationRecord[]
  availableUserIds?: string[]
}

export const createNotificationRepository = (
  db: DatabaseClient,
): NotificationRepository => ({
  async list(filter = {}) {
    const rows = await listNotifications(db, filter)
    return rows.map(mapNotificationRow)
  },
  async getById(id) {
    const row = await getNotificationById(db, id)
    return row ? mapNotificationRow(row) : null
  },
  async create(input) {
    const row = await insertNotification(db, {
      recipientUserId: input.recipientUserId,
      title: input.title,
      content: input.content,
      level: input.level,
      createdByUserId: input.createdByUserId ?? null,
    })

    return mapNotificationRow(row)
  },
  async markAsRead(id) {
    const row = await markNotificationAsRead(db, id)
    return row ? mapNotificationRow(row) : null
  },
  async recipientExists(recipientUserId) {
    return (await getUserById(db, recipientUserId)) !== null
  },
})

export const createInMemoryNotificationRepository = (
  seed: InMemoryNotificationRepositorySeed = {},
): NotificationRepository => {
  const items = new Map(
    (seed.notifications ?? []).map((item) => [item.id, item]),
  )
  const availableUserIds = new Set(seed.availableUserIds ?? [])

  return {
    async list(filter = {}) {
      return [...items.values()]
        .filter((item) =>
          filter.recipientUserId === undefined
            ? true
            : item.recipientUserId === filter.recipientUserId,
        )
        .filter((item) =>
          filter.status === undefined ? true : item.status === filter.status,
        )
        .sort(compareNotifications)
    },
    async getById(id) {
      return items.get(id) ?? null
    },
    async create(input) {
      const notification: NotificationRecord = {
        id: crypto.randomUUID(),
        recipientUserId: input.recipientUserId,
        title: input.title,
        content: input.content,
        level: input.level ?? "info",
        status: "unread",
        createdByUserId: input.createdByUserId ?? undefined,
        createdAt: new Date().toISOString(),
      }

      items.set(notification.id, notification)
      return notification
    },
    async markAsRead(id) {
      const existing = items.get(id)

      if (!existing) {
        return null
      }

      const updated: NotificationRecord = {
        ...existing,
        status: "read",
        readAt: existing.readAt ?? new Date().toISOString(),
      }

      items.set(id, updated)
      return updated
    },
    async recipientExists(recipientUserId) {
      return availableUserIds.has(recipientUserId)
    },
  }
}

const mapNotificationRow = (
  row: Awaited<ReturnType<typeof getNotificationById>> extends infer T
    ? T extends null
      ? never
      : Exclude<T, null>
    : never,
): NotificationRecord => ({
  id: row.id,
  recipientUserId: row.recipientUserId,
  title: row.title,
  content: row.content,
  level: row.level,
  status: row.status,
  createdByUserId: row.createdByUserId ?? undefined,
  readAt: row.readAt?.toISOString(),
  createdAt: row.createdAt.toISOString(),
})

const compareNotifications = (
  left: NotificationRecord,
  right: NotificationRecord,
) =>
  right.createdAt.localeCompare(left.createdAt) ||
  right.id.localeCompare(left.id)
