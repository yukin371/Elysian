import {
  type CustomerRow,
  type DataAccessContext,
  type DatabaseClient,
  buildDataAccessCondition,
  customers,
  deleteCustomer,
  getCustomerById,
  insertCustomer,
  listCustomers,
  matchesDataAccess,
  updateCustomer,
} from "@elysian/persistence"
import type { CustomerRecord, CustomerStatus } from "@elysian/schema"

export interface CreateCustomerInput {
  name: string
  status?: CustomerStatus
  deptId?: string | null
  creatorId?: string | null
  tenantId?: string
}

export interface UpdateCustomerInput {
  name?: string
  status?: CustomerStatus
}

export interface CustomerRepository {
  list: (dataAccess?: DataAccessContext) => Promise<CustomerRecord[]>
  getById: (
    id: string,
    dataAccess?: DataAccessContext,
  ) => Promise<CustomerRecord | null>
  create: (input: CreateCustomerInput) => Promise<CustomerRecord>
  update: (
    id: string,
    input: UpdateCustomerInput,
    dataAccess?: DataAccessContext,
  ) => Promise<CustomerRecord | null>
  remove: (id: string, dataAccess?: DataAccessContext) => Promise<boolean>
}

export const createCustomerRepository = (
  db: DatabaseClient,
): CustomerRepository => ({
  async list(dataAccess) {
    const rows = await listCustomers(db, {
      accessCondition: dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: customers.deptId,
            creatorColumn: customers.creatorId,
          })
        : undefined,
    })
    return rows.map(mapCustomerRow)
  },
  async getById(id, dataAccess) {
    const row = await getCustomerById(db, id, {
      accessCondition: dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: customers.deptId,
            creatorColumn: customers.creatorId,
          })
        : undefined,
    })
    return row ? mapCustomerRow(row) : null
  },
  async create(input) {
    const row = await insertCustomer(db, input)
    return mapCustomerRow(row)
  },
  async update(id, input, dataAccess) {
    const row = await updateCustomer(db, id, input, {
      accessCondition: dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: customers.deptId,
            creatorColumn: customers.creatorId,
          })
        : undefined,
    })
    return row ? mapCustomerRow(row) : null
  },
  async remove(id, dataAccess) {
    return deleteCustomer(db, id, {
      accessCondition: dataAccess
        ? buildDataAccessCondition(dataAccess, {
            deptColumn: customers.deptId,
            creatorColumn: customers.creatorId,
          })
        : undefined,
    })
  },
})

export const createInMemoryCustomerRepository = (
  seed: Array<
    CustomerRecord & {
      deptId?: string | null
      creatorId?: string | null
    }
  > = [],
): CustomerRepository => {
  const items = new Map(
    seed.map((item) => [item.id, mapPublicCustomerToStored(item)]),
  )

  return {
    async list(dataAccess) {
      return [...items.values()]
        .filter((item) =>
          dataAccess
            ? matchesDataAccess(dataAccess, {
                deptId: item.deptId,
                creatorId: item.creatorId,
              })
            : true,
        )
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map(mapStoredCustomerToPublic)
    },
    async getById(id, dataAccess) {
      const item = items.get(id)
      if (
        item &&
        dataAccess &&
        !matchesDataAccess(dataAccess, {
          deptId: item.deptId,
          creatorId: item.creatorId,
        })
      ) {
        return null
      }

      return item ? mapStoredCustomerToPublic(item) : null
    },
    async create(input) {
      const now = new Date().toISOString()
      const customer: StoredCustomerRecord = {
        id: crypto.randomUUID(),
        name: input.name,
        status: input.status ?? "active",
        deptId: input.deptId ?? null,
        creatorId: input.creatorId ?? null,
        tenantId: input.tenantId ?? null,
        createdAt: now,
        updatedAt: now,
      }

      items.set(customer.id, customer)
      return mapStoredCustomerToPublic(customer)
    },
    async update(id, input, dataAccess) {
      const existing = items.get(id)
      if (!existing) return null
      if (
        dataAccess &&
        !matchesDataAccess(dataAccess, {
          deptId: existing.deptId,
          creatorId: existing.creatorId,
        })
      ) {
        return null
      }

      const updated: StoredCustomerRecord = {
        ...existing,
        ...Object.fromEntries(
          Object.entries(input).filter(([, v]) => v !== undefined),
        ),
        updatedAt: new Date().toISOString(),
      }
      items.set(id, updated)
      return mapStoredCustomerToPublic(updated)
    },
    async remove(id, dataAccess) {
      const existing = items.get(id)
      if (
        existing &&
        dataAccess &&
        !matchesDataAccess(dataAccess, {
          deptId: existing.deptId,
          creatorId: existing.creatorId,
        })
      ) {
        return false
      }

      return items.delete(id)
    },
  }
}

interface StoredCustomerRecord extends CustomerRecord {
  deptId?: string | null
  creatorId?: string | null
  tenantId?: string | null
}

const mapCustomerRow = (row: CustomerRow): CustomerRecord => ({
  id: row.id,
  name: row.name,
  status: row.status,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapPublicCustomerToStored = (
  row: CustomerRecord & {
    deptId?: string | null
    creatorId?: string | null
    tenantId?: string | null
  },
): StoredCustomerRecord => ({
  ...row,
  deptId: row.deptId ?? null,
  creatorId: row.creatorId ?? null,
  tenantId: row.tenantId ?? null,
})

const mapStoredCustomerToPublic = (
  row: StoredCustomerRecord,
): CustomerRecord => ({
  id: row.id,
  name: row.name,
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})
