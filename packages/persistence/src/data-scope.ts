import { type SQL, type SQLWrapper, eq, inArray, or, sql } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import { departments } from "./schema"

export type DataScopeValue = 1 | 2 | 3 | 4 | 5

export interface DataScopeGrant {
  scope: DataScopeValue
  customDeptIds?: string[]
}

export interface DataAccessContext {
  userId: string
  hasAllAccess: boolean
  accessibleDeptIds: string[]
  allowSelf: boolean
}

export interface DataAccessRecord {
  deptId?: string | null
  creatorId?: string | null
}

export interface ResolveDataAccessInput {
  userId: string
  deptIds: string[]
  dataScopes: DataScopeGrant[]
}

export interface BuildDataAccessConditionInput {
  deptColumn: SQLWrapper
  creatorColumn?: SQLWrapper
}

export const resolveDataAccessContext = async (
  db: DatabaseClient,
  input: ResolveDataAccessInput,
): Promise<DataAccessContext> => {
  const deptIds = normalizeIds(input.deptIds)
  const dataScopes = normalizeDataScopes(input.dataScopes)
  const hasAllAccess = dataScopes.some((grant) => grant.scope === 1)
  const allowSelf = dataScopes.some((grant) => grant.scope === 5)
  const accessibleDeptIds = new Set<string>()

  for (const grant of dataScopes) {
    if (grant.scope === 2) {
      for (const deptId of normalizeIds(grant.customDeptIds)) {
        accessibleDeptIds.add(deptId)
      }
      continue
    }

    if (grant.scope === 3) {
      for (const deptId of deptIds) {
        accessibleDeptIds.add(deptId)
      }
      continue
    }

    if (grant.scope === 4) {
      for (const deptId of await listDescendantDepartmentIds(db, deptIds)) {
        accessibleDeptIds.add(deptId)
      }
    }
  }

  return {
    userId: input.userId,
    hasAllAccess,
    accessibleDeptIds: [...accessibleDeptIds].sort(),
    allowSelf,
  }
}

export const buildDataAccessCondition = (
  context: DataAccessContext,
  input: BuildDataAccessConditionInput,
): SQL<unknown> | undefined => {
  if (context.hasAllAccess) {
    return undefined
  }

  const clauses: SQL<unknown>[] = []

  if (context.accessibleDeptIds.length > 0) {
    clauses.push(inArray(input.deptColumn, context.accessibleDeptIds))
  }

  if (context.allowSelf && input.creatorColumn) {
    clauses.push(eq(input.creatorColumn, context.userId))
  }

  if (clauses.length === 0) {
    return sql`1 = 0`
  }

  if (clauses.length === 1) {
    return clauses[0]
  }

  return or(...clauses) ?? sql`1 = 0`
}

export const matchesDataAccess = (
  context: DataAccessContext,
  record: DataAccessRecord,
): boolean => {
  if (context.hasAllAccess) {
    return true
  }

  if (record.deptId && context.accessibleDeptIds.includes(record.deptId)) {
    return true
  }

  if (context.allowSelf && record.creatorId === context.userId) {
    return true
  }

  return false
}

const listDescendantDepartmentIds = async (
  db: DatabaseClient,
  deptIds: string[],
): Promise<string[]> => {
  const normalizedDeptIds = normalizeIds(deptIds)

  if (normalizedDeptIds.length === 0) {
    return []
  }

  const rows = await db
    .select({
      id: departments.id,
      ancestors: departments.ancestors,
    })
    .from(departments)

  return rows
    .filter((row) => {
      const ancestorIds = row.ancestors
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)

      return normalizedDeptIds.some(
        (deptId) => row.id === deptId || ancestorIds.includes(deptId),
      )
    })
    .map((row) => row.id)
    .sort()
}

const normalizeDataScopes = (values: DataScopeGrant[]) =>
  values.map((value) => ({
    scope: value.scope,
    customDeptIds: normalizeIds(value.customDeptIds),
  }))

const normalizeIds = (values: string[] | undefined) =>
  [
    ...new Set((values ?? []).map((value) => value.trim()).filter(Boolean)),
  ].sort()
