import { and, asc, eq, inArray } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import { permissions, rolePermissions, roles, userRoles } from "./schema"

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
