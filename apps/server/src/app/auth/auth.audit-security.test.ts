import { describe, expect, it } from "bun:test"
import { DEFAULT_TENANT_ID } from "@elysian/persistence"
import { errorCodes } from "../../errors/registry"
import {
  createCustomerModule,
  createInMemoryCustomerRepository,
  createInMemoryWorkflowDefinitionRepository,
  createWorkflowModule,
} from "../../modules"
import {
  createWorkflowDefinitionSeedRecords,
  workflowDefinitionPermissionCodes,
} from "../workflow/test-support"
import {
  createAuthTestFixture,
  createTestApp,
  loginWithCredentials,
  testAdminPassword,
  testInvalidPassword,
  toCookieHeader,
} from "./test-support"

describe("createServerApp auth audit and security", () => {
  it("writes audit logs for login, refresh, logout, and permission denial", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:user:list"],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createCustomerModule(createInMemoryCustomerRepository(), {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await loginWithCredentials(
      app,
      {
        username: "admin",
        password: testAdminPassword,
      },
      {
        "user-agent": "audit-test-agent",
        "x-forwarded-for": "127.0.0.9",
        "x-request-id": "req-login-1",
      },
    )
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }
    const loginCookie = toCookieHeader(loginResponse.headers.get("set-cookie"))

    const refreshResponse = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: {
          cookie: loginCookie,
          "user-agent": "audit-test-agent",
          "x-forwarded-for": "127.0.0.10",
          "x-request-id": "req-refresh-1",
        },
      }),
    )

    expect(refreshResponse.status).toBe(200)

    const deniedResponse = await app.handle(
      new Request("http://localhost/customers", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "user-agent": "audit-test-agent",
          "x-forwarded-for": "127.0.0.11",
          "x-request-id": "req-authorize-1",
        },
      }),
    )

    expect(deniedResponse.status).toBe(403)

    const logoutResponse = await app.handle(
      new Request("http://localhost/auth/logout", {
        method: "POST",
        headers: {
          cookie: toCookieHeader(refreshResponse.headers.get("set-cookie")),
          "user-agent": "audit-test-agent",
          "x-forwarded-for": "127.0.0.12",
          "x-request-id": "req-logout-1",
        },
      }),
    )

    expect(logoutResponse.status).toBe(204)

    const auditLogs = await fixture.repository.listAuditLogs()

    expect(auditLogs.map((log) => [log.action, log.result])).toEqual([
      ["logout", "success"],
      ["authorize", "failure"],
      ["refresh", "success"],
      ["login", "success"],
    ])
    expect(auditLogs[0]).toMatchObject({
      category: "auth",
      targetType: "session",
      requestId: "req-logout-1",
      ip: "127.0.0.12",
      userAgent: "audit-test-agent",
    })
    expect(auditLogs[1]).toMatchObject({
      category: "auth",
      targetType: "permission",
      targetId: "customer:customer:list",
      requestId: "req-authorize-1",
      ip: "127.0.0.11",
      userAgent: "audit-test-agent",
      details: {
        reason: "permission_denied",
      },
    })
    expect(auditLogs[2]).toMatchObject({
      category: "auth",
      targetType: "session",
      requestId: "req-refresh-1",
      ip: "127.0.0.10",
      userAgent: "audit-test-agent",
      details: {
        previousSessionId: expect.any(String),
      },
    })
    expect(auditLogs[3]).toMatchObject({
      category: "auth",
      targetType: "session",
      requestId: "req-login-1",
      ip: "127.0.0.9",
      userAgent: "audit-test-agent",
    })
    expect(
      auditLogs.every(
        (log) =>
          typeof log.id === "string" &&
          typeof log.createdAt === "string" &&
          typeof log.actorUserId === "string",
      ),
    ).toBe(true)
  })

  it("writes audit logs for failed login attempts", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const response = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-request-id": "req-login-failure-1",
        },
        body: JSON.stringify({
          username: "admin",
          password: testInvalidPassword,
        }),
      }),
    )

    expect(response.status).toBe(401)

    const [auditLog] = await fixture.repository.listAuditLogs()

    expect(auditLog).toMatchObject({
      category: "auth",
      action: "login",
      result: "failure",
      requestId: "req-login-failure-1",
      details: {
        username: "admin",
        reason: "invalid_password",
      },
    })
  })

  it("locks repeated login failures and unlocks after the lock window expires", async () => {
    const fixture = await createAuthTestFixture({
      maxLoginFailures: 2,
      loginFailureWindowSeconds: 60,
      loginLockDurationSeconds: 1,
    })
    const app = createTestApp({
      modules: [fixture.authModule],
    })

    const firstFailureResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testInvalidPassword,
    })
    expect(firstFailureResponse.status).toBe(401)

    const secondFailureResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testInvalidPassword,
    })
    expect(secondFailureResponse.status).toBe(423)

    const secondFailureBody = (await secondFailureResponse.json()) as {
      code: number
      message: string
      status: number
      details: {
        username: string
        lockedUntil: string
      }
    }

    expect(secondFailureBody).toEqual({
      code: errorCodes.AUTH_LOGIN_LOCKED,
      message: "Login is temporarily locked",
      status: 423,
      details: {
        username: "admin",
        lockedUntil: expect.any(String),
      },
    })

    const lockedUser = await fixture.repository.getUserById(fixture.userId)
    expect(lockedUser).not.toBeNull()
    expect(lockedUser?.loginFailureCount).toBe(2)
    expect(lockedUser?.loginLockedUntil).toBe(
      secondFailureBody.details.lockedUntil,
    )

    const lockedSuccessResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testAdminPassword,
    })
    expect(lockedSuccessResponse.status).toBe(423)

    await new Promise((resolve) => setTimeout(resolve, 1100))

    const unlockedSuccessResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testAdminPassword,
    })
    expect(unlockedSuccessResponse.status).toBe(200)

    const unlockedUser = await fixture.repository.getUserById(fixture.userId)
    expect(unlockedUser).not.toBeNull()
    expect(unlockedUser?.loginFailureCount).toBe(0)
    expect(unlockedUser?.lastLoginFailedAt).toBeNull()
    expect(unlockedUser?.loginLockedUntil).toBeNull()
    expect(unlockedUser?.lastLoginAt).toEqual(expect.any(String))

    const auditLogs = await fixture.repository.listAuditLogs(fixture.userId)
    expect(
      auditLogs.some(
        (log) =>
          log.action === "login" &&
          log.result === "failure" &&
          log.details?.reason === "login_locked",
      ),
    ).toBe(true)
  })

  it("writes audit logs for workflow permission denial", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        ...workflowDefinitionPermissionCodes,
        "workflow:instance:list",
        "workflow:instance:start",
      ],
      isSuperAdmin: false,
    })
    const workflowRepository = createInMemoryWorkflowDefinitionRepository({
      definitions: createWorkflowDefinitionSeedRecords(),
      instances: [
        {
          tenantId: DEFAULT_TENANT_ID,
          id: "workflow_instance_audit_1",
          definitionId: "workflow_definition_expense_v1",
          definitionKey: "expense-approval",
          definitionName: "Expense Approval",
          definitionVersion: 1,
          status: "running",
          currentNodeId: "manager-review",
          variables: {},
          startedByUserId: fixture.userId,
          startedAt: "2026-04-21T02:10:00.000Z",
          completedAt: null,
          terminatedAt: null,
          createdAt: "2026-04-21T02:10:00.000Z",
          updatedAt: "2026-04-21T02:10:00.000Z",
        },
      ],
      tasks: [
        {
          tenantId: DEFAULT_TENANT_ID,
          id: "workflow_task_audit_1",
          instanceId: "workflow_instance_audit_1",
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {},
          createdAt: "2026-04-21T02:10:00.000Z",
          updatedAt: "2026-04-21T02:10:00.000Z",
          completedAt: null,
        },
      ],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "workflow-audit-agent",
          "x-forwarded-for": "127.0.1.1",
          "x-request-id": "req-workflow-login-1",
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

    const deniedTaskListResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "user-agent": "workflow-audit-agent",
          "x-forwarded-for": "127.0.1.2",
          "x-request-id": "req-workflow-task-list-denied",
        },
      }),
    )
    expect(deniedTaskListResponse.status).toBe(403)

    const deniedTaskCompleteResponse = await app.handle(
      new Request(
        "http://localhost/workflow/tasks/workflow_task_audit_1/complete",
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
            "content-type": "application/json",
            "user-agent": "workflow-audit-agent",
            "x-forwarded-for": "127.0.1.3",
            "x-request-id": "req-workflow-task-complete-denied",
          },
          body: JSON.stringify({
            result: "approved",
          }),
        },
      ),
    )
    expect(deniedTaskCompleteResponse.status).toBe(403)

    const deniedInstanceCancelResponse = await app.handle(
      new Request(
        "http://localhost/workflow/instances/workflow_instance_audit_1/cancel",
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
            "user-agent": "workflow-audit-agent",
            "x-forwarded-for": "127.0.1.4",
            "x-request-id": "req-workflow-instance-cancel-denied",
          },
        },
      ),
    )
    expect(deniedInstanceCancelResponse.status).toBe(403)

    const auditLogs = await fixture.repository.listAuditLogs()
    const authorizeFailures = auditLogs.filter(
      (log) => log.action === "authorize" && log.result === "failure",
    )

    expect(authorizeFailures).toHaveLength(3)
    expect(authorizeFailures[0]).toMatchObject({
      category: "auth",
      targetType: "permission",
      targetId: "workflow:instance:cancel",
      requestId: "req-workflow-instance-cancel-denied",
      ip: "127.0.1.4",
      userAgent: "workflow-audit-agent",
      details: {
        reason: "permission_denied",
      },
    })
    expect(authorizeFailures[1]).toMatchObject({
      category: "auth",
      targetType: "permission",
      targetId: "workflow:task:complete",
      requestId: "req-workflow-task-complete-denied",
      ip: "127.0.1.3",
      userAgent: "workflow-audit-agent",
      details: {
        reason: "permission_denied",
      },
    })
    expect(authorizeFailures[2]).toMatchObject({
      category: "auth",
      targetType: "permission",
      targetId: "workflow:task:list",
      requestId: "req-workflow-task-list-denied",
      ip: "127.0.1.2",
      userAgent: "workflow-audit-agent",
      details: {
        reason: "permission_denied",
      },
    })
  })
})
