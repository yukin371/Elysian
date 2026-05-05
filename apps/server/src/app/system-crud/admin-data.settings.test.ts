import { describe, expect, it } from "bun:test"
import { errorCodes } from "../../errors/registry"
import {
  createInMemorySettingRepository,
  createSettingModule,
} from "../../modules"
import {
  createAuthTestFixture,
  createSettingSeedRecords,
  createTestApp,
  loginAsAdmin,
  testAdminPassword,
} from "./test-support"

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const readJsonRecord = async (response: { json(): Promise<unknown> }) => {
  const body: unknown = await response.json()

  if (!isRecord(body)) {
    throw new Error("Malformed JSON response")
  }

  return body
}

const readRecord = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (!isRecord(property)) {
    throw new Error(`Expected object field: ${key}`)
  }

  return property
}

const readString = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (typeof property !== "string") {
    throw new Error(`Expected string field: ${key}`)
  }

  return property
}

const getOpenApiResponse = (
  paths: Record<string, unknown>,
  routePath: string,
  method: string,
  status: string,
) => {
  const route = readRecord(paths, routePath)
  const operation = readRecord(route, method)
  const responses = readRecord(operation, "responses")

  return responses[status]
}

describe("createServerApp system admin data", () => {
  it("publishes setting success responses in the openapi spec", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:setting:list"],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createSettingModule(createInMemorySettingRepository(), {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const response = await app.handle(
      new Request("http://localhost/openapi/json"),
    )

    expect(response.status).toBe(200)
    const payload = await readJsonRecord(response)
    const paths = readRecord(payload, "paths")

    expect(
      getOpenApiResponse(paths, "/system/settings", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/settings", "get", "401"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/settings", "post", "201"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/settings", "post", "409"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/settings/{id}", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/settings/{id}", "put", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/settings/{id}", "put", "404"),
    ).toBeDefined()
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
    const loginBody = await readJsonRecord(loginResponse)
    const accessToken = readString(loginBody, "accessToken")

    const listResponse = await app.handle(
      new Request("http://localhost/system/settings", {
        headers: {
          authorization: `Bearer ${accessToken}`,
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
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })

    const pagedResponse = await app.handle(
      new Request("http://localhost/system/settings?page=2&pageSize=1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(pagedResponse.status).toBe(200)
    expect(await pagedResponse.json()).toEqual({
      items: [
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
      total: 2,
      page: 2,
      pageSize: 1,
      totalPages: 2,
    })

    const getResponse = await app.handle(
      new Request("http://localhost/system/settings/setting_support_email_1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
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

  it("exports system settings as csv when the access token has setting-list permission", async () => {
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
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/settings/export", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("text/csv")

    const text = await response.text()
    expect(text).toContain(
      "id,key,value,description,status,createdAt,updatedAt",
    )
    expect(text).toContain(
      "setting_brand_name_1,platform.brand_name,Elysian,Display brand name,active,2026-04-21T00:00:00.000Z,2026-04-21T00:00:00.000Z",
    )
    expect(text).toContain(
      "setting_support_email_1,platform.support_email,support@example.com,Support contact email,active,2026-04-20T00:00:00.000Z,2026-04-20T00:00:00.000Z",
    )
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
    const loginBody = await readJsonRecord(loginResponse)
    const accessToken = readString(loginBody, "accessToken")

    const createResponse = await app.handle(
      new Request("http://localhost/system/settings", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
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
    const createdSetting = await readJsonRecord(createResponse)

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
      new Request(
        `http://localhost/system/settings/${readString(createdSetting, "id")}`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            value: "UTC",
            status: "disabled",
          }),
        },
      ),
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
    const loginBody = await readJsonRecord(loginResponse)
    const accessToken = readString(loginBody, "accessToken")

    const response = await app.handle(
      new Request("http://localhost/system/settings", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
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
      code: errorCodes.SETTING_KEY_CONFLICT,
      message: "Setting key already exists",
      status: 409,
      details: {
        key: "platform.brand_name",
      },
    })
  })
})
