import type { UiNavigationNode } from "@elysian/ui-core"

import { workspaceRegistry } from "."
import type {
  WorkspaceNavigationGroupRegistration,
  WorkspaceNavigationRegistration,
} from "./types"

type Translate = (key: string, params?: Record<string, unknown>) => string

const createNavigationNode = (
  navigation: WorkspaceNavigationRegistration,
  path: string,
  t: Translate,
): UiNavigationNode => ({
  id: navigation.id,
  parentId: navigation.parentId,
  type: "menu",
  code: navigation.code,
  name: t(navigation.nameKey),
  path,
  component: navigation.component,
  icon: navigation.icon,
  sort: navigation.sort,
  isVisible: true,
  status: "active",
  permissionCode: navigation.permissionCode,
  depth: navigation.parentId ? 1 : 0,
  children: [],
})

const createNavigationGroupNode = (
  group: WorkspaceNavigationGroupRegistration,
  t: Translate,
): UiNavigationNode => ({
  id: group.id,
  parentId: null,
  type: "directory",
  code: group.code,
  name: t(group.nameKey),
  path: null,
  component: null,
  icon: group.icon,
  sort: group.sort,
  isVisible: true,
  status: "active",
  permissionCode: null,
  depth: 0,
  children: [],
})

const hasPath = (
  items: UiNavigationNode[],
  path: string | null | undefined,
): boolean =>
  Boolean(path) &&
  items.some((item) => item.path === path || hasPath(item.children, path))

const sortNavigationNodes = (items: UiNavigationNode[]) =>
  [...items].sort((left, right) => left.sort - right.sort)

const appendNavigation = (
  items: UiNavigationNode[],
  navigation: WorkspaceNavigationRegistration,
  path: string,
  t: Translate,
) => {
  const node = createNavigationNode(navigation, path, t)

  if (hasPath(items, node.path)) {
    return items
  }

  if (!navigation.parentCode) {
    return sortNavigationNodes([...items, node])
  }

  const parentIndex = items.findIndex(
    (item) => item.code === navigation.parentCode,
  )

  if (parentIndex >= 0) {
    return items.map((item, index) =>
      index === parentIndex
        ? {
            ...item,
            children: sortNavigationNodes([...item.children, node]),
          }
        : item,
    )
  }

  if (!navigation.group) {
    return sortNavigationNodes([...items, node])
  }

  return sortNavigationNodes([
    ...items,
    {
      ...createNavigationGroupNode(navigation.group, t),
      children: [node],
    },
  ])
}

export const appendWorkspaceRegistryNavigation = (
  items: UiNavigationNode[],
  t: Translate,
) =>
  workspaceRegistry
    .flatMap((workspace) =>
      "navigation" in workspace && workspace.navigation
        ? [{ navigation: workspace.navigation, path: workspace.path }]
        : [],
    )
    .reduce(
      (nextItems, { navigation, path }) =>
        appendNavigation(nextItems, navigation, path, t),
      items,
    )
