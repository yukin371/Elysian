import { afterEach, describe, expect, mock, test } from "bun:test"

import {
  listenWorkspaceRouteChange,
  readCurrentExampleWorkspaceRoute,
  readCurrentWorkspaceRoutePath,
  replaceCurrentWorkspaceRoute,
  resolveDefaultWorkspaceNavigationItem,
  resolveExampleAppLayout,
  resolveExampleNavigationMenuKey,
  resolveExampleNavigationSelectionState,
  resolveExampleShellTabKey,
  resolveExampleWorkspaceMenuSelection,
  resolveExampleWorkspaceSelectionIntent,
  resolveSelectedWorkspaceNavigationItem,
  resolveWorkspaceNavigationItemByKind,
} from "./example-router"

type MockBrowserWindow = ReturnType<typeof createMockWindow>["mockWindow"]

const testGlobal = globalThis as typeof globalThis & {
  window?: MockBrowserWindow
}
const originalWindow = testGlobal.window

afterEach(() => {
  testGlobal.window = originalWindow
})

const createMockWindow = (hash: string) => {
  const listeners = new Map<string, () => void>()
  const replaceState = mock((_: unknown, __: string, url?: string | URL) => {
    if (typeof url === "string") {
      mockWindow.location.hash = url
    }
  })
  const addEventListener = mock((type: "hashchange", listener: () => void) => {
    listeners.set(type, listener)
  })
  const removeEventListener = mock(
    (type: "hashchange", listener: () => void) => {
      if (listeners.get(type) === listener) {
        listeners.delete(type)
      }
    },
  )
  const mockWindow = {
    location: { hash },
    history: { replaceState },
    addEventListener,
    removeEventListener,
  }

  return {
    mockWindow,
    listeners,
    replaceState,
    addEventListener,
    removeEventListener,
  }
}

const createNavigationItems = () => [
  {
    id: "customer-root",
    parentId: null,
    type: "directory" as const,
    code: "customer-root",
    name: "Customers",
    path: null,
    component: null,
    icon: "usergroup",
    sort: 10,
    isVisible: true,
    status: "active" as const,
    permissionCode: null,
    depth: 0,
    children: [
      {
        id: "customer-list",
        parentId: "customer-root",
        type: "menu" as const,
        code: "customer-list",
        name: "Customer List",
        path: "/customers",
        component: "customer/index",
        icon: "user",
        sort: 10,
        isVisible: true,
        status: "active" as const,
        permissionCode: null,
        depth: 1,
        children: [],
      },
    ],
  },
  {
    id: "system-root",
    parentId: null,
    type: "directory" as const,
    code: "system-root",
    name: "System",
    path: null,
    component: null,
    icon: "setting",
    sort: 20,
    isVisible: true,
    status: "active" as const,
    permissionCode: null,
    depth: 0,
    children: [
      {
        id: "system-files",
        parentId: "system-root",
        type: "menu" as const,
        code: "system-files",
        name: "Files",
        path: "/system/files",
        component: "system/files/index",
        icon: "folder",
        sort: 10,
        isVisible: true,
        status: "active" as const,
        permissionCode: null,
        depth: 1,
        children: [],
      },
    ],
  },
]

describe("example app router", () => {
  test("uses auth layout before a session exists", () => {
    expect(resolveExampleAppLayout(false)).toBe("auth")
  })

  test("uses admin layout after authentication", () => {
    expect(resolveExampleAppLayout(true)).toBe("admin")
  })

  test("reads the current normalized workspace route from the hash model", () => {
    const { mockWindow } = createMockWindow("#/workflow/tasks/todo")
    testGlobal.window = mockWindow

    expect(readCurrentWorkspaceRoutePath()).toBe("/workflow/definitions")
    expect(readCurrentExampleWorkspaceRoute()?.kind).toBe(
      "workflow-definitions",
    )
  })

  test("replaces the current hash route only when the target path changes", () => {
    const { mockWindow, replaceState } = createMockWindow("#/customers")
    testGlobal.window = mockWindow

    replaceCurrentWorkspaceRoute("/customers")
    replaceCurrentWorkspaceRoute("/system/files")

    expect(replaceState).toHaveBeenCalledTimes(1)
    expect(mockWindow.location.hash).toBe("#/system/files")
  })

  test("subscribes and unsubscribes to hashchange events", () => {
    const { mockWindow, listeners, addEventListener, removeEventListener } =
      createMockWindow("#/customers")
    testGlobal.window = mockWindow
    const listener = mock(() => {})

    const cleanup = listenWorkspaceRouteChange(listener)
    listeners.get("hashchange")?.()
    cleanup()

    expect(addEventListener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(removeEventListener).toHaveBeenCalledTimes(1)
  })

  test("resolves default and kind-based navigation items through router helpers", () => {
    const items = createNavigationItems()

    expect(resolveDefaultWorkspaceNavigationItem(items)?.id).toBe(
      "customer-list",
    )
    expect(resolveWorkspaceNavigationItemByKind(items, "customer")?.id).toBe(
      "customer-list",
    )
    expect(
      resolveWorkspaceNavigationItemByKind(items, "workflow-definitions"),
    ).toBeNull()
  })

  test("resolves the selected menu key with route-first precedence", () => {
    const items = createNavigationItems()
    const { mockWindow } = createMockWindow("#/system/files")
    testGlobal.window = mockWindow

    expect(resolveExampleNavigationMenuKey(items, "customer-list")).toBe(
      "system-files",
    )

    mockWindow.location.hash = "#/"

    expect(resolveExampleNavigationMenuKey(items, "system-files")).toBe(
      "system-files",
    )
    expect(resolveExampleNavigationMenuKey(items, null)).toBe("customer-list")
  })

  test("resolves the selected navigation item with default fallback", () => {
    const items = createNavigationItems()

    expect(
      resolveSelectedWorkspaceNavigationItem(items, "system-files")?.id,
    ).toBe("system-files")
    expect(resolveSelectedWorkspaceNavigationItem(items, null)?.id).toBe(
      "customer-list",
    )
  })

  test("resolves the selected navigation selection state with menu and item fallback", () => {
    const items = createNavigationItems()
    const { mockWindow } = createMockWindow("#/system/files")
    testGlobal.window = mockWindow

    expect(
      resolveExampleNavigationSelectionState(items, "customer-list"),
    ).toMatchObject({
      selectedMenuKey: "system-files",
      selectedNavigationItem: {
        id: "system-files",
      },
    })

    mockWindow.location.hash = "#/"

    expect(resolveExampleNavigationSelectionState(items, null)).toMatchObject({
      selectedMenuKey: "customer-list",
      selectedNavigationItem: {
        id: "customer-list",
      },
    })
  })

  test("normalizes a clicked shell menu key to the selectable workspace item", () => {
    const items = createNavigationItems()

    expect(resolveExampleWorkspaceMenuSelection(items, "customer-root")).toBe(
      "customer-list",
    )
    expect(resolveExampleWorkspaceMenuSelection(items, "system-files")).toBe(
      "system-files",
    )
    expect(resolveExampleWorkspaceMenuSelection(items, "missing")).toBeNull()
  })

  test("resolves workspace selection intents to workspace tab navigation", () => {
    const items = createNavigationItems()

    expect(
      resolveExampleWorkspaceSelectionIntent(items, "customer-root"),
    ).toEqual({
      selectedMenuKey: "customer-list",
      selectedTabKey: "workspace",
    })
    expect(resolveExampleWorkspaceSelectionIntent(items, "missing")).toBeNull()
  })

  test("validates example shell tab keys", () => {
    expect(resolveExampleShellTabKey("workspace")).toBe("workspace")
    expect(resolveExampleShellTabKey("runtime")).toBe("runtime")
    expect(resolveExampleShellTabKey("missing")).toBeNull()
  })
})
