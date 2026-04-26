import type { ModuleSchema, ModuleSchemaValidationIssue } from "./index"

export type WorkflowDefinitionStatus = "active" | "disabled"

export type WorkflowNodeType = "start" | "approval" | "condition" | "end"

export interface WorkflowStartNode {
  id: string
  type: "start"
  name: string
}

export interface WorkflowApprovalNode {
  id: string
  type: "approval"
  name: string
  assignee: string
}

export interface WorkflowConditionBranch {
  expression: string
  target: string
}

export interface WorkflowConditionNode {
  id: string
  type: "condition"
  name: string
  conditions: WorkflowConditionBranch[]
}

export interface WorkflowEndNode {
  id: string
  type: "end"
  name: string
}

export type WorkflowNode =
  | WorkflowStartNode
  | WorkflowApprovalNode
  | WorkflowConditionNode
  | WorkflowEndNode

export type WorkflowConditionExpressionOperator =
  | ">"
  | ">="
  | "<"
  | "<="
  | "=="
  | "!="
  | "==="
  | "!=="

export type WorkflowConditionExpressionLiteral =
  | boolean
  | number
  | string
  | null

export type ParsedWorkflowConditionExpression =
  | {
      kind: "default"
    }
  | {
      kind: "comparison"
      variablePath: string
      operator: WorkflowConditionExpressionOperator
      value: WorkflowConditionExpressionLiteral
    }

export interface WorkflowEdge {
  from: string
  to: string
}

export interface WorkflowDefinitionDraft {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface WorkflowDefinitionRecord {
  id: string
  key: string
  name: string
  version: number
  status: WorkflowDefinitionStatus
  definition: WorkflowDefinitionDraft
  createdAt: string
  updatedAt: string
}

export type WorkflowInstanceStatus = "running" | "completed" | "terminated"

export interface WorkflowInstanceRecord {
  id: string
  definitionId: string
  definitionKey: string
  definitionName: string
  definitionVersion: number
  status: WorkflowInstanceStatus
  currentNodeId: string | null
  variables: Record<string, unknown>
  startedByUserId: string | null
  startedAt: string
  completedAt: string | null
  terminatedAt: string | null
  createdAt: string
  updatedAt: string
}

export type WorkflowTaskStatus = "todo" | "completed" | "cancelled"

export type WorkflowTaskResult = "approved" | "rejected"

export interface WorkflowTaskRecord {
  id: string
  instanceId: string
  definitionId: string
  nodeId: string
  nodeName: string
  assignee: string
  claimSourceAssignee?: string
  claimedByUserId?: string
  claimedAt?: string
  status: WorkflowTaskStatus
  result: WorkflowTaskResult | null
  variables: Record<string, unknown>
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface WorkflowInstanceDetailRecord extends WorkflowInstanceRecord {
  currentTasks: WorkflowTaskRecord[]
  tasks: WorkflowTaskRecord[]
}

const workflowNodeTypes = new Set<WorkflowNodeType>([
  "start",
  "approval",
  "condition",
  "end",
])
const workflowConditionComparisonOperators =
  new Set<WorkflowConditionExpressionOperator>([
    ">",
    ">=",
    "<",
    "<=",
    "==",
    "!=",
    "===",
    "!==",
  ])
const workflowConditionExpressionPattern =
  /^\$\{\s*([A-Za-z_][\w.]*)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+?)\s*\}$/
const workflowNumericLiteralPattern = /^-?\d+(?:\.\d+)?$/

const isRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === "object" && input !== null && !Array.isArray(input)

const isNonEmptyString = (input: unknown): input is string =>
  typeof input === "string" && input.trim().length > 0

const pushIssue = (
  issues: ModuleSchemaValidationIssue[],
  path: string,
  message: string,
) => {
  issues.push({ path, message })
}

const parseWorkflowConditionLiteral = (
  input: string,
): WorkflowConditionExpressionLiteral | undefined => {
  const normalizedInput = input.trim()

  if (normalizedInput === "true") {
    return true
  }

  if (normalizedInput === "false") {
    return false
  }

  if (normalizedInput === "null") {
    return null
  }

  if (workflowNumericLiteralPattern.test(normalizedInput)) {
    return Number(normalizedInput)
  }

  if (
    normalizedInput.startsWith('"') &&
    normalizedInput.endsWith('"') &&
    normalizedInput.length >= 2
  ) {
    try {
      const parsed = JSON.parse(normalizedInput) as unknown
      return typeof parsed === "string" ? parsed : undefined
    } catch {
      return undefined
    }
  }

  return undefined
}

export const parseWorkflowConditionExpression = (
  input: string,
): ParsedWorkflowConditionExpression | undefined => {
  const normalizedInput = input.trim()

  if (normalizedInput === "default") {
    return { kind: "default" }
  }

  const match = workflowConditionExpressionPattern.exec(normalizedInput)

  if (!match) {
    return undefined
  }

  const [, variablePath, operator, literalSource] = match

  if (
    !variablePath ||
    !operator ||
    !literalSource ||
    !workflowConditionComparisonOperators.has(
      operator as WorkflowConditionExpressionOperator,
    )
  ) {
    return undefined
  }

  const value = parseWorkflowConditionLiteral(literalSource)

  if (value === undefined) {
    return undefined
  }

  return {
    kind: "comparison",
    variablePath,
    operator: operator as WorkflowConditionExpressionOperator,
    value,
  }
}

export const validateWorkflowDefinitionDraft = (
  input: unknown,
): ModuleSchemaValidationIssue[] => {
  const issues: ModuleSchemaValidationIssue[] = []

  if (!isRecord(input)) {
    return [
      {
        path: "$",
        message: "Workflow definition draft must be a JSON object.",
      },
    ]
  }

  const nodes = input.nodes
  const edges = input.edges

  if (!Array.isArray(nodes) || nodes.length === 0) {
    pushIssue(issues, "nodes", "Workflow nodes must be a non-empty array.")
  }

  if (!Array.isArray(edges) || edges.length === 0) {
    pushIssue(issues, "edges", "Workflow edges must be a non-empty array.")
  }

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return issues
  }

  const nodeIds = new Set<string>()
  const incomingEdgeCount = new Map<string, number>()
  const outgoingEdgeCount = new Map<string, number>()
  let startNodeCount = 0
  let endNodeCount = 0

  for (const [index, node] of nodes.entries()) {
    const nodePath = `nodes[${index}]`

    if (!isRecord(node)) {
      pushIssue(issues, nodePath, "Workflow node must be an object.")
      continue
    }

    if (!isNonEmptyString(node.id)) {
      pushIssue(
        issues,
        `${nodePath}.id`,
        "Workflow node id must be a non-empty string.",
      )
    } else if (nodeIds.has(node.id)) {
      pushIssue(
        issues,
        `${nodePath}.id`,
        `Workflow node id "${node.id}" is duplicated.`,
      )
    } else {
      nodeIds.add(node.id)
    }

    if (!isNonEmptyString(node.name)) {
      pushIssue(
        issues,
        `${nodePath}.name`,
        "Workflow node name must be a non-empty string.",
      )
    }

    if (
      typeof node.type !== "string" ||
      !workflowNodeTypes.has(node.type as WorkflowNodeType)
    ) {
      pushIssue(
        issues,
        `${nodePath}.type`,
        "Workflow node type must be one of: start, approval, condition, end.",
      )
      continue
    }

    switch (node.type) {
      case "start":
        startNodeCount += 1
        break
      case "approval":
        if (!isNonEmptyString(node.assignee)) {
          pushIssue(
            issues,
            `${nodePath}.assignee`,
            "Approval node assignee must be a non-empty string.",
          )
        }
        break
      case "condition": {
        if (!Array.isArray(node.conditions) || node.conditions.length === 0) {
          pushIssue(
            issues,
            `${nodePath}.conditions`,
            "Condition node must provide at least one branch condition.",
          )
          break
        }

        let defaultCount = 0

        for (const [conditionIndex, condition] of node.conditions.entries()) {
          const conditionPath = `${nodePath}.conditions[${conditionIndex}]`

          if (!isRecord(condition)) {
            pushIssue(
              issues,
              conditionPath,
              "Condition branch must be an object.",
            )
            continue
          }

          if (!isNonEmptyString(condition.expression)) {
            pushIssue(
              issues,
              `${conditionPath}.expression`,
              "Condition branch expression must be a non-empty string.",
            )
          } else {
            const parsedExpression = parseWorkflowConditionExpression(
              condition.expression,
            )

            if (!parsedExpression) {
              pushIssue(
                issues,
                `${conditionPath}.expression`,
                'Condition branch expression must be "default" or a comparison like ${amount > 5000}.',
              )
            } else if (parsedExpression.kind === "default") {
              defaultCount += 1
            }
          }

          if (!isNonEmptyString(condition.target)) {
            pushIssue(
              issues,
              `${conditionPath}.target`,
              "Condition branch target must be a non-empty string.",
            )
          }
        }

        if (defaultCount !== 1) {
          pushIssue(
            issues,
            `${nodePath}.conditions`,
            'Condition node must provide exactly one "default" branch.',
          )
        }
        break
      }
      case "end":
        endNodeCount += 1
        break
    }
  }

  if (startNodeCount !== 1) {
    pushIssue(
      issues,
      "nodes",
      'Workflow definition must contain exactly one "start" node.',
    )
  }

  if (endNodeCount === 0) {
    pushIssue(
      issues,
      "nodes",
      'Workflow definition must contain at least one "end" node.',
    )
  }

  const edgePairs = new Set<string>()

  for (const [index, edge] of edges.entries()) {
    const edgePath = `edges[${index}]`

    if (!isRecord(edge)) {
      pushIssue(issues, edgePath, "Workflow edge must be an object.")
      continue
    }

    if (!isNonEmptyString(edge.from)) {
      pushIssue(
        issues,
        `${edgePath}.from`,
        "Workflow edge source must be a non-empty string.",
      )
    }

    if (!isNonEmptyString(edge.to)) {
      pushIssue(
        issues,
        `${edgePath}.to`,
        "Workflow edge target must be a non-empty string.",
      )
    }

    if (!isNonEmptyString(edge.from) || !isNonEmptyString(edge.to)) {
      continue
    }

    if (!nodeIds.has(edge.from)) {
      pushIssue(
        issues,
        `${edgePath}.from`,
        `Workflow edge source "${edge.from}" does not match any node id.`,
      )
    }

    if (!nodeIds.has(edge.to)) {
      pushIssue(
        issues,
        `${edgePath}.to`,
        `Workflow edge target "${edge.to}" does not match any node id.`,
      )
    }

    const edgeKey = `${edge.from}->${edge.to}`
    if (edgePairs.has(edgeKey)) {
      pushIssue(issues, edgePath, `Workflow edge "${edgeKey}" is duplicated.`)
    } else {
      edgePairs.add(edgeKey)
    }

    outgoingEdgeCount.set(
      edge.from,
      (outgoingEdgeCount.get(edge.from) ?? 0) + 1,
    )
    incomingEdgeCount.set(edge.to, (incomingEdgeCount.get(edge.to) ?? 0) + 1)
  }

  for (const [index, node] of nodes.entries()) {
    if (
      !isRecord(node) ||
      !isNonEmptyString(node.id) ||
      typeof node.type !== "string"
    ) {
      continue
    }

    if (node.type === "start" && (incomingEdgeCount.get(node.id) ?? 0) > 0) {
      pushIssue(
        issues,
        `nodes[${index}]`,
        "Start node must not have incoming edges.",
      )
    }

    if (node.type === "end" && (outgoingEdgeCount.get(node.id) ?? 0) > 0) {
      pushIssue(
        issues,
        `nodes[${index}]`,
        "End node must not have outgoing edges.",
      )
    }

    if (node.type !== "end" && (outgoingEdgeCount.get(node.id) ?? 0) === 0) {
      pushIssue(
        issues,
        `nodes[${index}]`,
        `Workflow node "${node.id}" must have at least one outgoing edge.`,
      )
    }

    if (node.type !== "start" && (incomingEdgeCount.get(node.id) ?? 0) === 0) {
      pushIssue(
        issues,
        `nodes[${index}]`,
        `Workflow node "${node.id}" must have at least one incoming edge.`,
      )
    }

    if (node.type === "condition" && Array.isArray(node.conditions)) {
      const outgoingTargets = new Set(
        edges
          .filter((edge) => edge.from === node.id && isNonEmptyString(edge.to))
          .map((edge) => edge.to),
      )

      for (const [conditionIndex, condition] of node.conditions.entries()) {
        if (!isRecord(condition) || !isNonEmptyString(condition.target)) {
          continue
        }

        if (!nodeIds.has(condition.target)) {
          pushIssue(
            issues,
            `nodes[${index}].conditions[${conditionIndex}].target`,
            `Condition branch target "${condition.target}" does not match any node id.`,
          )
        }

        if (!outgoingTargets.has(condition.target)) {
          pushIssue(
            issues,
            `nodes[${index}].conditions[${conditionIndex}].target`,
            `Condition branch target "${condition.target}" must also exist as an outgoing edge.`,
          )
        }
      }

      if (outgoingTargets.size !== node.conditions.length) {
        pushIssue(
          issues,
          `nodes[${index}]`,
          "Condition node outgoing edges must match condition branch targets one-to-one.",
        )
      }
    }
  }

  return issues
}

export const workflowModuleSchema: ModuleSchema = {
  name: "workflow-definition",
  label: "Workflow Definition",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    {
      key: "key",
      label: "Key",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "name",
      label: "Name",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "version",
      label: "Version",
      kind: "number",
      required: true,
      searchable: true,
    },
    {
      key: "status",
      label: "Status",
      kind: "enum",
      required: true,
      searchable: true,
      options: [
        { label: "active", value: "active" },
        { label: "disabled", value: "disabled" },
      ],
    },
    { key: "createdAt", label: "Created At", kind: "datetime", required: true },
    { key: "updatedAt", label: "Updated At", kind: "datetime", required: true },
  ],
}
