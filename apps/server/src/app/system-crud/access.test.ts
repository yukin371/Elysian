import { describe, expect, it } from "bun:test"

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

describe("createServerApp system access", () => {
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const listResponse = await app.handle(
      new Request("http://localhost/system/users", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
    })

    const getResponse = await app.handle(
      new Request("http://localhost/system/users/user_ops_1", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const createResponse = await app.handle(
      new Request("http://localhost/system/users", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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

    const createdUser = (await createResponse.json()) as {
      id: string
      username: string
      displayName: string
      status: string
      email: string
      phone: string
      isSuperAdmin: boolean
      lastLoginAt: string | null
      createdAt: string
      updatedAt: string
    }

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
      new Request(`http://localhost/system/users/${createdUser.id}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          displayName: "Lead Auditor",
          status: "active",
        }),
      }),
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
        `http://localhost/system/users/${createdUser.id}/reset-password`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }
    const response = await app.handle(
      new Request("http://localhost/system/users", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
      error: {
        code: "USER_USERNAME_CONFLICT",
        message: "Username already exists",
        status: 409,
        details: {
          username: "operator",
        },
      },
    })
  })

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

  it("lists and gets system menus when the access token has menu-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:menu:list"],
      isSuperAdmin: false,
    })
    const menuRepository = createInMemoryMenuRepository({
      menus: createMenuSeedRecords(),
      availablePermissionCodes: [
        "system:user:list",
        "system:role:list",
        "system:menu:list",
        "system:menu:update",
      ],
      availableRoleIds: ["role_admin_1", "role_operator_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createMenuModule(menuRepository, {
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
      new Request("http://localhost/system/menus", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [
        {
          id: "menu_system_root_1",
          parentId: null,
          type: "directory",
          code: "system-root",
          name: "System",
          path: "/system",
          component: null,
          icon: "settings",
          sort: 10,
          isVisible: true,
          status: "active",
          permissionCode: null,
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "menu_system_users_1",
          parentId: "menu_system_root_1",
          type: "menu",
          code: "system-users",
          name: "Users",
          path: "/system/users",
          component: "system/users/index",
          icon: "users",
          sort: 11,
          isVisible: true,
          status: "active",
          permissionCode: "system:user:list",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "menu_system_roles_1",
          parentId: "menu_system_root_1",
          type: "menu",
          code: "system-roles",
          name: "Roles",
          path: "/system/roles",
          component: "system/roles/index",
          icon: "shield",
          sort: 12,
          isVisible: true,
          status: "active",
          permissionCode: "system:role:list",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      ],
    })

    const getResponse = await app.handle(
      new Request("http://localhost/system/menus/menu_system_users_1", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual({
      id: "menu_system_users_1",
      parentId: "menu_system_root_1",
      type: "menu",
      code: "system-users",
      name: "Users",
      path: "/system/users",
      component: "system/users/index",
      icon: "users",
      sort: 11,
      isVisible: true,
      status: "active",
      permissionCode: "system:user:list",
      roleIds: ["role_admin_1"],
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
    })
  })

  it("creates and updates menus with parent, permission, and role bindings", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:menu:list", "system:menu:update"],
      isSuperAdmin: false,
    })
    const menuRepository = createInMemoryMenuRepository({
      menus: createMenuSeedRecords(),
      availablePermissionCodes: [
        "system:user:list",
        "system:role:list",
        "system:menu:list",
        "system:menu:update",
        "customer:customer:list",
      ],
      availableRoleIds: ["role_admin_1", "role_operator_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createMenuModule(menuRepository, {
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
      new Request("http://localhost/system/menus", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parentId: "menu_system_root_1",
          type: "menu",
          code: "system-menus",
          name: "Menus",
          path: "/system/menus",
          component: "system/menus/index",
          icon: "menu",
          sort: 13,
          permissionCode: "system:menu:list",
          roleIds: ["role_admin_1"],
        }),
      }),
    )

    expect(createResponse.status).toBe(201)

    const createdMenu = (await createResponse.json()) as {
      id: string
      parentId: string | null
      type: string
      code: string
      name: string
      path: string | null
      component: string | null
      icon: string | null
      sort: number
      isVisible: boolean
      status: string
      permissionCode: string | null
      roleIds: string[]
      createdAt: string
      updatedAt: string
    }

    expect(createdMenu).toEqual({
      id: expect.any(String),
      parentId: "menu_system_root_1",
      type: "menu",
      code: "system-menus",
      name: "Menus",
      path: "/system/menus",
      component: "system/menus/index",
      icon: "menu",
      sort: 13,
      isVisible: true,
      status: "active",
      permissionCode: "system:menu:list",
      roleIds: ["role_admin_1"],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateResponse = await app.handle(
      new Request(`http://localhost/system/menus/${createdMenu.id}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Menu Registry",
          isVisible: false,
          roleIds: ["role_admin_1", "role_operator_1"],
        }),
      }),
    )

    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toEqual({
      ...createdMenu,
      name: "Menu Registry",
      isVisible: false,
      roleIds: ["role_admin_1", "role_operator_1"],
      updatedAt: expect.any(String),
    })
  })

  it("rejects invalid menu relations", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:menu:update"],
      isSuperAdmin: false,
    })
    const menuRepository = createInMemoryMenuRepository({
      menus: createMenuSeedRecords(),
      availablePermissionCodes: ["system:menu:list"],
      availableRoleIds: ["role_admin_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createMenuModule(menuRepository, {
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
      new Request("http://localhost/system/menus", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parentId: "missing-parent",
          type: "menu",
          code: "bad-menu",
          name: "Bad Menu",
          permissionCode: "system:menu:update",
          roleIds: ["role_unknown_1"],
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: {
        code: "MENU_PARENT_INVALID",
        message: "Menu parent does not exist",
        status: 400,
        details: {
          parentId: "missing-parent",
        },
      },
    })
  })

  it("rejects menu parent cycles", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:menu:update"],
      isSuperAdmin: false,
    })
    const menuRepository = createInMemoryMenuRepository({
      menus: createMenuSeedRecords(),
      availablePermissionCodes: ["system:menu:update"],
      availableRoleIds: ["role_admin_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createMenuModule(menuRepository, {
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
      new Request("http://localhost/system/menus/menu_system_root_1", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parentId: "menu_system_users_1",
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: {
        code: "MENU_PARENT_INVALID",
        message: "Menu parent would create a cycle",
        status: 400,
        details: {
          id: "menu_system_root_1",
          parentId: "menu_system_users_1",
        },
      },
    })
  })
})
