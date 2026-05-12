import type { useAuthSessionWorkspace } from "../workspaces/use-auth-session-workspace"
import type { useCustomerWorkspace } from "../workspaces/use-customer-workspace"
import type { useDepartmentWorkspace } from "../workspaces/use-department-workspace"
import type { useDictionaryWorkspace } from "../workspaces/use-dictionary-workspace"
import type { useFileWorkspace } from "../workspaces/use-file-workspace"
import type { useMenuWorkspace } from "../workspaces/use-menu-workspace"
import type { useNotificationWorkspace } from "../workspaces/use-notification-workspace"
import type { useOperationLogWorkspace } from "../workspaces/use-operation-log-workspace"
import type { usePostWorkspace } from "../workspaces/use-post-workspace"
import type { useRoleWorkspace } from "../workspaces/use-role-workspace"
import type { useSettingWorkspace } from "../workspaces/use-setting-workspace"
import type { useTenantWorkspace } from "../workspaces/use-tenant-workspace"
import type { useUserWorkspace } from "../workspaces/use-user-workspace"
import type { useWorkflowWorkspace } from "../workspaces/use-workflow-workspace"
import type { UseExampleShellBindingsOptions } from "./use-example-shell-binding-types"

export type BindingSegment<Keys extends keyof UseExampleShellBindingsOptions> =
  Pick<UseExampleShellBindingsOptions, Keys>

type OptionValue<Key extends keyof UseExampleShellBindingsOptions> =
  UseExampleShellBindingsOptions[Key]

export interface CreateExampleShellBindingsOptionsInput {
  shell: BindingSegment<
    | "t"
    | "platform"
    | "authIdentity"
    | "locale"
    | "loginForm"
    | "envName"
    | "authErrorMessage"
    | "selectedNavigationItemName"
    | "currentNavigationPath"
    | "enterpriseSelectedTabKey"
    | "currentWorkspaceKind"
    | "authStatusLabel"
    | "currentModuleStatusLabel"
    | "currentModuleCodeLabel"
    | "placeholderWorkspaceCopy"
    | "customerNavigationItem"
    | "permissionCodes"
    | "authModuleReady"
    | "isAuthenticated"
    | "authLoading"
    | "submitLogout"
    | "submitLogin"
    | "vueEnterprisePresetStatus"
  >
  roleWorkspace: {
    workspace: ReturnType<typeof useRoleWorkspace>
    isRoleWorkspace: OptionValue<"isRoleWorkspace">
    roleExportLoading: OptionValue<"roleExportLoading">
    canCreateRoles: OptionValue<"canCreateRoles">
    canViewRoles: OptionValue<"canViewRoles">
    roleModuleReady: OptionValue<"roleModuleReady">
    canEnterRoleWorkspace: OptionValue<"canEnterRoleWorkspace">
    canUpdateRoles: OptionValue<"canUpdateRoles">
    handleExportRoles: OptionValue<"handleExportRoles">
  }
  customerWorkspace: {
    workspace: ReturnType<typeof useCustomerWorkspace>
    isCustomerWorkspace: OptionValue<"isCustomerWorkspace">
    canCreateCustomers: OptionValue<"canCreateCustomers">
    canViewCustomers: OptionValue<"canViewCustomers">
    canUpdateCustomers: OptionValue<"canUpdateCustomers">
    canDeleteCustomers: OptionValue<"canDeleteCustomers">
    customerModuleReady: OptionValue<"customerModuleReady">
    canEnterCustomerWorkspace: OptionValue<"canEnterCustomerWorkspace">
    currentQuerySummary: OptionValue<"currentQuerySummary">
    enterpriseCrudCopy: OptionValue<"enterpriseCrudCopy">
    localizePlatformStatus: OptionValue<"localizePlatformStatus">
    openCustomerWorkspace: OptionValue<"openCustomerWorkspace">
  }
  dictionaryWorkspace: {
    workspace: ReturnType<typeof useDictionaryWorkspace>
    isDictionaryWorkspace: OptionValue<"isDictionaryWorkspace">
    dictionaryTypeExportLoading: OptionValue<"dictionaryTypeExportLoading">
    dictionaryItemsExportLoading: OptionValue<"dictionaryItemsExportLoading">
    canCreateDictionaryTypes: OptionValue<"canCreateDictionaryTypes">
    canViewDictionaries: OptionValue<"canViewDictionaries">
    dictionaryModuleReady: OptionValue<"dictionaryModuleReady">
    canEnterDictionaryWorkspace: OptionValue<"canEnterDictionaryWorkspace">
    enterpriseFormCopy: OptionValue<"enterpriseFormCopy">
    localizeDictionaryStatus: OptionValue<"localizeDictionaryStatus">
    canUpdateDictionaryTypes: OptionValue<"canUpdateDictionaryTypes">
    handleExportDictionaryTypes: OptionValue<"handleExportDictionaryTypes">
    handleExportDictionaryItems: OptionValue<"handleExportDictionaryItems">
  }
  departmentWorkspace: {
    workspace: ReturnType<typeof useDepartmentWorkspace>
    isDepartmentWorkspace: OptionValue<"isDepartmentWorkspace">
    departmentExportLoading: OptionValue<"departmentExportLoading">
    canCreateDepartments: OptionValue<"canCreateDepartments">
    canViewDepartments: OptionValue<"canViewDepartments">
    departmentModuleReady: OptionValue<"departmentModuleReady">
    canEnterDepartmentWorkspace: OptionValue<"canEnterDepartmentWorkspace">
    canUpdateDepartments: OptionValue<"canUpdateDepartments">
    handleExportDepartments: OptionValue<"handleExportDepartments">
  }
  sessionWorkspace: {
    workspace: ReturnType<typeof useAuthSessionWorkspace>
    isSessionWorkspace: OptionValue<"isSessionWorkspace">
    canEnterSessionWorkspace: OptionValue<"canEnterSessionWorkspace">
  }
  postWorkspace: {
    workspace: ReturnType<typeof usePostWorkspace>
    isPostWorkspace: OptionValue<"isPostWorkspace">
    postExportLoading: OptionValue<"postExportLoading">
    canCreatePosts: OptionValue<"canCreatePosts">
    canViewPosts: OptionValue<"canViewPosts">
    postModuleReady: OptionValue<"postModuleReady">
    canEnterPostWorkspace: OptionValue<"canEnterPostWorkspace">
    canUpdatePosts: OptionValue<"canUpdatePosts">
    handleExportPosts: OptionValue<"handleExportPosts">
  }
  menuWorkspace: {
    workspace: ReturnType<typeof useMenuWorkspace>
    isMenuWorkspace: OptionValue<"isMenuWorkspace">
    menuExportLoading: OptionValue<"menuExportLoading">
    canCreateMenus: OptionValue<"canCreateMenus">
    canViewMenus: OptionValue<"canViewMenus">
    menuModuleReady: OptionValue<"menuModuleReady">
    canEnterMenuWorkspace: OptionValue<"canEnterMenuWorkspace">
    canUpdateMenus: OptionValue<"canUpdateMenus">
    handleExportMenus: OptionValue<"handleExportMenus">
  }
  notificationWorkspace: {
    workspace: ReturnType<typeof useNotificationWorkspace>
    isNotificationWorkspace: OptionValue<"isNotificationWorkspace">
    notificationExportLoading: OptionValue<"notificationExportLoading">
    canCreateNotifications: OptionValue<"canCreateNotifications">
    canViewNotifications: OptionValue<"canViewNotifications">
    visibleUnreadNotificationCount: OptionValue<"visibleUnreadNotificationCount">
    notificationModuleReady: OptionValue<"notificationModuleReady">
    canEnterNotificationWorkspace: OptionValue<"canEnterNotificationWorkspace">
    canUpdateNotifications: OptionValue<"canUpdateNotifications">
    localizeNotificationStatus: OptionValue<"localizeNotificationStatus">
    localizeNotificationLevel: OptionValue<"localizeNotificationLevel">
    handleExportNotifications: OptionValue<"handleExportNotifications">
  }
  operationLogWorkspace: {
    workspace: ReturnType<typeof useOperationLogWorkspace>
    isOperationLogWorkspace: OptionValue<"isOperationLogWorkspace">
    operationLogExportLoading: OptionValue<"operationLogExportLoading">
    canViewOperationLogs: OptionValue<"canViewOperationLogs">
    canExportOperationLogs: OptionValue<"canExportOperationLogs">
    operationLogModuleReady: OptionValue<"operationLogModuleReady">
    canEnterOperationLogWorkspace: OptionValue<"canEnterOperationLogWorkspace">
    handleExportOperationLogs: OptionValue<"handleExportOperationLogs">
  }
  userWorkspace: {
    workspace: ReturnType<typeof useUserWorkspace>
    isUserWorkspace: OptionValue<"isUserWorkspace">
    userExportLoading: OptionValue<"userExportLoading">
    canCreateUsers: OptionValue<"canCreateUsers">
    canViewUsers: OptionValue<"canViewUsers">
    userModuleReady: OptionValue<"userModuleReady">
    canEnterUserWorkspace: OptionValue<"canEnterUserWorkspace">
    canUpdateUsers: OptionValue<"canUpdateUsers">
    canResetUserPasswords: OptionValue<"canResetUserPasswords">
    handleExportUsers: OptionValue<"handleExportUsers">
  }
  settingWorkspace: {
    workspace: ReturnType<typeof useSettingWorkspace>
    isSettingWorkspace: OptionValue<"isSettingWorkspace">
    settingExportLoading: OptionValue<"settingExportLoading">
    canCreateSettings: OptionValue<"canCreateSettings">
    canViewSettings: OptionValue<"canViewSettings">
    settingModuleReady: OptionValue<"settingModuleReady">
    canEnterSettingWorkspace: OptionValue<"canEnterSettingWorkspace">
    canUpdateSettings: OptionValue<"canUpdateSettings">
    handleExportSettings: OptionValue<"handleExportSettings">
  }
  tenantWorkspace: {
    workspace: ReturnType<typeof useTenantWorkspace>
    isTenantWorkspace: OptionValue<"isTenantWorkspace">
    tenantExportLoading: OptionValue<"tenantExportLoading">
    canCreateTenants: OptionValue<"canCreateTenants">
    canViewTenants: OptionValue<"canViewTenants">
    tenantModuleReady: OptionValue<"tenantModuleReady">
    canEnterTenantWorkspace: OptionValue<"canEnterTenantWorkspace">
    canUpdateTenants: OptionValue<"canUpdateTenants">
    handleExportTenants: OptionValue<"handleExportTenants">
  }
  fileWorkspace: {
    workspace: ReturnType<typeof useFileWorkspace>
    isFileWorkspace: OptionValue<"isFileWorkspace">
    fileExportLoading: OptionValue<"fileExportLoading">
    canViewFiles: OptionValue<"canViewFiles">
    canUploadFiles: OptionValue<"canUploadFiles">
    canDownloadFiles: OptionValue<"canDownloadFiles">
    canDeleteFiles: OptionValue<"canDeleteFiles">
    fileModuleReady: OptionValue<"fileModuleReady">
    canEnterFileWorkspace: OptionValue<"canEnterFileWorkspace">
    handleExportFiles: OptionValue<"handleExportFiles">
  }
  workflowWorkspace: {
    workspace: ReturnType<typeof useWorkflowWorkspace>
    isWorkflowDefinitionsWorkspace: OptionValue<"isWorkflowDefinitionsWorkspace">
    canViewWorkflowDefinitions: OptionValue<"canViewWorkflowDefinitions">
    workflowModuleReady: OptionValue<"workflowModuleReady">
    canEnterWorkflowWorkspace: OptionValue<"canEnterWorkflowWorkspace">
    localizeWorkflowStatus: OptionValue<"localizeWorkflowStatus">
  }
  generatorPreviewWorkspace: BindingSegment<
    | "generatorPreviewLoading"
    | "generatorPreviewReviewLoading"
    | "generatorPreviewApplyLoading"
    | "generatorPreviewErrorMessage"
    | "generatorPreviewInputModeOptions"
    | "generatorPreviewSchemaOptions"
    | "generatorPreviewConflictStrategyOptions"
    | "generatorPreviewRecentSessionOptions"
    | "selectedGeneratorPreviewInputMode"
    | "selectedGeneratorPreviewConflictStrategy"
    | "selectedGeneratorPreviewRecentSessionId"
    | "selectedGeneratorPreviewSchemaName"
    | "selectedGeneratorPreviewFrontendTarget"
    | "generatorPreviewCurrentStep"
    | "generatorPreviewManualSchemaDraft"
    | "generatorPreviewManualSchemaDraftError"
    | "generatorPreviewManualSchemaDraftErrorDetails"
    | "generatorPreviewManualSchemaDraftErrorSuggestion"
    | "generatorPreviewQuery"
    | "generatorPreviewFiles"
    | "selectedGeneratorPreviewFilePath"
    | "canApproveGeneratorPreview"
    | "canRejectGeneratorPreview"
    | "canApplyGeneratorPreview"
    | "canConfirmGeneratorPreview"
    | "generatorPreviewDiffSummary"
    | "generatorPreviewSession"
    | "selectedGeneratorPreviewSchema"
    | "selectedGeneratorPreviewFile"
    | "generatorPreviewSqlPreview"
    | "generatorPreviewSqlProposal"
    | "generatorPreviewSqlProposalHandoff"
    | "loadSelectedSchemaDraft"
    | "loadGeneratorSchemaTemplate"
    | "resetGeneratorPreviewFilters"
    | "refreshGeneratorPreview"
    | "resetGeneratorPreviewState"
    | "restoreGeneratorPreviewSession"
    | "reviewGeneratorPreview"
    | "confirmGeneratorPreview"
    | "applyGeneratorPreview"
  >
}

export type RoleWorkspaceBindingsOptions = BindingSegment<
  | "isRoleWorkspace"
  | "roleLoading"
  | "roleExportLoading"
  | "canCreateRoles"
  | "canViewRoles"
  | "roleModuleReady"
  | "canEnterRoleWorkspace"
  | "roleWorkspaceState"
  | "roleErrorMessage"
  | "enterpriseRoleQueryFields"
  | "enterpriseRoleTableColumns"
  | "roleCountLabel"
  | "canUpdateRoles"
  | "roleDetailLoading"
  | "roleDetailErrorMessage"
  | "rolePanelMode"
  | "rolePanelTitle"
  | "rolePanelDescription"
  | "selectedRole"
  | "selectedRoleDetail"
  | "enterpriseRoleFormFields"
  | "enterpriseRoleFormValues"
  | "handleRoleSearch"
  | "handleRoleReset"
  | "handleRoleRowClick"
  | "openRoleCreatePanel"
  | "reloadRoles"
  | "handleExportRoles"
  | "startRoleEdit"
  | "submitRoleForm"
  | "cancelRolePanel"
>

export type CustomerWorkspaceBindingsOptions = BindingSegment<
  | "isCustomerWorkspace"
  | "customerLoading"
  | "customerWorkspaceState"
  | "canCreateCustomers"
  | "canViewCustomers"
  | "canUpdateCustomers"
  | "canDeleteCustomers"
  | "customerModuleReady"
  | "canEnterCustomerWorkspace"
  | "customerErrorMessage"
  | "enterpriseQueryFields"
  | "enterpriseTableColumns"
  | "enterpriseTableActions"
  | "customerCountLabel"
  | "currentQuerySummary"
  | "enterpriseCrudCopy"
  | "localizePlatformStatus"
  | "customerPaginationSummary"
  | "customerListPageSize"
  | "customerListSortValue"
  | "customerPageInputValue"
  | "customerPageSizeOptions"
  | "customerSortOptions"
  | "canGoToPreviousCustomerPage"
  | "canGoToNextCustomerPage"
  | "canJumpToCustomerPage"
  | "enterpriseFormMode"
  | "enterprisePanelTitle"
  | "enterprisePanelDescription"
  | "deleteConfirmId"
  | "selectedCustomer"
  | "enterpriseFormFields"
  | "enterpriseFormValues"
  | "openCustomerWorkspace"
  | "handleEnterpriseSearch"
  | "handleEnterpriseReset"
  | "handleEnterpriseAction"
  | "handleEnterpriseRowClick"
  | "handleCustomerPageSizeChange"
  | "handleCustomerSortChange"
  | "goToFirstCustomerPage"
  | "goToPreviousCustomerPage"
  | "goToNextCustomerPage"
  | "goToLastCustomerPage"
  | "updateCustomerPageInput"
  | "submitCustomerPageJump"
  | "openCreatePanel"
  | "reloadCustomers"
  | "confirmDelete"
  | "cancelDelete"
  | "startEdit"
  | "requestDelete"
  | "handleEnterpriseFormSubmit"
  | "handleEnterpriseFormCancel"
>

export type DictionaryWorkspaceBindingsOptions = BindingSegment<
  | "isDictionaryWorkspace"
  | "dictionaryLoading"
  | "dictionaryTypeExportLoading"
  | "dictionaryItemsExportLoading"
  | "canCreateDictionaryTypes"
  | "canViewDictionaries"
  | "dictionaryModuleReady"
  | "canEnterDictionaryWorkspace"
  | "dictionaryWorkspaceState"
  | "dictionaryErrorMessage"
  | "enterpriseDictionaryQueryFields"
  | "enterpriseDictionaryTableColumns"
  | "dictionaryCountLabel"
  | "dictionaryDetailLoading"
  | "dictionaryDetailErrorMessage"
  | "dictionaryPanelMode"
  | "dictionaryPanelTitle"
  | "dictionaryPanelDescription"
  | "selectedDictionaryType"
  | "selectedDictionaryTypeItems"
  | "enterpriseDictionaryFormFields"
  | "enterpriseDictionaryFormValues"
  | "enterpriseFormCopy"
  | "localizeDictionaryStatus"
  | "canUpdateDictionaryTypes"
  | "handleDictionarySearch"
  | "handleDictionaryReset"
  | "handleDictionaryRowClick"
  | "openDictionaryCreatePanel"
  | "reloadDictionaries"
  | "handleExportDictionaryTypes"
  | "handleExportDictionaryItems"
  | "startDictionaryEdit"
  | "submitDictionaryForm"
  | "cancelDictionaryPanel"
>

export type DepartmentWorkspaceBindingsOptions = BindingSegment<
  | "isDepartmentWorkspace"
  | "departmentLoading"
  | "departmentWorkspaceState"
  | "departmentExportLoading"
  | "canCreateDepartments"
  | "canViewDepartments"
  | "departmentModuleReady"
  | "canEnterDepartmentWorkspace"
  | "departmentErrorMessage"
  | "enterpriseDepartmentQueryFields"
  | "enterpriseDepartmentTableColumns"
  | "enterpriseDepartmentTableItems"
  | "departmentCountLabel"
  | "canUpdateDepartments"
  | "departmentDetailLoading"
  | "departmentDetailErrorMessage"
  | "departmentPanelMode"
  | "departmentPanelTitle"
  | "departmentPanelDescription"
  | "selectedDepartment"
  | "selectedDepartmentDetail"
  | "enterpriseDepartmentFormFields"
  | "enterpriseDepartmentFormValues"
  | "departmentParentLookup"
  | "handleDepartmentSearch"
  | "handleDepartmentReset"
  | "handleDepartmentRowClick"
  | "openDepartmentCreatePanel"
  | "reloadDepartments"
  | "handleExportDepartments"
  | "startDepartmentEdit"
  | "submitDepartmentForm"
  | "cancelDepartmentPanel"
>

export type SessionWorkspaceBindingsOptions = BindingSegment<
  | "isSessionWorkspace"
  | "sessionLoading"
  | "canEnterSessionWorkspace"
  | "sessionErrorMessage"
  | "enterpriseSessionQueryFields"
  | "enterpriseSessionTableColumns"
  | "enterpriseSessionTableItems"
  | "sessionCountLabel"
  | "sessionActionLoading"
  | "selectedSession"
  | "handleSessionSearch"
  | "handleSessionReset"
  | "handleSessionRowClick"
  | "revokeSelectedSession"
>

export type PostWorkspaceBindingsOptions = BindingSegment<
  | "isPostWorkspace"
  | "postLoading"
  | "postWorkspaceState"
  | "postExportLoading"
  | "canCreatePosts"
  | "canViewPosts"
  | "postModuleReady"
  | "canEnterPostWorkspace"
  | "postErrorMessage"
  | "enterprisePostQueryFields"
  | "enterprisePostTableColumns"
  | "postCountLabel"
  | "canUpdatePosts"
  | "postDetailLoading"
  | "postDetailErrorMessage"
  | "postPanelMode"
  | "postPanelTitle"
  | "postPanelDescription"
  | "selectedPost"
  | "enterprisePostFormFields"
  | "enterprisePostFormValues"
  | "handlePostSearch"
  | "handlePostReset"
  | "handlePostRowClick"
  | "openPostCreatePanel"
  | "reloadPosts"
  | "handleExportPosts"
  | "startPostEdit"
  | "submitPostForm"
  | "cancelPostPanel"
>

export type MenuWorkspaceBindingsOptions = BindingSegment<
  | "isMenuWorkspace"
  | "menuLoading"
  | "menuWorkspaceState"
  | "menuExportLoading"
  | "canCreateMenus"
  | "canViewMenus"
  | "menuModuleReady"
  | "canEnterMenuWorkspace"
  | "menuErrorMessage"
  | "enterpriseMenuQueryFields"
  | "enterpriseMenuTableColumns"
  | "menuCountLabel"
  | "canUpdateMenus"
  | "menuDetailLoading"
  | "menuDetailErrorMessage"
  | "menuPanelMode"
  | "menuPanelTitle"
  | "menuPanelDescription"
  | "selectedMenu"
  | "selectedMenuDetail"
  | "enterpriseMenuFormFields"
  | "enterpriseMenuFormValues"
  | "menuParentLookup"
  | "handleMenuSearch"
  | "handleMenuReset"
  | "handleMenuRowClick"
  | "openMenuCreatePanel"
  | "reloadMenus"
  | "handleExportMenus"
  | "startMenuEdit"
  | "submitMenuForm"
  | "cancelMenuPanel"
>

export type NotificationWorkspaceBindingsOptions = BindingSegment<
  | "isNotificationWorkspace"
  | "notificationLoading"
  | "notificationWorkspaceState"
  | "notificationExportLoading"
  | "canCreateNotifications"
  | "canViewNotifications"
  | "visibleUnreadNotificationCount"
  | "notificationModuleReady"
  | "canEnterNotificationWorkspace"
  | "enterpriseNotificationQueryFields"
  | "enterpriseNotificationTableColumns"
  | "notificationCountLabel"
  | "canUpdateNotifications"
  | "localizeNotificationStatus"
  | "localizeNotificationLevel"
  | "handleNotificationSearch"
  | "handleNotificationReset"
  | "handleNotificationRowClick"
  | "openNotificationCreatePanel"
  | "reloadNotifications"
  | "handleExportNotifications"
  | "markSelectedNotificationAsRead"
  | "markVisibleNotificationsAsRead"
  | "submitNotificationForm"
  | "cancelNotificationPanel"
>

export type OperationLogWorkspaceBindingsOptions = BindingSegment<
  | "isOperationLogWorkspace"
  | "operationLogLoading"
  | "operationLogExportLoading"
  | "canViewOperationLogs"
  | "canExportOperationLogs"
  | "operationLogModuleReady"
  | "canEnterOperationLogWorkspace"
  | "operationLogErrorMessage"
  | "enterpriseOperationLogQueryFields"
  | "enterpriseOperationLogTableColumns"
  | "enterpriseOperationLogTableItems"
  | "operationLogCountLabel"
  | "operationLogDetailLoading"
  | "operationLogDetailErrorMessage"
  | "operationLogPanelTitle"
  | "operationLogPanelDescription"
  | "selectedOperationLog"
  | "enterpriseOperationLogDetailFields"
  | "enterpriseOperationLogDetailValues"
  | "operationLogDetailsText"
  | "handleOperationLogSearch"
  | "handleOperationLogReset"
  | "handleOperationLogRowClick"
  | "reloadOperationLogs"
  | "handleExportOperationLogs"
>

export type UserWorkspaceBindingsOptions = BindingSegment<
  | "isUserWorkspace"
  | "userLoading"
  | "userWorkspaceState"
  | "userExportLoading"
  | "canCreateUsers"
  | "canViewUsers"
  | "userModuleReady"
  | "canEnterUserWorkspace"
  | "enterpriseUserQueryFields"
  | "enterpriseUserTableColumns"
  | "userCountLabel"
  | "canUpdateUsers"
  | "canResetUserPasswords"
  | "userPasswordInput"
  | "handleUserSearch"
  | "handleUserReset"
  | "handleUserRowClick"
  | "openUserCreatePanel"
  | "reloadUsers"
  | "handleExportUsers"
  | "startUserEdit"
  | "startUserPasswordReset"
  | "submitUserForm"
  | "cancelUserPanel"
  | "submitUserPasswordReset"
>

export type SettingWorkspaceBindingsOptions = BindingSegment<
  | "isSettingWorkspace"
  | "settingLoading"
  | "settingWorkspaceState"
  | "settingExportLoading"
  | "canCreateSettings"
  | "canViewSettings"
  | "settingModuleReady"
  | "canEnterSettingWorkspace"
  | "enterpriseSettingQueryFields"
  | "enterpriseSettingTableColumns"
  | "settingCountLabel"
  | "canUpdateSettings"
  | "handleSettingSearch"
  | "handleSettingReset"
  | "handleSettingRowClick"
  | "openSettingCreatePanel"
  | "reloadSettings"
  | "handleExportSettings"
  | "startSettingEdit"
  | "submitSettingForm"
  | "cancelSettingPanel"
>

export type TenantWorkspaceBindingsOptions = BindingSegment<
  | "isTenantWorkspace"
  | "tenantLoading"
  | "tenantWorkspaceState"
  | "tenantExportLoading"
  | "canCreateTenants"
  | "canViewTenants"
  | "tenantModuleReady"
  | "canEnterTenantWorkspace"
  | "enterpriseTenantQueryFields"
  | "enterpriseTenantTableColumns"
  | "tenantCountLabel"
  | "canUpdateTenants"
  | "handleTenantSearch"
  | "handleTenantReset"
  | "handleTenantRowClick"
  | "openTenantCreatePanel"
  | "reloadTenants"
  | "handleExportTenants"
  | "startTenantEdit"
  | "toggleSelectedTenantStatus"
  | "submitTenantForm"
  | "cancelTenantPanel"
>

export type FileWorkspaceBindingsOptions = BindingSegment<
  | "isFileWorkspace"
  | "fileLoading"
  | "fileExportLoading"
  | "canViewFiles"
  | "canUploadFiles"
  | "canDownloadFiles"
  | "canDeleteFiles"
  | "fileModuleReady"
  | "canEnterFileWorkspace"
  | "fileErrorMessage"
  | "fileQuery"
  | "fileFilterSummary"
  | "fileCountLabel"
  | "fileTableItems"
  | "hasActiveFileFilters"
  | "visibleFileCount"
  | "selectedFileId"
  | "fileDetailLoading"
  | "fileActionLoading"
  | "fileDetailErrorMessage"
  | "filePanelMode"
  | "selectedFile"
  | "pendingUploadFile"
  | "fileItems"
  | "updateFileQuery"
  | "resetFileQuery"
  | "selectFile"
  | "openFileUploadPanel"
  | "reloadFiles"
  | "handleExportFiles"
  | "deleteVisibleFiles"
  | "setPendingUploadFile"
  | "submitFileUpload"
  | "downloadSelectedFile"
  | "openFileDeletePanel"
  | "confirmFileDelete"
  | "cancelFilePanel"
>

export type WorkflowWorkspaceBindingsOptions = BindingSegment<
  | "isWorkflowDefinitionsWorkspace"
  | "workflowLoading"
  | "canViewWorkflowDefinitions"
  | "workflowModuleReady"
  | "canEnterWorkflowWorkspace"
  | "workflowErrorMessage"
  | "workflowQuery"
  | "workflowDefinitionCards"
  | "workflowDefinitions"
  | "workflowPaginationSummary"
  | "workflowCanGoToPreviousPage"
  | "workflowCanGoToNextPage"
  | "workflowDetailDialogOpen"
  | "selectedWorkflowDefinitionId"
  | "workflowDetailLoading"
  | "workflowDetailErrorMessage"
  | "selectedWorkflowDefinition"
  | "localizeWorkflowStatus"
  | "handleWorkflowDefinitionSelect"
  | "closeWorkflowDefinitionDetail"
  | "setWorkflowQuery"
  | "resetWorkflowFilters"
  | "goToPreviousWorkflowPage"
  | "goToNextWorkflowPage"
  | "reloadWorkflowDefinitions"
>
