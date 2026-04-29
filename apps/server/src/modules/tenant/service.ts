import { AppError } from "../../errors"
import type {
  CreateTenantInput,
  TenantRepository,
  UpdateTenantInput,
} from "./repository"

export interface CreateTenantPayload
  extends Omit<CreateTenantInput, "code" | "name"> {
  code: string
  name: string
}

export interface UpdateTenantPayload extends UpdateTenantInput {}

export const createTenantService = (repository: TenantRepository) => ({
  list: () => repository.list(),
  async exportCsv() {
    const items = await repository.list()

    return buildCsv(
      ["id", "code", "name", "status", "createdAt", "updatedAt"],
      items.map((item) => [
        item.id,
        item.code,
        item.name,
        item.status,
        item.createdAt,
        item.updatedAt,
      ]),
    )
  },
  async getById(id: string) {
    const tenant = await repository.getById(id)

    if (!tenant) {
      throw new AppError({
        code: "TENANT_NOT_FOUND",
        message: "Tenant not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return tenant
  },
  async create(input: CreateTenantPayload) {
    const code = input.code.trim()
    const name = input.name.trim()

    if (code.length === 0) {
      throw new AppError({
        code: "TENANT_CODE_REQUIRED",
        message: "Tenant code is required",
        status: 400,
        expose: true,
      })
    }

    if (name.length === 0) {
      throw new AppError({
        code: "TENANT_NAME_REQUIRED",
        message: "Tenant name is required",
        status: 400,
        expose: true,
      })
    }

    const existing = await repository.getByCode(code)
    if (existing) {
      throw new AppError({
        code: "TENANT_CODE_CONFLICT",
        message: "Tenant code already exists",
        status: 409,
        expose: true,
        details: { code },
      })
    }

    return repository.create({
      code,
      name,
      status: input.status,
    })
  },
  async update(id: string, input: UpdateTenantPayload) {
    const current = await repository.getById(id)

    if (!current) {
      throw new AppError({
        code: "TENANT_NOT_FOUND",
        message: "Tenant not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    const code = input.code !== undefined ? input.code.trim() : undefined
    const name = input.name !== undefined ? input.name.trim() : undefined

    if (code !== undefined && code.length === 0) {
      throw new AppError({
        code: "TENANT_CODE_REQUIRED",
        message: "Tenant code is required",
        status: 400,
        expose: true,
      })
    }

    if (name !== undefined && name.length === 0) {
      throw new AppError({
        code: "TENANT_NAME_REQUIRED",
        message: "Tenant name is required",
        status: 400,
        expose: true,
      })
    }

    if (code !== undefined) {
      const existing = await repository.getByCode(code)

      if (existing && existing.id !== id) {
        throw new AppError({
          code: "TENANT_CODE_CONFLICT",
          message: "Tenant code already exists",
          status: 409,
          expose: true,
          details: { code },
        })
      }
    }

    const updated = await repository.update(id, {
      code,
      name,
      status: input.status,
    })

    if (!updated) {
      throw new AppError({
        code: "TENANT_NOT_FOUND",
        message: "Tenant not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return updated
  },
  async updateStatus(id: string, status: "active" | "suspended") {
    const current = await repository.getById(id)

    if (!current) {
      throw new AppError({
        code: "TENANT_NOT_FOUND",
        message: "Tenant not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    const updated = await repository.update(id, { status })

    if (!updated) {
      throw new AppError({
        code: "TENANT_NOT_FOUND",
        message: "Tenant not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return updated
  },
})

const buildCsv = (
  header: string[],
  rows: Array<Array<string | number | null | undefined>>,
) =>
  [header.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join(
    "\n",
  )

const escapeCsv = (value: string | number | null | undefined) => {
  const normalized = value === null || value === undefined ? "" : String(value)

  if (
    normalized.includes(",") ||
    normalized.includes('"') ||
    normalized.includes("\n") ||
    normalized.includes("\r")
  ) {
    return `"${normalized.replaceAll('"', '""')}"`
  }

  return normalized
}

export type TenantService = ReturnType<typeof createTenantService>
