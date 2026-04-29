import { describe, expect, it } from "bun:test"
import { DEFAULT_TENANT_ID } from "@elysian/persistence"

import {
  createDepartmentModule,
  createDictionaryModule,
  createInMemoryDepartmentRepository,
  createInMemoryDictionaryRepository,
  createInMemoryMenuRepository,
  createInMemoryPostRepository,
  createInMemoryRoleRepository,
  createInMemorySettingRepository,
  createInMemoryTenantRepository,
  createInMemoryUserRepository,
  createMenuModule,
  createPostModule,
  createRoleModule,
  createSettingModule,
  createTenantModule,
  createUserModule,
} from "../../modules"
import {
  createAuthTestFixture,
  createAuthorizedHeaders,
  createDepartmentSeedRecords,
  createDictionaryTypeSeedRecords,
  createMenuSeedRecords,
  createPostSeedRecords,
  createRoleSeedRecords,
  createSettingSeedRecords,
  createTenantSeedRecords,
  createTestApp,
  createUserSeedRecords,
  loginAsAdmin,
  testAdminPassword,
} from "./test-support"

describe("createServerApp system admin data", () => {
  it("lists and gets dictionary types and items when the access token has dictionary-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:dictionary:list"],
      isSuperAdmin: false,
    })
    const dictionaryRepository = createInMemoryDictionaryRepository({
      types: createDictionaryTypeSeedRecords(),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDictionaryModule(dictionaryRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const listTypesResponse = await app.handle(
      new Request("http://localhost/system/dictionaries/types", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(listTypesResponse.status).toBe(200)
    expect(await listTypesResponse.json()).toEqual({
      items: [
        {
          id: "dictionary_type_status_1",
          code: "customer_status",
          name: "Customer Status",
          description: "Customer lifecycle status",
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "dictionary_type_priority_1",
          code: "priority_level",
          name: "Priority Level",
          description: "Priority level options",
          status: "active",
          createdAt: "2026-04-20T00:00:00.000Z",
          updatedAt: "2026-04-20T00:00:00.000Z",
        },
      ],
    })

    const getTypeResponse = await app.handle(
      new Request(
        "http://localhost/system/dictionaries/types/dictionary_type_status_1",
        {
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
          },
        },
      ),
    )

    expect(getTypeResponse.status).toBe(200)
    expect(await getTypeResponse.json()).toEqual({
      id: "dictionary_type_status_1",
      code: "customer_status",
      name: "Customer Status",
      description: "Customer lifecycle status",
      status: "active",
      items: [
        {
          id: "dictionary_item_status_active_1",
          typeId: "dictionary_type_status_1",
          value: "active",
          label: "Active",
          sort: 10,
          isDefault: true,
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "dictionary_item_status_inactive_1",
          typeId: "dictionary_type_status_1",
          value: "inactive",
          label: "Inactive",
          sort: 20,
          isDefault: false,
          status: "active",
          createdAt: "2026-04-21T01:00:00.000Z",
          updatedAt: "2026-04-21T01:00:00.000Z",
        },
      ],
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
    })

    const listItemsResponse = await app.handle(
      new Request(
        "http://localhost/system/dictionaries/items?typeId=dictionary_type_status_1",
        {
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
          },
        },
      ),
    )

    expect(listItemsResponse.status).toBe(200)
    expect(await listItemsResponse.json()).toEqual({
      items: [
        {
          id: "dictionary_item_status_active_1",
          typeId: "dictionary_type_status_1",
          value: "active",
          label: "Active",
          sort: 10,
          isDefault: true,
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "dictionary_item_status_inactive_1",
          typeId: "dictionary_type_status_1",
          value: "inactive",
          label: "Inactive",
          sort: 20,
          isDefault: false,
          status: "active",
          createdAt: "2026-04-21T01:00:00.000Z",
          updatedAt: "2026-04-21T01:00:00.000Z",
        },
      ],
    })

    const getItemResponse = await app.handle(
      new Request(
        "http://localhost/system/dictionaries/items/dictionary_item_status_active_1",
        {
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
          },
        },
      ),
    )

    expect(getItemResponse.status).toBe(200)
    expect(await getItemResponse.json()).toEqual({
      id: "dictionary_item_status_active_1",
      typeId: "dictionary_type_status_1",
      value: "active",
      label: "Active",
      sort: 10,
      isDefault: true,
      status: "active",
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
    })
  })

  it("creates and updates dictionary types and items", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:dictionary:list",
        "system:dictionary:create",
        "system:dictionary:update",
      ],
      isSuperAdmin: false,
    })
    const dictionaryRepository = createInMemoryDictionaryRepository({
      types: createDictionaryTypeSeedRecords(),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDictionaryModule(dictionaryRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const createTypeResponse = await app.handle(
      new Request("http://localhost/system/dictionaries/types", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          code: "region",
          name: "Region",
          description: "Region options",
        }),
      }),
    )

    expect(createTypeResponse.status).toBe(201)
    const createdType = (await createTypeResponse.json()) as {
      id: string
      code: string
      name: string
      description: string
      status: string
      items: unknown[]
      createdAt: string
      updatedAt: string
    }

    expect(createdType).toEqual({
      id: expect.any(String),
      code: "region",
      name: "Region",
      description: "Region options",
      status: "active",
      items: [],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateTypeResponse = await app.handle(
      new Request(
        `http://localhost/system/dictionaries/types/${createdType.id}`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name: "Region Zone",
            status: "disabled",
          }),
        },
      ),
    )

    expect(updateTypeResponse.status).toBe(200)
    expect(await updateTypeResponse.json()).toEqual({
      ...createdType,
      name: "Region Zone",
      status: "disabled",
      updatedAt: expect.any(String),
    })

    const createItemResponse = await app.handle(
      new Request("http://localhost/system/dictionaries/items", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          typeId: "dictionary_type_priority_1",
          value: "high",
          label: "High",
          sort: 10,
          isDefault: true,
        }),
      }),
    )

    expect(createItemResponse.status).toBe(201)
    const createdItem = (await createItemResponse.json()) as {
      id: string
      typeId: string
      value: string
      label: string
      sort: number
      isDefault: boolean
      status: string
      createdAt: string
      updatedAt: string
    }

    expect(createdItem).toEqual({
      id: expect.any(String),
      typeId: "dictionary_type_priority_1",
      value: "high",
      label: "High",
      sort: 10,
      isDefault: true,
      status: "active",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateItemResponse = await app.handle(
      new Request(
        `http://localhost/system/dictionaries/items/${createdItem.id}`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            label: "High Priority",
            isDefault: false,
            status: "disabled",
          }),
        },
      ),
    )

    expect(updateItemResponse.status).toBe(200)
    expect(await updateItemResponse.json()).toEqual({
      ...createdItem,
      label: "High Priority",
      isDefault: false,
      status: "disabled",
      updatedAt: expect.any(String),
    })
  })

  it("rejects invalid dictionary item relations", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:dictionary:create"],
      isSuperAdmin: false,
    })
    const dictionaryRepository = createInMemoryDictionaryRepository({
      types: createDictionaryTypeSeedRecords(),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDictionaryModule(dictionaryRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const response = await app.handle(
      new Request("http://localhost/system/dictionaries/items", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          typeId: "missing-type",
          value: "archived",
          label: "Archived",
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: {
        code: "DICTIONARY_ITEM_TYPE_INVALID",
        message: "Dictionary item type does not exist",
        status: 400,
        details: {
          typeId: "missing-type",
        },
      },
    })
  })

  it("lists and gets system settings when the access token has setting-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:setting:list"],
      isSuperAdmin: false,
    })
    const settingRepository = createInMemorySettingRepository(
      createSettingSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createSettingModule(settingRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const listResponse = await app.handle(
      new Request("http://localhost/system/settings", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [
        {
          id: "setting_brand_name_1",
          key: "platform.brand_name",
          value: "Elysian",
          description: "Display brand name",
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "setting_support_email_1",
          key: "platform.support_email",
          value: "support@example.com",
          description: "Support contact email",
          status: "active",
          createdAt: "2026-04-20T00:00:00.000Z",
          updatedAt: "2026-04-20T00:00:00.000Z",
        },
      ],
    })

    const getResponse = await app.handle(
      new Request("http://localhost/system/settings/setting_support_email_1", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual({
      id: "setting_support_email_1",
      key: "platform.support_email",
      value: "support@example.com",
      description: "Support contact email",
      status: "active",
      createdAt: "2026-04-20T00:00:00.000Z",
      updatedAt: "2026-04-20T00:00:00.000Z",
    })
  })

  it("creates and updates system settings", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:setting:list",
        "system:setting:create",
        "system:setting:update",
      ],
      isSuperAdmin: false,
    })
    const settingRepository = createInMemorySettingRepository(
      createSettingSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createSettingModule(settingRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const createResponse = await app.handle(
      new Request("http://localhost/system/settings", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          key: "platform.timezone",
          value: "Asia/Shanghai",
          description: "Default display timezone",
        }),
      }),
    )

    expect(createResponse.status).toBe(201)
    const createdSetting = (await createResponse.json()) as {
      id: string
      key: string
      value: string
      description: string
      status: string
      createdAt: string
      updatedAt: string
    }

    expect(createdSetting).toEqual({
      id: expect.any(String),
      key: "platform.timezone",
      value: "Asia/Shanghai",
      description: "Default display timezone",
      status: "active",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateResponse = await app.handle(
      new Request(`http://localhost/system/settings/${createdSetting.id}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          value: "UTC",
          status: "disabled",
        }),
      }),
    )

    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toEqual({
      ...createdSetting,
      value: "UTC",
      status: "disabled",
      updatedAt: expect.any(String),
    })
  })

  it("rejects duplicate setting keys", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:setting:create"],
      isSuperAdmin: false,
    })
    const settingRepository = createInMemorySettingRepository(
      createSettingSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createSettingModule(settingRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const response = await app.handle(
      new Request("http://localhost/system/settings", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          key: "platform.brand_name",
          value: "Another Name",
        }),
      }),
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      error: {
        code: "SETTING_KEY_CONFLICT",
        message: "Setting key already exists",
        status: 409,
        details: {
          key: "platform.brand_name",
        },
      },
    })
  })

  it("lists, gets, creates, and updates tenants for super admins", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:tenant:list",
        "system:tenant:create",
        "system:tenant:update",
      ],
      isSuperAdmin: true,
    })
    const tenantRepository = createInMemoryTenantRepository(
      createTenantSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createTenantModule(tenantRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const listResponse = await app.handle(
      new Request("http://localhost/system/tenants", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [createTenantSeedRecords()[1], createTenantSeedRecords()[0]],
    })

    const getResponse = await app.handle(
      new Request(`http://localhost/system/tenants/${DEFAULT_TENANT_ID}`, {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(createTenantSeedRecords()[0])

    const createResponse = await app.handle(
      new Request("http://localhost/system/tenants", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          code: "tenant-beta",
          name: "Tenant Beta",
        }),
      }),
    )

    expect(createResponse.status).toBe(201)
    const createdTenant = (await createResponse.json()) as {
      id: string
      code: string
      name: string
      status: string
      createdAt: string
      updatedAt: string
    }
    expect(createdTenant).toEqual({
      id: expect.any(String),
      code: "tenant-beta",
      name: "Tenant Beta",
      status: "active",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateResponse = await app.handle(
      new Request(`http://localhost/system/tenants/${createdTenant.id}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Tenant Beta Updated",
          status: "suspended",
        }),
      }),
    )

    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toEqual({
      ...createdTenant,
      name: "Tenant Beta Updated",
      status: "suspended",
      updatedAt: expect.any(String),
    })

    const statusResponse = await app.handle(
      new Request(
        `http://localhost/system/tenants/${createdTenant.id}/status`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            status: "active",
          }),
        },
      ),
    )

    expect(statusResponse.status).toBe(200)
    expect(await statusResponse.json()).toEqual({
      ...createdTenant,
      name: "Tenant Beta Updated",
      status: "active",
      updatedAt: expect.any(String),
    })
  })

  it("requires super admin privileges for tenant management", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:tenant:list"],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createTenantModule(
          createInMemoryTenantRepository(createTenantSeedRecords()),
          {
            authGuard: fixture.authGuard,
          },
        ),
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const response = await app.handle(
      new Request("http://localhost/system/tenants", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      error: {
        code: "TENANT_SUPER_ADMIN_REQUIRED",
        message: "Tenant management requires a super admin",
        status: 403,
      },
    })
  })
})
