import { buildApiUrl } from "../api/client"
import { requestJson } from "../api/client"
import type { NotificationRecord } from "./list"

export const markNotificationReadEndpoint = (notificationId: string) =>
  buildApiUrl(`/system/notifications/${notificationId}/read`)

export const fetchNotificationById = async (notificationId: string) =>
  requestJson<NotificationRecord>(
    `/system/notifications/${encodeURIComponent(notificationId)}`,
    {
      auth: true,
    },
  )

export const markNotificationAsRead = async (notificationId: string) =>
  requestJson<NotificationRecord>(
    `/system/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "POST",
      auth: true,
    },
  )
