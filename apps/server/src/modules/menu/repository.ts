import {
  type DatabaseClient,
  type MenuRow,
  getMenuByCode,
  getMenuById,
  insertMenu,
  listExistingPermissionCodes,
  listExistingRoleIds,
  listMenus,
  listRoleIdsForMenu,
  replaceMenuRoleIds,
  updateMenu,
} from "@elysian/persistence"
import type {
  MenuDetailRecord,
  MenuRecord,
  MenuStatus,
  MenuType,
} from "@elysian/schema"

export interface CreateMenuInput {
  parentId?: string | null
  type: MenuType
  code: string
  name: string
  path?: string | null
  component?: string | null
  icon?: string | null
  sort?: number
  isVisible?: boolean
  status?: MenuStatus
  permissionCode?: string | null
  roleIds?: string[]
}

export interface UpdateMenuInput {
  parentId?: string | null
  type?: MenuType
  code?: string
  name?: string
  path?: string | null
  component?: string | null
  icon?: string | null
  sort?: number
  isVisible?: boolean
  status?: MenuStatus
  permissionCode?: string | null
  roleIds?: string[]
}

export interface MenuRepository {
  list: () => Promise<MenuRecord[]>
  getById: (id: string) => Promise<MenuDetailRecord | null>
  getByCode: (code: string) => Promise<MenuDetailRecord | null>
  create: (input: CreateMenuInput) => Promise<MenuDetailRecord>
  update: (
    id: string,
    input: UpdateMenuInput,
  ) => Promise<MenuDetailRecord | null>
  listExistingPermissionCodes: (codes: string[]) => Promise<string[]>
  listExistingRoleIds: (roleIds: string[]) => Promise<string[]>
}

export interface InMemoryMenuRepositorySeed {
  menus?: MenuDetailRecord[]
  availablePermissionCodes?: string[]
  availableRoleIds?: string[]
}

interface StoredMenuRecord extends MenuDetailRecord {}

export const createMenuRepository = (db: DatabaseClient): MenuRepository => ({
  async list() {
    const rows = await listMenus(db)
    return rows.map(mapMenuRow)
  },
  async getById(id) {
    const row = await getMenuById(db, id)
    return row ? buildMenuDetailRecord(db, row) : null
  },
  async getByCode(code) {
    const row = await getMenuByCode(db, code)
    return row ? buildMenuDetailRecord(db, row) : null
  },
  async create(input) {
    const row = await insertMenu(db, {
      parentId: input.parentId,
      type: input.type,
      code: input.code,
      name: input.name,
      path: input.path,
      component: input.component,
      icon: input.icon,
      sort: input.sort,
      isVisible: input.isVisible,
      status: input.status,
      permissionCode: input.permissionCode,
    })

    await replaceMenuRoleIds(db, row.id, input.roleIds ?? [])

    return buildMenuDetailRecord(db, row)
  },
  async update(id, input) {
    const row = await updateMenu(db, id, {
      parentId: input.parentId,
      type: input.type,
      code: input.code,
      name: input.name,
      path: input.path,
      component: input.component,
      icon: input.icon,
      sort: input.sort,
      isVisible: input.isVisible,
      status: input.status,
      permissionCode: input.permissionCode,
    })

    if (!row) {
      return null
    }

    if (input.roleIds !== undefined) {
      await replaceMenuRoleIds(db, id, input.roleIds)
    }

    return buildMenuDetailRecord(db, row)
  },
  listExistingPermissionCodes: (codes) =>
    listExistingPermissionCodes(db, codes),
  listExistingRoleIds: (roleIds) => listExistingRoleIds(db, roleIds),
})

export const createInMemoryMenuRepository = (
  seed: InMemoryMenuRepositorySeed = {},
): MenuRepository => {
  const menus = new Map(
    (seed.menus ?? []).map((menu) => [menu.id, mapMenuDetailToStored(menu)]),
  )
  const availablePermissionCodes = new Set(seed.availablePermissionCodes ?? [])
  const availableRoleIds = new Set(seed.availableRoleIds ?? [])

  return {
    async list() {
      return [...menus.values()].sort(compareMenus).map(mapStoredToMenuRecord)
    },
    async getById(id) {
      const menu = menus.get(id)
      return menu ? mapStoredToMenuDetail(menu) : null
    },
    async getByCode(code) {
      const menu = [...menus.values()].find((item) => item.code === code)
      return menu ? mapStoredToMenuDetail(menu) : null
    },
    async create(input) {
      const now = new Date().toISOString()
      const menu: StoredMenuRecord = {
        id: crypto.randomUUID(),
        parentId: input.parentId ?? null,
        type: input.type,
        code: input.code,
        name: input.name,
        path: input.path ?? null,
        component: input.component ?? null,
        icon: input.icon ?? null,
        sort: input.sort ?? 0,
        isVisible: input.isVisible ?? true,
        status: input.status ?? "active",
        permissionCode: input.permissionCode ?? null,
        roleIds: [...new Set(input.roleIds ?? [])].sort(),
        createdAt: now,
        updatedAt: now,
      }

      menus.set(menu.id, menu)
      return mapStoredToMenuDetail(menu)
    },
    async update(id, input) {
      const existing = menus.get(id)
      if (!existing) {
        return null
      }

      const updated: StoredMenuRecord = {
        ...existing,
        ...Object.fromEntries(
          Object.entries({
            parentId: input.parentId,
            type: input.type,
            code: input.code,
            name: input.name,
            path: input.path,
            component: input.component,
            icon: input.icon,
            sort: input.sort,
            isVisible: input.isVisible,
            status: input.status,
            permissionCode: input.permissionCode,
          }).filter(([, value]) => value !== undefined),
        ),
        roleIds:
          input.roleIds !== undefined
            ? [...new Set(input.roleIds)].sort()
            : existing.roleIds,
        updatedAt: new Date().toISOString(),
      }

      menus.set(id, updated)
      return mapStoredToMenuDetail(updated)
    },
    async listExistingPermissionCodes(codes) {
      return [...new Set(codes)]
        .filter((code) => availablePermissionCodes.has(code))
        .sort()
    },
    async listExistingRoleIds(roleIds) {
      return [...new Set(roleIds)]
        .filter((roleId) => availableRoleIds.has(roleId))
        .sort()
    },
  }
}

const buildMenuDetailRecord = async (
  db: DatabaseClient,
  row: MenuRow,
): Promise<MenuDetailRecord> => ({
  ...mapMenuRow(row),
  roleIds: await listRoleIdsForMenu(db, row.id),
})

const mapMenuRow = (row: MenuRow): MenuRecord => ({
  id: row.id,
  parentId: row.parentId ?? null,
  type: row.type,
  code: row.code,
  name: row.name,
  path: row.path ?? null,
  component: row.component ?? null,
  icon: row.icon ?? null,
  sort: row.sort,
  isVisible: row.isVisible,
  status: row.status,
  permissionCode: row.permissionCode ?? null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapMenuDetailToStored = (menu: MenuDetailRecord): StoredMenuRecord => ({
  ...menu,
  roleIds: [...menu.roleIds].sort(),
})

const mapStoredToMenuRecord = (menu: StoredMenuRecord): MenuRecord => ({
  id: menu.id,
  parentId: menu.parentId,
  type: menu.type,
  code: menu.code,
  name: menu.name,
  path: menu.path,
  component: menu.component,
  icon: menu.icon,
  sort: menu.sort,
  isVisible: menu.isVisible,
  status: menu.status,
  permissionCode: menu.permissionCode,
  createdAt: menu.createdAt,
  updatedAt: menu.updatedAt,
})

const mapStoredToMenuDetail = (menu: StoredMenuRecord): MenuDetailRecord => ({
  ...mapStoredToMenuRecord(menu),
  roleIds: [...menu.roleIds],
})

const compareMenus = (left: StoredMenuRecord, right: StoredMenuRecord) =>
  left.sort - right.sort || left.name.localeCompare(right.name)
