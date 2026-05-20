import { asc, desc, eq, sql } from "drizzle-orm"

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

type TenantReadableDb = Pick<DatabaseClient, "execute" | "select">
type TenantListingDb = Pick<DatabaseClient, "select">
type TenantContextDb = Pick<DatabaseClient, "execute"> &
  Partial<Pick<DatabaseClient, "$client">>

export async function getTenantById(db: TenantReadableDb, id: string) {
  const rows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, id))
    .limit(1)
  return rows[0] ?? null
}

export async function getTenantByCode(db: TenantReadableDb, code: string) {
  const rows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.code, code))
    .limit(1)
  return rows[0] ?? null
}

export async function listTenants(db: TenantListingDb) {
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

export async function setTenantContext(db: TenantContextDb, tenantId: string) {
  assertTenantId(tenantId)

  if (typeof db.$client === "function") {
    await db.$client`select set_config('app.current_tenant', ${tenantId}, false)`
    return
  }

  if (db.$client) {
    await db.execute(
      sql`select set_config('app.current_tenant', ${tenantId}, false)`,
    )
    return
  }

  await db.execute(
    `SET app.current_tenant = '${tenantId}'` as Parameters<
      TenantContextDb["execute"]
    >[0],
  )
}

export async function resetTenantContext(db: TenantContextDb) {
  if (typeof db.$client === "function") {
    await db.$client`RESET app.current_tenant`
    return
  }

  await db.execute(
    (db.$client
      ? sql`RESET app.current_tenant`
      : "RESET app.current_tenant") as Parameters<
      TenantContextDb["execute"]
    >[0],
  )
}

export async function clearTenantContext(db: TenantContextDb) {
  if (typeof db.$client === "function") {
    await db.$client`select set_config('app.current_tenant', '', false)`
    return
  }

  await db.execute(
    (db.$client
      ? sql`select set_config('app.current_tenant', '', false)`
      : "RESET app.current_tenant") as Parameters<
      TenantContextDb["execute"]
    >[0],
  )
}

const assertTenantId = (tenantId: string) => {
  if (!TENANT_ID_PATTERN.test(tenantId)) {
    throw new Error(`Invalid tenant id: ${tenantId}`)
  }
}
