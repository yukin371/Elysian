import {
  type DatabaseClient,
  type DepartmentRow,
  getDepartmentByCode,
  getDepartmentById,
  insertDepartment,
  listDepartments,
  listExistingUserIds,
  listUserIdsForDepartment,
  replaceDepartmentUserIds,
  updateDepartment,
} from "@elysian/persistence"
import type {
  DepartmentDetailRecord,
  DepartmentRecord,
  DepartmentStatus,
} from "@elysian/schema"

export interface CreateDepartmentInput {
  parentId?: string | null
  code: string
  name: string
  sort?: number
  status?: DepartmentStatus
  userIds?: string[]
}

export interface UpdateDepartmentInput {
  parentId?: string | null
  code?: string
  name?: string
  sort?: number
  status?: DepartmentStatus
  userIds?: string[]
}

export interface DepartmentRepository {
  list: () => Promise<DepartmentRecord[]>
  getById: (id: string) => Promise<DepartmentDetailRecord | null>
  getByCode: (code: string) => Promise<DepartmentDetailRecord | null>
  create: (input: CreateDepartmentInput) => Promise<DepartmentDetailRecord>
  update: (
    id: string,
    input: UpdateDepartmentInput,
  ) => Promise<DepartmentDetailRecord | null>
  listExistingUserIds: (userIds: string[]) => Promise<string[]>
}

export interface InMemoryDepartmentRepositorySeed {
  departments?: DepartmentDetailRecord[]
  availableUserIds?: string[]
}

interface StoredDepartmentRecord extends DepartmentDetailRecord {}

export const createDepartmentRepository = (
  db: DatabaseClient,
): DepartmentRepository => ({
  async list() {
    const rows = await listDepartments(db)
    return rows.map(mapDepartmentRow)
  },
  async getById(id) {
    const row = await getDepartmentById(db, id)
    return row ? buildDepartmentDetailRecord(db, row) : null
  },
  async getByCode(code) {
    const row = await getDepartmentByCode(db, code)
    return row ? buildDepartmentDetailRecord(db, row) : null
  },
  async create(input) {
    const row = await insertDepartment(db, {
      parentId: input.parentId,
      code: input.code,
      name: input.name,
      sort: input.sort,
      status: input.status,
    })

    await replaceDepartmentUserIds(db, row.id, input.userIds ?? [])

    return buildDepartmentDetailRecord(db, row)
  },
  async update(id, input) {
    const row = await updateDepartment(db, id, {
      parentId: input.parentId,
      code: input.code,
      name: input.name,
      sort: input.sort,
      status: input.status,
    })

    if (!row) {
      return null
    }

    if (input.userIds !== undefined) {
      await replaceDepartmentUserIds(db, id, input.userIds)
    }

    return buildDepartmentDetailRecord(db, row)
  },
  listExistingUserIds: (userIds) => listExistingUserIds(db, userIds),
})

export const createInMemoryDepartmentRepository = (
  seed: InMemoryDepartmentRepositorySeed = {},
): DepartmentRepository => {
  const departments = new Map(
    (seed.departments ?? []).map((department) => [
      department.id,
      mapDepartmentDetailToStored(department),
    ]),
  )
  const availableUserIds = new Set(seed.availableUserIds ?? [])

  return {
    async list() {
      return [...departments.values()]
        .sort(compareDepartments)
        .map(mapStoredToDepartmentRecord)
    },
    async getById(id) {
      const department = departments.get(id)
      return department ? mapStoredToDepartmentDetail(department) : null
    },
    async getByCode(code) {
      const department = [...departments.values()].find(
        (item) => item.code === code,
      )
      return department ? mapStoredToDepartmentDetail(department) : null
    },
    async create(input) {
      const now = new Date().toISOString()
      const department: StoredDepartmentRecord = {
        id: crypto.randomUUID(),
        parentId: input.parentId ?? null,
        code: input.code,
        name: input.name,
        sort: input.sort ?? 0,
        status: input.status ?? "active",
        userIds: [...new Set(input.userIds ?? [])].sort(),
        createdAt: now,
        updatedAt: now,
      }

      departments.set(department.id, department)
      return mapStoredToDepartmentDetail(department)
    },
    async update(id, input) {
      const existing = departments.get(id)
      if (!existing) {
        return null
      }

      const updated: StoredDepartmentRecord = {
        ...existing,
        ...Object.fromEntries(
          Object.entries({
            parentId: input.parentId,
            code: input.code,
            name: input.name,
            sort: input.sort,
            status: input.status,
          }).filter(([, value]) => value !== undefined),
        ),
        userIds:
          input.userIds !== undefined
            ? [...new Set(input.userIds)].sort()
            : existing.userIds,
        updatedAt: new Date().toISOString(),
      }

      departments.set(id, updated)
      return mapStoredToDepartmentDetail(updated)
    },
    async listExistingUserIds(userIds) {
      return [...new Set(userIds)]
        .filter((userId) => availableUserIds.has(userId))
        .sort()
    },
  }
}

const buildDepartmentDetailRecord = async (
  db: DatabaseClient,
  row: DepartmentRow,
): Promise<DepartmentDetailRecord> => ({
  ...mapDepartmentRow(row),
  userIds: await listUserIdsForDepartment(db, row.id),
})

const mapDepartmentRow = (row: DepartmentRow): DepartmentRecord => ({
  id: row.id,
  parentId: row.parentId ?? null,
  code: row.code,
  name: row.name,
  sort: row.sort,
  status: row.status,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapDepartmentDetailToStored = (
  department: DepartmentDetailRecord,
): StoredDepartmentRecord => ({
  ...department,
  userIds: [...department.userIds].sort(),
})

const mapStoredToDepartmentRecord = (
  department: StoredDepartmentRecord,
): DepartmentRecord => ({
  id: department.id,
  parentId: department.parentId,
  code: department.code,
  name: department.name,
  sort: department.sort,
  status: department.status,
  createdAt: department.createdAt,
  updatedAt: department.updatedAt,
})

const mapStoredToDepartmentDetail = (
  department: StoredDepartmentRecord,
): DepartmentDetailRecord => ({
  ...mapStoredToDepartmentRecord(department),
  userIds: [...department.userIds],
})

const compareDepartments = (
  left: StoredDepartmentRecord,
  right: StoredDepartmentRecord,
) => left.sort - right.sort || left.name.localeCompare(right.name)
