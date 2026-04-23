import { eq } from "drizzle-orm"

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
        id: defaultAuthSeedIds.menus.customerRoot,
        parentId: null,
        type: "directory",
        code: "customer-root",
        name: "Customer",
        path: "/customer",
        component: null,
        icon: "briefcase",
        sort: 20,
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
        sort: 21,
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
        menuId: defaultAuthSeedIds.menus.customerRoot,
      },
      {
        roleId: defaultAuthSeedIds.roles.admin,
        menuId: defaultAuthSeedIds.menus.customerList,
      },
    ],
  }
}

export const seedDefaultAuthData = async (
  db: DatabaseClient,
  config: Partial<DefaultAuthSeedConfig> = {},
) => {
  const spec = createDefaultAuthSeedSpec(config)

  await db
    .insert(roles)
    .values(spec.roles)
    .onConflictDoNothing({ target: roles.code })
  await db
    .insert(permissions)
    .values(spec.permissions)
    .onConflictDoNothing({ target: permissions.code })
  await db
    .insert(menus)
    .values(spec.menus)
    .onConflictDoNothing({ target: menus.code })
  await db
    .insert(dictionaryTypes)
    .values(spec.dictionaryTypes)
    .onConflictDoNothing({ target: dictionaryTypes.code })
  await db
    .insert(dictionaryItems)
    .values(spec.dictionaryItems)
    .onConflictDoNothing({
      target: [dictionaryItems.typeId, dictionaryItems.value],
    })

  const existingAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, spec.adminUser.username))
    .limit(1)

  if (!existingAdmin[0]) {
    const adminPasswordHash = await Bun.password.hash(spec.adminUser.password)

    await db.insert(users).values({
      id: spec.adminUser.id,
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
}
export const runDefaultSeed = async (
  env: Record<string, string | undefined> = process.env,
) => {
  const db = createDatabaseClient(env)
  const config = createDefaultAuthSeedConfig(env)
  const result = await seedDefaultAuthData(db, config)

  console.log(
    `[elysian] default auth seed complete (admin=${result.adminUsername}, inserted=${result.insertedAdmin})`,
  )
}

if (import.meta.main) {
  await runDefaultSeed()
}
