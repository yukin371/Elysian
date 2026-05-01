import {
  type DataAccessContext,
  type DatabaseClient,
  type PaginatedResult,
  buildDataAccessCondition,
  getNotificationById,
  getUserById,
  insertNotification,
  listNotifications,
  markNotificationAsRead,
  markNotificationsAsRead,
  matchesDataAccess,
  notifications,
} from "@elysian/persistence"
import type {
  NotificationLevel,
  NotificationRecord,
  NotificationStatus,
} from "@elysian/schema"

export interface ListNotificationsInput {
  recipientUserId?: string
  title?: string
  content?: string
  level?: NotificationLevel
  status?: NotificationStatus
  page?: number
  pageSize?: number
}

export type ListNotificationsResult = PaginatedResult<NotificationRecord>

export interface CreateNotificationInput {
  recipientUserId: string
  title: string
  content: string
  level?: NotificationLevel
  createdByUserId?: string | null
  deptId?: string | null
}

export interface NotificationRepository {
  list: (
    filter?: ListNotificationsInput,
    dataAccess?: DataAccessContext,
  ) => Promise<ListNotificationsResult>
  getById: (
    id: string,
    dataAccess?: DataAccessContext,
  ) => Promise<NotificationRecord | null>
  create: (input: CreateNotificationInput) => Promise<NotificationRecord>
  markAsRead: (
    id: string,
    dataAccess?: DataAccessContext,
  ) => Promise<NotificationRecord | null>
  markManyAsRead: (
    ids: string[],
    dataAccess?: DataAccessContext,
  ) => Promise<NotificationRecord[]>
  recipientExists: (recipientUserId: string) => Promise<boolean>
}

export interface InMemoryNotificationRepositorySeed {
  notifications?: Array<
    NotificationRecord & {
      deptId?: string | null
    }
  >
  availableUserIds?: string[]
}

export const createNotificationRepository = (
  db: DatabaseClient,
): NotificationRepository => ({
  async list(filter = {}, dataAccess?: DataAccessContext) {
    const result = await listNotifications(db, {
      ...filter,
      accessCondition: dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: notifications.deptId,
            creatorColumn: notifications.createdByUserId,
          })
        : undefined,
    })
    return {
      ...result,
      items: result.items.map(mapNotificationRow),
    }
  },
  async getById(id, dataAccess) {
    const row = await getNotificationById(
      db,
      id,
      dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: notifications.deptId,
            creatorColumn: notifications.createdByUserId,
          })
        : undefined,
    )
    return row ? mapNotificationRow(row) : null
  },
  async create(input) {
    const row = await insertNotification(db, {
      recipientUserId: input.recipientUserId,
      title: input.title,
      content: input.content,
      level: input.level,
      createdByUserId: input.createdByUserId ?? null,
      deptId: input.deptId ?? null,
    })

    return mapNotificationRow(row)
  },
  async markAsRead(id, dataAccess) {
    const row = await markNotificationAsRead(
      db,
      id,
      new Date(),
      dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: notifications.deptId,
            creatorColumn: notifications.createdByUserId,
          })
        : undefined,
    )
    return row ? mapNotificationRow(row) : null
  },
  async markManyAsRead(ids, dataAccess) {
    const rows = await markNotificationsAsRead(
      db,
      ids,
      new Date(),
      dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: notifications.deptId,
            creatorColumn: notifications.createdByUserId,
          })
        : undefined,
    )
    return rows.map(mapNotificationRow)
  },
  async recipientExists(recipientUserId) {
    return (await getUserById(db, recipientUserId)) !== null
  },
})

export const createInMemoryNotificationRepository = (
  seed: InMemoryNotificationRepositorySeed = {},
): NotificationRepository => {
  const items = new Map(
    (seed.notifications ?? []).map((item) => [
      item.id,
      mapPublicNotificationToStored(item),
    ]),
  )
  const availableUserIds = new Set(seed.availableUserIds ?? [])

  return {
    async list(filter = {}, dataAccess?: DataAccessContext) {
      const filteredItems = [...items.values()]
        .filter((item) =>
          dataAccess
            ? matchesDataAccess(dataAccess, {
                deptId: item.deptId,
                creatorId: item.createdByUserId,
              })
            : true,
        )
        .filter((item) =>
          filter.recipientUserId === undefined
            ? true
            : item.recipientUserId === filter.recipientUserId,
        )
        .filter((item) =>
          filter.title?.trim()
            ? item.title
                .toLowerCase()
                .includes(filter.title.trim().toLowerCase())
            : true,
        )
        .filter((item) =>
          filter.content?.trim()
            ? item.content
                .toLowerCase()
                .includes(filter.content.trim().toLowerCase())
            : true,
        )
        .filter((item) =>
          filter.level === undefined ? true : item.level === filter.level,
        )
        .filter((item) =>
          filter.status === undefined ? true : item.status === filter.status,
        )
        .sort(compareNotifications)
      const page =
        typeof filter.page === "number" && Number.isFinite(filter.page)
          ? Math.max(1, Math.trunc(filter.page))
          : 1
      const pageSize =
        typeof filter.pageSize === "number" && Number.isFinite(filter.pageSize)
          ? Math.min(100, Math.max(1, Math.trunc(filter.pageSize)))
          : 20
      const total = filteredItems.length
      const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize)
      const resolvedPage = Math.min(page, totalPages)

      return {
        items: filteredItems
          .slice((resolvedPage - 1) * pageSize, resolvedPage * pageSize)
          .map(mapStoredNotificationToPublic),
        total,
        page: resolvedPage,
        pageSize,
        totalPages,
      }
    },
    async getById(id, dataAccess) {
      const item = items.get(id)
      if (
        item &&
        dataAccess &&
        !matchesDataAccess(dataAccess, {
          deptId: item.deptId,
          creatorId: item.createdByUserId,
        })
      ) {
        return null
      }

      return item ? mapStoredNotificationToPublic(item) : null
    },
    async create(input) {
      const notification: StoredNotificationRecord = {
        id: crypto.randomUUID(),
        recipientUserId: input.recipientUserId,
        title: input.title,
        content: input.content,
        level: input.level ?? "info",
        status: "unread",
        createdByUserId: input.createdByUserId ?? undefined,
        deptId: input.deptId ?? null,
        createdAt: new Date().toISOString(),
      }

      items.set(notification.id, notification)
      return mapStoredNotificationToPublic(notification)
    },
    async markAsRead(id, dataAccess) {
      const existing = items.get(id)

      if (!existing) {
        return null
      }

      if (
        dataAccess &&
        !matchesDataAccess(dataAccess, {
          deptId: existing.deptId,
          creatorId: existing.createdByUserId,
        })
      ) {
        return null
      }

      const updated: StoredNotificationRecord = {
        ...existing,
        status: "read",
        readAt: existing.readAt ?? new Date().toISOString(),
      }

      items.set(id, updated)
      return mapStoredNotificationToPublic(updated)
    },
    async markManyAsRead(ids, dataAccess) {
      const uniqueIds = [...new Set(ids)]
      const updatedItems: StoredNotificationRecord[] = []

      for (const id of uniqueIds) {
        const existing = items.get(id)

        if (!existing || existing.status === "read") {
          continue
        }

        if (
          dataAccess &&
          !matchesDataAccess(dataAccess, {
            deptId: existing.deptId,
            creatorId: existing.createdByUserId,
          })
        ) {
          continue
        }

        const updated: StoredNotificationRecord = {
          ...existing,
          status: "read",
          readAt: existing.readAt ?? new Date().toISOString(),
        }

        items.set(id, updated)
        updatedItems.push(updated)
      }

      return updatedItems.map(mapStoredNotificationToPublic)
    },
    async recipientExists(recipientUserId) {
      return availableUserIds.has(recipientUserId)
    },
  }
}

interface StoredNotificationRecord extends NotificationRecord {
  deptId?: string | null
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

const mapPublicNotificationToStored = (
  notification: NotificationRecord & {
    deptId?: string | null
  },
): StoredNotificationRecord => ({
  ...notification,
  deptId: notification.deptId ?? null,
})

const mapStoredNotificationToPublic = (
  notification: StoredNotificationRecord,
): NotificationRecord => ({
  id: notification.id,
  recipientUserId: notification.recipientUserId,
  title: notification.title,
  content: notification.content,
  level: notification.level,
  status: notification.status,
  createdByUserId: notification.createdByUserId,
  readAt: notification.readAt,
  createdAt: notification.createdAt,
})
