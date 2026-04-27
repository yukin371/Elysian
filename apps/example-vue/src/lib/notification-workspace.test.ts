import { describe, expect, test } from "bun:test"

import type { NotificationRecord } from "@elysian/schema"

import {
  createDefaultNotificationDraft,
  createNotificationTableItems,
  filterNotifications,
  normalizeNotificationLevel,
  normalizeNotificationText,
  resolveNotificationSelection,
} from "./notification-workspace"

const createNotification = (
  overrides: Partial<NotificationRecord> & Pick<NotificationRecord, "id">,
): NotificationRecord => ({
  id: overrides.id,
  recipientUserId: overrides.recipientUserId ?? "user_ops_1",
  title: overrides.title ?? "Default Title",
  content: overrides.content ?? "Default content",
  level: overrides.level ?? "info",
  status: overrides.status ?? "unread",
  createdByUserId: overrides.createdByUserId,
  readAt: overrides.readAt,
  createdAt: overrides.createdAt ?? "2026-04-27T08:00:00.000Z",
})

describe("notification workspace helpers", () => {
  const notifications = [
    createNotification({
      id: "notification_1",
      recipientUserId: "user_ops_1",
      title: "System upgrade tonight",
      content: "Please complete your checks before 20:00.",
      level: "warning",
      status: "unread",
    }),
    createNotification({
      id: "notification_2",
      recipientUserId: "user_finance_1",
      title: "Expense approved",
      content: "The April expense request has been approved.",
      level: "success",
      status: "read",
      readAt: "2026-04-27T08:30:00.000Z",
    }),
    createNotification({
      id: "notification_3",
      recipientUserId: "user_ops_2",
      title: "API error detected",
      content: "The overnight task reported a 500 error.",
      level: "error",
      status: "unread",
    }),
  ]

  test("filters notifications across recipient, title, content, level, and status", () => {
    expect(
      filterNotifications(notifications, {
        recipientUserId: "finance",
      }).map((notification) => notification.id),
    ).toEqual(["notification_2"])

    expect(
      filterNotifications(notifications, {
        title: "system upgrade",
      }).map((notification) => notification.id),
    ).toEqual(["notification_1"])

    expect(
      filterNotifications(notifications, {
        content: "500 error",
      }).map((notification) => notification.id),
    ).toEqual(["notification_3"])

    expect(
      filterNotifications(notifications, {
        level: "warning",
        status: "unread",
      }).map((notification) => notification.id),
    ).toEqual(["notification_1"])
  })

  test("builds the default notification draft and normalizes form input", () => {
    expect(createDefaultNotificationDraft()).toEqual({
      recipientUserId: "",
      title: "",
      content: "",
      level: "info",
    })

    expect(normalizeNotificationText("  nightly report  ")).toBe(
      "nightly report",
    )
    expect(normalizeNotificationLevel("warning")).toBe("warning")
    expect(normalizeNotificationLevel("unknown")).toBe("info")
  })

  test("keeps the selected notification when it remains visible", () => {
    expect(resolveNotificationSelection(notifications, "notification_2")).toBe(
      "notification_2",
    )
  })

  test("falls back to the first visible notification when the previous selection disappears", () => {
    const unreadNotifications = notifications.filter(
      (notification) => notification.status === "unread",
    )

    expect(
      resolveNotificationSelection(unreadNotifications, "notification_2"),
    ).toBe("notification_1")
  })

  test("returns null when there are no visible notifications", () => {
    expect(resolveNotificationSelection([], null)).toBeNull()
  })

  test("maps notification status into a dedicated table label without losing the raw status", () => {
    const tableItems = createNotificationTableItems(notifications, {
      localizeLevel: (level) => `level:${level}`,
      localizeStatus: (status) => `status:${status}`,
      formatDateTime: (value) => `time:${value}`,
      readAtEmptyLabel: "not-read-yet",
    })

    expect(tableItems).toEqual([
      expect.objectContaining({
        id: "notification_1",
        level: "level:warning",
        status: "unread",
        statusLabel: "status:unread",
        readAt: "not-read-yet",
        createdAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "notification_2",
        level: "level:success",
        status: "read",
        statusLabel: "status:read",
        readAt: "time:2026-04-27T08:30:00.000Z",
        createdAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "notification_3",
        level: "level:error",
        status: "unread",
        statusLabel: "status:unread",
        readAt: "not-read-yet",
        createdAt: "time:2026-04-27T08:00:00.000Z",
      }),
    ])
  })
})
