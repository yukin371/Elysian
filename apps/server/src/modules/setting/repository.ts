import {
  DEFAULT_TENANT_ID,
  type DatabaseClient,
  type SettingRow,
  getSettingById,
  getSettingByKey,
  getSettingWithTenantFallback,
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
  getByKeyWithTenantFallback: (
    key: string,
    tenantId: string,
  ) => Promise<SettingRecord | null>
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
  async getByKeyWithTenantFallback(key, tenantId) {
    const row = await getSettingWithTenantFallback(db, key, tenantId)
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
  seed: Array<SettingRecord & { tenantId?: string }> = [],
): SettingRepository => {
  const items = new Map(seed.map((item) => [item.id, toStoredSetting(item)]))

  return {
    async list() {
      return [...items.values()]
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map(stripTenantId)
    },
    async getById(id) {
      const item = items.get(id)
      return item ? stripTenantId(item) : null
    },
    async getByKey(key) {
      const item = [...items.values()].find(
        (candidate) => candidate.key === key,
      )
      return item ? stripTenantId(item) : null
    },
    async getByKeyWithTenantFallback(key, tenantId) {
      const tenantScoped = [...items.values()]
        .filter(
          (candidate) =>
            candidate.key === key &&
            (candidate.tenantId === tenantId ||
              candidate.tenantId === DEFAULT_TENANT_ID ||
              candidate.tenantId === undefined),
        )
        .sort(
          (left, right) =>
            Number(right.tenantId === tenantId) -
              Number(left.tenantId === tenantId) ||
            Number(
              right.tenantId === DEFAULT_TENANT_ID ||
                right.tenantId === undefined,
            ) -
              Number(
                left.tenantId === DEFAULT_TENANT_ID ||
                  left.tenantId === undefined,
              ) ||
            right.updatedAt.localeCompare(left.updatedAt),
        )[0]

      return tenantScoped ? stripTenantId(tenantScoped) : null
    },
    async create(input) {
      const now = new Date().toISOString()
      const setting: StoredSettingRecord = {
        id: crypto.randomUUID(),
        key: input.key,
        value: input.value,
        description: input.description,
        status: input.status ?? "active",
        createdAt: now,
        updatedAt: now,
      }

      items.set(setting.id, setting)
      return stripTenantId(setting)
    },
    async update(id, input) {
      const existing = items.get(id)
      if (!existing) {
        return null
      }

      const updated: StoredSettingRecord = {
        ...existing,
        ...Object.fromEntries(
          Object.entries(input).filter(([, value]) => value !== undefined),
        ),
        updatedAt: new Date().toISOString(),
      }

      items.set(id, updated)
      return stripTenantId(updated)
    },
  }
}

interface StoredSettingRecord extends SettingRecord {
  tenantId?: string
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

const toStoredSetting = (
  setting: SettingRecord & { tenantId?: string },
): StoredSettingRecord => ({
  ...setting,
  tenantId: setting.tenantId,
})

const stripTenantId = ({
  tenantId: _tenantId,
  ...setting
}: StoredSettingRecord): SettingRecord => setting
