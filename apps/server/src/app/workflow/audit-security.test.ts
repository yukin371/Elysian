import { describe, expect, it } from "bun:test"

import { DEFAULT_TENANT_ID } from "@elysian/persistence"
import { errorCodes } from "../../errors/registry"
import {
  createAuthGuard,
  createAuthModule,
  createInMemoryAuthRepository,
  createInMemoryOperationLogRepository,
  createInMemoryWorkflowDefinitionRepository,
  createOperationLogModule,
  createPasswordHash,
  createWorkflowModule,
  verifyAccessToken,
} from "../../modules"
import type { WorkflowModuleOptions } from "../../modules/workflow"
import {
  cancelWorkflowInstance,
  claimWorkflowTask,
  completeWorkflowTask,
  createAuthTestFixture,
  createAuthorizedHeaders,
  createClaimableWorkflowDefinitionSeedRecords,
  createConditionalWorkflowDefinitionSeedRecords,
  createTestApp,
  createWorkflowDefinitionSeedRecords,
  createWorkflowTestHarness,
  loginAsAdmin,
  startWorkflowInstance,
  testAccessTokenSecret,
  testAdminPassword,
  workflowAllPermissionCodes,
  workflowDefinitionPermissionCodes,
  workflowRuntimePermissionCodes,
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

const readRecordArray = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (!Array.isArray(property) || !property.every((item) => isRecord(item))) {
    throw new Error(`Expected object array field: ${key}`)
  }

  return property
}

describe("createServerApp workflow audit and security", () => {
  it("writes audit logs for workflow runtime actions", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
      isSuperAdmin: true,
    })
    const { app, accessToken } = await createWorkflowTestHarness({
      fixture,
      isSuperAdmin: true,
      auditLogWriter: (
        input: Parameters<
          NonNullable<WorkflowModuleOptions["auditLogWriter"]>
        >[0],
      ) =>
        fixture.repository.createAuditLog({
          ...input,
        }),
    })

    const startResponse = await startWorkflowInstance(
      app,
      accessToken,
      {
        definitionId: "workflow_definition_expense_v1",
      },
      {
        "user-agent": "workflow-runtime-audit-agent",
        "x-forwarded-for": "127.0.2.1",
        "x-request-id": "req-workflow-start-audit-1",
      },
    )
    const startedInstance = await readJsonRecord(startResponse)
    const startedInstanceId = readString(startedInstance, "id")
    const startedCurrentTasks = readRecordArray(startedInstance, "currentTasks")
    const taskId = startedCurrentTasks[0]
      ? readString(startedCurrentTasks[0], "id")
      : undefined

    if (!taskId) {
      throw new Error("Expected workflow instance to create a todo task")
    }

    const claimResponse = await claimWorkflowTask(app, accessToken, taskId, {
      "user-agent": "workflow-runtime-audit-agent",
      "x-forwarded-for": "127.0.2.2",
      "x-request-id": "req-workflow-claim-audit-1",
    })
    expect(claimResponse.status).toBe(200)

    const completeResponse = await completeWorkflowTask(
      app,
      accessToken,
      taskId,
      "approved",
      {
        "user-agent": "workflow-runtime-audit-agent",
        "x-forwarded-for": "127.0.2.3",
        "x-request-id": "req-workflow-complete-audit-1",
      },
    )
    expect(completeResponse.status).toBe(200)

    const secondStartResponse = await startWorkflowInstance(
      app,
      accessToken,
      {
        definitionId: "workflow_definition_expense_v1",
      },
      {
        "user-agent": "workflow-runtime-audit-agent",
        "x-forwarded-for": "127.0.2.4",
        "x-request-id": "req-workflow-start-audit-2",
      },
    )
    const secondStartedInstance = await readJsonRecord(secondStartResponse)
    const secondStartedInstanceId = readString(secondStartedInstance, "id")
    const secondCurrentTasks = readRecordArray(
      secondStartedInstance,
      "currentTasks",
    )
    const secondTaskId = secondCurrentTasks[0]
      ? readString(secondCurrentTasks[0], "id")
      : undefined

    if (!secondTaskId) {
      throw new Error("Expected second workflow instance to create a todo task")
    }

    const cancelResponse = await cancelWorkflowInstance(
      app,
      accessToken,
      secondStartedInstanceId,
      {
        "user-agent": "workflow-runtime-audit-agent",
        "x-forwarded-for": "127.0.2.5",
        "x-request-id": "req-workflow-cancel-audit-1",
      },
    )
    expect(cancelResponse.status).toBe(200)

    const workflowAuditLogs = (await fixture.repository.listAuditLogs()).filter(
      (log) => log.category === "workflow",
    )

    expect(workflowAuditLogs).toHaveLength(5)
    expect(workflowAuditLogs[0]).toMatchObject({
      category: "workflow",
      action: "workflow_instance_cancel",
      targetType: "workflow_instance",
      targetId: secondStartedInstanceId,
      actorUserId: fixture.userId,
      requestId: "req-workflow-cancel-audit-1",
      ip: "127.0.2.5",
      userAgent: "workflow-runtime-audit-agent",
      result: "success",
      details: {
        cancelledTasks: [
          {
            id: secondTaskId,
            assignee: "role:manager",
            claimSourceAssignee: null,
            claimedByUserId: null,
            claimedAt: null,
          },
        ],
        status: "terminated",
        currentNodeId: null,
      },
    })
    expect(workflowAuditLogs[1]).toMatchObject({
      category: "workflow",
      action: "workflow_instance_start",
      targetType: "workflow_instance",
      targetId: secondStartedInstanceId,
      actorUserId: fixture.userId,
      requestId: "req-workflow-start-audit-2",
      ip: "127.0.2.4",
      userAgent: "workflow-runtime-audit-agent",
      result: "success",
      details: {
        definitionId: "workflow_definition_expense_v1",
        status: "running",
      },
    })
    expect(workflowAuditLogs[2]).toMatchObject({
      category: "workflow",
      action: "workflow_task_complete",
      targetType: "workflow_task",
      targetId: taskId,
      actorUserId: fixture.userId,
      requestId: "req-workflow-complete-audit-1",
      ip: "127.0.2.3",
      userAgent: "workflow-runtime-audit-agent",
      result: "success",
      details: {
        assignee: `user:${fixture.userId}`,
        claimSourceAssignee: "role:manager",
        claimedByUserId: fixture.userId,
        claimedAt: expect.any(String),
        instanceId: startedInstanceId,
        result: "approved",
        status: "completed",
      },
    })
    expect(workflowAuditLogs[3]).toMatchObject({
      category: "workflow",
      action: "workflow_task_claim",
      targetType: "workflow_task",
      targetId: taskId,
      actorUserId: fixture.userId,
      requestId: "req-workflow-claim-audit-1",
      ip: "127.0.2.2",
      userAgent: "workflow-runtime-audit-agent",
      result: "success",
      details: {
        assignee: `user:${fixture.userId}`,
        claimSourceAssignee: "role:manager",
        claimedByUserId: fixture.userId,
        claimedAt: expect.any(String),
        instanceId: startedInstanceId,
        status: "running",
      },
    })
    expect(workflowAuditLogs[4]).toMatchObject({
      category: "workflow",
      action: "workflow_instance_start",
      targetType: "workflow_instance",
      targetId: startedInstanceId,
      actorUserId: fixture.userId,
      requestId: "req-workflow-start-audit-1",
      ip: "127.0.2.1",
      userAgent: "workflow-runtime-audit-agent",
      result: "success",
      details: {
        definitionId: "workflow_definition_expense_v1",
        status: "running",
      },
    })
  })

  it("keeps workflow runtime actions successful when audit log writing fails", async () => {
    const { app, accessToken, fixture } = await createWorkflowTestHarness({
      auditLogWriter: async () => {
        throw new Error("audit sink unavailable")
      },
    })

    const startResponse = await startWorkflowInstance(
      app,
      accessToken,
      {
        definitionId: "workflow_definition_expense_v1",
      },
      {
        "x-request-id": "req-workflow-audit-failure-start-1",
      },
    )

    expect(startResponse.status).toBe(201)
    expect(await startResponse.json()).toEqual({
      id: expect.any(String),
      definitionId: "workflow_definition_expense_v1",
      definitionKey: "expense-approval",
      definitionName: "Expense Approval",
      definitionVersion: 1,
      status: "running",
      currentNodeId: "manager-review",
      variables: {},
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [
        {
          id: expect.any(String),
          instanceId: expect.any(String),
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
      tasks: [
        {
          id: expect.any(String),
          instanceId: expect.any(String),
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })
  })

  it("returns 403 for workflow task list endpoints without workflow list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        ...workflowDefinitionPermissionCodes,
        "workflow:instance:list",
        "workflow:instance:start",
        "workflow:instance:cancel",
        "workflow:task:complete",
      ],
      isSuperAdmin: false,
    })
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createWorkflowDefinitionSeedRecords(),
    )
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
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const loginBody = await readJsonRecord(loginResponse)
    const accessToken = readString(loginBody, "accessToken")

    const todoResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(todoResponse.status).toBe(403)
    expect(await todoResponse.json()).toEqual({
      code: errorCodes.AUTH_PERMISSION_DENIED,
      message: "Permission denied",
      status: 403,
      details: {
        permissionCode: "workflow:task:list",
      },
    })

    const doneResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/done", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(doneResponse.status).toBe(403)
    expect(await doneResponse.json()).toEqual({
      code: errorCodes.AUTH_PERMISSION_DENIED,
      message: "Permission denied",
      status: 403,
      details: {
        permissionCode: "workflow:task:list",
      },
    })
  })

  it("returns 403 for workflow task claim, completion, and instance cancel without workflow update permission", async () => {
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createWorkflowDefinitionSeedRecords(),
    )
    const privilegedFixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
      isSuperAdmin: false,
    })
    const restrictedFixture = await createAuthTestFixture({
      permissions: [
        ...workflowDefinitionPermissionCodes,
        "workflow:instance:list",
        "workflow:instance:start",
        "workflow:task:list",
      ],
      isSuperAdmin: false,
    })
    const privilegedApp = createTestApp({
      modules: [
        privilegedFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: privilegedFixture.authGuard,
        }),
      ],
    })
    const restrictedApp = createTestApp({
      modules: [
        restrictedFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: restrictedFixture.authGuard,
        }),
      ],
    })

    const privilegedLoginResponse = await privilegedApp.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const privilegedLoginBody = await readJsonRecord(privilegedLoginResponse)
    const privilegedAccessToken = readString(privilegedLoginBody, "accessToken")
    const restrictedLoginResponse = await restrictedApp.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const restrictedLoginBody = await readJsonRecord(restrictedLoginResponse)
    const restrictedAccessToken = readString(restrictedLoginBody, "accessToken")

    const startResponse = await privilegedApp.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${privilegedAccessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: "workflow_definition_expense_v1",
        }),
      }),
    )
    const startedInstance = await readJsonRecord(startResponse)
    const startedInstanceId = readString(startedInstance, "id")
    const startedCurrentTasks = readRecordArray(startedInstance, "currentTasks")
    const taskId = startedCurrentTasks[0]
      ? readString(startedCurrentTasks[0], "id")
      : undefined

    if (!taskId) {
      throw new Error("Expected workflow instance to create a todo task")
    }

    const claimResponse = await restrictedApp.handle(
      new Request(`http://localhost/workflow/tasks/${taskId}/claim`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${restrictedAccessToken}`,
        },
      }),
    )

    expect(claimResponse.status).toBe(403)
    expect(await claimResponse.json()).toEqual({
      code: errorCodes.AUTH_PERMISSION_DENIED,
      message: "Permission denied",
      status: 403,
      details: {
        permissionCode: "workflow:task:claim",
      },
    })

    const completeResponse = await restrictedApp.handle(
      new Request(`http://localhost/workflow/tasks/${taskId}/complete`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${restrictedAccessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "approved",
        }),
      }),
    )

    expect(completeResponse.status).toBe(403)
    expect(await completeResponse.json()).toEqual({
      code: errorCodes.AUTH_PERMISSION_DENIED,
      message: "Permission denied",
      status: 403,
      details: {
        permissionCode: "workflow:task:complete",
      },
    })

    const cancelResponse = await restrictedApp.handle(
      new Request(
        `http://localhost/workflow/instances/${startedInstanceId}/cancel`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${restrictedAccessToken}`,
          },
        },
      ),
    )

    expect(cancelResponse.status).toBe(403)
    expect(await cancelResponse.json()).toEqual({
      code: errorCodes.AUTH_PERMISSION_DENIED,
      message: "Permission denied",
      status: 403,
      details: {
        permissionCode: "workflow:instance:cancel",
      },
    })
  })

  it("isolates workflow instances and todo tasks by tenant", async () => {
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createWorkflowDefinitionSeedRecords(),
    )
    const defaultFixture = await createAuthTestFixture({
      permissions: [
        "workflow:instance:list",
        "workflow:instance:start",
        "workflow:task:list",
      ],
      isSuperAdmin: false,
      tenantId: DEFAULT_TENANT_ID,
    })
    const tenantAlphaId = "11111111-1111-4111-8111-111111111111"
    const tenantAlphaFixture = await createAuthTestFixture({
      permissions: [
        "workflow:instance:list",
        "workflow:instance:start",
        "workflow:task:list",
      ],
      isSuperAdmin: false,
      tenantId: tenantAlphaId,
    })
    const defaultApp = createTestApp({
      modules: [
        defaultFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: defaultFixture.authGuard,
        }),
      ],
    })
    const tenantAlphaApp = createTestApp({
      modules: [
        tenantAlphaFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: tenantAlphaFixture.authGuard,
        }),
      ],
    })

    const defaultLoginResponse = await defaultApp.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const defaultLoginBody = await readJsonRecord(defaultLoginResponse)
    const defaultAccessToken = readString(defaultLoginBody, "accessToken")
    const tenantAlphaLoginResponse = await tenantAlphaApp.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const tenantAlphaLoginBody = await readJsonRecord(tenantAlphaLoginResponse)
    const tenantAlphaAccessToken = readString(
      tenantAlphaLoginBody,
      "accessToken",
    )

    const defaultStartResponse = await defaultApp.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${defaultAccessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: "workflow_definition_expense_v1",
        }),
      }),
    )
    expect(defaultStartResponse.status).toBe(201)
    const defaultInstance = await readJsonRecord(defaultStartResponse)
    const defaultInstanceId = readString(defaultInstance, "id")

    const tenantAlphaStartResponse = await tenantAlphaApp.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${tenantAlphaAccessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: "workflow_definition_expense_v1",
        }),
      }),
    )
    expect(tenantAlphaStartResponse.status).toBe(201)
    const tenantAlphaInstance = await readJsonRecord(tenantAlphaStartResponse)
    const tenantAlphaInstanceId = readString(tenantAlphaInstance, "id")

    const defaultListResponse = await defaultApp.handle(
      new Request("http://localhost/workflow/instances", {
        headers: {
          authorization: `Bearer ${defaultAccessToken}`,
        },
      }),
    )

    expect(defaultListResponse.status).toBe(200)
    expect(await defaultListResponse.json()).toEqual({
      items: [
        {
          id: defaultInstanceId,
          definitionId: "workflow_definition_expense_v1",
          definitionKey: "expense-approval",
          definitionName: "Expense Approval",
          definitionVersion: 1,
          status: "running",
          currentNodeId: "manager-review",
          variables: {},
          startedByUserId: defaultFixture.userId,
          startedAt: expect.any(String),
          completedAt: null,
          terminatedAt: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ],
    })

    const tenantAlphaListResponse = await tenantAlphaApp.handle(
      new Request("http://localhost/workflow/instances", {
        headers: {
          authorization: `Bearer ${tenantAlphaAccessToken}`,
        },
      }),
    )

    expect(tenantAlphaListResponse.status).toBe(200)
    expect(await tenantAlphaListResponse.json()).toEqual({
      items: [
        {
          id: tenantAlphaInstanceId,
          definitionId: "workflow_definition_expense_v1",
          definitionKey: "expense-approval",
          definitionName: "Expense Approval",
          definitionVersion: 1,
          status: "running",
          currentNodeId: "manager-review",
          variables: {},
          startedByUserId: tenantAlphaFixture.userId,
          startedAt: expect.any(String),
          completedAt: null,
          terminatedAt: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ],
    })

    const crossTenantGetResponse = await defaultApp.handle(
      new Request(
        `http://localhost/workflow/instances/${tenantAlphaInstanceId}`,
        {
          headers: {
            authorization: `Bearer ${defaultAccessToken}`,
          },
        },
      ),
    )

    expect(crossTenantGetResponse.status).toBe(404)
    expect(await crossTenantGetResponse.json()).toEqual({
      code: errorCodes.WORKFLOW_INSTANCE_NOT_FOUND,
      message: "Workflow instance not found",
      status: 404,
      details: {
        id: tenantAlphaInstanceId,
      },
    })

    const defaultTodoResponse = await defaultApp.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${defaultAccessToken}`,
        },
      }),
    )

    expect(defaultTodoResponse.status).toBe(200)
    expect(await defaultTodoResponse.json()).toEqual({
      items: [
        {
          id: expect.any(String),
          instanceId: defaultInstanceId,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })
  })
})
