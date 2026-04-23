import { AppError } from "../../errors"
import { createPasswordHash } from "../auth"
import type {
  CreateUserInput,
  UpdateUserInput,
  UserRepository,
} from "./repository"

export interface CreateUserPayload
  extends Omit<CreateUserInput, "passwordHash" | "username" | "displayName"> {
  username: string
  displayName: string
  password: string
}

export interface UpdateUserPayload extends UpdateUserInput {}

export const createUserService = (repository: UserRepository) => ({
  list: () => repository.list(),
  async getById(id: string) {
    const user = await repository.getById(id)

    if (!user) {
      throw new AppError({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return user
  },
  async create(input: CreateUserPayload) {
    const username = input.username.trim()
    const displayName = input.displayName.trim()
    const password = input.password.trim()

    if (username.length === 0) {
      throw new AppError({
        code: "USER_USERNAME_REQUIRED",
        message: "Username is required",
        status: 400,
        expose: true,
      })
    }

    if (displayName.length === 0) {
      throw new AppError({
        code: "USER_DISPLAY_NAME_REQUIRED",
        message: "Display name is required",
        status: 400,
        expose: true,
      })
    }

    if (password.length === 0) {
      throw new AppError({
        code: "USER_PASSWORD_REQUIRED",
        message: "Password is required",
        status: 400,
        expose: true,
      })
    }

    const existing = await repository.getByUsername(username)

    if (existing) {
      throw new AppError({
        code: "USER_USERNAME_CONFLICT",
        message: "Username already exists",
        status: 409,
        expose: true,
        details: { username },
      })
    }

    return repository.create({
      username,
      displayName,
      email: normalizeOptionalText(input.email),
      phone: normalizeOptionalText(input.phone),
      passwordHash: await createPasswordHash(password),
      status: input.status,
      isSuperAdmin: input.isSuperAdmin,
    })
  },
  async update(id: string, input: UpdateUserPayload) {
    const candidate =
      input.username !== undefined ? input.username.trim() : undefined
    const username = candidate === undefined ? undefined : candidate
    const displayName =
      input.displayName !== undefined ? input.displayName.trim() : undefined

    if (username !== undefined && username.length === 0) {
      throw new AppError({
        code: "USER_USERNAME_REQUIRED",
        message: "Username is required",
        status: 400,
        expose: true,
      })
    }

    if (displayName !== undefined && displayName.length === 0) {
      throw new AppError({
        code: "USER_DISPLAY_NAME_REQUIRED",
        message: "Display name is required",
        status: 400,
        expose: true,
      })
    }

    if (username !== undefined) {
      const existing = await repository.getByUsername(username)

      if (existing && existing.id !== id) {
        throw new AppError({
          code: "USER_USERNAME_CONFLICT",
          message: "Username already exists",
          status: 409,
          expose: true,
          details: { username },
        })
      }
    }

    const updated = await repository.update(id, {
      username,
      displayName,
      email:
        input.email !== undefined
          ? normalizeOptionalText(input.email)
          : undefined,
      phone:
        input.phone !== undefined
          ? normalizeOptionalText(input.phone)
          : undefined,
      status: input.status,
      isSuperAdmin: input.isSuperAdmin,
    })

    if (!updated) {
      throw new AppError({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return updated
  },
  async resetPassword(id: string, password: string) {
    const normalizedPassword = password.trim()

    if (normalizedPassword.length === 0) {
      throw new AppError({
        code: "USER_PASSWORD_REQUIRED",
        message: "Password is required",
        status: 400,
        expose: true,
      })
    }

    const updated = await repository.resetPassword(
      id,
      await createPasswordHash(normalizedPassword),
    )

    if (!updated) {
      throw new AppError({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }
  },
})

const normalizeOptionalText = (value: string | undefined) => {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : undefined
}

export type UserService = ReturnType<typeof createUserService>
