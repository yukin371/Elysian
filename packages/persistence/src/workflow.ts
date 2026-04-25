import { and, asc, desc, eq, sql } from "drizzle-orm"

import type { DatabaseClient } from "./client"
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

export interface UpdateWorkflowInstancePersistenceInput {
  status?: "running" | "completed" | "terminated"
  currentNodeId?: string | null
  completedAt?: Date | null
  terminatedAt?: Date | null
}

export interface UpdateWorkflowTaskPersistenceInput {
  status?: "todo" | "completed" | "cancelled"
  result?: "approved" | "rejected" | null
  completedAt?: Date | null
}

export async function listWorkflowDefinitions(db: DatabaseClient) {
  return db
    .select()
    .from(workflowDefinitions)
    .orderBy(
      asc(workflowDefinitions.key),
      desc(workflowDefinitions.version),
      desc(workflowDefinitions.createdAt),
    )
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
