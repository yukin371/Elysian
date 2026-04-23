export type UiPresetKind = "enterprise" | "custom"

export interface UiPresetManifest {
  key: string
  framework: "vue" | "react"
  kind: UiPresetKind
  status: "planned" | "prototype" | "ready"
  displayName: string
  description: string
}

export type UiMenuType = "directory" | "menu" | "button"
export type UiMenuStatus = "active" | "inactive" | "disabled"

export interface UiMenuItem {
  id: string
  parentId: string | null
  type: UiMenuType
  code: string
  name: string
  path: string | null
  component: string | null
  icon: string | null
  sort: number
  isVisible: boolean
  status: UiMenuStatus
  permissionCode: string | null
}

export interface UiNavigationNode extends UiMenuItem {
  children: UiNavigationNode[]
  depth: number
}

export interface UiTableColumn {
  key: string
  label: string
  kind: "text" | "number" | "status" | "datetime" | "boolean"
}

export interface UiSelectOption {
  label: string
  value: string
}

export interface UiQueryField {
  key: string
  label: string
  kind: "text" | "select" | "date-range" | "status"
  options?: UiSelectOption[]
  dictionaryTypeCode?: string
}

export interface UiFormField {
  key: string
  label: string
  input: "text" | "textarea" | "number" | "switch" | "select" | "datetime"
  required: boolean
  options?: UiSelectOption[]
  dictionaryTypeCode?: string
}

export interface UiPageAction {
  key: string
  label: string
  permissionCode?: string
  tone?: "primary" | "secondary" | "danger"
}

export interface UiCrudPageDefinition {
  key: string
  title: string
  resource: string
  columns: UiTableColumn[]
  queryFields: UiQueryField[]
  formFields: UiFormField[]
  actions: UiPageAction[]
}

const compareMenuOrder = (left: UiMenuItem, right: UiMenuItem) =>
  left.sort - right.sort || left.name.localeCompare(right.name)

export const buildNavigationTree = (
  menus: UiMenuItem[],
): UiNavigationNode[] => {
  const activeMenus = menus
    .filter((menu) => menu.isVisible && menu.status === "active")
    .sort(compareMenuOrder)

  const nodes = new Map<string, UiNavigationNode>()

  for (const menu of activeMenus) {
    nodes.set(menu.id, {
      ...menu,
      children: [],
      depth: 0,
    })
  }

  const roots: UiNavigationNode[] = []

  for (const menu of activeMenus) {
    const node = nodes.get(menu.id)

    if (!node) {
      continue
    }

    const parentNode = menu.parentId ? nodes.get(menu.parentId) : undefined

    if (!parentNode) {
      roots.push(node)
      continue
    }

    node.depth = parentNode.depth + 1
    parentNode.children.push(node)
  }

  const assignDepth = (items: UiNavigationNode[], depth = 0) => {
    for (const item of items) {
      item.depth = depth
      item.children.sort(compareMenuOrder)
      assignDepth(item.children, depth + 1)
    }
  }

  roots.sort(compareMenuOrder)
  assignDepth(roots)

  return roots
}

export const hasPermission = (
  permissionCodes: string[],
  requiredPermissionCode?: string | null,
) => {
  if (!requiredPermissionCode) {
    return true
  }

  return permissionCodes.includes(requiredPermissionCode)
}

export const filterAccessibleMenus = (
  menus: UiMenuItem[],
  permissionCodes: string[],
) => menus.filter((menu) => hasPermission(permissionCodes, menu.permissionCode))
