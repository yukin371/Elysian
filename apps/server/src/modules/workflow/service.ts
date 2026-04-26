import {
  type WorkflowApprovalNode,
  type WorkflowConditionNode,
  type WorkflowDefinitionDraft,
  type WorkflowNode,
  type WorkflowTaskResult,
  parseWorkflowConditionExpression,
  validateWorkflowDefinitionDraft,
} from "@elysian/schema"

import { AppError } from "../../errors"
import type {
  CreateWorkflowDefinitionInput,
  ListWorkflowTasksFilter,
  WorkflowRepository,
} from "./repository"

export interface CreateWorkflowDefinitionPayload
  extends Omit<CreateWorkflowDefinitionInput, "tenantId" | "key" | "name"> {
  key: string
  name: string
}

export interface UpdateWorkflowDefinitionPayload {
  name?: string
  status?: "active" | "disabled"
  definition?: CreateWorkflowDefinitionPayload["definition"]
}

export interface StartWorkflowInstancePayload {
  definitionId: string
  variables?: Record<string, unknown>
}

export interface CompleteWorkflowTaskPayload {
  result: WorkflowTaskResult
}

const workflowRoleAssigneePrefix = "role:"
const workflowUserAssigneePrefix = "user:"

type InitialWorkflowTransition =
  | {
      status: "running"
      currentNodeId: string
      task: WorkflowApprovalNode
    }
  | {
      status: "completed"
      currentNodeId: string
      task: null
    }

type WorkflowTaskTransition =
  | {
      instanceStatus: "running"
      currentNodeId: string
      nextTask: WorkflowApprovalNode
    }
  | {
      instanceStatus: "completed"
      currentNodeId: string
      nextTask: null
    }

const isRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === "object" && input !== null && !Array.isArray(input)

const buildWorkflowUserAssignee = (userId: string) =>
  `${workflowUserAssigneePrefix}${userId}`

const resolveWorkflowRoleAssignee = (assignee: string) => {
  if (!assignee.startsWith(workflowRoleAssigneePrefix)) {
    return null
  }

  const roleCode = assignee.slice(workflowRoleAssigneePrefix.length).trim()
  return roleCode.length > 0 ? roleCode : null
}

const requireClaimableWorkflowTask = (
  assignee: string,
  actor: {
    userId: string
    roleCodes: string[]
    isSuperAdmin: boolean
  },
  taskId: string,
) => {
  const claimedAssignee = buildWorkflowUserAssignee(actor.userId)
  if (assignee === claimedAssignee) {
    throw new AppError({
      code: "WORKFLOW_TASK_ALREADY_CLAIMED",
      message: "Workflow task is already claimed",
      status: 409,
      expose: true,
      details: {
        id: taskId,
        assignee,
      },
    })
  }

  if (assignee.startsWith(workflowUserAssigneePrefix)) {
    throw new AppError({
      code: "WORKFLOW_TASK_ALREADY_CLAIMED",
      message: "Workflow task is already claimed",
      status: 409,
      expose: true,
      details: {
        id: taskId,
        assignee,
      },
    })
  }

  const roleCode = resolveWorkflowRoleAssignee(assignee)
  if (roleCode && !actor.isSuperAdmin && !actor.roleCodes.includes(roleCode)) {
    throw new AppError({
      code: "WORKFLOW_TASK_CLAIM_FORBIDDEN",
      message: "Workflow task cannot be claimed by the current user",
      status: 403,
      expose: true,
      details: {
        id: taskId,
        assignee,
        requiredRoleCode: roleCode,
      },
    })
  }
}

const requireWorkflowTaskActor = (
  assignee: string,
  currentUserId: string,
  taskId: string,
) => {
  if (
    assignee.startsWith(workflowUserAssigneePrefix) &&
    assignee !== buildWorkflowUserAssignee(currentUserId)
  ) {
    throw new AppError({
      code: "WORKFLOW_TASK_ASSIGNEE_MISMATCH",
      message: "Workflow task is assigned to another user",
      status: 403,
      expose: true,
      details: {
        id: taskId,
        assignee,
      },
    })
  }
}

interface WorkflowRuntimeContext {
  nodeMap: Map<string, WorkflowNode>
  outgoingMap: Map<string, string[]>
}

export const createWorkflowService = (repository: WorkflowRepository) => ({
  list: () => repository.list(),
  async getById(id: string) {
    const definition = await repository.getById(id)

    if (!definition) {
      throw new AppError({
        code: "WORKFLOW_DEFINITION_NOT_FOUND",
        message: "Workflow definition not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return definition
  },
  async create(tenantId: string, input: CreateWorkflowDefinitionPayload) {
    const key = input.key.trim()
    const name = input.name.trim()

    if (key.length === 0) {
      throw new AppError({
        code: "WORKFLOW_DEFINITION_KEY_REQUIRED",
        message: "Workflow definition key is required",
        status: 400,
        expose: true,
      })
    }

    if (name.length === 0) {
      throw new AppError({
        code: "WORKFLOW_DEFINITION_NAME_REQUIRED",
        message: "Workflow definition name is required",
        status: 400,
        expose: true,
      })
    }

    const issues = validateWorkflowDefinitionDraft(input.definition)
    if (issues.length > 0) {
      throw new AppError({
        code: "WORKFLOW_DEFINITION_INVALID",
        message: "Workflow definition draft is invalid",
        status: 400,
        expose: true,
        details: { issues },
      })
    }

    const existing = await repository.getLatestByKey(key)
    if (existing) {
      throw new AppError({
        code: "WORKFLOW_DEFINITION_KEY_CONFLICT",
        message: "Workflow definition key already exists",
        status: 409,
        expose: true,
        details: { key, latestVersion: existing.version },
      })
    }

    return repository.create({
      tenantId,
      key,
      name,
      status: input.status,
      definition: input.definition,
    })
  },
  async update(
    id: string,
    tenantId: string,
    input: UpdateWorkflowDefinitionPayload,
  ) {
    const current = await repository.getById(id)

    if (!current) {
      throw new AppError({
        code: "WORKFLOW_DEFINITION_NOT_FOUND",
        message: "Workflow definition not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    const nextName = input.name !== undefined ? input.name.trim() : current.name
    const nextDefinition = input.definition ?? current.definition

    if (nextName.length === 0) {
      throw new AppError({
        code: "WORKFLOW_DEFINITION_NAME_REQUIRED",
        message: "Workflow definition name is required",
        status: 400,
        expose: true,
      })
    }

    const issues = validateWorkflowDefinitionDraft(nextDefinition)
    if (issues.length > 0) {
      throw new AppError({
        code: "WORKFLOW_DEFINITION_INVALID",
        message: "Workflow definition draft is invalid",
        status: 400,
        expose: true,
        details: { issues },
      })
    }

    return repository.create({
      tenantId,
      key: current.key,
      name: nextName,
      status: input.status ?? current.status,
      definition: nextDefinition,
    })
  },
  listInstances: (tenantId: string) => repository.listInstances(tenantId),
  async getInstanceById(tenantId: string, id: string) {
    const instance = await repository.getInstanceById(tenantId, id)

    if (!instance) {
      throw new AppError({
        code: "WORKFLOW_INSTANCE_NOT_FOUND",
        message: "Workflow instance not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return instance
  },
  async start(
    tenantId: string,
    startedByUserId: string,
    input: StartWorkflowInstancePayload,
  ) {
    const definitionId = input.definitionId.trim()

    if (definitionId.length === 0) {
      throw new AppError({
        code: "WORKFLOW_INSTANCE_DEFINITION_REQUIRED",
        message: "Workflow definition id is required",
        status: 400,
        expose: true,
      })
    }

    const variables = normalizeWorkflowVariables(input.variables)
    const definition = await repository.getById(definitionId)

    if (!definition) {
      throw new AppError({
        code: "WORKFLOW_DEFINITION_NOT_FOUND",
        message: "Workflow definition not found",
        status: 404,
        expose: true,
        details: { id: definitionId },
      })
    }

    if (definition.status !== "active") {
      throw new AppError({
        code: "WORKFLOW_DEFINITION_DISABLED",
        message: "Workflow definition is disabled",
        status: 409,
        expose: true,
        details: {
          id: definition.id,
          status: definition.status,
        },
      })
    }

    const initialTransition = resolveInitialTransition(
      definition.definition,
      variables,
    )
    const instance = await repository.createInstance({
      tenantId,
      definition,
      status: initialTransition.status,
      currentNodeId: initialTransition.currentNodeId,
      variables,
      startedByUserId,
      completedAt: initialTransition.status === "completed" ? new Date() : null,
    })

    if (initialTransition.task) {
      await repository.createTask({
        tenantId,
        instanceId: instance.id,
        definitionId: definition.id,
        nodeId: initialTransition.task.id,
        nodeName: initialTransition.task.name,
        assignee: initialTransition.task.assignee,
        variables,
      })
    }

    const detail = await repository.getInstanceById(tenantId, instance.id)

    if (!detail) {
      throw new Error("Workflow instance start did not return a detail record")
    }

    return detail
  },
  listTodoTasks: (tenantId: string, filter: ListWorkflowTasksFilter = {}) =>
    repository.listTodoTasks(tenantId, normalizeTaskFilter(filter)),
  listDoneTasks: (tenantId: string, filter: ListWorkflowTasksFilter = {}) =>
    repository.listDoneTasks(tenantId, normalizeTaskFilter(filter)),
  async claimTask(
    tenantId: string,
    actor: {
      userId: string
      roleCodes: string[]
      isSuperAdmin: boolean
    },
    taskId: string,
  ) {
    const task = await repository.getTaskById(tenantId, taskId)

    if (!task) {
      throw new AppError({
        code: "WORKFLOW_TASK_NOT_FOUND",
        message: "Workflow task not found",
        status: 404,
        expose: true,
        details: { id: taskId },
      })
    }

    if (task.status !== "todo") {
      throw new AppError({
        code: "WORKFLOW_TASK_NOT_TODO",
        message: "Workflow task is not pending",
        status: 409,
        expose: true,
        details: { id: taskId, status: task.status },
      })
    }

    requireClaimableWorkflowTask(task.assignee, actor, taskId)

    await repository.updateTask(tenantId, taskId, {
      assignee: buildWorkflowUserAssignee(actor.userId),
    })

    const detail = await repository.getInstanceById(tenantId, task.instanceId)

    if (!detail) {
      throw new Error("Workflow task claim did not return instance detail")
    }

    return detail
  },
  async completeTask(
    tenantId: string,
    currentUserId: string,
    taskId: string,
    input: CompleteWorkflowTaskPayload,
  ) {
    const task = await repository.getTaskById(tenantId, taskId)

    if (!task) {
      throw new AppError({
        code: "WORKFLOW_TASK_NOT_FOUND",
        message: "Workflow task not found",
        status: 404,
        expose: true,
        details: { id: taskId },
      })
    }

    if (task.status !== "todo") {
      throw new AppError({
        code: "WORKFLOW_TASK_NOT_TODO",
        message: "Workflow task is not pending",
        status: 409,
        expose: true,
        details: { id: taskId, status: task.status },
      })
    }

    requireWorkflowTaskActor(task.assignee, currentUserId, taskId)

    const instance = await repository.getInstanceById(tenantId, task.instanceId)

    if (!instance) {
      throw new AppError({
        code: "WORKFLOW_INSTANCE_NOT_FOUND",
        message: "Workflow instance not found",
        status: 404,
        expose: true,
        details: { id: task.instanceId },
      })
    }

    if (instance.status !== "running") {
      throw new AppError({
        code: "WORKFLOW_INSTANCE_NOT_RUNNING",
        message: "Workflow instance is not running",
        status: 409,
        expose: true,
        details: { id: instance.id, status: instance.status },
      })
    }

    const completedAt = new Date()
    await repository.updateTask(tenantId, taskId, {
      status: "completed",
      result: input.result,
      completedAt,
    })

    if (input.result === "rejected") {
      await repository.cancelInstanceTodoTasks(tenantId, instance.id)
      await repository.updateInstance(tenantId, instance.id, {
        status: "terminated",
        currentNodeId: null,
        terminatedAt: completedAt,
      })
    } else {
      const definition = await repository.getById(instance.definitionId)

      if (!definition) {
        throw new AppError({
          code: "WORKFLOW_DEFINITION_NOT_FOUND",
          message: "Workflow definition not found",
          status: 404,
          expose: true,
          details: { id: instance.definitionId },
        })
      }

      const transition = resolveApprovalTransition(
        definition.definition,
        task.nodeId,
        instance.variables,
      )

      if (transition.instanceStatus === "completed") {
        await repository.updateInstance(tenantId, instance.id, {
          status: "completed",
          currentNodeId: transition.currentNodeId,
          completedAt,
          terminatedAt: null,
        })
      } else {
        await repository.updateInstance(tenantId, instance.id, {
          status: "running",
          currentNodeId: transition.currentNodeId,
          completedAt: null,
          terminatedAt: null,
        })
        await repository.createTask({
          tenantId,
          instanceId: instance.id,
          definitionId: instance.definitionId,
          nodeId: transition.nextTask.id,
          nodeName: transition.nextTask.name,
          assignee: transition.nextTask.assignee,
          variables: instance.variables,
        })
      }
    }

    const detail = await repository.getInstanceById(tenantId, instance.id)

    if (!detail) {
      throw new Error("Workflow task completion did not return instance detail")
    }

    return detail
  },
  async cancelInstance(tenantId: string, id: string) {
    const instance = await repository.getInstanceById(tenantId, id)

    if (!instance) {
      throw new AppError({
        code: "WORKFLOW_INSTANCE_NOT_FOUND",
        message: "Workflow instance not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    if (instance.status !== "running") {
      throw new AppError({
        code: "WORKFLOW_INSTANCE_NOT_RUNNING",
        message: "Workflow instance is not running",
        status: 409,
        expose: true,
        details: { id, status: instance.status },
      })
    }

    const terminatedAt = new Date()
    await repository.cancelInstanceTodoTasks(tenantId, id)
    const updated = await repository.updateInstance(tenantId, id, {
      status: "terminated",
      currentNodeId: null,
      terminatedAt,
      completedAt: null,
    })

    if (!updated) {
      throw new Error(
        "Workflow instance cancel did not return updated instance",
      )
    }

    const detail = await repository.getInstanceById(tenantId, id)

    if (!detail) {
      throw new Error("Workflow instance cancel did not return instance detail")
    }

    return detail
  },
})

export const createWorkflowDefinitionService = createWorkflowService

export type WorkflowService = ReturnType<typeof createWorkflowService>
export type WorkflowDefinitionService = WorkflowService

const normalizeWorkflowVariables = (
  input: unknown,
): Record<string, unknown> => {
  if (input === undefined) {
    return {}
  }

  if (!isRecord(input)) {
    throw new AppError({
      code: "WORKFLOW_INSTANCE_VARIABLES_INVALID",
      message: "Workflow variables must be a JSON object",
      status: 400,
      expose: true,
    })
  }

  return input
}

const normalizeTaskFilter = (
  filter: ListWorkflowTasksFilter,
): ListWorkflowTasksFilter => ({
  assignee:
    filter.assignee !== undefined && filter.assignee.trim().length > 0
      ? filter.assignee.trim()
      : undefined,
})

const resolveInitialTransition = (
  definition: WorkflowDefinitionDraft,
  variables: Record<string, unknown>,
): InitialWorkflowTransition => {
  const runtimeContext = createWorkflowRuntimeContext(definition)
  const startNode = requireWorkflowValue(
    definition.nodes.find((node) => node.type === "start"),
    "missing-start",
  )

  return resolveLinearEntryTransition(runtimeContext, startNode.id, variables)
}

const throwUnsupportedWorkflowStructure = (
  nodeId: string,
  outgoingCount?: number,
): never => {
  throw new AppError({
    code: "WORKFLOW_DEFINITION_RUNTIME_UNSUPPORTED",
    message:
      "Workflow runtime currently supports simplified approval flows with optional condition branches",
    status: 409,
    expose: true,
    details: {
      nodeId,
      outgoingCount,
    },
  })
}

const requireWorkflowValue = <T>(
  value: T | undefined,
  nodeId: string,
): Exclude<T, undefined> => {
  if (value === undefined) {
    throwUnsupportedWorkflowStructure(nodeId)
  }

  return value as Exclude<T, undefined>
}

const resolveApprovalTransition = (
  definition: WorkflowDefinitionDraft,
  currentNodeId: string,
  variables: Record<string, unknown>,
): WorkflowTaskTransition => {
  const runtimeContext = createWorkflowRuntimeContext(definition)
  const currentNode = requireWorkflowValue(
    runtimeContext.nodeMap.get(currentNodeId),
    `${currentNodeId}:missing-node`,
  )

  if (currentNode.type !== "approval") {
    throwUnsupportedWorkflowStructure(`${currentNodeId}:not-approval`)
  }

  return resolveLinearNodeTransition(
    runtimeContext,
    currentNodeId,
    variables,
    new Set([currentNodeId]),
  )
}

const resolveRuntimeNodeTransition = (
  runtimeContext: WorkflowRuntimeContext,
  node: WorkflowNode,
  variables: Record<string, unknown>,
  visited: Set<string>,
): WorkflowTaskTransition => {
  if (node.type === "approval") {
    return {
      instanceStatus: "running",
      currentNodeId: node.id,
      nextTask: node,
    }
  }

  if (node.type === "end") {
    return {
      instanceStatus: "completed",
      currentNodeId: node.id,
      nextTask: null,
    }
  }

  if (node.type === "condition") {
    const nextNode = resolveConditionNodeTransition(
      runtimeContext,
      node,
      variables,
      visited,
    )
    visited.add(nextNode.id)

    return resolveRuntimeNodeTransition(
      runtimeContext,
      nextNode,
      variables,
      visited,
    )
  }

  return throwUnsupportedWorkflowStructure(node.type)
}

const createWorkflowRuntimeContext = (
  definition: WorkflowDefinitionDraft,
): WorkflowRuntimeContext => {
  const outgoingMap = new Map<string, string[]>()

  for (const edge of definition.edges) {
    const targets = outgoingMap.get(edge.from) ?? []
    targets.push(edge.to)
    outgoingMap.set(edge.from, targets)
  }

  return {
    nodeMap: new Map(definition.nodes.map((node) => [node.id, node] as const)),
    outgoingMap,
  }
}

const resolveLinearEntryTransition = (
  runtimeContext: WorkflowRuntimeContext,
  currentNodeId: string,
  variables: Record<string, unknown>,
): InitialWorkflowTransition => {
  const nextNode = resolveSingleOutgoingNode(
    runtimeContext,
    currentNodeId,
    new Set([currentNodeId]),
  )
  const transition = resolveRuntimeNodeTransition(
    runtimeContext,
    nextNode,
    variables,
    new Set([currentNodeId, nextNode.id]),
  )

  if (transition.instanceStatus === "running") {
    return {
      status: "running",
      currentNodeId: transition.currentNodeId,
      task: transition.nextTask,
    }
  }

  return {
    status: "completed",
    currentNodeId: transition.currentNodeId,
    task: null,
  }
}

const resolveLinearNodeTransition = (
  runtimeContext: WorkflowRuntimeContext,
  currentNodeId: string,
  variables: Record<string, unknown>,
  visited: Set<string>,
): WorkflowTaskTransition => {
  const nextNode = resolveSingleOutgoingNode(
    runtimeContext,
    currentNodeId,
    visited,
  )

  visited.add(nextNode.id)

  return resolveRuntimeNodeTransition(
    runtimeContext,
    nextNode,
    variables,
    visited,
  )
}

const resolveSingleOutgoingNode = (
  runtimeContext: WorkflowRuntimeContext,
  currentNodeId: string,
  visited: Set<string>,
): WorkflowNode => {
  const outgoing = runtimeContext.outgoingMap.get(currentNodeId) ?? []

  if (outgoing.length !== 1) {
    throwUnsupportedWorkflowStructure(currentNodeId, outgoing.length)
  }

  const nextNodeId = requireWorkflowValue(
    outgoing[0],
    `${currentNodeId}:missing-edge`,
  )

  if (visited.has(nextNodeId)) {
    throwUnsupportedWorkflowStructure(`${currentNodeId}:cycle`)
  }

  return requireWorkflowValue(
    runtimeContext.nodeMap.get(nextNodeId),
    `${currentNodeId}:missing-target`,
  )
}

const resolveConditionNodeTransition = (
  runtimeContext: WorkflowRuntimeContext,
  node: WorkflowConditionNode,
  variables: Record<string, unknown>,
  visited: Set<string>,
): WorkflowNode => {
  const outgoingTargets = new Set(runtimeContext.outgoingMap.get(node.id) ?? [])
  const defaultBranch = node.conditions.find(
    (condition) => condition.expression.trim() === "default",
  )

  for (const condition of node.conditions) {
    const parsedExpression = requireWorkflowValue(
      parseWorkflowConditionExpression(condition.expression),
      `${node.id}:invalid-condition-expression`,
    )

    if (parsedExpression.kind === "default") {
      continue
    }

    if (evaluateWorkflowCondition(parsedExpression, variables)) {
      return resolveConditionTargetNode(
        runtimeContext,
        node.id,
        condition.target,
        outgoingTargets,
        visited,
      )
    }
  }

  if (!defaultBranch) {
    throwUnsupportedWorkflowStructure(`${node.id}:missing-default`)
  }

  const fallbackBranch = requireWorkflowValue(
    defaultBranch,
    `${node.id}:missing-default`,
  )

  return resolveConditionTargetNode(
    runtimeContext,
    node.id,
    fallbackBranch.target,
    outgoingTargets,
    visited,
  )
}

const resolveConditionTargetNode = (
  runtimeContext: WorkflowRuntimeContext,
  nodeId: string,
  targetNodeId: string,
  outgoingTargets: Set<string>,
  visited: Set<string>,
): WorkflowNode => {
  if (!outgoingTargets.has(targetNodeId)) {
    throwUnsupportedWorkflowStructure(`${nodeId}:missing-condition-edge`)
  }

  if (visited.has(targetNodeId)) {
    throwUnsupportedWorkflowStructure(`${nodeId}:cycle`)
  }

  return requireWorkflowValue(
    runtimeContext.nodeMap.get(targetNodeId),
    `${nodeId}:missing-target`,
  )
}

const evaluateWorkflowCondition = (
  expression: Exclude<
    ReturnType<typeof parseWorkflowConditionExpression>,
    undefined | { kind: "default" }
  >,
  variables: Record<string, unknown>,
): boolean => {
  const leftValue = getWorkflowVariableValue(variables, expression.variablePath)
  const rightValue = expression.value

  switch (expression.operator) {
    case ">":
      return typeof leftValue === "number" && typeof rightValue === "number"
        ? leftValue > rightValue
        : false
    case ">=":
      return typeof leftValue === "number" && typeof rightValue === "number"
        ? leftValue >= rightValue
        : false
    case "<":
      return typeof leftValue === "number" && typeof rightValue === "number"
        ? leftValue < rightValue
        : false
    case "<=":
      return typeof leftValue === "number" && typeof rightValue === "number"
        ? leftValue <= rightValue
        : false
    case "==":
      return leftValue === rightValue
    case "!=":
      return leftValue !== rightValue
    case "===":
      return leftValue === rightValue
    case "!==":
      return leftValue !== rightValue
  }
}

const getWorkflowVariableValue = (
  variables: Record<string, unknown>,
  variablePath: string,
): unknown => {
  const segments = variablePath.split(".")
  let current: unknown = variables

  for (const segment of segments) {
    if (!isRecord(current) || !(segment in current)) {
      return undefined
    }

    current = current[segment]
  }

  return current
}
