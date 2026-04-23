import { AppError } from "../../errors"
import type {
  CreateSettingInput,
  SettingRepository,
  UpdateSettingInput,
} from "./repository"

export interface CreateSettingPayload
  extends Omit<CreateSettingInput, "key" | "value"> {
  key: string
  value: string
}

export interface UpdateSettingPayload extends UpdateSettingInput {}

export const createSettingService = (repository: SettingRepository) => ({
  list: () => repository.list(),
  async getById(id: string) {
    const setting = await repository.getById(id)

    if (!setting) {
      throw new AppError({
        code: "SETTING_NOT_FOUND",
        message: "Setting not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return setting
  },
  async create(input: CreateSettingPayload) {
    const key = input.key.trim()
    const value = input.value.trim()

    if (key.length === 0) {
      throw new AppError({
        code: "SETTING_KEY_REQUIRED",
        message: "Setting key is required",
        status: 400,
        expose: true,
      })
    }

    if (value.length === 0) {
      throw new AppError({
        code: "SETTING_VALUE_REQUIRED",
        message: "Setting value is required",
        status: 400,
        expose: true,
      })
    }

    const existing = await repository.getByKey(key)
    if (existing) {
      throw new AppError({
        code: "SETTING_KEY_CONFLICT",
        message: "Setting key already exists",
        status: 409,
        expose: true,
        details: { key },
      })
    }

    return repository.create({
      key,
      value,
      description: normalizeOptionalText(input.description),
      status: input.status,
    })
  },
  async update(id: string, input: UpdateSettingPayload) {
    const current = await repository.getById(id)

    if (!current) {
      throw new AppError({
        code: "SETTING_NOT_FOUND",
        message: "Setting not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    const key = input.key !== undefined ? input.key.trim() : undefined
    const value = input.value !== undefined ? input.value.trim() : undefined

    if (key !== undefined && key.length === 0) {
      throw new AppError({
        code: "SETTING_KEY_REQUIRED",
        message: "Setting key is required",
        status: 400,
        expose: true,
      })
    }

    if (value !== undefined && value.length === 0) {
      throw new AppError({
        code: "SETTING_VALUE_REQUIRED",
        message: "Setting value is required",
        status: 400,
        expose: true,
      })
    }

    if (key !== undefined) {
      const existing = await repository.getByKey(key)

      if (existing && existing.id !== id) {
        throw new AppError({
          code: "SETTING_KEY_CONFLICT",
          message: "Setting key already exists",
          status: 409,
          expose: true,
          details: { key },
        })
      }
    }

    const updated = await repository.update(id, {
      key,
      value,
      description:
        input.description !== undefined
          ? normalizeOptionalText(input.description)
          : undefined,
      status: input.status,
    })

    if (!updated) {
      throw new AppError({
        code: "SETTING_NOT_FOUND",
        message: "Setting not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return updated
  },
})

const normalizeOptionalText = (value: string | undefined) => {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : undefined
}

export type SettingService = ReturnType<typeof createSettingService>
