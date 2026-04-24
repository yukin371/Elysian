import { describe, expect, it } from "bun:test"

import { createInMemorySettingRepository } from "./repository"

describe("createInMemorySettingRepository", () => {
  it("prefers tenant-scoped settings before default fallback", async () => {
    const repository = createInMemorySettingRepository([
      {
        id: "setting_default_1",
        key: "platform.brand_name",
        value: "Elysian",
        status: "active",
        tenantId: undefined,
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T00:00:00.000Z",
      },
      {
        id: "setting_tenant_1",
        key: "platform.brand_name",
        value: "Tenant Alpha",
        status: "active",
        tenantId: "tenant_alpha_1",
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T01:00:00.000Z",
      },
    ])

    expect(
      await repository.getByKeyWithTenantFallback(
        "platform.brand_name",
        "tenant_alpha_1",
      ),
    ).toEqual({
      id: "setting_tenant_1",
      key: "platform.brand_name",
      value: "Tenant Alpha",
      status: "active",
      createdAt: "2026-04-24T00:00:00.000Z",
      updatedAt: "2026-04-24T01:00:00.000Z",
    })
  })

  it("falls back to default settings when tenant override is missing", async () => {
    const repository = createInMemorySettingRepository([
      {
        id: "setting_default_1",
        key: "platform.support_email",
        value: "support@example.com",
        status: "active",
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T00:00:00.000Z",
      },
    ])

    expect(
      await repository.getByKeyWithTenantFallback(
        "platform.support_email",
        "tenant_beta_1",
      ),
    ).toEqual({
      id: "setting_default_1",
      key: "platform.support_email",
      value: "support@example.com",
      status: "active",
      createdAt: "2026-04-24T00:00:00.000Z",
      updatedAt: "2026-04-24T00:00:00.000Z",
    })
  })

  it("does not read another tenant's override during fallback", async () => {
    const repository = createInMemorySettingRepository([
      {
        id: "setting_default_1",
        key: "platform.timezone",
        value: "UTC",
        status: "active",
        tenantId: "00000000-0000-0000-0000-000000000000",
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T00:00:00.000Z",
      },
      {
        id: "setting_other_tenant_1",
        key: "platform.timezone",
        value: "Asia/Tokyo",
        status: "active",
        tenantId: "tenant_other_1",
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T01:00:00.000Z",
      },
    ])

    expect(
      await repository.getByKeyWithTenantFallback(
        "platform.timezone",
        "tenant_beta_1",
      ),
    ).toEqual({
      id: "setting_default_1",
      key: "platform.timezone",
      value: "UTC",
      status: "active",
      createdAt: "2026-04-24T00:00:00.000Z",
      updatedAt: "2026-04-24T00:00:00.000Z",
    })
  })
})
