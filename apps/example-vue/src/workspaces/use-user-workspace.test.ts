import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type { UserRecord } from "../lib/platform-api/users"
import { useUserWorkspace } from "./use-user-workspace"

const originalFetch = globalThis.fetch
const resetSecret = "reset-secret-value"

const createUserRecord = (overrides?: Partial<UserRecord>): UserRecord => ({
  createdAt: "2026-05-01T09:00:00.000Z",
  displayName: "Admin User",
  email: "admin@example.com",
  id: "user-1",
  isSuperAdmin: true,
  lastLoginAt: "2026-05-01T08:00:00.000Z",
  phone: "13800000000",
  status: "active",
  updatedAt: "2026-05-01T10:00:00.000Z",
  username: "admin",
  ...overrides,
})

const createWorkspace = (options?: {
  onRecoverableAuthError?: (error: unknown) => void
}) =>
  useUserWorkspace({
    canCreate: computed(() => true),
    canResetPassword: computed(() => true),
    canUpdate: computed(() => true),
    canView: computed(() => true),
    currentShellTabKey: ref("runtime"),
    locale: ref("zh-CN"),
    localizeBoolean: (value) => (value ? "yes" : "no"),
    localizeFieldLabel: (fieldKey) => fieldKey,
    localizeStatus: (status) => status,
    onRecoverableAuthError: options?.onRecoverableAuthError ?? (() => {}),
    page: {
      formFields: computed(() => []),
      queryFields: computed(() => []),
      tableColumns: computed(() => []),
    },
    t: (key, params) =>
      key === "app.user.panelTitle.reset" && params?.name
        ? `reset:${String(params.name)}`
        : key,
  })

describe("useUserWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("resets the selected user password and returns to detail mode", async () => {
    const user = createUserRecord()
    const requests: Array<{ method: string; url: string; body?: string }> = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"
      const body =
        typeof init?.body === "string"
          ? init.body
          : init?.body instanceof Uint8Array
            ? Buffer.from(init.body).toString("utf8")
            : undefined

      requests.push({ body, method, url })

      if (url.endsWith("/system/users") && method === "GET") {
        return new Response(JSON.stringify({ items: [user] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/users/user-1") && method === "GET") {
        return new Response(JSON.stringify(user), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/system/users/user-1/reset-password") &&
        method === "POST"
      ) {
        return new Response(null, { status: 204 })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadUsers()
    workspace.startPasswordReset(user)
    workspace.userPasswordInput.value = `  ${resetSecret}  `

    await workspace.submitPasswordReset()

    expect(workspace.userPanelMode.value).toBe("detail")
    expect(workspace.userPasswordInput.value).toBe("")
    expect(workspace.userErrorMessage.value).toBe("")
    expect(
      requests.some((request) => request.url.endsWith("/system/users")),
    ).toBe(true)
    expect(
      requests.some((request) => request.url.endsWith("/system/users/user-1")),
    ).toBe(true)
    expect(
      requests.some(
        (request) =>
          request.url.endsWith("/system/users/user-1/reset-password") &&
          request.method === "POST" &&
          request.body === JSON.stringify({ password: resetSecret }),
      ),
    ).toBe(true)
  })

  test("requires a password before submitting reset", async () => {
    const user = createUserRecord()
    const requests: string[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      requests.push(`${init?.method ?? "GET"} ${url}`)

      if (
        url.endsWith("/system/users") ||
        url.endsWith("/system/users/user-1")
      ) {
        return new Response(
          JSON.stringify(
            url.endsWith("/system/users") ? { items: [user] } : user,
          ),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadUsers()
    workspace.startPasswordReset(user)
    await workspace.submitPasswordReset()

    expect(workspace.userPanelMode.value).toBe("reset")
    expect(workspace.userErrorMessage.value).toBe(
      "app.error.userPasswordRequired",
    )
    expect(
      requests.some((request) =>
        request.endsWith("/system/users/user-1/reset-password"),
      ),
    ).toBe(false)
  })

  test("reports recoverable auth errors when password reset fails", async () => {
    const user = createUserRecord()
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/system/users") && method === "GET") {
        return new Response(JSON.stringify({ items: [user] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/users/user-1") && method === "GET") {
        return new Response(JSON.stringify(user), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/system/users/user-1/reset-password") &&
        method === "POST"
      ) {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await workspace.reloadUsers()
    workspace.startPasswordReset(user)
    workspace.userPasswordInput.value = resetSecret

    await workspace.submitPasswordReset()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.userPanelMode.value).toBe("reset")
    expect(workspace.userErrorMessage.value).toContain("unauthorized")
  })

  test("returns to detail mode when selecting another user during password reset", async () => {
    const firstUser = createUserRecord()
    const secondUser = createUserRecord({
      displayName: "Editor User",
      email: "editor@example.com",
      id: "user-2",
      isSuperAdmin: false,
      phone: "13900000000",
      username: "editor",
    })

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/system/users") && method === "GET") {
        return new Response(
          JSON.stringify({ items: [firstUser, secondUser] }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (url.endsWith("/system/users/user-1") && method === "GET") {
        return new Response(JSON.stringify(firstUser), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/users/user-2") && method === "GET") {
        return new Response(JSON.stringify(secondUser), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadUsers()
    workspace.startPasswordReset(firstUser)
    workspace.userPasswordInput.value = resetSecret

    await workspace.handleRowClick({ id: "user-2" })

    expect(workspace.userPanelMode.value).toBe("detail")
    expect(workspace.userPasswordInput.value).toBe("")
    expect(workspace.selectedUserId.value).toBe("user-2")
    expect(workspace.selectedUser.value?.id).toBe("user-2")
    expect(workspace.panelTitle.value).toBe("Editor User")
  })
})
