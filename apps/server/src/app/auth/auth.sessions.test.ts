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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const readJsonRecord = async (response: { json(): Promise<unknown> }) => {
  const body: unknown = await response.json()

  if (!isRecord(body)) {
    throw new Error("Malformed JSON response")
  }

  return body
}

const readRecord = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (!isRecord(property)) {
    throw new Error(`Expected object field: ${key}`)
  }

  return property
}

const readString = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (typeof property !== "string") {
    throw new Error(`Expected string field: ${key}`)
  }

  return property
}

const readNullableString = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (property !== null && typeof property !== "string") {
    throw new Error(`Expected nullable string field: ${key}`)
  }

  return property
}

const readBoolean = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (typeof property !== "boolean") {
    throw new Error(`Expected boolean field: ${key}`)
  }

  return property
}

const readStringArray = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (
    !Array.isArray(property) ||
    !property.every((item) => typeof item === "string")
  ) {
    throw new Error(`Expected string array field: ${key}`)
  }

  return property
}

const readRecordArray = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (!Array.isArray(property) || !property.every((item) => isRecord(item))) {
    throw new Error(`Expected object array field: ${key}`)
  }

  return property
}

const readSessionItems = (value: Record<string, unknown>) =>
  readRecordArray(value, "items")

const readAuthContextBody = async (response: Response) => {
  const body = await readJsonRecord(response)
  const accessToken = readString(body, "accessToken")
  const deptIds = readStringArray(body, "deptIds")
  const dataScopes = body.dataScopes
  const dataAccess = readRecord(body, "dataAccess")

  if (!Array.isArray(dataScopes)) {
    throw new Error("Expected array field: dataScopes")
  }

  return {
    accessToken,
    deptIds,
    dataScopes,
    dataAccess,
  }
}

const getOpenApiResponse = (
  paths: Record<string, unknown>,
  routePath: string,
  method: string,
  status: string,
) => {
  const route = readRecord(paths, routePath)
  const operation = readRecord(route, method)
  const responses = readRecord(operation, "responses")

  return responses[status]
}

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
    const payload = await readJsonRecord(response)
    const paths = readRecord(payload, "paths")

    expect(
      getOpenApiResponse(paths, "/auth/login", "post", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/auth/login", "post", "401"),
    ).toBeDefined()
    expect(getOpenApiResponse(paths, "/auth/me", "get", "200")).toBeDefined()
    expect(getOpenApiResponse(paths, "/auth/me", "get", "401")).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/auth/sessions", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/auth/refresh", "post", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/auth/sessions/{id}", "delete", "204"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/auth/sessions/{id}", "delete", "404"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/auth/logout", "post", "204"),
    ).toBeDefined()
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
    const loginBody = await readAuthContextBody(loginResponse)
    const refreshResponse = await refreshWithCookie(
      app,
      toCookieHeader(loginResponse.headers.get("set-cookie")),
    )

    expect(refreshResponse.status).toBe(200)

    const refreshResponseClone = refreshResponse.clone()
    const refreshBody = await readAuthContextBody(refreshResponse)
    const refreshJson = await readJsonRecord(refreshResponseClone)
    const roles = readStringArray(refreshJson, "roles")

    expect(refreshBody.accessToken).not.toBe(loginBody.accessToken)
    expect(loginBody.deptIds).toEqual([])
    expect(loginBody.dataScopes).toEqual([{ scope: 1 }])
    expect(loginBody.dataAccess).toEqual({
      userId: fixture.userId,
      hasAllAccess: true,
      accessibleDeptIds: [],
      allowSelf: false,
    })
    expect(refreshBody.deptIds).toEqual(loginBody.deptIds)
    expect(refreshBody.dataScopes).toEqual(loginBody.dataScopes)
    expect(refreshBody.dataAccess).toEqual(loginBody.dataAccess)
    expect(roles).toEqual(["admin"])
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
    const refreshBody = await readJsonRecord(refreshResponse)

    const sessionsResponse = await app.handle(
      new Request("http://localhost/auth/sessions", {
        headers: {
          authorization: `Bearer ${readString(refreshBody, "accessToken")}`,
        },
      }),
    )

    expect(sessionsResponse.status).toBe(200)

    const sessionsBody = await readJsonRecord(sessionsResponse)
    const sessionItems = readSessionItems(sessionsBody)
    const currentSession = sessionItems.find((item) =>
      readBoolean(item, "isCurrent"),
    )
    const rotatedSession = sessionItems.find(
      (item) => !readBoolean(item, "isCurrent"),
    )
    const currentSessionId = currentSession
      ? readString(currentSession, "id")
      : undefined

    expect(sessionItems).toHaveLength(2)
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
      replacedBySessionId: currentSessionId,
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
    const loginBody = await readJsonRecord(loginResponse)
    const cookieHeader = toCookieHeader(loginResponse.headers.get("set-cookie"))

    const sessionsResponse = await app.handle(
      new Request("http://localhost/auth/sessions", {
        headers: {
          authorization: `Bearer ${readString(loginBody, "accessToken")}`,
        },
      }),
    )
    const sessionsBody = await readJsonRecord(sessionsResponse)
    const sessionItems = readSessionItems(sessionsBody)
    const currentSession = sessionItems.find((item) =>
      readBoolean(item, "isCurrent"),
    )
    expect(currentSession).toBeDefined()
    const currentSessionId = currentSession
      ? readString(currentSession, "id")
      : undefined

    const revokeResponse = await app.handle(
      new Request(`http://localhost/auth/sessions/${currentSessionId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${readString(loginBody, "accessToken")}`,
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
        sessionId: currentSessionId,
      },
    })

    const auditLogs = await fixture.repository.listAuditLogs()
    const auditLog = auditLogs.find((log) => log.action === "session_revoke")

    expect(auditLog).toMatchObject({
      category: "auth",
      action: "session_revoke",
      actorUserId: fixture.userId,
      targetType: "session",
      targetId: currentSessionId,
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
    const loginBody = await readJsonRecord(loginResponse)
    const unknownSessionId = crypto.randomUUID()

    const revokeResponse = await app.handle(
      new Request(`http://localhost/auth/sessions/${unknownSessionId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${readString(loginBody, "accessToken")}`,
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
