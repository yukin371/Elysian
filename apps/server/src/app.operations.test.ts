import { describe, expect, it } from "bun:test"
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

const createOperationLogSeedRecords = () => [
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

const createFileSeedRecords = () => [
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

const createNotificationSeedRecords = () => [
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

describe("createServerApp", () => {
  it("lists, filters, and gets operation logs", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:operation-log:list"],
      isSuperAdmin: false,
    })
    const operationLogRepository = createInMemoryOperationLogRepository(
      createOperationLogSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createOperationLogModule(operationLogRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const listResponse = await app.handle(
      new Request("http://localhost/system/operation-logs", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: createOperationLogSeedRecords(),
    })

    const filteredResponse = await app.handle(
      new Request(
        "http://localhost/system/operation-logs?result=failure&action=permission_denied",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(filteredResponse.status).toBe(200)
    expect(await filteredResponse.json()).toEqual({
      items: [createOperationLogSeedRecords()[1]],
    })

    const getResponse = await app.handle(
      new Request("http://localhost/system/operation-logs/operation_log_1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(createOperationLogSeedRecords()[0])
  })

  it("exports operation logs as csv", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:operation-log:export"],
      isSuperAdmin: false,
    })
    const operationLogRepository = createInMemoryOperationLogRepository(
      createOperationLogSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createOperationLogModule(operationLogRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request(
        "http://localhost/system/operation-logs/export?category=auth",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("text/csv")

    const text = await response.text()
    expect(text).toContain(
      "id,category,action,actorUserId,targetType,targetId,result,requestId,ip,userAgent,createdAt",
    )
    expect(text).toContain("operation_log_1,auth,login,user_admin_1")
    expect(text).toContain(
      'operation_log_2,auth,permission_denied,user_ops_1,permission,customer:customer:update,failure,request_2,127.0.0.2,"ops-agent,desktop",2026-04-21T01:00:00.000Z',
    )
  })

  it("returns operation log not found for unknown ids", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:operation-log:list"],
      isSuperAdmin: false,
    })
    const operationLogRepository = createInMemoryOperationLogRepository(
      createOperationLogSeedRecords(),
    )
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createOperationLogModule(operationLogRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/operation-logs/missing_log", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      error: {
        code: "OPERATION_LOG_NOT_FOUND",
        message: "Operation log not found",
        status: 404,
        details: {
          id: "missing_log",
        },
      },
    })
  })

  it("uploads, lists, gets, downloads, and deletes files", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:file:list",
        "system:file:upload",
        "system:file:download",
        "system:file:delete",
      ],
      isSuperAdmin: false,
    })
    const fileRepository = createInMemoryFileRepository(createFileSeedRecords())
    const fileStorage = createInMemoryFileStorage({
      file_storage_1: new TextEncoder().encode("platform guide bytes"),
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createFileModule(fileRepository, fileStorage, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const listResponse = await app.handle(
      new Request("http://localhost/system/files", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [
        {
          id: "file_1",
          originalName: "platform-guide.txt",
          mimeType: "text/plain",
          size: 20,
          uploaderUserId: "user_admin_1",
          createdAt: "2026-04-21T03:00:00.000Z",
        },
      ],
    })

    const uploadBody = new FormData()
    uploadBody.set(
      "file",
      new File(["hello file module"], "hello.txt", {
        type: "text/plain",
      }),
    )
    const uploadResponse = await app.handle(
      new Request("http://localhost/system/files", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: uploadBody,
      }),
    )

    expect(uploadResponse.status).toBe(201)
    const createdFile = (await uploadResponse.json()) as {
      id: string
      originalName: string
      mimeType?: string
      size: number
      uploaderUserId?: string
      createdAt: string
    }
    expect(createdFile.id).toEqual(expect.any(String))
    expect(createdFile.originalName).toBe("hello.txt")
    expect(createdFile.mimeType).toContain("text/plain")
    expect(createdFile.size).toBe(17)
    expect(createdFile.uploaderUserId).toEqual(expect.any(String))
    expect(createdFile.createdAt).toEqual(expect.any(String))

    const getResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFile.id}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(createdFile)

    const downloadResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFile.id}/download`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(downloadResponse.status).toBe(200)
    expect(downloadResponse.headers.get("content-type")).toContain("text/plain")
    expect(downloadResponse.headers.get("content-disposition")).toContain(
      "hello.txt",
    )
    expect(await downloadResponse.text()).toBe("hello file module")

    const deleteResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFile.id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(deleteResponse.status).toBe(204)

    const missingAfterDeleteResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFile.id}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(missingAfterDeleteResponse.status).toBe(404)
  })

  it("rejects file upload requests without a multipart file", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:file:upload"],
      isSuperAdmin: false,
    })
    const fileRepository = createInMemoryFileRepository()
    const fileStorage = createInMemoryFileStorage()
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createFileModule(fileRepository, fileStorage, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const body = new FormData()
    body.set("note", "missing file")
    const response = await app.handle(
      new Request("http://localhost/system/files", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body,
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: {
        code: "FILE_UPLOAD_REQUIRED",
        message: "File upload is required",
        status: 400,
      },
    })
  })

  it("filters files by self-only data access", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:file:list"],
      isSuperAdmin: false,
      dataScope: 5,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createFileModule(
          createInMemoryFileRepository([
            {
              id: "file_visible_self_1",
              originalName: "my-file.txt",
              storageKey: "storage_visible_self_1",
              mimeType: "text/plain",
              size: 12,
              uploaderUserId: fixture.userId,
              createdAt: "2026-04-21T03:00:00.000Z",
            },
            {
              id: "file_hidden_other_1",
              originalName: "other-file.txt",
              storageKey: "storage_hidden_other_1",
              mimeType: "text/plain",
              size: 18,
              uploaderUserId: "user_other_1",
              createdAt: "2026-04-21T04:00:00.000Z",
            },
          ]),
          createInMemoryFileStorage(),
          {
            authGuard: fixture.authGuard,
          },
        ),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/files", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      items: [
        {
          id: "file_visible_self_1",
          originalName: "my-file.txt",
          mimeType: "text/plain",
          size: 12,
          uploaderUserId: fixture.userId,
          createdAt: "2026-04-21T03:00:00.000Z",
        },
      ],
    })
  })

  it("lists, filters, gets, creates, and marks notifications as read", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:notification:list",
        "system:notification:create",
        "system:notification:update",
      ],
      isSuperAdmin: false,
    })
    const notificationRepository = createInMemoryNotificationRepository({
      notifications: createNotificationSeedRecords(),
      availableUserIds: ["user_admin_1", "user_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createNotificationModule(notificationRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const listResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [
        createNotificationSeedRecords()[1],
        createNotificationSeedRecords()[0],
      ],
    })

    const filteredResponse = await app.handle(
      new Request(
        "http://localhost/system/notifications?status=unread&recipientUserId=user_ops_1",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(filteredResponse.status).toBe(200)
    expect(await filteredResponse.json()).toEqual({
      items: [createNotificationSeedRecords()[0]],
    })

    const getResponse = await app.handle(
      new Request("http://localhost/system/notifications/notification_1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(createNotificationSeedRecords()[0])

    const createResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          recipientUserId: "user_ops_1",
          title: "New Approval Pending",
          content: "A new approval request is waiting.",
          level: "warning",
        }),
      }),
    )

    expect(createResponse.status).toBe(201)
    const createdNotification = (await createResponse.json()) as {
      id: string
      recipientUserId: string
      title: string
      content: string
      level: string
      status: string
      createdByUserId?: string
      readAt?: string
      createdAt: string
    }
    expect(createdNotification.id).toEqual(expect.any(String))
    expect(createdNotification.recipientUserId).toBe("user_ops_1")
    expect(createdNotification.title).toBe("New Approval Pending")
    expect(createdNotification.content).toBe(
      "A new approval request is waiting.",
    )
    expect(createdNotification.level).toBe("warning")
    expect(createdNotification.status).toBe("unread")
    expect(createdNotification.createdByUserId).toEqual(expect.any(String))
    expect(createdNotification.readAt).toBeUndefined()
    expect(createdNotification.createdAt).toEqual(expect.any(String))

    const readResponse = await app.handle(
      new Request(
        `http://localhost/system/notifications/${createdNotification.id}/read`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(readResponse.status).toBe(200)
    expect(await readResponse.json()).toEqual({
      ...createdNotification,
      status: "read",
      readAt: expect.any(String),
    })
  })

  it("keeps department-scoped notifications visible after creation", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:notification:list", "system:notification:create"],
      isSuperAdmin: false,
      dataScope: 4,
      userDepartmentIds: ["department_root_1"],
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
    const notificationRepository = createInMemoryNotificationRepository({
      notifications: [
        {
          id: "notification_visible_ops_1",
          recipientUserId: "user_ops_1",
          title: "Ops Notice",
          content: "Visible to root descendants.",
          level: "info",
          status: "unread",
          createdByUserId: "user_other_1",
          deptId: "department_ops_1",
          createdAt: "2026-04-21T04:00:00.000Z",
        },
        {
          id: "notification_hidden_other_1",
          recipientUserId: "user_ops_1",
          title: "Other Notice",
          content: "Should stay hidden.",
          level: "warning",
          status: "unread",
          createdByUserId: "user_other_2",
          deptId: "department_other_1",
          createdAt: "2026-04-21T05:00:00.000Z",
        },
      ],
      availableUserIds: [fixture.userId, "user_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createNotificationModule(notificationRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const listBeforeCreateResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listBeforeCreateResponse.status).toBe(200)
    expect(await listBeforeCreateResponse.json()).toEqual({
      items: [
        {
          id: "notification_visible_ops_1",
          recipientUserId: "user_ops_1",
          title: "Ops Notice",
          content: "Visible to root descendants.",
          level: "info",
          status: "unread",
          createdByUserId: "user_other_1",
          createdAt: "2026-04-21T04:00:00.000Z",
        },
      ],
    })

    const createResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          recipientUserId: "user_ops_1",
          title: "Root Notice",
          content: "Created inside root scope.",
          level: "success",
        }),
      }),
    )

    expect(createResponse.status).toBe(201)
    const createdNotification = (await createResponse.json()) as {
      id: string
      recipientUserId: string
      title: string
      content: string
      level: string
      status: string
      createdByUserId?: string
      createdAt: string
    }

    const listAfterCreateResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listAfterCreateResponse.status).toBe(200)
    const listAfterCreateBody = (await listAfterCreateResponse.json()) as {
      items: Array<{ id: string }>
    }
    expect(listAfterCreateBody.items.map((item) => item.id)).toEqual([
      createdNotification.id,
      "notification_visible_ops_1",
    ])
  })

  it("rejects invalid notification recipients", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:notification:create"],
      isSuperAdmin: false,
    })
    const notificationRepository = createInMemoryNotificationRepository({
      notifications: createNotificationSeedRecords(),
      availableUserIds: ["user_admin_1", "user_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createNotificationModule(notificationRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/notifications", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          recipientUserId: "missing_user",
          title: "Missing recipient",
          content: "Should fail",
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: {
        code: "NOTIFICATION_RECIPIENT_INVALID",
        message: "Notification recipient does not exist",
        status: 400,
        details: {
          recipientUserId: "missing_user",
        },
      },
    })
  })
})
