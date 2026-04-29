import { defaultAuthSeedIds } from "./seed-auth-static"
import type { DefaultAuthSeedSpec } from "./seed-spec"

export const defaultAuthSeedRelations = {
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
      permissionId: defaultAuthSeedIds.permissions.systemPostList,
    },
    {
      roleId: defaultAuthSeedIds.roles.admin,
      permissionId: defaultAuthSeedIds.permissions.systemPostCreate,
    },
    {
      roleId: defaultAuthSeedIds.roles.admin,
      permissionId: defaultAuthSeedIds.permissions.systemPostUpdate,
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
      menuId: defaultAuthSeedIds.menus.systemPosts,
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
} satisfies Pick<
  DefaultAuthSeedSpec,
  "userRoles" | "rolePermissions" | "roleMenus"
>
