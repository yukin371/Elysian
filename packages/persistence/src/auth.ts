import { and, asc, eq, inArray } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import type { RoleDataScopeValue } from "./role"
import {
  roleDepts,
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
  listExistingPermissionCodes,
  listPermissionCodesForRole,
  listPermissionCodesForUser,
  replaceRolePermissionCodes,
} from "./permission"
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
