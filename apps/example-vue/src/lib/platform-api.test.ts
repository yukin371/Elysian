import { afterEach, describe, expect, test } from "bun:test"

import type { WorkflowDefinitionRecord } from "@elysian/schema"

import {
  fetchWorkflowDefinitionById,
  fetchWorkflowDefinitions,
} from "./platform-api"

const workflowOverrides: WorkflowDefinitionRecord[] = [
  {
    id: "workflow_definition_expense_v1",
    key: "expense-approval",
    name: "Expense Approval",
    version: 1,
    status: "active",
    definition: {
      nodes: [
        { id: "start", type: "start", name: "Start" },
        {
          id: "manager-review",
          type: "approval",
          name: "Manager Review",
          assignee: "role:manager",
        },
        { id: "approved", type: "end", name: "Approved" },
      ],
      edges: [
        { from: "start", to: "manager-review" },
        { from: "manager-review", to: "approved" },
      ],
    },
    createdAt: "2026-04-21T02:00:00.000Z",
    updatedAt: "2026-04-21T02:00:00.000Z",
  },
  {
    id: "workflow_definition_expense_v2",
    key: "expense-approval",
    name: "Expense Approval",
    version: 2,
    status: "active",
    definition: {
      nodes: [
        { id: "start", type: "start", name: "Start" },
        {
          id: "manager-review",
          type: "approval",
          name: "Manager Review",
          assignee: "role:manager",
        },
        {
          id: "finance-review",
          type: "approval",
          name: "Finance Review",
          assignee: "role:finance",
        },
        { id: "approved", type: "end", name: "Approved" },
      ],
      edges: [
        { from: "start", to: "manager-review" },
        { from: "manager-review", to: "finance-review" },
        { from: "finance-review", to: "approved" },
      ],
    },
    createdAt: "2026-04-23T12:00:00.000Z",
    updatedAt: "2026-04-23T12:30:00.000Z",
  },
]

afterEach(() => {
  globalThis.__ELYSIAN_EXAMPLE_API_OVERRIDES__ = undefined
})

describe("platform api workflow overrides", () => {
  test("returns workflow definitions from browser overrides when present", async () => {
    globalThis.__ELYSIAN_EXAMPLE_API_OVERRIDES__ = {
      workflowDefinitions: workflowOverrides,
    }

    await expect(fetchWorkflowDefinitions()).resolves.toEqual({
      items: workflowOverrides,
    })
  })

  test("returns workflow definition detail from browser overrides when present", async () => {
    globalThis.__ELYSIAN_EXAMPLE_API_OVERRIDES__ = {
      workflowDefinitions: workflowOverrides,
    }
    const expectedDefinition = workflowOverrides.find(
      (definition) => definition.id === "workflow_definition_expense_v2",
    )

    if (!expectedDefinition) {
      throw new Error("Missing workflow_definition_expense_v2 test fixture")
    }

    await expect(
      fetchWorkflowDefinitionById("workflow_definition_expense_v2"),
    ).resolves.toEqual(expectedDefinition)
  })
})
