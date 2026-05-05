import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type { TenantRecord } from "../lib/platform-api/tenants"
import { useTenantWorkspace } from "./use-tenant-workspace"

const originalFetch = globalThis.fetch

const createTenantRecord = (
  overrides?: Partial<TenantRecord>,
): TenantRecord => ({
  code: "tenant-alpha",
  createdAt: "2026-05-01T09:00:00.000Z",
  id: "tenant-1",
  name: "Tenant Alpha",
  status: "active",
  updatedAt: "2026-05-01T10:00:00.000Z",
  ...overrides,
})

const createWorkspace = (
  canUpdate = true,
  options?: {
    onRecoverableAuthError?: (error: unknown) => void
  },
) =>
  useTenantWorkspace({
    canCreate: computed(() => true),
    canUpdate: computed(() => canUpdate),
    canView: computed(() => true),
    currentShellTabKey: ref("runtime"),
    locale: ref("zh-CN"),
    localizeFieldLabel: (fieldKey) => fieldKey,
    localizeStatus: (status) => status,
    onRecoverableAuthError: options?.onRecoverableAuthError ?? (() => {}),
    page: {
      formFields: computed(() => []),
      queryFields: computed(() => []),
      tableColumns: computed(() => []),
    },
    t: (key) => key,
  })

describe("useTenantWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("toggles the selected tenant status and refreshes the visible list", async () => {
    const activeTenant = createTenantRecord()
    const suspendedTenant = createTenantRecord({
      status: "suspended",
      updatedAt: "2026-05-01T11:00:00.000Z",
    })
    const requests: Array<{ method: string; url: string; body?: string }> = []
    let currentTenant = activeTenant

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"
      const body =
        typeof init?.body === "string"
          ? init.body
          : init?.body instanceof Uint8Array
            ? Buffer.from(init.body).toString("utf8")
            : undefined

      requests.push({ body, method, url })

      if (url.endsWith("/system/tenants/tenant-1/status") && method === "PUT") {
        currentTenant = suspendedTenant

        return new Response(JSON.stringify(currentTenant), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/tenants/tenant-1") && method === "GET") {
        return new Response(JSON.stringify(currentTenant), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/tenants") && method === "GET") {
        return new Response(JSON.stringify({ items: [currentTenant] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadTenants()
    expect(workspace.selectedTenant.value?.status).toBe("active")

    await workspace.toggleSelectedStatus()

    expect(
      requests.some(
        (request) =>
          request.method === "PUT" &&
          request.url.endsWith("/system/tenants/tenant-1/status") &&
          request.body === JSON.stringify({ status: "suspended" }),
      ),
    ).toBe(true)
    expect(workspace.selectedTenant.value?.status).toBe("suspended")
    expect(workspace.tenantItems.value[0]?.status).toBe("suspended")
  })

  test("does not request a tenant status update when update permission is unavailable", async () => {
    const tenant = createTenantRecord()
    const requests: string[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      requests.push(`${init?.method ?? "GET"} ${url}`)

      if (url.endsWith("/system/tenants")) {
        return new Response(JSON.stringify({ items: [tenant] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/tenants/tenant-1")) {
        return new Response(JSON.stringify(tenant), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace(false)

    await workspace.reloadTenants()
    await workspace.toggleSelectedStatus()

    expect(
      requests.some((request) =>
        request.endsWith("/system/tenants/tenant-1/status"),
      ),
    ).toBe(false)
    expect(workspace.selectedTenant.value?.status).toBe("active")
  })

  test("reports recoverable auth errors when toggling tenant status fails", async () => {
    const tenant = createTenantRecord()
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/system/tenants/tenant-1/status") && method === "PUT") {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      if (url.endsWith("/system/tenants/tenant-1") && method === "GET") {
        return new Response(JSON.stringify(tenant), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/tenants") && method === "GET") {
        return new Response(JSON.stringify({ items: [tenant] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace(true, {
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await workspace.reloadTenants()
    await workspace.toggleSelectedStatus()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.tenantErrorMessage.value).toContain("unauthorized")
    expect(workspace.selectedTenant.value?.status).toBe("active")
  })

  test("ignores row switches while tenant mutation is loading", async () => {
    const firstTenant = createTenantRecord()
    const secondTenant = createTenantRecord({
      code: "tenant-beta",
      id: "tenant-2",
      name: "Tenant Beta",
    })
    const requests: string[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"
      requests.push(`${method} ${url}`)

      if (url.endsWith("/system/tenants/tenant-1") && method === "GET") {
        return new Response(JSON.stringify(firstTenant), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/tenants/tenant-2") && method === "GET") {
        return new Response(JSON.stringify(secondTenant), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response(
        JSON.stringify({
          items: [firstTenant, secondTenant],
        }),
        {
          headers: { "content-type": "application/json" },
          status: 200,
        },
      )
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadTenants()
    expect(workspace.selectedTenant.value?.id).toBe("tenant-1")

    workspace.tenantLoading.value = true
    await workspace.handleRowClick({ id: "tenant-2" })

    expect(workspace.selectedTenant.value?.id).toBe("tenant-1")
    expect(
      requests.filter((request) =>
        request.endsWith("/system/tenants/tenant-2"),
      ),
    ).toHaveLength(0)
  })
})
