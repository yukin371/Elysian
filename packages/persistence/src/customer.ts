import { type SQL, and, desc, eq } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import { type CustomerRow, customers } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export interface CreateCustomerPersistenceInput {
  name: string
  status?: CustomerRow["status"]
  deptId?: string | null
  creatorId?: string | null
  tenantId?: string
}

export interface CustomerPersistenceQueryOptions {
  accessCondition?: SQL<unknown>
}

export const listCustomers = async (
  db: DatabaseClient,
  options: CustomerPersistenceQueryOptions = {},
): Promise<CustomerRow[]> =>
  options.accessCondition
    ? db
        .select()
        .from(customers)
        .where(options.accessCondition)
        .orderBy(desc(customers.createdAt))
    : db.select().from(customers).orderBy(desc(customers.createdAt))

export const getCustomerById = async (
  db: DatabaseClient,
  id: string,
  options: CustomerPersistenceQueryOptions = {},
): Promise<CustomerRow | null> => {
  const conditions = [eq(customers.id, id), options.accessCondition].filter(
    Boolean,
  )
  const [row] = await db
    .select()
    .from(customers)
    .where(and(...conditions))
    .limit(1)

  return row ?? null
}

export const insertCustomer = async (
  db: DatabaseClient,
  input: CreateCustomerPersistenceInput,
): Promise<CustomerRow> => {
  const [row] = await db
    .insert(customers)
    .values({
      name: input.name,
      status: input.status ?? "active",
      deptId: input.deptId ?? null,
      creatorId: input.creatorId ?? null,
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Customer insert did not return a row")
  }

  return row
}

export const updateCustomer = async (
  db: DatabaseClient,
  id: string,
  input: Partial<Omit<CreateCustomerPersistenceInput, never>>,
  options: CustomerPersistenceQueryOptions = {},
): Promise<CustomerRow | null> => {
  const conditions = [eq(customers.id, id), options.accessCondition].filter(
    Boolean,
  )
  const [row] = await db
    .update(customers)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(...conditions))
    .returning()

  return row ?? null
}

export const deleteCustomer = async (
  db: DatabaseClient,
  id: string,
  options: CustomerPersistenceQueryOptions = {},
): Promise<boolean> => {
  const conditions = [eq(customers.id, id), options.accessCondition].filter(
    Boolean,
  )
  const result = await db
    .delete(customers)
    .where(and(...conditions))
    .returning()

  return result.length > 0
}
