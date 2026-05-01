import {
  type DatabaseClient,
  type UserPersistenceListResult,
  type UserRow,
  getUserById,
  getUserByUsername,
  insertUser,
  listUsers,
  updateUser,
  updateUserPasswordHash,
} from "@elysian/persistence"
import type { UserRecord, UserStatus } from "@elysian/schema"

export interface CreateUserInput {
  username: string
  displayName: string
  email?: string
  phone?: string
  passwordHash: string
  status?: UserStatus
  isSuperAdmin?: boolean
}

export interface UpdateUserInput {
  username?: string
  displayName?: string
  email?: string
  phone?: string
  status?: UserStatus
  isSuperAdmin?: boolean
}

export interface ListUsersInput {
  page?: number
  pageSize?: number
}

export interface UserListResult {
  items: UserRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UserRepository {
  list: (input?: ListUsersInput) => Promise<UserListResult>
  getById: (id: string) => Promise<UserRecord | null>
  getByUsername: (username: string) => Promise<UserRecord | null>
  create: (input: CreateUserInput) => Promise<UserRecord>
  update: (id: string, input: UpdateUserInput) => Promise<UserRecord | null>
  resetPassword: (id: string, passwordHash: string) => Promise<boolean>
}

interface StoredUserRecord extends UserRecord {
  passwordHash: string
}

export const createUserRepository = (db: DatabaseClient): UserRepository => ({
  async list(input = {}) {
    const payload = await listUsers(db, input)
    return mapUserListResult(payload)
  },
  async getById(id) {
    const row = await getUserById(db, id)
    return row ? mapUserRow(row) : null
  },
  async getByUsername(username) {
    const row = await getUserByUsername(db, username)
    return row ? mapUserRow(row) : null
  },
  async create(input) {
    const row = await insertUser(db, {
      username: input.username,
      displayName: input.displayName,
      email: input.email ?? null,
      phone: input.phone ?? null,
      passwordHash: input.passwordHash,
      status: input.status,
      isSuperAdmin: input.isSuperAdmin,
    })

    return mapUserRow(row)
  },
  async update(id, input) {
    const row = await updateUser(db, id, {
      username: input.username,
      displayName: input.displayName,
      email: input.email,
      phone: input.phone,
      status: input.status,
      isSuperAdmin: input.isSuperAdmin,
    })

    return row ? mapUserRow(row) : null
  },
  async resetPassword(id, passwordHash) {
    const row = await updateUserPasswordHash(db, id, passwordHash)
    return Boolean(row)
  },
})

export const createInMemoryUserRepository = (
  seed: Array<UserRecord & { passwordHash?: string }> = [],
): UserRepository => {
  const items = new Map(
    seed.map((item) => [
      item.id,
      {
        ...item,
        passwordHash: item.passwordHash ?? "",
      } satisfies StoredUserRecord,
    ]),
  )

  return {
    async list(input = {}) {
      const page =
        typeof input.page === "number" && Number.isFinite(input.page)
          ? Math.max(1, Math.trunc(input.page))
          : 1
      const pageSize =
        typeof input.pageSize === "number" && Number.isFinite(input.pageSize)
          ? Math.min(100, Math.max(1, Math.trunc(input.pageSize)))
          : 20
      const sortedItems = [...items.values()].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      )
      const total = sortedItems.length
      const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize)
      const resolvedPage = Math.min(page, totalPages)

      return {
        items: sortedItems
          .slice((resolvedPage - 1) * pageSize, resolvedPage * pageSize)
          .map(stripPasswordHash),
        total,
        page: resolvedPage,
        pageSize,
        totalPages,
      }
    },
    async getById(id) {
      const user = items.get(id)
      return user ? stripPasswordHash(user) : null
    },
    async getByUsername(username) {
      const user = [...items.values()].find(
        (item) => item.username === username,
      )
      return user ? stripPasswordHash(user) : null
    },
    async create(input) {
      const now = new Date().toISOString()
      const user: StoredUserRecord = {
        id: crypto.randomUUID(),
        username: input.username,
        displayName: input.displayName,
        email: input.email,
        phone: input.phone,
        passwordHash: input.passwordHash,
        status: input.status ?? "active",
        isSuperAdmin: input.isSuperAdmin ?? false,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
      }

      items.set(user.id, user)
      return stripPasswordHash(user)
    },
    async update(id, input) {
      const existing = items.get(id)
      if (!existing) {
        return null
      }

      const updated: StoredUserRecord = {
        ...existing,
        ...Object.fromEntries(
          Object.entries(input).filter(([, value]) => value !== undefined),
        ),
        updatedAt: new Date().toISOString(),
      }

      items.set(id, updated)
      return stripPasswordHash(updated)
    },
    async resetPassword(id, passwordHash) {
      const existing = items.get(id)
      if (!existing) {
        return false
      }

      items.set(id, {
        ...existing,
        passwordHash,
        updatedAt: new Date().toISOString(),
      })

      return true
    },
  }
}

const mapUserListResult = (
  payload: UserPersistenceListResult,
): UserListResult => ({
  ...payload,
  items: payload.items.map(mapUserRow),
})

const mapUserRow = (row: UserRow): UserRecord => ({
  id: row.id,
  username: row.username,
  displayName: row.displayName,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  status: row.status,
  isSuperAdmin: row.isSuperAdmin,
  lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const stripPasswordHash = ({
  passwordHash: _passwordHash,
  ...user
}: StoredUserRecord): UserRecord => user
