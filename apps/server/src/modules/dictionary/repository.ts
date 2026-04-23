import {
  type DatabaseClient,
  type DictionaryItemRow,
  type DictionaryTypeRow,
  getDictionaryItemById,
  getDictionaryItemByTypeAndValue,
  getDictionaryTypeByCode,
  getDictionaryTypeById,
  insertDictionaryItem,
  insertDictionaryType,
  listDictionaryItems,
  listDictionaryItemsByTypeIds,
  listDictionaryTypes,
  updateDictionaryItem,
  updateDictionaryType,
} from "@elysian/persistence"
import type {
  DictionaryItemRecord,
  DictionaryStatus,
  DictionaryTypeDetailRecord,
  DictionaryTypeRecord,
} from "@elysian/schema"

export interface CreateDictionaryTypeInput {
  code: string
  name: string
  description?: string
  status?: DictionaryStatus
}

export interface UpdateDictionaryTypeInput {
  code?: string
  name?: string
  description?: string
  status?: DictionaryStatus
}

export interface CreateDictionaryItemInput {
  typeId: string
  value: string
  label: string
  sort?: number
  isDefault?: boolean
  status?: DictionaryStatus
}

export interface UpdateDictionaryItemInput {
  typeId?: string
  value?: string
  label?: string
  sort?: number
  isDefault?: boolean
  status?: DictionaryStatus
}

export interface DictionaryRepository {
  listTypes: () => Promise<DictionaryTypeRecord[]>
  getTypeById: (id: string) => Promise<DictionaryTypeDetailRecord | null>
  getTypeByCode: (code: string) => Promise<DictionaryTypeDetailRecord | null>
  createType: (
    input: CreateDictionaryTypeInput,
  ) => Promise<DictionaryTypeDetailRecord>
  updateType: (
    id: string,
    input: UpdateDictionaryTypeInput,
  ) => Promise<DictionaryTypeDetailRecord | null>
  listItems: (typeId?: string) => Promise<DictionaryItemRecord[]>
  getItemById: (id: string) => Promise<DictionaryItemRecord | null>
  getItemByTypeAndValue: (
    typeId: string,
    value: string,
  ) => Promise<DictionaryItemRecord | null>
  createItem: (
    input: CreateDictionaryItemInput,
  ) => Promise<DictionaryItemRecord>
  updateItem: (
    id: string,
    input: UpdateDictionaryItemInput,
  ) => Promise<DictionaryItemRecord | null>
}

export interface InMemoryDictionaryRepositorySeed {
  types?: DictionaryTypeDetailRecord[]
}

interface StoredDictionaryTypeRecord extends DictionaryTypeDetailRecord {}

export const createDictionaryRepository = (
  db: DatabaseClient,
): DictionaryRepository => ({
  async listTypes() {
    const rows = await listDictionaryTypes(db)
    return rows.map(mapDictionaryTypeRow)
  },
  async getTypeById(id) {
    const row = await getDictionaryTypeById(db, id)
    return row ? buildDictionaryTypeDetailRecord(db, row) : null
  },
  async getTypeByCode(code) {
    const row = await getDictionaryTypeByCode(db, code)
    return row ? buildDictionaryTypeDetailRecord(db, row) : null
  },
  async createType(input) {
    const row = await insertDictionaryType(db, {
      code: input.code,
      name: input.name,
      description: input.description ?? null,
      status: input.status,
    })

    return buildDictionaryTypeDetailRecord(db, row)
  },
  async updateType(id, input) {
    const row = await updateDictionaryType(db, id, {
      code: input.code,
      name: input.name,
      description: input.description,
      status: input.status,
    })

    return row ? buildDictionaryTypeDetailRecord(db, row) : null
  },
  async listItems(typeId) {
    const rows = await listDictionaryItems(db, typeId)
    return rows.map(mapDictionaryItemRow)
  },
  async getItemById(id) {
    const row = await getDictionaryItemById(db, id)
    return row ? mapDictionaryItemRow(row) : null
  },
  async getItemByTypeAndValue(typeId, value) {
    const row = await getDictionaryItemByTypeAndValue(db, typeId, value)
    return row ? mapDictionaryItemRow(row) : null
  },
  async createItem(input) {
    const row = await insertDictionaryItem(db, {
      typeId: input.typeId,
      value: input.value,
      label: input.label,
      sort: input.sort,
      isDefault: input.isDefault,
      status: input.status,
    })

    return mapDictionaryItemRow(row)
  },
  async updateItem(id, input) {
    const row = await updateDictionaryItem(db, id, {
      typeId: input.typeId,
      value: input.value,
      label: input.label,
      sort: input.sort,
      isDefault: input.isDefault,
      status: input.status,
    })

    return row ? mapDictionaryItemRow(row) : null
  },
})

export const createInMemoryDictionaryRepository = (
  seed: InMemoryDictionaryRepositorySeed = {},
): DictionaryRepository => {
  const types = new Map(
    (seed.types ?? []).map((type) => [type.id, mapTypeDetailToStored(type)]),
  )

  const listAllItems = () =>
    [...types.values()]
      .flatMap((type) => type.items.map((item) => ({ ...item })))
      .sort(compareDictionaryItems)

  return {
    async listTypes() {
      return [...types.values()]
        .sort(compareDictionaryTypes)
        .map(mapStoredToTypeRecord)
    },
    async getTypeById(id) {
      const type = types.get(id)
      return type ? mapStoredToTypeDetail(type) : null
    },
    async getTypeByCode(code) {
      const type = [...types.values()].find((item) => item.code === code)
      return type ? mapStoredToTypeDetail(type) : null
    },
    async createType(input) {
      const now = new Date().toISOString()
      const type: StoredDictionaryTypeRecord = {
        id: crypto.randomUUID(),
        code: input.code,
        name: input.name,
        description: input.description,
        status: input.status ?? "active",
        items: [],
        createdAt: now,
        updatedAt: now,
      }

      types.set(type.id, type)
      return mapStoredToTypeDetail(type)
    },
    async updateType(id, input) {
      const existing = types.get(id)
      if (!existing) {
        return null
      }

      const updated: StoredDictionaryTypeRecord = {
        ...existing,
        ...Object.fromEntries(
          Object.entries({
            code: input.code,
            name: input.name,
            description: input.description,
            status: input.status,
          }).filter(([, value]) => value !== undefined),
        ),
        updatedAt: new Date().toISOString(),
      }

      types.set(id, updated)
      return mapStoredToTypeDetail(updated)
    },
    async listItems(typeId) {
      if (!typeId) {
        return listAllItems()
      }

      const type = types.get(typeId)
      return type ? [...type.items].sort(compareDictionaryItems) : []
    },
    async getItemById(id) {
      return listAllItems().find((item) => item.id === id) ?? null
    },
    async getItemByTypeAndValue(typeId, value) {
      return (
        listAllItems().find(
          (item) => item.typeId === typeId && item.value === value,
        ) ?? null
      )
    },
    async createItem(input) {
      const parent = types.get(input.typeId)
      if (!parent) {
        throw new Error("Dictionary item parent type does not exist")
      }

      const now = new Date().toISOString()
      const item: DictionaryItemRecord = {
        id: crypto.randomUUID(),
        typeId: input.typeId,
        value: input.value,
        label: input.label,
        sort: input.sort ?? 0,
        isDefault: input.isDefault ?? false,
        status: input.status ?? "active",
        createdAt: now,
        updatedAt: now,
      }

      types.set(parent.id, {
        ...parent,
        items: [...parent.items, item].sort(compareDictionaryItems),
        updatedAt: now,
      })

      return item
    },
    async updateItem(id, input) {
      const current = await this.getItemById(id)
      if (!current) {
        return null
      }

      const nextTypeId = input.typeId ?? current.typeId
      const targetType = types.get(nextTypeId)
      if (!targetType) {
        return null
      }

      const updated: DictionaryItemRecord = {
        ...current,
        ...Object.fromEntries(
          Object.entries({
            typeId: input.typeId,
            value: input.value,
            label: input.label,
            sort: input.sort,
            isDefault: input.isDefault,
            status: input.status,
          }).filter(([, value]) => value !== undefined),
        ),
        updatedAt: new Date().toISOString(),
      }

      for (const [typeId, type] of types.entries()) {
        const remainingItems = type.items.filter((item) => item.id !== id)
        if (remainingItems.length !== type.items.length) {
          types.set(typeId, {
            ...type,
            items: remainingItems,
            updatedAt: updated.updatedAt,
          })
        }
      }

      const refreshedTargetType = types.get(nextTypeId)
      if (!refreshedTargetType) {
        return null
      }

      types.set(nextTypeId, {
        ...refreshedTargetType,
        items: [...refreshedTargetType.items, updated].sort(
          compareDictionaryItems,
        ),
        updatedAt: updated.updatedAt,
      })

      return updated
    },
  }
}

const buildDictionaryTypeDetailRecord = async (
  db: DatabaseClient,
  row: DictionaryTypeRow,
): Promise<DictionaryTypeDetailRecord> => {
  const items = await listDictionaryItemsByTypeIds(db, [row.id])

  return {
    ...mapDictionaryTypeRow(row),
    items: items.map(mapDictionaryItemRow),
  }
}

const mapDictionaryTypeRow = (
  row: DictionaryTypeRow,
): DictionaryTypeRecord => ({
  id: row.id,
  code: row.code,
  name: row.name,
  description: row.description ?? undefined,
  status: row.status,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapDictionaryItemRow = (
  row: DictionaryItemRow,
): DictionaryItemRecord => ({
  id: row.id,
  typeId: row.typeId,
  value: row.value,
  label: row.label,
  sort: row.sort,
  isDefault: row.isDefault,
  status: row.status,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapTypeDetailToStored = (
  type: DictionaryTypeDetailRecord,
): StoredDictionaryTypeRecord => ({
  ...type,
  items: [...type.items].sort(compareDictionaryItems),
})

const mapStoredToTypeRecord = (
  type: StoredDictionaryTypeRecord,
): DictionaryTypeRecord => ({
  id: type.id,
  code: type.code,
  name: type.name,
  description: type.description,
  status: type.status,
  createdAt: type.createdAt,
  updatedAt: type.updatedAt,
})

const mapStoredToTypeDetail = (
  type: StoredDictionaryTypeRecord,
): DictionaryTypeDetailRecord => ({
  ...mapStoredToTypeRecord(type),
  items: [...type.items].sort(compareDictionaryItems),
})

const compareDictionaryTypes = (
  left: DictionaryTypeRecord,
  right: DictionaryTypeRecord,
) =>
  right.createdAt.localeCompare(left.createdAt) ||
  left.code.localeCompare(right.code)

const compareDictionaryItems = (
  left: DictionaryItemRecord,
  right: DictionaryItemRecord,
) => left.sort - right.sort || left.value.localeCompare(right.value)
