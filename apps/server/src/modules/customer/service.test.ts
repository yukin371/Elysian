import { describe, expect, it } from "bun:test"

import { createInMemoryCustomerRepository } from "./repository"
import { createCustomerService } from "./service"

const createSeedCustomers = () => [
  {
    id: "customer_alpha_1",
    name: "Alpha Corp",
    status: "active" as const,
    createdAt: "2026-04-20T00:00:00.000Z",
    updatedAt: "2026-04-20T00:00:00.000Z",
    deptId: "dept_alpha_1",
    creatorId: "user_alpha_1",
  },
]

describe("createCustomerService", () => {
  it("trims customer names during create", async () => {
    const service = createCustomerService(
      createInMemoryCustomerRepository(createSeedCustomers()),
    )

    const customer = await service.create({
      name: "  Beta Corp  ",
    })

    expect(customer.name).toBe("Beta Corp")
    expect(customer.status).toBe("active")
  })

  it("rejects blank names during update", async () => {
    const service = createCustomerService(
      createInMemoryCustomerRepository(createSeedCustomers()),
    )

    await expect(
      service.update("customer_alpha_1", {
        name: "   ",
      }),
    ).rejects.toMatchObject({
      code: "CUSTOMER_NAME_REQUIRED",
      status: 400,
    })
  })

  it("rejects removing unknown customers", async () => {
    const service = createCustomerService(
      createInMemoryCustomerRepository(createSeedCustomers()),
    )

    await expect(service.remove("customer_missing_1")).rejects.toMatchObject({
      code: "CUSTOMER_NOT_FOUND",
      status: 404,
      details: {
        id: "customer_missing_1",
      },
    })
  })
})
