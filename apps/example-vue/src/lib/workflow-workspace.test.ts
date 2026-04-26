import { describe, expect, test } from "bun:test"

import type { WorkflowDefinitionRecord } from "@elysian/schema"

import {
  filterWorkflowDefinitions,
  listWorkflowDefinitionVersions,
  resolveWorkflowDefinitionSelection,
} from "./workflow-workspace"

const createWorkflowDefinition = (
  overrides: Partial<WorkflowDefinitionRecord> &
    Pick<WorkflowDefinitionRecord, "id">,
): WorkflowDefinitionRecord => ({
  id: overrides.id,
  key: overrides.key ?? overrides.id,
  name: overrides.name ?? overrides.id,
  version: overrides.version ?? 1,
  status: overrides.status ?? "active",
  definition: overrides.definition ?? {
    nodes: [
      {
        id: "start",
        type: "start",
        name: "Start",
      },
      {
        id: "end",
        type: "end",
        name: "End",
      },
    ],
    edges: [
      {
        from: "start",
        to: "end",
      },
    ],
  },
  createdAt: overrides.createdAt ?? "2026-04-20T08:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-20T08:00:00.000Z",
})

describe("workflow workspace helpers", () => {
  const definitions = [
    createWorkflowDefinition({
      id: "workflow_definition_expense_v1",
      key: "expense-approval",
      name: "Expense Approval",
      version: 1,
      updatedAt: "2026-04-21T10:00:00.000Z",
    }),
    createWorkflowDefinition({
      id: "workflow_definition_expense_v2",
      key: "expense-approval",
      name: "Expense Approval",
      version: 2,
      updatedAt: "2026-04-23T12:30:00.000Z",
    }),
    createWorkflowDefinition({
      id: "workflow_definition_condition_v1",
      key: "expense-approval-condition",
      name: "Expense Approval Condition",
      version: 1,
      status: "disabled",
      updatedAt: "2026-04-21T10:05:00.000Z",
    }),
  ]

  test("filters workflow definitions by query across name, key, and id", () => {
    expect(
      filterWorkflowDefinitions(definitions, "condition", "all").map(
        (definition) => definition.id,
      ),
    ).toEqual(["workflow_definition_condition_v1"])

    expect(
      filterWorkflowDefinitions(definitions, "expense-approval", "all").map(
        (definition) => definition.id,
      ),
    ).toEqual([
      "workflow_definition_expense_v1",
      "workflow_definition_expense_v2",
      "workflow_definition_condition_v1",
    ])

    expect(
      filterWorkflowDefinitions(definitions, "expense_v2", "all").map(
        (definition) => definition.id,
      ),
    ).toEqual(["workflow_definition_expense_v2"])
  })

  test("filters workflow definitions by status", () => {
    expect(
      filterWorkflowDefinitions(definitions, "", "active").map(
        (definition) => definition.id,
      ),
    ).toEqual([
      "workflow_definition_expense_v1",
      "workflow_definition_expense_v2",
    ])

    expect(
      filterWorkflowDefinitions(definitions, "", "disabled").map(
        (definition) => definition.id,
      ),
    ).toEqual(["workflow_definition_condition_v1"])
  })

  test("lists version history for the selected workflow key in descending order", () => {
    expect(
      listWorkflowDefinitionVersions(definitions, "expense-approval").map(
        (definition) => definition.id,
      ),
    ).toEqual([
      "workflow_definition_expense_v2",
      "workflow_definition_expense_v1",
    ])

    expect(listWorkflowDefinitionVersions(definitions, null)).toEqual([])
  })

  test("resolves workflow selection against the currently visible list", () => {
    expect(
      resolveWorkflowDefinitionSelection(
        definitions,
        "workflow_definition_expense_v2",
      ),
    ).toBe("workflow_definition_expense_v2")

    expect(
      resolveWorkflowDefinitionSelection(
        definitions.filter((definition) => definition.status === "disabled"),
        "workflow_definition_expense_v2",
      ),
    ).toBe("workflow_definition_condition_v1")

    expect(resolveWorkflowDefinitionSelection([], null)).toBeNull()
  })
})
