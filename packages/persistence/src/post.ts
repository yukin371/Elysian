import { asc, eq } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import type { PostRow } from "./schema"
import { posts } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export interface CreatePostPersistenceInput {
  id?: string
  code: string
  name: string
  sort?: number
  status?: "active" | "disabled"
  remark?: string | null
  tenantId?: string
}

export interface UpdatePostPersistenceInput {
  code?: string
  name?: string
  sort?: number
  status?: "active" | "disabled"
  remark?: string | null
}

export const listPosts = async (db: DatabaseClient): Promise<PostRow[]> =>
  db.select().from(posts).orderBy(asc(posts.sort), asc(posts.code), asc(posts.createdAt))

export const getPostById = async (
  db: DatabaseClient,
  id: string,
): Promise<PostRow | null> => {
  const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)

  return row ?? null
}

export const getPostByCode = async (
  db: DatabaseClient,
  code: string,
): Promise<PostRow | null> => {
  const [row] = await db
    .select()
    .from(posts)
    .where(eq(posts.code, code))
    .limit(1)

  return row ?? null
}

export const insertPost = async (
  db: DatabaseClient,
  input: CreatePostPersistenceInput,
): Promise<PostRow> => {
  const [row] = await db
    .insert(posts)
    .values({
      ...(input.id ? { id: input.id } : {}),
      code: input.code,
      name: input.name,
      sort: input.sort ?? 0,
      status: input.status ?? "active",
      remark: input.remark ?? null,
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Post insert did not return a row")
  }

  return row
}

export const updatePost = async (
  db: DatabaseClient,
  postId: string,
  input: UpdatePostPersistenceInput,
): Promise<PostRow | null> => {
  const entries = Object.entries(input).filter(
    ([, value]) => value !== undefined,
  )

  if (entries.length === 0) {
    return getPostById(db, postId)
  }

  const [row] = await db
    .update(posts)
    .set({
      ...Object.fromEntries(entries),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning()

  return row ?? null
}
