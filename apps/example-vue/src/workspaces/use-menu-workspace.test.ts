import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type { MenuDetailRecord, MenuRecord } from "../lib/platform-api/menus"
import { useMenuWorkspace } from "./use-menu-workspace"

const originalFetch = globalThis.fetch

const createMenuRecord = (overrides?: Partial<MenuRecord>): MenuRecord => ({
  code: "dashboard",
  component: "/dashboard/index",
  createdAt: "2026-05-01T09:00:00.000Z",
  icon: "dashboard",
  id: "menu-1",
  isVisible: true,
  name: "Dashboard",
  parentId: null,
  path: "/dashboard",
  permissionCode: "system:dashboard:list",
  sort: 10,
  status: "active",
  type: "menu",
  updatedAt: "2026-05-01T10:00:00.000Z",
  ...overrides,
})

const createMenuDetailRecord = (
  overrides?: Partial<MenuDetailRecord>,
): MenuDetailRecord => ({
  roleIds: [],
  ...createMenuRecord(overrides),
  ...overrides,
})

const createWorkspace = (
  page?: Partial<Parameters<typeof useMenuWorkspace>[0]["page"]>,
) =>
  useMenuWorkspace({
    canCreate: computed(() => true),
    canUpdate: computed(() => true),
    canView: computed(() => true),
    currentShellTabKey: ref("workspace"),
    locale: ref("zh-CN"),
    localizeBoolean: (value) => (value ? "yes" : "no"),
    localizeFieldLabel: (fieldKey) => fieldKey,
    localizeStatus: (status) => status,
    localizeType: (type) => type,
    onRecoverableAuthError: () => {},
    page: {
      formFields: computed(() => []),
      queryFields: computed(() => []),
      tableColumns: computed(() => []),
      ...page,
    },
    t: (key) => key,
  })

describe("useMenuWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("filters menus from local query state and clears the query on reset", async () => {
    const first = createMenuRecord()
    const second = createMenuRecord({
      code: "audit",
      component: "/audit/index",
      icon: "shield",
      id: "menu-2",
      isVisible: false,
      name: "Audit",
      path: "/audit",
      permissionCode: "system:audit:list",
      status: "disabled",
      type: "directory",
    })

    globalThis.fetch = (async (input, init) => {
      const url = String(input)

      if (
        url.endsWith("/system/menus/menu-1") &&
        (init?.method ?? "GET") === "GET"
      ) {
        return new Response(JSON.stringify(createMenuDetailRecord(first)), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response(JSON.stringify({ items: [first, second] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadMenus()
    workspace.handleSearch({
      code: " audit ",
      component: " /audit/index ",
      icon: " shield ",
      name: " audit ",
      path: " /audit ",
      permissionCode: " system:audit:list ",
      status: "disabled",
      type: "directory",
    })

    expect(workspace.filteredMenuItems.value.map((item) => item.id)).toEqual([
      "menu-2",
    ])
    expect(workspace.menuQueryValues.value).toEqual({
      code: " audit ",
      component: " /audit/index ",
      icon: " shield ",
      name: " audit ",
      path: " /audit ",
      permissionCode: " system:audit:list ",
      status: "disabled",
      type: "directory",
    })

    workspace.handleReset()

    expect(workspace.filteredMenuItems.value.map((item) => item.id)).toEqual([
      "menu-1",
      "menu-2",
    ])
    expect(workspace.menuQueryValues.value).toEqual({})
  })

  test("keeps menu table columns compact for daily management", () => {
    const workspace = createWorkspace({
      tableColumns: computed(() => [
        { key: "id" },
        { key: "name" },
        { key: "code" },
        { key: "type" },
        { key: "parentId" },
        { key: "path" },
        { key: "component" },
        { key: "icon" },
        { key: "sort" },
        { key: "isVisible" },
        { key: "permissionCode" },
        { key: "status" },
        { key: "createdAt" },
        { key: "updatedAt" },
      ]),
    })

    expect(workspace.tableColumns.value.map((column) => column.key)).toEqual([
      "name",
      "code",
      "type",
      "parentId",
      "path",
      "permissionCode",
      "status",
    ])
  })

  test("keeps menu query and detail fields compact", async () => {
    const allFieldKeys = [
      "id",
      "name",
      "code",
      "type",
      "parentId",
      "path",
      "component",
      "icon",
      "sort",
      "isVisible",
      "permissionCode",
      "status",
      "createdAt",
      "updatedAt",
    ]
    const workspace = createWorkspace({
      formFields: computed(() =>
        allFieldKeys.map((key) => ({
          input: "text" as const,
          key,
          label: key,
        })),
      ),
      queryFields: computed(() =>
        allFieldKeys.map((key) => ({ kind: "text" as const, key, label: key })),
      ),
    })

    expect(workspace.queryFields.value.map((field) => field.key)).toEqual([
      "name",
      "code",
      "type",
      "path",
      "permissionCode",
      "status",
    ])

    const menu = createMenuDetailRecord()
    globalThis.fetch = (async (input) => {
      const url = String(input)

      if (url.endsWith("/system/menus/menu-1")) {
        return new Response(JSON.stringify(menu), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response(JSON.stringify({ items: [menu] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    await workspace.reloadMenus()

    expect(workspace.formFields.value.map((field) => field.key)).toEqual([
      "name",
      "code",
      "type",
      "parentId",
      "path",
      "permissionCode",
      "status",
    ])
    expect(workspace.panelDescription.value).toBe("")
  })

  test("normalizes create payload and keeps edit mode after creation", async () => {
    const existing = createMenuRecord()
    const created = createMenuDetailRecord({
      code: "audit",
      component: "/audit/index",
      icon: "shield",
      id: "menu-2",
      isVisible: false,
      name: "Audit",
      parentId: "menu-1",
      path: "/audit",
      permissionCode: "system:audit:list",
      sort: 20,
      status: "disabled",
      type: "directory",
    })
    const requests: Array<{ method: string; url: string; body?: string }> = []

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

      if (url.endsWith("/system/menus") && method === "POST") {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/menus/menu-2") && method === "GET") {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/menus/menu-1") && method === "GET") {
        return new Response(JSON.stringify(createMenuDetailRecord(existing)), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/menus") && method === "GET") {
        return new Response(JSON.stringify({ items: [existing, created] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadMenus()
    workspace.openCreatePanel()

    await workspace.submitForm({
      code: "  audit  ",
      component: "  /audit/index  ",
      icon: "  shield  ",
      isVisible: false,
      name: "  Audit  ",
      parentId: "menu-1",
      path: "  /audit  ",
      permissionCode: "  system:audit:list  ",
      sort: "20",
      status: "disabled",
      type: "directory",
    })

    const createRequest = requests.find(
      (request) =>
        request.method === "POST" && request.url.endsWith("/system/menus"),
    )

    expect(createRequest).toBeDefined()
    expect(JSON.parse(createRequest?.body ?? "{}")).toEqual({
      code: "audit",
      component: "/audit/index",
      icon: "shield",
      isVisible: false,
      name: "Audit",
      parentId: "menu-1",
      path: "/audit",
      permissionCode: "system:audit:list",
      sort: 20,
      status: "disabled",
      type: "directory",
    })
    expect(workspace.menuPanelMode.value).toBe("edit")
    expect(workspace.selectedMenu.value?.id).toBe("menu-2")
    expect(workspace.menuErrorMessage.value).toBe("")
  })
})
