import { describe, expect, it } from "bun:test"

import { DEFAULT_TENANT_ID } from "@elysian/persistence"
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
          category: "workflow",
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
    const startedInstance = (await startResponse.json()) as {
      id: string
      status: string
      currentTasks: Array<{ id: string }>
    }
    const taskId = startedInstance.currentTasks[0]?.id

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
    const secondStartedInstance = (await secondStartResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const secondTaskId = secondStartedInstance.currentTasks[0]?.id

    if (!secondTaskId) {
      throw new Error("Expected second workflow instance to create a todo task")
    }

    const cancelResponse = await cancelWorkflowInstance(
      app,
      accessToken,
      secondStartedInstance.id,
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
      targetId: secondStartedInstance.id,
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
      targetId: secondStartedInstance.id,
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
        instanceId: startedInstance.id,
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
        instanceId: startedInstance.id,
        status: "running",
      },
    })
    expect(workflowAuditLogs[4]).toMatchObject({
      category: "workflow",
      action: "workflow_instance_start",
      targetType: "workflow_instance",
      targetId: startedInstance.id,
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const todoResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(todoResponse.status).toBe(403)
    expect(await todoResponse.json()).toEqual({
      error: {
        code: "AUTH_PERMISSION_DENIED",
        message: "Permission denied",
        status: 403,
        details: {
          permissionCode: "workflow:task:list",
        },
      },
    })

    const doneResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/done", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(doneResponse.status).toBe(403)
    expect(await doneResponse.json()).toEqual({
      error: {
        code: "AUTH_PERMISSION_DENIED",
        message: "Permission denied",
        status: 403,
        details: {
          permissionCode: "workflow:task:list",
        },
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
    const privilegedLoginBody = (await privilegedLoginResponse.json()) as {
      accessToken: string
    }
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
    const restrictedLoginBody = (await restrictedLoginResponse.json()) as {
      accessToken: string
    }

    const startResponse = await privilegedApp.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${privilegedLoginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: "workflow_definition_expense_v1",
        }),
      }),
    )
    const startedInstance = (await startResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const taskId = startedInstance.currentTasks[0]?.id

    if (!taskId) {
      throw new Error("Expected workflow instance to create a todo task")
    }

    const claimResponse = await restrictedApp.handle(
      new Request(`http://localhost/workflow/tasks/${taskId}/claim`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${restrictedLoginBody.accessToken}`,
        },
      }),
    )

    expect(claimResponse.status).toBe(403)
    expect(await claimResponse.json()).toEqual({
      error: {
        code: "AUTH_PERMISSION_DENIED",
        message: "Permission denied",
        status: 403,
        details: {
          permissionCode: "workflow:task:claim",
        },
      },
    })

    const completeResponse = await restrictedApp.handle(
      new Request(`http://localhost/workflow/tasks/${taskId}/complete`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${restrictedLoginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "approved",
        }),
      }),
    )

    expect(completeResponse.status).toBe(403)
    expect(await completeResponse.json()).toEqual({
      error: {
        code: "AUTH_PERMISSION_DENIED",
        message: "Permission denied",
        status: 403,
        details: {
          permissionCode: "workflow:task:complete",
        },
      },
    })

    const cancelResponse = await restrictedApp.handle(
      new Request(
        `http://localhost/workflow/instances/${startedInstance.id}/cancel`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${restrictedLoginBody.accessToken}`,
          },
        },
      ),
    )

    expect(cancelResponse.status).toBe(403)
    expect(await cancelResponse.json()).toEqual({
      error: {
        code: "AUTH_PERMISSION_DENIED",
        message: "Permission denied",
        status: 403,
        details: {
          permissionCode: "workflow:instance:cancel",
        },
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
    const defaultLoginBody = (await defaultLoginResponse.json()) as {
      accessToken: string
    }
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
    const tenantAlphaLoginBody = (await tenantAlphaLoginResponse.json()) as {
      accessToken: string
    }

    const defaultStartResponse = await defaultApp.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${defaultLoginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: "workflow_definition_expense_v1",
        }),
      }),
    )
    expect(defaultStartResponse.status).toBe(201)
    const defaultInstance = (await defaultStartResponse.json()) as {
      id: string
    }

    const tenantAlphaStartResponse = await tenantAlphaApp.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${tenantAlphaLoginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: "workflow_definition_expense_v1",
        }),
      }),
    )
    expect(tenantAlphaStartResponse.status).toBe(201)
    const tenantAlphaInstance = (await tenantAlphaStartResponse.json()) as {
      id: string
    }

    const defaultListResponse = await defaultApp.handle(
      new Request("http://localhost/workflow/instances", {
        headers: {
          authorization: `Bearer ${defaultLoginBody.accessToken}`,
        },
      }),
    )

    expect(defaultListResponse.status).toBe(200)
    expect(await defaultListResponse.json()).toEqual({
      items: [
        {
          id: defaultInstance.id,
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
          authorization: `Bearer ${tenantAlphaLoginBody.accessToken}`,
        },
      }),
    )

    expect(tenantAlphaListResponse.status).toBe(200)
    expect(await tenantAlphaListResponse.json()).toEqual({
      items: [
        {
          id: tenantAlphaInstance.id,
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
        `http://localhost/workflow/instances/${tenantAlphaInstance.id}`,
        {
          headers: {
            authorization: `Bearer ${defaultLoginBody.accessToken}`,
          },
        },
      ),
    )

    expect(crossTenantGetResponse.status).toBe(404)
    expect(await crossTenantGetResponse.json()).toEqual({
      error: {
        code: "WORKFLOW_INSTANCE_NOT_FOUND",
        message: "Workflow instance not found",
        status: 404,
        details: {
          id: tenantAlphaInstance.id,
        },
      },
    })

    const defaultTodoResponse = await defaultApp.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${defaultLoginBody.accessToken}`,
        },
      }),
    )

    expect(defaultTodoResponse.status).toBe(200)
    expect(await defaultTodoResponse.json()).toEqual({
      items: [
        {
          id: expect.any(String),
          instanceId: defaultInstance.id,
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
