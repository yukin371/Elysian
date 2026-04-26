import { describe, expect, it } from "bun:test"

import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"

import type { DatabaseClient } from "./client"
import { insertTenant } from "./tenant"
import {
  cancelWorkflowInstanceTodoTasks,
  getNextWorkflowDefinitionVersion,
  getWorkflowTaskById,
  insertWorkflowDefinition,
  insertWorkflowInstance,
  insertWorkflowTask,
  listWorkflowDoneTasks,
  listWorkflowInstanceTasks,
  listWorkflowInstanceTodoTasks,
  listWorkflowTodoTasks,
  updateWorkflowTask,
} from "./workflow"

const tenantAlphaId = "00000000-0000-0000-0000-000000000001"
const tenantBetaId = "00000000-0000-0000-0000-000000000002"

describe("workflow persistence", () => {
  it("enforces definition version uniqueness per tenant while allowing the same version across tenants", async () => {
    await withWorkflowTestDb(async ({ db }) => {
      await insertWorkflowDefinition(db, {
        tenantId: tenantAlphaId,
        key: "expense-approval",
        name: "Expense Approval",
        version: 1,
        definition: {},
      })

      await expect(
        insertWorkflowDefinition(db, {
          tenantId: tenantAlphaId,
          key: "expense-approval",
          name: "Expense Approval Duplicate",
          version: 1,
          definition: {},
        }),
      ).rejects.toThrow(/Failed query: insert into "workflow_definitions"/)

      const tenantBetaDefinition = await insertWorkflowDefinition(db, {
        tenantId: tenantBetaId,
        key: "expense-approval",
        name: "Expense Approval Beta",
        version: 1,
        definition: {},
      })

      expect(tenantBetaDefinition.version).toBe(1)
      expect(tenantBetaDefinition.tenantId).toBe(tenantBetaId)
    })
  })

  it("derives the next definition version from the currently visible key scope", async () => {
    await withWorkflowTestDb(async ({ db }) => {
      expect(
        await getNextWorkflowDefinitionVersion(db, "expense-approval"),
      ).toBe(1)

      await insertWorkflowDefinition(db, {
        tenantId: tenantAlphaId,
        key: "expense-approval",
        name: "Expense Approval v1",
        version: 1,
        definition: {},
      })
      await insertWorkflowDefinition(db, {
        tenantId: tenantAlphaId,
        key: "expense-approval",
        name: "Expense Approval v2",
        version: 2,
        definition: {},
      })
      await insertWorkflowDefinition(db, {
        tenantId: tenantAlphaId,
        key: "purchase-approval",
        name: "Purchase Approval v1",
        version: 1,
        definition: {},
      })

      expect(
        await getNextWorkflowDefinitionVersion(db, "expense-approval"),
      ).toBe(3)
      expect(
        await getNextWorkflowDefinitionVersion(db, "purchase-approval"),
      ).toBe(2)
      expect(await getNextWorkflowDefinitionVersion(db, "asset-approval")).toBe(
        1,
      )
    })
  })

  it("lists todo and done tasks by assignee with the expected status boundaries and sort order", async () => {
    await withWorkflowTestDb(async ({ db, client }) => {
      const definition = await insertWorkflowDefinition(db, {
        tenantId: tenantAlphaId,
        key: "expense-approval",
        name: "Expense Approval",
        version: 1,
        definition: {},
      })
      const instance = await insertWorkflowInstance(db, {
        tenantId: tenantAlphaId,
        definitionId: definition.id,
        definitionKey: definition.key,
        definitionName: definition.name,
        definitionVersion: definition.version,
        status: "running",
        currentNodeId: "manager-review",
        variables: {},
        startedByUserId: null,
      })

      const olderTodo = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: instance.id,
        definitionId: definition.id,
        nodeId: "manager-review-1",
        nodeName: "Manager Review 1",
        assignee: "role:manager",
      })
      const newerTodo = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: instance.id,
        definitionId: definition.id,
        nodeId: "manager-review-2",
        nodeName: "Manager Review 2",
        assignee: "role:manager",
      })
      const olderDone = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: instance.id,
        definitionId: definition.id,
        nodeId: "finance-review-1",
        nodeName: "Finance Review 1",
        assignee: "role:manager",
        status: "completed",
        result: "approved",
        completedAt: new Date("2026-04-26T09:00:00.000Z"),
      })
      const newerDone = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: instance.id,
        definitionId: definition.id,
        nodeId: "finance-review-2",
        nodeName: "Finance Review 2",
        assignee: "role:manager",
        status: "completed",
        result: "rejected",
        completedAt: new Date("2026-04-26T10:00:00.000Z"),
      })
      await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: instance.id,
        definitionId: definition.id,
        nodeId: "finance-review-3",
        nodeName: "Finance Review 3",
        assignee: "role:finance",
        status: "completed",
        result: "approved",
        completedAt: new Date("2026-04-26T11:00:00.000Z"),
      })
      await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: instance.id,
        definitionId: definition.id,
        nodeId: "manager-review-cancelled",
        nodeName: "Cancelled Task",
        assignee: "role:manager",
        status: "cancelled",
      })

      await setTaskCreatedAt(client, olderTodo.id, "2026-04-26T08:00:00.000Z")
      await setTaskCreatedAt(client, newerTodo.id, "2026-04-26T09:00:00.000Z")
      await setTaskCreatedAt(client, olderDone.id, "2026-04-26T07:00:00.000Z")
      await setTaskCreatedAt(client, newerDone.id, "2026-04-26T08:30:00.000Z")

      const todoTasks = await listWorkflowTodoTasks(db, {
        assignee: "role:manager",
      })
      const doneTasks = await listWorkflowDoneTasks(db, {
        assignee: "role:manager",
      })

      expect(todoTasks.map((task) => task.id)).toEqual([
        newerTodo.id,
        olderTodo.id,
      ])
      expect(todoTasks.every((task) => task.status === "todo")).toBe(true)
      expect(doneTasks.map((task) => task.id)).toEqual([
        newerDone.id,
        olderDone.id,
      ])
      expect(doneTasks.map((task) => task.result)).toEqual([
        "rejected",
        "approved",
      ])
    })
  })

  it("lists instance tasks in ascending creation order and keeps todo filtering separate", async () => {
    await withWorkflowTestDb(async ({ db, client }) => {
      const definition = await insertWorkflowDefinition(db, {
        tenantId: tenantAlphaId,
        key: "expense-approval",
        name: "Expense Approval",
        version: 1,
        definition: {},
      })
      const instance = await insertWorkflowInstance(db, {
        tenantId: tenantAlphaId,
        definitionId: definition.id,
        definitionKey: definition.key,
        definitionName: definition.name,
        definitionVersion: definition.version,
        status: "running",
        currentNodeId: "manager-review",
        variables: {},
        startedByUserId: null,
      })

      const firstTask = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: instance.id,
        definitionId: definition.id,
        nodeId: "start-review",
        nodeName: "Start Review",
        assignee: "role:manager",
      })
      const secondTask = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: instance.id,
        definitionId: definition.id,
        nodeId: "finance-review",
        nodeName: "Finance Review",
        assignee: "role:finance",
        status: "completed",
        result: "approved",
        completedAt: new Date("2026-04-26T09:30:00.000Z"),
      })
      const thirdTask = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: instance.id,
        definitionId: definition.id,
        nodeId: "director-review",
        nodeName: "Director Review",
        assignee: "role:director",
      })

      await setTaskCreatedAt(client, firstTask.id, "2026-04-26T08:00:00.000Z")
      await setTaskCreatedAt(client, secondTask.id, "2026-04-26T09:00:00.000Z")
      await setTaskCreatedAt(client, thirdTask.id, "2026-04-26T10:00:00.000Z")

      const todoTasks = await listWorkflowInstanceTodoTasks(db, instance.id)
      const allTasks = await listWorkflowInstanceTasks(db, instance.id)

      expect(todoTasks.map((task) => task.id)).toEqual([
        firstTask.id,
        thirdTask.id,
      ])
      expect(allTasks.map((task) => task.id)).toEqual([
        firstTask.id,
        secondTask.id,
        thirdTask.id,
      ])
    })
  })

  it("cancels only todo tasks for the targeted instance", async () => {
    await withWorkflowTestDb(async ({ db }) => {
      const definition = await insertWorkflowDefinition(db, {
        tenantId: tenantAlphaId,
        key: "expense-approval",
        name: "Expense Approval",
        version: 1,
        definition: {},
      })
      const targetInstance = await insertWorkflowInstance(db, {
        tenantId: tenantAlphaId,
        definitionId: definition.id,
        definitionKey: definition.key,
        definitionName: definition.name,
        definitionVersion: definition.version,
        status: "running",
        currentNodeId: "manager-review",
        variables: {},
        startedByUserId: null,
      })
      const otherInstance = await insertWorkflowInstance(db, {
        tenantId: tenantAlphaId,
        definitionId: definition.id,
        definitionKey: definition.key,
        definitionName: definition.name,
        definitionVersion: definition.version,
        status: "running",
        currentNodeId: "finance-review",
        variables: {},
        startedByUserId: null,
      })

      const targetTodoA = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: targetInstance.id,
        definitionId: definition.id,
        nodeId: "manager-review-a",
        nodeName: "Manager Review A",
        assignee: "role:manager",
      })
      const targetTodoB = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: targetInstance.id,
        definitionId: definition.id,
        nodeId: "manager-review-b",
        nodeName: "Manager Review B",
        assignee: "role:manager",
      })
      const targetDone = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: targetInstance.id,
        definitionId: definition.id,
        nodeId: "finance-review",
        nodeName: "Finance Review",
        assignee: "role:finance",
        status: "completed",
        result: "approved",
        completedAt: new Date("2026-04-26T10:00:00.000Z"),
      })
      const otherInstanceTodo = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: otherInstance.id,
        definitionId: definition.id,
        nodeId: "director-review",
        nodeName: "Director Review",
        assignee: "role:director",
      })

      const cancelledTasks = await cancelWorkflowInstanceTodoTasks(
        db,
        targetInstance.id,
      )

      expect(cancelledTasks.map((task) => task.id).sort()).toEqual(
        [targetTodoA.id, targetTodoB.id].sort(),
      )
      expect(cancelledTasks.every((task) => task.status === "cancelled")).toBe(
        true,
      )
      expect((await getWorkflowTaskById(db, targetDone.id))?.status).toBe(
        "completed",
      )
      expect(
        (await getWorkflowTaskById(db, otherInstanceTodo.id))?.status,
      ).toBe("todo")
    })
  })

  it("updates todo task assignee without moving it across status buckets", async () => {
    await withWorkflowTestDb(async ({ db }) => {
      const claimedByUserId = "11111111-1111-4111-8111-111111111111"
      const definition = await insertWorkflowDefinition(db, {
        tenantId: tenantAlphaId,
        key: "expense-approval",
        name: "Expense Approval",
        version: 1,
        definition: {},
      })
      const instance = await insertWorkflowInstance(db, {
        tenantId: tenantAlphaId,
        definitionId: definition.id,
        definitionKey: definition.key,
        definitionName: definition.name,
        definitionVersion: definition.version,
        status: "running",
        currentNodeId: "manager-review",
        variables: {},
        startedByUserId: null,
      })
      const task = await insertWorkflowTask(db, {
        tenantId: tenantAlphaId,
        instanceId: instance.id,
        definitionId: definition.id,
        nodeId: "manager-review",
        nodeName: "Manager Review",
        assignee: "role:manager",
      })

      const updatedTask = await updateWorkflowTask(db, task.id, {
        assignee: "user:reviewer-1",
        claimSourceAssignee: "role:manager",
        claimedByUserId,
        claimedAt: new Date("2026-04-26T10:00:00.000Z"),
      })

      expect(updatedTask?.assignee).toBe("user:reviewer-1")
      expect(updatedTask?.claimSourceAssignee).toBe("role:manager")
      expect(updatedTask?.claimedByUserId).toBe(claimedByUserId)
      expect(updatedTask?.claimedAt?.toISOString()).toBe(
        "2026-04-26T10:00:00.000Z",
      )
      expect(updatedTask?.status).toBe("todo")
      expect(
        await listWorkflowTodoTasks(db, {
          assignee: "role:manager",
        }),
      ).toHaveLength(0)
      expect(
        (
          await listWorkflowTodoTasks(db, {
            assignee: "user:reviewer-1",
          })
        )[0]?.id,
      ).toBe(task.id)
      expect(
        await listWorkflowDoneTasks(db, {
          assignee: "user:reviewer-1",
        }),
      ).toHaveLength(0)
    })
  })
})

async function createWorkflowTestDb() {
  const client = new PGlite()

  await client.exec(workflowTestSchemaSql)

  const db = drizzle(client) as unknown as DatabaseClient

  await insertTenant(db, {
    id: tenantAlphaId,
    code: "tenant-alpha",
    name: "Tenant Alpha",
  })
  await insertTenant(db, {
    id: tenantBetaId,
    code: "tenant-beta",
    name: "Tenant Beta",
  })

  return { client, db }
}

async function withWorkflowTestDb(
  run: (
    context: Awaited<ReturnType<typeof createWorkflowTestDb>>,
  ) => Promise<void>,
) {
  const context = await createWorkflowTestDb()

  try {
    await run(context)
  } finally {
    await context.client.close()
  }
}

async function setTaskCreatedAt(
  client: PGlite,
  taskId: string,
  createdAtIso: string,
) {
  await client.exec(
    `update workflow_tasks set created_at = '${createdAtIso}'::timestamptz where id = '${taskId}'`,
  )
}

// PGlite does not ship pgcrypto, so tests provide a local uuid generator.
const workflowTestSchemaSql = `
create function gen_random_uuid() returns uuid language sql as $$
  select (
    substr(md5(random()::text || clock_timestamp()::text), 1, 8) || '-' ||
    substr(md5(random()::text || clock_timestamp()::text), 1, 4) || '-' ||
    '4' || substr(md5(random()::text || clock_timestamp()::text), 1, 3) || '-' ||
    substr('89ab', floor(random() * 4 + 1)::int, 1) || substr(md5(random()::text || clock_timestamp()::text), 1, 3) || '-' ||
    substr(md5(random()::text || clock_timestamp()::text), 1, 12)
  )::uuid;
$$;

create type tenant_status as enum ('active', 'suspended');
create type workflow_definition_status as enum ('active', 'disabled');
create type workflow_instance_status as enum ('running', 'completed', 'terminated');
create type workflow_task_status as enum ('todo', 'completed', 'cancelled');
create type workflow_task_result as enum ('approved', 'rejected');

create table tenants (
  id uuid primary key default gen_random_uuid() not null,
  code text not null unique,
  name text not null,
  status tenant_status not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table workflow_definitions (
  id uuid primary key default gen_random_uuid() not null,
  tenant_id uuid not null references tenants(id) on delete restrict,
  key text not null,
  name text not null,
  version integer not null,
  status workflow_definition_status not null default 'active',
  definition jsonb not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint workflow_definitions_tenant_key_version_unique unique (tenant_id, key, version)
);

create table workflow_instances (
  id uuid primary key default gen_random_uuid() not null,
  tenant_id uuid not null references tenants(id) on delete restrict,
  definition_id uuid not null references workflow_definitions(id) on delete restrict,
  definition_key text not null,
  definition_name text not null,
  definition_version integer not null,
  status workflow_instance_status not null default 'running',
  current_node_id text,
  variables jsonb not null default '{}'::jsonb,
  started_by_user_id uuid,
  started_at timestamp with time zone not null default now(),
  completed_at timestamp with time zone,
  terminated_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table workflow_tasks (
  id uuid primary key default gen_random_uuid() not null,
  tenant_id uuid not null references tenants(id) on delete restrict,
  instance_id uuid not null references workflow_instances(id) on delete cascade,
  definition_id uuid not null references workflow_definitions(id) on delete restrict,
  node_id text not null,
  node_name text not null,
  assignee text not null,
  claim_source_assignee text,
  claimed_by_user_id uuid,
  claimed_at timestamp with time zone,
  status workflow_task_status not null default 'todo',
  result workflow_task_result,
  variables jsonb not null default '{}'::jsonb,
  completed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
`
