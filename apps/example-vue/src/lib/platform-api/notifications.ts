import { requestJson } from "./core"
import type {
  CreateNotificationRequest,
  NotificationListQuery,
  NotificationRecord,
  NotificationsResponse,
} from "../platform-api"

export const fetchNotifications = async (
  query: NotificationListQuery = {},
): Promise<NotificationsResponse> => {
  const search = new URLSearchParams()

  if (query.recipientUserId?.trim()) {
    search.set("recipientUserId", query.recipientUserId.trim())
  }

  if (query.status) {
    search.set("status", query.status)
  }

  return requestJson<NotificationsResponse>(
    `/system/notifications${search.size > 0 ? `?${search.toString()}` : ""}`,
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
