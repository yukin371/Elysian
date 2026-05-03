import { describe, expect, it } from "bun:test"
import { errorCodes } from "../../errors/registry"
import {
  createAuthTestFixture,
  createTestApp,
  loginWithCredentials,
  logoutWithCookie,
  refreshCookiePrefix,
  refreshWithCookie,
  testAdminPassword,
  testInvalidPassword,
  toCookieHeader,
} from "./test-support"

describe("createServerApp auth sessions", () => {
  it("publishes auth success responses in the openapi spec", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const response = await app.handle(
      new Request("http://localhost/openapi/json"),
    )

    expect(response.status).toBe(200)
    const payload = (await response.json()) as {
      paths: Record<
        string,
        Record<
          string,
          {
            responses?: Record<string, unknown>
          }
        >
      >
    }

    expect(payload.paths["/auth/login"]?.post?.responses?.["200"]).toBeDefined()
    expect(payload.paths["/auth/login"]?.post?.responses?.["401"]).toBeDefined()
    expect(payload.paths["/auth/me"]?.get?.responses?.["200"]).toBeDefined()
    expect(payload.paths["/auth/me"]?.get?.responses?.["401"]).toBeDefined()
    expect(payload.paths["/auth/sessions"]?.get?.responses?.["200"]).toBeDefined()
    expect(payload.paths["/auth/refresh"]?.post?.responses?.["200"]).toBeDefined()
    expect(
      payload.paths["/auth/sessions/{id}"]?.delete?.responses?.["204"],
    ).toBeDefined()
    expect(
      payload.paths["/auth/sessions/{id}"]?.delete?.responses?.["404"],
    ).toBeDefined()
    expect(payload.paths["/auth/logout"]?.post?.responses?.["204"]).toBeDefined()
  })

  it("refreshes tokens and rotates the refresh session", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testAdminPassword,
    })
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }
    const refreshResponse = await refreshWithCookie(
      app,
      toCookieHeader(loginResponse.headers.get("set-cookie")),
    )

    expect(refreshResponse.status).toBe(200)

    const refreshBody = (await refreshResponse.json()) as {
      accessToken: string
      roles: string[]
    }

    expect(refreshBody.accessToken).not.toBe(loginBody.accessToken)
    expect(refreshBody.roles).toEqual(["admin"])
    expect(refreshResponse.headers.get("set-cookie")).toContain(
      refreshCookiePrefix,
    )
  })

  it("lists current user refresh sessions with rotation state", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await loginWithCredentials(
      app,
      {
        username: "admin",
        password: testAdminPassword,
      },
      {
        "user-agent": "session-list-agent",
        "x-forwarded-for": "127.0.0.21",
      },
    )
    const refreshResponse = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: {
          cookie: toCookieHeader(loginResponse.headers.get("set-cookie")),
          "user-agent": "session-list-agent",
          "x-forwarded-for": "127.0.0.22",
        },
      }),
    )
    const refreshBody = (await refreshResponse.json()) as {
      accessToken: string
    }

    const sessionsResponse = await app.handle(
      new Request("http://localhost/auth/sessions", {
        headers: {
          authorization: `Bearer ${refreshBody.accessToken}`,
        },
      }),
    )

    expect(sessionsResponse.status).toBe(200)

    const sessionsBody = (await sessionsResponse.json()) as {
      items: Array<{
        id: string
        isCurrent: boolean
        lastUsedAt: string | null
        revokedAt: string | null
        replacedBySessionId: string | null
        userAgent: string | null
        ip: string | null
      }>
    }
    const currentSession = sessionsBody.items.find((item) => item.isCurrent)
    const rotatedSession = sessionsBody.items.find((item) => !item.isCurrent)

    expect(sessionsBody.items).toHaveLength(2)
    expect(currentSession).toMatchObject({
      revokedAt: null,
      userAgent: "session-list-agent",
      ip: "127.0.0.22",
    })
    expect(rotatedSession).toMatchObject({
      userAgent: "session-list-agent",
      ip: "127.0.0.21",
      lastUsedAt: expect.any(String),
      revokedAt: expect.any(String),
      replacedBySessionId: currentSession?.id,
    })
  })

  it("revokes the selected refresh session for the current user", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "session-revoke-agent",
          "x-forwarded-for": "127.0.0.31",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }
    const cookieHeader = toCookieHeader(loginResponse.headers.get("set-cookie"))

    const sessionsResponse = await app.handle(
      new Request("http://localhost/auth/sessions", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )
    const sessionsBody = (await sessionsResponse.json()) as {
      items: Array<{
        id: string
        isCurrent: boolean
      }>
    }
    const currentSession = sessionsBody.items.find((item) => item.isCurrent)
    expect(currentSession).toBeDefined()

    const revokeResponse = await app.handle(
      new Request(`http://localhost/auth/sessions/${currentSession?.id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "user-agent": "session-revoke-agent",
          "x-forwarded-for": "127.0.0.32",
          "x-request-id": "req-session-revoke-1",
        },
      }),
    )

    expect(revokeResponse.status).toBe(204)
    expect(revokeResponse.headers.get("set-cookie")).toContain("Max-Age=0")

    const refreshResponse = await refreshWithCookie(app, cookieHeader)

    expect(refreshResponse.status).toBe(401)
    expect(await refreshResponse.json()).toEqual({
      code: errorCodes.AUTH_REFRESH_TOKEN_EXPIRED,
      message: "Refresh token is expired or revoked",
      status: 401,
      details: {
        sessionId: currentSession?.id,
      },
    })

    const auditLogs = await fixture.repository.listAuditLogs()
    const auditLog = auditLogs.find((log) => log.action === "session_revoke")

    expect(auditLog).toMatchObject({
      category: "auth",
      action: "session_revoke",
      actorUserId: fixture.userId,
      targetType: "session",
      targetId: currentSession?.id,
      result: "success",
      requestId: "req-session-revoke-1",
      ip: "127.0.0.32",
      userAgent: "session-revoke-agent",
      details: {
        currentSessionRevoked: true,
        alreadyRevoked: false,
      },
    })
  })

  it("returns 404 when revoking an unknown refresh session", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testAdminPassword,
    })
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }
    const unknownSessionId = crypto.randomUUID()

    const revokeResponse = await app.handle(
      new Request(`http://localhost/auth/sessions/${unknownSessionId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "user-agent": "session-revoke-missing-agent",
          "x-forwarded-for": "127.0.0.33",
          "x-request-id": "req-session-revoke-missing-1",
        },
      }),
    )

    expect(revokeResponse.status).toBe(404)
    expect(await revokeResponse.json()).toEqual({
      code: errorCodes.AUTH_SESSION_NOT_FOUND,
      message: "Session not found",
      status: 404,
      details: {
        sessionId: unknownSessionId,
      },
    })

    const [auditLog] = await fixture.repository.listAuditLogs()

    expect(auditLog).toMatchObject({
      category: "auth",
      action: "session_revoke",
      actorUserId: fixture.userId,
      targetType: "session",
      targetId: unknownSessionId,
      result: "failure",
      requestId: "req-session-revoke-missing-1",
      ip: "127.0.0.33",
      userAgent: "session-revoke-missing-agent",
      details: {
        reason: "session_not_found",
      },
    })
  })
  it("marks refresh cookies as Secure when enabled", async () => {
    const fixture = await createAuthTestFixture({
      secureCookies: true,
    })
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testAdminPassword,
    })

    expect(loginResponse.headers.get("set-cookie")).toContain("Secure")
  })

  it("revokes the refresh session on logout", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testAdminPassword,
    })
    const cookieHeader = toCookieHeader(loginResponse.headers.get("set-cookie"))
    const logoutResponse = await logoutWithCookie(app, cookieHeader)

    expect(logoutResponse.status).toBe(204)
    expect(logoutResponse.headers.get("set-cookie")).toContain("Max-Age=0")

    const refreshResponse = await refreshWithCookie(app, cookieHeader)

    expect(refreshResponse.status).toBe(401)
    expect(await refreshResponse.json()).toEqual({
      code: errorCodes.AUTH_REFRESH_TOKEN_EXPIRED,
      message: "Refresh token is expired or revoked",
      status: 401,
      details: {
        sessionId: expect.any(String),
      },
    })
  })

  it("rejects invalid credentials during login", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const response = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testInvalidPassword,
        }),
      }),
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      code: errorCodes.AUTH_INVALID_CREDENTIALS,
      message: "Invalid username or password",
      status: 401,
      details: {
        username: "admin",
      },
    })
  })
})
