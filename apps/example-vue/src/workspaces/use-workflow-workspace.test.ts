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
    currentShellTabKey: ref("workspace"),
    locale: ref("zh-CN"),
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

      if (url.includes("/workflow/definitions") && method === "GET") {
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
    await workspace.reloadWorkflowDefinitions()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.workflowErrorMessage.value).toContain("unauthorized")
    expect(workspace.workflowDefinitions.value).toEqual([])
    expect(workspace.selectedWorkflowDefinition.value).toBeNull()
    expect(workspace.workflowQuery.value).toBe(" expense ")
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
})
