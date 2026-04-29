import { describe, expect, it } from "bun:test"

import type { OperationLogRecord } from "@elysian/schema"

import {
  createInMemoryOperationLogRepository,
  createOperationLogModule,
} from "../../modules"
import {
  createAuthTestFixture,
  createTestApp,
  loginWithCredentials,
  logoutWithCookie,
  refreshWithCookie,
  testAdminPassword,
  testInvalidPassword,
} from "./test-support"

const toCookieHeader = (setCookie: string | null) => {
  if (!setCookie) {
    throw new Error("Expected set-cookie header to exist")
  }

  return setCookie.split(";")[0] ?? setCookie
}

const mapAuditLogToOperationLogRecord = (
  auditLog: Awaited<
    ReturnType<
      Awaited<
        ReturnType<typeof createAuthTestFixture>
      >["repository"]["listAuditLogs"]
    >
  >[number],
): OperationLogRecord => ({
  id: auditLog.id,
  category: auditLog.category,
  action: auditLog.action,
  authEventType:
    auditLog.category === "auth" &&
    ["login", "logout", "refresh", "session_revoke"].includes(auditLog.action)
      ? (auditLog.action as OperationLogRecord["authEventType"])
      : null,
  authFailureReason:
    typeof auditLog.details?.reason === "string"
      ? auditLog.details.reason
      : null,
  actorUserId: auditLog.actorUserId,
  targetType: auditLog.targetType,
  targetId: auditLog.targetId,
  result: auditLog.result,
  requestId: auditLog.requestId,
  ip: auditLog.ip,
  userAgent: auditLog.userAgent,
  details: auditLog.details,
  createdAt: auditLog.createdAt,
})

describe("auth operation log query surface", () => {
  it("exposes auth events through /system/operation-logs with explicit auth filters", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:operation-log:list"],
      isSuperAdmin: false,
    })
    const authApp = createTestApp({
      modules: [fixture.authModule],
    })

    const invalidLoginResponse = await loginWithCredentials(
      authApp,
      {
        username: "admin",
        password: testInvalidPassword,
      },
      {
        "user-agent": "operation-log-auth-agent",
        "x-forwarded-for": "127.0.0.51",
        "x-request-id": "req-login-failure-query-1",
      },
    )
    expect(invalidLoginResponse.status).toBe(401)

    const loginResponse = await loginWithCredentials(
      authApp,
      {
        username: "admin",
        password: testAdminPassword,
      },
      {
        "user-agent": "operation-log-auth-agent",
        "x-forwarded-for": "127.0.0.52",
        "x-request-id": "req-login-success-query-1",
      },
    )
    expect(loginResponse.status).toBe(200)
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }
    const loginCookie = toCookieHeader(loginResponse.headers.get("set-cookie"))

    const refreshResponse = await refreshWithCookie(authApp, loginCookie, {
      "user-agent": "operation-log-auth-agent",
      "x-forwarded-for": "127.0.0.53",
      "x-request-id": "req-refresh-query-1",
    })
    expect(refreshResponse.status).toBe(200)
    const refreshBody = (await refreshResponse.json()) as {
      accessToken: string
    }
    const refreshedCookie = toCookieHeader(
      refreshResponse.headers.get("set-cookie"),
    )

    const sessionsResponse = await authApp.handle(
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
      }>
    }
    const currentSession = sessionsBody.items.find((item) => item.isCurrent)
    expect(currentSession).toBeDefined()

    const logoutResponse = await logoutWithCookie(authApp, refreshedCookie, {
      "user-agent": "operation-log-auth-agent",
      "x-forwarded-for": "127.0.0.54",
      "x-request-id": "req-logout-query-1",
    })
    expect(logoutResponse.status).toBe(204)

    const revokeResponse = await authApp.handle(
      new Request(`http://localhost/auth/sessions/${currentSession?.id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${refreshBody.accessToken}`,
          "user-agent": "operation-log-auth-agent",
          "x-forwarded-for": "127.0.0.55",
          "x-request-id": "req-session-revoke-query-1",
        },
      }),
    )
    expect(revokeResponse.status).toBe(204)

    const operationLogRepository = createInMemoryOperationLogRepository(
      (await fixture.repository.listAuditLogs()).map(
        mapAuditLogToOperationLogRecord,
      ),
    )
    const queryApp = createTestApp({
      modules: [
        fixture.authModule,
        createOperationLogModule(operationLogRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })

    const loginLogsResponse = await queryApp.handle(
      new Request(
        "http://localhost/system/operation-logs?authEventType=login",
        {
          headers: {
            authorization: `Bearer ${refreshBody.accessToken}`,
          },
        },
      ),
    )
    expect(loginLogsResponse.status).toBe(200)
    const loginLogsBody = (await loginLogsResponse.json()) as {
      items: OperationLogRecord[]
    }

    expect(
      loginLogsBody.items.map((item) => [
        item.action,
        item.result,
        item.authEventType,
        item.authFailureReason,
      ]),
    ).toEqual([
      ["login", "success", "login", null],
      ["login", "failure", "login", "invalid_password"],
    ])

    const failedLoginResponse = await queryApp.handle(
      new Request(
        "http://localhost/system/operation-logs?authEventType=login&authFailureReason=invalid_password",
        {
          headers: {
            authorization: `Bearer ${refreshBody.accessToken}`,
          },
        },
      ),
    )
    expect(failedLoginResponse.status).toBe(200)
    const failedLoginBody = (await failedLoginResponse.json()) as {
      items: OperationLogRecord[]
    }

    expect(failedLoginBody.items).toHaveLength(1)
    expect(failedLoginBody.items[0]).toMatchObject({
      action: "login",
      authEventType: "login",
      authFailureReason: "invalid_password",
      result: "failure",
      requestId: "req-login-failure-query-1",
    })

    const sessionRevokeLog = (await fixture.repository.listAuditLogs()).find(
      (item) => item.action === "session_revoke",
    )
    expect(sessionRevokeLog).toBeDefined()

    const detailResponse = await queryApp.handle(
      new Request(
        `http://localhost/system/operation-logs/${sessionRevokeLog?.id}`,
        {
          headers: {
            authorization: `Bearer ${refreshBody.accessToken}`,
          },
        },
      ),
    )
    expect(detailResponse.status).toBe(200)
    expect(await detailResponse.json()).toMatchObject({
      id: sessionRevokeLog?.id,
      action: "session_revoke",
      authEventType: "session_revoke",
      authFailureReason: null,
      details: {
        currentSessionRevoked: true,
        alreadyRevoked: true,
      },
    })
  })
})
