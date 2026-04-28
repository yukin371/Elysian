import { asc, eq, inArray } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import type { DepartmentRow } from "./schema"
import { departments, roleDepts, userDepartments } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

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
