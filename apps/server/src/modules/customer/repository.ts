import {
  type CustomerRow,
  type DatabaseClient,
  deleteCustomer,
  getCustomerById,
  insertCustomer,
  listCustomers,
  updateCustomer,
} from "@elysian/persistence"
import type { CustomerRecord, CustomerStatus } from "@elysian/schema"

export interface CreateCustomerInput {
  name: string
  status?: CustomerStatus
}

export interface UpdateCustomerInput {
  name?: string
  status?: CustomerStatus
}

export interface CustomerRepository {
  list: () => Promise<CustomerRecord[]>
  getById: (id: string) => Promise<CustomerRecord | null>
  create: (input: CreateCustomerInput) => Promise<CustomerRecord>
  update: (
    id: string,
    input: UpdateCustomerInput,
  ) => Promise<CustomerRecord | null>
  remove: (id: string) => Promise<boolean>
}

export const createCustomerRepository = (
  db: DatabaseClient,
): CustomerRepository => ({
  async list() {
    const rows = await listCustomers(db)
    return rows.map(mapCustomerRow)
  },
  async getById(id) {
    const row = await getCustomerById(db, id)
    return row ? mapCustomerRow(row) : null
  },
  async create(input) {
    const row = await insertCustomer(db, input)
    return mapCustomerRow(row)
  },
  async update(id, input) {
    const row = await updateCustomer(db, id, input)
    return row ? mapCustomerRow(row) : null
  },
  async remove(id) {
    return deleteCustomer(db, id)
  },
})

export const createInMemoryCustomerRepository = (
  seed: CustomerRecord[] = [],
): CustomerRepository => {
  const items = new Map(seed.map((item) => [item.id, item]))

  return {
    async list() {
      return [...items.values()].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      )
    },
    async getById(id) {
      return items.get(id) ?? null
    },
    async create(input) {
      const now = new Date().toISOString()
      const customer: CustomerRecord = {
        id: crypto.randomUUID(),
        name: input.name,
        status: input.status ?? "active",
        createdAt: now,
        updatedAt: now,
      }

      items.set(customer.id, customer)
      return customer
    },
    async update(id, input) {
      const existing = items.get(id)
      if (!existing) return null
      const updated: CustomerRecord = {
        ...existing,
        ...Object.fromEntries(
          Object.entries(input).filter(([, v]) => v !== undefined),
        ),
        updatedAt: new Date().toISOString(),
      }
      items.set(id, updated)
      return updated
    },
    async remove(id) {
      return items.delete(id)
    },
  }
}

const mapCustomerRow = (row: CustomerRow): CustomerRecord => ({
  id: row.id,
  name: row.name,
  status: row.status,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})
