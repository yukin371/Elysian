import { type SQL, and, asc, desc, eq, ilike, or, sql } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import {
  type PaginatedResult,
  type PaginationQuery,
  buildPaginatedResult,
  normalizePagination,
} from "./query-utils"
import {
  type WorkflowDefinitionRow,
  type WorkflowInstanceRow,
  type WorkflowTaskRow,
  workflowDefinitions,
  workflowInstances,
  workflowTasks,
} from "./schema"

export interface CreateWorkflowDefinitionPersistenceInput {
  tenantId: string
  key: string
  name: string
  version: number
  status?: "active" | "disabled"
  definition: Record<string, unknown>
}

export interface CreateWorkflowInstancePersistenceInput {
  tenantId: string
  definitionId: string
  definitionKey: string
  definitionName: string
  definitionVersion: number
  status: "running" | "completed" | "terminated"
  currentNodeId?: string | null
  variables?: Record<string, unknown>
  startedByUserId?: string | null
  completedAt?: Date | null
  terminatedAt?: Date | null
}

export interface CreateWorkflowTaskPersistenceInput {
  tenantId: string
  instanceId: string
  definitionId: string
  nodeId: string
  nodeName: string
  assignee: string
  status?: "todo" | "completed" | "cancelled"
  result?: "approved" | "rejected" | null
  variables?: Record<string, unknown>
  completedAt?: Date | null
}

export interface ListWorkflowTasksPersistenceFilter {
  assignee?: string
}

export interface ListWorkflowDefinitionsPersistenceFilter
  extends PaginationQuery {
  q?: string
  status?: "active" | "disabled"
}

export type ListWorkflowDefinitionsPersistenceResult =
  PaginatedResult<WorkflowDefinitionRow>

export interface UpdateWorkflowInstancePersistenceInput {
  status?: "running" | "completed" | "terminated"
  currentNodeId?: string | null
  completedAt?: Date | null
  terminatedAt?: Date | null
}

export interface UpdateWorkflowTaskPersistenceInput {
  assignee?: string
  claimSourceAssignee?: string | null
  claimedByUserId?: string | null
  claimedAt?: Date | null
  status?: "todo" | "completed" | "cancelled"
  result?: "approved" | "rejected" | null
  completedAt?: Date | null
}

const DEFAULT_WORKFLOW_DEFINITION_PAGE_SIZE = 20

export async function listWorkflowDefinitions(
  db: DatabaseClient,
  filter: ListWorkflowDefinitionsPersistenceFilter = {},
): Promise<ListWorkflowDefinitionsPersistenceResult> {
  const pagination = normalizePagination(
    filter,
    DEFAULT_WORKFLOW_DEFINITION_PAGE_SIZE,
  )
  const where = buildWorkflowDefinitionWhere(filter)
  const [countRow] = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(workflowDefinitions)
    .where(where)
  const total = countRow?.total ?? 0
  const paginated = buildPaginatedResult([], total, pagination)
  const items = await db
    .select()
    .from(workflowDefinitions)
    .where(where)
    .orderBy(
      asc(workflowDefinitions.key),
      desc(workflowDefinitions.version),
      desc(workflowDefinitions.createdAt),
    )
    .limit(pagination.pageSize)
    .offset((paginated.page - 1) * pagination.pageSize)

  return {
    ...paginated,
    items,
  }
}

const buildWorkflowDefinitionWhere = (
  filter: ListWorkflowDefinitionsPersistenceFilter,
): SQL | undefined => {
  const conditions: SQL[] = []
  const query = filter.q?.trim()

  if (query) {
    const pattern = `%${query}%`
    conditions.push(
      or(
        ilike(workflowDefinitions.name, pattern),
        ilike(workflowDefinitions.key, pattern),
        ilike(workflowDefinitions.id, pattern),
      ) as SQL,
    )
  }

  if (filter.status) {
    conditions.push(eq(workflowDefinitions.status, filter.status))
  }

  return conditions.length > 0 ? and(...conditions) : undefined
}

export async function getWorkflowDefinitionById(
  db: DatabaseClient,
  id: string,
) {
  const rows = await db
    .select()
    .from(workflowDefinitions)
    .where(eq(workflowDefinitions.id, id))
    .limit(1)

  return rows[0] ?? null
}

export async function getLatestWorkflowDefinitionByKey(
  db: DatabaseClient,
  key: string,
) {
  const rows = await db
    .select()
    .from(workflowDefinitions)
    .where(eq(workflowDefinitions.key, key))
    .orderBy(
      desc(workflowDefinitions.version),
      desc(workflowDefinitions.createdAt),
    )
    .limit(1)

  return rows[0] ?? null
}

export async function getNextWorkflowDefinitionVersion(
  db: DatabaseClient,
  key: string,
) {
  const [row] = await db
    .select({
      nextVersion: sql<number>`coalesce(max(${workflowDefinitions.version}), 0) + 1`,
    })
    .from(workflowDefinitions)
    .where(eq(workflowDefinitions.key, key))

  return row?.nextVersion ?? 1
}

export async function insertWorkflowDefinition(
  db: DatabaseClient,
  input: CreateWorkflowDefinitionPersistenceInput,
): Promise<WorkflowDefinitionRow> {
  const [row] = await db
    .insert(workflowDefinitions)
    .values({
      tenantId: input.tenantId,
      key: input.key,
      name: input.name,
      version: input.version,
      status: input.status ?? "active",
      definition: input.definition,
    })
    .returning()

  if (!row) {
    throw new Error("Workflow definition insert did not return a row")
  }

  return row
}

export async function listWorkflowInstances(db: DatabaseClient) {
  return db
    .select()
    .from(workflowInstances)
    .orderBy(desc(workflowInstances.createdAt))
}

export async function getWorkflowInstanceById(db: DatabaseClient, id: string) {
  const rows = await db
    .select()
    .from(workflowInstances)
    .where(eq(workflowInstances.id, id))
    .limit(1)

  return rows[0] ?? null
}

export async function insertWorkflowInstance(
  db: DatabaseClient,
  input: CreateWorkflowInstancePersistenceInput,
): Promise<WorkflowInstanceRow> {
  const [row] = await db
    .insert(workflowInstances)
    .values({
      tenantId: input.tenantId,
      definitionId: input.definitionId,
      definitionKey: input.definitionKey,
      definitionName: input.definitionName,
      definitionVersion: input.definitionVersion,
      status: input.status,
      currentNodeId: input.currentNodeId ?? null,
      variables: input.variables ?? {},
      startedByUserId: input.startedByUserId ?? null,
      completedAt: input.completedAt ?? null,
      terminatedAt: input.terminatedAt ?? null,
    })
    .returning()

  if (!row) {
    throw new Error("Workflow instance insert did not return a row")
  }

  return row
}

export async function insertWorkflowTask(
  db: DatabaseClient,
  input: CreateWorkflowTaskPersistenceInput,
): Promise<WorkflowTaskRow> {
  const [row] = await db
    .insert(workflowTasks)
    .values({
      tenantId: input.tenantId,
      instanceId: input.instanceId,
      definitionId: input.definitionId,
      nodeId: input.nodeId,
      nodeName: input.nodeName,
      assignee: input.assignee,
      status: input.status ?? "todo",
      result: input.result ?? null,
      variables: input.variables ?? {},
      completedAt: input.completedAt ?? null,
    })
    .returning()

  if (!row) {
    throw new Error("Workflow task insert did not return a row")
  }

  return row
}

export async function listWorkflowTodoTasks(
  db: DatabaseClient,
  filter: ListWorkflowTasksPersistenceFilter = {},
) {
  return db
    .select()
    .from(workflowTasks)
    .where(
      and(
        eq(workflowTasks.status, "todo"),
        filter.assignee
          ? eq(workflowTasks.assignee, filter.assignee)
          : undefined,
      ),
    )
    .orderBy(desc(workflowTasks.createdAt))
}

export async function listWorkflowInstanceTodoTasks(
  db: DatabaseClient,
  instanceId: string,
) {
  return db
    .select()
    .from(workflowTasks)
    .where(
      and(
        eq(workflowTasks.instanceId, instanceId),
        eq(workflowTasks.status, "todo"),
      ),
    )
    .orderBy(asc(workflowTasks.createdAt))
}

export async function listWorkflowDoneTasks(
  db: DatabaseClient,
  filter: ListWorkflowTasksPersistenceFilter = {},
) {
  return db
    .select()
    .from(workflowTasks)
    .where(
      and(
        eq(workflowTasks.status, "completed"),
        filter.assignee
          ? eq(workflowTasks.assignee, filter.assignee)
          : undefined,
      ),
    )
    .orderBy(desc(workflowTasks.completedAt), desc(workflowTasks.createdAt))
}

export async function listWorkflowInstanceTasks(
  db: DatabaseClient,
  instanceId: string,
) {
  return db
    .select()
    .from(workflowTasks)
    .where(eq(workflowTasks.instanceId, instanceId))
    .orderBy(asc(workflowTasks.createdAt))
}

export async function getWorkflowTaskById(db: DatabaseClient, id: string) {
  const rows = await db
    .select()
    .from(workflowTasks)
    .where(eq(workflowTasks.id, id))
    .limit(1)

  return rows[0] ?? null
}

export async function updateWorkflowInstance(
  db: DatabaseClient,
  id: string,
  input: UpdateWorkflowInstancePersistenceInput,
) {
  const [row] = await db
    .update(workflowInstances)
    .set({
      status: input.status,
      currentNodeId: input.currentNodeId,
      completedAt: input.completedAt,
      terminatedAt: input.terminatedAt,
      updatedAt: new Date(),
    })
    .where(eq(workflowInstances.id, id))
    .returning()

  return row ?? null
}

export async function updateWorkflowTask(
  db: DatabaseClient,
  id: string,
  input: UpdateWorkflowTaskPersistenceInput,
) {
  const [row] = await db
    .update(workflowTasks)
    .set({
      assignee: input.assignee,
      claimSourceAssignee: input.claimSourceAssignee,
      claimedByUserId: input.claimedByUserId,
      claimedAt: input.claimedAt,
      status: input.status,
      result: input.result,
      completedAt: input.completedAt,
      updatedAt: new Date(),
    })
    .where(eq(workflowTasks.id, id))
    .returning()

  return row ?? null
}

export async function cancelWorkflowInstanceTodoTasks(
  db: DatabaseClient,
  instanceId: string,
) {
  return db
    .update(workflowTasks)
    .set({
      status: "cancelled",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(workflowTasks.instanceId, instanceId),
        eq(workflowTasks.status, "todo"),
      ),
    )
    .returning()
}
