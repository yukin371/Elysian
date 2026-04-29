import { describe, expect, it } from "bun:test"

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

describe("createServerApp workflow runtime instances", () => {
  it("starts workflow instances and lists todo tasks", async () => {
    const { app, accessToken, fixture } = await createWorkflowTestHarness()

    const startResponse = await startWorkflowInstance(app, accessToken, {
      definitionId: "workflow_definition_expense_v1",
      variables: {
        amount: 1200,
      },
    })

    expect(startResponse.status).toBe(201)
    const startedInstance = (await startResponse.json()) as {
      id: string
      definitionId: string
      status: string
      currentNodeId: string | null
      variables: Record<string, unknown>
      currentTasks: Array<{
        id: string
        instanceId: string
        definitionId: string
        assignee: string
        nodeId: string
        nodeName: string
        status: string
        result: string | null
        variables: Record<string, unknown>
        createdAt: string
        updatedAt: string
        completedAt: string | null
      }>
      tasks: Array<{
        id: string
        instanceId: string
        definitionId: string
        assignee: string
        nodeId: string
        nodeName: string
        status: string
        result: string | null
        variables: Record<string, unknown>
        createdAt: string
        updatedAt: string
        completedAt: string | null
      }>
    }
    expect(startedInstance.id).toEqual(expect.any(String))
    expect(startedInstance.definitionId).toBe("workflow_definition_expense_v1")
    expect(startedInstance.status).toBe("running")
    expect(startedInstance.currentNodeId).toBe("manager-review")
    expect(startedInstance.variables).toEqual({
      amount: 1200,
    })
    expect(startedInstance.currentTasks).toEqual([
      {
        id: expect.any(String),
        instanceId: startedInstance.id,
        definitionId: "workflow_definition_expense_v1",
        assignee: "role:manager",
        nodeId: "manager-review",
        nodeName: "Manager Review",
        status: "todo",
        result: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        completedAt: null,
        variables: {
          amount: 1200,
        },
      },
    ])
    expect(startedInstance.tasks).toEqual(startedInstance.currentTasks)
    const currentTaskId = startedInstance.currentTasks[0]?.id

    if (!currentTaskId) {
      throw new Error("Expected workflow instance to create a todo task")
    }

    const listInstancesResponse = await app.handle(
      new Request("http://localhost/workflow/instances", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listInstancesResponse.status).toBe(200)
    expect(await listInstancesResponse.json()).toEqual({
      items: [
        {
          id: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          definitionKey: "expense-approval",
          definitionName: "Expense Approval",
          definitionVersion: 1,
          status: "running",
          currentNodeId: "manager-review",
          variables: {
            amount: 1200,
          },
          startedByUserId: fixture.userId,
          startedAt: expect.any(String),
          completedAt: null,
          terminatedAt: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ],
    })

    const getInstanceResponse = await app.handle(
      new Request(`http://localhost/workflow/instances/${startedInstance.id}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getInstanceResponse.status).toBe(200)
    expect(await getInstanceResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_v1",
      definitionKey: "expense-approval",
      definitionName: "Expense Approval",
      definitionVersion: 1,
      status: "running",
      currentNodeId: "manager-review",
      variables: {
        amount: 1200,
      },
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [
        {
          id: currentTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {
            amount: 1200,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
      tasks: [
        {
          id: currentTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {
            amount: 1200,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })

    const listTodoResponse = await app.handle(
      new Request(
        "http://localhost/workflow/tasks/todo?assignee=role:manager",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(listTodoResponse.status).toBe(200)
    expect(await listTodoResponse.json()).toEqual({
      items: [
        {
          id: currentTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {
            amount: 1200,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })
  })

  it("completes workflow tasks and exposes done history", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
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

    const startResponse = await app.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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

    const completeResponse = await app.handle(
      new Request(`http://localhost/workflow/tasks/${taskId}/complete`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "approved",
        }),
      }),
    )

    expect(completeResponse.status).toBe(200)
    expect(await completeResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_v1",
      definitionKey: "expense-approval",
      definitionName: "Expense Approval",
      definitionVersion: 1,
      status: "completed",
      currentNodeId: "approved",
      variables: {},
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: expect.any(String),
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [],
      tasks: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "completed",
          result: "approved",
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })

    const doneResponse = await app.handle(
      new Request(
        "http://localhost/workflow/tasks/done?assignee=role:manager",
        {
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
          },
        },
      ),
    )

    expect(doneResponse.status).toBe(200)
    expect(await doneResponse.json()).toEqual({
      items: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "completed",
          result: "approved",
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })

    const todoResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(todoResponse.status).toBe(200)
    expect(await todoResponse.json()).toEqual({
      items: [],
    })
  })

  it("claims workflow tasks for the current user and restricts completion to the claimer", async () => {
    const claimerFixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
      isSuperAdmin: false,
    })
    const peerFixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
      isSuperAdmin: false,
    })
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createClaimableWorkflowDefinitionSeedRecords(),
    )
    const claimerApp = createTestApp({
      modules: [
        claimerFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: claimerFixture.authGuard,
        }),
      ],
    })
    const peerApp = createTestApp({
      modules: [
        peerFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: peerFixture.authGuard,
        }),
      ],
    })

    const claimerAccessToken = await loginAsAdmin(claimerApp)
    const peerAccessToken = await loginAsAdmin(peerApp)

    const startResponse = await startWorkflowInstance(
      claimerApp,
      claimerAccessToken,
      {
        definitionId: "workflow_definition_claimable_v1",
      },
    )
    const startedInstance = (await startResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const taskId = startedInstance.currentTasks[0]?.id

    if (!taskId) {
      throw new Error("Expected workflow instance to create a claimable task")
    }

    const claimResponse = await claimWorkflowTask(
      claimerApp,
      claimerAccessToken,
      taskId,
    )

    expect(claimResponse.status).toBe(200)
    expect(await claimResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_claimable_v1",
      definitionKey: "expense-approval-claimable",
      definitionName: "Expense Approval Claimable",
      definitionVersion: 1,
      status: "running",
      currentNodeId: "admin-review",
      variables: {},
      startedByUserId: claimerFixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_claimable_v1",
          nodeId: "admin-review",
          nodeName: "Admin Review",
          assignee: `user:${claimerFixture.userId}`,
          claimSourceAssignee: "role:admin",
          claimedByUserId: claimerFixture.userId,
          claimedAt: expect.any(String),
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
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_claimable_v1",
          nodeId: "admin-review",
          nodeName: "Admin Review",
          assignee: `user:${claimerFixture.userId}`,
          claimSourceAssignee: "role:admin",
          claimedByUserId: claimerFixture.userId,
          claimedAt: expect.any(String),
          status: "todo",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })

    const claimedTodoResponse = await claimerApp.handle(
      new Request(
        `http://localhost/workflow/tasks/todo?assignee=user:${claimerFixture.userId}`,
        {
          headers: {
            authorization: `Bearer ${claimerAccessToken}`,
          },
        },
      ),
    )

    expect(claimedTodoResponse.status).toBe(200)
    expect(await claimedTodoResponse.json()).toEqual({
      items: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_claimable_v1",
          nodeId: "admin-review",
          nodeName: "Admin Review",
          assignee: `user:${claimerFixture.userId}`,
          claimSourceAssignee: "role:admin",
          claimedByUserId: claimerFixture.userId,
          claimedAt: expect.any(String),
          status: "todo",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })

    const peerCompleteResponse = await completeWorkflowTask(
      peerApp,
      peerAccessToken,
      taskId,
      "approved",
    )

    expect(peerCompleteResponse.status).toBe(403)
    expect(await peerCompleteResponse.json()).toEqual({
      error: {
        code: "WORKFLOW_TASK_ASSIGNEE_MISMATCH",
        message: "Workflow task is assigned to another user",
        status: 403,
        details: {
          id: taskId,
          assignee: `user:${claimerFixture.userId}`,
        },
      },
    })

    const completeResponse = await completeWorkflowTask(
      claimerApp,
      claimerAccessToken,
      taskId,
      "approved",
    )

    expect(completeResponse.status).toBe(200)
    expect(await completeResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_claimable_v1",
      definitionKey: "expense-approval-claimable",
      definitionName: "Expense Approval Claimable",
      definitionVersion: 1,
      status: "completed",
      currentNodeId: "approved",
      variables: {},
      startedByUserId: claimerFixture.userId,
      startedAt: expect.any(String),
      completedAt: expect.any(String),
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [],
      tasks: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_claimable_v1",
          nodeId: "admin-review",
          nodeName: "Admin Review",
          assignee: `user:${claimerFixture.userId}`,
          claimSourceAssignee: "role:admin",
          claimedByUserId: claimerFixture.userId,
          claimedAt: expect.any(String),
          status: "completed",
          result: "approved",
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })
  })
})
