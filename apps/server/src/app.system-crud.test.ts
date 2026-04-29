import { describe, expect, it } from "bun:test"
import { DEFAULT_TENANT_ID, type DatabaseClient } from "@elysian/persistence"
import { createServerApp } from "./app"
import { createServerConfig } from "./config"
import type { ServerLogger } from "./logging"
import {
  type ServerModule,
  createAuthGuard,
  createAuthModule,
  createDepartmentModule,
  createDictionaryModule,
  createInMemoryAuthRepository,
  createInMemoryDepartmentRepository,
  createInMemoryDictionaryRepository,
  createInMemoryMenuRepository,
  createInMemoryPostRepository,
  createInMemoryRoleRepository,
  createInMemorySettingRepository,
  createInMemoryTenantRepository,
  createInMemoryUserRepository,
  createMenuModule,
  createPasswordHash,
  createPostModule,
  createRoleModule,
  createSettingModule,
  createTenantModule,
  createUserModule,
} from "./modules"

const testAccessTokenSecret = ["test", "access", "secret"].join("-")
const testAdminPassword = ["admin", "123"].join("")

const silentLogger: ServerLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const createTestApp = (
  options: {
    modules?: ServerModule[]
    config?: Parameters<typeof createServerConfig>[0]
  } = {},
) =>
  createServerApp({
    config: createServerConfig({
      env: "test",
      ...options.config,
    }),
    logger: silentLogger,
    modules: options.modules,
  })

const loginAsAdmin = async (app: ReturnType<typeof createTestApp>) => {
  const response = await app.handle(
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
  const body = (await response.json()) as {
    accessToken: string
  }

  return body.accessToken
}

const createAuthorizedHeaders = (
  accessToken: string,
  extraHeaders: Record<string, string> = {},
) => ({
  authorization: `Bearer ${accessToken}`,
  ...extraHeaders,
})

const createAuthTestFixture = async (
  options: {
    permissions?: string[]
    isSuperAdmin?: boolean
    secureCookies?: boolean
    tenantId?: string
    dataScope?: 1 | 2 | 3 | 4 | 5
    userDepartmentIds?: string[]
    roleDepartmentIds?: string[]
    departments?: Array<{ id: string; parentId: string | null }>
    tenantContextDb?: DatabaseClient
    resolveTenantIdByCode?: (tenantCode: string) => Promise<string | null>
  } = {},
) => {
  const adminRoleId = crypto.randomUUID()
  const userId = crypto.randomUUID()
  const userMenuId = crypto.randomUUID()
  const passwordHash = await createPasswordHash(testAdminPassword)
  const permissionCodes = options.permissions ?? ["system:user:list"]
  const permissions = permissionCodes.map((code) => {
    const [module, resource, action] = code.split(":")

    return {
      id: crypto.randomUUID(),
      code,
      module: module ?? "system",
      resource: resource ?? "resource",
      action: action ?? "list",
      name: code,
    }
  })
  const rolePermissions = permissions.map((permission) => ({
    roleId: adminRoleId,
    permissionId: permission.id,
  }))
  const userMenuPermission = permissions.find(
    (permission) => permission.code === "system:user:list",
  )
  const repository = createInMemoryAuthRepository({
    users: [
      {
        id: userId,
        username: "admin",
        displayName: "Administrator",
        passwordHash,
        status: "active",
        isSuperAdmin: options.isSuperAdmin ?? true,
        tenantId: options.tenantId ?? DEFAULT_TENANT_ID,
        lastLoginAt: null,
        createdAt: "2026-04-21T00:00:00.000Z",
        updatedAt: "2026-04-21T00:00:00.000Z",
      },
    ],
    roles: [
      {
        id: adminRoleId,
        code: "admin",
        name: "Admin",
        status: "active",
        dataScope: options.dataScope ?? 1,
      },
    ],
    permissions,
    menus: userMenuPermission
      ? [
          {
            id: userMenuId,
            parentId: null,
            type: "menu",
            code: "system-user",
            name: "User Management",
            path: "/system/users",
            component: "system/users/index",
            icon: "users",
            sort: 10,
            isVisible: true,
            status: "active",
            permissionCode: "system:user:list",
          },
        ]
      : [],
    userRoles: [{ userId, roleId: adminRoleId }],
    rolePermissions,
    roleDepts: (options.roleDepartmentIds ?? []).map((deptId) => ({
      roleId: adminRoleId,
      deptId,
    })),
    roleMenus: userMenuPermission
      ? [{ roleId: adminRoleId, menuId: userMenuId }]
      : [],
    userDepartments: (options.userDepartmentIds ?? []).map((departmentId) => ({
      userId,
      departmentId,
    })),
    departments: options.departments,
  })

  return {
    userId,
    repository,
    authModule: createAuthModule(repository, {
      accessTokenSecret: testAccessTokenSecret,
      refreshCookieName: "elysian_refresh_token",
      secureCookies: options.secureCookies,
      tenantContextDb: options.tenantContextDb,
      resolveTenantIdByCode: options.resolveTenantIdByCode,
    }),
    authGuard: createAuthGuard(repository, {
      accessTokenSecret: testAccessTokenSecret,
    }),
  }
}

const createUserSeedRecords = async () => {
  const adminPasswordHash = await createPasswordHash(testAdminPassword)
  const operatorPasswordHash = await createPasswordHash("operator-123")

  return [
    {
      id: "user_admin_1",
      username: "admin",
      displayName: "Administrator",
      email: "admin@example.com",
      phone: "13800000000",
      passwordHash: adminPasswordHash,
      status: "active" as const,
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
      passwordHash: operatorPasswordHash,
      status: "active" as const,
      isSuperAdmin: false,
      lastLoginAt: null,
      createdAt: "2026-04-20T00:00:00.000Z",
      updatedAt: "2026-04-20T00:00:00.000Z",
    },
  ]
}

const createRoleSeedRecords = () => [
  {
    id: "role_admin_1",
    code: "admin",
    name: "Admin",
    description: "System administrator",
    status: "active" as const,
    isSystem: true,
    dataScope: 1 as const,
    permissionCodes: [
      "system:user:list",
      "system:role:list",
      "system:role:update",
    ],
    userIds: ["user_admin_1"],
    deptIds: [],
    createdAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: "role_operator_1",
    code: "operator",
    name: "Operator",
    description: "Operator role",
    status: "active" as const,
    isSystem: false,
    dataScope: 1 as const,
    permissionCodes: ["customer:customer:list"],
    userIds: ["user_ops_1"],
    deptIds: [],
    createdAt: "2026-04-20T00:00:00.000Z",
    updatedAt: "2026-04-20T00:00:00.000Z",
  },
]

const createMenuSeedRecords = () => [
  {
    id: "menu_system_root_1",
    parentId: null,
    type: "directory" as const,
    code: "system-root",
    name: "System",
    path: "/system",
    component: null,
    icon: "settings",
    sort: 10,
    isVisible: true,
    status: "active" as const,
    permissionCode: null,
    roleIds: ["role_admin_1"],
    createdAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: "menu_system_users_1",
    parentId: "menu_system_root_1",
    type: "menu" as const,
    code: "system-users",
    name: "Users",
    path: "/system/users",
    component: "system/users/index",
    icon: "users",
    sort: 11,
    isVisible: true,
    status: "active" as const,
    permissionCode: "system:user:list",
    roleIds: ["role_admin_1"],
    createdAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: "menu_system_roles_1",
    parentId: "menu_system_root_1",
    type: "menu" as const,
    code: "system-roles",
    name: "Roles",
    path: "/system/roles",
    component: "system/roles/index",
    icon: "shield",
    sort: 12,
    isVisible: true,
    status: "active" as const,
    permissionCode: "system:role:list",
    roleIds: ["role_admin_1"],
    createdAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
  },
]

const createDepartmentSeedRecords = () => [
  {
    id: "department_root_1",
    parentId: null,
    code: "hq",
    name: "Headquarters",
    sort: 10,
    status: "active" as const,
    userIds: ["user_admin_1"],
    createdAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: "department_ops_1",
    parentId: "department_root_1",
    code: "ops",
    name: "Operations",
    sort: 20,
    status: "active" as const,
    userIds: ["user_ops_1"],
    createdAt: "2026-04-21T01:00:00.000Z",
    updatedAt: "2026-04-21T01:00:00.000Z",
  },
]

const createPostSeedRecords = () => [
  {
    id: "post_ceo_1",
    code: "ceo",
    name: "Chief Executive Officer",
    sort: 10,
    status: "active" as const,
    remark: "Top management role",
    createdAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: "post_ops_1",
    code: "ops-lead",
    name: "Operations Lead",
    sort: 20,
    status: "disabled" as const,
    remark: "",
    createdAt: "2026-04-21T01:00:00.000Z",
    updatedAt: "2026-04-21T01:00:00.000Z",
  },
]

const createDictionaryTypeSeedRecords = () => [
  {
    id: "dictionary_type_status_1",
    code: "customer_status",
    name: "Customer Status",
    description: "Customer lifecycle status",
    status: "active" as const,
    items: [
      {
        id: "dictionary_item_status_active_1",
        typeId: "dictionary_type_status_1",
        value: "active",
        label: "Active",
        sort: 10,
        isDefault: true,
        status: "active" as const,
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
        status: "active" as const,
        createdAt: "2026-04-21T01:00:00.000Z",
        updatedAt: "2026-04-21T01:00:00.000Z",
      },
    ],
    createdAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: "dictionary_type_priority_1",
    code: "priority_level",
    name: "Priority Level",
    description: "Priority level options",
    status: "active" as const,
    items: [],
    createdAt: "2026-04-20T00:00:00.000Z",
    updatedAt: "2026-04-20T00:00:00.000Z",
  },
]

const createSettingSeedRecords = () => [
  {
    id: "setting_brand_name_1",
    key: "platform.brand_name",
    value: "Elysian",
    description: "Display brand name",
    status: "active" as const,
    createdAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: "setting_support_email_1",
    key: "platform.support_email",
    value: "support@example.com",
    description: "Support contact email",
    status: "active" as const,
    createdAt: "2026-04-20T00:00:00.000Z",
    updatedAt: "2026-04-20T00:00:00.000Z",
  },
]

const createTenantSeedRecords = () => [
  {
    id: DEFAULT_TENANT_ID,
    code: "default",
    name: "Default Tenant",
    status: "active" as const,
    createdAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111111",
    code: "tenant-alpha",
    name: "Tenant Alpha",
    status: "active" as const,
    createdAt: "2026-04-21T01:00:00.000Z",
    updatedAt: "2026-04-21T01:00:00.000Z",
  },
]

describe("createServerApp", () => {
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const listResponse = await app.handle(
      new Request("http://localhost/system/departments", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
          authorization: `Bearer ${loginBody.accessToken}`,
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const createResponse = await app.handle(
      new Request("http://localhost/system/departments", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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

    const createdDepartment = (await createResponse.json()) as {
      id: string
      parentId: string | null
      code: string
      name: string
      sort: number
      status: string
      userIds: string[]
      createdAt: string
      updatedAt: string
    }

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
        `http://localhost/system/departments/${createdDepartment.id}`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const response = await app.handle(
      new Request("http://localhost/system/departments", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
      error: {
        code: "DEPARTMENT_PARENT_INVALID",
        message: "Department parent does not exist",
        status: 400,
        details: {
          parentId: "missing-parent",
        },
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }
    const response = await app.handle(
      new Request("http://localhost/system/departments/department_root_1", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parentId: "department_ops_1",
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: {
        code: "DEPARTMENT_PARENT_INVALID",
        message: "Department parent would create a cycle",
        status: 400,
        details: {
          id: "department_root_1",
          parentId: "department_ops_1",
        },
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

    const createdPost = (await createResponse.json()) as {
      id: string
      code: string
      name: string
      sort: number
      status: string
      remark: string
      createdAt: string
      updatedAt: string
    }

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
      new Request(`http://localhost/system/posts/${createdPost.id}`, {
        method: "PUT",
        headers: createAuthorizedHeaders(accessToken, {
          "content-type": "application/json",
        }),
        body: JSON.stringify({
          name: "Support Lead",
          status: "disabled",
          remark: "Escalation owner",
        }),
      }),
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
      error: {
        code: "POST_CODE_CONFLICT",
        message: "Post code already exists",
        status: 409,
        details: {
          code: "ops-lead",
        },
      },
    })
  })

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
