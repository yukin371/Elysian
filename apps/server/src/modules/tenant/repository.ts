import {
  type CreateTenantPersistenceInput,
  type DatabaseClient,
  type TenantRow,
  clearTenantContext,
  getTenantByCode,
  getTenantById,
  insertTenant,
  listTenants,
  resetTenantContext,
  updateTenant,
} from "@elysian/persistence"
import type { TenantRecord, TenantStatus } from "@elysian/schema"

export interface CreateTenantInput {
  code: string
  name: string
  status?: TenantStatus
}

export interface UpdateTenantInput {
  code?: string
  name?: string
  status?: TenantStatus
}

export interface TenantRepository {
  list: () => Promise<TenantRecord[]>
  getById: (id: string) => Promise<TenantRecord | null>
  getByCode: (code: string) => Promise<TenantRecord | null>
  create: (input: CreateTenantInput) => Promise<TenantRecord>
  update: (id: string, input: UpdateTenantInput) => Promise<TenantRecord | null>
}

export const createTenantRepository = (
  db: DatabaseClient,
): TenantRepository => ({
  list: () =>
    withTenantManagementContext(db, async () => {
      const rows = await listTenants(db)
      return rows.map(mapTenantRow)
    }),
  getById: (id) =>
    withTenantManagementContext(db, async () => {
      const row = await getTenantById(db, id)
      return row ? mapTenantRow(row) : null
    }),
  getByCode: (code) =>
    withTenantManagementContext(db, async () => {
      const row = await getTenantByCode(db, code)
      return row ? mapTenantRow(row) : null
    }),
  create: (input) =>
    withTenantManagementContext(db, async () => {
      const row = await insertTenant(db, {
        code: input.code,
        name: input.name,
        status: input.status,
      } satisfies CreateTenantPersistenceInput)

      return mapTenantRow(row)
    }),
  update: (id, input) =>
    withTenantManagementContext(db, async () => {
      const row = await updateTenant(db, id, {
        code: input.code,
        name: input.name,
        status: input.status,
      })

      return row ? mapTenantRow(row) : null
    }),
})

export const createInMemoryTenantRepository = (
  seed: TenantRecord[] = [],
): TenantRepository => {
  const items = new Map(seed.map((item) => [item.id, item]))

  return {
    async list() {
      return [...items.values()].sort(compareTenants)
    },
    async getById(id) {
      return items.get(id) ?? null
    },
    async getByCode(code) {
      return [...items.values()].find((item) => item.code === code) ?? null
    },
    async create(input) {
      const now = new Date().toISOString()
      const tenant: TenantRecord = {
        id: crypto.randomUUID(),
        code: input.code,
        name: input.name,
        status: input.status ?? "active",
        createdAt: now,
        updatedAt: now,
      }

      items.set(tenant.id, tenant)
      return tenant
    },
    async update(id, input) {
      const existing = items.get(id)
      if (!existing) {
        return null
      }

      const updated: TenantRecord = {
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

const withTenantManagementContext = async <T>(
  db: DatabaseClient,
  action: () => Promise<T>,
) => {
  // Tenant management must bypass the request-scoped tenant filter so a
  // super-admin can see and mutate cross-tenant records in the tenants table.
  await clearTenantContext(db)

  try {
    return await action()
  } finally {
    await resetTenantContext(db)
  }
}

const mapTenantRow = (row: TenantRow): TenantRecord => ({
  id: row.id,
  code: row.code,
  name: row.name,
  status: row.status,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const compareTenants = (left: TenantRecord, right: TenantRecord) =>
  right.createdAt.localeCompare(left.createdAt) ||
  left.code.localeCompare(right.code)
