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

export interface NotificationTableItem
  extends Omit<NotificationRecord, "level" | "readAt" | "createdAt"> {
  level: string
  statusLabel: string
  readAt: string
  createdAt: string
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const createDefaultNotificationDraft = () => ({
  recipientUserId: "",
  title: "",
  content: "",
  level: "info" as NotificationRecord["level"],
})

export const normalizeNotificationText = (value: unknown) =>
  String(value ?? "").trim()

export const normalizeNotificationLevel = (
  value: unknown,
): NotificationRecord["level"] => {
  switch (value) {
    case "warning":
    case "error":
    case "success":
      return value
    default:
      return "info"
  }
}

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

export const createNotificationTableItems = (
  notifications: NotificationRecord[],
  options: {
    localizeLevel: (level: NotificationRecord["level"]) => string
    localizeStatus: (status: NotificationRecord["status"]) => string
    formatDateTime: (value: string) => string
    readAtEmptyLabel: string
  },
): NotificationTableItem[] =>
  notifications.map((notification) => ({
    ...notification,
    level: options.localizeLevel(notification.level),
    statusLabel: options.localizeStatus(notification.status),
    readAt: notification.readAt
      ? options.formatDateTime(notification.readAt)
      : options.readAtEmptyLabel,
    createdAt: options.formatDateTime(notification.createdAt),
  }))
