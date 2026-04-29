import { describe, expect, it } from "bun:test"
import { DEFAULT_TENANT_ID, type DatabaseClient } from "@elysian/persistence"

import { createServerApp } from "../../app"
import { createServerConfig } from "../../config"
import type { ServerLogger } from "../../logging"
import {
  type ServerModule,
  createAuthGuard,
  createAuthModule,
  createCustomerModule,
  createDepartmentModule,
  createDictionaryModule,
  createFileModule,
  createInMemoryAuthRepository,
  createInMemoryCustomerRepository,
  createInMemoryDepartmentRepository,
  createInMemoryDictionaryRepository,
  createInMemoryFileRepository,
  createInMemoryFileStorage,
  createInMemoryMenuRepository,
  createInMemoryPostRepository,
  createInMemoryRoleRepository,
  createInMemorySettingRepository,
  createInMemoryTenantRepository,
  createInMemoryUserRepository,
  createInMemoryWorkflowDefinitionRepository,
  createMenuModule,
  createPasswordHash,
  createPostModule,
  createRoleModule,
  createSettingModule,
  createTenantContextModule,
  createTenantModule,
  createUserModule,
  createWorkflowModule,
  verifyAccessToken,
} from "../../modules"
import {
  createWorkflowDefinitionSeedRecords,
  workflowDefinitionPermissionCodes,
} from "../workflow/test-support"

const testAccessTokenSecret = ["test", "access", "secret"].join("-")
const testAdminPassword = ["admin", "123"].join("")
const testInvalidPassword = ["wrong", "password"].join("-")

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

const createTenantContextRecorder = () => {
  const statements: string[] = []
  const db = {
    execute: async (statement: string) => {
      statements.push(statement)
      return []
    },
  } as unknown as DatabaseClient

  return { db, statements }
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

const refreshCookiePrefix = `${["elysian", "refresh", "token"].join("_")}=`
const tenantAdminPassword = ["tenant", "admin", "123"].join("-")

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

const toCookieHeader = (setCookie: string | null) => {
  if (!setCookie) {
    throw new Error("Missing set-cookie header")
  }

  return setCookie.split(";")[0] ?? setCookie
}

describe("createServerApp", () => {
  it("logs in and returns the current auth context", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
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

    expect(loginResponse.status).toBe(200)

    const loginBody = (await loginResponse.json()) as {
      accessToken: string
      user: {
        username: string
        tenantId: string
      }
      roles: string[]
      permissionCodes: string[]
      menus: Array<{ code: string }>
    }
    const setCookie = loginResponse.headers.get("set-cookie")

    expect(loginBody.user.username).toBe("admin")
    expect(loginBody.user.tenantId).toBe(DEFAULT_TENANT_ID)
    expect(loginBody.roles).toEqual(["admin"])
    expect(loginBody.permissionCodes).toEqual(["system:user:list"])
    expect(loginBody.menus.map((menu) => menu.code)).toEqual(["system-user"])
    expect(typeof loginBody.accessToken).toBe("string")
    expect(setCookie).toContain(refreshCookiePrefix)

    const meResponse = await app.handle(
      new Request("http://localhost/auth/me", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(meResponse.status).toBe(200)
    expect(await meResponse.json()).toEqual({
      user: {
        id: expect.any(String),
        username: "admin",
        displayName: "Administrator",
        isSuperAdmin: true,
        tenantId: DEFAULT_TENANT_ID,
      },
      deptIds: [],
      dataScopes: [
        {
          scope: 1,
        },
      ],
      dataAccess: {
        userId: expect.any(String),
        hasAllAccess: true,
        accessibleDeptIds: [],
        allowSelf: false,
      },
      roles: ["admin"],
      permissionCodes: ["system:user:list"],
      menus: [
        {
          id: expect.any(String),
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
      ],
    })
  })

  it("includes tid in the JWT access token after login", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )

    const loginBody = (await loginResponse.json()) as { accessToken: string }
    const payload = await verifyAccessToken(
      loginBody.accessToken,
      testAccessTokenSecret,
    )
    expect(payload.tid).toBe(DEFAULT_TENANT_ID)
  })

  it("includes tid in the JWT access token after refresh", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const refreshResponse = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: {
          cookie: toCookieHeader(loginResponse.headers.get("set-cookie")),
        },
      }),
    )

    expect(refreshResponse.status).toBe(200)
    const refreshBody = (await refreshResponse.json()) as {
      accessToken: string
    }
    const payload = await verifyAccessToken(
      refreshBody.accessToken,
      testAccessTokenSecret,
    )
    expect(payload.tid).toBe(DEFAULT_TENANT_ID)
  })

  it("supports non-default tenant login and refresh with tenant-scoped context", async () => {
    const tenantId = "11111111-1111-4111-8111-111111111111"
    const tenantCode = "tenant-alpha"
    const tenantContext = createTenantContextRecorder()
    const fixture = await createAuthTestFixture({
      tenantId,
      isSuperAdmin: false,
      tenantContextDb: tenantContext.db,
      resolveTenantIdByCode: async (code) =>
        code === tenantCode ? tenantId : null,
    })
    const app = createTestApp({
      modules: [
        createTenantContextModule(tenantContext.db, {
          accessTokenSecret: testAccessTokenSecret,
        }),
        fixture.authModule,
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
          tenantCode,
        }),
      }),
    )

    expect(loginResponse.status).toBe(200)
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
      user: {
        tenantId: string
      }
    }
    expect(loginBody.user.tenantId).toBe(tenantId)
    const loginPayload = await verifyAccessToken(
      loginBody.accessToken,
      testAccessTokenSecret,
    )
    expect(loginPayload.tid).toBe(tenantId)

    const setCookie = loginResponse.headers.get("set-cookie")
    expect(setCookie).not.toBeNull()
    expect(setCookie).toContain(`${refreshCookiePrefix}${tenantId}.`)

    const refreshResponse = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: {
          cookie: toCookieHeader(setCookie),
        },
      }),
    )

    expect(refreshResponse.status).toBe(200)
    const refreshBody = (await refreshResponse.json()) as {
      accessToken: string
      user: {
        tenantId: string
      }
    }
    expect(refreshBody.user.tenantId).toBe(tenantId)
    const refreshPayload = await verifyAccessToken(
      refreshBody.accessToken,
      testAccessTokenSecret,
    )
    expect(refreshPayload.tid).toBe(tenantId)
    expect(tenantContext.statements).toContain(
      `SET app.current_tenant = '${tenantId}'`,
    )
  })

  it("uses default tenant context for login when tenant context db is enabled", async () => {
    const tenantContext = createTenantContextRecorder()
    const fixture = await createAuthTestFixture({
      tenantContextDb: tenantContext.db,
    })
    const app = createTestApp({
      modules: [
        createTenantContextModule(tenantContext.db, {
          accessTokenSecret: testAccessTokenSecret,
        }),
        fixture.authModule,
      ],
    })

    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )

    expect(loginResponse.status).toBe(200)
    expect(tenantContext.statements).toContain(
      `SET app.current_tenant = '${DEFAULT_TENANT_ID}'`,
    )
  })

  it("keeps login scoped to the requested tenant when duplicate usernames exist across tenants", async () => {
    const tenantAlphaId = "11111111-1111-4111-8111-111111111111"
    const tenantAlphaCode = "tenant-alpha"
    const tenantContext = createTenantContextRecorder()
    const defaultPasswordHash = await createPasswordHash(testAdminPassword)
    const tenantPasswordHash = await createPasswordHash(tenantAdminPassword)
    const repository = createInMemoryAuthRepository({
      users: [
        {
          id: "user_default_admin",
          username: "admin",
          displayName: "Default Administrator",
          passwordHash: defaultPasswordHash,
          status: "active",
          isSuperAdmin: true,
          tenantId: DEFAULT_TENANT_ID,
          lastLoginAt: null,
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "user_tenant_admin",
          username: "admin",
          displayName: "Tenant Administrator",
          passwordHash: tenantPasswordHash,
          status: "active",
          isSuperAdmin: false,
          tenantId: tenantAlphaId,
          lastLoginAt: null,
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      ],
      roles: [
        {
          id: "role_default_admin",
          code: "admin",
          name: "Admin",
          status: "active",
          dataScope: 1,
        },
      ],
      userRoles: [
        {
          userId: "user_default_admin",
          roleId: "role_default_admin",
        },
        {
          userId: "user_tenant_admin",
          roleId: "role_default_admin",
        },
      ],
    })
    const app = createTestApp({
      modules: [
        createTenantContextModule(tenantContext.db, {
          accessTokenSecret: testAccessTokenSecret,
        }),
        createAuthModule(repository, {
          accessTokenSecret: testAccessTokenSecret,
          refreshCookieName: "elysian_refresh_token",
          tenantContextDb: tenantContext.db,
          resolveTenantIdByCode: async (code) =>
            code === tenantAlphaCode ? tenantAlphaId : null,
        }),
      ],
    })

    const defaultLoginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    expect(defaultLoginResponse.status).toBe(200)
    const defaultLoginBody = (await defaultLoginResponse.json()) as {
      user: {
        id: string
        tenantId: string
      }
    }
    expect(defaultLoginBody.user).toMatchObject({
      id: "user_default_admin",
      tenantId: DEFAULT_TENANT_ID,
    })

    const tenantLoginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: tenantAdminPassword,
          tenantCode: tenantAlphaCode,
        }),
      }),
    )
    expect(tenantLoginResponse.status).toBe(200)
    const tenantLoginBody = (await tenantLoginResponse.json()) as {
      user: {
        id: string
        tenantId: string
      }
    }
    expect(tenantLoginBody.user).toMatchObject({
      id: "user_tenant_admin",
      tenantId: tenantAlphaId,
    })
  })

  it("refreshes tokens and rotates the refresh session", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
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
    const refreshResponse = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: {
          cookie: toCookieHeader(loginResponse.headers.get("set-cookie")),
        },
      }),
    )

    expect(refreshResponse.status).toBe(200)

    const refreshBody = (await refreshResponse.json()) as {
      accessToken: string
      roles: string[]
    }

    expect(refreshBody.accessToken).not.toBe(loginBody.accessToken)
    expect(refreshBody.roles).toEqual(["admin"])
    expect(refreshResponse.headers.get("set-cookie")).toContain(
      refreshCookiePrefix,
    )
  })

  it("lists current user refresh sessions with rotation state", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "session-list-agent",
          "x-forwarded-for": "127.0.0.21",
        },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
        }),
      }),
    )
    const refreshResponse = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: {
          cookie: toCookieHeader(loginResponse.headers.get("set-cookie")),
          "user-agent": "session-list-agent",
          "x-forwarded-for": "127.0.0.22",
        },
      }),
    )
    const refreshBody = (await refreshResponse.json()) as {
      accessToken: string
    }

    const sessionsResponse = await app.handle(
      new Request("http://localhost/auth/sessions", {
        headers: {
          authorization: `Bearer ${refreshBody.accessToken}`,
        },
      }),
    )

    expect(sessionsResponse.status).toBe(200)

    const sessionsBody = (await sessionsResponse.json()) as {
      items: Array<{
        id: string
        isCurrent: boolean
        lastUsedAt: string | null
        revokedAt: string | null
        replacedBySessionId: string | null
        userAgent: string | null
        ip: string | null
      }>
    }
    const currentSession = sessionsBody.items.find((item) => item.isCurrent)
    const rotatedSession = sessionsBody.items.find((item) => !item.isCurrent)

    expect(sessionsBody.items).toHaveLength(2)
    expect(currentSession).toMatchObject({
      revokedAt: null,
      userAgent: "session-list-agent",
      ip: "127.0.0.22",
    })
    expect(rotatedSession).toMatchObject({
      userAgent: "session-list-agent",
      ip: "127.0.0.21",
      lastUsedAt: expect.any(String),
      revokedAt: expect.any(String),
      replacedBySessionId: currentSession?.id,
    })
  })

  it("revokes the selected refresh session for the current user", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "session-revoke-agent",
          "x-forwarded-for": "127.0.0.31",
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
    const cookieHeader = toCookieHeader(loginResponse.headers.get("set-cookie"))

    const sessionsResponse = await app.handle(
      new Request("http://localhost/auth/sessions", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )
    const sessionsBody = (await sessionsResponse.json()) as {
      items: Array<{
        id: string
        isCurrent: boolean
      }>
    }
    const currentSession = sessionsBody.items.find((item) => item.isCurrent)
    expect(currentSession).toBeDefined()

    const revokeResponse = await app.handle(
      new Request(`http://localhost/auth/sessions/${currentSession?.id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "user-agent": "session-revoke-agent",
          "x-forwarded-for": "127.0.0.32",
          "x-request-id": "req-session-revoke-1",
        },
      }),
    )

    expect(revokeResponse.status).toBe(204)
    expect(revokeResponse.headers.get("set-cookie")).toContain("Max-Age=0")

    const refreshResponse = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: {
          cookie: cookieHeader,
        },
      }),
    )

    expect(refreshResponse.status).toBe(401)
    expect(await refreshResponse.json()).toEqual({
      error: {
        code: "AUTH_REFRESH_TOKEN_EXPIRED",
        message: "Refresh token is expired or revoked",
        status: 401,
        details: {
          sessionId: currentSession?.id,
        },
      },
    })

    const auditLogs = await fixture.repository.listAuditLogs()
    const auditLog = auditLogs.find((log) => log.action === "session_revoke")

    expect(auditLog).toMatchObject({
      category: "auth",
      action: "session_revoke",
      actorUserId: fixture.userId,
      targetType: "session",
      targetId: currentSession?.id,
      result: "success",
      requestId: "req-session-revoke-1",
      ip: "127.0.0.32",
      userAgent: "session-revoke-agent",
      details: {
        currentSessionRevoked: true,
        alreadyRevoked: false,
      },
    })
  })

  it("returns 404 when revoking an unknown refresh session", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
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
    const unknownSessionId = crypto.randomUUID()

    const revokeResponse = await app.handle(
      new Request(`http://localhost/auth/sessions/${unknownSessionId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "user-agent": "session-revoke-missing-agent",
          "x-forwarded-for": "127.0.0.33",
          "x-request-id": "req-session-revoke-missing-1",
        },
      }),
    )

    expect(revokeResponse.status).toBe(404)
    expect(await revokeResponse.json()).toEqual({
      error: {
        code: "AUTH_SESSION_NOT_FOUND",
        message: "Session not found",
        status: 404,
        details: {
          sessionId: unknownSessionId,
        },
      },
    })

    const [auditLog] = await fixture.repository.listAuditLogs()

    expect(auditLog).toMatchObject({
      category: "auth",
      action: "session_revoke",
      actorUserId: fixture.userId,
      targetType: "session",
      targetId: unknownSessionId,
      result: "failure",
      requestId: "req-session-revoke-missing-1",
      ip: "127.0.0.33",
      userAgent: "session-revoke-missing-agent",
      details: {
        reason: "session_not_found",
      },
    })
  })

  it("writes audit logs for login, refresh, logout, and permission denial", async () => {
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
          "user-agent": "audit-test-agent",
          "x-forwarded-for": "127.0.0.9",
          "x-request-id": "req-login-1",
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
    const loginCookie = toCookieHeader(loginResponse.headers.get("set-cookie"))

    const refreshResponse = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: {
          cookie: loginCookie,
          "user-agent": "audit-test-agent",
          "x-forwarded-for": "127.0.0.10",
          "x-request-id": "req-refresh-1",
        },
      }),
    )

    expect(refreshResponse.status).toBe(200)

    const deniedResponse = await app.handle(
      new Request("http://localhost/customers", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "user-agent": "audit-test-agent",
          "x-forwarded-for": "127.0.0.11",
          "x-request-id": "req-authorize-1",
        },
      }),
    )

    expect(deniedResponse.status).toBe(403)

    const logoutResponse = await app.handle(
      new Request("http://localhost/auth/logout", {
        method: "POST",
        headers: {
          cookie: toCookieHeader(refreshResponse.headers.get("set-cookie")),
          "user-agent": "audit-test-agent",
          "x-forwarded-for": "127.0.0.12",
          "x-request-id": "req-logout-1",
        },
      }),
    )

    expect(logoutResponse.status).toBe(204)

    const auditLogs = await fixture.repository.listAuditLogs()

    expect(auditLogs.map((log) => [log.action, log.result])).toEqual([
      ["logout", "success"],
      ["authorize", "failure"],
      ["refresh", "success"],
      ["login", "success"],
    ])
    expect(auditLogs[0]).toMatchObject({
      category: "auth",
      targetType: "session",
      requestId: "req-logout-1",
      ip: "127.0.0.12",
      userAgent: "audit-test-agent",
    })
    expect(auditLogs[1]).toMatchObject({
      category: "auth",
      targetType: "permission",
      targetId: "customer:customer:list",
      requestId: "req-authorize-1",
      ip: "127.0.0.11",
      userAgent: "audit-test-agent",
      details: {
        reason: "permission_denied",
      },
    })
    expect(auditLogs[2]).toMatchObject({
      category: "auth",
      targetType: "session",
      requestId: "req-refresh-1",
      ip: "127.0.0.10",
      userAgent: "audit-test-agent",
      details: {
        previousSessionId: expect.any(String),
      },
    })
    expect(auditLogs[3]).toMatchObject({
      category: "auth",
      targetType: "session",
      requestId: "req-login-1",
      ip: "127.0.0.9",
      userAgent: "audit-test-agent",
    })
    expect(
      auditLogs.every(
        (log) =>
          typeof log.id === "string" &&
          typeof log.createdAt === "string" &&
          typeof log.actorUserId === "string",
      ),
    ).toBe(true)
  })

  it("writes audit logs for failed login attempts", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const response = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-request-id": "req-login-failure-1",
        },
        body: JSON.stringify({
          username: "admin",
          password: testInvalidPassword,
        }),
      }),
    )

    expect(response.status).toBe(401)

    const [auditLog] = await fixture.repository.listAuditLogs()

    expect(auditLog).toMatchObject({
      category: "auth",
      action: "login",
      result: "failure",
      requestId: "req-login-failure-1",
      details: {
        username: "admin",
        reason: "invalid_password",
      },
    })
  })

  it("writes audit logs for workflow permission denial", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        ...workflowDefinitionPermissionCodes,
        "workflow:instance:list",
        "workflow:instance:start",
      ],
      isSuperAdmin: false,
    })
    const workflowRepository = createInMemoryWorkflowDefinitionRepository({
      definitions: createWorkflowDefinitionSeedRecords(),
      instances: [
        {
          tenantId: DEFAULT_TENANT_ID,
          id: "workflow_instance_audit_1",
          definitionId: "workflow_definition_expense_v1",
          definitionKey: "expense-approval",
          definitionName: "Expense Approval",
          definitionVersion: 1,
          status: "running",
          currentNodeId: "manager-review",
          variables: {},
          startedByUserId: fixture.userId,
          startedAt: "2026-04-21T02:10:00.000Z",
          completedAt: null,
          terminatedAt: null,
          createdAt: "2026-04-21T02:10:00.000Z",
          updatedAt: "2026-04-21T02:10:00.000Z",
        },
      ],
      tasks: [
        {
          tenantId: DEFAULT_TENANT_ID,
          id: "workflow_task_audit_1",
          instanceId: "workflow_instance_audit_1",
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {},
          createdAt: "2026-04-21T02:10:00.000Z",
          updatedAt: "2026-04-21T02:10:00.000Z",
          completedAt: null,
        },
      ],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "workflow-audit-agent",
          "x-forwarded-for": "127.0.1.1",
          "x-request-id": "req-workflow-login-1",
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

    const deniedTaskListResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "user-agent": "workflow-audit-agent",
          "x-forwarded-for": "127.0.1.2",
          "x-request-id": "req-workflow-task-list-denied",
        },
      }),
    )
    expect(deniedTaskListResponse.status).toBe(403)

    const deniedTaskCompleteResponse = await app.handle(
      new Request(
        "http://localhost/workflow/tasks/workflow_task_audit_1/complete",
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
            "content-type": "application/json",
            "user-agent": "workflow-audit-agent",
            "x-forwarded-for": "127.0.1.3",
            "x-request-id": "req-workflow-task-complete-denied",
          },
          body: JSON.stringify({
            result: "approved",
          }),
        },
      ),
    )
    expect(deniedTaskCompleteResponse.status).toBe(403)

    const deniedInstanceCancelResponse = await app.handle(
      new Request(
        "http://localhost/workflow/instances/workflow_instance_audit_1/cancel",
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
            "user-agent": "workflow-audit-agent",
            "x-forwarded-for": "127.0.1.4",
            "x-request-id": "req-workflow-instance-cancel-denied",
          },
        },
      ),
    )
    expect(deniedInstanceCancelResponse.status).toBe(403)

    const auditLogs = await fixture.repository.listAuditLogs()
    const authorizeFailures = auditLogs.filter(
      (log) => log.action === "authorize" && log.result === "failure",
    )

    expect(authorizeFailures).toHaveLength(3)
    expect(authorizeFailures[0]).toMatchObject({
      category: "auth",
      targetType: "permission",
      targetId: "workflow:instance:cancel",
      requestId: "req-workflow-instance-cancel-denied",
      ip: "127.0.1.4",
      userAgent: "workflow-audit-agent",
      details: {
        reason: "permission_denied",
      },
    })
    expect(authorizeFailures[1]).toMatchObject({
      category: "auth",
      targetType: "permission",
      targetId: "workflow:task:complete",
      requestId: "req-workflow-task-complete-denied",
      ip: "127.0.1.3",
      userAgent: "workflow-audit-agent",
      details: {
        reason: "permission_denied",
      },
    })
    expect(authorizeFailures[2]).toMatchObject({
      category: "auth",
      targetType: "permission",
      targetId: "workflow:task:list",
      requestId: "req-workflow-task-list-denied",
      ip: "127.0.1.2",
      userAgent: "workflow-audit-agent",
      details: {
        reason: "permission_denied",
      },
    })
  })

  it("marks refresh cookies as Secure when enabled", async () => {
    const fixture = await createAuthTestFixture({
      secureCookies: true,
    })
    const app = createTestApp({
      modules: [fixture.authModule],
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

    expect(loginResponse.headers.get("set-cookie")).toContain("Secure")
  })

  it("revokes the refresh session on logout", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
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
    const cookieHeader = toCookieHeader(loginResponse.headers.get("set-cookie"))
    const logoutResponse = await app.handle(
      new Request("http://localhost/auth/logout", {
        method: "POST",
        headers: {
          cookie: cookieHeader,
        },
      }),
    )

    expect(logoutResponse.status).toBe(204)
    expect(logoutResponse.headers.get("set-cookie")).toContain("Max-Age=0")

    const refreshResponse = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: {
          cookie: cookieHeader,
        },
      }),
    )

    expect(refreshResponse.status).toBe(401)
    expect(await refreshResponse.json()).toEqual({
      error: {
        code: "AUTH_REFRESH_TOKEN_EXPIRED",
        message: "Refresh token is expired or revoked",
        status: 401,
        details: {
          sessionId: expect.any(String),
        },
      },
    })
  })

  it("rejects invalid credentials during login", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const response = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: testInvalidPassword,
        }),
      }),
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      error: {
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid username or password",
        status: 401,
        details: {
          username: "admin",
        },
      },
    })
  })
})
