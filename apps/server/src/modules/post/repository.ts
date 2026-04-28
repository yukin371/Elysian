import {
  type DatabaseClient,
  type PostRow,
  getPostByCode,
  getPostById,
  insertPost,
  listPosts,
  updatePost,
} from "@elysian/persistence"
import type { PostRecord, PostStatus } from "@elysian/schema"

export interface CreatePostInput {
  code: string
  name: string
  sort?: number
  status?: PostStatus
  remark?: string
}

export interface UpdatePostInput {
  code?: string
  name?: string
  sort?: number
  status?: PostStatus
  remark?: string
}

export interface PostRepository {
  list: () => Promise<PostRecord[]>
  getById: (id: string) => Promise<PostRecord | null>
  getByCode: (code: string) => Promise<PostRecord | null>
  create: (input: CreatePostInput) => Promise<PostRecord>
  update: (id: string, input: UpdatePostInput) => Promise<PostRecord | null>
}

export interface InMemoryPostRepositorySeed {
  posts?: PostRecord[]
}

export const createPostRepository = (db: DatabaseClient): PostRepository => ({
  async list() {
    const rows = await listPosts(db)
    return rows.map(mapPostRow)
  },
  async getById(id) {
    const row = await getPostById(db, id)
    return row ? mapPostRow(row) : null
  },
  async getByCode(code) {
    const row = await getPostByCode(db, code)
    return row ? mapPostRow(row) : null
  },
  async create(input) {
    const row = await insertPost(db, {
      code: input.code,
      name: input.name,
      sort: input.sort,
      status: input.status,
      remark: input.remark ?? null,
    })

    return mapPostRow(row)
  },
  async update(id, input) {
    const row = await updatePost(db, id, {
      code: input.code,
      name: input.name,
      sort: input.sort,
      status: input.status,
      remark: input.remark,
    })

    return row ? mapPostRow(row) : null
  },
})

export const createInMemoryPostRepository = (
  seed: InMemoryPostRepositorySeed = {},
): PostRepository => {
  const items = new Map((seed.posts ?? []).map((item) => [item.id, item]))

  return {
    async list() {
      return [...items.values()].sort(comparePosts)
    },
    async getById(id) {
      return items.get(id) ?? null
    },
    async getByCode(code) {
      return [...items.values()].find((item) => item.code === code) ?? null
    },
    async create(input) {
      const now = new Date().toISOString()
      const post: PostRecord = {
        id: crypto.randomUUID(),
        code: input.code,
        name: input.name,
        sort: input.sort ?? 0,
        status: input.status ?? "active",
        remark: input.remark ?? "",
        createdAt: now,
        updatedAt: now,
      }

      items.set(post.id, post)
      return post
    },
    async update(id, input) {
      const existing = items.get(id)
      if (!existing) {
        return null
      }

      const updated: PostRecord = {
        ...existing,
        ...Object.fromEntries(
          Object.entries(input).filter(([, value]) => value !== undefined),
        ),
        updatedAt: new Date().toISOString(),
      }

      items.set(id, updated)
      return updated
    },
  }
}

const mapPostRow = (row: PostRow): PostRecord => ({
  id: row.id,
  code: row.code,
  name: row.name,
  sort: row.sort,
  status: row.status,
  remark: row.remark ?? "",
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const comparePosts = (left: PostRecord, right: PostRecord) =>
  left.sort - right.sort ||
  left.code.localeCompare(right.code) ||
  left.createdAt.localeCompare(right.createdAt)
