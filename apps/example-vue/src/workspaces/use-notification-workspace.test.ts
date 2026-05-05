import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type { NotificationRecord } from "../lib/platform-api/notifications"
import { useNotificationWorkspace } from "./use-notification-workspace"

const originalFetch = globalThis.fetch

const createNotificationRecord = (
  overrides: Partial<NotificationRecord> & Pick<NotificationRecord, "id">,
): NotificationRecord => ({
  content: overrides.content ?? `Content ${overrides.id}`,
  createdAt: "2026-05-01T09:00:00.000Z",
  createdByUserId: overrides.createdByUserId ?? "admin",
  id: overrides.id,
  level: overrides.level ?? "info",
  readAt: overrides.readAt,
  recipientUserId: overrides.recipientUserId ?? "user-1",
  status: overrides.status ?? "unread",
  title: overrides.title ?? `Title ${overrides.id}`,
})

const createWorkspace = (options?: {
  onRecoverableAuthError?: (error: unknown) => void
}) =>
  useNotificationWorkspace({
    canCreate: computed(() => true),
    canUpdate: computed(() => true),
    canView: computed(() => true),
    currentShellTabKey: ref("runtime"),
    locale: ref("zh-CN"),
    localizeFieldLabel: (fieldKey) => fieldKey,
    localizeLevel: (level) => level,
    localizeStatus: (status) => status,
    onRecoverableAuthError: options?.onRecoverableAuthError ?? (() => {}),
    page: {
      formFields: computed(() => []),
      queryFields: computed(() => [
        { key: "title", kind: "text" as const, label: "Title" },
        { key: "content", kind: "text" as const, label: "Content" },
        {
          key: "level",
          kind: "select" as const,
          label: "Level",
          options: [
            { label: "Info", value: "info" },
            { label: "Warning", value: "warning" },
          ],
        },
        {
          key: "status",
          kind: "select" as const,
          label: "Status",
          options: [
            { label: "Unread", value: "unread" },
            { label: "Read", value: "read" },
          ],
        },
      ]),
      tableColumns: computed(() => [
        { key: "id" },
        { key: "title" },
        { key: "status" },
      ]),
    },
    t: (key, params) =>
      params
        ? `${key}:${Object.entries(params)
            .map(([name, value]) => `${name}=${String(value)}`)
            .join(",")}`
        : key,
  })

describe("useNotificationWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("requests filtered notifications from the server when searching and resetting", async () => {
    const first = createNotificationRecord({ id: "notice-1", title: "Alpha" })
    const second = createNotificationRecord({
      id: "notice-2",
      status: "read",
      title: "Beta",
    })
    const requests: string[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      requests.push(`${init?.method ?? "GET"} ${url}`)

      if (url.includes("/system/notifications/notice-1")) {
        return new Response(JSON.stringify(first), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response(JSON.stringify({ items: [first, second] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadNotifications()
    await workspace.handleSearch({
      content: "  content text  ",
      level: "warning",
      recipientUserId: "  user-9  ",
      status: "read",
      title: "  alpha  ",
    })
    await workspace.handleReset()

    expect(requests[0]).toContain(
      "GET http://localhost:3000/system/notifications",
    )
    expect(requests[1]).toContain(
      "GET http://localhost:3000/system/notifications/notice-1",
    )
    expect(requests[2]).toContain(
      "/system/notifications?recipientUserId=user-9&title=alpha&content=content+text&level=warning&status=read",
    )
    expect(requests[4]).toContain(
      "GET http://localhost:3000/system/notifications",
    )
    expect(workspace.notificationQueryValues.value).toEqual({})
  })

  test("marks visible unread notifications as read and updates the visible counter", async () => {
    const unread = createNotificationRecord({
      id: "notice-1",
      status: "unread",
    })
    const read = createNotificationRecord({
      id: "notice-2",
      readAt: "2026-05-01T10:00:00.000Z",
      status: "read",
    })
    const updatedUnread = {
      ...unread,
      readAt: "2026-05-01T11:00:00.000Z",
      status: "read" as const,
    }
    const requests: Array<{ method: string; url: string; body?: string }> = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"
      const body = typeof init?.body === "string" ? init.body : undefined

      requests.push({ body, method, url })

      if (url.includes("/system/notifications/read") && method === "POST") {
        return new Response(
          JSON.stringify({
            items: [updatedUnread],
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (url.includes("/system/notifications/notice-1")) {
        return new Response(JSON.stringify(unread), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response(JSON.stringify({ items: [unread, read] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadNotifications()
    expect(workspace.visibleUnreadNotificationCount.value).toBe(1)

    await workspace.markVisibleAsRead()

    expect(
      requests.some(
        (request) =>
          request.method === "POST" &&
          request.url.endsWith("/system/notifications/read") &&
          request.body === JSON.stringify({ ids: ["notice-1"] }),
      ),
    ).toBe(true)
    expect(workspace.visibleUnreadNotificationCount.value).toBe(0)
    expect(workspace.notificationItems.value[0]?.status).toBe("read")
  })

  test("reports recoverable auth errors when marking the selected notification as read fails", async () => {
    const unread = createNotificationRecord({
      id: "notice-1",
      status: "unread",
    })
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/system/notifications/notice-1/read") &&
        method === "POST"
      ) {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      if (url.endsWith("/system/notifications/notice-1") && method === "GET") {
        return new Response(JSON.stringify(unread), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response(JSON.stringify({ items: [unread] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await workspace.reloadNotifications()
    await workspace.markSelectedAsRead()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.notificationErrorMessage.value).toContain("unauthorized")
    expect(workspace.selectedNotification.value?.status).toBe("unread")
  })

  test("ignores row switches while notification mutation is loading", async () => {
    const first = createNotificationRecord({ id: "notice-1", title: "Alpha" })
    const second = createNotificationRecord({ id: "notice-2", title: "Beta" })
    const requests: string[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"
      requests.push(`${method} ${url}`)

      if (url.endsWith("/system/notifications/notice-1") && method === "GET") {
        return new Response(JSON.stringify(first), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/notifications/notice-2") && method === "GET") {
        return new Response(JSON.stringify(second), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response(JSON.stringify({ items: [first, second] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadNotifications()
    expect(workspace.selectedNotification.value?.id).toBe("notice-1")

    workspace.notificationLoading.value = true
    await workspace.handleRowClick({ id: "notice-2" })

    expect(workspace.selectedNotification.value?.id).toBe("notice-1")
    expect(
      requests.filter((request) =>
        request.endsWith("/system/notifications/notice-2"),
      ),
    ).toHaveLength(0)
  })
})
