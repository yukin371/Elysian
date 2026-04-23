import { AppError } from "../../errors"
import type {
  CreateDictionaryItemInput,
  CreateDictionaryTypeInput,
  DictionaryRepository,
  UpdateDictionaryItemInput,
  UpdateDictionaryTypeInput,
} from "./repository"

export interface CreateDictionaryTypePayload
  extends Omit<CreateDictionaryTypeInput, "code" | "name"> {
  code: string
  name: string
}

export interface UpdateDictionaryTypePayload
  extends UpdateDictionaryTypeInput {}

export interface CreateDictionaryItemPayload
  extends Omit<CreateDictionaryItemInput, "typeId" | "value" | "label"> {
  typeId: string
  value: string
  label: string
}

export interface UpdateDictionaryItemPayload
  extends UpdateDictionaryItemInput {}

export const createDictionaryService = (repository: DictionaryRepository) => ({
  listTypes: () => repository.listTypes(),
  async getTypeById(id: string) {
    const type = await repository.getTypeById(id)

    if (!type) {
      throw new AppError({
        code: "DICTIONARY_TYPE_NOT_FOUND",
        message: "Dictionary type not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return type
  },
  async createType(input: CreateDictionaryTypePayload) {
    const code = input.code.trim()
    const name = input.name.trim()

    if (code.length === 0) {
      throw new AppError({
        code: "DICTIONARY_TYPE_CODE_REQUIRED",
        message: "Dictionary type code is required",
        status: 400,
        expose: true,
      })
    }

    if (name.length === 0) {
      throw new AppError({
        code: "DICTIONARY_TYPE_NAME_REQUIRED",
        message: "Dictionary type name is required",
        status: 400,
        expose: true,
      })
    }

    const existing = await repository.getTypeByCode(code)
    if (existing) {
      throw new AppError({
        code: "DICTIONARY_TYPE_CODE_CONFLICT",
        message: "Dictionary type code already exists",
        status: 409,
        expose: true,
        details: { code },
      })
    }

    return repository.createType({
      code,
      name,
      description: normalizeOptionalText(input.description),
      status: input.status,
    })
  },
  async updateType(id: string, input: UpdateDictionaryTypePayload) {
    const current = await repository.getTypeById(id)

    if (!current) {
      throw new AppError({
        code: "DICTIONARY_TYPE_NOT_FOUND",
        message: "Dictionary type not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    const code = input.code !== undefined ? input.code.trim() : undefined
    const name = input.name !== undefined ? input.name.trim() : undefined

    if (code !== undefined && code.length === 0) {
      throw new AppError({
        code: "DICTIONARY_TYPE_CODE_REQUIRED",
        message: "Dictionary type code is required",
        status: 400,
        expose: true,
      })
    }

    if (name !== undefined && name.length === 0) {
      throw new AppError({
        code: "DICTIONARY_TYPE_NAME_REQUIRED",
        message: "Dictionary type name is required",
        status: 400,
        expose: true,
      })
    }

    if (code !== undefined) {
      const existing = await repository.getTypeByCode(code)
      if (existing && existing.id !== id) {
        throw new AppError({
          code: "DICTIONARY_TYPE_CODE_CONFLICT",
          message: "Dictionary type code already exists",
          status: 409,
          expose: true,
          details: { code },
        })
      }
    }

    const updated = await repository.updateType(id, {
      code,
      name,
      description:
        input.description !== undefined
          ? normalizeOptionalText(input.description)
          : undefined,
      status: input.status,
    })

    if (!updated) {
      throw new AppError({
        code: "DICTIONARY_TYPE_NOT_FOUND",
        message: "Dictionary type not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return updated
  },
  listItems: (typeId?: string) => repository.listItems(typeId),
  async getItemById(id: string) {
    const item = await repository.getItemById(id)

    if (!item) {
      throw new AppError({
        code: "DICTIONARY_ITEM_NOT_FOUND",
        message: "Dictionary item not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return item
  },
  async createItem(input: CreateDictionaryItemPayload) {
    const typeId = input.typeId.trim()
    const value = input.value.trim()
    const label = input.label.trim()

    if (typeId.length === 0) {
      throw new AppError({
        code: "DICTIONARY_ITEM_TYPE_REQUIRED",
        message: "Dictionary item type is required",
        status: 400,
        expose: true,
      })
    }

    if (value.length === 0) {
      throw new AppError({
        code: "DICTIONARY_ITEM_VALUE_REQUIRED",
        message: "Dictionary item value is required",
        status: 400,
        expose: true,
      })
    }

    if (label.length === 0) {
      throw new AppError({
        code: "DICTIONARY_ITEM_LABEL_REQUIRED",
        message: "Dictionary item label is required",
        status: 400,
        expose: true,
      })
    }

    await assertDictionaryTypeExists(repository, typeId)

    const existing = await repository.getItemByTypeAndValue(typeId, value)
    if (existing) {
      throw new AppError({
        code: "DICTIONARY_ITEM_VALUE_CONFLICT",
        message: "Dictionary item value already exists in type",
        status: 409,
        expose: true,
        details: { typeId, value },
      })
    }

    return repository.createItem({
      typeId,
      value,
      label,
      sort: input.sort,
      isDefault: input.isDefault,
      status: input.status,
    })
  },
  async updateItem(id: string, input: UpdateDictionaryItemPayload) {
    const current = await repository.getItemById(id)

    if (!current) {
      throw new AppError({
        code: "DICTIONARY_ITEM_NOT_FOUND",
        message: "Dictionary item not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    const typeId = input.typeId !== undefined ? input.typeId.trim() : undefined
    const value = input.value !== undefined ? input.value.trim() : undefined
    const label = input.label !== undefined ? input.label.trim() : undefined

    if (typeId !== undefined && typeId.length === 0) {
      throw new AppError({
        code: "DICTIONARY_ITEM_TYPE_REQUIRED",
        message: "Dictionary item type is required",
        status: 400,
        expose: true,
      })
    }

    if (value !== undefined && value.length === 0) {
      throw new AppError({
        code: "DICTIONARY_ITEM_VALUE_REQUIRED",
        message: "Dictionary item value is required",
        status: 400,
        expose: true,
      })
    }

    if (label !== undefined && label.length === 0) {
      throw new AppError({
        code: "DICTIONARY_ITEM_LABEL_REQUIRED",
        message: "Dictionary item label is required",
        status: 400,
        expose: true,
      })
    }

    const nextTypeId = typeId ?? current.typeId
    const nextValue = value ?? current.value

    await assertDictionaryTypeExists(repository, nextTypeId)

    const existing = await repository.getItemByTypeAndValue(
      nextTypeId,
      nextValue,
    )
    if (existing && existing.id !== id) {
      throw new AppError({
        code: "DICTIONARY_ITEM_VALUE_CONFLICT",
        message: "Dictionary item value already exists in type",
        status: 409,
        expose: true,
        details: { typeId: nextTypeId, value: nextValue },
      })
    }

    const updated = await repository.updateItem(id, {
      typeId,
      value,
      label,
      sort: input.sort,
      isDefault: input.isDefault,
      status: input.status,
    })

    if (!updated) {
      throw new AppError({
        code: "DICTIONARY_ITEM_NOT_FOUND",
        message: "Dictionary item not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return updated
  },
})

const assertDictionaryTypeExists = async (
  repository: DictionaryRepository,
  typeId: string,
) => {
  const type = await repository.getTypeById(typeId)

  if (!type) {
    throw new AppError({
      code: "DICTIONARY_ITEM_TYPE_INVALID",
      message: "Dictionary item type does not exist",
      status: 400,
      expose: true,
      details: { typeId },
    })
  }
}

const normalizeOptionalText = (value: string | undefined) => {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : undefined
}

export type DictionaryService = ReturnType<typeof createDictionaryService>
