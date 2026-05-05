import { DEFAULT_TENANT_ID, type DatabaseClient } from "@elysian/persistence"

import { createServerApp } from "./app"
import { createServerConfig } from "./config"
import type { ServerLogger } from "./logging"
import {
  type ServerModule,
  createAuthGuard,
  createAuthModule,
  createFileModule,
  createInMemoryAuthRepository,
  createInMemoryFileRepository,
  createInMemoryFileStorage,
  createInMemoryNotificationRepository,
  createInMemoryOperationLogRepository,
  createNotificationModule,
  createOperationLogModule,
  createPasswordHash,
} from "./modules"

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
    tenantContextDb?: Pick<DatabaseClient, "execute">
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

export const createOperationLogSeedRecords = () => [
  {
    id: "operation_log_1",
    category: "auth",
    action: "login",
    actorUserId: "user_admin_1",
    targetType: "session",
    targetId: "session_1",
    result: "success" as const,
    requestId: "request_1",
    ip: "127.0.0.1",
    userAgent: "test-agent",
    details: {
      username: "admin",
    },
    createdAt: "2026-04-21T02:00:00.000Z",
  },
  {
    id: "operation_log_2",
    category: "auth",
    action: "permission_denied",
    actorUserId: "user_ops_1",
    targetType: "permission",
    targetId: "customer:customer:update",
    result: "failure" as const,
    requestId: "request_2",
    ip: "127.0.0.2",
    userAgent: "ops-agent,desktop",
    details: {
      permissionCode: "customer:customer:update",
    },
    createdAt: "2026-04-21T01:00:00.000Z",
  },
]

export const withDerivedAuthFields = (
  record: typeof createOperationLogSeedRecords extends () => Array<infer T>
    ? T
    : never,
) => {
  const details = record.details as Record<string, unknown> | undefined

  return {
    ...record,
    authEventType:
      record.category === "auth" &&
      (record.action === "login" ||
        record.action === "logout" ||
        record.action === "refresh" ||
        record.action === "session_revoke")
        ? record.action
        : null,
    authFailureReason:
      typeof details?.reason === "string" ? details.reason : null,
  }
}

export const createFileSeedRecords = () => [
  {
    id: "file_1",
    originalName: "platform-guide.txt",
    storageKey: "file_storage_1",
    mimeType: "text/plain",
    size: 20,
    uploaderUserId: "user_admin_1",
    createdAt: "2026-04-21T03:00:00.000Z",
  },
]

export const createNotificationSeedRecords = () => [
  {
    id: "notification_1",
    recipientUserId: "user_ops_1",
    title: "Platform Maintenance",
    content: "Platform maintenance starts at 22:00.",
    level: "info" as const,
    status: "unread" as const,
    createdByUserId: "user_admin_1",
    createdAt: "2026-04-21T04:00:00.000Z",
  },
  {
    id: "notification_2",
    recipientUserId: "user_admin_1",
    title: "Audit Report Ready",
    content: "The latest audit report is ready.",
    level: "success" as const,
    status: "read" as const,
    createdByUserId: "user_admin_1",
    readAt: "2026-04-21T05:30:00.000Z",
    createdAt: "2026-04-21T05:00:00.000Z",
  },
]
