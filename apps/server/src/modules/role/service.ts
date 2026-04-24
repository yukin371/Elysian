import type { RoleDataScope } from "@elysian/schema"
import { AppError } from "../../errors"
import type {
  CreateRoleInput,
  RoleRepository,
  UpdateRoleInput,
} from "./repository"

export interface CreateRolePayload
  extends Omit<CreateRoleInput, "code" | "name"> {
  code: string
  name: string
}

export interface UpdateRolePayload extends UpdateRoleInput {}

export const createRoleService = (repository: RoleRepository) => ({
  list: () => repository.list(),
  async getById(id: string) {
    const role = await repository.getById(id)

    if (!role) {
      throw new AppError({
        code: "ROLE_NOT_FOUND",
        message: "Role not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return role
  },
  async create(input: CreateRolePayload) {
    const code = input.code.trim()
    const name = input.name.trim()

    if (code.length === 0) {
      throw new AppError({
        code: "ROLE_CODE_REQUIRED",
        message: "Role code is required",
        status: 400,
        expose: true,
      })
    }

    if (name.length === 0) {
      throw new AppError({
        code: "ROLE_NAME_REQUIRED",
        message: "Role name is required",
        status: 400,
        expose: true,
      })
    }

    const existing = await repository.getByCode(code)

    if (existing) {
      throw new AppError({
        code: "ROLE_CODE_CONFLICT",
        message: "Role code already exists",
        status: 409,
        expose: true,
        details: { code },
      })
    }

    const permissionCodes = normalizeStringArray(input.permissionCodes)
    const userIds = normalizeStringArray(input.userIds)
    const deptIds = normalizeStringArray(input.deptIds)

    assertValidDataScope(input.dataScope)

    await assertRoleRelations(repository, permissionCodes, userIds, deptIds)

    return repository.create({
      code,
      name,
      description: normalizeOptionalText(input.description),
      status: input.status,
      isSystem: input.isSystem,
      dataScope: input.dataScope,
      permissionCodes,
      userIds,
      deptIds,
    })
  },
  async update(id: string, input: UpdateRolePayload) {
    const current = await repository.getById(id)

    if (!current) {
      throw new AppError({
        code: "ROLE_NOT_FOUND",
        message: "Role not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    const code = input.code !== undefined ? input.code.trim() : undefined
    const name = input.name !== undefined ? input.name.trim() : undefined

    if (code !== undefined && code.length === 0) {
      throw new AppError({
        code: "ROLE_CODE_REQUIRED",
        message: "Role code is required",
        status: 400,
        expose: true,
      })
    }

    if (name !== undefined && name.length === 0) {
      throw new AppError({
        code: "ROLE_NAME_REQUIRED",
        message: "Role name is required",
        status: 400,
        expose: true,
      })
    }

    if (code !== undefined) {
      const existing = await repository.getByCode(code)

      if (existing && existing.id !== id) {
        throw new AppError({
          code: "ROLE_CODE_CONFLICT",
          message: "Role code already exists",
          status: 409,
          expose: true,
          details: { code },
        })
      }
    }

    if (current.isSystem) {
      if (code !== undefined && code !== current.code) {
        throw new AppError({
          code: "ROLE_SYSTEM_IMMUTABLE",
          message: "System role code cannot be changed",
          status: 409,
          expose: true,
          details: { id, code: current.code },
        })
      }

      if (input.status !== undefined && input.status !== current.status) {
        throw new AppError({
          code: "ROLE_SYSTEM_IMMUTABLE",
          message: "System role status cannot be changed",
          status: 409,
          expose: true,
          details: { id, code: current.code },
        })
      }

      if (input.isSystem === false) {
        throw new AppError({
          code: "ROLE_SYSTEM_IMMUTABLE",
          message: "System role flag cannot be removed",
          status: 409,
          expose: true,
          details: { id, code: current.code },
        })
      }
    }

    const permissionCodes =
      input.permissionCodes !== undefined
        ? normalizeStringArray(input.permissionCodes)
        : undefined
    const userIds =
      input.userIds !== undefined
        ? normalizeStringArray(input.userIds)
        : undefined
    const deptIds =
      input.deptIds !== undefined
        ? normalizeStringArray(input.deptIds)
        : undefined

    assertValidDataScope(input.dataScope)

    await assertRoleRelations(repository, permissionCodes, userIds, deptIds)

    const updated = await repository.update(id, {
      code,
      name,
      description:
        input.description !== undefined
          ? normalizeOptionalText(input.description)
          : undefined,
      status: input.status,
      isSystem: input.isSystem,
      dataScope: input.dataScope,
      permissionCodes,
      userIds,
      deptIds,
    })

    if (!updated) {
      throw new AppError({
        code: "ROLE_NOT_FOUND",
        message: "Role not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return updated
  },
})

const assertRoleRelations = async (
  repository: RoleRepository,
  permissionCodes?: string[],
  userIds?: string[],
  deptIds?: string[],
) => {
  if (permissionCodes !== undefined) {
    const existingPermissionCodes =
      await repository.listExistingPermissionCodes(permissionCodes)
    const missingPermissionCodes = permissionCodes.filter(
      (code) => !existingPermissionCodes.includes(code),
    )

    if (missingPermissionCodes.length > 0) {
      throw new AppError({
        code: "ROLE_PERMISSION_CODES_INVALID",
        message: "Role contains unknown permission codes",
        status: 400,
        expose: true,
        details: {
          permissionCodes: missingPermissionCodes,
        },
      })
    }
  }

  if (userIds !== undefined) {
    const existingUserIds = await repository.listExistingUserIds(userIds)
    const missingUserIds = userIds.filter(
      (userId) => !existingUserIds.includes(userId),
    )

    if (missingUserIds.length > 0) {
      throw new AppError({
        code: "ROLE_USER_IDS_INVALID",
        message: "Role contains unknown user ids",
        status: 400,
        expose: true,
        details: {
          userIds: missingUserIds,
        },
      })
    }
  }

  if (deptIds !== undefined) {
    const existingDepartmentIds =
      await repository.listExistingDepartmentIds(deptIds)
    const missingDepartmentIds = deptIds.filter(
      (departmentId) => !existingDepartmentIds.includes(departmentId),
    )

    if (missingDepartmentIds.length > 0) {
      throw new AppError({
        code: "ROLE_DEPARTMENT_IDS_INVALID",
        message: "Role contains unknown department ids",
        status: 400,
        expose: true,
        details: {
          deptIds: missingDepartmentIds,
        },
      })
    }
  }
}

const normalizeOptionalText = (value: string | undefined) => {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : undefined
}

const normalizeStringArray = (values: string[] | undefined) =>
  [
    ...new Set((values ?? []).map((value) => value.trim()).filter(Boolean)),
  ].sort()

const assertValidDataScope = (value: RoleDataScope | undefined) => {
  if (value === undefined) {
    return
  }

  if (![1, 2, 3, 4, 5].includes(value)) {
    throw new AppError({
      code: "ROLE_DATA_SCOPE_INVALID",
      message: "Role data scope is invalid",
      status: 400,
      expose: true,
      details: { dataScope: value },
    })
  }
}

export type RoleService = ReturnType<typeof createRoleService>
