import { describe, expect, it } from "bun:test"
import { DEFAULT_TENANT_ID } from "@elysian/persistence"
import { errorCodes } from "../../errors/registry"

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

describe("createServerApp system organization", () => {
  it("publishes department and post success responses in the openapi spec", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:department:list", "system:post:list"],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDepartmentModule(createInMemoryDepartmentRepository(), {
          authGuard: fixture.authGuard,
        }),
        createPostModule(createInMemoryPostRepository(), {
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
      getOpenApiResponse(paths, "/system/departments", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/departments", "get", "401"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/departments", "post", "201"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/departments", "post", "400"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/departments/{id}", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/departments/{id}", "put", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/departments/{id}", "put", "404"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/posts", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/posts", "get", "401"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/posts", "post", "201"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/posts", "post", "409"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/posts/{id}", "get", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/posts/{id}", "put", "200"),
    ).toBeDefined()
    expect(
      getOpenApiResponse(paths, "/system/posts/{id}", "put", "404"),
    ).toBeDefined()
  })

  it("lists and gets system departments when the access token has department-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:department:list"],
      isSuperAdmin: false,
    })
    const departmentRepository = createInMemoryDepartmentRepository({
      departments: createDepartmentSeedRecords(),
      availableUserIds: ["user_admin_1", "user_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDepartmentModule(departmentRepository, {
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
      new Request("http://localhost/system/departments", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [
        {
          id: "department_root_1",
          parentId: null,
          code: "hq",
          name: "Headquarters",
          sort: 10,
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "department_ops_1",
          parentId: "department_root_1",
          code: "ops",
          name: "Operations",
          sort: 20,
          status: "active",
          createdAt: "2026-04-21T01:00:00.000Z",
          updatedAt: "2026-04-21T01:00:00.000Z",
        },
      ],
    })

    const getResponse = await app.handle(
      new Request("http://localhost/system/departments/department_ops_1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual({
      id: "department_ops_1",
      parentId: "department_root_1",
      code: "ops",
      name: "Operations",
      sort: 20,
      status: "active",
      userIds: ["user_ops_1"],
      createdAt: "2026-04-21T01:00:00.000Z",
      updatedAt: "2026-04-21T01:00:00.000Z",
    })
  })

  it("exports system departments as csv when the access token has department-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:department:list"],
      isSuperAdmin: false,
    })
    const departmentRepository = createInMemoryDepartmentRepository({
      departments: createDepartmentSeedRecords(),
      availableUserIds: ["user_admin_1", "user_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDepartmentModule(departmentRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/departments/export", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("text/csv")

    const text = await response.text()
    expect(text).toContain(
      "id,parentId,code,name,sort,status,createdAt,updatedAt",
    )
    expect(text).toContain(
      "department_root_1,,hq,Headquarters,10,active,2026-04-21T00:00:00.000Z,2026-04-21T00:00:00.000Z",
    )
    expect(text).toContain(
      "department_ops_1,department_root_1,ops,Operations,20,active,2026-04-21T01:00:00.000Z,2026-04-21T01:00:00.000Z",
    )
  })

  it("creates and updates departments with parent and user bindings", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:department:list",
        "system:department:create",
        "system:department:update",
      ],
      isSuperAdmin: false,
    })
    const departmentRepository = createInMemoryDepartmentRepository({
      departments: createDepartmentSeedRecords(),
      availableUserIds: ["user_admin_1", "user_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDepartmentModule(departmentRepository, {
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
      new Request("http://localhost/system/departments", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parentId: "department_root_1",
          code: "support",
          name: "Support",
          sort: 30,
          userIds: ["user_ops_1"],
        }),
      }),
    )

    expect(createResponse.status).toBe(201)

    const createdDepartment = await readJsonRecord(createResponse)

    expect(createdDepartment).toEqual({
      id: expect.any(String),
      parentId: "department_root_1",
      code: "support",
      name: "Support",
      sort: 30,
      status: "active",
      userIds: ["user_ops_1"],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateResponse = await app.handle(
      new Request(
        `http://localhost/system/departments/${readString(createdDepartment, "id")}`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name: "Support Center",
            status: "disabled",
            userIds: ["user_admin_1", "user_ops_1"],
          }),
        },
      ),
    )

    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toEqual({
      ...createdDepartment,
      name: "Support Center",
      status: "disabled",
      userIds: ["user_admin_1", "user_ops_1"],
      updatedAt: expect.any(String),
    })
  })

  it("rejects invalid department relations", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:department:create"],
      isSuperAdmin: false,
    })
    const departmentRepository = createInMemoryDepartmentRepository({
      departments: createDepartmentSeedRecords(),
      availableUserIds: ["user_admin_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDepartmentModule(departmentRepository, {
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
      new Request("http://localhost/system/departments", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parentId: "missing-parent",
          code: "bad-department",
          name: "Bad Department",
          userIds: ["user_unknown_1"],
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      code: errorCodes.DEPARTMENT_PARENT_INVALID,
      message: "Department parent does not exist",
      status: 400,
      details: {
        parentId: "missing-parent",
      },
    })
  })

  it("rejects department parent cycles", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:department:update"],
      isSuperAdmin: false,
    })
    const departmentRepository = createInMemoryDepartmentRepository({
      departments: createDepartmentSeedRecords(),
      availableUserIds: ["user_admin_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createDepartmentModule(departmentRepository, {
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
      new Request("http://localhost/system/departments/department_root_1", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parentId: "department_ops_1",
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      code: errorCodes.DEPARTMENT_PARENT_INVALID,
      message: "Department parent would create a cycle",
      status: 400,
      details: {
        id: "department_root_1",
        parentId: "department_ops_1",
      },
    })
  })

  it("lists and gets system posts when the access token has post-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:post:list"],
      isSuperAdmin: false,
    })
    const postRepository = createInMemoryPostRepository({
      posts: createPostSeedRecords(),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createPostModule(postRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const listResponse = await app.handle(
      new Request("http://localhost/system/posts", {
        headers: createAuthorizedHeaders(accessToken),
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [
        {
          id: "post_ceo_1",
          code: "ceo",
          name: "Chief Executive Officer",
          sort: 10,
          status: "active",
          remark: "Top management role",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "post_ops_1",
          code: "ops-lead",
          name: "Operations Lead",
          sort: 20,
          status: "disabled",
          remark: "",
          createdAt: "2026-04-21T01:00:00.000Z",
          updatedAt: "2026-04-21T01:00:00.000Z",
        },
      ],
    })

    const getResponse = await app.handle(
      new Request("http://localhost/system/posts/post_ops_1", {
        headers: createAuthorizedHeaders(accessToken),
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual({
      id: "post_ops_1",
      code: "ops-lead",
      name: "Operations Lead",
      sort: 20,
      status: "disabled",
      remark: "",
      createdAt: "2026-04-21T01:00:00.000Z",
      updatedAt: "2026-04-21T01:00:00.000Z",
    })
  })

  it("exports system posts as csv when the access token has post-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:post:list"],
      isSuperAdmin: false,
    })
    const postRepository = createInMemoryPostRepository({
      posts: createPostSeedRecords(),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createPostModule(postRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/posts/export", {
        headers: createAuthorizedHeaders(accessToken),
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("text/csv")

    const text = await response.text()
    expect(text).toContain(
      "id,code,name,sort,status,remark,createdAt,updatedAt",
    )
    expect(text).toContain(
      "post_ceo_1,ceo,Chief Executive Officer,10,active,Top management role,2026-04-21T00:00:00.000Z,2026-04-21T00:00:00.000Z",
    )
    expect(text).toContain(
      "post_ops_1,ops-lead,Operations Lead,20,disabled,,2026-04-21T01:00:00.000Z,2026-04-21T01:00:00.000Z",
    )
  })

  it("creates and updates system posts", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:post:list",
        "system:post:create",
        "system:post:update",
      ],
      isSuperAdmin: false,
    })
    const postRepository = createInMemoryPostRepository({
      posts: createPostSeedRecords(),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createPostModule(postRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const createResponse = await app.handle(
      new Request("http://localhost/system/posts", {
        method: "POST",
        headers: createAuthorizedHeaders(accessToken, {
          "content-type": "application/json",
        }),
        body: JSON.stringify({
          code: "support-manager",
          name: "Support Manager",
          sort: 30,
          remark: "Customer support owner",
        }),
      }),
    )

    expect(createResponse.status).toBe(201)

    const createdPost = await readJsonRecord(createResponse)

    expect(createdPost).toEqual({
      id: expect.any(String),
      code: "support-manager",
      name: "Support Manager",
      sort: 30,
      status: "active",
      remark: "Customer support owner",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateResponse = await app.handle(
      new Request(
        `http://localhost/system/posts/${readString(createdPost, "id")}`,
        {
          method: "PUT",
          headers: createAuthorizedHeaders(accessToken, {
            "content-type": "application/json",
          }),
          body: JSON.stringify({
            name: "Support Lead",
            status: "disabled",
            remark: "Escalation owner",
          }),
        },
      ),
    )

    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toEqual({
      ...createdPost,
      name: "Support Lead",
      status: "disabled",
      remark: "Escalation owner",
      updatedAt: expect.any(String),
    })
  })

  it("rejects duplicate post codes during creation", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:post:create"],
      isSuperAdmin: false,
    })
    const postRepository = createInMemoryPostRepository({
      posts: createPostSeedRecords(),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createPostModule(postRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/posts", {
        method: "POST",
        headers: createAuthorizedHeaders(accessToken, {
          "content-type": "application/json",
        }),
        body: JSON.stringify({
          code: "ops-lead",
          name: "Another Operations Lead",
        }),
      }),
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      code: errorCodes.POST_CODE_CONFLICT,
      message: "Post code already exists",
      status: 409,
      details: {
        code: "ops-lead",
      },
    })
  })
})
