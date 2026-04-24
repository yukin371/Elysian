import { eq } from "drizzle-orm"
import type { DatabaseClient } from "./client"
import { tenants } from "./schema"

export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000"

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
  return db.select().from(tenants).orderBy(tenants.createdAt)
}

export async function setTenantContext(db: DatabaseClient, tenantId: string) {
  await db.execute(`SET app.current_tenant = '${tenantId}'`)
}

export async function resetTenantContext(db: DatabaseClient) {
  await db.execute(`RESET app.current_tenant`)
}

export async function clearTenantContext(db: DatabaseClient) {
  await db.execute(`SET app.current_tenant = ''`)
}
