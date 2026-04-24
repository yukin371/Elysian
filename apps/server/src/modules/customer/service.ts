import type { DataAccessContext } from "@elysian/persistence"
import { AppError } from "../../errors"

import type {
  CreateCustomerInput,
  CustomerRepository,
  UpdateCustomerInput,
} from "./repository"

export const createCustomerService = (repository: CustomerRepository) => ({
  list: (dataAccess?: DataAccessContext) => repository.list(dataAccess),
  async getById(id: string, dataAccess?: DataAccessContext) {
    const customer = await repository.getById(id, dataAccess)

    if (!customer) {
      throw new AppError({
        code: "CUSTOMER_NOT_FOUND",
        message: "Customer not found",
        status: 404,
        expose: true,
        details: {
          id,
        },
      })
    }

    return customer
  },
  async create(input: CreateCustomerInput) {
    const name = input.name.trim()

    if (name.length === 0) {
      throw new AppError({
        code: "CUSTOMER_NAME_REQUIRED",
        message: "Customer name is required",
        status: 400,
        expose: true,
      })
    }

    return repository.create({
      ...input,
      name,
    })
  },
  async update(
    id: string,
    input: UpdateCustomerInput,
    dataAccess?: DataAccessContext,
  ) {
    const name = input.name?.trim()
    if (name !== undefined && name.length === 0) {
      throw new AppError({
        code: "CUSTOMER_NAME_REQUIRED",
        message: "Customer name is required",
        status: 400,
        expose: true,
      })
    }

    const updated = await repository.update(
      id,
      {
        ...input,
        ...(name !== undefined ? { name } : {}),
      },
      dataAccess,
    )

    if (!updated) {
      throw new AppError({
        code: "CUSTOMER_NOT_FOUND",
        message: "Customer not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return updated
  },
  async remove(id: string, dataAccess?: DataAccessContext) {
    const deleted = await repository.remove(id, dataAccess)

    if (!deleted) {
      throw new AppError({
        code: "CUSTOMER_NOT_FOUND",
        message: "Customer not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }
  },
})

export type CustomerService = ReturnType<typeof createCustomerService>
