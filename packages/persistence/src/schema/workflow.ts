import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { tenants } from "./tenant"

export const workflowDefinitionStatus = pgEnum("workflow_definition_status", [
  "active",
  "disabled",
])

export const workflowInstanceStatus = pgEnum("workflow_instance_status", [
  "running",
  "completed",
  "terminated",
])

export const workflowTaskStatus = pgEnum("workflow_task_status", [
  "todo",
  "completed",
  "cancelled",
])

export const workflowTaskResult = pgEnum("workflow_task_result", [
  "approved",
  "rejected",
])

export const workflowDefinitions = pgTable(
  "workflow_definitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    key: text("key").notNull(),
    name: text("name").notNull(),
    version: integer("version").notNull(),
    status: workflowDefinitionStatus("status").notNull().default("active"),
    definition: jsonb("definition").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    workflowDefinitionsTenantKeyVersionUnique: unique(
      "workflow_definitions_tenant_key_version_unique",
    ).on(table.tenantId, table.key, table.version),
  }),
)

export const workflowInstances = pgTable("workflow_instances", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "restrict" }),
  definitionId: uuid("definition_id")
    .notNull()
    .references(() => workflowDefinitions.id, { onDelete: "restrict" }),
  definitionKey: text("definition_key").notNull(),
  definitionName: text("definition_name").notNull(),
  definitionVersion: integer("definition_version").notNull(),
  status: workflowInstanceStatus("status").notNull().default("running"),
  currentNodeId: text("current_node_id"),
  variables: jsonb("variables").$type<Record<string, unknown>>().notNull(),
  startedByUserId: uuid("started_by_user_id"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  terminatedAt: timestamp("terminated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const workflowTasks = pgTable("workflow_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "restrict" }),
  instanceId: uuid("instance_id")
    .notNull()
    .references(() => workflowInstances.id, { onDelete: "cascade" }),
  definitionId: uuid("definition_id")
    .notNull()
    .references(() => workflowDefinitions.id, { onDelete: "restrict" }),
  nodeId: text("node_id").notNull(),
  nodeName: text("node_name").notNull(),
  assignee: text("assignee").notNull(),
  claimSourceAssignee: text("claim_source_assignee"),
  claimedByUserId: uuid("claimed_by_user_id"),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  status: workflowTaskStatus("status").notNull().default("todo"),
  result: workflowTaskResult("result"),
  variables: jsonb("variables").$type<Record<string, unknown>>().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type WorkflowDefinitionRow = InferSelectModel<typeof workflowDefinitions>
export type NewWorkflowDefinitionRow = InferInsertModel<
  typeof workflowDefinitions
>
export type WorkflowInstanceRow = InferSelectModel<typeof workflowInstances>
export type NewWorkflowInstanceRow = InferInsertModel<typeof workflowInstances>
export type WorkflowTaskRow = InferSelectModel<typeof workflowTasks>
export type NewWorkflowTaskRow = InferInsertModel<typeof workflowTasks>
