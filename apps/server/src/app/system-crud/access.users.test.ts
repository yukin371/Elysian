import { describe, expect, it } from "bun:test"
import { errorCodes } from "../../errors/registry"
import { createInMemoryUserRepository, createUserModule } from "../../modules"
import {
  createAuthTestFixture,
  createTestApp,
  createUserSeedRecords,
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

describe("createServerApp system user access", () => {
  it("publishes user success responses in the openapi spec", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:user:list"],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createUserModule(createInMemoryUserRepository(), {
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
      getOpenApiResponse(paths, "/system/users", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/users", "get", "401"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/users", "post", "201"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/users", "post", "409"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/users/{id}", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/users/{id}", "put", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/users/{id}", "put", "404"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(
        paths,
        "/system/users/{id}/reset-password",
        "post",
        "204",
      ),
    ).toBeDefined()
  })

  it("lists and gets system users when the access token has user-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:user:list"],
      isSuperAdmin: false,
    })
    const userRepository = createInMemoryUserRepository(
      await createUserSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createUserModule(userRepository, {
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
      new Request("http://localhost/system/users", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [
        {
          id: "user_admin_1",
          username: "admin",
          displayName: "Administrator",
          email: "admin@example.com",
          phone: "13800000000",
          status: "active",
          isSuperAdmin: true,
          lastLoginAt: "2026-04-21T08:00:00.000Z",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T08:00:00.000Z",
        },
        {
          id: "user_ops_1",
          username: "operator",
          displayName: "Operator",
          email: "operator@example.com",
          phone: "13900000000",
          status: "active",
          isSuperAdmin: false,
          lastLoginAt: null,
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
      new Request("http://localhost/system/users?page=2&pageSize=1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(pagedResponse.status).toBe(200)
    expect(await pagedResponse.json()).toEqual({
      items: [
        {
          id: "user_ops_1",
          username: "operator",
          displayName: "Operator",
          email: "operator@example.com",
          phone: "13900000000",
          status: "active",
          isSuperAdmin: false,
          lastLoginAt: null,
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
      new Request("http://localhost/system/users/user_ops_1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual({
      id: "user_ops_1",
      username: "operator",
      displayName: "Operator",
      email: "operator@example.com",
      phone: "13900000000",
      status: "active",
      isSuperAdmin: false,
      lastLoginAt: null,
      createdAt: "2026-04-20T00:00:00.000Z",
      updatedAt: "2026-04-20T00:00:00.000Z",
    })
  })

  it("exports system users as csv when the access token has user-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:user:list"],
      isSuperAdmin: false,
    })
    const userRepository = createInMemoryUserRepository(
      await createUserSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createUserModule(userRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/users/export", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("text/csv")

    const text = await response.text()
    expect(text).toContain(
      "id,username,displayName,email,phone,status,isSuperAdmin,lastLoginAt,createdAt,updatedAt",
    )
    expect(text).toContain(
      "user_admin_1,admin,Administrator,admin@example.com,13800000000,active,true,2026-04-21T08:00:00.000Z,2026-04-21T00:00:00.000Z,2026-04-21T08:00:00.000Z",
    )
    expect(text).toContain(
      "user_ops_1,operator,Operator,operator@example.com,13900000000,active,false,,2026-04-20T00:00:00.000Z,2026-04-20T00:00:00.000Z",
    )
  })

  it("creates, updates, and resets a system user through the user module", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:user:list",
        "system:user:create",
        "system:user:update",
        "system:user:reset-password",
      ],
      isSuperAdmin: false,
    })
    const userRepository = createInMemoryUserRepository(
      await createUserSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createUserModule(userRepository, {
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
      new Request("http://localhost/system/users", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "auditor",
          displayName: "Auditor",
          email: "auditor@example.com",
          phone: "13700000000",
          password: ["auditor", "123"].join("-"),
          status: "disabled",
          isSuperAdmin: false,
        }),
      }),
    )

    expect(createResponse.status).toBe(201)

    const createdUser = await readJsonRecord(createResponse)

    expect(createdUser).toEqual({
      id: expect.any(String),
      username: "auditor",
      displayName: "Auditor",
      email: "auditor@example.com",
      phone: "13700000000",
      status: "disabled",
      isSuperAdmin: false,
      lastLoginAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateResponse = await app.handle(
      new Request(
        `http://localhost/system/users/${readString(createdUser, "id")}`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            displayName: "Lead Auditor",
            status: "active",
          }),
        },
      ),
    )

    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toEqual({
      ...createdUser,
      displayName: "Lead Auditor",
      status: "active",
      updatedAt: expect.any(String),
    })

    const resetPasswordResponse = await app.handle(
      new Request(
        `http://localhost/system/users/${readString(
          createdUser,
          "id",
        )}/reset-password`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            password: ["auditor", "456"].join("-"),
          }),
        },
      ),
    )

    expect(resetPasswordResponse.status).toBe(204)
  })

  it("rejects duplicate usernames during user creation", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:user:create"],
      isSuperAdmin: false,
    })
    const userRepository = createInMemoryUserRepository(
      await createUserSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createUserModule(userRepository, {
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
      new Request("http://localhost/system/users", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "operator",
          displayName: "Another Operator",
          password: ["operator", "999"].join("-"),
        }),
      }),
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      code: errorCodes.USER_USERNAME_CONFLICT,
      message: "Username already exists",
      status: 409,
      details: {
        username: "operator",
      },
    })
  })
})
