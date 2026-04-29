import {
  DEFAULT_TENANT_ID,
  type DatabaseClient,
  createDefaultWorkflowDefinitionSeedSpec,
} from "@elysian/persistence"
import type { WorkflowDefinitionRecord } from "@elysian/schema"

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
import type {
  CreateCustomerInput,
  CustomerRepository,
} from "../../modules/customer"
import type { WorkflowModuleOptions } from "../../modules/workflow"

export const testAccessTokenSecret = ["test", "access", "secret"].join("-")
export const testAdminPassword = ["admin", "123"].join("")
export const testInvalidPassword = ["wrong", "password"].join("-")

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

export const startWorkflowInstance = async (
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

export const claimWorkflowTask = async (
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

export const completeWorkflowTask = async (
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

export const cancelWorkflowInstance = async (
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

export const createWorkflowTestHarness = async (
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

export const createTenantContextRecorder = () => {
  const statements: string[] = []
  const db = {
    execute: async (statement: string) => {
      statements.push(statement)
      return []
    },
  } as unknown as DatabaseClient

  return { db, statements }
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

export const refreshCookiePrefix = `${["elysian", "refresh", "token"].join("_")}=`
export const tenantAdminPassword = ["tenant", "admin", "123"].join("-")

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

export const createWorkflowDefinitionSeedRecordFromDefault = (input: {
  key: string
  version: number
  id: string
  createdAt: string
}): WorkflowDefinitionRecord => {
  const definition = defaultWorkflowDefinitionSeedByKeyAndVersion.get(
    `${input.key}@${input.version}`,
  )

  if (!definition) {
    throw new Error(
      `Missing default workflow seed: ${input.key}@${input.version}`,
    )
  }

  return {
    id: input.id,
    key: definition.key,
    name: definition.name,
    version: definition.version,
    status: definition.status,
    definition:
      definition.definition as unknown as WorkflowDefinitionRecord["definition"],
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  }
}

export const createWorkflowDefinitionSeedRecord = (
  input: Omit<WorkflowDefinitionRecord, "updatedAt">,
): WorkflowDefinitionRecord => ({
  ...input,
  updatedAt: input.createdAt,
})

export const defaultWorkflowDefinitionSeedByKeyAndVersion = new Map(
  createDefaultWorkflowDefinitionSeedSpec().map((definition) => [
    `${definition.key}@${definition.version}`,
    definition,
  ]),
)

export const createWorkflowDefinitionSeedRecords =
  (): WorkflowDefinitionRecord[] => [
    createWorkflowDefinitionSeedRecordFromDefault({
      key: "expense-approval",
      version: 1,
      id: "workflow_definition_expense_v1",
      createdAt: "2026-04-21T02:00:00.000Z",
    }),
  ]

export const createClaimableWorkflowDefinitionSeedRecords =
  (): WorkflowDefinitionRecord[] => [
    createWorkflowDefinitionSeedRecord({
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
    }),
  ]

export const createConditionalWorkflowDefinitionSeedRecords =
  (): WorkflowDefinitionRecord[] => [
    createWorkflowDefinitionSeedRecordFromDefault({
      key: "expense-approval-condition",
      version: 1,
      id: "workflow_definition_expense_condition_v1",
      createdAt: "2026-04-21T03:00:00.000Z",
    }),
  ]

export const workflowDefinitionPermissionCodes = [
  "workflow:definition:list",
  "workflow:definition:create",
  "workflow:definition:update",
] as const

export const workflowRuntimePermissionCodes = [
  "workflow:instance:list",
  "workflow:instance:start",
  "workflow:instance:cancel",
  "workflow:task:list",
  "workflow:task:claim",
  "workflow:task:complete",
] as const

export const workflowAllPermissionCodes = [
  ...workflowDefinitionPermissionCodes,
  ...workflowRuntimePermissionCodes,
] as const

export const toCookieHeader = (setCookie: string | null) => {
  if (!setCookie) {
    throw new Error("Missing set-cookie header")
  }

  return setCookie.split(";")[0] ?? setCookie
}
