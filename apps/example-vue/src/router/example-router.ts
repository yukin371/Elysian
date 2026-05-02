import type { UiNavigationNode } from "@elysian/ui-core"
import type { ComputedRef } from "vue"
import { computed } from "vue"

import type { ExampleShellTabKey } from "../app/app-shell-helpers"
import type { RegisteredWorkspaceKind } from "../app/workspace-registry"
import {
  normalizeWorkspaceRoutePath,
  resolveWorkspaceMenuKey,
  resolveWorkspaceMenuKeyByPath,
  toWorkspaceRouteHash,
} from "../lib/navigation-workspace"
import {
  defaultExampleWorkspacePath,
  resolveExampleWorkspacePathByKind,
  resolveExampleWorkspaceRoute,
} from "./example-workspace-routes"
import { exampleAppRouter } from "./app-router"

export type ExampleAppLayout = "auth" | "admin"

export interface ExampleNavigationSelectionState {
  selectedMenuKey: string | null
  selectedNavigationItem: UiNavigationNode | null
}

export interface ExampleWorkspaceSelectionIntent {
  selectedMenuKey: string
  selectedTabKey: ExampleShellTabKey
}

interface ExampleBrowserWindow {
  addEventListener: (type: "hashchange", listener: () => void) => void
  history: {
    replaceState: (data: unknown, unused: string, url?: string | URL) => void
  }
  location: {
    hash: string
  }
  removeEventListener: (type: "hashchange", listener: () => void) => void
}

const getBrowserWindow = () =>
  (globalThis as { window?: ExampleBrowserWindow }).window ?? null

const canUseVueRouter = () => typeof document !== "undefined"

const findNavigationItemById = (
  items: UiNavigationNode[],
  id: string,
): UiNavigationNode | null => {
  for (const item of items) {
    if (item.id === id) {
      return item
    }

    const nested = findNavigationItemById(item.children, id)

    if (nested) {
      return nested
    }
  }

  return null
}

const findNavigationItemByPath = (
  items: UiNavigationNode[],
  path: string | null,
): UiNavigationNode | null => {
  if (!path) {
    return null
  }

  for (const item of items) {
    if (item.path === path) {
      return item
    }

    const nested = findNavigationItemByPath(item.children, path)

    if (nested) {
      return nested
    }
  }

  return null
}

const findFirstMenuItem = (
  items: UiNavigationNode[],
): UiNavigationNode | null => {
  for (const item of items) {
    if (item.type === "menu" && item.path) {
      return item
    }

    const nested = findFirstMenuItem(item.children)

    if (nested) {
      return nested
    }
  }

  return null
}

export const resolveExampleAppLayout = (
  isAuthenticated: boolean,
): ExampleAppLayout => (isAuthenticated ? "admin" : "auth")

export const useExampleAppLayout = ({
  isAuthenticated,
}: {
  isAuthenticated: ComputedRef<boolean>
}) =>
  computed<ExampleAppLayout>(() =>
    resolveExampleAppLayout(isAuthenticated.value),
  )

export const readCurrentWorkspaceRouteMenuKey = (items: UiNavigationNode[]) => {
  return resolveWorkspaceMenuKeyByPath(items, readCurrentWorkspaceRoutePath())
}

export const readCurrentWorkspaceRoutePath = () => {
  if (canUseVueRouter()) {
    return normalizeWorkspaceRoutePath(exampleAppRouter.currentRoute.value.fullPath)
  }

  const browserWindow = getBrowserWindow()

  if (!browserWindow) {
    return null
  }

  return normalizeWorkspaceRoutePath(browserWindow.location.hash)
}

export const readCurrentExampleWorkspaceRoute = () =>
  resolveExampleWorkspaceRoute(readCurrentWorkspaceRoutePath())

export const resolveDefaultWorkspaceNavigationItem = (
  items: UiNavigationNode[],
) =>
  findNavigationItemByPath(items, defaultExampleWorkspacePath) ??
  findFirstMenuItem(items)

export const resolveWorkspaceNavigationItemByKind = (
  items: UiNavigationNode[],
  kind: RegisteredWorkspaceKind,
) => findNavigationItemByPath(items, resolveExampleWorkspacePathByKind(kind))

export const resolveWorkspaceNavigationItemByKey = (
  items: UiNavigationNode[],
  menuKey: string | null | undefined,
) => {
  if (!menuKey) {
    return null
  }

  return findNavigationItemById(items, menuKey)
}

export const resolveSelectedWorkspaceNavigationItem = (
  items: UiNavigationNode[],
  menuKey: string | null | undefined,
) =>
  resolveWorkspaceNavigationItemByKey(items, menuKey) ??
  resolveDefaultWorkspaceNavigationItem(items)

export const resolveExampleNavigationSelectionState = (
  items: UiNavigationNode[],
  currentMenuKey: string | null,
): ExampleNavigationSelectionState => {
  const selectedMenuKey = resolveExampleNavigationMenuKey(items, currentMenuKey)

  return {
    selectedMenuKey,
    selectedNavigationItem: resolveSelectedWorkspaceNavigationItem(
      items,
      selectedMenuKey,
    ),
  }
}

export const resolveExampleWorkspaceMenuSelection = (
  items: UiNavigationNode[],
  menuKey: string,
) => resolveWorkspaceMenuKey(items, menuKey)

export const resolveExampleWorkspaceSelectionIntent = (
  items: UiNavigationNode[],
  menuKey: string,
): ExampleWorkspaceSelectionIntent | null => {
  const selectedMenuKey = resolveExampleWorkspaceMenuSelection(items, menuKey)

  if (!selectedMenuKey) {
    return null
  }

  return {
    selectedMenuKey,
    selectedTabKey: "workspace",
  }
}

export const resolveExampleShellTabKey = (
  tabKey: string,
): ExampleShellTabKey | null =>
  tabKey === "workspace" || tabKey === "runtime" ? tabKey : null

export const resolveExampleNavigationMenuKey = (
  items: UiNavigationNode[],
  currentMenuKey: string | null,
) => {
  const routeMenuKey = readCurrentWorkspaceRouteMenuKey(items)

  if (routeMenuKey) {
    return routeMenuKey
  }

  const currentItem = currentMenuKey
    ? findNavigationItemById(items, currentMenuKey)
    : null

  return (
    currentItem?.id ?? resolveDefaultWorkspaceNavigationItem(items)?.id ?? null
  )
}

export const replaceCurrentWorkspaceRoute = (
  path: string | null | undefined,
) => {
  const nextPath = normalizeWorkspaceRoutePath(path)

  if (!nextPath) {
    return
  }

  if (canUseVueRouter()) {
    if (exampleAppRouter.currentRoute.value.path === nextPath) {
      return
    }

    void exampleAppRouter.replace(nextPath)
    return
  }

  const browserWindow = getBrowserWindow()

  if (!browserWindow) {
    return
  }

  const nextHash = toWorkspaceRouteHash(nextPath)

  if (!nextHash || browserWindow.location.hash === nextHash) {
    return
  }

  browserWindow.history.replaceState(null, "", nextHash)
}

export const listenWorkspaceRouteChange = (listener: () => void) => {
  if (canUseVueRouter()) {
    return exampleAppRouter.afterEach(() => {
      listener()
    })
  }

  const browserWindow = getBrowserWindow()

  if (!browserWindow) {
    return () => {}
  }

  browserWindow.addEventListener("hashchange", listener)

  return () => {
    browserWindow.removeEventListener("hashchange", listener)
  }
}
