import { describe, expect, test } from "bun:test"
import type { UiNavigationNode } from "@elysian/ui-core"

import {
  normalizeWorkspaceNavigationPath,
  resolveWorkspaceMenuKey,
} from "./navigation-workspace"

const navigationItems: UiNavigationNode[] = [
  {
    id: "workflow-root",
    parentId: null,
    type: "directory",
    code: "workflow-root",
    name: "Workflow",
    path: null,
    component: null,
    icon: "flow",
    sort: 10,
    isVisible: true,
    status: "active",
    permissionCode: null,
    depth: 0,
    children: [
      {
        id: "workflow-definitions",
        parentId: "workflow-root",
        type: "menu",
        code: "workflow-definitions",
        name: "Definitions",
        path: "/workflow/definitions",
        component: "workflow/definitions/index",
        icon: "flow-chart",
        sort: 10,
        isVisible: true,
        status: "active",
        permissionCode: "workflow:definition:list",
        depth: 1,
        children: [],
      },
      {
        id: "workflow-instances",
        parentId: "workflow-root",
        type: "menu",
        code: "workflow-instances",
        name: "Instances",
        path: "/workflow/instances",
        component: "workflow/instances/index",
        icon: "history",
        sort: 20,
        isVisible: true,
        status: "active",
        permissionCode: "workflow:instance:list",
        depth: 1,
        children: [],
      },
      {
        id: "workflow-todo",
        parentId: "workflow-root",
        type: "menu",
        code: "workflow-tasks-todo",
        name: "Todo",
        path: "/workflow/tasks/todo",
        component: "workflow/tasks/todo/index",
        icon: "task",
        sort: 30,
        isVisible: true,
        status: "active",
        permissionCode: "workflow:task:list",
        depth: 1,
        children: [],
      },
    ],
  },
  {
    id: "system-root",
    parentId: null,
    type: "directory",
    code: "system-root",
    name: "System",
    path: null,
    component: null,
    icon: "settings",
    sort: 20,
    isVisible: true,
    status: "active",
    permissionCode: null,
    depth: 0,
    children: [
      {
        id: "system-files",
        parentId: "system-root",
        type: "menu",
        code: "system-files",
        name: "Files",
        path: "/system/files",
        component: "system/files/index",
        icon: "file",
        sort: 10,
        isVisible: true,
        status: "active",
        permissionCode: "system:file:list",
        depth: 1,
        children: [],
      },
    ],
  },
]

describe("navigation workspace helpers", () => {
  test("normalizes workflow child routes to the definitions workspace", () => {
    expect(normalizeWorkspaceNavigationPath("/workflow/instances")).toBe(
      "/workflow/definitions",
    )
    expect(normalizeWorkspaceNavigationPath("/workflow/tasks/todo")).toBe(
      "/workflow/definitions",
    )
    expect(normalizeWorkspaceNavigationPath("/workflow/tasks/done")).toBe(
      "/workflow/definitions",
    )
  })

  test("keeps unrelated routes unchanged", () => {
    expect(normalizeWorkspaceNavigationPath("/system/files")).toBe(
      "/system/files",
    )
    expect(normalizeWorkspaceNavigationPath(null)).toBeNull()
  })

  test("resolves workflow task navigation to the canonical definitions menu key", () => {
    expect(resolveWorkspaceMenuKey(navigationItems, "workflow-instances")).toBe(
      "workflow-definitions",
    )
    expect(resolveWorkspaceMenuKey(navigationItems, "workflow-todo")).toBe(
      "workflow-definitions",
    )
  })

  test("keeps unsupported modules on their own menu key", () => {
    expect(resolveWorkspaceMenuKey(navigationItems, "system-files")).toBe(
      "system-files",
    )
  })

  test("falls back from directories to the first navigable child", () => {
    expect(resolveWorkspaceMenuKey(navigationItems, "workflow-root")).toBe(
      "workflow-definitions",
    )
  })
})
