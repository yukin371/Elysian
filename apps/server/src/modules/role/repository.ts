import {
  type DatabaseClient,
  type RolePersistenceListResult,
  type RoleRow,
  getRoleByCode,
  getRoleById,
  insertRole,
  listDepartmentIdsForRole,
  listExistingDepartmentIds,
  listExistingPermissionCodes,
  listExistingUserIds,
  listPermissionCodesForRole,
  listRoles,
  listUserIdsForRole,
  replaceRoleDepartmentIds,
  replaceRolePermissionCodes,
  replaceRoleUserIds,
  updateRole,
} from "@elysian/persistence"
import type {
  RoleDataScope,
  RoleDetailRecord,
  RoleRecord,
  RoleStatus,
} from "@elysian/schema"

export interface CreateRoleInput {
  code: string
  name: string
  description?: string
  status?: RoleStatus
  isSystem?: boolean
  dataScope?: RoleDataScope
  permissionCodes?: string[]
  userIds?: string[]
  deptIds?: string[]
}

export interface UpdateRoleInput {
  code?: string
  name?: string
  description?: string
  status?: RoleStatus
  isSystem?: boolean
  dataScope?: RoleDataScope
  permissionCodes?: string[]
  userIds?: string[]
  deptIds?: string[]
}

export interface ListRolesInput {
  page?: number
  pageSize?: number
}

export interface RoleListResult {
  items: RoleRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface RoleRepository {
  list: (input?: ListRolesInput) => Promise<RoleListResult>
  getById: (id: string) => Promise<RoleDetailRecord | null>
  getByCode: (code: string) => Promise<RoleDetailRecord | null>
  create: (input: CreateRoleInput) => Promise<RoleDetailRecord>
  update: (
    id: string,
    input: UpdateRoleInput,
  ) => Promise<RoleDetailRecord | null>
  listExistingPermissionCodes: (codes: string[]) => Promise<string[]>
  listExistingUserIds: (userIds: string[]) => Promise<string[]>
  listExistingDepartmentIds: (departmentIds: string[]) => Promise<string[]>
}

export interface InMemoryRoleRepositorySeed {
  roles?: RoleDetailRecord[]
  availablePermissionCodes?: string[]
  availableUserIds?: string[]
  availableDepartmentIds?: string[]
}

export const createRoleRepository = (db: DatabaseClient): RoleRepository => ({
  async list(input = {}) {
    const payload = await listRoles(db, input)
    return mapRoleListResult(payload)
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
      dataScope: input.dataScope,
    })

    await replaceRolePermissionCodes(db, row.id, input.permissionCodes ?? [])
    await replaceRoleUserIds(db, row.id, input.userIds ?? [])
    await replaceRoleDepartmentIds(db, row.id, input.deptIds ?? [])

    return buildRoleDetailRecord(db, row)
  },
  async update(id, input) {
    const row = await updateRole(db, id, {
      code: input.code,
      name: input.name,
      description: input.description,
      status: input.status,
      isSystem: input.isSystem,
      dataScope: input.dataScope,
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

    if (input.deptIds !== undefined) {
      await replaceRoleDepartmentIds(db, id, input.deptIds)
    }

    return buildRoleDetailRecord(db, row)
  },
  listExistingPermissionCodes: (codes) =>
    listExistingPermissionCodes(db, codes),
  listExistingUserIds: (userIds) => listExistingUserIds(db, userIds),
  listExistingDepartmentIds: (departmentIds) =>
    listExistingDepartmentIds(db, departmentIds),
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
  const availableDepartmentIds = new Set(seed.availableDepartmentIds ?? [])

  return {
    async list(input = {}) {
      const page =
        typeof input.page === "number" && Number.isFinite(input.page)
          ? Math.max(1, Math.trunc(input.page))
          : 1
      const pageSize =
        typeof input.pageSize === "number" && Number.isFinite(input.pageSize)
          ? Math.min(100, Math.max(1, Math.trunc(input.pageSize)))
          : 20
      const sortedRoles = [...roles.values()].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      )
      const total = sortedRoles.length
      const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize)
      const resolvedPage = Math.min(page, totalPages)

      return {
        items: sortedRoles
          .slice((resolvedPage - 1) * pageSize, resolvedPage * pageSize)
          .map(mapStoredRoleToRoleRecord),
        total,
        page: resolvedPage,
        pageSize,
        totalPages,
      }
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
        dataScope: input.dataScope ?? 1,
        permissionCodes: [...new Set(input.permissionCodes ?? [])].sort(),
        userIds: [...new Set(input.userIds ?? [])].sort(),
        deptIds: [...new Set(input.deptIds ?? [])].sort(),
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
            dataScope: input.dataScope,
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
        deptIds:
          input.deptIds !== undefined
            ? [...new Set(input.deptIds)].sort()
            : existing.deptIds,
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
    async listExistingDepartmentIds(departmentIds) {
      return [...new Set(departmentIds)]
        .filter((id) => availableDepartmentIds.has(id))
        .sort()
    },
  }
}

interface StoredRoleRecord extends RoleDetailRecord {}

const mapRoleListResult = (
  payload: RolePersistenceListResult,
): RoleListResult => ({
  ...payload,
  items: payload.items.map(mapRoleRow),
})

const buildRoleDetailRecord = async (
  db: DatabaseClient,
  row: RoleRow,
): Promise<RoleDetailRecord> => ({
  ...mapRoleRow(row),
  permissionCodes: await listPermissionCodesForRole(db, row.id),
  userIds: await listUserIdsForRole(db, row.id),
  deptIds: await listDepartmentIdsForRole(db, row.id),
})

const mapRoleRow = (row: RoleRow): RoleRecord => ({
  id: row.id,
  code: row.code,
  name: row.name,
  description: row.description ?? undefined,
  status: row.status,
  isSystem: row.isSystem,
  dataScope: row.dataScope as RoleDataScope,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapRoleDetailToStoredRole = (
  role: RoleDetailRecord,
): StoredRoleRecord => ({
  ...role,
  permissionCodes: [...role.permissionCodes].sort(),
  userIds: [...role.userIds].sort(),
  deptIds: [...role.deptIds].sort(),
})

const mapStoredRoleToRoleRecord = (role: StoredRoleRecord): RoleRecord => ({
  id: role.id,
  code: role.code,
  name: role.name,
  description: role.description,
  status: role.status,
  isSystem: role.isSystem,
  dataScope: role.dataScope,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
})

const mapStoredRoleToRoleDetail = (
  role: StoredRoleRecord,
): RoleDetailRecord => ({
  ...mapStoredRoleToRoleRecord(role),
  permissionCodes: [...role.permissionCodes],
  userIds: [...role.userIds],
  deptIds: [...role.deptIds],
})
