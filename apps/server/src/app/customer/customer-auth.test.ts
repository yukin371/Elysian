import { describe, expect, it } from "bun:test"

import {
  createCustomerModule,
  createInMemoryCustomerRepository,
} from "../../modules"
import type {
  CreateCustomerInput,
  CustomerRepository,
} from "../../modules/customer"
import {
  createAuthTestFixture,
  createTestApp,
  testAdminPassword,
} from "./test-support"

describe("createServerApp customer auth", () => {
  it("returns 401 for protected customer routes without an access token", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["customer:customer:list"],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createCustomerModule(createInMemoryCustomerRepository(), {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const response = await app.handle(new Request("http://localhost/customers"))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      error: {
        code: "AUTH_ACCESS_TOKEN_REQUIRED",
        message: "Access token is required",
        status: 401,
      },
    })
  })

  it("returns 403 when the access token lacks customer permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:user:list"],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createCustomerModule(createInMemoryCustomerRepository(), {
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
      new Request("http://localhost/customers", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      error: {
        code: "AUTH_PERMISSION_DENIED",
        message: "Permission denied",
        status: 403,
        details: {
          permissionCode: "customer:customer:list",
        },
      },
    })
  })

  it("allows protected customer routes when the access token has permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["customer:customer:list"],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createCustomerModule(
          createInMemoryCustomerRepository([
            {
              id: "cust_auth_1",
              name: "Secured Customer",
              status: "active",
              createdAt: "2026-04-21T00:00:00.000Z",
              updatedAt: "2026-04-21T00:00:00.000Z",
            },
          ]),
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
      new Request("http://localhost/customers", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      items: [
        {
          id: "cust_auth_1",
          name: "Secured Customer",
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })
  })

  it("filters customers by department-scoped data access", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["customer:customer:list"],
      isSuperAdmin: false,
      dataScope: 3,
      userDepartmentIds: ["department_ops_1"],
      departments: [
        {
          id: "department_root_1",
          parentId: null,
        },
        {
          id: "department_ops_1",
          parentId: "department_root_1",
        },
      ],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createCustomerModule(
          createInMemoryCustomerRepository([
            {
              id: "cust_visible_1",
              name: "Ops Customer",
              status: "active",
              deptId: "department_ops_1",
              creatorId: "user_external_1",
              createdAt: "2026-04-21T00:00:00.000Z",
              updatedAt: "2026-04-21T00:00:00.000Z",
            },
            {
              id: "cust_hidden_1",
              name: "Root Customer",
              status: "active",
              deptId: "department_root_1",
              creatorId: "user_external_2",
              createdAt: "2026-04-21T01:00:00.000Z",
              updatedAt: "2026-04-21T01:00:00.000Z",
            },
          ]),
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
      new Request("http://localhost/customers", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      items: [
        {
          id: "cust_visible_1",
          name: "Ops Customer",
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })
  })

  it("passes tenant identity into customer creation", async () => {
    const tenantId = "11111111-1111-4111-8111-111111111111"
    const fixture = await createAuthTestFixture({
      permissions: ["customer:customer:create"],
      isSuperAdmin: false,
      tenantId,
      userDepartmentIds: ["department_ops_1"],
    })
    let receivedCreateInput: CreateCustomerInput | null = null
    const customerRepository: CustomerRepository = {
      list: async () => ({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
      getById: async () => null,
      create: async (input) => {
        receivedCreateInput = input

        return {
          id: "cust_created_1",
          name: input.name,
          status: input.status ?? "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        }
      },
      update: async () => null,
      remove: async () => false,
    }
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createCustomerModule(customerRepository, {
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
      new Request("http://localhost/customers", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: " Tenant Scoped Customer ",
          status: "inactive",
        }),
      }),
    )

    expect(response.status).toBe(201)
    if (!receivedCreateInput) {
      throw new Error("Expected customer repository create to be called")
    }
    const actualCreateInput: CreateCustomerInput = receivedCreateInput
    expect(actualCreateInput).toEqual({
      name: "Tenant Scoped Customer",
      status: "inactive",
      deptId: "department_ops_1",
      creatorId: fixture.userId,
      tenantId,
    })
  })
})
