import { and, asc, desc, eq, inArray } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import type { RoleDataScopeValue } from "./role"
import {
  permissions,
  roleDepts,
  rolePermissions,
  roles,
  userRoles,
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
  type CreateMenuPersistenceInput,
  getMenuByCode,
  getMenuById,
  insertMenu,
  listMenus,
  listMenusForUser,
  listRoleIdsForMenu,
  replaceMenuRoleIds,
  type UpdateMenuPersistenceInput,
  updateMenu,
} from "./menu"
export {
  type CreatePostPersistenceInput,
  getPostByCode,
  getPostById,
  insertPost,
  listPosts,
  type UpdatePostPersistenceInput,
  updatePost,
} from "./post"
export {
  type CreateRolePersistenceInput,
  getRoleByCode,
  getRoleById,
  insertRole,
  listExistingRoleIds,
  listRoleCodesForUser,
  listRoles,
  listUserIdsForRole,
  replaceRoleUserIds,
  type RoleDataScopeValue,
  type UpdateRolePersistenceInput,
  updateRole,
} from "./role"
export {
  type CreateUserPersistenceInput,
  getUserById,
  getUserByUsername,
  insertUser,
  listExistingUserIds,
  listUsers,
  type UpdateUserPersistenceInput,
  updateUser,
  updateUserLastLoginAt,
  updateUserPasswordHash,
} from "./user"
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

export interface DataScopeAssignment {
  scope: RoleDataScopeValue
  customDeptIds?: string[]
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
