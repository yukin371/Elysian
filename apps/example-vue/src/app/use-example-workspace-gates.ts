import { usePermissions } from "@elysian/frontend-vue"
import { type ComputedRef, type Ref, computed } from "vue"

import type { AuthIdentityResponse } from "../lib/platform-api"
import type {
  RegisteredWorkspaceKind,
  WorkspaceModuleReadyMap,
} from "./workspace-registry"
import { getWorkspacePermissions } from "./workspace-registry"

interface UseExampleWorkspaceGatesOptions {
  permissionCodes: ComputedRef<string[]>
  authModuleReady: Ref<boolean>
  isAuthenticated: ComputedRef<boolean>
  authIdentity: Ref<AuthIdentityResponse | null>
  workspaceModuleReady: WorkspaceModuleReadyMap
}

export const useExampleWorkspaceGates = (
  options: UseExampleWorkspaceGatesOptions,
) => {
  const workspaceReady = (kind: RegisteredWorkspaceKind) =>
    options.workspaceModuleReady.get(kind)?.value ?? false
  const permissions = (kind: RegisteredWorkspaceKind) =>
    getWorkspacePermissions(kind) as Record<string, string>

  const customerPermissions = usePermissions(
    options.permissionCodes,
    permissions("customer"),
    options.authModuleReady,
  )

  const dictionaryPermissions = usePermissions(
    options.permissionCodes,
    permissions("dictionary"),
    options.authModuleReady,
  )

  const departmentPermissions = usePermissions(
    options.permissionCodes,
    permissions("department"),
    options.authModuleReady,
  )

  const filePermissions = usePermissions(
    options.permissionCodes,
    permissions("file"),
    options.authModuleReady,
  )

  const postPermissions = usePermissions(
    options.permissionCodes,
    permissions("post"),
    options.authModuleReady,
  )

  const menuPermissions = usePermissions(
    options.permissionCodes,
    permissions("menu"),
    options.authModuleReady,
  )

  const notificationPermissions = usePermissions(
    options.permissionCodes,
    permissions("notification"),
    options.authModuleReady,
  )

  const operationLogPermissions = usePermissions(
    options.permissionCodes,
    permissions("operation-log"),
    options.authModuleReady,
  )

  const rolePermissions = usePermissions(
    options.permissionCodes,
    permissions("role"),
    options.authModuleReady,
  )

  const settingPermissions = usePermissions(
    options.permissionCodes,
    permissions("setting"),
    options.authModuleReady,
  )

  const tenantPermissions = usePermissions(
    options.permissionCodes,
    permissions("tenant"),
    options.authModuleReady,
  )

  const userPermissions = usePermissions(
    options.permissionCodes,
    permissions("user"),
    options.authModuleReady,
  )

  const canEnterCustomerWorkspace = computed(
    () =>
      workspaceReady("customer") &&
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
      workspaceReady("department") &&
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
      workspaceReady("dictionary") &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )

  const canEnterPostWorkspace = computed(
    () =>
      workspaceReady("post") &&
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
      workspaceReady("file") &&
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
      workspaceReady("menu") &&
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
      workspaceReady("notification") &&
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
      workspaceReady("operation-log") &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewOperationLogs = computed(
    () =>
      canEnterOperationLogWorkspace.value && operationLogPermissions.list.value,
  )
  const canExportOperationLogs = computed(
    () =>
      canEnterOperationLogWorkspace.value &&
      (!options.authModuleReady.value ||
        options.permissionCodes.value.includes(
          getWorkspacePermissions("operation-log").export ?? "",
        )),
  )

  const canEnterRoleWorkspace = computed(
    () =>
      workspaceReady("role") &&
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
      workspaceReady("setting") &&
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
      workspaceReady("tenant") &&
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
      workspaceReady("user") &&
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
      workspaceReady("workflow-definitions") &&
      (!options.authModuleReady.value || options.isAuthenticated.value),
  )
  const canViewWorkflowDefinitions = computed(
    () =>
      canEnterWorkflowWorkspace.value &&
      (!options.authModuleReady.value ||
        options.permissionCodes.value.includes(
          getWorkspacePermissions("workflow-definitions").list ?? "",
        )),
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
    canExportOperationLogs,
    canEnterPostWorkspace,
    canEnterSessionWorkspace,
    canEnterRoleWorkspace,
    canEnterSettingWorkspace,
    canEnterTenantWorkspace,
    canEnterUserWorkspace,
    canEnterWorkflowWorkspace,
    canCreatePosts,
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
