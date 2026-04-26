import type {
  NotificationLevel,
  NotificationRecord,
  NotificationStatus,
} from "@elysian/schema"

export interface NotificationWorkspaceQuery {
  recipientUserId?: string
  title?: string
  content?: string
  level?: NotificationLevel | ""
  status?: NotificationStatus | ""
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const filterNotifications = (
  notifications: NotificationRecord[],
  query: NotificationWorkspaceQuery,
) => {
  const recipientUserId = normalizeQueryValue(query.recipientUserId)
  const title = normalizeQueryValue(query.title)
  const content = normalizeQueryValue(query.content)
  const level = query.level ?? ""
  const status = query.status ?? ""

  return notifications.filter((notification) => {
    if (
      recipientUserId.length > 0 &&
      !notification.recipientUserId.toLowerCase().includes(recipientUserId)
    ) {
      return false
    }

    if (title.length > 0 && !notification.title.toLowerCase().includes(title)) {
      return false
    }

    if (
      content.length > 0 &&
      !notification.content.toLowerCase().includes(content)
    ) {
      return false
    }

    if (level && notification.level !== level) {
      return false
    }

    if (status && notification.status !== status) {
      return false
    }

    return true
  })
}

export const resolveNotificationSelection = (
  notifications: Array<Pick<NotificationRecord, "id">>,
  selectedNotificationId: string | null,
) => {
  if (notifications.length === 0) {
    return null
  }

  if (
    selectedNotificationId &&
    notifications.some(
      (notification) => notification.id === selectedNotificationId,
    )
  ) {
    return selectedNotificationId
  }

  return notifications[0]?.id ?? null
}
