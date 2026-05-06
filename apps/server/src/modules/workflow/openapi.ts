import { t } from "elysia"

const workflowDefinitionStatusSchema = t.Union([
  t.Literal("active"),
  t.Literal("disabled"),
])

const workflowInstanceStatusSchema = t.Union([
  t.Literal("running"),
  t.Literal("completed"),
  t.Literal("terminated"),
])

const workflowTaskStatusSchema = t.Union([
  t.Literal("todo"),
  t.Literal("completed"),
  t.Literal("cancelled"),
])

const workflowTaskResultSchema = t.Union([
  t.Literal("approved"),
  t.Literal("rejected"),
])

const workflowStartNodeSchema = t.Object({
  id: t.String(),
  type: t.Literal("start"),
  name: t.String(),
})

const workflowApprovalNodeSchema = t.Object({
  id: t.String(),
  type: t.Literal("approval"),
  name: t.String(),
  assignee: t.String(),
})

const workflowConditionBranchSchema = t.Object({
  expression: t.String(),
  target: t.String(),
})

const workflowConditionNodeSchema = t.Object({
  id: t.String(),
  type: t.Literal("condition"),
  name: t.String(),
  conditions: t.Array(workflowConditionBranchSchema),
})

const workflowEndNodeSchema = t.Object({
  id: t.String(),
  type: t.Literal("end"),
  name: t.String(),
})

const workflowNodeSchema = t.Union([
  workflowStartNodeSchema,
  workflowApprovalNodeSchema,
  workflowConditionNodeSchema,
  workflowEndNodeSchema,
])

const workflowEdgeSchema = t.Object({
  from: t.String(),
  to: t.String(),
})

const workflowDefinitionDraftSchema = t.Object({
  nodes: t.Array(workflowNodeSchema),
  edges: t.Array(workflowEdgeSchema),
})

export const workflowDefinitionRecordResponseSchema = t.Object({
  id: t.String(),
  key: t.String(),
  name: t.String(),
  version: t.Number(),
  status: workflowDefinitionStatusSchema,
  definition: workflowDefinitionDraftSchema,
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const workflowDefinitionListResponseSchema = t.Object({
  items: t.Array(workflowDefinitionRecordResponseSchema),
  page: t.Number(),
  pageSize: t.Number(),
  total: t.Number(),
  totalPages: t.Number(),
})

export const workflowTaskRecordResponseSchema = t.Object({
  id: t.String(),
  instanceId: t.String(),
  definitionId: t.String(),
  nodeId: t.String(),
  nodeName: t.String(),
  assignee: t.String(),
  claimSourceAssignee: t.Optional(t.String()),
  claimedByUserId: t.Optional(t.String()),
  claimedAt: t.Optional(
    t.String({
      format: "date-time",
    }),
  ),
  status: workflowTaskStatusSchema,
  result: t.Nullable(workflowTaskResultSchema),
  variables: t.Record(t.String(), t.Unknown()),
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
  completedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
})

export const workflowTaskListResponseSchema = t.Object({
  items: t.Array(workflowTaskRecordResponseSchema),
})

export const workflowInstanceRecordResponseSchema = t.Object({
  id: t.String(),
  definitionId: t.String(),
  definitionKey: t.String(),
  definitionName: t.String(),
  definitionVersion: t.Number(),
  status: workflowInstanceStatusSchema,
  currentNodeId: t.Nullable(t.String()),
  variables: t.Record(t.String(), t.Unknown()),
  startedByUserId: t.Nullable(t.String()),
  startedAt: t.String({
    format: "date-time",
  }),
  completedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  terminatedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const workflowInstanceDetailResponseSchema = t.Object({
  ...workflowInstanceRecordResponseSchema.properties,
  currentTasks: t.Array(workflowTaskRecordResponseSchema),
  tasks: t.Array(workflowTaskRecordResponseSchema),
})

export const workflowInstanceListResponseSchema = t.Object({
  items: t.Array(workflowInstanceRecordResponseSchema),
})
