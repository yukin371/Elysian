import { AppError } from "../../errors"
import type {
  CreateDepartmentInput,
  DepartmentRepository,
  UpdateDepartmentInput,
} from "./repository"

export interface CreateDepartmentPayload
  extends Omit<CreateDepartmentInput, "code" | "name"> {
  code: string
  name: string
}

export interface UpdateDepartmentPayload extends UpdateDepartmentInput {}

export const createDepartmentService = (repository: DepartmentRepository) => ({
  list: () => repository.list(),
  async getById(id: string) {
    const department = await repository.getById(id)

    if (!department) {
      throw new AppError({
        code: "DEPARTMENT_NOT_FOUND",
        message: "Department not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return department
  },
  async create(input: CreateDepartmentPayload) {
    const code = input.code.trim()
    const name = input.name.trim()

    if (code.length === 0) {
      throw new AppError({
        code: "DEPARTMENT_CODE_REQUIRED",
        message: "Department code is required",
        status: 400,
        expose: true,
      })
    }

    if (name.length === 0) {
      throw new AppError({
        code: "DEPARTMENT_NAME_REQUIRED",
        message: "Department name is required",
        status: 400,
        expose: true,
      })
    }

    const existing = await repository.getByCode(code)
    if (existing) {
      throw new AppError({
        code: "DEPARTMENT_CODE_CONFLICT",
        message: "Department code already exists",
        status: 409,
        expose: true,
        details: { code },
      })
    }

    await assertDepartmentRelations(repository, {
      parentId: input.parentId ?? null,
      userIds: normalizeStringArray(input.userIds),
    })

    return repository.create({
      parentId: input.parentId ?? null,
      code,
      name,
      sort: input.sort,
      status: input.status,
      userIds: normalizeStringArray(input.userIds),
    })
  },
  async update(id: string, input: UpdateDepartmentPayload) {
    const current = await repository.getById(id)

    if (!current) {
      throw new AppError({
        code: "DEPARTMENT_NOT_FOUND",
        message: "Department not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    const code = input.code !== undefined ? input.code.trim() : undefined
    const name = input.name !== undefined ? input.name.trim() : undefined

    if (code !== undefined && code.length === 0) {
      throw new AppError({
        code: "DEPARTMENT_CODE_REQUIRED",
        message: "Department code is required",
        status: 400,
        expose: true,
      })
    }

    if (name !== undefined && name.length === 0) {
      throw new AppError({
        code: "DEPARTMENT_NAME_REQUIRED",
        message: "Department name is required",
        status: 400,
        expose: true,
      })
    }

    if (code !== undefined) {
      const existing = await repository.getByCode(code)

      if (existing && existing.id !== id) {
        throw new AppError({
          code: "DEPARTMENT_CODE_CONFLICT",
          message: "Department code already exists",
          status: 409,
          expose: true,
          details: { code },
        })
      }
    }

    const nextParentId =
      input.parentId !== undefined ? input.parentId : current.parentId
    if (nextParentId === id) {
      throw new AppError({
        code: "DEPARTMENT_PARENT_INVALID",
        message: "Department cannot be its own parent",
        status: 400,
        expose: true,
        details: { id },
      })
    }

    await assertNoDepartmentCycle(repository, id, nextParentId)

    await assertDepartmentRelations(repository, {
      parentId: nextParentId,
      userIds:
        input.userIds !== undefined
          ? normalizeStringArray(input.userIds)
          : undefined,
    })

    const updated = await repository.update(id, {
      parentId: input.parentId,
      code,
      name,
      sort: input.sort,
      status: input.status,
      userIds:
        input.userIds !== undefined
          ? normalizeStringArray(input.userIds)
          : undefined,
    })

    if (!updated) {
      throw new AppError({
        code: "DEPARTMENT_NOT_FOUND",
        message: "Department not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return updated
  },
})

const assertDepartmentRelations = async (
  repository: DepartmentRepository,
  input: {
    parentId?: string | null
    userIds?: string[]
  },
) => {
  if (input.parentId) {
    const parent = await repository.getById(input.parentId)

    if (!parent) {
      throw new AppError({
        code: "DEPARTMENT_PARENT_INVALID",
        message: "Department parent does not exist",
        status: 400,
        expose: true,
        details: { parentId: input.parentId },
      })
    }
  }

  if (input.userIds !== undefined) {
    const existingUserIds = await repository.listExistingUserIds(input.userIds)
    const missingUserIds = input.userIds.filter(
      (userId) => !existingUserIds.includes(userId),
    )

    if (missingUserIds.length > 0) {
      throw new AppError({
        code: "DEPARTMENT_USER_IDS_INVALID",
        message: "Department contains unknown user ids",
        status: 400,
        expose: true,
        details: {
          userIds: missingUserIds,
        },
      })
    }
  }
}

const assertNoDepartmentCycle = async (
  repository: DepartmentRepository,
  id: string,
  parentId: string | null,
) => {
  if (!parentId) {
    return
  }

  const items = await repository.list()
  const parents = new Map(items.map((item) => [item.id, item.parentId]))
  const visited = new Set<string>()
  let cursor: string | null = parentId

  while (cursor) {
    if (cursor === id) {
      throw new AppError({
        code: "DEPARTMENT_PARENT_INVALID",
        message: "Department parent would create a cycle",
        status: 400,
        expose: true,
        details: { id, parentId },
      })
    }

    if (visited.has(cursor)) {
      return
    }

    visited.add(cursor)
    cursor = parents.get(cursor) ?? null
  }
}

const normalizeStringArray = (values: string[] | undefined) =>
  [
    ...new Set((values ?? []).map((value) => value.trim()).filter(Boolean)),
  ].sort()

export type DepartmentService = ReturnType<typeof createDepartmentService>
