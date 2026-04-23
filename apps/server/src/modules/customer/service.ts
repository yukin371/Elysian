import { AppError } from "../../errors"

import type {
  CreateCustomerInput,
  CustomerRepository,
  UpdateCustomerInput,
} from "./repository"

export const createCustomerService = (repository: CustomerRepository) => ({
  list: () => repository.list(),
  async getById(id: string) {
    const customer = await repository.getById(id)

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
  async update(id: string, input: UpdateCustomerInput) {
    const name = input.name?.trim()
    if (name !== undefined && name.length === 0) {
      throw new AppError({
        code: "CUSTOMER_NAME_REQUIRED",
        message: "Customer name is required",
        status: 400,
        expose: true,
      })
    }

    const updated = await repository.update(id, {
      ...input,
      ...(name !== undefined ? { name } : {}),
    })

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
  async remove(id: string) {
    const deleted = await repository.remove(id)

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
