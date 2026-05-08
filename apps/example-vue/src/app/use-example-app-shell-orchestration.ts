import { vueEnterprisePresetManifest } from "@elysian/ui-enterprise-vue"

import type { AppTranslate } from "./app-shell-helpers"
import { createExampleAppShellBindingsOptions } from "./create-example-app-shell-bindings-options"
import { createExampleSessionOrchestrationOptions } from "./create-example-session-orchestration-options"
import { createExampleShellMetaOptions } from "./create-example-shell-meta-options"
import { isRecoverableAuthError } from "./example-auth-errors"
import type { useExampleAppBootstrap } from "./use-example-app-bootstrap"
import { useExampleCsvExports } from "./use-example-csv-exports"
import { useExampleCustomerWorkspaceBindings } from "./use-example-customer-workspace-bindings"
import type { useExampleNavigation } from "./use-example-navigation"
import { useExampleQuerySummary } from "./use-example-query-summary"
import type { useExampleRuntimeState } from "./use-example-runtime-state"
import { useExampleSessionOrchestration } from "./use-example-session-orchestration"
import { useExampleShellBindings } from "./use-example-shell-bindings"
import { useExampleShellMeta } from "./use-example-shell-meta"
import type { useExampleWorkspaceGates } from "./use-example-workspace-gates"
import { useExampleWorkspaceSync } from "./use-example-workspace-sync"
import type { useExampleWorkspaces } from "./use-example-workspaces"

type ExampleBootstrapLocale = ReturnType<
  typeof useExampleAppBootstrap
>["locale"]
type ExampleBootstrapLocalizers = ReturnType<
  typeof useExampleAppBootstrap
>["localizers"]
type ExampleRuntimeState = ReturnType<typeof useExampleRuntimeState>
type ExampleNavigation = ReturnType<typeof useExampleNavigation>
type ExampleWorkspaceGates = ReturnType<typeof useExampleWorkspaceGates>
type ExampleWorkspaces = ReturnType<typeof useExampleWorkspaces>

export interface UseExampleAppShellOrchestrationOptions {
  t: AppTranslate
  locale: ExampleBootstrapLocale
  localizers: ExampleBootstrapLocalizers
  runtimeState: ExampleRuntimeState
  navigation: ExampleNavigation
  gates: ExampleWorkspaceGates
  workspaces: ExampleWorkspaces
}

export const useExampleAppShellOrchestration = ({
  gates,
  localizers,
  locale,
  navigation,
  runtimeState,
  t,
  workspaces,
}: UseExampleAppShellOrchestrationOptions) => {
  const {
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
  } = workspaces

  const customerBindings =
    useExampleCustomerWorkspaceBindings(customerWorkspace)

  const shellMetaOptions = createExampleShellMetaOptions({
    t,
    runtimeState,
    navigation,
    workspaces: {
      customerWorkspace,
      departmentWorkspace,
      dictionaryWorkspace,
      fileWorkspace,
      generatorPreviewWorkspace,
      menuWorkspace,
      notificationWorkspace,
      operationLogWorkspace,
      roleWorkspace,
      sessionWorkspace,
      settingWorkspace,
      tenantWorkspace,
      userWorkspace,
      workflowWorkspace,
    },
  })

  const shellMeta = useExampleShellMeta(shellMetaOptions)

  const {
    enterpriseShellCopy,
    enterpriseShellTabs,
    enterpriseShellUser,
    shellWorkspaceDescription,
    shellWorkspaceTitle,
  } = shellMeta

  const { currentQuerySummary } = useExampleQuerySummary({
    t,
    customerQuerySummary: customerBindings.customerQuerySummary,
    isDictionaryWorkspace: navigation.isDictionaryWorkspace,
    isDepartmentWorkspace: navigation.isDepartmentWorkspace,
    isSessionWorkspace: navigation.isSessionWorkspace,
    isPostWorkspace: navigation.isPostWorkspace,
    isRoleWorkspace: navigation.isRoleWorkspace,
    isMenuWorkspace: navigation.isMenuWorkspace,
    isNotificationWorkspace: navigation.isNotificationWorkspace,
    isOperationLogWorkspace: navigation.isOperationLogWorkspace,
    isUserWorkspace: navigation.isUserWorkspace,
    isSettingWorkspace: navigation.isSettingWorkspace,
    isTenantWorkspace: navigation.isTenantWorkspace,
    dictionaryQueryValues: dictionaryWorkspace.dictionaryQueryValues,
    departmentQueryValues: departmentWorkspace.departmentQueryValues,
    sessionQuerySummary: sessionWorkspace.currentQuerySummary,
    postQueryValues: postWorkspace.postQueryValues,
    roleQueryValues: roleWorkspace.roleQueryValues,
    menuQueryValues: menuWorkspace.menuQueryValues,
    notificationQueryValues: notificationWorkspace.notificationQueryValues,
    operationLogQueryValues: operationLogWorkspace.operationLogQueryValues,
    userQueryValues: userWorkspace.userQueryValues,
    settingQueryValues: settingWorkspace.settingQueryValues,
    tenantQueryValues: tenantWorkspace.tenantQueryValues,
    localizeDictionaryStatus: localizers.localizeDictionaryStatus,
    localizeDepartmentStatus: localizers.localizeDepartmentStatus,
    localizePostStatus: localizers.localizePostStatus,
    localizeRoleStatus: localizers.localizeRoleStatus,
    localizeMenuType: localizers.localizeMenuType,
    localizeMenuStatus: localizers.localizeMenuStatus,
    localizeNotificationLevel: localizers.localizeNotificationLevel,
    localizeNotificationStatus: localizers.localizeNotificationStatus,
    localizeOperationLogResult: localizers.localizeOperationLogResult,
    localizeUserStatus: localizers.localizeUserStatus,
    localizeSettingStatus: localizers.localizeSettingStatus,
    localizeTenantStatus: localizers.localizeTenantStatus,
  })

  useExampleWorkspaceSync({
    customerItems: customerBindings.customerItems,
    enterpriseFormMode: customerBindings.enterpriseFormMode,
    selectedCustomerId: customerBindings.selectedCustomerId,
    canCreateCustomers: gates.canCreateCustomers,
    filteredDictionaryTypes: dictionaryWorkspace.filteredDictionaryTypes,
    isDictionaryWorkspace: navigation.isDictionaryWorkspace,
    dictionaryLoading: dictionaryWorkspace.dictionaryLoading,
    dictionaryPanelMode: dictionaryWorkspace.dictionaryPanelMode,
    selectedDictionaryTypeId: dictionaryWorkspace.selectedDictionaryTypeId,
    canCreateDictionaryTypes: gates.canCreateDictionaryTypes,
    selectDictionaryType: async (item) => {
      await dictionaryWorkspace.selectDictionaryType(item as never)
    },
    filteredNotificationItems: notificationWorkspace.filteredNotificationItems,
    isNotificationWorkspace: navigation.isNotificationWorkspace,
    notificationLoading: notificationWorkspace.notificationLoading,
    notificationPanelMode: notificationWorkspace.notificationPanelMode,
    selectedNotificationId: notificationWorkspace.selectedNotificationId,
    notificationDetail: notificationWorkspace.notificationDetail,
    canCreateNotifications: gates.canCreateNotifications,
    selectNotification: async (item) => {
      await notificationWorkspace.selectNotification(item as never)
    },
    filteredDepartmentItems: departmentWorkspace.filteredDepartmentItems,
    isDepartmentWorkspace: navigation.isDepartmentWorkspace,
    departmentLoading: departmentWorkspace.departmentLoading,
    departmentPanelMode: departmentWorkspace.departmentPanelMode,
    selectedDepartmentId: departmentWorkspace.selectedDepartmentId,
    departmentDetail: departmentWorkspace.departmentDetail,
    canCreateDepartments: gates.canCreateDepartments,
    selectDepartment: async (item) => {
      await departmentWorkspace.selectDepartment(item as never)
    },
    filteredPostItems: postWorkspace.filteredPostItems,
    isPostWorkspace: navigation.isPostWorkspace,
    postLoading: postWorkspace.postLoading,
    postPanelMode: postWorkspace.postPanelMode,
    selectedPostId: postWorkspace.selectedPostId,
    postDetail: postWorkspace.postDetail,
    canCreatePosts: gates.canCreatePosts,
    selectPost: async (item) => {
      await postWorkspace.selectPost(item as never)
    },
    filteredMenuItems: menuWorkspace.filteredMenuItems,
    isMenuWorkspace: navigation.isMenuWorkspace,
    menuLoading: menuWorkspace.menuLoading,
    menuPanelMode: menuWorkspace.menuPanelMode,
    selectedMenuId: menuWorkspace.selectedMenuId,
    menuDetail: menuWorkspace.menuDetail,
    canCreateMenus: gates.canCreateMenus,
    selectMenu: async (item) => {
      await menuWorkspace.selectMenu(item as never)
    },
    filteredOperationLogItems: operationLogWorkspace.filteredOperationLogItems,
    isOperationLogWorkspace: navigation.isOperationLogWorkspace,
    operationLogLoading: operationLogWorkspace.operationLogLoading,
    operationLogDetailLoading: operationLogWorkspace.operationLogDetailLoading,
    selectedOperationLogId: operationLogWorkspace.selectedOperationLogId,
    operationLogDetail: operationLogWorkspace.operationLogDetail,
    selectOperationLog: (item) =>
      operationLogWorkspace.selectOperationLog(item as never),
    filteredRoleItems: roleWorkspace.filteredRoleItems,
    isRoleWorkspace: navigation.isRoleWorkspace,
    roleLoading: roleWorkspace.roleLoading,
    rolePanelMode: roleWorkspace.rolePanelMode,
    selectedRoleId: roleWorkspace.selectedRoleId,
    roleDetail: roleWorkspace.roleDetail,
    canCreateRoles: gates.canCreateRoles,
    selectRole: async (item) => {
      await roleWorkspace.selectRole(item as never)
    },
    filteredSettingItems: settingWorkspace.filteredSettingItems,
    isSettingWorkspace: navigation.isSettingWorkspace,
    settingLoading: settingWorkspace.settingLoading,
    settingPanelMode: settingWorkspace.settingPanelMode,
    selectedSettingId: settingWorkspace.selectedSettingId,
    settingDetail: settingWorkspace.settingDetail,
    canCreateSettings: gates.canCreateSettings,
    selectSetting: async (item) => {
      await settingWorkspace.selectSetting(item as never)
    },
    filteredTenantItems: tenantWorkspace.filteredTenantItems,
    isTenantWorkspace: navigation.isTenantWorkspace,
    tenantLoading: tenantWorkspace.tenantLoading,
    tenantPanelMode: tenantWorkspace.tenantPanelMode,
    selectedTenantId: tenantWorkspace.selectedTenantId,
    tenantDetail: tenantWorkspace.tenantDetail,
    canCreateTenants: gates.canCreateTenants,
    selectTenant: async (item) => {
      await tenantWorkspace.selectTenant(item as never)
    },
    filteredUserItems: userWorkspace.filteredUserItems,
    selectedUserId: userWorkspace.selectedUserId,
    userPanelMode: userWorkspace.userPanelMode,
    canCreateUsers: gates.canCreateUsers,
    workflowDefinitionCards: workflowWorkspace.workflowDefinitionCards,
    isWorkflowDefinitionsWorkspace: navigation.isWorkflowDefinitionsWorkspace,
    workflowLoading: workflowWorkspace.workflowLoading,
    selectedWorkflowDefinitionId:
      workflowWorkspace.selectedWorkflowDefinitionId,
    workflowDefinitionDetail: workflowWorkspace.workflowDefinitionDetail,
    selectWorkflowDefinition: (item) =>
      workflowWorkspace.selectWorkflowDefinition(item as never),
  })

  const sessionOrchestrationOptions = createExampleSessionOrchestrationOptions({
    t,
    runtimeState,
    enterpriseFormMode: customerBindings.enterpriseFormMode,
    notificationQueryValues: notificationWorkspace.notificationQueryValues,
    workspaces: {
      customerWorkspace,
      departmentWorkspace,
      dictionaryWorkspace,
      fileWorkspace,
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
    },
  })

  const { submitLogin, submitLogout } = useExampleSessionOrchestration(
    sessionOrchestrationOptions,
  )

  const {
    handleExportDepartments,
    handleExportDictionaryItems,
    handleExportDictionaryTypes,
    handleExportFiles,
    handleExportMenus,
    handleExportNotifications,
    handleExportOperationLogs,
    handleExportPosts,
    handleExportRoles,
    handleExportSettings,
    handleExportTenants,
    handleExportUsers,
  } = useExampleCsvExports({
    t,
    authIdentity: runtimeState.authIdentity,
    isRecoverableAuthError,
    canViewDictionaries: gates.canViewDictionaries,
    dictionaryTypeExportLoading: runtimeState.dictionaryTypeExportLoading,
    dictionaryItemsExportLoading: runtimeState.dictionaryItemsExportLoading,
    dictionaryErrorMessage: dictionaryWorkspace.dictionaryErrorMessage,
    selectedDictionaryTypeId: dictionaryWorkspace.selectedDictionaryTypeId,
    canViewUsers: gates.canViewUsers,
    userExportLoading: runtimeState.userExportLoading,
    userErrorMessage: userWorkspace.userErrorMessage,
    canViewRoles: gates.canViewRoles,
    roleExportLoading: runtimeState.roleExportLoading,
    roleErrorMessage: roleWorkspace.roleErrorMessage,
    canViewDepartments: gates.canViewDepartments,
    departmentExportLoading: runtimeState.departmentExportLoading,
    departmentErrorMessage: departmentWorkspace.departmentErrorMessage,
    canViewPosts: gates.canViewPosts,
    postExportLoading: runtimeState.postExportLoading,
    postErrorMessage: postWorkspace.postErrorMessage,
    canViewMenus: gates.canViewMenus,
    menuExportLoading: runtimeState.menuExportLoading,
    menuErrorMessage: menuWorkspace.menuErrorMessage,
    canViewSettings: gates.canViewSettings,
    settingExportLoading: runtimeState.settingExportLoading,
    settingErrorMessage: settingWorkspace.settingErrorMessage,
    canViewTenants: gates.canViewTenants,
    tenantExportLoading: runtimeState.tenantExportLoading,
    tenantErrorMessage: tenantWorkspace.tenantErrorMessage,
    canViewNotifications: gates.canViewNotifications,
    notificationExportLoading: runtimeState.notificationExportLoading,
    notificationErrorMessage: notificationWorkspace.notificationErrorMessage,
    notificationListQuery: notificationWorkspace.listQuery,
    canExportOperationLogs: gates.canExportOperationLogs,
    operationLogExportLoading: runtimeState.operationLogExportLoading,
    operationLogErrorMessage: operationLogWorkspace.operationLogErrorMessage,
    operationLogQueryValues: operationLogWorkspace.operationLogQueryValues,
    canViewFiles: gates.canViewFiles,
    fileExportLoading: runtimeState.fileExportLoading,
    fileErrorMessage: fileWorkspace.fileErrorMessage,
    fileListQuery: fileWorkspace.listQuery,
  })

  const shellBindingsOptions = createExampleAppShellBindingsOptions({
    t,
    platform: runtimeState.platform,
    authIdentity: runtimeState.authIdentity,
    locale,
    loginForm: runtimeState.loginForm,
    envName: runtimeState.envName,
    authErrorMessage: runtimeState.authErrorMessage,
    authLoading: runtimeState.authLoading,
    isAuthenticated: runtimeState.isAuthenticated,
    permissionCodes: runtimeState.permissionCodes,
    currentQuerySummary,
    navigation,
    gates,
    shellMeta,
    moduleReady: {
      authModuleReady: runtimeState.authModuleReady,
      customerModuleReady: runtimeState.customerModuleReady,
      departmentModuleReady: runtimeState.departmentModuleReady,
      dictionaryModuleReady: runtimeState.dictionaryModuleReady,
      fileModuleReady: runtimeState.fileModuleReady,
      menuModuleReady: runtimeState.menuModuleReady,
      notificationModuleReady: runtimeState.notificationModuleReady,
      operationLogModuleReady: runtimeState.operationLogModuleReady,
      postModuleReady: runtimeState.postModuleReady,
      roleModuleReady: runtimeState.roleModuleReady,
      settingModuleReady: runtimeState.settingModuleReady,
      tenantModuleReady: runtimeState.tenantModuleReady,
      userModuleReady: runtimeState.userModuleReady,
      workflowModuleReady: runtimeState.workflowModuleReady,
    },
    exportLoading: {
      departmentExportLoading: runtimeState.departmentExportLoading,
      dictionaryItemsExportLoading: runtimeState.dictionaryItemsExportLoading,
      dictionaryTypeExportLoading: runtimeState.dictionaryTypeExportLoading,
      fileExportLoading: runtimeState.fileExportLoading,
      menuExportLoading: runtimeState.menuExportLoading,
      notificationExportLoading: runtimeState.notificationExportLoading,
      operationLogExportLoading: runtimeState.operationLogExportLoading,
      postExportLoading: runtimeState.postExportLoading,
      roleExportLoading: runtimeState.roleExportLoading,
      settingExportLoading: runtimeState.settingExportLoading,
      tenantExportLoading: runtimeState.tenantExportLoading,
      userExportLoading: runtimeState.userExportLoading,
    },
    exportHandlers: {
      handleExportDepartments,
      handleExportDictionaryItems,
      handleExportDictionaryTypes,
      handleExportFiles,
      handleExportMenus,
      handleExportNotifications,
      handleExportOperationLogs,
      handleExportPosts,
      handleExportRoles,
      handleExportSettings,
      handleExportTenants,
      handleExportUsers,
    },
    localizers: {
      localizeDictionaryStatus: localizers.localizeDictionaryStatus,
      localizeNotificationLevel: localizers.localizeNotificationLevel,
      localizeNotificationStatus: localizers.localizeNotificationStatus,
      localizePlatformStatus: localizers.localizePlatformStatus,
      localizeWorkflowStatus: (status) =>
        localizers.localizeWorkflowStatus(status as never),
    },
    workspaces: {
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
    },
    submitLogin,
    submitLogout,
    vueEnterprisePresetStatus: vueEnterprisePresetManifest.status,
  })

  const {
    shellHeaderActionProps,
    shellHeaderActionListeners,
    shellWorkspaceMainProps,
    shellWorkspaceMainListeners,
    shellWorkspaceSecondaryProps,
    shellWorkspaceSecondaryListeners,
  } = useExampleShellBindings(shellBindingsOptions)

  return {
    enterpriseShellCopy,
    enterpriseShellTabs,
    enterpriseShellUser,
    shellHeaderActionListeners,
    shellHeaderActionProps,
    shellWorkspaceDescription,
    shellWorkspaceMainListeners,
    shellWorkspaceMainProps,
    shellWorkspaceSecondaryListeners,
    shellWorkspaceSecondaryProps,
    shellWorkspaceTitle,
    submitLogin,
    submitLogout,
  }
}
