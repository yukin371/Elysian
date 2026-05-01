import { and, asc, eq } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import type { RoleDataScopeValue } from "./role"
import { roleDepts, roles, userRoles, users } from "./schema"
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

export interface UpdateUserLoginFailureStateInput {
  loginFailureCount: number
  lastLoginFailedAt: Date | null
  loginLockedUntil: Date | null
}

export const updateUserLoginFailureState = async (
  db: DatabaseClient,
  userId: string,
  input: UpdateUserLoginFailureStateInput,
  timestamp: Date,
): Promise<void> => {
  await db
    .update(users)
    .set({
      loginFailureCount: input.loginFailureCount,
      lastLoginFailedAt: input.lastLoginFailedAt,
      loginLockedUntil: input.loginLockedUntil,
      updatedAt: timestamp,
    })
    .where(eq(users.id, userId))
}

export const recordUserSuccessfulLogin = async (
  db: DatabaseClient,
  userId: string,
  timestamp: Date,
): Promise<void> => {
  await db
    .update(users)
    .set({
      lastLoginAt: timestamp,
      loginFailureCount: 0,
      lastLoginFailedAt: null,
      loginLockedUntil: null,
      updatedAt: timestamp,
    })
    .where(eq(users.id, userId))
}

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
      deptId: roleDepts.deptId,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .leftJoin(roleDepts, eq(roleDepts.roleId, roles.id))
    .where(and(eq(userRoles.userId, userId), eq(roles.status, "active")))
    .orderBy(asc(roles.code), asc(roleDepts.deptId))

  const assignmentsByRole = new Map<
    string,
    {
      scope: RoleDataScopeValue
      customDeptIds: string[]
    }
  >()

  for (const row of rows) {
    const assignment = assignmentsByRole.get(row.roleId) ?? {
      scope: row.dataScope as RoleDataScopeValue,
      customDeptIds: [],
    }

    if (row.dataScope === 2 && row.deptId) {
      assignment.customDeptIds.push(row.deptId)
    }

    assignmentsByRole.set(row.roleId, assignment)
  }

  return [...assignmentsByRole.values()].map((assignment) => ({
    scope: assignment.scope,
    customDeptIds:
      assignment.scope === 2
        ? [...new Set(assignment.customDeptIds)].sort()
        : undefined,
  }))
}
