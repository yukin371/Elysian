import { DEFAULT_TENANT_ID, type DatabaseClient } from "@elysian/persistence"
import { createServerApp } from "../../app"
import { createServerConfig } from "../../config"
import type { ServerLogger } from "../../logging"
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
} from "../../modules"

export const testAccessTokenSecret = ["test", "access", "secret"].join("-")
export const testAdminPassword = ["admin", "123"].join("")

export const silentLogger: ServerLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

export const createTestApp = (
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

export const loginAsAdmin = async (app: ReturnType<typeof createTestApp>) => {
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

export const createAuthorizedHeaders = (
  accessToken: string,
  extraHeaders: Record<string, string> = {},
) => ({
  authorization: `Bearer ${accessToken}`,
  ...extraHeaders,
})

export const createAuthTestFixture = async (
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

export const createUserSeedRecords = async () => {
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

export const createRoleSeedRecords = () => [
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

export const createMenuSeedRecords = () => [
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

export const createDepartmentSeedRecords = () => [
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

export const createPostSeedRecords = () => [
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

export const createDictionaryTypeSeedRecords = () => [
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

export const createSettingSeedRecords = () => [
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

export const createTenantSeedRecords = () => [
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
