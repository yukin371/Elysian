import { describe, expect, it } from "bun:test"
import { DEFAULT_TENANT_ID, type DatabaseClient } from "@elysian/persistence"
import type { WorkflowDefinitionRecord } from "@elysian/schema"

import { createServerApp } from "./app"
import {
  createServerConfig,
  loadServerConfig,
  resolveAccessTokenSecret,
} from "./config"
import { AppError } from "./errors"
import type { ServerLogger } from "./logging"
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
  createInMemoryNotificationRepository,
  createInMemoryOperationLogRepository,
  createInMemoryRoleRepository,
  createInMemorySettingRepository,
  createInMemoryTenantRepository,
  createInMemoryUserRepository,
  createInMemoryWorkflowDefinitionRepository,
  createMenuModule,
  createNotificationModule,
  createOperationLogModule,
  createPasswordHash,
  createRoleModule,
  createSettingModule,
  createTenantContextModule,
  createTenantModule,
  createUserModule,
  createWorkflowModule,
  verifyAccessToken,
} from "./modules"
import type {
  CreateCustomerInput,
  CustomerRepository,
} from "./modules/customer"
import type { WorkflowModuleOptions } from "./modules/workflow"

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

const startWorkflowInstance = async (
  app: ReturnType<typeof createTestApp>,
  accessToken: string,
  body: {
    definitionId: string
    variables?: Record<string, unknown>
  },
  extraHeaders: Record<string, string> = {},
) =>
  app.handle(
    new Request("http://localhost/workflow/instances", {
      method: "POST",
      headers: {
        ...createAuthorizedHeaders(accessToken, extraHeaders),
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  )

const claimWorkflowTask = async (
  app: ReturnType<typeof createTestApp>,
  accessToken: string,
  taskId: string,
  extraHeaders: Record<string, string> = {},
) =>
  app.handle(
    new Request(`http://localhost/workflow/tasks/${taskId}/claim`, {
      method: "POST",
      headers: createAuthorizedHeaders(accessToken, extraHeaders),
    }),
  )

const completeWorkflowTask = async (
  app: ReturnType<typeof createTestApp>,
  accessToken: string,
  taskId: string,
  result: "approved" | "rejected",
  extraHeaders: Record<string, string> = {},
) =>
  app.handle(
    new Request(`http://localhost/workflow/tasks/${taskId}/complete`, {
      method: "POST",
      headers: {
        ...createAuthorizedHeaders(accessToken, extraHeaders),
        "content-type": "application/json",
      },
      body: JSON.stringify({
        result,
      }),
    }),
  )

const cancelWorkflowInstance = async (
  app: ReturnType<typeof createTestApp>,
  accessToken: string,
  instanceId: string,
  extraHeaders: Record<string, string> = {},
) =>
  app.handle(
    new Request(`http://localhost/workflow/instances/${instanceId}/cancel`, {
      method: "POST",
      headers: createAuthorizedHeaders(accessToken, extraHeaders),
    }),
  )

const createWorkflowTestHarness = async (
  options: {
    fixture?: Awaited<ReturnType<typeof createAuthTestFixture>>
    permissions?: string[]
    isSuperAdmin?: boolean
    definitions?: WorkflowDefinitionRecord[]
    workflowRepository?: ReturnType<
      typeof createInMemoryWorkflowDefinitionRepository
    >
    auditLogWriter?: WorkflowModuleOptions["auditLogWriter"]
  } = {},
) => {
  const fixture =
    options.fixture ??
    (await createAuthTestFixture({
      permissions: options.permissions ?? [...workflowAllPermissionCodes],
      isSuperAdmin: options.isSuperAdmin ?? false,
    }))
  const workflowRepository =
    options.workflowRepository ??
    createInMemoryWorkflowDefinitionRepository(
      options.definitions ?? createWorkflowDefinitionSeedRecords(),
    )
  const app = createTestApp({
    modules: [
      fixture.authModule,
      createWorkflowModule(workflowRepository, {
        authGuard: fixture.authGuard,
        auditLogWriter: options.auditLogWriter,
      }),
    ],
  })
  const accessToken = await loginAsAdmin(app)

  return {
    fixture,
    workflowRepository,
    app,
    accessToken,
  }
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

const createWorkflowDefinitionSeedRecords = (): WorkflowDefinitionRecord[] => [
  {
    id: "workflow_definition_expense_v1",
    key: "expense-approval",
    name: "Expense Approval",
    version: 1,
    status: "active" as const,
    definition: {
      nodes: [
        { id: "start", type: "start", name: "Start" },
        {
          id: "manager-review",
          type: "approval",
          name: "Manager Review",
          assignee: "role:manager",
        },
        { id: "approved", type: "end", name: "Approved" },
      ],
      edges: [
        { from: "start", to: "manager-review" },
        { from: "manager-review", to: "approved" },
      ],
    },
    createdAt: "2026-04-21T02:00:00.000Z",
    updatedAt: "2026-04-21T02:00:00.000Z",
  },
]

const createClaimableWorkflowDefinitionSeedRecords =
  (): WorkflowDefinitionRecord[] => [
    {
      id: "workflow_definition_claimable_v1",
      key: "expense-approval-claimable",
      name: "Expense Approval Claimable",
      version: 1,
      status: "active" as const,
      definition: {
        nodes: [
          { id: "start", type: "start", name: "Start" },
          {
            id: "admin-review",
            type: "approval",
            name: "Admin Review",
            assignee: "role:admin",
          },
          { id: "approved", type: "end", name: "Approved" },
        ],
        edges: [
          { from: "start", to: "admin-review" },
          { from: "admin-review", to: "approved" },
        ],
      },
      createdAt: "2026-04-21T02:05:00.000Z",
      updatedAt: "2026-04-21T02:05:00.000Z",
    },
  ]

const createConditionalWorkflowDefinitionSeedRecords =
  (): WorkflowDefinitionRecord[] => [
    {
      id: "workflow_definition_expense_condition_v1",
      key: "expense-approval-condition",
      name: "Expense Approval Condition",
      version: 1,
      status: "active" as const,
      definition: {
        nodes: [
          { id: "start", type: "start", name: "Start" },
          {
            id: "manager-review",
            type: "approval",
            name: "Manager Review",
            assignee: "role:manager",
          },
          {
            id: "amount-check",
            type: "condition",
            name: "Amount Check",
            conditions: [
              {
                expression: "${amount > 5000}",
                target: "finance-review",
              },
              {
                expression: "default",
                target: "approved",
              },
            ],
          },
          {
            id: "finance-review",
            type: "approval",
            name: "Finance Review",
            assignee: "role:finance",
          },
          { id: "approved", type: "end", name: "Approved" },
        ],
        edges: [
          { from: "start", to: "manager-review" },
          { from: "manager-review", to: "amount-check" },
          { from: "amount-check", to: "finance-review" },
          { from: "amount-check", to: "approved" },
          { from: "finance-review", to: "approved" },
        ],
      },
      createdAt: "2026-04-21T03:00:00.000Z",
      updatedAt: "2026-04-21T03:00:00.000Z",
    },
  ]

const workflowDefinitionPermissionCodes = [
  "workflow:definition:list",
  "workflow:definition:create",
  "workflow:definition:update",
] as const

const workflowRuntimePermissionCodes = [
  "workflow:instance:list",
  "workflow:instance:start",
  "workflow:instance:cancel",
  "workflow:task:list",
  "workflow:task:claim",
  "workflow:task:complete",
] as const

const workflowAllPermissionCodes = [
  ...workflowDefinitionPermissionCodes,
  ...workflowRuntimePermissionCodes,
] as const

const toCookieHeader = (setCookie: string | null) => {
  if (!setCookie) {
    throw new Error("Missing set-cookie header")
  }

  return setCookie.split(";")[0] ?? setCookie
}

describe("createServerApp", () => {
  it("returns a healthy response", async () => {
    const app = createTestApp()
    const response = await app.handle(new Request("http://localhost/health"))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      status: "ok",
      service: "elysian",
      schemaVersion: 1,
    })
  })

  it("returns the registered module list", async () => {
    const app = createTestApp()
    const response = await app.handle(
      new Request("http://localhost/system/modules"),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      env: "test",
      modules: ["system"],
    })
  })

  it("returns a runtime metrics snapshot", async () => {
    const app = createTestApp()
    const response = await app.handle(new Request("http://localhost/metrics"))

    expect(response.status).toBe(200)
    const payload = (await response.json()) as {
      service: string
      schemaVersion: number
      uptimeSeconds: number
      process: {
        rssBytes: number
        heapUsedBytes: number
      }
      cpu: {
        userMicros: number
        systemMicros: number
      }
      timestamp: string
    }

    expect(payload.service).toBe("elysian")
    expect(payload.schemaVersion).toBe(1)
    expect(payload.uptimeSeconds).toBeGreaterThanOrEqual(0)
    expect(payload.process.rssBytes).toBeGreaterThan(0)
    expect(payload.process.heapUsedBytes).toBeGreaterThan(0)
    expect(payload.cpu.userMicros).toBeGreaterThanOrEqual(0)
    expect(payload.cpu.systemMicros).toBeGreaterThanOrEqual(0)
    expect(() => new Date(payload.timestamp)).not.toThrow()
  })

  it("returns prometheus metrics snapshot", async () => {
    const app = createTestApp()
    const response = await app.handle(
      new Request("http://localhost/metrics/prometheus"),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain(
      "text/plain; version=0.0.4",
    )
    const payload = await response.text()

    expect(payload).toContain("# HELP process_uptime_seconds")
    expect(payload).toContain("# TYPE process_uptime_seconds gauge")
    expect(payload).toContain("process_uptime_seconds ")
    expect(payload).toContain("process_start_time_seconds ")
    expect(payload).toContain("process_cpu_user_seconds_total ")
    expect(payload).toContain("process_cpu_system_seconds_total ")
    expect(payload).toContain("process_memory_rss_bytes ")
    expect(payload).toContain("process_memory_heap_used_bytes ")
  })

  it("allows cross-origin requests for frontend development", async () => {
    const app = createTestApp()
    const response = await app.handle(
      new Request("http://localhost/health", {
        headers: {
          origin: "http://127.0.0.1:5173",
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://127.0.0.1:5173",
    )
  })

  it("returns 429 when rate limit is exceeded", async () => {
    const app = createTestApp({
      config: {
        rateLimitEnabled: true,
        rateLimitMaxRequests: 1,
        rateLimitWindowMs: 60_000,
      },
    })
    const first = await app.handle(new Request("http://localhost/health"))
    const second = await app.handle(new Request("http://localhost/health"))

    expect(first.status).toBe(200)
    expect(first.headers.get("x-ratelimit-limit")).toBe("1")
    expect(first.headers.get("x-ratelimit-remaining")).toBe("0")
    expect(first.headers.get("x-ratelimit-reset")).toEqual(expect.any(String))
    expect(second.status).toBe(429)
    expect(await second.json()).toEqual({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests",
        status: 429,
        details: {
          limit: 1,
          windowMs: 60_000,
        },
      },
    })
    expect(second.headers.get("retry-after")).toBe("60")
    expect(second.headers.get("x-ratelimit-limit")).toBe("1")
    expect(second.headers.get("x-ratelimit-remaining")).toBe("0")
    expect(second.headers.get("x-ratelimit-reset")).toEqual(expect.any(String))
  })

  it("does not expose rate limit headers when rate limit is disabled", async () => {
    const app = createTestApp({
      config: {
        rateLimitEnabled: false,
      },
    })
    const response = await app.handle(new Request("http://localhost/health"))

    expect(response.status).toBe(200)
    expect(response.headers.get("x-ratelimit-limit")).toBeNull()
    expect(response.headers.get("x-ratelimit-remaining")).toBeNull()
    expect(response.headers.get("x-ratelimit-reset")).toBeNull()
    expect(response.headers.get("retry-after")).toBeNull()
  })

  it("returns a structured 404 error envelope", async () => {
    const app = createTestApp()
    const response = await app.handle(new Request("http://localhost/missing"))

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Route not found",
        status: 404,
        details: {
          method: "GET",
          path: "/missing",
        },
      },
    })
  })

  it("keeps the app stable when no modules are registered", async () => {
    const app = createTestApp({ modules: [] })
    const response = await app.handle(new Request("http://localhost/health"))

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Route not found",
        status: 404,
        details: {
          method: "GET",
          path: "/health",
        },
      },
    })
  })

  it("returns structured app errors from registered modules", async () => {
    const failingModule: ServerModule = {
      name: "failing",
      register: (app) =>
        app.get("/failing", () => {
          throw new AppError({
            code: "MODULE_FAILURE",
            message: "Module failed",
            status: 409,
            expose: true,
            details: {
              reason: "test",
            },
          })
        }),
    }

    const app = createTestApp({ modules: [failingModule] })
    const response = await app.handle(new Request("http://localhost/failing"))

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      error: {
        code: "MODULE_FAILURE",
        message: "Module failed",
        status: 409,
        details: {
          reason: "test",
        },
      },
    })
  })

  it("lists customers from the customer module", async () => {
    const app = createTestApp({
      modules: [
        createCustomerModule(
          createInMemoryCustomerRepository([
            {
              id: "cust_1",
              name: "Acme Corp",
              status: "active",
              createdAt: "2026-04-21T00:00:00.000Z",
              updatedAt: "2026-04-21T00:00:00.000Z",
            },
          ]),
        ),
      ],
    })
    const response = await app.handle(new Request("http://localhost/customers"))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      items: [
        {
          id: "cust_1",
          name: "Acme Corp",
          status: "active",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      ],
    })
  })

  it("creates a customer through the customer module", async () => {
    const app = createTestApp({
      modules: [createCustomerModule(createInMemoryCustomerRepository())],
    })
    const response = await app.handle(
      new Request("http://localhost/customers", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Northwind",
          status: "inactive",
        }),
      }),
    )

    expect(response.status).toBe(201)

    const body = (await response.json()) as {
      id: string
      name: string
      status: string
    }
    expect(body.name).toBe("Northwind")
    expect(body.status).toBe("inactive")
    expect(typeof body.id).toBe("string")
  })

  it("returns customer not found for unknown ids", async () => {
    const app = createTestApp({
      modules: [createCustomerModule(createInMemoryCustomerRepository())],
    })
    const response = await app.handle(
      new Request("http://localhost/customers/missing"),
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      error: {
        code: "CUSTOMER_NOT_FOUND",
        message: "Customer not found",
        status: 404,
        details: {
          id: "missing",
        },
      },
    })
  })

  it("updates a customer through the customer module", async () => {
    const repo = createInMemoryCustomerRepository([
      {
        id: "cust_1",
        name: "Acme Corp",
        status: "active",
        createdAt: "2026-04-21T00:00:00.000Z",
        updatedAt: "2026-04-21T00:00:00.000Z",
      },
    ])
    const app = createTestApp({
      modules: [createCustomerModule(repo)],
    })
    const response = await app.handle(
      new Request("http://localhost/customers/cust_1", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Acme Updated", status: "inactive" }),
      }),
    )

    expect(response.status).toBe(200)
    const body = (await response.json()) as {
      name: string
      status: string
    }
    expect(body.name).toBe("Acme Updated")
    expect(body.status).toBe("inactive")
  })

  it("deletes a customer through the customer module", async () => {
    const repo = createInMemoryCustomerRepository([
      {
        id: "cust_1",
        name: "Acme Corp",
        status: "active",
        createdAt: "2026-04-21T00:00:00.000Z",
        updatedAt: "2026-04-21T00:00:00.000Z",
      },
    ])
    const app = createTestApp({
      modules: [createCustomerModule(repo)],
    })
    const response = await app.handle(
      new Request("http://localhost/customers/cust_1", {
        method: "DELETE",
      }),
    )

    expect(response.status).toBe(204)

    const listResponse = await app.handle(
      new Request("http://localhost/customers"),
    )
    const body = (await listResponse.json()) as { items: unknown[] }
    expect(body.items).toHaveLength(0)
  })

  it("returns 404 when updating a missing customer", async () => {
    const app = createTestApp({
      modules: [createCustomerModule(createInMemoryCustomerRepository())],
    })
    const response = await app.handle(
      new Request("http://localhost/customers/missing", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      }),
    )

    expect(response.status).toBe(404)
  })

  it("returns 404 when deleting a missing customer", async () => {
    const app = createTestApp({
      modules: [createCustomerModule(createInMemoryCustomerRepository())],
    })
    const response = await app.handle(
      new Request("http://localhost/customers/missing", {
        method: "DELETE",
      }),
    )

    expect(response.status).toBe(404)
  })

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
    expect(setCookie).toContain("elysian_refresh_token=")

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
    expect(setCookie).toContain(`elysian_refresh_token=${tenantId}.`)

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
      "elysian_refresh_token=",
    )
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
      list: async () => [],
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

  it("lists, gets, creates, and versions workflow definitions", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [...workflowDefinitionPermissionCodes],
      isSuperAdmin: false,
    })
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createWorkflowDefinitionSeedRecords(),
    )
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
      new Request("http://localhost/workflow/definitions", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: createWorkflowDefinitionSeedRecords(),
    })

    const getResponse = await app.handle(
      new Request(
        "http://localhost/workflow/definitions/workflow_definition_expense_v1",
        {
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
          },
        },
      ),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(
      createWorkflowDefinitionSeedRecords()[0],
    )

    const createResponse = await app.handle(
      new Request("http://localhost/workflow/definitions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          key: "leave-approval",
          name: "Leave Approval",
          status: "active",
          definition: {
            nodes: [
              { id: "start", type: "start", name: "Start" },
              {
                id: "leader-review",
                type: "approval",
                name: "Leader Review",
                assignee: "role:leader",
              },
              { id: "approved", type: "end", name: "Approved" },
            ],
            edges: [
              { from: "start", to: "leader-review" },
              { from: "leader-review", to: "approved" },
            ],
          },
        }),
      }),
    )

    expect(createResponse.status).toBe(201)
    const createdDefinition = (await createResponse.json()) as {
      id: string
      key: string
      name: string
      version: number
      status: string
      definition: Record<string, unknown>
      createdAt: string
      updatedAt: string
    }
    expect(createdDefinition.id).toEqual(expect.any(String))
    expect(createdDefinition.key).toBe("leave-approval")
    expect(createdDefinition.name).toBe("Leave Approval")
    expect(createdDefinition.version).toBe(1)
    expect(createdDefinition.status).toBe("active")
    expect(createdDefinition.definition).toEqual({
      nodes: [
        { id: "start", type: "start", name: "Start" },
        {
          id: "leader-review",
          type: "approval",
          name: "Leader Review",
          assignee: "role:leader",
        },
        { id: "approved", type: "end", name: "Approved" },
      ],
      edges: [
        { from: "start", to: "leader-review" },
        { from: "leader-review", to: "approved" },
      ],
    })
    expect(createdDefinition.createdAt).toEqual(expect.any(String))
    expect(createdDefinition.updatedAt).toEqual(expect.any(String))

    const updateResponse = await app.handle(
      new Request(
        "http://localhost/workflow/definitions/workflow_definition_expense_v1",
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name: "Expense Approval v2",
            definition: {
              nodes: [
                { id: "start", type: "start", name: "Start" },
                {
                  id: "manager-review",
                  type: "approval",
                  name: "Manager Review",
                  assignee: "role:manager",
                },
                {
                  id: "amount-check",
                  type: "condition",
                  name: "Amount Check",
                  conditions: [
                    {
                      expression: "${amount > 5000}",
                      target: "finance-review",
                    },
                    {
                      expression: "default",
                      target: "approved",
                    },
                  ],
                },
                {
                  id: "finance-review",
                  type: "approval",
                  name: "Finance Review",
                  assignee: "role:finance",
                },
                { id: "approved", type: "end", name: "Approved" },
              ],
              edges: [
                { from: "start", to: "manager-review" },
                { from: "manager-review", to: "amount-check" },
                { from: "amount-check", to: "finance-review" },
                { from: "amount-check", to: "approved" },
                { from: "finance-review", to: "approved" },
              ],
            },
          }),
        },
      ),
    )

    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toEqual({
      id: expect.any(String),
      key: "expense-approval",
      name: "Expense Approval v2",
      version: 2,
      status: "active",
      definition: {
        nodes: [
          { id: "start", type: "start", name: "Start" },
          {
            id: "manager-review",
            type: "approval",
            name: "Manager Review",
            assignee: "role:manager",
          },
          {
            id: "amount-check",
            type: "condition",
            name: "Amount Check",
            conditions: [
              {
                expression: "${amount > 5000}",
                target: "finance-review",
              },
              {
                expression: "default",
                target: "approved",
              },
            ],
          },
          {
            id: "finance-review",
            type: "approval",
            name: "Finance Review",
            assignee: "role:finance",
          },
          { id: "approved", type: "end", name: "Approved" },
        ],
        edges: [
          { from: "start", to: "manager-review" },
          { from: "manager-review", to: "amount-check" },
          { from: "amount-check", to: "finance-review" },
          { from: "amount-check", to: "approved" },
          { from: "finance-review", to: "approved" },
        ],
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  it("starts workflow instances and lists todo tasks", async () => {
    const { app, accessToken, fixture } = await createWorkflowTestHarness()

    const startResponse = await startWorkflowInstance(app, accessToken, {
      definitionId: "workflow_definition_expense_v1",
      variables: {
        amount: 1200,
      },
    })

    expect(startResponse.status).toBe(201)
    const startedInstance = (await startResponse.json()) as {
      id: string
      definitionId: string
      status: string
      currentNodeId: string | null
      variables: Record<string, unknown>
      currentTasks: Array<{
        id: string
        instanceId: string
        definitionId: string
        assignee: string
        nodeId: string
        nodeName: string
        status: string
        result: string | null
        variables: Record<string, unknown>
        createdAt: string
        updatedAt: string
        completedAt: string | null
      }>
      tasks: Array<{
        id: string
        instanceId: string
        definitionId: string
        assignee: string
        nodeId: string
        nodeName: string
        status: string
        result: string | null
        variables: Record<string, unknown>
        createdAt: string
        updatedAt: string
        completedAt: string | null
      }>
    }
    expect(startedInstance.id).toEqual(expect.any(String))
    expect(startedInstance.definitionId).toBe("workflow_definition_expense_v1")
    expect(startedInstance.status).toBe("running")
    expect(startedInstance.currentNodeId).toBe("manager-review")
    expect(startedInstance.variables).toEqual({
      amount: 1200,
    })
    expect(startedInstance.currentTasks).toEqual([
      {
        id: expect.any(String),
        instanceId: startedInstance.id,
        definitionId: "workflow_definition_expense_v1",
        assignee: "role:manager",
        nodeId: "manager-review",
        nodeName: "Manager Review",
        status: "todo",
        result: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        completedAt: null,
        variables: {
          amount: 1200,
        },
      },
    ])
    expect(startedInstance.tasks).toEqual(startedInstance.currentTasks)
    const currentTaskId = startedInstance.currentTasks[0]?.id

    if (!currentTaskId) {
      throw new Error("Expected workflow instance to create a todo task")
    }

    const listInstancesResponse = await app.handle(
      new Request("http://localhost/workflow/instances", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listInstancesResponse.status).toBe(200)
    expect(await listInstancesResponse.json()).toEqual({
      items: [
        {
          id: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          definitionKey: "expense-approval",
          definitionName: "Expense Approval",
          definitionVersion: 1,
          status: "running",
          currentNodeId: "manager-review",
          variables: {
            amount: 1200,
          },
          startedByUserId: fixture.userId,
          startedAt: expect.any(String),
          completedAt: null,
          terminatedAt: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ],
    })

    const getInstanceResponse = await app.handle(
      new Request(`http://localhost/workflow/instances/${startedInstance.id}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getInstanceResponse.status).toBe(200)
    expect(await getInstanceResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_v1",
      definitionKey: "expense-approval",
      definitionName: "Expense Approval",
      definitionVersion: 1,
      status: "running",
      currentNodeId: "manager-review",
      variables: {
        amount: 1200,
      },
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [
        {
          id: currentTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {
            amount: 1200,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
      tasks: [
        {
          id: currentTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {
            amount: 1200,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })

    const listTodoResponse = await app.handle(
      new Request(
        "http://localhost/workflow/tasks/todo?assignee=role:manager",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(listTodoResponse.status).toBe(200)
    expect(await listTodoResponse.json()).toEqual({
      items: [
        {
          id: currentTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {
            amount: 1200,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })
  })

  it("completes workflow tasks and exposes done history", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
      isSuperAdmin: false,
    })
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createWorkflowDefinitionSeedRecords(),
    )
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

    const startResponse = await app.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: "workflow_definition_expense_v1",
        }),
      }),
    )
    const startedInstance = (await startResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const taskId = startedInstance.currentTasks[0]?.id

    if (!taskId) {
      throw new Error("Expected workflow instance to create a todo task")
    }

    const completeResponse = await app.handle(
      new Request(`http://localhost/workflow/tasks/${taskId}/complete`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "approved",
        }),
      }),
    )

    expect(completeResponse.status).toBe(200)
    expect(await completeResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_v1",
      definitionKey: "expense-approval",
      definitionName: "Expense Approval",
      definitionVersion: 1,
      status: "completed",
      currentNodeId: "approved",
      variables: {},
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: expect.any(String),
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [],
      tasks: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "completed",
          result: "approved",
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })

    const doneResponse = await app.handle(
      new Request(
        "http://localhost/workflow/tasks/done?assignee=role:manager",
        {
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
          },
        },
      ),
    )

    expect(doneResponse.status).toBe(200)
    expect(await doneResponse.json()).toEqual({
      items: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "completed",
          result: "approved",
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })

    const todoResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(todoResponse.status).toBe(200)
    expect(await todoResponse.json()).toEqual({
      items: [],
    })
  })

  it("claims workflow tasks for the current user and restricts completion to the claimer", async () => {
    const claimerFixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
      isSuperAdmin: false,
    })
    const peerFixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
      isSuperAdmin: false,
    })
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createClaimableWorkflowDefinitionSeedRecords(),
    )
    const claimerApp = createTestApp({
      modules: [
        claimerFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: claimerFixture.authGuard,
        }),
      ],
    })
    const peerApp = createTestApp({
      modules: [
        peerFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: peerFixture.authGuard,
        }),
      ],
    })

    const claimerAccessToken = await loginAsAdmin(claimerApp)
    const peerAccessToken = await loginAsAdmin(peerApp)

    const startResponse = await startWorkflowInstance(
      claimerApp,
      claimerAccessToken,
      {
        definitionId: "workflow_definition_claimable_v1",
      },
    )
    const startedInstance = (await startResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const taskId = startedInstance.currentTasks[0]?.id

    if (!taskId) {
      throw new Error("Expected workflow instance to create a claimable task")
    }

    const claimResponse = await claimWorkflowTask(
      claimerApp,
      claimerAccessToken,
      taskId,
    )

    expect(claimResponse.status).toBe(200)
    expect(await claimResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_claimable_v1",
      definitionKey: "expense-approval-claimable",
      definitionName: "Expense Approval Claimable",
      definitionVersion: 1,
      status: "running",
      currentNodeId: "admin-review",
      variables: {},
      startedByUserId: claimerFixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_claimable_v1",
          nodeId: "admin-review",
          nodeName: "Admin Review",
          assignee: `user:${claimerFixture.userId}`,
          status: "todo",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
      tasks: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_claimable_v1",
          nodeId: "admin-review",
          nodeName: "Admin Review",
          assignee: `user:${claimerFixture.userId}`,
          status: "todo",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })

    const claimedTodoResponse = await claimerApp.handle(
      new Request(
        `http://localhost/workflow/tasks/todo?assignee=user:${claimerFixture.userId}`,
        {
          headers: {
            authorization: `Bearer ${claimerAccessToken}`,
          },
        },
      ),
    )

    expect(claimedTodoResponse.status).toBe(200)
    expect(await claimedTodoResponse.json()).toEqual({
      items: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_claimable_v1",
          nodeId: "admin-review",
          nodeName: "Admin Review",
          assignee: `user:${claimerFixture.userId}`,
          status: "todo",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })

    const peerCompleteResponse = await completeWorkflowTask(
      peerApp,
      peerAccessToken,
      taskId,
      "approved",
    )

    expect(peerCompleteResponse.status).toBe(403)
    expect(await peerCompleteResponse.json()).toEqual({
      error: {
        code: "WORKFLOW_TASK_ASSIGNEE_MISMATCH",
        message: "Workflow task is assigned to another user",
        status: 403,
        details: {
          id: taskId,
          assignee: `user:${claimerFixture.userId}`,
        },
      },
    })

    const completeResponse = await completeWorkflowTask(
      claimerApp,
      claimerAccessToken,
      taskId,
      "approved",
    )

    expect(completeResponse.status).toBe(200)
    expect(await completeResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_claimable_v1",
      definitionKey: "expense-approval-claimable",
      definitionName: "Expense Approval Claimable",
      definitionVersion: 1,
      status: "completed",
      currentNodeId: "approved",
      variables: {},
      startedByUserId: claimerFixture.userId,
      startedAt: expect.any(String),
      completedAt: expect.any(String),
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [],
      tasks: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_claimable_v1",
          nodeId: "admin-review",
          nodeName: "Admin Review",
          assignee: `user:${claimerFixture.userId}`,
          status: "completed",
          result: "approved",
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })
  })

  it("routes workflow instances through the conditional approval branch", async () => {
    const { app, accessToken, fixture } = await createWorkflowTestHarness({
      definitions: createConditionalWorkflowDefinitionSeedRecords(),
    })

    const startResponse = await startWorkflowInstance(app, accessToken, {
      definitionId: "workflow_definition_expense_condition_v1",
      variables: {
        amount: 6800,
      },
    })
    const startedInstance = (await startResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const managerTaskId = startedInstance.currentTasks[0]?.id

    if (!managerTaskId) {
      throw new Error(
        "Expected workflow instance to create a manager todo task",
      )
    }

    const managerCompleteResponse = await completeWorkflowTask(
      app,
      accessToken,
      managerTaskId,
      "approved",
    )

    expect(managerCompleteResponse.status).toBe(200)
    expect(await managerCompleteResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_condition_v1",
      definitionKey: "expense-approval-condition",
      definitionName: "Expense Approval Condition",
      definitionVersion: 1,
      status: "running",
      currentNodeId: "finance-review",
      variables: {
        amount: 6800,
      },
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [
        {
          id: expect.any(String),
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "finance-review",
          nodeName: "Finance Review",
          assignee: "role:finance",
          status: "todo",
          result: null,
          variables: {
            amount: 6800,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
      tasks: [
        {
          id: managerTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "completed",
          result: "approved",
          variables: {
            amount: 6800,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
        {
          id: expect.any(String),
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "finance-review",
          nodeName: "Finance Review",
          assignee: "role:finance",
          status: "todo",
          result: null,
          variables: {
            amount: 6800,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })

    const financeTodoResponse = await app.handle(
      new Request(
        "http://localhost/workflow/tasks/todo?assignee=role:finance",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )
    const financeTodoBody = (await financeTodoResponse.json()) as {
      items: Array<{ id: string }>
    }
    const financeTaskId = financeTodoBody.items[0]?.id

    if (!financeTaskId) {
      throw new Error(
        "Expected workflow instance to create a finance todo task",
      )
    }

    const financeCompleteResponse = await completeWorkflowTask(
      app,
      accessToken,
      financeTaskId,
      "approved",
    )

    expect(financeCompleteResponse.status).toBe(200)
    expect(await financeCompleteResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_condition_v1",
      definitionKey: "expense-approval-condition",
      definitionName: "Expense Approval Condition",
      definitionVersion: 1,
      status: "completed",
      currentNodeId: "approved",
      variables: {
        amount: 6800,
      },
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: expect.any(String),
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [],
      tasks: [
        {
          id: managerTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "completed",
          result: "approved",
          variables: {
            amount: 6800,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
        {
          id: financeTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "finance-review",
          nodeName: "Finance Review",
          assignee: "role:finance",
          status: "completed",
          result: "approved",
          variables: {
            amount: 6800,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })
  })

  it("uses the default condition branch when no condition matches", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
      isSuperAdmin: false,
    })
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createConditionalWorkflowDefinitionSeedRecords(),
    )
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

    const startResponse = await app.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: "workflow_definition_expense_condition_v1",
          variables: {
            amount: 1200,
          },
        }),
      }),
    )
    const startedInstance = (await startResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const managerTaskId = startedInstance.currentTasks[0]?.id

    if (!managerTaskId) {
      throw new Error(
        "Expected workflow instance to create a manager todo task",
      )
    }

    const completeResponse = await app.handle(
      new Request(`http://localhost/workflow/tasks/${managerTaskId}/complete`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "approved",
        }),
      }),
    )

    expect(completeResponse.status).toBe(200)
    expect(await completeResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_condition_v1",
      definitionKey: "expense-approval-condition",
      definitionName: "Expense Approval Condition",
      definitionVersion: 1,
      status: "completed",
      currentNodeId: "approved",
      variables: {
        amount: 1200,
      },
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: expect.any(String),
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [],
      tasks: [
        {
          id: managerTaskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_condition_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "completed",
          result: "approved",
          variables: {
            amount: 1200,
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })
  })

  it("rejects workflow tasks and terminates instances", async () => {
    const { app, accessToken, fixture } = await createWorkflowTestHarness()

    const startResponse = await startWorkflowInstance(app, accessToken, {
      definitionId: "workflow_definition_expense_v1",
      variables: {
        reason: "budget-exceeded",
      },
    })
    const startedInstance = (await startResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const taskId = startedInstance.currentTasks[0]?.id

    if (!taskId) {
      throw new Error("Expected workflow instance to create a todo task")
    }

    const rejectResponse = await completeWorkflowTask(
      app,
      accessToken,
      taskId,
      "rejected",
    )

    expect(rejectResponse.status).toBe(200)
    expect(await rejectResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_v1",
      definitionKey: "expense-approval",
      definitionName: "Expense Approval",
      definitionVersion: 1,
      status: "terminated",
      currentNodeId: null,
      variables: {
        reason: "budget-exceeded",
      },
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [],
      tasks: [
        {
          id: taskId,
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "completed",
          result: "rejected",
          variables: {
            reason: "budget-exceeded",
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      ],
    })
  })

  it("cancels workflow instances and clears todo tasks", async () => {
    const { app, accessToken, fixture } = await createWorkflowTestHarness()

    const startResponse = await startWorkflowInstance(app, accessToken, {
      definitionId: "workflow_definition_expense_v1",
    })
    const startedInstance = (await startResponse.json()) as { id: string }

    const cancelResponse = await cancelWorkflowInstance(
      app,
      accessToken,
      startedInstance.id,
    )

    expect(cancelResponse.status).toBe(200)
    expect(await cancelResponse.json()).toEqual({
      id: startedInstance.id,
      definitionId: "workflow_definition_expense_v1",
      definitionKey: "expense-approval",
      definitionName: "Expense Approval",
      definitionVersion: 1,
      status: "terminated",
      currentNodeId: null,
      variables: {},
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [],
      tasks: [
        {
          id: expect.any(String),
          instanceId: startedInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "cancelled",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })

    const todoResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(todoResponse.status).toBe(200)
    expect(await todoResponse.json()).toEqual({
      items: [],
    })
  })

  it("writes audit logs for workflow runtime actions", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
      isSuperAdmin: true,
    })
    const { app, accessToken } = await createWorkflowTestHarness({
      fixture,
      isSuperAdmin: true,
      auditLogWriter: (
        input: Parameters<
          NonNullable<WorkflowModuleOptions["auditLogWriter"]>
        >[0],
      ) =>
        fixture.repository.createAuditLog({
          category: "workflow",
          ...input,
        }),
    })

    const startResponse = await startWorkflowInstance(
      app,
      accessToken,
      {
        definitionId: "workflow_definition_expense_v1",
      },
      {
        "user-agent": "workflow-runtime-audit-agent",
        "x-forwarded-for": "127.0.2.1",
        "x-request-id": "req-workflow-start-audit-1",
      },
    )
    const startedInstance = (await startResponse.json()) as {
      id: string
      status: string
      currentTasks: Array<{ id: string }>
    }
    const taskId = startedInstance.currentTasks[0]?.id

    if (!taskId) {
      throw new Error("Expected workflow instance to create a todo task")
    }

    const claimResponse = await claimWorkflowTask(app, accessToken, taskId, {
      "user-agent": "workflow-runtime-audit-agent",
      "x-forwarded-for": "127.0.2.2",
      "x-request-id": "req-workflow-claim-audit-1",
    })
    expect(claimResponse.status).toBe(200)

    const completeResponse = await completeWorkflowTask(
      app,
      accessToken,
      taskId,
      "approved",
      {
        "user-agent": "workflow-runtime-audit-agent",
        "x-forwarded-for": "127.0.2.3",
        "x-request-id": "req-workflow-complete-audit-1",
      },
    )
    expect(completeResponse.status).toBe(200)

    const secondStartResponse = await startWorkflowInstance(
      app,
      accessToken,
      {
        definitionId: "workflow_definition_expense_v1",
      },
      {
        "user-agent": "workflow-runtime-audit-agent",
        "x-forwarded-for": "127.0.2.4",
        "x-request-id": "req-workflow-start-audit-2",
      },
    )
    const secondStartedInstance = (await secondStartResponse.json()) as {
      id: string
    }

    const cancelResponse = await cancelWorkflowInstance(
      app,
      accessToken,
      secondStartedInstance.id,
      {
        "user-agent": "workflow-runtime-audit-agent",
        "x-forwarded-for": "127.0.2.5",
        "x-request-id": "req-workflow-cancel-audit-1",
      },
    )
    expect(cancelResponse.status).toBe(200)

    const workflowAuditLogs = (await fixture.repository.listAuditLogs()).filter(
      (log) => log.category === "workflow",
    )

    expect(workflowAuditLogs).toHaveLength(5)
    expect(workflowAuditLogs[0]).toMatchObject({
      category: "workflow",
      action: "workflow_instance_cancel",
      targetType: "workflow_instance",
      targetId: secondStartedInstance.id,
      actorUserId: fixture.userId,
      requestId: "req-workflow-cancel-audit-1",
      ip: "127.0.2.5",
      userAgent: "workflow-runtime-audit-agent",
      result: "success",
      details: {
        status: "terminated",
        currentNodeId: null,
      },
    })
    expect(workflowAuditLogs[1]).toMatchObject({
      category: "workflow",
      action: "workflow_instance_start",
      targetType: "workflow_instance",
      targetId: secondStartedInstance.id,
      actorUserId: fixture.userId,
      requestId: "req-workflow-start-audit-2",
      ip: "127.0.2.4",
      userAgent: "workflow-runtime-audit-agent",
      result: "success",
      details: {
        definitionId: "workflow_definition_expense_v1",
        status: "running",
      },
    })
    expect(workflowAuditLogs[2]).toMatchObject({
      category: "workflow",
      action: "workflow_task_complete",
      targetType: "workflow_task",
      targetId: taskId,
      actorUserId: fixture.userId,
      requestId: "req-workflow-complete-audit-1",
      ip: "127.0.2.3",
      userAgent: "workflow-runtime-audit-agent",
      result: "success",
      details: {
        instanceId: startedInstance.id,
        result: "approved",
        status: "completed",
      },
    })
    expect(workflowAuditLogs[3]).toMatchObject({
      category: "workflow",
      action: "workflow_task_claim",
      targetType: "workflow_task",
      targetId: taskId,
      actorUserId: fixture.userId,
      requestId: "req-workflow-claim-audit-1",
      ip: "127.0.2.2",
      userAgent: "workflow-runtime-audit-agent",
      result: "success",
      details: {
        instanceId: startedInstance.id,
        status: "running",
      },
    })
    expect(workflowAuditLogs[4]).toMatchObject({
      category: "workflow",
      action: "workflow_instance_start",
      targetType: "workflow_instance",
      targetId: startedInstance.id,
      actorUserId: fixture.userId,
      requestId: "req-workflow-start-audit-1",
      ip: "127.0.2.1",
      userAgent: "workflow-runtime-audit-agent",
      result: "success",
      details: {
        definitionId: "workflow_definition_expense_v1",
        status: "running",
      },
    })
  })

  it("keeps workflow runtime actions successful when audit log writing fails", async () => {
    const { app, accessToken, fixture } = await createWorkflowTestHarness({
      auditLogWriter: async () => {
        throw new Error("audit sink unavailable")
      },
    })

    const startResponse = await startWorkflowInstance(
      app,
      accessToken,
      {
        definitionId: "workflow_definition_expense_v1",
      },
      {
        "x-request-id": "req-workflow-audit-failure-start-1",
      },
    )

    expect(startResponse.status).toBe(201)
    expect(await startResponse.json()).toEqual({
      id: expect.any(String),
      definitionId: "workflow_definition_expense_v1",
      definitionKey: "expense-approval",
      definitionName: "Expense Approval",
      definitionVersion: 1,
      status: "running",
      currentNodeId: "manager-review",
      variables: {},
      startedByUserId: fixture.userId,
      startedAt: expect.any(String),
      completedAt: null,
      terminatedAt: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      currentTasks: [
        {
          id: expect.any(String),
          instanceId: expect.any(String),
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
      tasks: [
        {
          id: expect.any(String),
          instanceId: expect.any(String),
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })
  })

  it("returns 403 for workflow task list endpoints without workflow list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        ...workflowDefinitionPermissionCodes,
        "workflow:instance:list",
        "workflow:instance:start",
        "workflow:instance:cancel",
        "workflow:task:complete",
      ],
      isSuperAdmin: false,
    })
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createWorkflowDefinitionSeedRecords(),
    )
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

    const todoResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(todoResponse.status).toBe(403)
    expect(await todoResponse.json()).toEqual({
      error: {
        code: "AUTH_PERMISSION_DENIED",
        message: "Permission denied",
        status: 403,
        details: {
          permissionCode: "workflow:task:list",
        },
      },
    })

    const doneResponse = await app.handle(
      new Request("http://localhost/workflow/tasks/done", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(doneResponse.status).toBe(403)
    expect(await doneResponse.json()).toEqual({
      error: {
        code: "AUTH_PERMISSION_DENIED",
        message: "Permission denied",
        status: 403,
        details: {
          permissionCode: "workflow:task:list",
        },
      },
    })
  })

  it("returns 403 for workflow task claim, completion, and instance cancel without workflow update permission", async () => {
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createWorkflowDefinitionSeedRecords(),
    )
    const privilegedFixture = await createAuthTestFixture({
      permissions: [...workflowAllPermissionCodes],
      isSuperAdmin: false,
    })
    const restrictedFixture = await createAuthTestFixture({
      permissions: [
        ...workflowDefinitionPermissionCodes,
        "workflow:instance:list",
        "workflow:instance:start",
        "workflow:task:list",
      ],
      isSuperAdmin: false,
    })
    const privilegedApp = createTestApp({
      modules: [
        privilegedFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: privilegedFixture.authGuard,
        }),
      ],
    })
    const restrictedApp = createTestApp({
      modules: [
        restrictedFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: restrictedFixture.authGuard,
        }),
      ],
    })

    const privilegedLoginResponse = await privilegedApp.handle(
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
    const privilegedLoginBody = (await privilegedLoginResponse.json()) as {
      accessToken: string
    }
    const restrictedLoginResponse = await restrictedApp.handle(
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
    const restrictedLoginBody = (await restrictedLoginResponse.json()) as {
      accessToken: string
    }

    const startResponse = await privilegedApp.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${privilegedLoginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: "workflow_definition_expense_v1",
        }),
      }),
    )
    const startedInstance = (await startResponse.json()) as {
      id: string
      currentTasks: Array<{ id: string }>
    }
    const taskId = startedInstance.currentTasks[0]?.id

    if (!taskId) {
      throw new Error("Expected workflow instance to create a todo task")
    }

    const claimResponse = await restrictedApp.handle(
      new Request(`http://localhost/workflow/tasks/${taskId}/claim`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${restrictedLoginBody.accessToken}`,
        },
      }),
    )

    expect(claimResponse.status).toBe(403)
    expect(await claimResponse.json()).toEqual({
      error: {
        code: "AUTH_PERMISSION_DENIED",
        message: "Permission denied",
        status: 403,
        details: {
          permissionCode: "workflow:task:claim",
        },
      },
    })

    const completeResponse = await restrictedApp.handle(
      new Request(`http://localhost/workflow/tasks/${taskId}/complete`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${restrictedLoginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          result: "approved",
        }),
      }),
    )

    expect(completeResponse.status).toBe(403)
    expect(await completeResponse.json()).toEqual({
      error: {
        code: "AUTH_PERMISSION_DENIED",
        message: "Permission denied",
        status: 403,
        details: {
          permissionCode: "workflow:task:complete",
        },
      },
    })

    const cancelResponse = await restrictedApp.handle(
      new Request(
        `http://localhost/workflow/instances/${startedInstance.id}/cancel`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${restrictedLoginBody.accessToken}`,
          },
        },
      ),
    )

    expect(cancelResponse.status).toBe(403)
    expect(await cancelResponse.json()).toEqual({
      error: {
        code: "AUTH_PERMISSION_DENIED",
        message: "Permission denied",
        status: 403,
        details: {
          permissionCode: "workflow:instance:cancel",
        },
      },
    })
  })

  it("isolates workflow instances and todo tasks by tenant", async () => {
    const workflowRepository = createInMemoryWorkflowDefinitionRepository(
      createWorkflowDefinitionSeedRecords(),
    )
    const defaultFixture = await createAuthTestFixture({
      permissions: [
        "workflow:instance:list",
        "workflow:instance:start",
        "workflow:task:list",
      ],
      isSuperAdmin: false,
      tenantId: DEFAULT_TENANT_ID,
    })
    const tenantAlphaId = "11111111-1111-4111-8111-111111111111"
    const tenantAlphaFixture = await createAuthTestFixture({
      permissions: [
        "workflow:instance:list",
        "workflow:instance:start",
        "workflow:task:list",
      ],
      isSuperAdmin: false,
      tenantId: tenantAlphaId,
    })
    const defaultApp = createTestApp({
      modules: [
        defaultFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: defaultFixture.authGuard,
        }),
      ],
    })
    const tenantAlphaApp = createTestApp({
      modules: [
        tenantAlphaFixture.authModule,
        createWorkflowModule(workflowRepository, {
          authGuard: tenantAlphaFixture.authGuard,
        }),
      ],
    })

    const defaultLoginResponse = await defaultApp.handle(
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
    const defaultLoginBody = (await defaultLoginResponse.json()) as {
      accessToken: string
    }
    const tenantAlphaLoginResponse = await tenantAlphaApp.handle(
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
    const tenantAlphaLoginBody = (await tenantAlphaLoginResponse.json()) as {
      accessToken: string
    }

    const defaultStartResponse = await defaultApp.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${defaultLoginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: "workflow_definition_expense_v1",
        }),
      }),
    )
    expect(defaultStartResponse.status).toBe(201)
    const defaultInstance = (await defaultStartResponse.json()) as {
      id: string
    }

    const tenantAlphaStartResponse = await tenantAlphaApp.handle(
      new Request("http://localhost/workflow/instances", {
        method: "POST",
        headers: {
          authorization: `Bearer ${tenantAlphaLoginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId: "workflow_definition_expense_v1",
        }),
      }),
    )
    expect(tenantAlphaStartResponse.status).toBe(201)
    const tenantAlphaInstance = (await tenantAlphaStartResponse.json()) as {
      id: string
    }

    const defaultListResponse = await defaultApp.handle(
      new Request("http://localhost/workflow/instances", {
        headers: {
          authorization: `Bearer ${defaultLoginBody.accessToken}`,
        },
      }),
    )

    expect(defaultListResponse.status).toBe(200)
    expect(await defaultListResponse.json()).toEqual({
      items: [
        {
          id: defaultInstance.id,
          definitionId: "workflow_definition_expense_v1",
          definitionKey: "expense-approval",
          definitionName: "Expense Approval",
          definitionVersion: 1,
          status: "running",
          currentNodeId: "manager-review",
          variables: {},
          startedByUserId: defaultFixture.userId,
          startedAt: expect.any(String),
          completedAt: null,
          terminatedAt: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ],
    })

    const tenantAlphaListResponse = await tenantAlphaApp.handle(
      new Request("http://localhost/workflow/instances", {
        headers: {
          authorization: `Bearer ${tenantAlphaLoginBody.accessToken}`,
        },
      }),
    )

    expect(tenantAlphaListResponse.status).toBe(200)
    expect(await tenantAlphaListResponse.json()).toEqual({
      items: [
        {
          id: tenantAlphaInstance.id,
          definitionId: "workflow_definition_expense_v1",
          definitionKey: "expense-approval",
          definitionName: "Expense Approval",
          definitionVersion: 1,
          status: "running",
          currentNodeId: "manager-review",
          variables: {},
          startedByUserId: tenantAlphaFixture.userId,
          startedAt: expect.any(String),
          completedAt: null,
          terminatedAt: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ],
    })

    const crossTenantGetResponse = await defaultApp.handle(
      new Request(
        `http://localhost/workflow/instances/${tenantAlphaInstance.id}`,
        {
          headers: {
            authorization: `Bearer ${defaultLoginBody.accessToken}`,
          },
        },
      ),
    )

    expect(crossTenantGetResponse.status).toBe(404)
    expect(await crossTenantGetResponse.json()).toEqual({
      error: {
        code: "WORKFLOW_INSTANCE_NOT_FOUND",
        message: "Workflow instance not found",
        status: 404,
        details: {
          id: tenantAlphaInstance.id,
        },
      },
    })

    const defaultTodoResponse = await defaultApp.handle(
      new Request("http://localhost/workflow/tasks/todo", {
        headers: {
          authorization: `Bearer ${defaultLoginBody.accessToken}`,
        },
      }),
    )

    expect(defaultTodoResponse.status).toBe(200)
    expect(await defaultTodoResponse.json()).toEqual({
      items: [
        {
          id: expect.any(String),
          instanceId: defaultInstance.id,
          definitionId: "workflow_definition_expense_v1",
          nodeId: "manager-review",
          nodeName: "Manager Review",
          assignee: "role:manager",
          status: "todo",
          result: null,
          variables: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          completedAt: null,
        },
      ],
    })
  })

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
      new Request("http://localhost/system/operation-logs", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
            authorization: `Bearer ${loginBody.accessToken}`,
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
          authorization: `Bearer ${loginBody.accessToken}`,
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
      new Request(
        "http://localhost/system/operation-logs/export?category=auth",
        {
          headers: {
            authorization: `Bearer ${loginBody.accessToken}`,
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
      new Request("http://localhost/system/operation-logs/missing_log", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
      new Request("http://localhost/system/files", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
          authorization: `Bearer ${loginBody.accessToken}`,
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
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(createdFile)

    const downloadResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFile.id}/download`, {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(deleteResponse.status).toBe(204)

    const missingAfterDeleteResponse = await app.handle(
      new Request(`http://localhost/system/files/${createdFile.id}`, {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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

    const body = new FormData()
    body.set("note", "missing file")
    const response = await app.handle(
      new Request("http://localhost/system/files", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
      new Request("http://localhost/system/files", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
      new Request("http://localhost/system/notifications", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
            authorization: `Bearer ${loginBody.accessToken}`,
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
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(createNotificationSeedRecords()[0])

    const createResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
            authorization: `Bearer ${loginBody.accessToken}`,
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

    const listBeforeCreateResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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
          authorization: `Bearer ${loginBody.accessToken}`,
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
          authorization: `Bearer ${loginBody.accessToken}`,
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
      new Request("http://localhost/system/notifications", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
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

describe("loadServerConfig", () => {
  it("loads explicit environment values", () => {
    expect(
      loadServerConfig({
        APP_ENV: "production",
        PORT: "3100",
        LOG_LEVEL: "warn",
        CORS_ALLOWED_ORIGINS:
          "https://admin.example.com,https://ops.example.com",
        RATE_LIMIT_ENABLED: "true",
        RATE_LIMIT_WINDOW_MS: "120000",
        RATE_LIMIT_MAX_REQUESTS: "300",
      }),
    ).toEqual({
      env: "production",
      port: 3100,
      logLevel: "warn",
      corsAllowedOrigins: [
        "https://admin.example.com",
        "https://ops.example.com",
      ],
      rateLimitEnabled: true,
      rateLimitWindowMs: 120000,
      rateLimitMaxRequests: 300,
    })
  })

  it("throws on invalid port values", () => {
    expect(() =>
      loadServerConfig({
        PORT: "abc",
      }),
    ).toThrow("PORT must be an integer between 1 and 65535")
  })

  it("enables rate limit by default in production", () => {
    expect(
      loadServerConfig({
        APP_ENV: "production",
      }).rateLimitEnabled,
    ).toBe(true)
  })

  it("throws on invalid RATE_LIMIT_ENABLED values", () => {
    expect(() =>
      loadServerConfig({
        RATE_LIMIT_ENABLED: "yes",
      }),
    ).toThrow("RATE_LIMIT_ENABLED must be true or false")
  })
})

describe("resolveAccessTokenSecret", () => {
  it("requires ACCESS_TOKEN_SECRET outside test environments", () => {
    expect(() =>
      resolveAccessTokenSecret({
        APP_ENV: "development",
      }),
    ).toThrow("ACCESS_TOKEN_SECRET is required outside test environments")
  })

  it("allows a test fallback secret", () => {
    expect(
      resolveAccessTokenSecret({
        APP_ENV: "test",
      }),
    ).toBe("elysian-test-access-secret")
  })
})
