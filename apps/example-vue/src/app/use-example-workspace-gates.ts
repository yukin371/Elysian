import { usePermissions } from "@elysian/frontend-vue"
import { type ComputedRef, type Ref, computed } from "vue"

import type { AuthIdentityResponse } from "../lib/platform-api"

interface UseExampleWorkspaceGatesOptions {
  permissionCodes: ComputedRef<string[]>
  authModuleReady: Ref<boolean>
  isAuthenticated: ComputedRef<boolean>
  authIdentity: Ref<AuthIdentityResponse | null>
  customerModuleReady: Ref<boolean>
  departmentModuleReady: Ref<boolean>
  postModuleReady: Ref<boolean>
  dictionaryModuleReady: Ref<boolean>
  fileModuleReady: Ref<boolean>
  menuModuleReady: Ref<boolean>
  notificationModuleReady: Ref<boolean>
  operationLogModuleReady: Ref<boolean>
  roleModuleReady: Ref<boolean>
  settingModuleReady: Ref<boolean>
  tenantModuleReady: Ref<boolean>
  userModuleReady: Ref<boolean>
  workflowModuleReady: Ref<boolean>
}

export const useExampleWorkspaceGates = (
  options: UseExampleWorkspaceGatesOptions,
) => {
  const customerPermissions = usePermissions(
    options.permissionCodes,
    {
      list: "customer:customer:list",
      create: "customer:customer:create",
      update: "customer:customer:update",
      delete: "customer:customer:delete",
    },
    options.authModuleReady,
  )

  const dictionaryPermissions = usePermissions(
    options.permissionCodes,
    {
      list: "system:dictionary:list",
      create: "system:dictionary:create",
      update: "system:dictionary:update",
    },
    options.authModuleReady,
  )

  const departmentPermissions = usePermissions(
    options.permissionCodes,
    {
      list: "system:department:list",
      create: "system:department:create",
      update: "system:department:update",
    },
    options.authModuleReady,
  )

  const filePermissions = usePermissions(
    options.permissionCodes,
    {
      list: "system:file:list",
      create: "system:file:upload",
      update: "system:file:download",
      delete: "system:file:delete",
    },
    options.authModuleReady,
  )

  const postPermissions = usePermissions(
    options.permissionCodes,
    {
      list: "system:post:list",
      create: "system:post:create",
      update: "system:post:update",
    },
    options.authModuleReady,
  )

  const menuPermissions = usePermissions(
    options.permissionCodes,
    {
      list: "system:menu:list",
      create: "system:menu:update",
      update: "system:menu:update",
    },
    options.authModuleReady,
  )

  const notificationPermissions = usePermissions(
    options.permissionCodes,
    {
      list: "system:notification:list",
      create: "system:notification:create",
      update: "system:notification:update",
    },
    options.authModuleReady,
  )

  const operationLogPermissions = usePermissions(
    options.permissionCodes,
    {
      list: "system:operation-log:list",
    },
    options.authModuleReady,
  )

  const rolePermissions = usePermissions(
    options.permissionCodes,
    {
      list: "system:role:list",
      create: "system:role:create",
      update: "system:role:update",
    },
    options.authModuleReady,
  )

  const settingPermissions = usePermissions(
    options.permissionCodes,
    {
      list: "system:setting:list",
      create: "system:setting:create",
      update: "system:setting:update",
    },
    options.authModuleReady,
  )

  const tenantPermissions = usePermissions(
    options.permissionCodes,
    {
      list: "system:tenant:list",
      create: "system:tenant:create",
      update: "system:tenant:update",
    },
    options.authModuleReady,
  )

  const userPermissions = usePermissions(
    options.permissionCodes,
    {
      list: "system:user:list",
      create: "system:user:create",
      update: "system:user:update",
      delete: "system:user:reset-password",
    },
    options.authModuleReady,
  )

  const canEnterCustomerWorkspace = computed(
    () =>
      options.customerModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewCustomers = computed(
    () => canEnterCustomerWorkspace.value && customerPermissions.list.value,
  )
  const canCreateCustomers = computed(
    () => canEnterCustomerWorkspace.value && customerPermissions.create.value,
  )
  const canUpdateCustomers = computed(
    () => canEnterCustomerWorkspace.value && customerPermissions.update.value,
  )
  const canDeleteCustomers = computed(
    () => canEnterCustomerWorkspace.value && customerPermissions.delete.value,
  )

  const canEnterDepartmentWorkspace = computed(
    () =>
      options.departmentModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewDepartments = computed(
    () => canEnterDepartmentWorkspace.value && departmentPermissions.list.value,
  )
  const canCreateDepartments = computed(
    () =>
      canEnterDepartmentWorkspace.value && departmentPermissions.create.value,
  )
  const canUpdateDepartments = computed(
    () =>
      canEnterDepartmentWorkspace.value && departmentPermissions.update.value,
  )

  const canEnterDictionaryWorkspace = computed(
    () =>
      options.dictionaryModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )

  const canEnterPostWorkspace = computed(
    () =>
      options.postModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canEnterSessionWorkspace = computed(
    () => options.authModuleReady.value && options.isAuthenticated.value,
  )
  const canViewPosts = computed(
    () => canEnterPostWorkspace.value && postPermissions.list.value,
  )
  const canCreatePosts = computed(
    () => canEnterPostWorkspace.value && postPermissions.create.value,
  )
  const canUpdatePosts = computed(
    () => canEnterPostWorkspace.value && postPermissions.update.value,
  )
  const canViewDictionaries = computed(
    () => canEnterDictionaryWorkspace.value && dictionaryPermissions.list.value,
  )
  const canCreateDictionaryTypes = computed(
    () =>
      canEnterDictionaryWorkspace.value && dictionaryPermissions.create.value,
  )
  const canUpdateDictionaryTypes = computed(
    () =>
      canEnterDictionaryWorkspace.value && dictionaryPermissions.update.value,
  )

  const canEnterFileWorkspace = computed(
    () =>
      options.fileModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewFiles = computed(
    () => canEnterFileWorkspace.value && filePermissions.list.value,
  )
  const canUploadFiles = computed(
    () => canEnterFileWorkspace.value && filePermissions.create.value,
  )
  const canDownloadFiles = computed(
    () => canEnterFileWorkspace.value && filePermissions.update.value,
  )
  const canDeleteFiles = computed(
    () => canEnterFileWorkspace.value && filePermissions.delete.value,
  )

  const canEnterMenuWorkspace = computed(
    () =>
      options.menuModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewMenus = computed(
    () => canEnterMenuWorkspace.value && menuPermissions.list.value,
  )
  const canCreateMenus = computed(
    () => canEnterMenuWorkspace.value && menuPermissions.create.value,
  )
  const canUpdateMenus = computed(
    () => canEnterMenuWorkspace.value && menuPermissions.update.value,
  )

  const canEnterNotificationWorkspace = computed(
    () =>
      options.notificationModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewNotifications = computed(
    () =>
      canEnterNotificationWorkspace.value && notificationPermissions.list.value,
  )
  const canCreateNotifications = computed(
    () =>
      canEnterNotificationWorkspace.value &&
      notificationPermissions.create.value,
  )
  const canUpdateNotifications = computed(
    () =>
      canEnterNotificationWorkspace.value &&
      notificationPermissions.update.value,
  )

  const canEnterOperationLogWorkspace = computed(
    () =>
      options.operationLogModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewOperationLogs = computed(
    () =>
      canEnterOperationLogWorkspace.value && operationLogPermissions.list.value,
  )

  const canEnterRoleWorkspace = computed(
    () =>
      options.roleModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewRoles = computed(
    () => canEnterRoleWorkspace.value && rolePermissions.list.value,
  )
  const canCreateRoles = computed(
    () => canEnterRoleWorkspace.value && rolePermissions.create.value,
  )
  const canUpdateRoles = computed(
    () => canEnterRoleWorkspace.value && rolePermissions.update.value,
  )

  const canEnterSettingWorkspace = computed(
    () =>
      options.settingModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewSettings = computed(
    () => canEnterSettingWorkspace.value && settingPermissions.list.value,
  )
  const canCreateSettings = computed(
    () => canEnterSettingWorkspace.value && settingPermissions.create.value,
  )
  const canUpdateSettings = computed(
    () => canEnterSettingWorkspace.value && settingPermissions.update.value,
  )

  const canEnterTenantWorkspace = computed(
    () =>
      options.tenantModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canManageTenantsAsSuperAdmin = computed(
    () =>
      canEnterTenantWorkspace.value &&
      options.authIdentity.value?.user.isSuperAdmin === true,
  )
  const canViewTenants = computed(
    () => canManageTenantsAsSuperAdmin.value && tenantPermissions.list.value,
  )
  const canCreateTenants = computed(
    () => canManageTenantsAsSuperAdmin.value && tenantPermissions.create.value,
  )
  const canUpdateTenants = computed(
    () => canManageTenantsAsSuperAdmin.value && tenantPermissions.update.value,
  )

  const canEnterUserWorkspace = computed(
    () =>
      options.userModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewUsers = computed(
    () => canEnterUserWorkspace.value && userPermissions.list.value,
  )
  const canCreateUsers = computed(
    () => canEnterUserWorkspace.value && userPermissions.create.value,
  )
  const canUpdateUsers = computed(
    () => canEnterUserWorkspace.value && userPermissions.update.value,
  )
  const canResetUserPasswords = computed(
    () => canEnterUserWorkspace.value && userPermissions.delete.value,
  )

  const canEnterWorkflowWorkspace = computed(
    () =>
      options.workflowModuleReady.value &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewWorkflowDefinitions = computed(
    () =>
      canEnterWorkflowWorkspace.value &&
      (!options.authModuleReady.value ||
        options.permissionCodes.value.includes("workflow:definition:list")),
  )

  return {
    canCreateCustomers,
    canCreateDepartments,
    canCreateDictionaryTypes,
    canCreateMenus,
    canCreateNotifications,
    canCreateRoles,
    canCreateSettings,
    canCreateTenants,
    canCreateUsers,
    canDeleteCustomers,
    canDeleteFiles,
    canDownloadFiles,
    canEnterCustomerWorkspace,
    canEnterDepartmentWorkspace,
    canEnterDictionaryWorkspace,
    canEnterFileWorkspace,
    canEnterMenuWorkspace,
    canEnterNotificationWorkspace,
    canEnterOperationLogWorkspace,
    canEnterPostWorkspace,
    canEnterSessionWorkspace,
    canEnterRoleWorkspace,
    canEnterSettingWorkspace,
    canEnterTenantWorkspace,
    canEnterUserWorkspace,
    canEnterWorkflowWorkspace,
    canResetUserPasswords,
    canUpdateCustomers,
    canUpdateDepartments,
    canUpdateDictionaryTypes,
    canUpdateMenus,
    canUpdateNotifications,
    canUpdatePosts,
    canUpdateRoles,
    canUpdateSettings,
    canUpdateTenants,
    canUpdateUsers,
    canUploadFiles,
    canViewCustomers,
    canViewDepartments,
    canViewDictionaries,
    canViewFiles,
    canViewMenus,
    canViewNotifications,
    canViewOperationLogs,
    canViewPosts,
    canViewRoles,
    canViewSettings,
    canViewTenants,
    canViewUsers,
    canViewWorkflowDefinitions,
  }
}
