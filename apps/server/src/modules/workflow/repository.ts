import {
  type CreateWorkflowDefinitionPersistenceInput,
  type CreateWorkflowInstancePersistenceInput,
  type CreateWorkflowTaskPersistenceInput,
  type DatabaseClient,
  type WorkflowDefinitionRow,
  type WorkflowInstanceRow,
  type WorkflowTaskRow,
  cancelWorkflowInstanceTodoTasks,
  getLatestWorkflowDefinitionByKey,
  getNextWorkflowDefinitionVersion,
  getWorkflowDefinitionById,
  getWorkflowInstanceById,
  getWorkflowTaskById,
  insertWorkflowDefinition,
  insertWorkflowInstance,
  insertWorkflowTask,
  listWorkflowDefinitions,
  listWorkflowDoneTasks,
  listWorkflowInstanceTasks,
  listWorkflowInstanceTodoTasks,
  listWorkflowInstances,
  listWorkflowTodoTasks,
  updateWorkflowInstance,
  updateWorkflowTask,
} from "@elysian/persistence"
import type {
  WorkflowDefinitionDraft,
  WorkflowDefinitionRecord,
  WorkflowDefinitionStatus,
  WorkflowInstanceDetailRecord,
  WorkflowInstanceRecord,
  WorkflowInstanceStatus,
  WorkflowTaskRecord,
  WorkflowTaskResult,
  WorkflowTaskStatus,
} from "@elysian/schema"

export interface CreateWorkflowDefinitionInput {
  tenantId: string
  key: string
  name: string
  status?: WorkflowDefinitionStatus
  definition: WorkflowDefinitionDraft
}

export interface CreateWorkflowInstanceInput {
  tenantId: string
  definition: WorkflowDefinitionRecord
  status: WorkflowInstanceStatus
  currentNodeId?: string | null
  variables?: Record<string, unknown>
  startedByUserId?: string | null
  completedAt?: Date | null
  terminatedAt?: Date | null
}

export interface CreateWorkflowTaskInput {
  tenantId: string
  instanceId: string
  definitionId: string
  nodeId: string
  nodeName: string
  assignee: string
  status?: WorkflowTaskStatus
  result?: WorkflowTaskResult | null
  variables?: Record<string, unknown>
  completedAt?: Date | null
}

export interface ListWorkflowTasksFilter {
  assignee?: string
}

export interface UpdateWorkflowInstanceInput {
  status?: WorkflowInstanceStatus
  currentNodeId?: string | null
  completedAt?: Date | null
  terminatedAt?: Date | null
}

export interface UpdateWorkflowTaskInput {
  assignee?: string
  claimSourceAssignee?: string | null
  claimedByUserId?: string | null
  claimedAt?: Date | null
  status?: WorkflowTaskStatus
  result?: WorkflowTaskResult | null
  completedAt?: Date | null
}

interface WorkflowInstanceState extends WorkflowInstanceRecord {
  tenantId: string
}

interface WorkflowTaskState extends WorkflowTaskRecord {
  tenantId: string
}

export interface InMemoryWorkflowRepositorySeed {
  definitions?: WorkflowDefinitionRecord[]
  instances?: WorkflowInstanceState[]
  tasks?: WorkflowTaskState[]
}

export interface WorkflowRepository {
  list: () => Promise<WorkflowDefinitionRecord[]>
  getById: (id: string) => Promise<WorkflowDefinitionRecord | null>
  getLatestByKey: (key: string) => Promise<WorkflowDefinitionRecord | null>
  create: (
    input: CreateWorkflowDefinitionInput,
  ) => Promise<WorkflowDefinitionRecord>
  listInstances: (tenantId: string) => Promise<WorkflowInstanceRecord[]>
  getInstanceById: (
    tenantId: string,
    id: string,
  ) => Promise<WorkflowInstanceDetailRecord | null>
  createInstance: (
    input: CreateWorkflowInstanceInput,
  ) => Promise<WorkflowInstanceRecord>
  createTask: (input: CreateWorkflowTaskInput) => Promise<WorkflowTaskRecord>
  getTaskById: (
    tenantId: string,
    id: string,
  ) => Promise<WorkflowTaskRecord | null>
  updateInstance: (
    tenantId: string,
    id: string,
    input: UpdateWorkflowInstanceInput,
  ) => Promise<WorkflowInstanceRecord | null>
  updateTask: (
    tenantId: string,
    id: string,
    input: UpdateWorkflowTaskInput,
  ) => Promise<WorkflowTaskRecord | null>
  cancelInstanceTodoTasks: (
    tenantId: string,
    instanceId: string,
  ) => Promise<WorkflowTaskRecord[]>
  listTodoTasks: (
    tenantId: string,
    filter?: ListWorkflowTasksFilter,
  ) => Promise<WorkflowTaskRecord[]>
  listDoneTasks: (
    tenantId: string,
    filter?: ListWorkflowTasksFilter,
  ) => Promise<WorkflowTaskRecord[]>
}

export type WorkflowDefinitionRepository = WorkflowRepository

export const createWorkflowRepository = (
  db: DatabaseClient,
): WorkflowRepository => ({
  list: async () => {
    const rows = await listWorkflowDefinitions(db)
    return rows.map(mapWorkflowDefinitionRow)
  },
  getById: async (id) => {
    const row = await getWorkflowDefinitionById(db, id)
    return row ? mapWorkflowDefinitionRow(row) : null
  },
  getLatestByKey: async (key) => {
    const row = await getLatestWorkflowDefinitionByKey(db, key)
    return row ? mapWorkflowDefinitionRow(row) : null
  },
  create: async (input) => {
    const version = await getNextWorkflowDefinitionVersion(db, input.key)
    const row = await insertWorkflowDefinition(db, {
      tenantId: input.tenantId,
      key: input.key,
      name: input.name,
      version,
      status: input.status,
      definition: input.definition as unknown as Record<string, unknown>,
    } satisfies CreateWorkflowDefinitionPersistenceInput)

    return mapWorkflowDefinitionRow(row)
  },
  listInstances: async (tenantId) => {
    const rows = await listWorkflowInstances(db)
    return rows
      .filter((row) => row.tenantId === tenantId)
      .map(mapWorkflowInstanceRow)
      .sort(compareWorkflowInstances)
  },
  getInstanceById: async (tenantId, id) => {
    const row = await getWorkflowInstanceById(db, id)

    if (!row || row.tenantId !== tenantId) {
      return null
    }

    const currentTasks = await listWorkflowInstanceTodoTasks(db, id)
    const tasks = await listWorkflowInstanceTasks(db, id)

    return {
      ...mapWorkflowInstanceRow(row),
      currentTasks: currentTasks
        .filter((task) => task.tenantId === tenantId)
        .map(mapWorkflowTaskRow)
        .sort(compareWorkflowTasksAscending),
      tasks: tasks
        .filter((task) => task.tenantId === tenantId)
        .map(mapWorkflowTaskRow)
        .sort(compareWorkflowTasksAscending),
    }
  },
  createInstance: async (input) => {
    const row = await insertWorkflowInstance(db, {
      tenantId: input.tenantId,
      definitionId: input.definition.id,
      definitionKey: input.definition.key,
      definitionName: input.definition.name,
      definitionVersion: input.definition.version,
      status: input.status,
      currentNodeId: input.currentNodeId ?? null,
      variables: input.variables ?? {},
      startedByUserId: input.startedByUserId ?? null,
      completedAt: input.completedAt ?? null,
      terminatedAt: input.terminatedAt ?? null,
    } satisfies CreateWorkflowInstancePersistenceInput)

    return mapWorkflowInstanceRow(row)
  },
  createTask: async (input) => {
    const row = await insertWorkflowTask(db, {
      tenantId: input.tenantId,
      instanceId: input.instanceId,
      definitionId: input.definitionId,
      nodeId: input.nodeId,
      nodeName: input.nodeName,
      assignee: input.assignee,
      status: input.status,
      result: input.result ?? null,
      variables: input.variables ?? {},
      completedAt: input.completedAt ?? null,
    } satisfies CreateWorkflowTaskPersistenceInput)

    return mapWorkflowTaskRow(row)
  },
  getTaskById: async (tenantId, id) => {
    const row = await getWorkflowTaskById(db, id)

    if (!row || row.tenantId !== tenantId) {
      return null
    }

    return mapWorkflowTaskRow(row)
  },
  updateInstance: async (tenantId, id, input) => {
    const current = await getWorkflowInstanceById(db, id)

    if (!current || current.tenantId !== tenantId) {
      return null
    }

    const row = await updateWorkflowInstance(db, id, input)
    return row ? mapWorkflowInstanceRow(row) : null
  },
  updateTask: async (tenantId, id, input) => {
    const current = await getWorkflowTaskById(db, id)

    if (!current || current.tenantId !== tenantId) {
      return null
    }

    const row = await updateWorkflowTask(db, id, input)
    return row ? mapWorkflowTaskRow(row) : null
  },
  cancelInstanceTodoTasks: async (tenantId, instanceId) => {
    const rows = await cancelWorkflowInstanceTodoTasks(db, instanceId)
    return rows
      .filter((row) => row.tenantId === tenantId)
      .map(mapWorkflowTaskRow)
      .sort(compareWorkflowTasksAscending)
  },
  listTodoTasks: async (tenantId, filter = {}) => {
    const rows = await listWorkflowTodoTasks(db, filter)
    return rows
      .filter((row) => row.tenantId === tenantId)
      .map(mapWorkflowTaskRow)
      .sort(compareWorkflowTasksDescending)
  },
  listDoneTasks: async (tenantId, filter = {}) => {
    const rows = await listWorkflowDoneTasks(db, filter)
    return rows
      .filter((row) => row.tenantId === tenantId)
      .map(mapWorkflowTaskRow)
      .sort(compareWorkflowTasksDescending)
  },
})

export const createWorkflowDefinitionRepository = createWorkflowRepository

export const createInMemoryWorkflowRepository = (
  seed: WorkflowDefinitionRecord[] | InMemoryWorkflowRepositorySeed = [],
): WorkflowRepository => {
  const {
    definitions: seedDefinitions,
    instances: seedInstances,
    tasks: seedTasks,
  } = normalizeSeed(seed)
  const definitions = new Map(
    seedDefinitions.map((item) => [item.id, item] as const),
  )
  const instances = new Map(
    seedInstances.map((item) => [item.id, item] as const),
  )
  const tasks = new Map(seedTasks.map((item) => [item.id, item] as const))

  return {
    async list() {
      return [...definitions.values()].sort(compareWorkflowDefinitions)
    },
    async getById(id) {
      return definitions.get(id) ?? null
    },
    async getLatestByKey(key) {
      return (
        [...definitions.values()]
          .filter((item) => item.key === key)
          .sort(compareWorkflowDefinitions)[0] ?? null
      )
    },
    async create(input) {
      const version =
        [...definitions.values()]
          .filter((item) => item.key === input.key)
          .reduce((maxVersion, item) => Math.max(maxVersion, item.version), 0) +
        1
      const now = new Date().toISOString()
      const definition: WorkflowDefinitionRecord = {
        id: crypto.randomUUID(),
        key: input.key,
        name: input.name,
        version,
        status: input.status ?? "active",
        definition: input.definition,
        createdAt: now,
        updatedAt: now,
      }

      definitions.set(definition.id, definition)
      return definition
    },
    async listInstances(tenantId) {
      return [...instances.values()]
        .filter((item) => item.tenantId === tenantId)
        .map(stripWorkflowInstanceTenant)
        .sort(compareWorkflowInstances)
    },
    async getInstanceById(tenantId, id) {
      const instance = instances.get(id)

      if (!instance || instance.tenantId !== tenantId) {
        return null
      }

      return {
        ...stripWorkflowInstanceTenant(instance),
        currentTasks: [...tasks.values()]
          .filter(
            (task) =>
              task.tenantId === tenantId &&
              task.instanceId === id &&
              task.status === "todo",
          )
          .map(stripWorkflowTaskTenant)
          .sort(compareWorkflowTasksAscending),
        tasks: [...tasks.values()]
          .filter(
            (task) => task.tenantId === tenantId && task.instanceId === id,
          )
          .map(stripWorkflowTaskTenant)
          .sort(compareWorkflowTasksAscending),
      }
    },
    async createInstance(input) {
      const now = new Date().toISOString()
      const instance: WorkflowInstanceState = {
        id: crypto.randomUUID(),
        tenantId: input.tenantId,
        definitionId: input.definition.id,
        definitionKey: input.definition.key,
        definitionName: input.definition.name,
        definitionVersion: input.definition.version,
        status: input.status,
        currentNodeId: input.currentNodeId ?? null,
        variables: input.variables ?? {},
        startedByUserId: input.startedByUserId ?? null,
        startedAt: now,
        completedAt:
          input.completedAt?.toISOString() ??
          (input.status === "completed" ? now : null),
        terminatedAt:
          input.terminatedAt?.toISOString() ??
          (input.status === "terminated" ? now : null),
        createdAt: now,
        updatedAt: now,
      }

      instances.set(instance.id, instance)
      return stripWorkflowInstanceTenant(instance)
    },
    async createTask(input) {
      const now = new Date().toISOString()
      const task: WorkflowTaskState = {
        id: crypto.randomUUID(),
        tenantId: input.tenantId,
        instanceId: input.instanceId,
        definitionId: input.definitionId,
        nodeId: input.nodeId,
        nodeName: input.nodeName,
        assignee: input.assignee,
        status: input.status ?? "todo",
        result: input.result ?? null,
        variables: input.variables ?? {},
        createdAt: now,
        updatedAt: now,
        completedAt: input.completedAt?.toISOString() ?? null,
      }

      tasks.set(task.id, task)
      return stripWorkflowTaskTenant(task)
    },
    async getTaskById(tenantId, id) {
      const task = tasks.get(id)

      if (!task || task.tenantId !== tenantId) {
        return null
      }

      return stripWorkflowTaskTenant(task)
    },
    async updateInstance(tenantId, id, input) {
      const current = instances.get(id)

      if (!current || current.tenantId !== tenantId) {
        return null
      }

      const updated: WorkflowInstanceState = {
        ...current,
        status: input.status ?? current.status,
        currentNodeId:
          input.currentNodeId !== undefined
            ? input.currentNodeId
            : current.currentNodeId,
        completedAt:
          input.completedAt !== undefined
            ? (input.completedAt?.toISOString() ?? null)
            : current.completedAt,
        terminatedAt:
          input.terminatedAt !== undefined
            ? (input.terminatedAt?.toISOString() ?? null)
            : current.terminatedAt,
        updatedAt: new Date().toISOString(),
      }

      instances.set(id, updated)
      return stripWorkflowInstanceTenant(updated)
    },
    async updateTask(tenantId, id, input) {
      const current = tasks.get(id)

      if (!current || current.tenantId !== tenantId) {
        return null
      }

      const updated: WorkflowTaskState = {
        ...current,
        assignee: input.assignee ?? current.assignee,
        claimSourceAssignee:
          input.claimSourceAssignee !== undefined
            ? (input.claimSourceAssignee ?? undefined)
            : current.claimSourceAssignee,
        claimedByUserId:
          input.claimedByUserId !== undefined
            ? (input.claimedByUserId ?? undefined)
            : current.claimedByUserId,
        claimedAt:
          input.claimedAt !== undefined
            ? (input.claimedAt?.toISOString() ?? undefined)
            : current.claimedAt,
        status: input.status ?? current.status,
        result:
          input.result !== undefined ? (input.result ?? null) : current.result,
        completedAt:
          input.completedAt !== undefined
            ? (input.completedAt?.toISOString() ?? null)
            : current.completedAt,
        updatedAt: new Date().toISOString(),
      }

      tasks.set(id, updated)
      return stripWorkflowTaskTenant(updated)
    },
    async cancelInstanceTodoTasks(tenantId, instanceId) {
      const updatedAt = new Date().toISOString()
      const cancelled = [...tasks.values()]
        .filter(
          (task) =>
            task.tenantId === tenantId &&
            task.instanceId === instanceId &&
            task.status === "todo",
        )
        .map((task) => {
          const updated: WorkflowTaskState = {
            ...task,
            status: "cancelled",
            updatedAt,
          }
          tasks.set(task.id, updated)
          return stripWorkflowTaskTenant(updated)
        })

      return cancelled.sort(compareWorkflowTasksAscending)
    },
    async listTodoTasks(tenantId, filter = {}) {
      return [...tasks.values()]
        .filter(
          (task) =>
            task.tenantId === tenantId &&
            task.status === "todo" &&
            (filter.assignee === undefined ||
              task.assignee === filter.assignee),
        )
        .map(stripWorkflowTaskTenant)
        .sort(compareWorkflowTasksDescending)
    },
    async listDoneTasks(tenantId, filter = {}) {
      return [...tasks.values()]
        .filter(
          (task) =>
            task.tenantId === tenantId &&
            task.status === "completed" &&
            (filter.assignee === undefined ||
              task.assignee === filter.assignee),
        )
        .map(stripWorkflowTaskTenant)
        .sort(compareWorkflowTasksDescending)
    },
  }
}

export const createInMemoryWorkflowDefinitionRepository =
  createInMemoryWorkflowRepository

const normalizeSeed = (
  seed: WorkflowDefinitionRecord[] | InMemoryWorkflowRepositorySeed,
): Required<InMemoryWorkflowRepositorySeed> =>
  Array.isArray(seed)
    ? { definitions: seed, instances: [], tasks: [] }
    : {
        definitions: seed.definitions ?? [],
        instances: seed.instances ?? [],
        tasks: seed.tasks ?? [],
      }

const stripWorkflowInstanceTenant = ({
  tenantId: _tenantId,
  ...instance
}: WorkflowInstanceState): WorkflowInstanceRecord => instance

const stripWorkflowTaskTenant = ({
  tenantId: _tenantId,
  ...task
}: WorkflowTaskState): WorkflowTaskRecord => task

const mapWorkflowDefinitionRow = (
  row: WorkflowDefinitionRow,
): WorkflowDefinitionRecord => ({
  id: row.id,
  key: row.key,
  name: row.name,
  version: row.version,
  status: row.status,
  definition: row.definition as unknown as WorkflowDefinitionDraft,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapWorkflowInstanceRow = (
  row: WorkflowInstanceRow,
): WorkflowInstanceRecord => ({
  id: row.id,
  definitionId: row.definitionId,
  definitionKey: row.definitionKey,
  definitionName: row.definitionName,
  definitionVersion: row.definitionVersion,
  status: row.status,
  currentNodeId: row.currentNodeId,
  variables: row.variables,
  startedByUserId: row.startedByUserId,
  startedAt: row.startedAt.toISOString(),
  completedAt: row.completedAt?.toISOString() ?? null,
  terminatedAt: row.terminatedAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapWorkflowTaskRow = (row: WorkflowTaskRow): WorkflowTaskRecord => ({
  id: row.id,
  instanceId: row.instanceId,
  definitionId: row.definitionId,
  nodeId: row.nodeId,
  nodeName: row.nodeName,
  assignee: row.assignee,
  ...(row.claimSourceAssignee
    ? { claimSourceAssignee: row.claimSourceAssignee }
    : {}),
  ...(row.claimedByUserId ? { claimedByUserId: row.claimedByUserId } : {}),
  ...(row.claimedAt ? { claimedAt: row.claimedAt.toISOString() } : {}),
  status: row.status,
  result: row.result,
  variables: row.variables,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  completedAt: row.completedAt?.toISOString() ?? null,
})

const compareWorkflowDefinitions = (
  left: WorkflowDefinitionRecord,
  right: WorkflowDefinitionRecord,
) =>
  left.key.localeCompare(right.key) ||
  right.version - left.version ||
  right.createdAt.localeCompare(left.createdAt)

const compareWorkflowInstances = (
  left: WorkflowInstanceRecord,
  right: WorkflowInstanceRecord,
) => right.createdAt.localeCompare(left.createdAt)

const compareWorkflowTasksDescending = (
  left: WorkflowTaskRecord,
  right: WorkflowTaskRecord,
) => right.createdAt.localeCompare(left.createdAt)

const compareWorkflowTasksAscending = (
  left: WorkflowTaskRecord,
  right: WorkflowTaskRecord,
) => left.createdAt.localeCompare(right.createdAt)
