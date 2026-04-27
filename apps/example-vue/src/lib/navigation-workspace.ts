import type { UiNavigationNode } from "@elysian/ui-core"

const WORKSPACE_PATH_ALIASES: Record<string, string> = {
  "/workflow": "/workflow/definitions",
  "/workflow/instances": "/workflow/definitions",
  "/workflow/tasks/todo": "/workflow/definitions",
  "/workflow/tasks/done": "/workflow/definitions",
}

const findNavigationItemById = (
  items: UiNavigationNode[],
  id: string,
): UiNavigationNode | null => {
  for (const item of items) {
    if (item.id === id) {
      return item
    }

    const match = findNavigationItemById(item.children, id)

    if (match) {
      return match
    }
  }

  return null
}

const findNavigationItemByPath = (
  items: UiNavigationNode[],
  path: string,
): UiNavigationNode | null => {
  for (const item of items) {
    if (item.path === path) {
      return item
    }

    const match = findNavigationItemByPath(item.children, path)

    if (match) {
      return match
    }
  }

  return null
}

const findFirstMenuItem = (
  items: UiNavigationNode[],
): UiNavigationNode | null => {
  for (const item of items) {
    if (item.type === "menu") {
      return item
    }

    const childMatch = findFirstMenuItem(item.children)

    if (childMatch) {
      return childMatch
    }
  }

  return null
}

export const normalizeWorkspaceNavigationPath = (
  path: string | null | undefined,
) => {
  if (!path) {
    return null
  }

  return WORKSPACE_PATH_ALIASES[path] ?? path
}

export const resolveWorkspaceMenuKey = (
  items: UiNavigationNode[],
  menuKey: string,
) => {
  const currentItem = findNavigationItemById(items, menuKey)

  if (!currentItem) {
    return null
  }

  const leafItem = findFirstMenuItem(currentItem.children) ?? currentItem
  const normalizedPath = normalizeWorkspaceNavigationPath(leafItem.path)

  if (!normalizedPath) {
    return leafItem.id
  }

  return findNavigationItemByPath(items, normalizedPath)?.id ?? leafItem.id
}
