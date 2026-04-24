import { and, asc, desc, eq, or } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import { type SettingRow, systemSettings } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export interface CreateSettingPersistenceInput {
  id?: string
  key: string
  value: string
  description?: string | null
  status?: "active" | "disabled"
  tenantId?: string
}

export interface UpdateSettingPersistenceInput {
  key?: string
  value?: string
  description?: string | null
  status?: "active" | "disabled"
}

export const listSettings = async (db: DatabaseClient): Promise<SettingRow[]> =>
  db
    .select()
    .from(systemSettings)
    .orderBy(desc(systemSettings.createdAt), asc(systemSettings.key))

export const getSettingById = async (
  db: DatabaseClient,
  id: string,
): Promise<SettingRow | null> => {
  const [row] = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.id, id))
    .limit(1)

  return row ?? null
}

export const getSettingByKey = async (
  db: DatabaseClient,
  key: string,
): Promise<SettingRow | null> => {
  const [row] = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, key))
    .limit(1)

  return row ?? null
}

export const getSettingWithTenantFallback = async (
  db: DatabaseClient,
  key: string,
  tenantId: string,
): Promise<SettingRow | null> => {
  const [row] = await db
    .select()
    .from(systemSettings)
    .where(
      and(
        eq(systemSettings.key, key),
        or(
          eq(systemSettings.tenantId, tenantId),
          eq(systemSettings.tenantId, DEFAULT_TENANT_ID),
        ),
      ),
    )
    .orderBy(
      desc(eq(systemSettings.tenantId, tenantId)),
      desc(eq(systemSettings.tenantId, DEFAULT_TENANT_ID)),
      desc(systemSettings.updatedAt),
    )
    .limit(1)

  return row ?? null
}

export const insertSetting = async (
  db: DatabaseClient,
  input: CreateSettingPersistenceInput,
): Promise<SettingRow> => {
  const [row] = await db
    .insert(systemSettings)
    .values({
      ...(input.id ? { id: input.id } : {}),
      key: input.key,
      value: input.value,
      description: input.description ?? null,
      status: input.status ?? "active",
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Setting insert did not return a row")
  }

  return row
}

export const updateSetting = async (
  db: DatabaseClient,
  id: string,
  input: UpdateSettingPersistenceInput,
): Promise<SettingRow | null> => {
  const entries = Object.entries(input).filter(
    ([, value]) => value !== undefined,
  )

  if (entries.length === 0) {
    return getSettingById(db, id)
  }

  const [row] = await db
    .update(systemSettings)
    .set({
      ...Object.fromEntries(entries),
      updatedAt: new Date(),
    })
    .where(eq(systemSettings.id, id))
    .returning()

  return row ?? null
}
