import { type SQL, and, asc, desc, eq, ilike, sql } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import {
  type PaginatedResult,
  type PaginationQuery,
  buildPaginatedResult,
  normalizePagination,
} from "./query-utils"
import { type FileRow, files } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export interface CreateFilePersistenceInput {
  id?: string
  originalName: string
  storageKey: string
  mimeType?: string | null
  size: number
  uploaderUserId?: string | null
  deptId?: string | null
  tenantId?: string
}

export interface FilePersistenceQueryOptions {
  originalName?: string
  mimeType?: string
  uploaderUserId?: string
  page?: number
  pageSize?: number
  accessCondition?: SQL<unknown>
}

export interface FilePersistenceListQuery extends PaginationQuery {
  originalName?: string
  mimeType?: string
  uploaderUserId?: string
}

export type FilePersistenceListResult = PaginatedResult<FileRow>

const DEFAULT_FILE_PAGE_SIZE = 20

export const listFiles = async (
  db: DatabaseClient,
  options: FilePersistenceQueryOptions = {},
): Promise<FilePersistenceListResult> => {
  const pagination = normalizePagination(options, DEFAULT_FILE_PAGE_SIZE)
  const conditions = [
    options.originalName?.trim()
      ? ilike(files.originalName, `%${options.originalName.trim()}%`)
      : undefined,
    options.mimeType?.trim()
      ? ilike(files.mimeType, `%${options.mimeType.trim()}%`)
      : undefined,
    options.uploaderUserId?.trim()
      ? ilike(files.uploaderUserId, `%${options.uploaderUserId.trim()}%`)
      : undefined,
    options.accessCondition,
  ].filter(Boolean)

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined
  const [countRow] = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(files)
    .where(whereCondition)

  const total = countRow?.total ?? 0
  const paginated = buildPaginatedResult([], total, pagination)
  const items = await db
    .select()
    .from(files)
    .where(whereCondition)
    .orderBy(desc(files.createdAt), asc(files.originalName))
    .limit(pagination.pageSize)
    .offset((paginated.page - 1) * pagination.pageSize)

  return {
    ...paginated,
    items,
  }
}

export const getFileById = async (
  db: DatabaseClient,
  id: string,
  options: FilePersistenceQueryOptions = {},
): Promise<FileRow | null> => {
  const conditions = [eq(files.id, id), options.accessCondition].filter(Boolean)
  const [row] = await db
    .select()
    .from(files)
    .where(and(...conditions))
    .limit(1)

  return row ?? null
}

export const insertFile = async (
  db: DatabaseClient,
  input: CreateFilePersistenceInput,
): Promise<FileRow> => {
  const [row] = await db
    .insert(files)
    .values({
      ...(input.id ? { id: input.id } : {}),
      originalName: input.originalName,
      storageKey: input.storageKey,
      mimeType: input.mimeType ?? null,
      size: input.size,
      uploaderUserId: input.uploaderUserId ?? null,
      deptId: input.deptId ?? null,
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("File insert did not return a row")
  }

  return row
}

export const deleteFile = async (
  db: DatabaseClient,
  id: string,
  options: FilePersistenceQueryOptions = {},
): Promise<FileRow | null> => {
  const conditions = [eq(files.id, id), options.accessCondition].filter(Boolean)
  const [row] = await db
    .delete(files)
    .where(and(...conditions))
    .returning()

  return row ?? null
}
