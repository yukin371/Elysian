import { and, desc, eq, inArray, sql } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import {
  type PaginatedResult,
  type PaginationQuery,
  buildPaginatedResult,
  normalizePagination,
} from "./query-utils"
import type { UserRow } from "./schema"
import { users } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

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

export interface UserPersistenceListQuery extends PaginationQuery {}

export type UserPersistenceListResult = PaginatedResult<UserRow>

const DEFAULT_USER_PAGE_SIZE = 20

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

export const listUsers = async (
  db: DatabaseClient,
  query: UserPersistenceListQuery = {},
): Promise<UserPersistenceListResult> => {
  const pagination = normalizePagination(query, DEFAULT_USER_PAGE_SIZE)
  const [countRow] = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(users)
  const total = countRow?.total ?? 0
  const paginated = buildPaginatedResult([], total, pagination)
  const items = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt), desc(users.id))
    .limit(pagination.pageSize)
    .offset((paginated.page - 1) * pagination.pageSize)

  return {
    ...paginated,
    items,
  }
}

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
