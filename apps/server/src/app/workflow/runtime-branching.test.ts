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

describe("createServerApp workflow runtime branching", () => {
  it("routes workflow instances through the conditional approval branch", async () => {
    const { app, accessToken, fixture } = await createWorkflowTestHarness({
      definitions: createConditionalWorkflowDefinitionSeedRecords(),
    })

    const startResponse = await startWorkflowInstance(app, accessToken, {
      definitionId: "workflow_definition_expense_condition_v1",
      variables: {
        amount: 6800,
      },
    })
    const startedInstance = (await startResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const managerTaskId = startedInstance.currentTasks[0]?.id

    if (!managerTaskId) {
      throw new Error(
        "Expected workflow instance to create a manager todo task",
      )
    }

    const managerCompleteResponse = await completeWorkflowTask(
      app,
      accessToken,
      managerTaskId,
      "approved",
    )

    expect(managerCompleteResponse.status).toBe(200)
    expect(await managerCompleteResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_condition_v1",
      definitionKey: "expense-approval-condition",
      definitionName: "Expense Approval Condition",
      definitionVersion: 1,
      status: "running",
      currentNodeId: "finance-review",
      variables: {
        amount: 6800,
      },
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [
        {
          id: expect.any(String),
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "finance-review",
          nodeName: "Finance Review",
          assignee: "role:finance",
          status: "todo",
          result: null,
          variables: {
            amount: 6800,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
      tasks: [
        {
          id: managerTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "completed",
          result: "approved",
          variables: {
            amount: 6800,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
        {
          id: expect.any(String),
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "finance-review",
          nodeName: "Finance Review",
          assignee: "role:finance",
          status: "todo",
          result: null,
          variables: {
            amount: 6800,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })

    const financeTodoResponse = await app.handle(
      new Request(
        "http://localhost/workflow/tasks/todo?assignee=role:finance",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )
    const financeTodoBody = (await financeTodoResponse.json()) as {
      items: Array<{ id: string }>
    }
    const financeTaskId = financeTodoBody.items[0]?.id

    if (!financeTaskId) {
      throw new Error(
        "Expected workflow instance to create a finance todo task",
      )
    }

    const financeCompleteResponse = await completeWorkflowTask(
      app,
      accessToken,
      financeTaskId,
      "approved",
    )

    expect(financeCompleteResponse.status).toBe(200)
    expect(await financeCompleteResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_condition_v1",
      definitionKey: "expense-approval-condition",
      definitionName: "Expense Approval Condition",
      definitionVersion: 1,
      status: "completed",
      currentNodeId: "approved",
      variables: {
        amount: 6800,
      },
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: expect.any(String),
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [],
      tasks: [
        {
          id: managerTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "completed",
          result: "approved",
          variables: {
            amount: 6800,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
        {
          id: financeTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "finance-review",
          nodeName: "Finance Review",
          assignee: "role:finance",
          status: "completed",
          result: "approved",
          variables: {
            amount: 6800,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })
  })

  it("uses the default condition branch when no condition matches", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
      isSuperAdmin: false,
    })
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createConditionalWorkflowDefinitionSeedRecords(),
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
          definitionId: "workflow_definition_expense_condition_v1",
          variables: {
            amount: 1200,
          },
        }),
      }),
    )
    const startedInstance = (await startResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const managerTaskId = startedInstance.currentTasks[0]?.id

    if (!managerTaskId) {
      throw new Error(
        "Expected workflow instance to create a manager todo task",
      )
    }

    const completeResponse = await app.handle(
      new Request(`http://localhost/workflow/tasks/${managerTaskId}/complete`, {
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
      definitionId: "workflow_definition_expense_condition_v1",
      definitionKey: "expense-approval-condition",
      definitionName: "Expense Approval Condition",
      definitionVersion: 1,
      status: "completed",
      currentNodeId: "approved",
      variables: {
        amount: 1200,
      },
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: expect.any(String),
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [],
      tasks: [
        {
          id: managerTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "completed",
          result: "approved",
          variables: {
            amount: 1200,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })
  })

  it("rejects workflow tasks and terminates instances", async () => {
    const { app, accessToken, fixture } = await createWorkflowTestHarness()

    const startResponse = await startWorkflowInstance(app, accessToken, {
      definitionId: "workflow_definition_expense_v1",
      variables: {
        reason: "budget-exceeded",
      },
    })
    const startedInstance = (await startResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const taskId = startedInstance.currentTasks[0]?.id

    if (!taskId) {
      throw new Error("Expected workflow instance to create a todo task")
    }

    const rejectResponse = await completeWorkflowTask(
      app,
      accessToken,
      taskId,
      "rejected",
    )

    expect(rejectResponse.status).toBe(200)
    expect(await rejectResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_v1",
      definitionKey: "expense-approval",
      definitionName: "Expense Approval",
      definitionVersion: 1,
      status: "terminated",
      currentNodeId: null,
      variables: {
        reason: "budget-exceeded",
      },
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: expect.any(String),
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
          result: "rejected",
          variables: {
            reason: "budget-exceeded",
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })
  })

  it("cancels workflow instances and clears todo tasks", async () => {
    const { app, accessToken, fixture } = await createWorkflowTestHarness()

    const startResponse = await startWorkflowInstance(app, accessToken, {
      definitionId: "workflow_definition_expense_v1",
    })
    const startedInstance = (await startResponse.json()) as { id: string }

    const cancelResponse = await cancelWorkflowInstance(
      app,
      accessToken,
      startedInstance.id,
    )

    expect(cancelResponse.status).toBe(200)
    expect(await cancelResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_v1",
      definitionKey: "expense-approval",
      definitionName: "Expense Approval",
      definitionVersion: 1,
      status: "terminated",
      currentNodeId: null,
      variables: {},
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [],
      tasks: [
        {
          id: expect.any(String),
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "cancelled",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })

    const todoResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(todoResponse.status).toBe(200)
    expect(await todoResponse.json()).toEqual({
      items: [],
    })
  })
})
