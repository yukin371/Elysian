import { describe, expect, it } from "bun:test"
import { createInMemoryRoleRepository, createRoleModule } from "../../modules"
import {
  createAuthTestFixture,
  createAuthorizedHeaders,
  createRoleSeedRecords,
  createTestApp,
  loginAsAdmin,
  testAdminPassword,
} from "./test-support"

describe("createServerApp system role access", () => {
  it("lists and gets system roles when the access token has role-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:role:list"],
      isSuperAdmin: false,
    })
    const roleRepository = createInMemoryRoleRepository({
      roles: createRoleSeedRecords(),
      availablePermissionCodes: [
        "system:user:list",
        "system:role:list",
        "system:role:create",
        "system:role:update",
        "customer:customer:list",
      ],
      availableUserIds: ["user_admin_1", "user_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createRoleModule(roleRepository, {
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
      new Request("http://localhost/system/roles", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [
        {
          id: "role_admin_1",
          code: "admin",
          name: "Admin",
          description: "System administrator",
          status: "active",
          isSystem: true,
          dataScope: 1,
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "role_operator_1",
          code: "operator",
          name: "Operator",
          description: "Operator role",
          status: "active",
          isSystem: false,
          dataScope: 1,
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
      new Request("http://localhost/system/roles?page=2&pageSize=1", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(pagedResponse.status).toBe(200)
    expect(await pagedResponse.json()).toEqual({
      items: [
        {
          id: "role_operator_1",
          code: "operator",
          name: "Operator",
          description: "Operator role",
          status: "active",
          isSystem: false,
          dataScope: 1,
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
      new Request("http://localhost/system/roles/role_operator_1", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual({
      id: "role_operator_1",
      code: "operator",
      name: "Operator",
      description: "Operator role",
      status: "active",
      isSystem: false,
      dataScope: 1,
      permissionCodes: ["customer:customer:list"],
      userIds: ["user_ops_1"],
      deptIds: [],
      createdAt: "2026-04-20T00:00:00.000Z",
      updatedAt: "2026-04-20T00:00:00.000Z",
    })
  })

  it("exports system roles as csv when the access token has role-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:role:list"],
      isSuperAdmin: false,
    })
    const roleRepository = createInMemoryRoleRepository({
      roles: createRoleSeedRecords(),
      availablePermissionCodes: [
        "system:user:list",
        "system:role:list",
        "system:role:create",
        "system:role:update",
        "customer:customer:list",
      ],
      availableUserIds: ["user_admin_1", "user_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createRoleModule(roleRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/roles/export", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("text/csv")

    const text = await response.text()
    expect(text).toContain(
      "id,code,name,description,status,isSystem,dataScope,createdAt,updatedAt",
    )
    expect(text).toContain(
      "role_admin_1,admin,Admin,System administrator,active,true,1,2026-04-21T00:00:00.000Z,2026-04-21T00:00:00.000Z",
    )
    expect(text).toContain(
      "role_operator_1,operator,Operator,Operator role,active,false,1,2026-04-20T00:00:00.000Z,2026-04-20T00:00:00.000Z",
    )
  })

  it("creates and updates a role with permission and user assignments", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:role:list",
        "system:role:create",
        "system:role:update",
      ],
      isSuperAdmin: false,
    })
    const roleRepository = createInMemoryRoleRepository({
      roles: createRoleSeedRecords(),
      availablePermissionCodes: [
        "system:user:list",
        "system:role:list",
        "system:role:create",
        "system:role:update",
        "customer:customer:list",
        "customer:customer:update",
      ],
      availableUserIds: ["user_admin_1", "user_ops_1"],
      availableDepartmentIds: ["department_root_1", "department_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createRoleModule(roleRepository, {
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
      new Request("http://localhost/system/roles", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          code: "auditor",
          name: "Auditor",
          description: "Audit role",
          dataScope: 2,
          permissionCodes: [
            "customer:customer:list",
            "customer:customer:update",
          ],
          userIds: ["user_ops_1"],
          deptIds: ["department_ops_1"],
        }),
      }),
    )

    expect(createResponse.status).toBe(201)

    const createdRole = (await createResponse.json()) as {
      id: string
      code: string
      name: string
      description: string
      status: string
      isSystem: boolean
      dataScope: number
      permissionCodes: string[]
      userIds: string[]
      deptIds: string[]
      createdAt: string
      updatedAt: string
    }

    expect(createdRole).toEqual({
      id: expect.any(String),
      code: "auditor",
      name: "Auditor",
      description: "Audit role",
      status: "active",
      isSystem: false,
      dataScope: 2,
      permissionCodes: ["customer:customer:list", "customer:customer:update"],
      userIds: ["user_ops_1"],
      deptIds: ["department_ops_1"],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateResponse = await app.handle(
      new Request(`http://localhost/system/roles/${createdRole.id}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Lead Auditor",
          dataScope: 3,
          permissionCodes: ["system:user:list"],
          userIds: ["user_admin_1", "user_ops_1"],
          deptIds: ["department_root_1"],
        }),
      }),
    )

    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toEqual({
      ...createdRole,
      name: "Lead Auditor",
      dataScope: 3,
      permissionCodes: ["system:user:list"],
      userIds: ["user_admin_1", "user_ops_1"],
      deptIds: ["department_root_1"],
      updatedAt: expect.any(String),
    })
  })

  it("protects system roles from destructive field changes", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:role:update"],
      isSuperAdmin: false,
    })
    const roleRepository = createInMemoryRoleRepository({
      roles: createRoleSeedRecords(),
      availablePermissionCodes: ["system:role:update"],
      availableUserIds: ["user_admin_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createRoleModule(roleRepository, {
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
      new Request("http://localhost/system/roles/role_admin_1", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          status: "disabled",
        }),
      }),
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      error: {
        code: "ROLE_SYSTEM_IMMUTABLE",
        message: "System role status cannot be changed",
        status: 409,
        details: {
          id: "role_admin_1",
          code: "admin",
        },
      },
    })
  })
})
