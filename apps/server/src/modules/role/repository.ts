import {
  type DatabaseClient,
  type RoleRow,
  getRoleByCode,
  getRoleById,
  insertRole,
  listExistingPermissionCodes,
  listExistingUserIds,
  listPermissionCodesForRole,
  listRoles,
  listUserIdsForRole,
  replaceRolePermissionCodes,
  replaceRoleUserIds,
  updateRole,
} from "@elysian/persistence"
import type { RoleDetailRecord, RoleRecord, RoleStatus } from "@elysian/schema"

export interface CreateRoleInput {
  code: string
  name: string
  description?: string
  status?: RoleStatus
  isSystem?: boolean
  permissionCodes?: string[]
  userIds?: string[]
}

export interface UpdateRoleInput {
  code?: string
  name?: string
  description?: string
  status?: RoleStatus
  isSystem?: boolean
  permissionCodes?: string[]
  userIds?: string[]
}

export interface RoleRepository {
  list: () => Promise<RoleRecord[]>
  getById: (id: string) => Promise<RoleDetailRecord | null>
  getByCode: (code: string) => Promise<RoleDetailRecord | null>
  create: (input: CreateRoleInput) => Promise<RoleDetailRecord>
  update: (
    id: string,
    input: UpdateRoleInput,
  ) => Promise<RoleDetailRecord | null>
  listExistingPermissionCodes: (codes: string[]) => Promise<string[]>
  listExistingUserIds: (userIds: string[]) => Promise<string[]>
}

export interface InMemoryRoleRepositorySeed {
  roles?: RoleDetailRecord[]
  availablePermissionCodes?: string[]
  availableUserIds?: string[]
}

export const createRoleRepository = (db: DatabaseClient): RoleRepository => ({
  async list() {
    const rows = await listRoles(db)
    return rows.map(mapRoleRow)
  },
  async getById(id) {
    const row = await getRoleById(db, id)
    return row ? buildRoleDetailRecord(db, row) : null
  },
  async getByCode(code) {
    const row = await getRoleByCode(db, code)
    return row ? buildRoleDetailRecord(db, row) : null
  },
  async create(input) {
    const row = await insertRole(db, {
      code: input.code,
      name: input.name,
      description: input.description ?? null,
      status: input.status,
      isSystem: input.isSystem,
    })

    await replaceRolePermissionCodes(db, row.id, input.permissionCodes ?? [])
    await replaceRoleUserIds(db, row.id, input.userIds ?? [])

    return buildRoleDetailRecord(db, row)
  },
  async update(id, input) {
    const row = await updateRole(db, id, {
      code: input.code,
      name: input.name,
      description: input.description,
      status: input.status,
      isSystem: input.isSystem,
    })

    if (!row) {
      return null
    }

    if (input.permissionCodes !== undefined) {
      await replaceRolePermissionCodes(db, id, input.permissionCodes)
    }

    if (input.userIds !== undefined) {
      await replaceRoleUserIds(db, id, input.userIds)
    }

    return buildRoleDetailRecord(db, row)
  },
  listExistingPermissionCodes: (codes) =>
    listExistingPermissionCodes(db, codes),
  listExistingUserIds: (userIds) => listExistingUserIds(db, userIds),
})

export const createInMemoryRoleRepository = (
  seed: InMemoryRoleRepositorySeed = {},
): RoleRepository => {
  const roles = new Map(
    (seed.roles ?? []).map((role) => [
      role.id,
      mapRoleDetailToStoredRole(role),
    ]),
  )
  const availablePermissionCodes = new Set(seed.availablePermissionCodes ?? [])
  const availableUserIds = new Set(seed.availableUserIds ?? [])

  return {
    async list() {
      return [...roles.values()]
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map(mapStoredRoleToRoleRecord)
    },
    async getById(id) {
      const role = roles.get(id)
      return role ? mapStoredRoleToRoleDetail(role) : null
    },
    async getByCode(code) {
      const role = [...roles.values()].find((item) => item.code === code)
      return role ? mapStoredRoleToRoleDetail(role) : null
    },
    async create(input) {
      const now = new Date().toISOString()
      const role: StoredRoleRecord = {
        id: crypto.randomUUID(),
        code: input.code,
        name: input.name,
        description: input.description,
        status: input.status ?? "active",
        isSystem: input.isSystem ?? false,
        permissionCodes: [...new Set(input.permissionCodes ?? [])].sort(),
        userIds: [...new Set(input.userIds ?? [])].sort(),
        createdAt: now,
        updatedAt: now,
      }

      roles.set(role.id, role)
      return mapStoredRoleToRoleDetail(role)
    },
    async update(id, input) {
      const existing = roles.get(id)
      if (!existing) {
        return null
      }

      const updated: StoredRoleRecord = {
        ...existing,
        ...Object.fromEntries(
          Object.entries({
            code: input.code,
            name: input.name,
            description: input.description,
            status: input.status,
            isSystem: input.isSystem,
          }).filter(([, value]) => value !== undefined),
        ),
        permissionCodes:
          input.permissionCodes !== undefined
            ? [...new Set(input.permissionCodes)].sort()
            : existing.permissionCodes,
        userIds:
          input.userIds !== undefined
            ? [...new Set(input.userIds)].sort()
            : existing.userIds,
        updatedAt: new Date().toISOString(),
      }

      roles.set(id, updated)
      return mapStoredRoleToRoleDetail(updated)
    },
    async listExistingPermissionCodes(codes) {
      return [...new Set(codes)]
        .filter((code) => availablePermissionCodes.has(code))
        .sort()
    },
    async listExistingUserIds(userIds) {
      return [...new Set(userIds)]
        .filter((id) => availableUserIds.has(id))
        .sort()
    },
  }
}

interface StoredRoleRecord extends RoleDetailRecord {}

const buildRoleDetailRecord = async (
  db: DatabaseClient,
  row: RoleRow,
): Promise<RoleDetailRecord> => ({
  ...mapRoleRow(row),
  permissionCodes: await listPermissionCodesForRole(db, row.id),
  userIds: await listUserIdsForRole(db, row.id),
})

const mapRoleRow = (row: RoleRow): RoleRecord => ({
  id: row.id,
  code: row.code,
  name: row.name,
  description: row.description ?? undefined,
  status: row.status,
  isSystem: row.isSystem,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapRoleDetailToStoredRole = (
  role: RoleDetailRecord,
): StoredRoleRecord => ({
  ...role,
  permissionCodes: [...role.permissionCodes].sort(),
  userIds: [...role.userIds].sort(),
})

const mapStoredRoleToRoleRecord = (role: StoredRoleRecord): RoleRecord => ({
  id: role.id,
  code: role.code,
  name: role.name,
  description: role.description,
  status: role.status,
  isSystem: role.isSystem,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
})

const mapStoredRoleToRoleDetail = (
  role: StoredRoleRecord,
): RoleDetailRecord => ({
  ...mapStoredRoleToRoleRecord(role),
  permissionCodes: [...role.permissionCodes],
  userIds: [...role.userIds],
})
