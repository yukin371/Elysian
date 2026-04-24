import { desc, eq } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import { type CustomerRow, customers } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export interface CreateCustomerPersistenceInput {
  name: string
  status?: CustomerRow["status"]
  tenantId?: string
}

export const listCustomers = async (
  db: DatabaseClient,
): Promise<CustomerRow[]> =>
  db.select().from(customers).orderBy(desc(customers.createdAt))

export const getCustomerById = async (
  db: DatabaseClient,
  id: string,
): Promise<CustomerRow | null> => {
  const [row] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
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
): Promise<CustomerRow | null> => {
  const [row] = await db
    .update(customers)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning()

  return row ?? null
}

export const deleteCustomer = async (
  db: DatabaseClient,
  id: string,
): Promise<boolean> => {
  const result = await db
    .delete(customers)
    .where(eq(customers.id, id))
    .returning()

  return result.length > 0
}
