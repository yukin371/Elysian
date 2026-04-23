import { AppError } from "../../errors"
import type {
  CreateMenuInput,
  MenuRepository,
  UpdateMenuInput,
} from "./repository"

export interface CreateMenuPayload
  extends Omit<CreateMenuInput, "type" | "code" | "name"> {
  type: CreateMenuInput["type"]
  code: string
  name: string
}

export interface UpdateMenuPayload extends UpdateMenuInput {}

export const createMenuService = (repository: MenuRepository) => ({
  list: () => repository.list(),
  async getById(id: string) {
    const menu = await repository.getById(id)

    if (!menu) {
      throw new AppError({
        code: "MENU_NOT_FOUND",
        message: "Menu not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return menu
  },
  async create(input: CreateMenuPayload) {
    const code = input.code.trim()
    const name = input.name.trim()

    if (code.length === 0) {
      throw new AppError({
        code: "MENU_CODE_REQUIRED",
        message: "Menu code is required",
        status: 400,
        expose: true,
      })
    }

    if (name.length === 0) {
      throw new AppError({
        code: "MENU_NAME_REQUIRED",
        message: "Menu name is required",
        status: 400,
        expose: true,
      })
    }

    const existing = await repository.getByCode(code)
    if (existing) {
      throw new AppError({
        code: "MENU_CODE_CONFLICT",
        message: "Menu code already exists",
        status: 409,
        expose: true,
        details: { code },
      })
    }

    await assertMenuRelations(repository, {
      parentId: input.parentId ?? null,
      permissionCode: normalizeOptionalText(input.permissionCode),
      roleIds: normalizeStringArray(input.roleIds),
    })

    return repository.create({
      parentId: input.parentId ?? null,
      type: input.type,
      code,
      name,
      path: normalizeNullableText(input.path),
      component: normalizeNullableText(input.component),
      icon: normalizeNullableText(input.icon),
      sort: input.sort,
      isVisible: input.isVisible,
      status: input.status,
      permissionCode: normalizeNullableText(input.permissionCode),
      roleIds: normalizeStringArray(input.roleIds),
    })
  },
  async update(id: string, input: UpdateMenuPayload) {
    const current = await repository.getById(id)

    if (!current) {
      throw new AppError({
        code: "MENU_NOT_FOUND",
        message: "Menu not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    const code = input.code !== undefined ? input.code.trim() : undefined
    const name = input.name !== undefined ? input.name.trim() : undefined

    if (code !== undefined && code.length === 0) {
      throw new AppError({
        code: "MENU_CODE_REQUIRED",
        message: "Menu code is required",
        status: 400,
        expose: true,
      })
    }

    if (name !== undefined && name.length === 0) {
      throw new AppError({
        code: "MENU_NAME_REQUIRED",
        message: "Menu name is required",
        status: 400,
        expose: true,
      })
    }

    if (code !== undefined) {
      const existing = await repository.getByCode(code)

      if (existing && existing.id !== id) {
        throw new AppError({
          code: "MENU_CODE_CONFLICT",
          message: "Menu code already exists",
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
        code: "MENU_PARENT_INVALID",
        message: "Menu cannot be its own parent",
        status: 400,
        expose: true,
        details: { id },
      })
    }

    await assertNoMenuCycle(repository, id, nextParentId)

    await assertMenuRelations(repository, {
      parentId: nextParentId,
      permissionCode:
        input.permissionCode !== undefined
          ? normalizeOptionalText(input.permissionCode)
          : undefined,
      roleIds:
        input.roleIds !== undefined
          ? normalizeStringArray(input.roleIds)
          : undefined,
    })

    const updated = await repository.update(id, {
      parentId: input.parentId,
      type: input.type,
      code,
      name,
      path:
        input.path !== undefined
          ? normalizeNullableText(input.path)
          : undefined,
      component:
        input.component !== undefined
          ? normalizeNullableText(input.component)
          : undefined,
      icon:
        input.icon !== undefined
          ? normalizeNullableText(input.icon)
          : undefined,
      sort: input.sort,
      isVisible: input.isVisible,
      status: input.status,
      permissionCode:
        input.permissionCode !== undefined
          ? normalizeNullableText(input.permissionCode)
          : undefined,
      roleIds:
        input.roleIds !== undefined
          ? normalizeStringArray(input.roleIds)
          : undefined,
    })

    if (!updated) {
      throw new AppError({
        code: "MENU_NOT_FOUND",
        message: "Menu not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return updated
  },
})

const assertMenuRelations = async (
  repository: MenuRepository,
  input: {
    parentId?: string | null
    permissionCode?: string | null
    roleIds?: string[]
  },
) => {
  if (input.parentId) {
    const parent = await repository.getById(input.parentId)

    if (!parent) {
      throw new AppError({
        code: "MENU_PARENT_INVALID",
        message: "Menu parent does not exist",
        status: 400,
        expose: true,
        details: { parentId: input.parentId },
      })
    }
  }

  if (input.permissionCode !== undefined && input.permissionCode !== null) {
    const existingPermissionCodes =
      await repository.listExistingPermissionCodes([input.permissionCode])

    if (!existingPermissionCodes.includes(input.permissionCode)) {
      throw new AppError({
        code: "MENU_PERMISSION_CODE_INVALID",
        message: "Menu contains unknown permission code",
        status: 400,
        expose: true,
        details: {
          permissionCode: input.permissionCode,
        },
      })
    }
  }

  if (input.roleIds !== undefined) {
    const existingRoleIds = await repository.listExistingRoleIds(input.roleIds)
    const missingRoleIds = input.roleIds.filter(
      (roleId) => !existingRoleIds.includes(roleId),
    )

    if (missingRoleIds.length > 0) {
      throw new AppError({
        code: "MENU_ROLE_IDS_INVALID",
        message: "Menu contains unknown role ids",
        status: 400,
        expose: true,
        details: {
          roleIds: missingRoleIds,
        },
      })
    }
  }
}

const assertNoMenuCycle = async (
  repository: MenuRepository,
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
        code: "MENU_PARENT_INVALID",
        message: "Menu parent would create a cycle",
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

const normalizeOptionalText = (value: string | null | undefined) => {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : undefined
}

const normalizeNullableText = (value: string | null | undefined) => {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : null
}

const normalizeStringArray = (values: string[] | undefined) =>
  [
    ...new Set((values ?? []).map((value) => value.trim()).filter(Boolean)),
  ].sort()

export type MenuService = ReturnType<typeof createMenuService>
