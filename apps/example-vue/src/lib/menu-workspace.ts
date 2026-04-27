import type { MenuRecord } from "./platform-api"

export interface MenuWorkspaceQuery {
  type?: MenuRecord["type"] | ""
  code?: string
  name?: string
  path?: string
  component?: string
  icon?: string
  permissionCode?: string
  status?: MenuRecord["status"] | ""
}

export interface MenuParentOption {
  label: string
  value: string
}

export interface MenuTableItem
  extends Omit<
    MenuRecord,
    "parentId" | "type" | "isVisible" | "status" | "createdAt" | "updatedAt"
  > {
  parentId: string
  type: string
  isVisible: string
  status: string
  createdAt: string
  updatedAt: string
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const createDefaultMenuDraft = () => ({
  parentId: "",
  type: "menu" as MenuRecord["type"],
  code: "",
  name: "",
  path: "",
  component: "",
  icon: "",
  sort: 10,
  isVisible: true,
  status: "active" as MenuRecord["status"],
  permissionCode: "",
})

export const normalizeMenuText = (value: unknown) => String(value ?? "").trim()

export const normalizeOptionalMenuText = (value: unknown) => {
  const normalized = normalizeMenuText(value)
  return normalized.length > 0 ? normalized : undefined
}

export const normalizeOptionalMenuId = (value: unknown) => {
  const normalized = normalizeMenuText(value)
  return normalized.length > 0 ? normalized : undefined
}

export const normalizeMenuSort = (value: unknown) => {
  const normalized =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)

  return Number.isFinite(normalized) ? normalized : 10
}

export const normalizeMenuStatus = (value: unknown): MenuRecord["status"] =>
  value === "disabled" ? "disabled" : "active"

export const normalizeMenuBoolean = (value: unknown) => value === true

export const normalizeMenuType = (value: unknown): MenuRecord["type"] => {
  if (value === "directory" || value === "button") {
    return value
  }

  return "menu"
}

export const filterMenus = (menus: MenuRecord[], query: MenuWorkspaceQuery) => {
  const type = query.type ?? ""
  const code = normalizeQueryValue(query.code)
  const name = normalizeQueryValue(query.name)
  const path = normalizeQueryValue(query.path)
  const component = normalizeQueryValue(query.component)
  const icon = normalizeQueryValue(query.icon)
  const permissionCode = normalizeQueryValue(query.permissionCode)
  const status = query.status ?? ""

  return menus.filter((menu) => {
    if (type && menu.type !== type) {
      return false
    }

    if (code.length > 0 && !menu.code.toLowerCase().includes(code)) {
      return false
    }

    if (name.length > 0 && !menu.name.toLowerCase().includes(name)) {
      return false
    }

    if (path.length > 0 && !(menu.path ?? "").toLowerCase().includes(path)) {
      return false
    }

    if (
      component.length > 0 &&
      !(menu.component ?? "").toLowerCase().includes(component)
    ) {
      return false
    }

    if (icon.length > 0 && !(menu.icon ?? "").toLowerCase().includes(icon)) {
      return false
    }

    if (
      permissionCode.length > 0 &&
      !(menu.permissionCode ?? "").toLowerCase().includes(permissionCode)
    ) {
      return false
    }

    if (status && menu.status !== status) {
      return false
    }

    return true
  })
}

export const resolveMenuSelection = (
  menus: Array<Pick<MenuRecord, "id">>,
  selectedMenuId: string | null,
) => {
  if (menus.length === 0) {
    return null
  }

  if (selectedMenuId && menus.some((menu) => menu.id === selectedMenuId)) {
    return selectedMenuId
  }

  return menus[0]?.id ?? null
}

export const createMenuParentLookup = (menus: MenuRecord[]) =>
  new Map(menus.map((menu) => [menu.id, menu]))

export const createMenuBlockedParentIds = (
  menus: MenuRecord[],
  selectedMenuId: string | null,
) => {
  if (!selectedMenuId) {
    return new Set<string>()
  }

  const blocked = new Set<string>([selectedMenuId])
  const queue = [selectedMenuId]

  while (queue.length > 0) {
    const currentId = queue.shift()

    if (!currentId) {
      continue
    }

    for (const menu of menus) {
      if (menu.parentId === currentId && !blocked.has(menu.id)) {
        blocked.add(menu.id)
        queue.push(menu.id)
      }
    }
  }

  return blocked
}

export const createMenuParentOptions = (
  menus: MenuRecord[],
  selectedMenuId: string | null,
  rootLabel: string,
): MenuParentOption[] => {
  const blockedParentIds = createMenuBlockedParentIds(menus, selectedMenuId)

  return [
    {
      label: rootLabel,
      value: "",
    },
    ...menus
      .filter((menu) => !blockedParentIds.has(menu.id))
      .map((menu) => ({
        label: `${menu.name} (${menu.code})`,
        value: menu.id,
      })),
  ]
}

export const createMenuTableItems = (
  menus: MenuRecord[],
  options: {
    parentLookup: Map<string, MenuRecord>
    rootLabel: string
    localizeType: (type: MenuRecord["type"]) => string
    localizeBoolean: (value: boolean) => string
    localizeStatus: (status: MenuRecord["status"]) => string
    formatDateTime: (value: string) => string
  },
): MenuTableItem[] =>
  menus.map((menu) => ({
    ...menu,
    parentId: menu.parentId
      ? (options.parentLookup.get(menu.parentId)?.name ?? menu.parentId)
      : options.rootLabel,
    type: options.localizeType(menu.type),
    isVisible: options.localizeBoolean(menu.isVisible),
    status: options.localizeStatus(menu.status),
    createdAt: options.formatDateTime(menu.createdAt),
    updatedAt: options.formatDateTime(menu.updatedAt),
  }))
