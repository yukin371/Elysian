import { and, asc, desc, eq, inArray } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import {
  type AuditLogRow,
  type DepartmentRow,
  type MenuRow,
  type RefreshSessionRow,
  type RoleRow,
  type UserRow,
  auditLogs,
  departments,
  menus,
  permissions,
  refreshSessions,
  roleDepts,
  roleMenus,
  rolePermissions,
  roles,
  userDepartments,
  userRoles,
  users,
} from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export type AuditLogResult = "success" | "failure"
export type RoleDataScopeValue = 1 | 2 | 3 | 4 | 5

export interface DataScopeAssignment {
  scope: RoleDataScopeValue
  customDeptIds?: string[]
}

export interface CreateRefreshSessionPersistenceInput {
  id?: string
  userId: string
  tokenHash: string
  userAgent?: string | null
  ip?: string | null
  expiresAt: Date
  tenantId?: string
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

export interface CreateDepartmentPersistenceInput {
  id?: string
  parentId?: string | null
  code: string
  name: string
  sort?: number
  status?: "active" | "disabled"
  tenantId?: string
}

export interface UpdateDepartmentPersistenceInput {
  parentId?: string | null
  code?: string
  name?: string
  sort?: number
  status?: "active" | "disabled"
}

export interface CreateAuditLogPersistenceInput {
  id?: string
  category: string
  action: string
  actorUserId?: string | null
  targetType?: string | null
  targetId?: string | null
  result: AuditLogResult
  requestId?: string | null
  ip?: string | null
  userAgent?: string | null
  details?: Record<string, unknown> | null
  createdAt?: Date
  tenantId?: string
}

export interface ListAuditLogsPersistenceFilter {
  category?: string
  action?: string
  actorUserId?: string
  result?: AuditLogResult
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

export const listDepartments = async (
  db: DatabaseClient,
): Promise<DepartmentRow[]> =>
  db
    .select()
    .from(departments)
    .orderBy(
      asc(departments.sort),
      asc(departments.code),
      asc(departments.createdAt),
    )

export const getDepartmentById = async (
  db: DatabaseClient,
  id: string,
): Promise<DepartmentRow | null> => {
  const [row] = await db
    .select()
    .from(departments)
    .where(eq(departments.id, id))
    .limit(1)

  return row ?? null
}

export const getDepartmentByCode = async (
  db: DatabaseClient,
  code: string,
): Promise<DepartmentRow | null> => {
  const [row] = await db
    .select()
    .from(departments)
    .where(eq(departments.code, code))
    .limit(1)

  return row ?? null
}

export const insertDepartment = async (
  db: DatabaseClient,
  input: CreateDepartmentPersistenceInput,
): Promise<DepartmentRow> => {
  const ancestors = await resolveDepartmentAncestors(db, input.parentId ?? null)
  const [row] = await db
    .insert(departments)
    .values({
      ...(input.id ? { id: input.id } : {}),
      parentId: input.parentId ?? null,
      code: input.code,
      name: input.name,
      ancestors,
      sort: input.sort ?? 0,
      status: input.status ?? "active",
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Department insert did not return a row")
  }

  return row
}

export const updateDepartment = async (
  db: DatabaseClient,
  departmentId: string,
  input: UpdateDepartmentPersistenceInput,
): Promise<DepartmentRow | null> => {
  const current = await getDepartmentById(db, departmentId)

  if (!current) {
    return null
  }

  const entries = Object.entries(input).filter(
    ([, value]) => value !== undefined,
  )

  if (entries.length === 0) {
    return current
  }

  const parentId =
    input.parentId !== undefined ? (input.parentId ?? null) : current.parentId
  const ancestors = await resolveDepartmentAncestors(db, parentId)

  const [updatedRow] = await db
    .update(departments)
    .set({
      ...Object.fromEntries(entries),
      ancestors,
      updatedAt: new Date(),
    })
    .where(eq(departments.id, departmentId))
    .returning()

  if (!updatedRow) {
    return null
  }

  if (parentId !== current.parentId) {
    await rebuildDepartmentAncestors(db)
    return getDepartmentById(db, departmentId)
  }

  return updatedRow
}

export const listUserIdsForDepartment = async (
  db: DatabaseClient,
  departmentId: string,
): Promise<string[]> => {
  const rows = await db
    .select({
      userId: userDepartments.userId,
    })
    .from(userDepartments)
    .where(eq(userDepartments.departmentId, departmentId))
    .orderBy(asc(userDepartments.userId))

  return rows.map((row) => row.userId)
}

export const replaceDepartmentUserIds = async (
  db: DatabaseClient,
  departmentId: string,
  userIds: string[],
): Promise<void> => {
  await db
    .delete(userDepartments)
    .where(eq(userDepartments.departmentId, departmentId))

  const normalizedUserIds = [...new Set(userIds)]
  if (normalizedUserIds.length === 0) {
    return
  }

  await db.insert(userDepartments).values(
    normalizedUserIds.map((userId) => ({
      userId,
      departmentId,
    })),
  )
}

export const listDepartmentIdsForUser = async (
  db: DatabaseClient,
  userId: string,
): Promise<string[]> => {
  const rows = await db
    .select({
      departmentId: userDepartments.departmentId,
    })
    .from(userDepartments)
    .where(eq(userDepartments.userId, userId))
    .orderBy(asc(userDepartments.departmentId))

  return rows.map((row) => row.departmentId)
}

export const listExistingDepartmentIds = async (
  db: DatabaseClient,
  departmentIds: string[],
): Promise<string[]> => {
  if (departmentIds.length === 0) {
    return []
  }

  const rows = await db
    .select({
      id: departments.id,
    })
    .from(departments)
    .where(inArray(departments.id, [...new Set(departmentIds)]))

  return rows.map((row) => row.id).sort()
}

export const listDepartmentIdsForRole = async (
  db: DatabaseClient,
  roleId: string,
): Promise<string[]> => {
  const rows = await db
    .select({
      deptId: roleDepts.deptId,
    })
    .from(roleDepts)
    .where(eq(roleDepts.roleId, roleId))
    .orderBy(asc(roleDepts.deptId))

  return rows.map((row) => row.deptId)
}

export const replaceRoleDepartmentIds = async (
  db: DatabaseClient,
  roleId: string,
  departmentIds: string[],
): Promise<void> => {
  await db.delete(roleDepts).where(eq(roleDepts.roleId, roleId))

  const normalizedDepartmentIds = [...new Set(departmentIds)]
  if (normalizedDepartmentIds.length === 0) {
    return
  }

  await db.insert(roleDepts).values(
    normalizedDepartmentIds.map((deptId) => ({
      roleId,
      deptId,
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

const resolveDepartmentAncestors = async (
  db: DatabaseClient,
  parentId: string | null,
) => {
  if (!parentId) {
    return ""
  }

  const parent = await getDepartmentById(db, parentId)
  if (!parent) {
    throw new Error("Department parent does not exist")
  }

  return parent.ancestors ? `${parent.ancestors},${parent.id}` : parent.id
}

const rebuildDepartmentAncestors = async (db: DatabaseClient) => {
  const rows = await listDepartments(db)
  const rowsById = new Map(rows.map((row) => [row.id, row]))
  const resolved = new Map<string, string>()

  const resolveAncestors = (departmentId: string): string => {
    const cached = resolved.get(departmentId)
    if (cached !== undefined) {
      return cached
    }

    const row = rowsById.get(departmentId)
    if (!row || !row.parentId) {
      resolved.set(departmentId, "")
      return ""
    }

    const parentAncestors = resolveAncestors(row.parentId)
    const ancestors = parentAncestors
      ? `${parentAncestors},${row.parentId}`
      : row.parentId

    resolved.set(departmentId, ancestors)
    return ancestors
  }

  for (const row of rows) {
    const ancestors = resolveAncestors(row.id)
    if (ancestors === row.ancestors) {
      continue
    }

    await db
      .update(departments)
      .set({
        ancestors,
        updatedAt: new Date(),
      })
      .where(eq(departments.id, row.id))
  }
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

export const insertRefreshSession = async (
  db: DatabaseClient,
  input: CreateRefreshSessionPersistenceInput,
): Promise<RefreshSessionRow> => {
  const [row] = await db
    .insert(refreshSessions)
    .values({
      ...(input.id ? { id: input.id } : {}),
      userId: input.userId,
      tokenHash: input.tokenHash,
      userAgent: input.userAgent ?? null,
      ip: input.ip ?? null,
      expiresAt: input.expiresAt,
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Refresh session insert did not return a row")
  }

  return row
}

export const getRefreshSessionByTokenHash = async (
  db: DatabaseClient,
  tokenHash: string,
): Promise<RefreshSessionRow | null> => {
  const [row] = await db
    .select()
    .from(refreshSessions)
    .where(eq(refreshSessions.tokenHash, tokenHash))
    .limit(1)

  return row ?? null
}

export const getRefreshSessionById = async (
  db: DatabaseClient,
  sessionId: string,
): Promise<RefreshSessionRow | null> => {
  const [row] = await db
    .select()
    .from(refreshSessions)
    .where(eq(refreshSessions.id, sessionId))
    .limit(1)

  return row ?? null
}

export const listRefreshSessionsByUserId = async (
  db: DatabaseClient,
  userId: string,
): Promise<RefreshSessionRow[]> =>
  db
    .select()
    .from(refreshSessions)
    .where(eq(refreshSessions.userId, userId))
    .orderBy(desc(refreshSessions.createdAt))

export const revokeRefreshSession = async (
  db: DatabaseClient,
  sessionId: string,
  revokedAt: Date,
  replacedBySessionId?: string | null,
): Promise<void> => {
  await db
    .update(refreshSessions)
    .set({
      revokedAt,
      replacedBySessionId: replacedBySessionId ?? null,
      updatedAt: revokedAt,
    })
    .where(eq(refreshSessions.id, sessionId))
}

export const touchRefreshSession = async (
  db: DatabaseClient,
  sessionId: string,
  timestamp: Date,
): Promise<void> => {
  await db
    .update(refreshSessions)
    .set({
      lastUsedAt: timestamp,
      updatedAt: timestamp,
    })
    .where(eq(refreshSessions.id, sessionId))
}

export const insertAuditLog = async (
  db: DatabaseClient,
  input: CreateAuditLogPersistenceInput,
): Promise<AuditLogRow> => {
  const [row] = await db
    .insert(auditLogs)
    .values({
      ...(input.id ? { id: input.id } : {}),
      category: input.category,
      action: input.action,
      actorUserId: input.actorUserId ?? null,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      result: input.result,
      requestId: input.requestId ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      details: input.details ?? null,
      ...(input.createdAt ? { createdAt: input.createdAt } : {}),
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Audit log insert did not return a row")
  }

  return row
}

export const listAuditLogs = async (
  db: DatabaseClient,
  actorUserId?: string,
): Promise<AuditLogRow[]> => {
  const baseQuery = db.select().from(auditLogs)

  if (actorUserId === undefined) {
    return baseQuery.orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
  }

  return baseQuery
    .where(eq(auditLogs.actorUserId, actorUserId))
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
}

export const getAuditLogById = async (
  db: DatabaseClient,
  id: string,
): Promise<AuditLogRow | null> => {
  const [row] = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.id, id))
    .limit(1)

  return row ?? null
}

export const listAuditLogsByFilter = async (
  db: DatabaseClient,
  filter: ListAuditLogsPersistenceFilter = {},
): Promise<AuditLogRow[]> => {
  const conditions = [
    filter.category ? eq(auditLogs.category, filter.category) : undefined,
    filter.action ? eq(auditLogs.action, filter.action) : undefined,
    filter.actorUserId
      ? eq(auditLogs.actorUserId, filter.actorUserId)
      : undefined,
    filter.result ? eq(auditLogs.result, filter.result) : undefined,
  ].filter(Boolean)

  if (conditions.length === 0) {
    return db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
  }

  return db
    .select()
    .from(auditLogs)
    .where(and(...conditions))
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
}
