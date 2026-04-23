import {
  type DatabaseClient,
  type SettingRow,
  getSettingById,
  getSettingByKey,
  insertSetting,
  listSettings,
  updateSetting,
} from "@elysian/persistence"
import type { SettingRecord, SettingStatus } from "@elysian/schema"

export interface CreateSettingInput {
  key: string
  value: string
  description?: string
  status?: SettingStatus
}

export interface UpdateSettingInput {
  key?: string
  value?: string
  description?: string
  status?: SettingStatus
}

export interface SettingRepository {
  list: () => Promise<SettingRecord[]>
  getById: (id: string) => Promise<SettingRecord | null>
  getByKey: (key: string) => Promise<SettingRecord | null>
  create: (input: CreateSettingInput) => Promise<SettingRecord>
  update: (
    id: string,
    input: UpdateSettingInput,
  ) => Promise<SettingRecord | null>
}

export const createSettingRepository = (
  db: DatabaseClient,
): SettingRepository => ({
  async list() {
    const rows = await listSettings(db)
    return rows.map(mapSettingRow)
  },
  async getById(id) {
    const row = await getSettingById(db, id)
    return row ? mapSettingRow(row) : null
  },
  async getByKey(key) {
    const row = await getSettingByKey(db, key)
    return row ? mapSettingRow(row) : null
  },
  async create(input) {
    const row = await insertSetting(db, {
      key: input.key,
      value: input.value,
      description: input.description ?? null,
      status: input.status,
    })

    return mapSettingRow(row)
  },
  async update(id, input) {
    const row = await updateSetting(db, id, {
      key: input.key,
      value: input.value,
      description: input.description,
      status: input.status,
    })

    return row ? mapSettingRow(row) : null
  },
})

export const createInMemorySettingRepository = (
  seed: SettingRecord[] = [],
): SettingRepository => {
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
    async getByKey(key) {
      return [...items.values()].find((item) => item.key === key) ?? null
    },
    async create(input) {
      const now = new Date().toISOString()
      const setting: SettingRecord = {
        id: crypto.randomUUID(),
        key: input.key,
        value: input.value,
        description: input.description,
        status: input.status ?? "active",
        createdAt: now,
        updatedAt: now,
      }

      items.set(setting.id, setting)
      return setting
    },
    async update(id, input) {
      const existing = items.get(id)
      if (!existing) {
        return null
      }

      const updated: SettingRecord = {
        ...existing,
        ...Object.fromEntries(
          Object.entries(input).filter(([, value]) => value !== undefined),
        ),
        updatedAt: new Date().toISOString(),
      }

      items.set(id, updated)
      return updated
    },
  }
}

const mapSettingRow = (row: SettingRow): SettingRecord => ({
  id: row.id,
  key: row.key,
  value: row.value,
  description: row.description ?? undefined,
  status: row.status,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})
