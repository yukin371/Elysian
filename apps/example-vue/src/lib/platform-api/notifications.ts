import type { NotificationRecord as SchemaNotificationRecord } from "@elysian/schema"

import { requestBlob, requestJson } from "./core"

export type NotificationRecord = SchemaNotificationRecord

export interface NotificationsResponse {
  items: NotificationRecord[]
}

export interface NotificationListQuery {
  recipientUserId?: string
  title?: string
  content?: string
  level?: NotificationRecord["level"]
  status?: NotificationRecord["status"]
}

export interface CreateNotificationRequest {
  recipientUserId: string
  title: string
  content: string
  level?: NotificationRecord["level"]
}

const buildNotificationSearch = (query: NotificationListQuery = {}) => {
  const search = new URLSearchParams()

  if (query.recipientUserId?.trim()) {
    search.set("recipientUserId", query.recipientUserId.trim())
  }

  if (query.title?.trim()) {
    search.set("title", query.title.trim())
  }

  if (query.content?.trim()) {
    search.set("content", query.content.trim())
  }

  if (query.level) {
    search.set("level", query.level)
  }

  if (query.status) {
    search.set("status", query.status)
  }

  return search
}

export const fetchNotifications = async (
  query: NotificationListQuery = {},
): Promise<NotificationsResponse> => {
  const search = buildNotificationSearch(query)

  return requestJson<NotificationsResponse>(
    `/system/notifications${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const exportNotificationsCsv = async (
  query: NotificationListQuery = {},
): Promise<Blob> => {
  const search = buildNotificationSearch(query)

  return requestBlob(
    `/system/notifications/export${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const fetchNotificationById = async (
  id: string,
): Promise<NotificationRecord> =>
  requestJson<NotificationRecord>(
    `/system/notifications/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  )

export const createNotification = async (
  input: CreateNotificationRequest,
): Promise<NotificationRecord> =>
  requestJson<NotificationRecord>("/system/notifications", {
    method: "POST",
    body: input,
    auth: true,
  })

export const markNotificationAsRead = async (
  id: string,
): Promise<NotificationRecord> =>
  requestJson<NotificationRecord>(
    `/system/notifications/${encodeURIComponent(id)}/read`,
    {
      method: "POST",
      auth: true,
    },
  )

export const markNotificationsAsRead = async (
  ids: string[],
): Promise<NotificationsResponse> =>
  requestJson<NotificationsResponse>("/system/notifications/read", {
    method: "POST",
    body: { ids },
    auth: true,
  })
