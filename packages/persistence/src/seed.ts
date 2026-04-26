import { and, eq, inArray } from "drizzle-orm"

import { type DatabaseClient, createDatabaseClient } from "./client"
import {
  dictionaryItems,
  dictionaryTypes,
  menus,
  permissions,
  roleMenus,
  rolePermissions,
  roles,
  userRoles,
  users,
} from "./schema"
import {
  DEFAULT_TENANT_ID,
  getTenantByCode,
  insertTenant,
  resetTenantContext,
  setTenantContext,
} from "./tenant"

export interface DefaultAuthSeedConfig {
  adminUsername: string
  adminPassword: string
  adminDisplayName: string
}

const defaultAdminPassword = ["admin", "123"].join("")
const PRODUCTION_ENVS = new Set(["production"])

export interface DefaultAuthSeedSpec {
  roles: Array<{
    id: string
    code: string
    name: string
    description: string
    status: "active" | "disabled"
    isSystem: boolean
  }>
  permissions: Array<{
    id: string
    code: string
    module: string
    resource: string
    action: string
    name: string
    description: string
  }>
  menus: Array<{
    id: string
    parentId: string | null
    type: "directory" | "menu" | "button"
    code: string
    name: string
    path: string | null
    component: string | null
    icon: string | null
    sort: number
    isVisible: boolean
    status: "active" | "disabled"
    permissionCode: string | null
  }>
  dictionaryTypes: Array<{
    id: string
    code: string
    name: string
    description: string | null
    status: "active" | "disabled"
  }>
  dictionaryItems: Array<{
    id: string
    typeId: string
    value: string
    label: string
    sort: number
    isDefault: boolean
    status: "active" | "disabled"
  }>
  adminUser: {
    id: string
    username: string
    displayName: string
    password: string
    status: "active" | "disabled"
    isSuperAdmin: boolean
  }
  userRoles: Array<{
    userId: string
    roleId: string
  }>
  rolePermissions: Array<{
    roleId: string
    permissionId: string
  }>
  roleMenus: Array<{
    roleId: string
    menuId: string
  }>
}

type DefaultRoleSeed = DefaultAuthSeedSpec["roles"][number]
type DefaultPermissionSeed = DefaultAuthSeedSpec["permissions"][number]
type DefaultMenuSeed = DefaultAuthSeedSpec["menus"][number]
type DefaultDictionaryTypeSeed = DefaultAuthSeedSpec["dictionaryTypes"][number]
type DefaultDictionaryItemSeed = DefaultAuthSeedSpec["dictionaryItems"][number]

export interface TenantBootstrapSeedSpec {
  roles: Array<Omit<DefaultRoleSeed, "id">>
  permissions: Array<Omit<DefaultPermissionSeed, "id">>
  menus: Array<
    Omit<DefaultMenuSeed, "id" | "parentId"> & { parentCode: string | null }
  >
  dictionaryTypes: Array<Omit<DefaultDictionaryTypeSeed, "id">>
  dictionaryItems: Array<
    Omit<DefaultDictionaryItemSeed, "id" | "typeId"> & { typeCode: string }
  >
  adminUser: Omit<DefaultAuthSeedSpec["adminUser"], "id" | "isSuperAdmin"> & {
    isSuperAdmin: boolean
  }
  userRoles: Array<{
    username: string
    roleCode: string
  }>
  rolePermissions: Array<{
    roleCode: string
    permissionCode: string
  }>
  roleMenus: Array<{
    roleCode: string
    menuCode: string
  }>
}

export interface TenantInitOptions {
  tenantCode: string
  tenantName: string
  tenantStatus?: "active" | "suspended"
  adminUsername?: string
  adminPassword: string
  adminDisplayName?: string
}

interface NormalizedTenantInitOptions {
  tenantCode: string
  tenantName: string
  tenantStatus: "active" | "suspended"
  adminUsername: string
  adminPassword: string
  adminDisplayName: string
}

const defaultAuthSeedIds = {
  roles: {
    admin: "00000000-0000-0000-0000-000000000001",
    operator: "00000000-0000-0000-0000-000000000002",
  },
  permissions: {
    systemUserList: "00000000-0000-0000-0000-000000000101",
    systemUserCreate: "00000000-0000-0000-0000-000000000102",
    systemUserUpdate: "00000000-0000-0000-0000-000000000103",
    systemUserResetPassword: "00000000-0000-0000-0000-000000000104",
    systemRoleList: "00000000-0000-0000-0000-000000000111",
    systemRoleCreate: "00000000-0000-0000-0000-000000000112",
    systemRoleUpdate: "00000000-0000-0000-0000-000000000113",
    systemMenuList: "00000000-0000-0000-0000-000000000121",
    systemMenuUpdate: "00000000-0000-0000-0000-000000000122",
    systemDepartmentList: "00000000-0000-0000-0000-000000000131",
    systemDepartmentCreate: "00000000-0000-0000-0000-000000000132",
    systemDepartmentUpdate: "00000000-0000-0000-0000-000000000133",
    systemDictionaryList: "00000000-0000-0000-0000-000000000141",
    systemDictionaryCreate: "00000000-0000-0000-0000-000000000142",
    systemDictionaryUpdate: "00000000-0000-0000-0000-000000000143",
    systemSettingList: "00000000-0000-0000-0000-000000000151",
    systemSettingCreate: "00000000-0000-0000-0000-000000000152",
    systemSettingUpdate: "00000000-0000-0000-0000-000000000153",
    systemOperationLogList: "00000000-0000-0000-0000-000000000161",
    systemOperationLogExport: "00000000-0000-0000-0000-000000000162",
    systemFileList: "00000000-0000-0000-0000-000000000171",
    systemFileUpload: "00000000-0000-0000-0000-000000000172",
    systemFileDownload: "00000000-0000-0000-0000-000000000173",
    systemFileDelete: "00000000-0000-0000-0000-000000000174",
    systemNotificationList: "00000000-0000-0000-0000-000000000181",
    systemNotificationCreate: "00000000-0000-0000-0000-000000000182",
    systemNotificationUpdate: "00000000-0000-0000-0000-000000000183",
    systemTenantList: "00000000-0000-0000-0000-000000000191",
    systemTenantCreate: "00000000-0000-0000-0000-000000000192",
    systemTenantUpdate: "00000000-0000-0000-0000-000000000193",
    workflowDefinitionList: "00000000-0000-0000-0000-000000000194",
    workflowDefinitionCreate: "00000000-0000-0000-0000-000000000195",
    workflowDefinitionUpdate: "00000000-0000-0000-0000-000000000196",
    workflowInstanceList: "00000000-0000-0000-0000-000000000197",
    workflowInstanceStart: "00000000-0000-0000-0000-000000000198",
    workflowInstanceCancel: "00000000-0000-0000-0000-000000000199",
    workflowTaskList: "00000000-0000-0000-0000-0000000001a0",
    workflowTaskComplete: "00000000-0000-0000-0000-0000000001a1",
    workflowTaskClaim: "00000000-0000-0000-0000-0000000001a2",
    customerList: "00000000-0000-0000-0000-000000000201",
    customerCreate: "00000000-0000-0000-0000-000000000202",
    customerUpdate: "00000000-0000-0000-0000-000000000203",
    customerDelete: "00000000-0000-0000-0000-000000000204",
  },
  menus: {
    systemRoot: "00000000-0000-0000-0000-000000000301",
    systemUsers: "00000000-0000-0000-0000-000000000302",
    systemRoles: "00000000-0000-0000-0000-000000000303",
    systemMenus: "00000000-0000-0000-0000-000000000304",
    systemDepartments: "00000000-0000-0000-0000-000000000305",
    systemDictionaries: "00000000-0000-0000-0000-000000000306",
    systemSettings: "00000000-0000-0000-0000-000000000307",
    systemOperationLogs: "00000000-0000-0000-0000-000000000308",
    systemFiles: "00000000-0000-0000-0000-000000000309",
    customerRoot: "00000000-0000-0000-0000-000000000310",
    customerList: "00000000-0000-0000-0000-000000000311",
    systemNotifications: "00000000-0000-0000-0000-000000000312",
    systemTenants: "00000000-0000-0000-0000-000000000313",
    workflowRoot: "00000000-0000-0000-0000-000000000314",
    workflowDefinitions: "00000000-0000-0000-0000-000000000315",
  },
  dictionaryTypes: {
    customerStatus: "00000000-0000-0000-0000-000000000501",
  },
  dictionaryItems: {
    customerStatusActive: "00000000-0000-0000-0000-000000000601",
    customerStatusInactive: "00000000-0000-0000-0000-000000000602",
  },
  users: {
    admin: "00000000-0000-0000-0000-000000000401",
  },
} as const

const defaultAuthSeedConfig: DefaultAuthSeedConfig = {
  adminUsername: "admin",
  adminPassword: defaultAdminPassword,
  adminDisplayName: "Administrator",
}

export const createDefaultAuthSeedConfig = (
  env: Record<string, string | undefined> = process.env,
): DefaultAuthSeedConfig => {
  const resolved = {
    adminUsername:
      env.ELYSIAN_ADMIN_USERNAME ?? defaultAuthSeedConfig.adminUsername,
    adminPassword:
      env.ELYSIAN_ADMIN_PASSWORD ?? defaultAuthSeedConfig.adminPassword,
    adminDisplayName:
      env.ELYSIAN_ADMIN_DISPLAY_NAME ?? defaultAuthSeedConfig.adminDisplayName,
  }
  const appEnv = (env.APP_ENV ?? env.NODE_ENV ?? "development").trim()

  if (
    PRODUCTION_ENVS.has(appEnv) &&
    resolved.adminPassword === defaultAdminPassword
  ) {
    throw new Error(
      "ELYSIAN_ADMIN_PASSWORD must be explicitly set in production before running the default auth seed",
    )
  }

  return resolved
}

export const createDefaultAuthSeedSpec = (
  config: Partial<DefaultAuthSeedConfig> = {},
): DefaultAuthSeedSpec => {
  const resolved = {
    ...defaultAuthSeedConfig,
    ...config,
  }

  return {
    roles: [
      {
        id: defaultAuthSeedIds.roles.admin,
        code: "admin",
        name: "Admin",
        description: "System administrator with full platform access",
        status: "active",
        isSystem: true,
      },
      {
        id: defaultAuthSeedIds.roles.operator,
        code: "operator",
        name: "Operator",
        description: "Limited platform operator role",
        status: "active",
        isSystem: true,
      },
    ],
    permissions: [
      {
        id: defaultAuthSeedIds.permissions.systemUserList,
        code: "system:user:list",
        module: "system",
        resource: "user",
        action: "list",
        name: "List system users",
        description: "View system user list",
      },
      {
        id: defaultAuthSeedIds.permissions.systemUserCreate,
        code: "system:user:create",
        module: "system",
        resource: "user",
        action: "create",
        name: "Create system user",
        description: "Create system user records",
      },
      {
        id: defaultAuthSeedIds.permissions.systemUserUpdate,
        code: "system:user:update",
        module: "system",
        resource: "user",
        action: "update",
        name: "Update system user",
        description: "Update system user records",
      },
      {
        id: defaultAuthSeedIds.permissions.systemUserResetPassword,
        code: "system:user:reset-password",
        module: "system",
        resource: "user",
        action: "reset-password",
        name: "Reset system user password",
        description: "Reset system user passwords",
      },
      {
        id: defaultAuthSeedIds.permissions.systemRoleList,
        code: "system:role:list",
        module: "system",
        resource: "role",
        action: "list",
        name: "List system roles",
        description: "View system role list",
      },
      {
        id: defaultAuthSeedIds.permissions.systemRoleCreate,
        code: "system:role:create",
        module: "system",
        resource: "role",
        action: "create",
        name: "Create system role",
        description: "Create system roles",
      },
      {
        id: defaultAuthSeedIds.permissions.systemRoleUpdate,
        code: "system:role:update",
        module: "system",
        resource: "role",
        action: "update",
        name: "Update system role",
        description: "Update system roles and assignments",
      },
      {
        id: defaultAuthSeedIds.permissions.systemMenuList,
        code: "system:menu:list",
        module: "system",
        resource: "menu",
        action: "list",
        name: "List system menus",
        description: "View system menu tree",
      },
      {
        id: defaultAuthSeedIds.permissions.systemMenuUpdate,
        code: "system:menu:update",
        module: "system",
        resource: "menu",
        action: "update",
        name: "Update system menus",
        description: "Create and update system menus",
      },
      {
        id: defaultAuthSeedIds.permissions.systemDepartmentList,
        code: "system:department:list",
        module: "system",
        resource: "department",
        action: "list",
        name: "List system departments",
        description: "View system department tree",
      },
      {
        id: defaultAuthSeedIds.permissions.systemDepartmentCreate,
        code: "system:department:create",
        module: "system",
        resource: "department",
        action: "create",
        name: "Create system department",
        description: "Create system departments",
      },
      {
        id: defaultAuthSeedIds.permissions.systemDepartmentUpdate,
        code: "system:department:update",
        module: "system",
        resource: "department",
        action: "update",
        name: "Update system department",
        description: "Update system departments and user assignments",
      },
      {
        id: defaultAuthSeedIds.permissions.systemDictionaryList,
        code: "system:dictionary:list",
        module: "system",
        resource: "dictionary",
        action: "list",
        name: "List system dictionaries",
        description: "View dictionary types and items",
      },
      {
        id: defaultAuthSeedIds.permissions.systemDictionaryCreate,
        code: "system:dictionary:create",
        module: "system",
        resource: "dictionary",
        action: "create",
        name: "Create system dictionaries",
        description: "Create dictionary types and items",
      },
      {
        id: defaultAuthSeedIds.permissions.systemDictionaryUpdate,
        code: "system:dictionary:update",
        module: "system",
        resource: "dictionary",
        action: "update",
        name: "Update system dictionaries",
        description: "Update dictionary types and items",
      },
      {
        id: defaultAuthSeedIds.permissions.systemSettingList,
        code: "system:setting:list",
        module: "system",
        resource: "setting",
        action: "list",
        name: "List system settings",
        description: "View system settings",
      },
      {
        id: defaultAuthSeedIds.permissions.systemSettingCreate,
        code: "system:setting:create",
        module: "system",
        resource: "setting",
        action: "create",
        name: "Create system settings",
        description: "Create system settings",
      },
      {
        id: defaultAuthSeedIds.permissions.systemSettingUpdate,
        code: "system:setting:update",
        module: "system",
        resource: "setting",
        action: "update",
        name: "Update system settings",
        description: "Update system settings",
      },
      {
        id: defaultAuthSeedIds.permissions.systemOperationLogList,
        code: "system:operation-log:list",
        module: "system",
        resource: "operation-log",
        action: "list",
        name: "List operation logs",
        description: "View and filter operation logs",
      },
      {
        id: defaultAuthSeedIds.permissions.systemOperationLogExport,
        code: "system:operation-log:export",
        module: "system",
        resource: "operation-log",
        action: "export",
        name: "Export operation logs",
        description: "Export operation logs as CSV",
      },
      {
        id: defaultAuthSeedIds.permissions.systemFileList,
        code: "system:file:list",
        module: "system",
        resource: "file",
        action: "list",
        name: "List files",
        description: "View uploaded file records",
      },
      {
        id: defaultAuthSeedIds.permissions.systemFileUpload,
        code: "system:file:upload",
        module: "system",
        resource: "file",
        action: "upload",
        name: "Upload files",
        description: "Upload files into platform storage",
      },
      {
        id: defaultAuthSeedIds.permissions.systemFileDownload,
        code: "system:file:download",
        module: "system",
        resource: "file",
        action: "download",
        name: "Download files",
        description: "Download uploaded files",
      },
      {
        id: defaultAuthSeedIds.permissions.systemFileDelete,
        code: "system:file:delete",
        module: "system",
        resource: "file",
        action: "delete",
        name: "Delete files",
        description: "Delete uploaded files",
      },
      {
        id: defaultAuthSeedIds.permissions.systemNotificationList,
        code: "system:notification:list",
        module: "system",
        resource: "notification",
        action: "list",
        name: "List notifications",
        description: "View station notifications",
      },
      {
        id: defaultAuthSeedIds.permissions.systemNotificationCreate,
        code: "system:notification:create",
        module: "system",
        resource: "notification",
        action: "create",
        name: "Create notifications",
        description: "Create station notifications",
      },
      {
        id: defaultAuthSeedIds.permissions.systemNotificationUpdate,
        code: "system:notification:update",
        module: "system",
        resource: "notification",
        action: "update",
        name: "Update notifications",
        description: "Mark notifications as read",
      },
      {
        id: defaultAuthSeedIds.permissions.systemTenantList,
        code: "system:tenant:list",
        module: "system",
        resource: "tenant",
        action: "list",
        name: "List tenants",
        description: "View tenant records",
      },
      {
        id: defaultAuthSeedIds.permissions.systemTenantCreate,
        code: "system:tenant:create",
        module: "system",
        resource: "tenant",
        action: "create",
        name: "Create tenant",
        description: "Create tenant records",
      },
      {
        id: defaultAuthSeedIds.permissions.systemTenantUpdate,
        code: "system:tenant:update",
        module: "system",
        resource: "tenant",
        action: "update",
        name: "Update tenant",
        description: "Update tenant records",
      },
      {
        id: defaultAuthSeedIds.permissions.workflowDefinitionList,
        code: "workflow:definition:list",
        module: "workflow",
        resource: "definition",
        action: "list",
        name: "List workflow definitions",
        description: "View workflow definitions",
      },
      {
        id: defaultAuthSeedIds.permissions.workflowDefinitionCreate,
        code: "workflow:definition:create",
        module: "workflow",
        resource: "definition",
        action: "create",
        name: "Create workflow definition",
        description: "Create workflow definitions",
      },
      {
        id: defaultAuthSeedIds.permissions.workflowDefinitionUpdate,
        code: "workflow:definition:update",
        module: "workflow",
        resource: "definition",
        action: "update",
        name: "Update workflow definition",
        description: "Publish new workflow definition versions",
      },
      {
        id: defaultAuthSeedIds.permissions.workflowInstanceList,
        code: "workflow:instance:list",
        module: "workflow",
        resource: "instance",
        action: "list",
        name: "List workflow instances",
        description: "View workflow instances and instance detail",
      },
      {
        id: defaultAuthSeedIds.permissions.workflowInstanceStart,
        code: "workflow:instance:start",
        module: "workflow",
        resource: "instance",
        action: "start",
        name: "Start workflow instance",
        description: "Start workflow instances from active definitions",
      },
      {
        id: defaultAuthSeedIds.permissions.workflowInstanceCancel,
        code: "workflow:instance:cancel",
        module: "workflow",
        resource: "instance",
        action: "cancel",
        name: "Cancel workflow instance",
        description: "Cancel running workflow instances",
      },
      {
        id: defaultAuthSeedIds.permissions.workflowTaskList,
        code: "workflow:task:list",
        module: "workflow",
        resource: "task",
        action: "list",
        name: "List workflow tasks",
        description: "View workflow todo and done task lists",
      },
      {
        id: defaultAuthSeedIds.permissions.workflowTaskClaim,
        code: "workflow:task:claim",
        module: "workflow",
        resource: "task",
        action: "claim",
        name: "Claim workflow task",
        description: "Claim workflow tasks for the current user",
      },
      {
        id: defaultAuthSeedIds.permissions.workflowTaskComplete,
        code: "workflow:task:complete",
        module: "workflow",
        resource: "task",
        action: "complete",
        name: "Complete workflow task",
        description: "Approve or reject workflow tasks",
      },
      {
        id: defaultAuthSeedIds.permissions.customerList,
        code: "customer:customer:list",
        module: "customer",
        resource: "customer",
        action: "list",
        name: "List customers",
        description: "View customer list",
      },
      {
        id: defaultAuthSeedIds.permissions.customerCreate,
        code: "customer:customer:create",
        module: "customer",
        resource: "customer",
        action: "create",
        name: "Create customer",
        description: "Create customer records",
      },
      {
        id: defaultAuthSeedIds.permissions.customerUpdate,
        code: "customer:customer:update",
        module: "customer",
        resource: "customer",
        action: "update",
        name: "Update customer",
        description: "Update customer records",
      },
      {
        id: defaultAuthSeedIds.permissions.customerDelete,
        code: "customer:customer:delete",
        module: "customer",
        resource: "customer",
        action: "delete",
        name: "Delete customer",
        description: "Delete customer records",
      },
    ],
    menus: [
      {
        id: defaultAuthSeedIds.menus.systemRoot,
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
      },
      {
        id: defaultAuthSeedIds.menus.systemUsers,
        parentId: defaultAuthSeedIds.menus.systemRoot,
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
      },
      {
        id: defaultAuthSeedIds.menus.systemRoles,
        parentId: defaultAuthSeedIds.menus.systemRoot,
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
      },
      {
        id: defaultAuthSeedIds.menus.systemMenus,
        parentId: defaultAuthSeedIds.menus.systemRoot,
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
      },
      {
        id: defaultAuthSeedIds.menus.systemDepartments,
        parentId: defaultAuthSeedIds.menus.systemRoot,
        type: "menu",
        code: "system-departments",
        name: "Departments",
        path: "/system/departments",
        component: "system/departments/index",
        icon: "apartment",
        sort: 14,
        isVisible: true,
        status: "active",
        permissionCode: "system:department:list",
      },
      {
        id: defaultAuthSeedIds.menus.systemDictionaries,
        parentId: defaultAuthSeedIds.menus.systemRoot,
        type: "menu",
        code: "system-dictionaries",
        name: "Dictionaries",
        path: "/system/dictionaries",
        component: "system/dictionaries/index",
        icon: "book",
        sort: 15,
        isVisible: true,
        status: "active",
        permissionCode: "system:dictionary:list",
      },
      {
        id: defaultAuthSeedIds.menus.systemSettings,
        parentId: defaultAuthSeedIds.menus.systemRoot,
        type: "menu",
        code: "system-settings",
        name: "Settings",
        path: "/system/settings",
        component: "system/settings/index",
        icon: "tool",
        sort: 16,
        isVisible: true,
        status: "active",
        permissionCode: "system:setting:list",
      },
      {
        id: defaultAuthSeedIds.menus.systemOperationLogs,
        parentId: defaultAuthSeedIds.menus.systemRoot,
        type: "menu",
        code: "system-operation-logs",
        name: "Operation Logs",
        path: "/system/operation-logs",
        component: "system/operation-logs/index",
        icon: "file",
        sort: 17,
        isVisible: true,
        status: "active",
        permissionCode: "system:operation-log:list",
      },
      {
        id: defaultAuthSeedIds.menus.systemFiles,
        parentId: defaultAuthSeedIds.menus.systemRoot,
        type: "menu",
        code: "system-files",
        name: "Files",
        path: "/system/files",
        component: "system/files/index",
        icon: "attachment",
        sort: 18,
        isVisible: true,
        status: "active",
        permissionCode: "system:file:list",
      },
      {
        id: defaultAuthSeedIds.menus.systemNotifications,
        parentId: defaultAuthSeedIds.menus.systemRoot,
        type: "menu",
        code: "system-notifications",
        name: "Notifications",
        path: "/system/notifications",
        component: "system/notifications/index",
        icon: "notification",
        sort: 19,
        isVisible: true,
        status: "active",
        permissionCode: "system:notification:list",
      },
      {
        id: defaultAuthSeedIds.menus.systemTenants,
        parentId: defaultAuthSeedIds.menus.systemRoot,
        type: "menu",
        code: "system-tenants",
        name: "Tenants",
        path: "/system/tenants",
        component: "system/tenants/index",
        icon: "cluster",
        sort: 20,
        isVisible: true,
        status: "active",
        permissionCode: "system:tenant:list",
      },
      {
        id: defaultAuthSeedIds.menus.workflowRoot,
        parentId: null,
        type: "directory",
        code: "workflow-root",
        name: "Workflow",
        path: "/workflow",
        component: null,
        icon: "share",
        sort: 21,
        isVisible: true,
        status: "active",
        permissionCode: null,
      },
      {
        id: defaultAuthSeedIds.menus.workflowDefinitions,
        parentId: defaultAuthSeedIds.menus.workflowRoot,
        type: "menu",
        code: "workflow-definitions",
        name: "Definitions",
        path: "/workflow/definitions",
        component: "workflow/definitions/index",
        icon: "tree-square-dot",
        sort: 22,
        isVisible: true,
        status: "active",
        permissionCode: "workflow:definition:list",
      },
      {
        id: defaultAuthSeedIds.menus.customerRoot,
        parentId: null,
        type: "directory",
        code: "customer-root",
        name: "Customer",
        path: "/customer",
        component: null,
        icon: "briefcase",
        sort: 23,
        isVisible: true,
        status: "active",
        permissionCode: null,
      },
      {
        id: defaultAuthSeedIds.menus.customerList,
        parentId: defaultAuthSeedIds.menus.customerRoot,
        type: "menu",
        code: "customer-list",
        name: "Customers",
        path: "/customers",
        component: "customer/index",
        icon: "briefcase",
        sort: 24,
        isVisible: true,
        status: "active",
        permissionCode: "customer:customer:list",
      },
    ],
    dictionaryTypes: [
      {
        id: defaultAuthSeedIds.dictionaryTypes.customerStatus,
        code: "customer_status",
        name: "Customer Status",
        description: "Status options for customer records",
        status: "active",
      },
    ],
    dictionaryItems: [
      {
        id: defaultAuthSeedIds.dictionaryItems.customerStatusActive,
        typeId: defaultAuthSeedIds.dictionaryTypes.customerStatus,
        value: "active",
        label: "active",
        sort: 10,
        isDefault: true,
        status: "active",
      },
      {
        id: defaultAuthSeedIds.dictionaryItems.customerStatusInactive,
        typeId: defaultAuthSeedIds.dictionaryTypes.customerStatus,
        value: "inactive",
        label: "inactive",
        sort: 20,
        isDefault: false,
        status: "active",
      },
    ],
    adminUser: {
      id: defaultAuthSeedIds.users.admin,
      username: resolved.adminUsername,
      displayName: resolved.adminDisplayName,
      password: resolved.adminPassword,
      status: "active",
      isSuperAdmin: true,
    },
    userRoles: [
      {
        userId: defaultAuthSeedIds.users.admin,
        roleId: defaultAuthSeedIds.roles.admin,
      },
    ],
    rolePermissions: [
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemUserList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemUserCreate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemUserUpdate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemUserResetPassword,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemRoleList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemRoleCreate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemRoleUpdate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemMenuList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemMenuUpdate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemDepartmentList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemDepartmentCreate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemDepartmentUpdate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemDictionaryList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemDictionaryCreate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemDictionaryUpdate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemSettingList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemSettingCreate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemSettingUpdate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemOperationLogList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemOperationLogExport,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemFileList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemFileUpload,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemFileDownload,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemFileDelete,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemNotificationList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemNotificationCreate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemNotificationUpdate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemTenantList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemTenantCreate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.systemTenantUpdate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.workflowDefinitionList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.workflowDefinitionCreate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.workflowDefinitionUpdate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.workflowInstanceList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.workflowInstanceStart,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.workflowInstanceCancel,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.workflowTaskList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.workflowTaskClaim,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.workflowTaskComplete,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.customerList,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.customerCreate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.customerUpdate,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        permissionId: defaultAuthSeedIds.permissions.customerDelete,
      },
    ],
    roleMenus: [
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.systemRoot,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.systemUsers,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.systemRoles,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.systemMenus,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.systemDepartments,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.systemDictionaries,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.systemSettings,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.systemOperationLogs,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.systemFiles,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.systemNotifications,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.systemTenants,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.workflowRoot,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.workflowDefinitions,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.customerRoot,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.customerList,
      },
    ],
  }
}

export const createTenantBootstrapSeedSpec = (
  config: Partial<DefaultAuthSeedConfig> = {},
): TenantBootstrapSeedSpec => {
  const base = createDefaultAuthSeedSpec(config)
  const roleCodeById = new Map(base.roles.map((role) => [role.id, role.code]))
  const permissionCodeById = new Map(
    base.permissions.map((permission) => [permission.id, permission.code]),
  )
  const menuCodeById = new Map(base.menus.map((menu) => [menu.id, menu.code]))
  const dictionaryTypeCodeById = new Map(
    base.dictionaryTypes.map((type) => [type.id, type.code]),
  )
  const permissions = base.permissions
    .filter((permission) => !permission.code.startsWith("system:tenant:"))
    .map(({ id: _id, ...permission }) => permission)
  const permissionCodes = new Set(
    permissions.map((permission) => permission.code),
  )
  const menus = base.menus
    .filter((menu) => menu.code !== "system-tenants")
    .map(({ id: _id, parentId, ...menu }) => ({
      ...menu,
      parentCode: parentId ? (menuCodeById.get(parentId) ?? null) : null,
    }))
    .filter(
      (menu) =>
        menu.permissionCode === null ||
        permissionCodes.has(menu.permissionCode),
    )
  const menuCodes = new Set(menus.map((menu) => menu.code))

  return {
    roles: base.roles.map(({ id: _id, ...role }) => role),
    permissions,
    menus,
    dictionaryTypes: base.dictionaryTypes.map(({ id: _id, ...type }) => type),
    dictionaryItems: base.dictionaryItems.map(
      ({ id: _id, typeId, ...item }) => ({
        ...item,
        typeCode:
          dictionaryTypeCodeById.get(typeId) ??
          throwMissingSeedRelation("dictionary type", typeId),
      }),
    ),
    adminUser: {
      username: base.adminUser.username,
      displayName: base.adminUser.displayName,
      password: base.adminUser.password,
      status: base.adminUser.status,
      isSuperAdmin: false,
    },
    userRoles: base.userRoles.map((assignment) => ({
      username: base.adminUser.username,
      roleCode:
        roleCodeById.get(assignment.roleId) ??
        throwMissingSeedRelation("role", assignment.roleId),
    })),
    rolePermissions: base.rolePermissions
      .map((assignment) => ({
        roleCode:
          roleCodeById.get(assignment.roleId) ??
          throwMissingSeedRelation("role", assignment.roleId),
        permissionCode:
          permissionCodeById.get(assignment.permissionId) ??
          throwMissingSeedRelation("permission", assignment.permissionId),
      }))
      .filter((assignment) => permissionCodes.has(assignment.permissionCode)),
    roleMenus: base.roleMenus
      .map((assignment) => ({
        roleCode:
          roleCodeById.get(assignment.roleId) ??
          throwMissingSeedRelation("role", assignment.roleId),
        menuCode:
          menuCodeById.get(assignment.menuId) ??
          throwMissingSeedRelation("menu", assignment.menuId),
      }))
      .filter((assignment) => menuCodes.has(assignment.menuCode)),
  }
}

export const normalizeTenantInitOptions = (
  input: TenantInitOptions,
): NormalizedTenantInitOptions => {
  const tenantCode = input.tenantCode.trim()
  const tenantName = input.tenantName.trim()
  const adminUsername = (input.adminUsername ?? "admin").trim()
  const adminPassword = input.adminPassword.trim()
  const adminDisplayName = (
    input.adminDisplayName ?? "Tenant Administrator"
  ).trim()

  if (!tenantCode) {
    throw new Error("tenantCode is required")
  }

  if (!tenantName) {
    throw new Error("tenantName is required")
  }

  if (!adminUsername) {
    throw new Error("adminUsername is required")
  }

  if (!adminPassword) {
    throw new Error("adminPassword is required")
  }

  if (!adminDisplayName) {
    throw new Error("adminDisplayName is required")
  }

  return {
    tenantCode,
    tenantName,
    tenantStatus: input.tenantStatus ?? "active",
    adminUsername,
    adminPassword,
    adminDisplayName,
  }
}

export const seedDefaultAuthData = async (
  db: DatabaseClient,
  config: Partial<DefaultAuthSeedConfig> = {},
) => {
  const spec = createDefaultAuthSeedSpec(config)
  const tid = DEFAULT_TENANT_ID

  return withTenantSeedContext(db, tid, async () => {
    await db
      .insert(roles)
      .values(spec.roles.map((role) => ({ ...role, tenantId: tid })))
      .onConflictDoNothing({ target: [roles.tenantId, roles.code] })
    await db
      .insert(permissions)
      .values(
        spec.permissions.map((permission) => ({
          ...permission,
          tenantId: tid,
        })),
      )
      .onConflictDoNothing({
        target: [permissions.tenantId, permissions.code],
      })
    await db
      .insert(menus)
      .values(spec.menus.map((menu) => ({ ...menu, tenantId: tid })))
      .onConflictDoNothing({ target: [menus.tenantId, menus.code] })
    await db
      .insert(dictionaryTypes)
      .values(spec.dictionaryTypes.map((type) => ({ ...type, tenantId: tid })))
      .onConflictDoNothing({
        target: [dictionaryTypes.tenantId, dictionaryTypes.code],
      })
    await db
      .insert(dictionaryItems)
      .values(spec.dictionaryItems.map((item) => ({ ...item, tenantId: tid })))
      .onConflictDoNothing({
        target: [dictionaryItems.typeId, dictionaryItems.value],
      })

    const existingAdmin = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.tenantId, tid),
          eq(users.username, spec.adminUser.username),
        ),
      )
      .limit(1)

    if (!existingAdmin[0]) {
      const adminPasswordHash = await Bun.password.hash(spec.adminUser.password)

      await db.insert(users).values({
        id: spec.adminUser.id,
        tenantId: tid,
        username: spec.adminUser.username,
        displayName: spec.adminUser.displayName,
        passwordHash: adminPasswordHash,
        status: spec.adminUser.status,
        isSuperAdmin: spec.adminUser.isSuperAdmin,
      })
    }

    await db
      .insert(userRoles)
      .values(spec.userRoles)
      .onConflictDoNothing({ target: [userRoles.userId, userRoles.roleId] })
    await db
      .insert(rolePermissions)
      .values(spec.rolePermissions)
      .onConflictDoNothing({
        target: [rolePermissions.roleId, rolePermissions.permissionId],
      })
    await db
      .insert(roleMenus)
      .values(spec.roleMenus)
      .onConflictDoNothing({ target: [roleMenus.roleId, roleMenus.menuId] })

    return {
      adminUsername: spec.adminUser.username,
      insertedAdmin: !existingAdmin[0],
    }
  })
}

export const initializeTenant = async (
  db: DatabaseClient,
  input: TenantInitOptions,
) => {
  const options = normalizeTenantInitOptions(input)
  const existingTenant = await getTenantByCode(db, options.tenantCode)

  if (
    existingTenant?.id === DEFAULT_TENANT_ID ||
    options.tenantCode === "default"
  ) {
    throw new Error(
      "Default tenant must be initialized with bun run db:seed, not tenant:init",
    )
  }

  const tenant =
    existingTenant ??
    (await insertTenant(db, {
      code: options.tenantCode,
      name: options.tenantName,
      status: options.tenantStatus,
    }))
  const spec = createTenantBootstrapSeedSpec({
    adminUsername: options.adminUsername,
    adminPassword: options.adminPassword,
    adminDisplayName: options.adminDisplayName,
  })
  const seedResult = await seedTenantBootstrapData(db, tenant.id, spec)

  return {
    tenantId: tenant.id,
    tenantCode: tenant.code,
    tenantName: tenant.name,
    tenantStatus: tenant.status,
    createdTenant: !existingTenant,
    insertedAdmin: seedResult.insertedAdmin,
    adminUsername: seedResult.adminUsername,
  }
}

export const runDefaultSeed = async (
  env: Record<string, string | undefined> = process.env,
) => {
  const db = createDatabaseClient(env)
  try {
    const config = createDefaultAuthSeedConfig(env)
    const result = await seedDefaultAuthData(db, config)

    console.log(
      `[elysian] default auth seed complete (admin=${result.adminUsername}, inserted=${result.insertedAdmin})`,
    )
  } finally {
    await db.$client.end()
  }
}

const seedTenantBootstrapData = async (
  db: DatabaseClient,
  tenantId: string,
  spec: TenantBootstrapSeedSpec,
) =>
  withTenantSeedContext(db, tenantId, async () => {
    await db
      .insert(roles)
      .values(spec.roles.map((role) => ({ ...role, tenantId })))
      .onConflictDoNothing({ target: [roles.tenantId, roles.code] })
    await db
      .insert(permissions)
      .values(
        spec.permissions.map((permission) => ({
          ...permission,
          tenantId,
        })),
      )
      .onConflictDoNothing({
        target: [permissions.tenantId, permissions.code],
      })
    await insertTenantBootstrapMenus(db, tenantId, spec.menus)
    await db
      .insert(dictionaryTypes)
      .values(spec.dictionaryTypes.map((type) => ({ ...type, tenantId })))
      .onConflictDoNothing({
        target: [dictionaryTypes.tenantId, dictionaryTypes.code],
      })

    const dictionaryTypeRows =
      spec.dictionaryTypes.length === 0
        ? []
        : await db
            .select({
              id: dictionaryTypes.id,
              code: dictionaryTypes.code,
            })
            .from(dictionaryTypes)
            .where(
              and(
                eq(dictionaryTypes.tenantId, tenantId),
                inArray(
                  dictionaryTypes.code,
                  spec.dictionaryTypes.map((type) => type.code),
                ),
              ),
            )
    const dictionaryTypeIdByCode = new Map(
      dictionaryTypeRows.map((row) => [row.code, row.id]),
    )

    for (const item of spec.dictionaryItems) {
      const typeId =
        dictionaryTypeIdByCode.get(item.typeCode) ??
        throwMissingSeedRelation("dictionary type code", item.typeCode)

      await db
        .insert(dictionaryItems)
        .values({
          typeId,
          value: item.value,
          label: item.label,
          sort: item.sort,
          isDefault: item.isDefault,
          status: item.status,
          tenantId,
        })
        .onConflictDoNothing({
          target: [dictionaryItems.typeId, dictionaryItems.value],
        })
    }

    const existingAdmin = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.tenantId, tenantId),
          eq(users.username, spec.adminUser.username),
        ),
      )
      .limit(1)

    if (!existingAdmin[0]) {
      const adminPasswordHash = await Bun.password.hash(spec.adminUser.password)

      await db.insert(users).values({
        tenantId,
        username: spec.adminUser.username,
        displayName: spec.adminUser.displayName,
        passwordHash: adminPasswordHash,
        status: spec.adminUser.status,
        isSuperAdmin: spec.adminUser.isSuperAdmin,
      })
    }

    const roleRows =
      spec.roles.length === 0
        ? []
        : await db
            .select({
              id: roles.id,
              code: roles.code,
            })
            .from(roles)
            .where(
              and(
                eq(roles.tenantId, tenantId),
                inArray(
                  roles.code,
                  spec.roles.map((role) => role.code),
                ),
              ),
            )
    const permissionRows =
      spec.permissions.length === 0
        ? []
        : await db
            .select({
              id: permissions.id,
              code: permissions.code,
            })
            .from(permissions)
            .where(
              and(
                eq(permissions.tenantId, tenantId),
                inArray(
                  permissions.code,
                  spec.permissions.map((permission) => permission.code),
                ),
              ),
            )
    const menuRows =
      spec.menus.length === 0
        ? []
        : await db
            .select({
              id: menus.id,
              code: menus.code,
            })
            .from(menus)
            .where(
              and(
                eq(menus.tenantId, tenantId),
                inArray(
                  menus.code,
                  spec.menus.map((menu) => menu.code),
                ),
              ),
            )
    const adminRows = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(
        and(
          eq(users.tenantId, tenantId),
          eq(users.username, spec.adminUser.username),
        ),
      )
      .limit(1)
    const adminUserId =
      adminRows[0]?.id ??
      throwMissingSeedRelation("admin user", spec.adminUser.username)
    const roleIdByCode = new Map(roleRows.map((row) => [row.code, row.id]))
    const permissionIdByCode = new Map(
      permissionRows.map((row) => [row.code, row.id]),
    )
    const menuIdByCode = new Map(menuRows.map((row) => [row.code, row.id]))

    await db
      .insert(userRoles)
      .values(
        spec.userRoles.map((assignment) => ({
          userId: adminUserId,
          roleId:
            roleIdByCode.get(assignment.roleCode) ??
            throwMissingSeedRelation("role code", assignment.roleCode),
        })),
      )
      .onConflictDoNothing({ target: [userRoles.userId, userRoles.roleId] })
    await db
      .insert(rolePermissions)
      .values(
        spec.rolePermissions.map((assignment) => ({
          roleId:
            roleIdByCode.get(assignment.roleCode) ??
            throwMissingSeedRelation("role code", assignment.roleCode),
          permissionId:
            permissionIdByCode.get(assignment.permissionCode) ??
            throwMissingSeedRelation(
              "permission code",
              assignment.permissionCode,
            ),
        })),
      )
      .onConflictDoNothing({
        target: [rolePermissions.roleId, rolePermissions.permissionId],
      })
    await db
      .insert(roleMenus)
      .values(
        spec.roleMenus.map((assignment) => ({
          roleId:
            roleIdByCode.get(assignment.roleCode) ??
            throwMissingSeedRelation("role code", assignment.roleCode),
          menuId:
            menuIdByCode.get(assignment.menuCode) ??
            throwMissingSeedRelation("menu code", assignment.menuCode),
        })),
      )
      .onConflictDoNothing({ target: [roleMenus.roleId, roleMenus.menuId] })

    return {
      adminUsername: spec.adminUser.username,
      insertedAdmin: !existingAdmin[0],
    }
  })

const insertTenantBootstrapMenus = async (
  db: DatabaseClient,
  tenantId: string,
  menuSpecs: TenantBootstrapSeedSpec["menus"],
) => {
  const pending = [...menuSpecs]
  const resolvedMenuIds = new Map<string, string>()

  while (pending.length > 0) {
    let progressed = false

    for (let index = 0; index < pending.length; ) {
      const current = pending[index]
      if (!current) {
        index += 1
        continue
      }
      const parentId = current.parentCode
        ? (resolvedMenuIds.get(current.parentCode) ??
          (await resolveTenantMenuIdByCode(db, tenantId, current.parentCode)))
        : null

      if (current.parentCode && !parentId) {
        index += 1
        continue
      }

      await db
        .insert(menus)
        .values({
          parentId,
          type: current.type,
          code: current.code,
          name: current.name,
          path: current.path,
          component: current.component,
          icon: current.icon,
          sort: current.sort,
          isVisible: current.isVisible,
          status: current.status,
          permissionCode: current.permissionCode,
          tenantId,
        })
        .onConflictDoNothing({ target: [menus.tenantId, menus.code] })

      const menuId =
        (await resolveTenantMenuIdByCode(db, tenantId, current.code)) ??
        throwMissingSeedRelation("menu code", current.code)
      resolvedMenuIds.set(current.code, menuId)
      pending.splice(index, 1)
      progressed = true
    }

    if (!progressed) {
      throw new Error(
        `Unable to resolve tenant bootstrap menu parent chain: ${pending
          .map((menu) => menu.code)
          .join(", ")}`,
      )
    }
  }
}

const resolveTenantMenuIdByCode = async (
  db: DatabaseClient,
  tenantId: string,
  code: string,
): Promise<string | null> => {
  const [row] = await db
    .select({
      id: menus.id,
    })
    .from(menus)
    .where(and(eq(menus.tenantId, tenantId), eq(menus.code, code)))
    .limit(1)

  return row?.id ?? null
}

const withTenantSeedContext = async <T>(
  db: DatabaseClient,
  tenantId: string,
  action: () => Promise<T>,
) => {
  await setTenantContext(db, tenantId)

  try {
    return await action()
  } finally {
    await resetTenantContext(db)
  }
}

const throwMissingSeedRelation = (type: string, value: string): never => {
  throw new Error(`Missing seed relation for ${type}: ${value}`)
}

if (import.meta.main) {
  await runDefaultSeed()
}
