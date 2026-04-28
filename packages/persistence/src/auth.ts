import { and, asc, desc, eq, inArray } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import {
  type MenuRow,
  type RoleRow,
  type UserRow,
  menus,
  permissions,
  roleDepts,
  roleMenus,
  rolePermissions,
  roles,
  userRoles,
  users,
} from "./schema"
export {
  type CreateDepartmentPersistenceInput,
  getDepartmentByCode,
  getDepartmentById,
  insertDepartment,
  listDepartments,
  listDepartmentIdsForRole,
  listDepartmentIdsForUser,
  listExistingDepartmentIds,
  listUserIdsForDepartment,
  replaceDepartmentUserIds,
  replaceRoleDepartmentIds,
  type UpdateDepartmentPersistenceInput,
  updateDepartment,
} from "./department"
export {
  type CreatePostPersistenceInput,
  getPostByCode,
  getPostById,
  insertPost,
  listPosts,
  type UpdatePostPersistenceInput,
  updatePost,
} from "./post"
import { DEFAULT_TENANT_ID } from "./tenant"
export {
  type CreateRefreshSessionPersistenceInput,
  getRefreshSessionById,
  getRefreshSessionByTokenHash,
  insertRefreshSession,
  listRefreshSessionsByUserId,
  revokeRefreshSession,
  touchRefreshSession,
} from "./session"
export {
  type AuditLogResult,
  type CreateAuditLogPersistenceInput,
  getAuditLogById,
  insertAuditLog,
  listAuditLogs,
  listAuditLogsByFilter,
  type ListAuditLogsPersistenceFilter,
} from "./audit-log"
export type RoleDataScopeValue = 1 | 2 | 3 | 4 | 5

export interface DataScopeAssignment {
  scope: RoleDataScopeValue
  customDeptIds?: string[]
}

export interface CreateUserPersistenceInput {
  id?: string
  username: string
  displayName: string
  email?: string | null
  phone?: string | null
  passwordHash: string
  status?: "active" | "disabled"
  isSuperAdmin?: boolean
  tenantId?: string
}

export interface UpdateUserPersistenceInput {
  username?: string
  displayName?: string
  email?: string | null
  phone?: string | null
  status?: "active" | "disabled"
  isSuperAdmin?: boolean
}

export interface CreateRolePersistenceInput {
  id?: string
  code: string
  name: string
  description?: string | null
  status?: "active" | "disabled"
  isSystem?: boolean
  dataScope?: RoleDataScopeValue
  tenantId?: string
}

export interface UpdateRolePersistenceInput {
  code?: string
  name?: string
  description?: string | null
  status?: "active" | "disabled"
  isSystem?: boolean
  dataScope?: RoleDataScopeValue
}

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

export const getUserByUsername = async (
  db: DatabaseClient,
  username: string,
  tenantId?: string,
): Promise<UserRow | null> => {
  const [row] = await db
    .select()
    .from(users)
    .where(
      tenantId
        ? and(eq(users.username, username), eq(users.tenantId, tenantId))
        : eq(users.username, username),
    )
    .limit(1)

  return row ?? null
}

export const getUserById = async (
  db: DatabaseClient,
  id: string,
): Promise<UserRow | null> => {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)

  return row ?? null
}

export const updateUserLastLoginAt = async (
  db: DatabaseClient,
  userId: string,
  timestamp: Date,
): Promise<void> => {
  await db
    .update(users)
    .set({
      lastLoginAt: timestamp,
      updatedAt: timestamp,
    })
    .where(eq(users.id, userId))
}

export const listUsers = async (db: DatabaseClient): Promise<UserRow[]> =>
  db.select().from(users).orderBy(desc(users.createdAt), desc(users.id))

export const insertUser = async (
  db: DatabaseClient,
  input: CreateUserPersistenceInput,
): Promise<UserRow> => {
  const [row] = await db
    .insert(users)
    .values({
      ...(input.id ? { id: input.id } : {}),
      username: input.username,
      displayName: input.displayName,
      email: input.email ?? null,
      phone: input.phone ?? null,
      passwordHash: input.passwordHash,
      status: input.status ?? "active",
      isSuperAdmin: input.isSuperAdmin ?? false,
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("User insert did not return a row")
  }

  return row
}

export const updateUser = async (
  db: DatabaseClient,
  userId: string,
  input: UpdateUserPersistenceInput,
): Promise<UserRow | null> => {
  const entries = Object.entries(input).filter(
    ([, value]) => value !== undefined,
  )

  if (entries.length === 0) {
    return getUserById(db, userId)
  }

  const [row] = await db
    .update(users)
    .set({
      ...Object.fromEntries(entries),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  return row ?? null
}

export const updateUserPasswordHash = async (
  db: DatabaseClient,
  userId: string,
  passwordHash: string,
): Promise<UserRow | null> => {
  const [row] = await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  return row ?? null
}

export const listRoleCodesForUser = async (
  db: DatabaseClient,
  userId: string,
): Promise<string[]> => {
  const rows = await db
    .select({
      code: roles.code,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(eq(userRoles.userId, userId), eq(roles.status, "active")))
    .orderBy(asc(roles.code))

  return [...new Set(rows.map((row) => row.code))]
}

export const listRoles = async (db: DatabaseClient): Promise<RoleRow[]> =>
  db.select().from(roles).orderBy(desc(roles.createdAt), asc(roles.code))

export const listExistingRoleIds = async (
  db: DatabaseClient,
  roleIds: string[],
): Promise<string[]> => {
  if (roleIds.length === 0) {
    return []
  }

  const rows = await db
    .select({
      id: roles.id,
    })
    .from(roles)
    .where(inArray(roles.id, [...new Set(roleIds)]))

  return rows.map((row) => row.id).sort()
}

export const getRoleById = async (
  db: DatabaseClient,
  id: string,
): Promise<RoleRow | null> => {
  const [row] = await db.select().from(roles).where(eq(roles.id, id)).limit(1)

  return row ?? null
}

export const getRoleByCode = async (
  db: DatabaseClient,
  code: string,
): Promise<RoleRow | null> => {
  const [row] = await db
    .select()
    .from(roles)
    .where(eq(roles.code, code))
    .limit(1)

  return row ?? null
}

export const insertRole = async (
  db: DatabaseClient,
  input: CreateRolePersistenceInput,
): Promise<RoleRow> => {
  const [row] = await db
    .insert(roles)
    .values({
      ...(input.id ? { id: input.id } : {}),
      code: input.code,
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? "active",
      isSystem: input.isSystem ?? false,
      dataScope: input.dataScope ?? 1,
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Role insert did not return a row")
  }

  return row
}

export const updateRole = async (
  db: DatabaseClient,
  roleId: string,
  input: UpdateRolePersistenceInput,
): Promise<RoleRow | null> => {
  const entries = Object.entries(input).filter(
    ([, value]) => value !== undefined,
  )

  if (entries.length === 0) {
    return getRoleById(db, roleId)
  }

  const [row] = await db
    .update(roles)
    .set({
      ...Object.fromEntries(entries),
      updatedAt: new Date(),
    })
    .where(eq(roles.id, roleId))
    .returning()

  return row ?? null
}

export const listPermissionCodesForUser = async (
  db: DatabaseClient,
  userId: string,
): Promise<string[]> => {
  const rows = await db
    .select({
      code: permissions.code,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(userRoles.userId, userId), eq(roles.status, "active")))
    .orderBy(asc(permissions.code))

  return [...new Set(rows.map((row) => row.code))]
}

export const listPermissionCodesForRole = async (
  db: DatabaseClient,
  roleId: string,
): Promise<string[]> => {
  const rows = await db
    .select({
      code: permissions.code,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId))
    .orderBy(asc(permissions.code))

  return [...new Set(rows.map((row) => row.code))]
}

export const listExistingPermissionCodes = async (
  db: DatabaseClient,
  codes: string[],
): Promise<string[]> => {
  if (codes.length === 0) {
    return []
  }

  const rows = await db
    .select({
      code: permissions.code,
    })
    .from(permissions)
    .where(inArray(permissions.code, [...new Set(codes)]))

  return rows.map((row) => row.code).sort()
}

export const replaceRolePermissionCodes = async (
  db: DatabaseClient,
  roleId: string,
  codes: string[],
): Promise<void> => {
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))

  const normalizedCodes = [...new Set(codes)]
  if (normalizedCodes.length === 0) {
    return
  }

  const rows = await db
    .select({
      id: permissions.id,
    })
    .from(permissions)
    .where(inArray(permissions.code, normalizedCodes))

  if (rows.length === 0) {
    return
  }

  await db.insert(rolePermissions).values(
    rows.map((row) => ({
      roleId,
      permissionId: row.id,
    })),
  )
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

export const listUserIdsForRole = async (
  db: DatabaseClient,
  roleId: string,
): Promise<string[]> => {
  const rows = await db
    .select({
      userId: userRoles.userId,
    })
    .from(userRoles)
    .where(eq(userRoles.roleId, roleId))
    .orderBy(asc(userRoles.userId))

  return rows.map((row) => row.userId)
}

export const listExistingUserIds = async (
  db: DatabaseClient,
  userIds: string[],
): Promise<string[]> => {
  if (userIds.length === 0) {
    return []
  }

  const rows = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(inArray(users.id, [...new Set(userIds)]))

  return rows.map((row) => row.id).sort()
}

export const listDataScopesForUser = async (
  db: DatabaseClient,
  userId: string,
): Promise<DataScopeAssignment[]> => {
  const rows = await db
    .select({
      roleId: roles.id,
      dataScope: roles.dataScope,
      code: roles.code,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(eq(userRoles.userId, userId), eq(roles.status, "active")))
    .orderBy(asc(roles.code))

  const customScopeRoleIds = rows
    .filter((row) => row.dataScope === 2)
    .map((row) => row.roleId)
  const customDeptRows =
    customScopeRoleIds.length === 0
      ? []
      : await db
          .select({
            roleId: roleDepts.roleId,
            deptId: roleDepts.deptId,
          })
          .from(roleDepts)
          .where(inArray(roleDepts.roleId, customScopeRoleIds))
          .orderBy(asc(roleDepts.roleId), asc(roleDepts.deptId))

  const customDeptIdsByRole = new Map<string, string[]>()
  for (const row of customDeptRows) {
    const ids = customDeptIdsByRole.get(row.roleId) ?? []
    ids.push(row.deptId)
    customDeptIdsByRole.set(row.roleId, ids)
  }

  return rows.map((row) => ({
    scope: row.dataScope as RoleDataScopeValue,
    customDeptIds:
      row.dataScope === 2
        ? [...new Set(customDeptIdsByRole.get(row.roleId) ?? [])].sort()
        : undefined,
  }))
}

export const replaceRoleUserIds = async (
  db: DatabaseClient,
  roleId: string,
  userIds: string[],
): Promise<void> => {
  await db.delete(userRoles).where(eq(userRoles.roleId, roleId))

  const normalizedUserIds = [...new Set(userIds)]
  if (normalizedUserIds.length === 0) {
    return
  }

  await db.insert(userRoles).values(
    normalizedUserIds.map((userId) => ({
      userId,
      roleId,
    })),
  )
}
