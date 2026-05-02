import { type Ref, computed } from "vue"

import type {
  AuthIdentityResponse,
  PlatformResponse,
} from "../lib/platform-api"
import type { useAuthSessionWorkspace } from "../workspaces/use-auth-session-workspace"
import type { useCustomerWorkspace } from "../workspaces/use-customer-workspace"
import type { useDepartmentWorkspace } from "../workspaces/use-department-workspace"
import type { useDictionaryWorkspace } from "../workspaces/use-dictionary-workspace"
import type { useFileWorkspace } from "../workspaces/use-file-workspace"
import type { useGeneratorPreviewWorkspace } from "../workspaces/use-generator-preview-workspace"
import type { useMenuWorkspace } from "../workspaces/use-menu-workspace"
import type { useNotificationWorkspace } from "../workspaces/use-notification-workspace"
import type { useOperationLogWorkspace } from "../workspaces/use-operation-log-workspace"
import type { usePostWorkspace } from "../workspaces/use-post-workspace"
import type { useRoleWorkspace } from "../workspaces/use-role-workspace"
import type { useSettingWorkspace } from "../workspaces/use-setting-workspace"
import type { useTenantWorkspace } from "../workspaces/use-tenant-workspace"
import type { useUserWorkspace } from "../workspaces/use-user-workspace"
import type { useWorkflowWorkspace } from "../workspaces/use-workflow-workspace"
import type { AppTranslate } from "./app-shell-helpers"
import { createExampleShellBindingsOptions } from "./create-example-shell-bindings-options"
import type { useExampleNavigation } from "./use-example-navigation"
import type { LoginFormState } from "./use-example-shell-binding-types"
import type { useExampleShellMeta } from "./use-example-shell-meta"
import type { useExampleWorkspaceGates } from "./use-example-workspace-gates"

type ShellBindingOptions = Parameters<
  typeof createExampleShellBindingsOptions
>[0]
type ShellBindingOption<Key extends keyof ShellBindingOptions["shell"]> =
  ShellBindingOptions["shell"][Key]

interface ExampleModuleReadyRefs {
  authModuleReady: ShellBindingOptions["shell"]["authModuleReady"]
  customerModuleReady: ShellBindingOptions["customerWorkspace"]["customerModuleReady"]
  departmentModuleReady: ShellBindingOptions["departmentWorkspace"]["departmentModuleReady"]
  dictionaryModuleReady: ShellBindingOptions["dictionaryWorkspace"]["dictionaryModuleReady"]
  fileModuleReady: ShellBindingOptions["fileWorkspace"]["fileModuleReady"]
  menuModuleReady: ShellBindingOptions["menuWorkspace"]["menuModuleReady"]
  notificationModuleReady: ShellBindingOptions["notificationWorkspace"]["notificationModuleReady"]
  operationLogModuleReady: ShellBindingOptions["operationLogWorkspace"]["operationLogModuleReady"]
  postModuleReady: ShellBindingOptions["postWorkspace"]["postModuleReady"]
  roleModuleReady: ShellBindingOptions["roleWorkspace"]["roleModuleReady"]
  settingModuleReady: ShellBindingOptions["settingWorkspace"]["settingModuleReady"]
  tenantModuleReady: ShellBindingOptions["tenantWorkspace"]["tenantModuleReady"]
  userModuleReady: ShellBindingOptions["userWorkspace"]["userModuleReady"]
  workflowModuleReady: ShellBindingOptions["workflowWorkspace"]["workflowModuleReady"]
}

interface ExampleExportLoadingRefs {
  departmentExportLoading: ShellBindingOptions["departmentWorkspace"]["departmentExportLoading"]
  dictionaryItemsExportLoading: ShellBindingOptions["dictionaryWorkspace"]["dictionaryItemsExportLoading"]
  dictionaryTypeExportLoading: ShellBindingOptions["dictionaryWorkspace"]["dictionaryTypeExportLoading"]
  fileExportLoading: ShellBindingOptions["fileWorkspace"]["fileExportLoading"]
  menuExportLoading: ShellBindingOptions["menuWorkspace"]["menuExportLoading"]
  notificationExportLoading: ShellBindingOptions["notificationWorkspace"]["notificationExportLoading"]
  operationLogExportLoading: ShellBindingOptions["operationLogWorkspace"]["operationLogExportLoading"]
  postExportLoading: ShellBindingOptions["postWorkspace"]["postExportLoading"]
  roleExportLoading: ShellBindingOptions["roleWorkspace"]["roleExportLoading"]
  settingExportLoading: ShellBindingOptions["settingWorkspace"]["settingExportLoading"]
  tenantExportLoading: ShellBindingOptions["tenantWorkspace"]["tenantExportLoading"]
  userExportLoading: ShellBindingOptions["userWorkspace"]["userExportLoading"]
}

interface ExampleExportHandlers {
  handleExportDepartments: ShellBindingOptions["departmentWorkspace"]["handleExportDepartments"]
  handleExportDictionaryItems: ShellBindingOptions["dictionaryWorkspace"]["handleExportDictionaryItems"]
  handleExportDictionaryTypes: ShellBindingOptions["dictionaryWorkspace"]["handleExportDictionaryTypes"]
  handleExportFiles: ShellBindingOptions["fileWorkspace"]["handleExportFiles"]
  handleExportMenus: ShellBindingOptions["menuWorkspace"]["handleExportMenus"]
  handleExportNotifications: ShellBindingOptions["notificationWorkspace"]["handleExportNotifications"]
  handleExportOperationLogs: ShellBindingOptions["operationLogWorkspace"]["handleExportOperationLogs"]
  handleExportPosts: ShellBindingOptions["postWorkspace"]["handleExportPosts"]
  handleExportRoles: ShellBindingOptions["roleWorkspace"]["handleExportRoles"]
  handleExportSettings: ShellBindingOptions["settingWorkspace"]["handleExportSettings"]
  handleExportTenants: ShellBindingOptions["tenantWorkspace"]["handleExportTenants"]
  handleExportUsers: ShellBindingOptions["userWorkspace"]["handleExportUsers"]
}

interface ExampleBindingLocalizers {
  localizeDictionaryStatus: ShellBindingOptions["dictionaryWorkspace"]["localizeDictionaryStatus"]
  localizeNotificationLevel: ShellBindingOptions["notificationWorkspace"]["localizeNotificationLevel"]
  localizeNotificationStatus: ShellBindingOptions["notificationWorkspace"]["localizeNotificationStatus"]
  localizePlatformStatus: ShellBindingOptions["customerWorkspace"]["localizePlatformStatus"]
  localizeWorkflowStatus: ShellBindingOptions["workflowWorkspace"]["localizeWorkflowStatus"]
}

interface ExampleWorkspaces {
  customerWorkspace: ReturnType<typeof useCustomerWorkspace>
  dictionaryWorkspace: ReturnType<typeof useDictionaryWorkspace>
  departmentWorkspace: ReturnType<typeof useDepartmentWorkspace>
  fileWorkspace: ReturnType<typeof useFileWorkspace>
  generatorPreviewWorkspace: ReturnType<typeof useGeneratorPreviewWorkspace>
  menuWorkspace: ReturnType<typeof useMenuWorkspace>
  notificationWorkspace: ReturnType<typeof useNotificationWorkspace>
  operationLogWorkspace: ReturnType<typeof useOperationLogWorkspace>
  postWorkspace: ReturnType<typeof usePostWorkspace>
  roleWorkspace: ReturnType<typeof useRoleWorkspace>
  sessionWorkspace: ReturnType<typeof useAuthSessionWorkspace>
  settingWorkspace: ReturnType<typeof useSettingWorkspace>
  tenantWorkspace: ReturnType<typeof useTenantWorkspace>
  userWorkspace: ReturnType<typeof useUserWorkspace>
  workflowWorkspace: ReturnType<typeof useWorkflowWorkspace>
}

interface CreateExampleAppShellBindingsOptionsInput {
  t: AppTranslate
  platform: Ref<PlatformResponse | null>
  authIdentity: Ref<AuthIdentityResponse | null>
  locale: ShellBindingOptions["shell"]["locale"]
  loginForm: Ref<LoginFormState>
  envName: ShellBindingOptions["shell"]["envName"]
  authErrorMessage: ShellBindingOptions["shell"]["authErrorMessage"]
  authLoading: ShellBindingOptions["shell"]["authLoading"]
  isAuthenticated: ShellBindingOptions["shell"]["isAuthenticated"]
  permissionCodes: ShellBindingOptions["shell"]["permissionCodes"]
  currentQuerySummary: ShellBindingOptions["customerWorkspace"]["currentQuerySummary"]
  moduleReady: ExampleModuleReadyRefs
  exportLoading: ExampleExportLoadingRefs
  exportHandlers: ExampleExportHandlers
  localizers: ExampleBindingLocalizers
  navigation: ReturnType<typeof useExampleNavigation>
  gates: ReturnType<typeof useExampleWorkspaceGates>
  shellMeta: ReturnType<typeof useExampleShellMeta>
  workspaces: ExampleWorkspaces
  submitLogin: ShellBindingOption<"submitLogin">
  submitLogout: ShellBindingOption<"submitLogout">
  vueEnterprisePresetStatus: ShellBindingOption<"vueEnterprisePresetStatus">
}

export const createExampleAppShellBindingsOptions = (
  input: CreateExampleAppShellBindingsOptionsInput,
) => {
  const selectedNavigationItemName = computed(
    () =>
      input.navigation.selectedNavigationItem.value?.name ??
      input.t("app.runtime.title"),
  )

  return createExampleShellBindingsOptions({
    shell: {
      t: input.t,
      platform: input.platform,
      authIdentity: input.authIdentity,
      locale: input.locale,
      loginForm: input.loginForm,
      envName: input.envName,
      authErrorMessage: input.authErrorMessage,
      selectedNavigationItemName,
      currentNavigationPath: input.navigation.currentNavigationPath,
      enterpriseSelectedTabKey: input.navigation.enterpriseSelectedTabKey,
      currentWorkspaceKind: input.navigation.currentWorkspaceKind,
      isRuntimeShellTab: input.navigation.isRuntimeShellTab,
      authStatusLabel: input.shellMeta.authStatusLabel,
      currentModuleStatusLabel: input.navigation.currentModuleStatusLabel,
      currentModuleCodeLabel: input.navigation.currentModuleCodeLabel,
      placeholderWorkspaceCopy: input.navigation.placeholderWorkspaceCopy,
      customerNavigationItem: input.navigation.customerNavigationItem,
      permissionCodes: input.permissionCodes,
      authModuleReady: input.moduleReady.authModuleReady,
      isAuthenticated: input.isAuthenticated,
      authLoading: input.authLoading,
      openCurrentWorkspaceTab: input.navigation.openCurrentWorkspaceTab,
      submitLogout: input.submitLogout,
      submitLogin: input.submitLogin,
      vueEnterprisePresetStatus: input.vueEnterprisePresetStatus,
    },
    roleWorkspace: {
      workspace: input.workspaces.roleWorkspace,
      isRoleWorkspace: input.navigation.isRoleWorkspace,
      roleExportLoading: input.exportLoading.roleExportLoading,
      canCreateRoles: input.gates.canCreateRoles,
      canViewRoles: input.gates.canViewRoles,
      roleModuleReady: input.moduleReady.roleModuleReady,
      canEnterRoleWorkspace: input.gates.canEnterRoleWorkspace,
      canUpdateRoles: input.gates.canUpdateRoles,
      handleExportRoles: input.exportHandlers.handleExportRoles,
    },
    customerWorkspace: {
      workspace: input.workspaces.customerWorkspace,
      isCustomerWorkspace: input.navigation.isCustomerWorkspace,
      canCreateCustomers: input.gates.canCreateCustomers,
      canViewCustomers: input.gates.canViewCustomers,
      canUpdateCustomers: input.gates.canUpdateCustomers,
      canDeleteCustomers: input.gates.canDeleteCustomers,
      customerModuleReady: input.moduleReady.customerModuleReady,
      canEnterCustomerWorkspace: input.gates.canEnterCustomerWorkspace,
      currentQuerySummary: input.currentQuerySummary,
      enterpriseCrudCopy: input.shellMeta.enterpriseCrudCopy,
      localizePlatformStatus: input.localizers.localizePlatformStatus,
      openCustomerWorkspace: input.navigation.openCustomerWorkspace,
    },
    dictionaryWorkspace: {
      workspace: input.workspaces.dictionaryWorkspace,
      isDictionaryWorkspace: input.navigation.isDictionaryWorkspace,
      dictionaryTypeExportLoading:
        input.exportLoading.dictionaryTypeExportLoading,
      dictionaryItemsExportLoading:
        input.exportLoading.dictionaryItemsExportLoading,
      canCreateDictionaryTypes: input.gates.canCreateDictionaryTypes,
      canViewDictionaries: input.gates.canViewDictionaries,
      dictionaryModuleReady: input.moduleReady.dictionaryModuleReady,
      canEnterDictionaryWorkspace: input.gates.canEnterDictionaryWorkspace,
      enterpriseFormCopy: input.shellMeta.enterpriseFormCopy,
      localizeDictionaryStatus: input.localizers.localizeDictionaryStatus,
      canUpdateDictionaryTypes: input.gates.canUpdateDictionaryTypes,
      handleExportDictionaryTypes:
        input.exportHandlers.handleExportDictionaryTypes,
      handleExportDictionaryItems:
        input.exportHandlers.handleExportDictionaryItems,
    },
    departmentWorkspace: {
      workspace: input.workspaces.departmentWorkspace,
      isDepartmentWorkspace: input.navigation.isDepartmentWorkspace,
      departmentExportLoading: input.exportLoading.departmentExportLoading,
      canCreateDepartments: input.gates.canCreateDepartments,
      canViewDepartments: input.gates.canViewDepartments,
      departmentModuleReady: input.moduleReady.departmentModuleReady,
      canEnterDepartmentWorkspace: input.gates.canEnterDepartmentWorkspace,
      canUpdateDepartments: input.gates.canUpdateDepartments,
      handleExportDepartments: input.exportHandlers.handleExportDepartments,
    },
    sessionWorkspace: {
      workspace: input.workspaces.sessionWorkspace,
      isSessionWorkspace: input.navigation.isSessionWorkspace,
      canEnterSessionWorkspace: input.gates.canEnterSessionWorkspace,
    },
    postWorkspace: {
      workspace: input.workspaces.postWorkspace,
      isPostWorkspace: input.navigation.isPostWorkspace,
      postExportLoading: input.exportLoading.postExportLoading,
      canCreatePosts: input.gates.canCreatePosts,
      canViewPosts: input.gates.canViewPosts,
      postModuleReady: input.moduleReady.postModuleReady,
      canEnterPostWorkspace: input.gates.canEnterPostWorkspace,
      canUpdatePosts: input.gates.canUpdatePosts,
      handleExportPosts: input.exportHandlers.handleExportPosts,
    },
    menuWorkspace: {
      workspace: input.workspaces.menuWorkspace,
      isMenuWorkspace: input.navigation.isMenuWorkspace,
      menuExportLoading: input.exportLoading.menuExportLoading,
      canCreateMenus: input.gates.canCreateMenus,
      canViewMenus: input.gates.canViewMenus,
      menuModuleReady: input.moduleReady.menuModuleReady,
      canEnterMenuWorkspace: input.gates.canEnterMenuWorkspace,
      canUpdateMenus: input.gates.canUpdateMenus,
      handleExportMenus: input.exportHandlers.handleExportMenus,
    },
    notificationWorkspace: {
      workspace: input.workspaces.notificationWorkspace,
      isNotificationWorkspace: input.navigation.isNotificationWorkspace,
      notificationExportLoading: input.exportLoading.notificationExportLoading,
      canCreateNotifications: input.gates.canCreateNotifications,
      canViewNotifications: input.gates.canViewNotifications,
      visibleUnreadNotificationCount:
        input.workspaces.notificationWorkspace.visibleUnreadNotificationCount,
      notificationModuleReady: input.moduleReady.notificationModuleReady,
      canEnterNotificationWorkspace: input.gates.canEnterNotificationWorkspace,
      canUpdateNotifications: input.gates.canUpdateNotifications,
      localizeNotificationStatus: input.localizers.localizeNotificationStatus,
      localizeNotificationLevel: input.localizers.localizeNotificationLevel,
      handleExportNotifications: input.exportHandlers.handleExportNotifications,
    },
    operationLogWorkspace: {
      workspace: input.workspaces.operationLogWorkspace,
      isOperationLogWorkspace: input.navigation.isOperationLogWorkspace,
      operationLogExportLoading: input.exportLoading.operationLogExportLoading,
      canViewOperationLogs: input.gates.canViewOperationLogs,
      canExportOperationLogs: input.gates.canExportOperationLogs,
      operationLogModuleReady: input.moduleReady.operationLogModuleReady,
      canEnterOperationLogWorkspace: input.gates.canEnterOperationLogWorkspace,
      handleExportOperationLogs: input.exportHandlers.handleExportOperationLogs,
    },
    userWorkspace: {
      workspace: input.workspaces.userWorkspace,
      isUserWorkspace: input.navigation.isUserWorkspace,
      userExportLoading: input.exportLoading.userExportLoading,
      canCreateUsers: input.gates.canCreateUsers,
      canViewUsers: input.gates.canViewUsers,
      userModuleReady: input.moduleReady.userModuleReady,
      canEnterUserWorkspace: input.gates.canEnterUserWorkspace,
      canUpdateUsers: input.gates.canUpdateUsers,
      canResetUserPasswords: input.gates.canResetUserPasswords,
      handleExportUsers: input.exportHandlers.handleExportUsers,
    },
    settingWorkspace: {
      workspace: input.workspaces.settingWorkspace,
      isSettingWorkspace: input.navigation.isSettingWorkspace,
      settingExportLoading: input.exportLoading.settingExportLoading,
      canCreateSettings: input.gates.canCreateSettings,
      canViewSettings: input.gates.canViewSettings,
      settingModuleReady: input.moduleReady.settingModuleReady,
      canEnterSettingWorkspace: input.gates.canEnterSettingWorkspace,
      canUpdateSettings: input.gates.canUpdateSettings,
      handleExportSettings: input.exportHandlers.handleExportSettings,
    },
    tenantWorkspace: {
      workspace: input.workspaces.tenantWorkspace,
      isTenantWorkspace: input.navigation.isTenantWorkspace,
      tenantExportLoading: input.exportLoading.tenantExportLoading,
      canCreateTenants: input.gates.canCreateTenants,
      canViewTenants: input.gates.canViewTenants,
      tenantModuleReady: input.moduleReady.tenantModuleReady,
      canEnterTenantWorkspace: input.gates.canEnterTenantWorkspace,
      canUpdateTenants: input.gates.canUpdateTenants,
      handleExportTenants: input.exportHandlers.handleExportTenants,
    },
    fileWorkspace: {
      workspace: input.workspaces.fileWorkspace,
      isFileWorkspace: input.navigation.isFileWorkspace,
      fileExportLoading: input.exportLoading.fileExportLoading,
      canViewFiles: input.gates.canViewFiles,
      canUploadFiles: input.gates.canUploadFiles,
      canDownloadFiles: input.gates.canDownloadFiles,
      canDeleteFiles: input.gates.canDeleteFiles,
      fileModuleReady: input.moduleReady.fileModuleReady,
      canEnterFileWorkspace: input.gates.canEnterFileWorkspace,
      handleExportFiles: input.exportHandlers.handleExportFiles,
    },
    workflowWorkspace: {
      workspace: input.workspaces.workflowWorkspace,
      isWorkflowDefinitionsWorkspace:
        input.navigation.isWorkflowDefinitionsWorkspace,
      canViewWorkflowDefinitions: input.gates.canViewWorkflowDefinitions,
      workflowModuleReady: input.moduleReady.workflowModuleReady,
      canEnterWorkflowWorkspace: input.gates.canEnterWorkflowWorkspace,
      localizeWorkflowStatus: input.localizers.localizeWorkflowStatus,
    },
    generatorPreviewWorkspace: {
      generatorPreviewLoading:
        input.workspaces.generatorPreviewWorkspace.loading,
      generatorPreviewReviewLoading:
        input.workspaces.generatorPreviewWorkspace.reviewLoading,
      generatorPreviewApplyLoading:
        input.workspaces.generatorPreviewWorkspace.applyLoading,
      generatorPreviewErrorMessage:
        input.workspaces.generatorPreviewWorkspace.errorMessage,
      generatorPreviewSchemaOptions:
        input.workspaces.generatorPreviewWorkspace.schemaOptions,
      generatorPreviewRecentSessionOptions:
        input.workspaces.generatorPreviewWorkspace.recentSessionOptions,
      selectedGeneratorPreviewRecentSessionId:
        input.workspaces.generatorPreviewWorkspace.selectedRecentSessionId,
      selectedGeneratorPreviewSchemaName:
        input.workspaces.generatorPreviewWorkspace.selectedSchemaName,
      selectedGeneratorPreviewFrontendTarget:
        input.workspaces.generatorPreviewWorkspace.selectedFrontendTarget,
      generatorPreviewQuery:
        input.workspaces.generatorPreviewWorkspace.previewQuery,
      generatorPreviewFilterSummary:
        input.workspaces.generatorPreviewWorkspace.filterSummary,
      generatorPreviewFiles:
        input.workspaces.generatorPreviewWorkspace.filteredPreviewFiles,
      selectedGeneratorPreviewFilePath:
        input.workspaces.generatorPreviewWorkspace.selectedFilePath,
      canApproveGeneratorPreview:
        input.workspaces.generatorPreviewWorkspace.canApprovePreview,
      canRejectGeneratorPreview:
        input.workspaces.generatorPreviewWorkspace.canRejectPreview,
      canApplyGeneratorPreview:
        input.workspaces.generatorPreviewWorkspace.canApplyPreview,
      generatorPreviewDiffSummary:
        input.workspaces.generatorPreviewWorkspace.currentDiffSummary,
      generatorPreviewSession:
        input.workspaces.generatorPreviewWorkspace.currentSession,
      selectedGeneratorPreviewSchema:
        input.workspaces.generatorPreviewWorkspace.selectedSchema,
      selectedGeneratorPreviewFile:
        input.workspaces.generatorPreviewWorkspace.selectedPreviewFile,
      generatorPreviewSqlPreview:
        input.workspaces.generatorPreviewWorkspace.sqlPreview,
      generatorPreviewSqlProposal:
        input.workspaces.generatorPreviewWorkspace.sqlProposal,
      generatorPreviewSqlProposalHandoff:
        input.workspaces.generatorPreviewWorkspace.sqlProposalHandoff,
      resetGeneratorPreviewFilters:
        input.workspaces.generatorPreviewWorkspace.resetFilters,
      refreshGeneratorPreview:
        input.workspaces.generatorPreviewWorkspace.refreshPreview,
      restoreGeneratorPreviewSession:
        input.workspaces.generatorPreviewWorkspace.restorePreviewSession,
      reviewGeneratorPreview:
        input.workspaces.generatorPreviewWorkspace.reviewPreview,
      applyGeneratorPreview:
        input.workspaces.generatorPreviewWorkspace.applyPreview,
    },
  })
}
