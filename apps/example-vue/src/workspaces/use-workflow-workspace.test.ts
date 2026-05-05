import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { WorkflowDefinitionRecord } from "@elysian/schema"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import { useWorkflowWorkspace } from "./use-workflow-workspace"

const originalFetch = globalThis.fetch

const createWorkflowDefinition = (
  overrides?: Partial<WorkflowDefinitionRecord>,
): WorkflowDefinitionRecord => ({
  createdAt: "2026-05-02T09:00:00.000Z",
  definition: {
    edges: [
      { from: "start-1", to: "approval-1" },
      { from: "approval-1", to: "end-1" },
    ],
    nodes: [
      {
        id: "start-1",
        name: "Start",
        type: "start",
      },
      {
        assignee: "manager",
        id: "approval-1",
        name: "Manager Approval",
        type: "approval",
      },
      {
        id: "end-1",
        name: "End",
        type: "end",
      },
    ],
  },
  id: "workflow-definition-1",
  key: "expense-approval",
  name: "Expense Approval",
  status: "active",
  updatedAt: "2026-05-02T10:00:00.000Z",
  version: 2,
  ...overrides,
})

const createWorkspace = (options?: {
  onRecoverableAuthError?: (error: unknown) => void
}) =>
  useWorkflowWorkspace({
    canView: computed(() => true),
    currentShellTabKey: ref("runtime"),
    describeNode: (node) => `node:${node.name}`,
    locale: ref("zh-CN"),
    localizeNodeType: (type) => `type:${type}`,
    localizeStatus: (status) => `status:${status}`,
    onRecoverableAuthError: options?.onRecoverableAuthError ?? (() => {}),
    t: (key, params) =>
      params
        ? `${key}:${Object.entries(params)
            .map(([name, value]) => `${name}=${String(value)}`)
            .join(",")}`
        : key,
  })

describe("useWorkflowWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("reports recoverable auth errors when loading workflow definitions fails", async () => {
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/workflow/definitions") && method === "GET") {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      if (url.endsWith("/auth/refresh") && method === "POST") {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    workspace.workflowQuery.value = " expense "
    workspace.setWorkflowStatusFilter("active")
    await workspace.reloadWorkflowDefinitions()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.workflowErrorMessage.value).toContain("unauthorized")
    expect(workspace.workflowDefinitions.value).toEqual([])
    expect(workspace.selectedWorkflowDefinition.value).toBeNull()
    expect(workspace.workflowQuery.value).toBe(" expense ")
    expect(workspace.workflowStatusFilter.value).toBe("active")
    expect(workspace.workflowFilterSummary.value).toBe(
      "app.workflow.filter.querySummary:value=expense / app.workflow.filter.statusSummary:value=status:active",
    )
  })

  test("reports recoverable auth errors when loading workflow definition detail fails", async () => {
    const recoverableErrors: unknown[] = []
    const definition = createWorkflowDefinition()

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/workflow/definitions/workflow-definition-1") &&
        method === "GET"
      ) {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      if (url.endsWith("/auth/refresh") && method === "POST") {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await workspace.selectWorkflowDefinition(definition)

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.workflowDetailErrorMessage.value).toContain("unauthorized")
    expect(workspace.selectedWorkflowDefinition.value?.id).toBe(
      "workflow-definition-1",
    )
    expect(workspace.workflowDetailLoading.value).toBe(false)
  })

  test("preserves cached workflow context when reloading definitions fails", async () => {
    const primary = createWorkflowDefinition()
    const archived = createWorkflowDefinition({
      id: "workflow-definition-2",
      key: "expense-approval",
      name: "Expense Approval v1",
      status: "disabled",
      version: 1,
    })
    const recoverableErrors: unknown[] = []
    let failReload = false

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/workflow/definitions/workflow-definition-1") &&
        method === "GET"
      ) {
        return new Response(JSON.stringify(primary), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/workflow/definitions") && method === "GET") {
        if (failReload) {
          return new Response(JSON.stringify({ message: "unavailable" }), {
            headers: { "content-type": "application/json" },
            status: 503,
          })
        }

        return new Response(JSON.stringify({ items: [primary, archived] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await workspace.reloadWorkflowDefinitions()
    workspace.workflowQuery.value = " expense "
    workspace.setWorkflowStatusFilter("active")
    failReload = true

    await workspace.reloadWorkflowDefinitions()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.workflowErrorMessage.value).toContain("unavailable")
    expect(workspace.workflowDefinitions.value).toEqual([primary, archived])
    expect(workspace.selectedWorkflowDefinitionId.value).toBe(
      "workflow-definition-1",
    )
    expect(workspace.selectedWorkflowDefinition.value?.id).toBe(
      "workflow-definition-1",
    )
    expect(workspace.workflowDefinitionDetailCards.value).toHaveLength(3)
    expect(workspace.workflowQuery.value).toBe(" expense ")
    expect(workspace.workflowStatusFilter.value).toBe("active")
  })
})
