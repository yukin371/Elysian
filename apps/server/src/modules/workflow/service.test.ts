import { describe, expect, it } from "bun:test"

import type { WorkflowDefinitionDraft } from "@elysian/schema"
import { errorCodes } from "../../errors/registry"

import { createInMemoryWorkflowRepository } from "./repository"
import { createWorkflowService } from "./service"

const tenantId = "tenant_default_1"
const startedByUserId = "user_admin_1"

const linearApprovalDefinition: WorkflowDefinitionDraft = {
  nodes: [
    { id: "start", type: "start", name: "Start" },
    {
      id: "managerApproval",
      type: "approval",
      name: "Manager Approval",
      assignee: "role:manager",
    },
    {
      id: "financeApproval",
      type: "approval",
      name: "Finance Approval",
      assignee: "role:finance",
    },
    { id: "end", type: "end", name: "End" },
  ],
  edges: [
    { from: "start", to: "managerApproval" },
    { from: "managerApproval", to: "financeApproval" },
    { from: "financeApproval", to: "end" },
  ],
}

const createService = () =>
  createWorkflowService(createInMemoryWorkflowRepository())

describe("createWorkflowService", () => {
  it("starts an instance and creates the first todo task", async () => {
    const service = createService()
    const definition = await service.create(tenantId, {
      key: "expense-approval",
      name: "Expense Approval",
      definition: linearApprovalDefinition,
    })

    const instance = await service.start(tenantId, startedByUserId, {
      definitionId: definition.id,
      variables: {
        amount: 1200,
      },
    })

    expect(instance.status).toBe("running")
    expect(instance.currentNodeId).toBe("managerApproval")
    expect(instance.currentTasks).toHaveLength(1)
    expect(instance.currentTasks[0]).toMatchObject({
      assignee: "role:manager",
      nodeId: "managerApproval",
      status: "todo",
      variables: {
        amount: 1200,
      },
    })
  })

  it("claims role-assigned tasks for the current actor and blocks unrelated roles", async () => {
    const service = createService()
    const definition = await service.create(tenantId, {
      key: "expense-approval-claimable",
      name: "Expense Approval Claimable",
      definition: linearApprovalDefinition,
    })
    const instance = await service.start(tenantId, startedByUserId, {
      definitionId: definition.id,
    })
    const taskId = instance.currentTasks[0]?.id

    if (!taskId) {
      throw new Error("Expected workflow task to exist")
    }

    await expect(
      service.claimTask(
        tenantId,
        {
          userId: "user_finance_1",
          roleCodes: ["finance"],
          isSuperAdmin: false,
        },
        taskId,
      ),
    ).rejects.toMatchObject({
      code: errorCodes.WORKFLOW_TASK_CLAIM_FORBIDDEN,
      status: 403,
    })

    const claimedInstance = await service.claimTask(
      tenantId,
      {
        userId: "user_manager_1",
        roleCodes: ["manager"],
        isSuperAdmin: false,
      },
      taskId,
    )

    expect(claimedInstance.currentTasks[0]).toMatchObject({
      assignee: "user:user_manager_1",
      claimSourceAssignee: "role:manager",
      claimedByUserId: "user_manager_1",
      status: "todo",
    })
    expect(claimedInstance.currentTasks[0]?.claimedAt).toEqual(
      expect.any(String),
    )
  })

  it("advances to the next approval and completes the instance after the final approval", async () => {
    const service = createService()
    const definition = await service.create(tenantId, {
      key: "expense-approval-progression",
      name: "Expense Approval Progression",
      definition: linearApprovalDefinition,
    })
    const startedInstance = await service.start(tenantId, startedByUserId, {
      definitionId: definition.id,
    })
    const firstTaskId = startedInstance.currentTasks[0]?.id

    if (!firstTaskId) {
      throw new Error("Expected workflow task to exist")
    }

    const runningInstance = await service.completeTask(
      tenantId,
      "user_manager_1",
      firstTaskId,
      {
        result: "approved",
      },
    )

    expect(runningInstance.status).toBe("running")
    expect(runningInstance.currentNodeId).toBe("financeApproval")
    expect(runningInstance.currentTasks).toHaveLength(1)
    expect(runningInstance.currentTasks[0]).toMatchObject({
      assignee: "role:finance",
      nodeId: "financeApproval",
      status: "todo",
    })

    const secondTaskId = runningInstance.currentTasks[0]?.id

    if (!secondTaskId) {
      throw new Error("Expected finance workflow task to exist")
    }

    const completedInstance = await service.completeTask(
      tenantId,
      "user_finance_1",
      secondTaskId,
      {
        result: "approved",
      },
    )

    expect(completedInstance.status).toBe("completed")
    expect(completedInstance.currentNodeId).toBe("end")
    expect(completedInstance.currentTasks).toHaveLength(0)
    expect(completedInstance.completedAt).toEqual(expect.any(String))
  })

  it("rejects from the current approval and allows explicit instance cancellation", async () => {
    const service = createService()
    const definition = await service.create(tenantId, {
      key: "expense-approval-termination",
      name: "Expense Approval Termination",
      definition: linearApprovalDefinition,
    })

    const rejectedStart = await service.start(tenantId, startedByUserId, {
      definitionId: definition.id,
    })
    const rejectedTaskId = rejectedStart.currentTasks[0]?.id

    if (!rejectedTaskId) {
      throw new Error("Expected workflow task to exist")
    }

    const rejectedInstance = await service.completeTask(
      tenantId,
      "user_manager_1",
      rejectedTaskId,
      {
        result: "rejected",
      },
    )

    expect(rejectedInstance.status).toBe("terminated")
    expect(rejectedInstance.currentNodeId).toBeNull()
    expect(rejectedInstance.currentTasks).toHaveLength(0)
    expect(rejectedInstance.terminatedAt).toEqual(expect.any(String))

    const cancellableStart = await service.start(tenantId, startedByUserId, {
      definitionId: definition.id,
    })
    const cancelledInstance = await service.cancelInstance(
      tenantId,
      cancellableStart.id,
    )

    expect(cancelledInstance.status).toBe("terminated")
    expect(cancelledInstance.currentNodeId).toBeNull()
    expect(cancelledInstance.currentTasks).toHaveLength(0)
    expect(cancelledInstance.terminatedAt).toEqual(expect.any(String))
  })
})
