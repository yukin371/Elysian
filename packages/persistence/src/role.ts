import { and, asc, desc, eq, inArray } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import type { RoleRow } from "./schema"
import { roles, userRoles } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export type RoleDataScopeValue = 1 | 2 | 3 | 4 | 5

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
