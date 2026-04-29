import { DEFAULT_TENANT_ID, type DatabaseClient } from "@elysian/persistence"

import { createServerApp } from "../../app"
import { createServerConfig } from "../../config"
import type { ServerLogger } from "../../logging"
import {
  type ServerModule,
  createAuthGuard,
  createAuthModule,
  createInMemoryAuthRepository,
  createPasswordHash,
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
    userRoles: [{ userId, roleId: adminRoleId }],
    rolePermissions,
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
    roleMenus: userMenuPermission
      ? [
          {
            roleId: adminRoleId,
            menuId: userMenuId,
          },
        ]
      : [],
    roleDepts: (options.roleDepartmentIds ?? []).map((departmentId) => ({
      roleId: adminRoleId,
      deptId: departmentId,
    })),
    userDepartments: (options.userDepartmentIds ?? []).map((departmentId) => ({
      userId,
      departmentId,
    })),
    departments: options.departments,
  })
  const authModule = createAuthModule(repository, {
    accessTokenSecret: testAccessTokenSecret,
    secureCookies: options.secureCookies,
    tenantContextDb: options.tenantContextDb,
    resolveTenantIdByCode: options.resolveTenantIdByCode,
  })
  const authGuard = createAuthGuard(repository, {
    accessTokenSecret: testAccessTokenSecret,
  })

  return {
    repository,
    authModule,
    authGuard,
    userId,
  }
}
