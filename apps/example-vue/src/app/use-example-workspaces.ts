import {
  applyCrudDictionaryOptions,
  buildCrudDictionaryOptionCatalog,
} from "@elysian/frontend-vue"
import { useElyCrudPage } from "@elysian/ui-enterprise-vue"
import { computed } from "vue"

import { useAuthSessionWorkspace } from "../workspaces/use-auth-session-workspace"
import { useCustomerWorkspace } from "../workspaces/use-customer-workspace"
import { useDepartmentWorkspace } from "../workspaces/use-department-workspace"
import { useDictionaryWorkspace } from "../workspaces/use-dictionary-workspace"
import { useFileWorkspace } from "../workspaces/use-file-workspace"
import { useGeneratorPreviewWorkspace } from "../workspaces/use-generator-preview-workspace"
import { useMenuWorkspace } from "../workspaces/use-menu-workspace"
import { useNotificationWorkspace } from "../workspaces/use-notification-workspace"
import { useOperationLogWorkspace } from "../workspaces/use-operation-log-workspace"
import { usePostWorkspace } from "../workspaces/use-post-workspace"
import { useRoleWorkspace } from "../workspaces/use-role-workspace"
import { useSettingWorkspace } from "../workspaces/use-setting-workspace"
import { useTenantWorkspace } from "../workspaces/use-tenant-workspace"
import { useUserWorkspace } from "../workspaces/use-user-workspace"
import { useWorkflowWorkspace } from "../workspaces/use-workflow-workspace"
import type { AppTranslate } from "./app-shell-helpers"
import {
  customerPageDefinition,
  departmentPageDefinition,
  dictionaryPageDefinition,
  menuPageDefinition,
  notificationPageDefinition,
  operationLogPageDefinition,
  postPageDefinition,
  rolePageDefinition,
  settingPageDefinition,
  tenantPageDefinition,
  userPageDefinition,
} from "./example-page-definitions"
import type { useExampleAppBootstrap } from "./use-example-app-bootstrap"
import { useExampleNavigation } from "./use-example-navigation"
import type { useExampleRuntimeState } from "./use-example-runtime-state"
import { useExampleWorkspaceGates } from "./use-example-workspace-gates"

interface ExampleWorkspaceOptions {
  t: AppTranslate
  locale: ReturnType<typeof useExampleAppBootstrap>["locale"]
  localizers: ReturnType<typeof useExampleAppBootstrap>["localizers"]
  runtimeState: ReturnType<typeof useExampleRuntimeState>
  onCurrentSessionRevoked: () => Promise<void>
  onRecoverableAuthError: (error: unknown) => void
}

export const useExampleWorkspaces = ({
  t,
  locale,
  localizers,
  runtimeState,
  onCurrentSessionRevoked,
  onRecoverableAuthError,
}: ExampleWorkspaceOptions) => {
  const exampleNavigation = useExampleNavigation({
    authIdentity: runtimeState.authIdentity,
    registeredModuleCodes: runtimeState.registeredModuleCodes,
    t,
    localizeNavigationItems: localizers.localizeNavigationItems,
  })

  const workspaceGates = useExampleWorkspaceGates({
    permissionCodes: runtimeState.permissionCodes,
    authModuleReady: runtimeState.authModuleReady,
    isAuthenticated: runtimeState.isAuthenticated,
    authIdentity: runtimeState.authIdentity,
    workspaceModuleReady: runtimeState.workspaceModuleReady,
  })

  const enterpriseDictionaryPage = useElyCrudPage(
    dictionaryPageDefinition,
    runtimeState.permissionCodes,
  )
  const enterpriseDepartmentPage = useElyCrudPage(
    departmentPageDefinition,
    runtimeState.permissionCodes,
  )
  const enterprisePostPage = useElyCrudPage(
    postPageDefinition,
    runtimeState.permissionCodes,
  )
  const enterpriseMenuPage = useElyCrudPage(
    menuPageDefinition,
    runtimeState.permissionCodes,
  )
  const enterpriseNotificationPage = useElyCrudPage(
    notificationPageDefinition,
    runtimeState.permissionCodes,
  )
  const enterpriseOperationLogPage = useElyCrudPage(
    operationLogPageDefinition,
    runtimeState.permissionCodes,
  )
  const enterpriseRolePage = useElyCrudPage(
    rolePageDefinition,
    runtimeState.permissionCodes,
  )
  const enterpriseSettingPage = useElyCrudPage(
    settingPageDefinition,
    runtimeState.permissionCodes,
  )
  const enterpriseTenantPage = useElyCrudPage(
    tenantPageDefinition,
    runtimeState.permissionCodes,
  )
  const enterpriseUserPage = useElyCrudPage(
    userPageDefinition,
    runtimeState.permissionCodes,
  )

  const dictionaryWorkspace = useDictionaryWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    page: enterpriseDictionaryPage,
    locale,
    t,
    localizeFieldLabel: localizers.localizeDictionaryFieldLabel,
    localizeStatus: localizers.localizeDictionaryStatus,
    canView: workspaceGates.canViewDictionaries,
    canCreate: workspaceGates.canCreateDictionaryTypes,
    canUpdate: workspaceGates.canUpdateDictionaryTypes,
    onRecoverableAuthError,
  })

  const dictionaryOptionCatalog = computed(() =>
    buildCrudDictionaryOptionCatalog(
      dictionaryWorkspace.dictionaryTypes.value,
      dictionaryWorkspace.dictionaryItems.value,
    ),
  )

  const enterpriseCustomerPage = useElyCrudPage(
    computed(() =>
      applyCrudDictionaryOptions(
        customerPageDefinition,
        dictionaryOptionCatalog.value,
      ),
    ),
    runtimeState.permissionCodes,
  )

  const customerWorkspace = useCustomerWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    page: enterpriseCustomerPage,
    locale,
    t,
    localizeFieldLabel: localizers.localizeFieldLabel,
    localizeStatus: (status) => localizers.localizeCustomerStatus(status),
    localizeActionLabel: localizers.localizeActionLabel,
    canView: workspaceGates.canViewCustomers,
    canCreate: workspaceGates.canCreateCustomers,
    canUpdate: workspaceGates.canUpdateCustomers,
    canDelete: workspaceGates.canDeleteCustomers,
    onRecoverableAuthError,
  })

  const departmentWorkspace = useDepartmentWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    page: enterpriseDepartmentPage,
    locale,
    t,
    localizeFieldLabel: localizers.localizeDepartmentFieldLabel,
    localizeStatus: localizers.localizeDepartmentStatus,
    canView: workspaceGates.canViewDepartments,
    canCreate: workspaceGates.canCreateDepartments,
    canUpdate: workspaceGates.canUpdateDepartments,
    onRecoverableAuthError,
  })

  const postWorkspace = usePostWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    page: enterprisePostPage,
    locale,
    t,
    localizeFieldLabel: localizers.localizePostFieldLabel,
    localizeStatus: localizers.localizePostStatus,
    canView: workspaceGates.canViewPosts,
    canCreate: workspaceGates.canCreatePosts,
    canUpdate: workspaceGates.canUpdatePosts,
    onRecoverableAuthError,
  })

  const menuWorkspace = useMenuWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    page: enterpriseMenuPage,
    locale,
    t,
    localizeFieldLabel: localizers.localizeMenuFieldLabel,
    localizeType: localizers.localizeMenuType,
    localizeBoolean: localizers.localizeMenuBoolean,
    localizeStatus: localizers.localizeMenuStatus,
    canView: workspaceGates.canViewMenus,
    canCreate: workspaceGates.canCreateMenus,
    canUpdate: workspaceGates.canUpdateMenus,
    onRecoverableAuthError,
  })

  const notificationWorkspace = useNotificationWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    page: enterpriseNotificationPage,
    locale,
    t,
    localizeFieldLabel: localizers.localizeNotificationFieldLabel,
    localizeLevel: localizers.localizeNotificationLevel,
    localizeStatus: localizers.localizeNotificationStatus,
    canView: workspaceGates.canViewNotifications,
    canCreate: workspaceGates.canCreateNotifications,
    canUpdate: workspaceGates.canUpdateNotifications,
    onRecoverableAuthError,
  })

  const operationLogWorkspace = useOperationLogWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    page: enterpriseOperationLogPage,
    locale,
    t,
    localizeFieldLabel: localizers.localizeOperationLogFieldLabel,
    localizeResult: localizers.localizeOperationLogResult,
    canView: workspaceGates.canViewOperationLogs,
    onRecoverableAuthError,
  })

  const roleWorkspace = useRoleWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    page: enterpriseRolePage,
    locale,
    t,
    localizeFieldLabel: localizers.localizeRoleFieldLabel,
    localizeStatus: localizers.localizeRoleStatus,
    localizeBoolean: localizers.localizeRoleBoolean,
    localizeDataScope: localizers.localizeRoleDataScope,
    canView: workspaceGates.canViewRoles,
    canCreate: workspaceGates.canCreateRoles,
    canUpdate: workspaceGates.canUpdateRoles,
    onRecoverableAuthError,
  })

  const settingWorkspace = useSettingWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    page: enterpriseSettingPage,
    locale,
    t,
    localizeFieldLabel: localizers.localizeSettingFieldLabel,
    localizeStatus: localizers.localizeSettingStatus,
    canView: workspaceGates.canViewSettings,
    canCreate: workspaceGates.canCreateSettings,
    canUpdate: workspaceGates.canUpdateSettings,
    onRecoverableAuthError,
  })

  const tenantWorkspace = useTenantWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    page: enterpriseTenantPage,
    locale,
    t,
    localizeFieldLabel: localizers.localizeTenantFieldLabel,
    localizeStatus: localizers.localizeTenantStatus,
    canView: workspaceGates.canViewTenants,
    canCreate: workspaceGates.canCreateTenants,
    canUpdate: workspaceGates.canUpdateTenants,
    onRecoverableAuthError,
  })

  const userWorkspace = useUserWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    page: enterpriseUserPage,
    locale,
    t,
    localizeFieldLabel: localizers.localizeUserFieldLabel,
    localizeStatus: localizers.localizeUserStatus,
    localizeBoolean: localizers.localizeUserBoolean,
    canView: workspaceGates.canViewUsers,
    canCreate: workspaceGates.canCreateUsers,
    canUpdate: workspaceGates.canUpdateUsers,
    canResetPassword: workspaceGates.canResetUserPasswords,
    onRecoverableAuthError,
  })

  const fileWorkspace = useFileWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    isWorkspaceActive: exampleNavigation.isFileWorkspace,
    locale,
    t,
    canView: workspaceGates.canViewFiles,
    canUpload: workspaceGates.canUploadFiles,
    canDownload: workspaceGates.canDownloadFiles,
    canDelete: workspaceGates.canDeleteFiles,
    onRecoverableAuthError,
  })

  const sessionWorkspace = useAuthSessionWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    locale,
    t,
    canEnterWorkspace: workspaceGates.canEnterSessionWorkspace,
    onRecoverableAuthError,
    onCurrentSessionRevoked,
  })

  const workflowWorkspace = useWorkflowWorkspace({
    currentShellTabKey: exampleNavigation.currentShellTabKey,
    locale,
    t,
    localizeStatus: localizers.localizeWorkflowStatus,
    canView: workspaceGates.canViewWorkflowDefinitions,
    onRecoverableAuthError,
  })

  const generatorPreviewWorkspace = useGeneratorPreviewWorkspace(
    t,
    exampleNavigation.isGeneratorPreviewWorkspace,
    onRecoverableAuthError,
  )

  return {
    exampleNavigation,
    workspaceGates,
    customerWorkspace,
    departmentWorkspace,
    dictionaryWorkspace,
    fileWorkspace,
    generatorPreviewWorkspace,
    menuWorkspace,
    notificationWorkspace,
    operationLogWorkspace,
    postWorkspace,
    roleWorkspace,
    sessionWorkspace,
    settingWorkspace,
    tenantWorkspace,
    userWorkspace,
    workflowWorkspace,
  } as const
}
