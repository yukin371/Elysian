import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { computed, ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type { AuthSessionSummary } from "../lib/platform-api/auth"
import { useAuthSessionWorkspace } from "./use-auth-session-workspace"

const originalFetch = globalThis.fetch

type FetchMockHandler = (
  ...args: Parameters<typeof fetch>
) => ReturnType<typeof fetch>

const createFetchMock = (handler: FetchMockHandler): typeof fetch =>
  Object.assign(handler, { preconnect: originalFetch.preconnect })

const installFetchMock = (handler: FetchMockHandler) => {
  globalThis.fetch = createFetchMock(handler)
}

const createSession = (
  overrides: Partial<AuthSessionSummary> & Pick<AuthSessionSummary, "id">,
): AuthSessionSummary => ({
  createdAt: overrides.createdAt ?? "2026-05-01T09:00:00.000Z",
  expiresAt: overrides.expiresAt ?? "2026-05-01T12:00:00.000Z",
  id: overrides.id,
  ip: overrides.ip ?? "10.0.0.10",
  isCurrent: overrides.isCurrent ?? false,
  lastUsedAt: overrides.lastUsedAt ?? "2026-05-01T10:00:00.000Z",
  replacedBySessionId: overrides.replacedBySessionId ?? null,
  revokedAt: overrides.revokedAt ?? null,
  updatedAt: overrides.updatedAt ?? "2026-05-01T10:00:00.000Z",
  userAgent: overrides.userAgent ?? "Mozilla/5.0 Chrome/135.0",
})

const createWorkspace = (overrides?: {
  onCurrentSessionRevoked?: () => Promise<void>
  onRecoverableAuthError?: (error: unknown) => void
}) =>
  useAuthSessionWorkspace({
    canEnterWorkspace: computed(() => true),
    currentShellTabKey: ref("workspace"),
    locale: ref("zh-CN"),
    onCurrentSessionRevoked:
      overrides?.onCurrentSessionRevoked ?? (async () => {}),
    onRecoverableAuthError: overrides?.onRecoverableAuthError ?? (() => {}),
    t: (key) => key,
  })

describe("useAuthSessionWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("filters sessions from local query state and clears summary on reset", async () => {
    const current = createSession({
      id: "session-current",
      isCurrent: true,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/135.0 Safari/537.36",
    })
    const rotated = createSession({
      id: "session-rotated",
      ip: "10.0.0.20",
      replacedBySessionId: "session-current",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    })
    const revoked = createSession({
      id: "session-revoked",
      ip: "10.0.0.30",
      revokedAt: "2026-05-01T11:00:00.000Z",
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148",
    })

    installFetchMock(
      async () =>
        new Response(JSON.stringify({ items: [current, rotated, revoked] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        }),
    )

    const workspace = createWorkspace()

    await workspace.reloadSessions()
    workspace.handleSearch({
      keyword: "  safari  ",
      scope: "history",
      state: "rotated",
    })

    expect(workspace.filteredSessionItems.value.map((item) => item.id)).toEqual(
      ["session-rotated"],
    )
    expect(workspace.sessionQueryValues.value).toEqual({
      keyword: "  safari  ",
      scope: "history",
      state: "rotated",
    })
    expect(workspace.currentQuerySummary.value).toBe(
      "app.onlineSession.field.keyword: safari / app.onlineSession.field.state: app.onlineSession.state.rotated / app.onlineSession.field.scope: app.onlineSession.scope.history",
    )

    workspace.handleReset()

    expect(workspace.filteredSessionItems.value.map((item) => item.id)).toEqual(
      ["session-current", "session-rotated", "session-revoked"],
    )
    expect(workspace.sessionQueryValues.value).toEqual({})
    expect(workspace.currentQuerySummary.value).toBe("app.filter.none")
  })

  test("revokes the current session and delegates sign-out without reloading", async () => {
    const current = createSession({
      id: "session-current",
      isCurrent: true,
    })
    const onCurrentSessionRevoked = mock(async () => {})
    const requests: Array<{ method: string; url: string }> = []

    installFetchMock(
      async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input)
        const method = init?.method ?? "GET"

        requests.push({ method, url })

        if (url.endsWith("/auth/sessions") && method === "GET") {
          return new Response(JSON.stringify({ items: [current] }), {
            headers: { "content-type": "application/json" },
            status: 200,
          })
        }

        if (
          url.endsWith("/auth/sessions/session-current") &&
          method === "DELETE"
        ) {
          return new Response(null, { status: 204 })
        }

        return new Response("not found", { status: 404 })
      },
    )

    const workspace = createWorkspace({ onCurrentSessionRevoked })

    await workspace.reloadSessions()
    workspace.handleRowClick({ id: "session-current" })
    await workspace.revokeSelectedSession()

    expect(onCurrentSessionRevoked).toHaveBeenCalledTimes(1)
    expect(
      requests.filter(
        (request) =>
          request.method === "GET" && request.url.endsWith("/auth/sessions"),
      ),
    ).toHaveLength(1)
    expect(workspace.sessionErrorMessage.value).toBe("")
    expect(workspace.sessionActionLoading.value).toBe(false)
  })

  test("revokes a historical session and refreshes the visible session list", async () => {
    const current = createSession({
      id: "session-current",
      ip: "10.0.0.10",
      isCurrent: true,
    })
    const rotated = createSession({
      id: "session-rotated",
      ip: "10.0.0.20",
      replacedBySessionId: "session-current",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    })
    let listCalls = 0

    installFetchMock(
      async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input)
        const method = init?.method ?? "GET"

        if (url.endsWith("/auth/sessions") && method === "GET") {
          listCalls += 1

          return new Response(
            JSON.stringify({
              items: listCalls === 1 ? [current, rotated] : [current],
            }),
            {
              headers: { "content-type": "application/json" },
              status: 200,
            },
          )
        }

        if (
          url.endsWith("/auth/sessions/session-rotated") &&
          method === "DELETE"
        ) {
          return new Response(null, { status: 204 })
        }

        return new Response("not found", { status: 404 })
      },
    )

    const workspace = createWorkspace()

    await workspace.reloadSessions()
    workspace.handleSearch({
      keyword: "  safari  ",
      scope: "history",
      state: "rotated",
    })
    workspace.handleRowClick({ id: "session-rotated" })

    await workspace.revokeSelectedSession()

    expect(listCalls).toBe(2)
    expect(workspace.selectedSessionId.value).toBe("session-current")
    expect(workspace.selectedSession?.value?.id).toBe("session-current")
    expect(workspace.filteredSessionItems.value).toEqual([])
    expect(workspace.sessionErrorMessage.value).toBe("")
  })

  test("reports recoverable auth errors when loading sessions fails", async () => {
    const recoverableErrors: unknown[] = []

    installFetchMock(
      async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input)
        const method = init?.method ?? "GET"

        if (url.endsWith("/auth/sessions") && method === "GET") {
          return new Response(JSON.stringify({ message: "unauthorized" }), {
            headers: { "content-type": "application/json" },
            status: 401,
          })
        }

        if (url.endsWith("/auth/refresh") && method === "POST") {
          return new Response(JSON.stringify({ message: "unauthorized" }), {
            headers: { "content-type": "application/json" },
            status: 401,
          })
        }

        return new Response("not found", { status: 404 })
      },
    )

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    workspace.handleSearch({
      keyword: " safari ",
      scope: "history",
      state: "rotated",
    })
    await workspace.reloadSessions()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.sessionErrorMessage.value).toContain("unauthorized")
    expect(workspace.filteredSessionItems.value).toEqual([])
    expect(workspace.sessionQueryValues.value).toEqual({
      keyword: " safari ",
      scope: "history",
      state: "rotated",
    })
    expect(workspace.currentQuerySummary.value).toBe(
      "app.onlineSession.field.keyword: safari / app.onlineSession.field.state: app.onlineSession.state.rotated / app.onlineSession.field.scope: app.onlineSession.scope.history",
    )
  })

  test("preserves cached session context when reloading sessions fails", async () => {
    const current = createSession({
      id: "session-current",
      ip: "10.0.0.10",
      isCurrent: true,
    })
    const rotated = createSession({
      id: "session-rotated",
      ip: "10.0.0.20",
      replacedBySessionId: "session-current",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    })
    const recoverableErrors: unknown[] = []
    let failReload = false

    installFetchMock(
      async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input)
        const method = init?.method ?? "GET"

        if (url.endsWith("/auth/sessions") && method === "GET") {
          if (failReload) {
            return new Response(JSON.stringify({ message: "unavailable" }), {
              headers: { "content-type": "application/json" },
              status: 503,
            })
          }

          return new Response(JSON.stringify({ items: [current, rotated] }), {
            headers: { "content-type": "application/json" },
            status: 200,
          })
        }

        return new Response("not found", { status: 404 })
      },
    )

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await workspace.reloadSessions()
    workspace.handleSearch({
      keyword: "  safari  ",
      scope: "history",
      state: "rotated",
    })
    workspace.handleRowClick({ id: "session-rotated" })
    failReload = true

    await workspace.reloadSessions()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.sessionErrorMessage.value).toContain("unavailable")
    expect(workspace.selectedSessionId.value).toBe("session-rotated")
    expect(workspace.selectedSession.value?.id).toBe("session-rotated")
    expect(workspace.countLabel.value).toBe("app.onlineSession.countLabel")
    expect(workspace.filteredSessionItems.value.map((item) => item.id)).toEqual(
      ["session-rotated"],
    )
    expect(workspace.sessionQueryValues.value).toEqual({
      keyword: "  safari  ",
      scope: "history",
      state: "rotated",
    })
  })

  test("reports recoverable auth errors when revoking a session fails", async () => {
    const current = createSession({
      id: "session-current",
      isCurrent: true,
    })
    const recoverableErrors: unknown[] = []

    installFetchMock(
      async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input)
        const method = init?.method ?? "GET"

        if (url.endsWith("/auth/sessions") && method === "GET") {
          return new Response(JSON.stringify({ items: [current] }), {
            headers: { "content-type": "application/json" },
            status: 200,
          })
        }

        if (
          url.endsWith("/auth/sessions/session-current") &&
          method === "DELETE"
        ) {
          return new Response(JSON.stringify({ message: "unauthorized" }), {
            headers: { "content-type": "application/json" },
            status: 401,
          })
        }

        if (url.endsWith("/auth/refresh") && method === "POST") {
          return new Response(JSON.stringify({ message: "unauthorized" }), {
            headers: { "content-type": "application/json" },
            status: 401,
          })
        }

        return new Response("not found", { status: 404 })
      },
    )

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await workspace.reloadSessions()
    workspace.handleRowClick({ id: "session-current" })
    await workspace.revokeSelectedSession()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.sessionErrorMessage.value).toContain("unauthorized")
    expect(workspace.sessionActionLoading.value).toBe(false)
    expect(workspace.selectedSession.value?.id).toBe("session-current")
  })
})
