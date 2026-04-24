import { asc, desc, eq } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import { type TenantRow, tenants } from "./schema"

export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000"
const TENANT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface CreateTenantPersistenceInput {
  id?: string
  code: string
  name: string
  status?: "active" | "suspended"
}

export interface UpdateTenantPersistenceInput {
  code?: string
  name?: string
  status?: "active" | "suspended"
}

export async function getTenantById(db: DatabaseClient, id: string) {
  const rows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, id))
    .limit(1)
  return rows[0] ?? null
}

export async function getTenantByCode(db: DatabaseClient, code: string) {
  const rows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.code, code))
    .limit(1)
  return rows[0] ?? null
}

export async function listTenants(db: DatabaseClient) {
  return db
    .select()
    .from(tenants)
    .orderBy(desc(tenants.createdAt), asc(tenants.code))
}

export async function insertTenant(
  db: DatabaseClient,
  input: CreateTenantPersistenceInput,
): Promise<TenantRow> {
  const [row] = await db
    .insert(tenants)
    .values({
      ...(input.id ? { id: input.id } : {}),
      code: input.code,
      name: input.name,
      status: input.status ?? "active",
    })
    .returning()

  if (!row) {
    throw new Error("Tenant insert did not return a row")
  }

  return row
}

export async function updateTenant(
  db: DatabaseClient,
  id: string,
  input: UpdateTenantPersistenceInput,
): Promise<TenantRow | null> {
  const entries = Object.entries(input).filter(
    ([, value]) => value !== undefined,
  )

  if (entries.length === 0) {
    return getTenantById(db, id)
  }

  const [row] = await db
    .update(tenants)
    .set({
      ...Object.fromEntries(entries),
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, id))
    .returning()

  return row ?? null
}

export async function setTenantContext(db: DatabaseClient, tenantId: string) {
  assertTenantId(tenantId)
  await db.execute(`SET app.current_tenant = '${tenantId}'`)
}

export async function resetTenantContext(db: DatabaseClient) {
  await db.execute("RESET app.current_tenant")
}

export async function clearTenantContext(db: DatabaseClient) {
  await db.execute(`SET app.current_tenant = ''`)
}

const assertTenantId = (tenantId: string) => {
  if (!TENANT_ID_PATTERN.test(tenantId)) {
    throw new Error(`Invalid tenant id: ${tenantId}`)
  }
}
