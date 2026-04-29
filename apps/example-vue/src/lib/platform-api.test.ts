import { afterEach, describe, expect, test } from "bun:test"

import type { TenantRecord, WorkflowDefinitionRecord } from "@elysian/schema"

import {
  clearAccessToken,
  fetchPlatform,
  fetchSystemModules,
  fetchTenants,
  fetchWorkflowDefinitionById,
  fetchWorkflowDefinitions,
  setAccessToken,
  updateTenantStatus,
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
  clearAccessToken()
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

describe("platform api tenant requests", () => {
  test("keeps platform exports compatible through the barrel", async () => {
    const originalFetch = globalThis.fetch
    const fetchCalls: string[] = []

    globalThis.fetch = (async (input) => {
      const url = String(input)
      fetchCalls.push(url)

      if (url.endsWith("/platform")) {
        return new Response(
          JSON.stringify({
            manifest: {
              name: "elysian",
              displayName: "Elysian",
              version: "0.1.0",
              runtime: "bun",
              status: "ready",
            },
            capabilities: ["auth", "workflow"],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        )
      }

      return new Response(
        JSON.stringify({
          env: "development",
          modules: ["auth", "customer"],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      )
    }) as typeof fetch

    try {
      await expect(fetchPlatform()).resolves.toEqual({
        manifest: {
          name: "elysian",
          displayName: "Elysian",
          version: "0.1.0",
          runtime: "bun",
          status: "ready",
        },
        capabilities: ["auth", "workflow"],
      })
      await expect(fetchSystemModules()).resolves.toEqual({
        env: "development",
        modules: ["auth", "customer"],
      })
      expect(fetchCalls).toEqual([
        "http://localhost:3000/platform",
        "http://localhost:3000/system/modules",
      ])
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test("fetches tenants with bearer token", async () => {
    const tenantItems: TenantRecord[] = [
      {
        id: "tenant_default",
        code: "default",
        name: "Default Tenant",
        status: "active",
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z",
      },
    ]
    const originalFetch = globalThis.fetch
    const fetchCalls: Array<{ url: string; authorization: string | null }> = []

    setAccessToken("tenant-token")
    globalThis.fetch = (async (input, init) => {
      const headers = new Headers(init?.headers)
      fetchCalls.push({
        url: String(input),
        authorization: headers.get("authorization"),
      })

      return new Response(JSON.stringify({ items: tenantItems }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    }) as typeof fetch

    try {
      await expect(fetchTenants()).resolves.toEqual({ items: tenantItems })
      expect(fetchCalls).toEqual([
        {
          url: "http://localhost:3000/system/tenants",
          authorization: "Bearer tenant-token",
        },
      ])
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test("retries tenant requests after refresh restores the token", async () => {
    const tenantItems: TenantRecord[] = [
      {
        id: "tenant_default",
        code: "default",
        name: "Default Tenant",
        status: "active",
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z",
      },
    ]
    const originalFetch = globalThis.fetch
    const fetchCalls: Array<{
      url: string
      method: string
      authorization: string | null
      credentials: "omit" | "same-origin" | "include" | undefined
    }> = []
    let requestCount = 0

    setAccessToken("expired-token")
    globalThis.fetch = (async (input, init) => {
      const headers = new Headers(init?.headers)
      const url = String(input)

      fetchCalls.push({
        url,
        method: String(init?.method ?? "GET"),
        authorization: headers.get("authorization"),
        credentials: init?.credentials,
      })

      if (url.endsWith("/auth/refresh")) {
        return new Response(JSON.stringify({ accessToken: "restored-token" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      }

      requestCount += 1

      if (requestCount === 1) {
        return new Response(
          JSON.stringify({
            error: {
              code: "UNAUTHORIZED",
              message: "expired",
              status: 401,
            },
          }),
          {
            status: 401,
            headers: { "content-type": "application/json" },
          },
        )
      }

      return new Response(JSON.stringify({ items: tenantItems }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    }) as typeof fetch

    try {
      await expect(fetchTenants()).resolves.toEqual({ items: tenantItems })
      expect(fetchCalls).toEqual([
        {
          url: "http://localhost:3000/system/tenants",
          method: "GET",
          authorization: "Bearer expired-token",
          credentials: undefined,
        },
        {
          url: "http://localhost:3000/auth/refresh",
          method: "POST",
          authorization: null,
          credentials: "include",
        },
        {
          url: "http://localhost:3000/system/tenants",
          method: "GET",
          authorization: "Bearer restored-token",
          credentials: undefined,
        },
      ])
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test("updates tenant status with canonical payload", async () => {
    const updatedTenant: TenantRecord = {
      id: "tenant_default",
      code: "default",
      name: "Default Tenant",
      status: "suspended",
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
    }
    const originalFetch = globalThis.fetch
    const fetchCalls: Array<{
      url: string
      method: string
      body: string | undefined
      authorization: string | null
    }> = []

    setAccessToken("tenant-token")
    globalThis.fetch = (async (input, init) => {
      const headers = new Headers(init?.headers)
      fetchCalls.push({
        url: String(input),
        method: String(init?.method ?? "GET"),
        body: typeof init?.body === "string" ? init.body : undefined,
        authorization: headers.get("authorization"),
      })

      return new Response(JSON.stringify(updatedTenant), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    }) as typeof fetch

    try {
      await expect(
        updateTenantStatus("tenant_default", "suspended"),
      ).resolves.toEqual(updatedTenant)
      expect(fetchCalls).toEqual([
        {
          url: "http://localhost:3000/system/tenants/tenant_default/status",
          method: "PUT",
          body: JSON.stringify({ status: "suspended" }),
          authorization: "Bearer tenant-token",
        },
      ])
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
