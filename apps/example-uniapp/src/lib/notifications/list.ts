import { buildApiUrl } from "../api/client"
import { requestJson } from "../api/client"

export const notificationsEndpoint = () => buildApiUrl("/system/notifications")

export type NotificationLevel = "info" | "success" | "warning" | "error"
export type NotificationStatus = "unread" | "read"

export interface NotificationRecord {
  id: string
  recipientUserId: string
  title: string
  content: string
  level: NotificationLevel
  status: NotificationStatus
  createdByUserId?: string
  readAt?: string
  createdAt: string
}

export interface NotificationsResponse {
  items: NotificationRecord[]
}

export const fetchNotifications = async (query: {
  recipientUserId?: string
  status?: NotificationStatus
} = {}) => {
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
