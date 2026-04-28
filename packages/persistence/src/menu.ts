import { and, asc, eq } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import type { MenuRow } from "./schema"
import { menus, roleMenus, roles, userRoles } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export interface CreateMenuPersistenceInput {
  id?: string
  parentId?: string | null
  type: "directory" | "menu" | "button"
  code: string
  name: string
  path?: string | null
  component?: string | null
  icon?: string | null
  sort?: number
  isVisible?: boolean
  status?: "active" | "disabled"
  permissionCode?: string | null
  tenantId?: string
}

export interface UpdateMenuPersistenceInput {
  parentId?: string | null
  type?: "directory" | "menu" | "button"
  code?: string
  name?: string
  path?: string | null
  component?: string | null
  icon?: string | null
  sort?: number
  isVisible?: boolean
  status?: "active" | "disabled"
  permissionCode?: string | null
}

export const listMenusForUser = async (
  db: DatabaseClient,
  userId: string,
): Promise<MenuRow[]> => {
  const rows = await db
    .select({
      menu: menus,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(roleMenus, eq(roleMenus.roleId, roles.id))
    .innerJoin(menus, eq(roleMenus.menuId, menus.id))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(roles.status, "active"),
        eq(menus.status, "active"),
      ),
    )
    .orderBy(asc(menus.sort), asc(menus.code))

  const uniqueMenus = new Map<string, MenuRow>()

  for (const row of rows) {
    uniqueMenus.set(row.menu.id, row.menu)
  }

  return [...uniqueMenus.values()]
}

export const listMenus = async (db: DatabaseClient): Promise<MenuRow[]> =>
  db
    .select()
    .from(menus)
    .orderBy(asc(menus.sort), asc(menus.code), asc(menus.createdAt))

export const getMenuById = async (
  db: DatabaseClient,
  id: string,
): Promise<MenuRow | null> => {
  const [row] = await db.select().from(menus).where(eq(menus.id, id)).limit(1)

  return row ?? null
}

export const getMenuByCode = async (
  db: DatabaseClient,
  code: string,
): Promise<MenuRow | null> => {
  const [row] = await db
    .select()
    .from(menus)
    .where(eq(menus.code, code))
    .limit(1)

  return row ?? null
}

export const insertMenu = async (
  db: DatabaseClient,
  input: CreateMenuPersistenceInput,
): Promise<MenuRow> => {
  const [row] = await db
    .insert(menus)
    .values({
      ...(input.id ? { id: input.id } : {}),
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
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Menu insert did not return a row")
  }

  return row
}

export const updateMenu = async (
  db: DatabaseClient,
  menuId: string,
  input: UpdateMenuPersistenceInput,
): Promise<MenuRow | null> => {
  const entries = Object.entries(input).filter(
    ([, value]) => value !== undefined,
  )

  if (entries.length === 0) {
    return getMenuById(db, menuId)
  }

  const [row] = await db
    .update(menus)
    .set({
      ...Object.fromEntries(entries),
      updatedAt: new Date(),
    })
    .where(eq(menus.id, menuId))
    .returning()

  return row ?? null
}

export const listRoleIdsForMenu = async (
  db: DatabaseClient,
  menuId: string,
): Promise<string[]> => {
  const rows = await db
    .select({
      roleId: roleMenus.roleId,
    })
    .from(roleMenus)
    .where(eq(roleMenus.menuId, menuId))
    .orderBy(asc(roleMenus.roleId))

  return rows.map((row) => row.roleId)
}

export const replaceMenuRoleIds = async (
  db: DatabaseClient,
  menuId: string,
  roleIds: string[],
): Promise<void> => {
  await db.delete(roleMenus).where(eq(roleMenus.menuId, menuId))

  const normalizedRoleIds = [...new Set(roleIds)]
  if (normalizedRoleIds.length === 0) {
    return
  }

  await db.insert(roleMenus).values(
    normalizedRoleIds.map((roleId) => ({
      roleId,
      menuId,
    })),
  )
}
