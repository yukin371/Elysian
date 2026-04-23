import { and, asc, desc, eq, inArray } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import {
  type DictionaryItemRow,
  type DictionaryTypeRow,
  dictionaryItems,
  dictionaryTypes,
} from "./schema"

export interface CreateDictionaryTypePersistenceInput {
  id?: string
  code: string
  name: string
  description?: string | null
  status?: "active" | "disabled"
}

export interface UpdateDictionaryTypePersistenceInput {
  code?: string
  name?: string
  description?: string | null
  status?: "active" | "disabled"
}

export interface CreateDictionaryItemPersistenceInput {
  id?: string
  typeId: string
  value: string
  label: string
  sort?: number
  isDefault?: boolean
  status?: "active" | "disabled"
}

export interface UpdateDictionaryItemPersistenceInput {
  typeId?: string
  value?: string
  label?: string
  sort?: number
  isDefault?: boolean
  status?: "active" | "disabled"
}

export const listDictionaryTypes = async (
  db: DatabaseClient,
): Promise<DictionaryTypeRow[]> =>
  db
    .select()
    .from(dictionaryTypes)
    .orderBy(desc(dictionaryTypes.createdAt), asc(dictionaryTypes.code))

export const getDictionaryTypeById = async (
  db: DatabaseClient,
  id: string,
): Promise<DictionaryTypeRow | null> => {
  const [row] = await db
    .select()
    .from(dictionaryTypes)
    .where(eq(dictionaryTypes.id, id))
    .limit(1)

  return row ?? null
}

export const getDictionaryTypeByCode = async (
  db: DatabaseClient,
  code: string,
): Promise<DictionaryTypeRow | null> => {
  const [row] = await db
    .select()
    .from(dictionaryTypes)
    .where(eq(dictionaryTypes.code, code))
    .limit(1)

  return row ?? null
}

export const insertDictionaryType = async (
  db: DatabaseClient,
  input: CreateDictionaryTypePersistenceInput,
): Promise<DictionaryTypeRow> => {
  const [row] = await db
    .insert(dictionaryTypes)
    .values({
      ...(input.id ? { id: input.id } : {}),
      code: input.code,
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? "active",
    })
    .returning()

  if (!row) {
    throw new Error("Dictionary type insert did not return a row")
  }

  return row
}

export const updateDictionaryType = async (
  db: DatabaseClient,
  id: string,
  input: UpdateDictionaryTypePersistenceInput,
): Promise<DictionaryTypeRow | null> => {
  const entries = Object.entries(input).filter(
    ([, value]) => value !== undefined,
  )

  if (entries.length === 0) {
    return getDictionaryTypeById(db, id)
  }

  const [row] = await db
    .update(dictionaryTypes)
    .set({
      ...Object.fromEntries(entries),
      updatedAt: new Date(),
    })
    .where(eq(dictionaryTypes.id, id))
    .returning()

  return row ?? null
}

export const listDictionaryItems = async (
  db: DatabaseClient,
  typeId?: string,
): Promise<DictionaryItemRow[]> => {
  const baseQuery = db.select().from(dictionaryItems)

  if (!typeId) {
    return baseQuery.orderBy(
      asc(dictionaryItems.sort),
      asc(dictionaryItems.value),
      asc(dictionaryItems.createdAt),
    )
  }

  return baseQuery
    .where(eq(dictionaryItems.typeId, typeId))
    .orderBy(
      asc(dictionaryItems.sort),
      asc(dictionaryItems.value),
      asc(dictionaryItems.createdAt),
    )
}

export const getDictionaryItemById = async (
  db: DatabaseClient,
  id: string,
): Promise<DictionaryItemRow | null> => {
  const [row] = await db
    .select()
    .from(dictionaryItems)
    .where(eq(dictionaryItems.id, id))
    .limit(1)

  return row ?? null
}

export const insertDictionaryItem = async (
  db: DatabaseClient,
  input: CreateDictionaryItemPersistenceInput,
): Promise<DictionaryItemRow> => {
  const [row] = await db
    .insert(dictionaryItems)
    .values({
      ...(input.id ? { id: input.id } : {}),
      typeId: input.typeId,
      value: input.value,
      label: input.label,
      sort: input.sort ?? 0,
      isDefault: input.isDefault ?? false,
      status: input.status ?? "active",
    })
    .returning()

  if (!row) {
    throw new Error("Dictionary item insert did not return a row")
  }

  return row
}

export const updateDictionaryItem = async (
  db: DatabaseClient,
  id: string,
  input: UpdateDictionaryItemPersistenceInput,
): Promise<DictionaryItemRow | null> => {
  const entries = Object.entries(input).filter(
    ([, value]) => value !== undefined,
  )

  if (entries.length === 0) {
    return getDictionaryItemById(db, id)
  }

  const [row] = await db
    .update(dictionaryItems)
    .set({
      ...Object.fromEntries(entries),
      updatedAt: new Date(),
    })
    .where(eq(dictionaryItems.id, id))
    .returning()

  return row ?? null
}

export const listDictionaryItemsByTypeIds = async (
  db: DatabaseClient,
  typeIds: string[],
): Promise<DictionaryItemRow[]> => {
  if (typeIds.length === 0) {
    return []
  }

  return db
    .select()
    .from(dictionaryItems)
    .where(inArray(dictionaryItems.typeId, [...new Set(typeIds)]))
    .orderBy(
      asc(dictionaryItems.typeId),
      asc(dictionaryItems.sort),
      asc(dictionaryItems.value),
    )
}

export const getDictionaryItemByTypeAndValue = async (
  db: DatabaseClient,
  typeId: string,
  value: string,
): Promise<DictionaryItemRow | null> => {
  const [row] = await db
    .select()
    .from(dictionaryItems)
    .where(
      and(eq(dictionaryItems.typeId, typeId), eq(dictionaryItems.value, value)),
    )
    .limit(1)

  return row ?? null
}
