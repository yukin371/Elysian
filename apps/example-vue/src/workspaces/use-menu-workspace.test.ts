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

const createWorkspace = () =>
  useMenuWorkspace({
    canCreate: computed(() => true),
    canUpdate: computed(() => true),
    canView: computed(() => true),
    currentShellTabKey: ref("runtime"),
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

  test("normalizes create payload and returns to detail mode after creation", async () => {
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
    expect(workspace.menuPanelMode.value).toBe("detail")
    expect(workspace.selectedMenu.value?.id).toBe("menu-2")
    expect(workspace.menuErrorMessage.value).toBe("")
  })
})
