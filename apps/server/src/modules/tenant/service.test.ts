import { describe, expect, it } from "bun:test"

import { createInMemoryTenantRepository } from "./repository"
import { createTenantService } from "./service"

const createSeedTenants = () => [
  {
    id: "tenant_default_1",
    code: "default",
    name: "Default Tenant",
    status: "active" as const,
    createdAt: "2026-04-24T00:00:00.000Z",
    updatedAt: "2026-04-24T00:00:00.000Z",
  },
  {
    id: "tenant_alpha_1",
    code: "tenant-alpha",
    name: "Tenant Alpha",
    status: "active" as const,
    createdAt: "2026-04-24T01:00:00.000Z",
    updatedAt: "2026-04-24T01:00:00.000Z",
  },
]

describe("createTenantService", () => {
  it("trims create payload and defaults status to active", async () => {
    const service = createTenantService(
      createInMemoryTenantRepository(createSeedTenants()),
    )

    const tenant = await service.create({
      code: "  tenant-beta  ",
      name: "  Tenant Beta  ",
    })

    expect(tenant).toEqual({
      id: expect.any(String),
      code: "tenant-beta",
      name: "Tenant Beta",
      status: "active",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  it("rejects duplicate tenant codes during create", async () => {
    const service = createTenantService(
      createInMemoryTenantRepository(createSeedTenants()),
    )

    await expect(
      service.create({
        code: "tenant-alpha",
        name: "Duplicate Tenant",
      }),
    ).rejects.toMatchObject({
      code: "TENANT_CODE_CONFLICT",
      status: 409,
      details: {
        code: "tenant-alpha",
      },
    })
  })

  it("rejects updates that would collide with another tenant code", async () => {
    const service = createTenantService(
      createInMemoryTenantRepository(createSeedTenants()),
    )

    await expect(
      service.update("tenant_default_1", {
        code: "tenant-alpha",
      }),
    ).rejects.toMatchObject({
      code: "TENANT_CODE_CONFLICT",
      status: 409,
      details: {
        code: "tenant-alpha",
      },
    })
  })
})
