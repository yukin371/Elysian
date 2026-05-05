import { describe, expect, it } from "bun:test"
import { DEFAULT_TENANT_ID } from "@elysian/persistence"
import { errorCodes } from "../../errors/registry"

import {
  createInMemoryTenantRepository,
  createTenantModule,
} from "../../modules"
import {
  createAuthTestFixture,
  createTenantSeedRecords,
  createTestApp,
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
  it("publishes tenant success responses in the openapi spec", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:tenant:list",
        "system:tenant:create",
        "system:tenant:update",
      ],
      isSuperAdmin: true,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createTenantModule(createInMemoryTenantRepository(), {
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
      getOpenApiResponse(paths, "/system/tenants", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/tenants", "get", "403"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/tenants", "post", "201"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/tenants", "post", "409"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/tenants/{id}", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/tenants/{id}", "put", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/tenants/{id}", "put", "404"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/tenants/{id}/status", "put", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/tenants/{id}/status", "put", "403"),
    ).toBeDefined()
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
    const loginBody = await readJsonRecord(loginResponse)
    const accessToken = readString(loginBody, "accessToken")

    const listResponse = await app.handle(
      new Request("http://localhost/system/tenants", {
        headers: {
          authorization: `Bearer ${accessToken}`,
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
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(createTenantSeedRecords()[0])

    const exportResponse = await app.handle(
      new Request("http://localhost/system/tenants/export", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(exportResponse.status).toBe(200)
    expect(exportResponse.headers.get("content-type")).toContain("text/csv")

    const exportText = await exportResponse.text()
    expect(exportText).toContain("id,code,name,status,createdAt,updatedAt")
    expect(exportText).toContain(
      "tenant-alpha,Tenant Alpha,active,2026-04-21T01:00:00.000Z,2026-04-21T01:00:00.000Z",
    )
    expect(exportText).toContain(
      "default,Default Tenant,active,2026-04-21T00:00:00.000Z,2026-04-21T00:00:00.000Z",
    )

    const createResponse = await app.handle(
      new Request("http://localhost/system/tenants", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          code: "tenant-beta",
          name: "Tenant Beta",
        }),
      }),
    )

    expect(createResponse.status).toBe(201)
    const createdTenant = await readJsonRecord(createResponse)
    expect(createdTenant).toEqual({
      id: expect.any(String),
      code: "tenant-beta",
      name: "Tenant Beta",
      status: "active",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateResponse = await app.handle(
      new Request(
        `http://localhost/system/tenants/${readString(createdTenant, "id")}`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name: "Tenant Beta Updated",
            status: "suspended",
          }),
        },
      ),
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
        `http://localhost/system/tenants/${readString(createdTenant, "id")}/status`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${accessToken}`,
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
    const loginBody = await readJsonRecord(loginResponse)
    const accessToken = readString(loginBody, "accessToken")

    const response = await app.handle(
      new Request("http://localhost/system/tenants", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      code: errorCodes.TENANT_SUPER_ADMIN_REQUIRED,
      message: "Tenant management requires a super admin",
      status: 403,
    })
  })
})
