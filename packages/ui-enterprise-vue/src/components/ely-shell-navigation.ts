import type { UiNavigationNode } from "@elysian/ui-core"

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

export const isElyShellMenuSelectable = (
  items: UiNavigationNode[],
  value: string,
) => findNavigationItemById(items, value)?.type === "menu"

export const toggleElyShellExpandedMenuValue = (
  values: readonly string[],
  menuKey: string,
) =>
  values.includes(menuKey)
    ? values.filter((value) => value !== menuKey)
    : [...values, menuKey]
