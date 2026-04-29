import { AppError } from "../../errors"
import type {
  CreatePostInput,
  PostRepository,
  UpdatePostInput,
} from "./repository"

export interface CreatePostPayload extends CreatePostInput {
  code: string
  name: string
}

export interface UpdatePostPayload extends UpdatePostInput {}

export const createPostService = (repository: PostRepository) => ({
  list: () => repository.list(),
  async getById(id: string) {
    const post = await repository.getById(id)

    if (!post) {
      throw new AppError({
        code: "POST_NOT_FOUND",
        message: "Post not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return post
  },
  async create(input: CreatePostPayload) {
    const code = input.code.trim()
    const name = input.name.trim()

    if (code.length === 0) {
      throw new AppError({
        code: "POST_CODE_REQUIRED",
        message: "Post code is required",
        status: 400,
        expose: true,
      })
    }

    if (name.length === 0) {
      throw new AppError({
        code: "POST_NAME_REQUIRED",
        message: "Post name is required",
        status: 400,
        expose: true,
      })
    }

    const existing = await repository.getByCode(code)
    if (existing) {
      throw new AppError({
        code: "POST_CODE_CONFLICT",
        message: "Post code already exists",
        status: 409,
        expose: true,
        details: { code },
      })
    }

    return repository.create({
      code,
      name,
      sort: input.sort,
      status: input.status,
      remark: normalizeOptionalText(input.remark) ?? "",
    })
  },
  async update(id: string, input: UpdatePostPayload) {
    const current = await repository.getById(id)

    if (!current) {
      throw new AppError({
        code: "POST_NOT_FOUND",
        message: "Post not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    const code = input.code !== undefined ? input.code.trim() : undefined
    const name = input.name !== undefined ? input.name.trim() : undefined

    if (code !== undefined && code.length === 0) {
      throw new AppError({
        code: "POST_CODE_REQUIRED",
        message: "Post code is required",
        status: 400,
        expose: true,
      })
    }

    if (name !== undefined && name.length === 0) {
      throw new AppError({
        code: "POST_NAME_REQUIRED",
        message: "Post name is required",
        status: 400,
        expose: true,
      })
    }

    if (code !== undefined) {
      const existing = await repository.getByCode(code)

      if (existing && existing.id !== id) {
        throw new AppError({
          code: "POST_CODE_CONFLICT",
          message: "Post code already exists",
          status: 409,
          expose: true,
          details: { code },
        })
      }
    }

    const updated = await repository.update(id, {
      code,
      name,
      sort: input.sort,
      status: input.status,
      remark:
        input.remark !== undefined
          ? (normalizeOptionalText(input.remark) ?? "")
          : undefined,
    })

    if (!updated) {
      throw new AppError({
        code: "POST_NOT_FOUND",
        message: "Post not found",
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

export type PostService = ReturnType<typeof createPostService>
