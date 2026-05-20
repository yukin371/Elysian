import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type { CustomerRecord } from "../lib/platform-api/customer"
import { useCustomerWorkspace } from "./use-customer-workspace"

const originalFetch = globalThis.fetch

const createCustomerRecord = (
  overrides: Partial<CustomerRecord> & Pick<CustomerRecord, "id">,
): CustomerRecord => ({
  createdAt: "2026-05-01T09:00:00.000Z",
  id: overrides.id,
  name: overrides.name ?? `Customer ${overrides.id}`,
  status: overrides.status ?? "active",
  updatedAt: "2026-05-01T10:00:00.000Z",
})

const createWorkspace = (options?: {
  onRecoverableAuthError?: (error: unknown) => void
}) =>
  useCustomerWorkspace({
    canCreate: computed(() => true),
    canDelete: computed(() => true),
    canUpdate: computed(() => true),
    canView: computed(() => true),
    currentShellTabKey: ref("workspace"),
    locale: ref("zh-CN"),
    localizeActionLabel: (_actionKey, fallback) => fallback,
    localizeFieldLabel: (fieldKey) => fieldKey,
    localizeStatus: (status) => status,
    onRecoverableAuthError: options?.onRecoverableAuthError ?? (() => {}),
    page: {
      formFields: computed(() => []),
      queryFields: computed(() => [
        { key: "name", kind: "text" as const, label: "Name" },
        {
          key: "status",
          kind: "select" as const,
          label: "Status",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ],
        },
      ]),
      tableActions: computed(() => [
        { key: "update", label: "Update" },
        { key: "delete", label: "Delete" },
      ]),
      tableColumns: computed(() => [
        { key: "id" },
        { key: "name" },
        { key: "status" },
      ]),
    },
    t: (key, params) =>
      params
        ? `${key}:${Object.entries(params)
            .map(([name, value]) => `${name}=${String(value)}`)
            .join(",")}`
        : key,
  })

describe("useCustomerWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("requests server-side pagination and sorting with the current query state", async () => {
    const requests: string[] = []
    const alpha = createCustomerRecord({ id: "cust-alpha", name: "Alpha" })
    const beta = createCustomerRecord({
      id: "cust-beta",
      name: "Beta",
      status: "inactive",
    })

    globalThis.fetch = (async (input) => {
      const url = String(input)
      requests.push(url)

      return new Response(
        JSON.stringify({
          items: [alpha, beta],
          page: 1,
          pageSize: 20,
          total: 2,
          totalPages: 1,
        }),
        {
          headers: { "content-type": "application/json" },
          status: 200,
        },
      )
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadCustomers()
    await workspace.handleSearch({
      name: "  Alpha  ",
      status: "inactive",
    })
    await workspace.handlePageSizeChange(50)
    await workspace.handleSortChange("name:asc")

    expect(requests[0]).toContain(
      "/customers?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc",
    )
    expect(requests[1]).toContain(
      "/customers?q=Alpha&status=inactive&page=1&pageSize=20&sortBy=createdAt&sortOrder=desc",
    )
    expect(requests[2]).toContain(
      "/customers?q=Alpha&status=inactive&page=1&pageSize=50&sortBy=createdAt&sortOrder=desc",
    )
    expect(requests[3]).toContain(
      "/customers?q=Alpha&status=inactive&page=1&pageSize=50&sortBy=name&sortOrder=asc",
    )
    expect(workspace.customerListPageSize.value).toBe(50)
    expect(workspace.customerListSortValue.value).toBe("name:asc")
    expect(workspace.customerCountLabel.value).toContain("visible=2")
  })

  test("deletes the selected customer and reloads the list", async () => {
    const requests: Array<{ method: string; url: string }> = []
    const alpha = createCustomerRecord({ id: "cust-alpha", name: "Alpha" })
    const beta = createCustomerRecord({ id: "cust-beta", name: "Beta" })
    let currentItems = [alpha, beta]

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"
      requests.push({ method, url })

      if (url.includes("/customers") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: currentItems,
            page: 1,
            pageSize: 20,
            total: currentItems.length,
            totalPages: 1,
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (url.endsWith("/customers/cust-alpha") && method === "DELETE") {
        currentItems = [beta]
        return new Response(null, { status: 204 })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadCustomers()
    workspace.requestDelete(alpha)
    await workspace.confirmDelete()

    expect(
      requests.some(
        (request) =>
          request.method === "DELETE" &&
          request.url.endsWith("/customers/cust-alpha"),
      ),
    ).toBe(true)
    expect(workspace.deleteConfirmId.value).toBeNull()
    expect(workspace.customerItems.value).toEqual([beta])
    expect(workspace.selectedCustomerId.value).toBe("cust-beta")
  })

  test("opens the create panel from the toolbar create action", () => {
    const workspace = createWorkspace()

    workspace.handleAction("create", {})

    expect(workspace.customerFormMode.value).toBe("create")
    expect(workspace.selectedCustomerId.value).toBeNull()
  })

  test("opens the edit panel from a table action row", async () => {
    const alpha = createCustomerRecord({ id: "cust-alpha", name: "Alpha" })

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.includes("/customers") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [alpha],
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadCustomers()
    workspace.handleAction("edit", { row: { id: "cust-alpha" } })

    expect(workspace.customerFormMode.value).toBe("edit")
    expect(workspace.selectedCustomerId.value).toBe("cust-alpha")
    expect(workspace.formValues.value).toMatchObject({
      name: "Alpha",
      status: "active",
    })
  })

  test("opens the delete confirmation from a table action row", async () => {
    const alpha = createCustomerRecord({ id: "cust-alpha", name: "Alpha" })

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.includes("/customers") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [alpha],
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadCustomers()
    workspace.handleAction("delete", { row: { id: "cust-alpha" } })

    expect(workspace.deleteConfirmId.value).toBe("cust-alpha")
  })

  test("reports recoverable auth errors when customer create fails", async () => {
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/customers") && method === "POST") {
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

    workspace.openCreatePanel()
    await workspace.handleFormSubmit({ name: "Alpha", status: "active" })

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.customerErrorMessage.value).toContain("unauthorized")
    expect(workspace.customerFormMode.value).toBe("create")
  })

  test("reports recoverable auth errors when customer edit fails", async () => {
    const alpha = createCustomerRecord({ id: "cust-alpha", name: "Alpha" })
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.includes("/customers") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [alpha],
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (url.endsWith("/customers/cust-alpha") && method === "PUT") {
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

    await workspace.reloadCustomers()
    workspace.startEdit(alpha)
    await workspace.handleFormSubmit({
      name: "Alpha Updated",
      status: "active",
    })

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.customerErrorMessage.value).toContain("unauthorized")
    expect(workspace.customerFormMode.value).toBe("edit")
  })

  test("reports recoverable auth errors when customer delete fails", async () => {
    const alpha = createCustomerRecord({ id: "cust-alpha", name: "Alpha" })
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.includes("/customers") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [alpha],
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (url.endsWith("/customers/cust-alpha") && method === "DELETE") {
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

    await workspace.reloadCustomers()
    workspace.requestDelete(alpha)
    await workspace.confirmDelete()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.customerErrorMessage.value).toContain("unauthorized")
    expect(workspace.deleteConfirmId.value).toBe("cust-alpha")
  })
})
