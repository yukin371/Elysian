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
    | "isRuntimeShellTab"
    | "authStatusLabel"
    | "currentModuleStatusLabel"
    | "currentModuleCodeLabel"
    | "placeholderWorkspaceCopy"
    | "customerNavigationItem"
    | "permissionCodes"
    | "authModuleReady"
    | "isAuthenticated"
    | "authLoading"
    | "openCurrentWorkspaceTab"
    | "submitLogout"
    | "submitLogin"
    | "vueEnterprisePresetStatus"
  >
  roleWorkspace: {
    workspace: ReturnType<typeof useRoleWorkspace>
    isRoleWorkspace: OptionValue<"isRoleWorkspace">
    canCreateRoles: OptionValue<"canCreateRoles">
    canViewRoles: OptionValue<"canViewRoles">
    roleModuleReady: OptionValue<"roleModuleReady">
    canEnterRoleWorkspace: OptionValue<"canEnterRoleWorkspace">
    canUpdateRoles: OptionValue<"canUpdateRoles">
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
    canCreateDictionaryTypes: OptionValue<"canCreateDictionaryTypes">
    canViewDictionaries: OptionValue<"canViewDictionaries">
    dictionaryModuleReady: OptionValue<"dictionaryModuleReady">
    canEnterDictionaryWorkspace: OptionValue<"canEnterDictionaryWorkspace">
    enterpriseFormCopy: OptionValue<"enterpriseFormCopy">
    localizeDictionaryStatus: OptionValue<"localizeDictionaryStatus">
    canUpdateDictionaryTypes: OptionValue<"canUpdateDictionaryTypes">
  }
  departmentWorkspace: {
    workspace: ReturnType<typeof useDepartmentWorkspace>
    isDepartmentWorkspace: OptionValue<"isDepartmentWorkspace">
    canCreateDepartments: OptionValue<"canCreateDepartments">
    canViewDepartments: OptionValue<"canViewDepartments">
    departmentModuleReady: OptionValue<"departmentModuleReady">
    canEnterDepartmentWorkspace: OptionValue<"canEnterDepartmentWorkspace">
    canUpdateDepartments: OptionValue<"canUpdateDepartments">
  }
  sessionWorkspace: {
    workspace: ReturnType<typeof useAuthSessionWorkspace>
    isSessionWorkspace: OptionValue<"isSessionWorkspace">
    canEnterSessionWorkspace: OptionValue<"canEnterSessionWorkspace">
  }
  postWorkspace: {
    workspace: ReturnType<typeof usePostWorkspace>
    isPostWorkspace: OptionValue<"isPostWorkspace">
    canCreatePosts: OptionValue<"canCreatePosts">
    canViewPosts: OptionValue<"canViewPosts">
    postModuleReady: OptionValue<"postModuleReady">
    canEnterPostWorkspace: OptionValue<"canEnterPostWorkspace">
    canUpdatePosts: OptionValue<"canUpdatePosts">
  }
  menuWorkspace: {
    workspace: ReturnType<typeof useMenuWorkspace>
    isMenuWorkspace: OptionValue<"isMenuWorkspace">
    canCreateMenus: OptionValue<"canCreateMenus">
    canViewMenus: OptionValue<"canViewMenus">
    menuModuleReady: OptionValue<"menuModuleReady">
    canEnterMenuWorkspace: OptionValue<"canEnterMenuWorkspace">
    canUpdateMenus: OptionValue<"canUpdateMenus">
  }
  notificationWorkspace: {
    workspace: ReturnType<typeof useNotificationWorkspace>
    isNotificationWorkspace: OptionValue<"isNotificationWorkspace">
    canCreateNotifications: OptionValue<"canCreateNotifications">
    canViewNotifications: OptionValue<"canViewNotifications">
    notificationModuleReady: OptionValue<"notificationModuleReady">
    canEnterNotificationWorkspace: OptionValue<"canEnterNotificationWorkspace">
    canUpdateNotifications: OptionValue<"canUpdateNotifications">
    localizeNotificationStatus: OptionValue<"localizeNotificationStatus">
    localizeNotificationLevel: OptionValue<"localizeNotificationLevel">
  }
  operationLogWorkspace: {
    workspace: ReturnType<typeof useOperationLogWorkspace>
    isOperationLogWorkspace: OptionValue<"isOperationLogWorkspace">
    canViewOperationLogs: OptionValue<"canViewOperationLogs">
    operationLogModuleReady: OptionValue<"operationLogModuleReady">
    canEnterOperationLogWorkspace: OptionValue<"canEnterOperationLogWorkspace">
  }
  userWorkspace: {
    workspace: ReturnType<typeof useUserWorkspace>
    isUserWorkspace: OptionValue<"isUserWorkspace">
    canCreateUsers: OptionValue<"canCreateUsers">
    canViewUsers: OptionValue<"canViewUsers">
    userModuleReady: OptionValue<"userModuleReady">
    canEnterUserWorkspace: OptionValue<"canEnterUserWorkspace">
    canUpdateUsers: OptionValue<"canUpdateUsers">
    canResetUserPasswords: OptionValue<"canResetUserPasswords">
  }
  settingWorkspace: {
    workspace: ReturnType<typeof useSettingWorkspace>
    isSettingWorkspace: OptionValue<"isSettingWorkspace">
    canCreateSettings: OptionValue<"canCreateSettings">
    canViewSettings: OptionValue<"canViewSettings">
    settingModuleReady: OptionValue<"settingModuleReady">
    canEnterSettingWorkspace: OptionValue<"canEnterSettingWorkspace">
    canUpdateSettings: OptionValue<"canUpdateSettings">
  }
  tenantWorkspace: {
    workspace: ReturnType<typeof useTenantWorkspace>
    isTenantWorkspace: OptionValue<"isTenantWorkspace">
    canCreateTenants: OptionValue<"canCreateTenants">
    canViewTenants: OptionValue<"canViewTenants">
    tenantModuleReady: OptionValue<"tenantModuleReady">
    canEnterTenantWorkspace: OptionValue<"canEnterTenantWorkspace">
    canUpdateTenants: OptionValue<"canUpdateTenants">
  }
  fileWorkspace: {
    workspace: ReturnType<typeof useFileWorkspace>
    isFileWorkspace: OptionValue<"isFileWorkspace">
    canViewFiles: OptionValue<"canViewFiles">
    canUploadFiles: OptionValue<"canUploadFiles">
    canDownloadFiles: OptionValue<"canDownloadFiles">
    canDeleteFiles: OptionValue<"canDeleteFiles">
    fileModuleReady: OptionValue<"fileModuleReady">
    canEnterFileWorkspace: OptionValue<"canEnterFileWorkspace">
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
    | "generatorPreviewApplyLoading"
    | "generatorPreviewErrorMessage"
    | "generatorPreviewSchemaOptions"
    | "selectedGeneratorPreviewSchemaName"
    | "selectedGeneratorPreviewFrontendTarget"
    | "generatorPreviewQuery"
    | "generatorPreviewFilterSummary"
    | "generatorPreviewFiles"
    | "selectedGeneratorPreviewFilePath"
    | "canApplyGeneratorPreview"
    | "generatorPreviewDiffSummary"
    | "generatorPreviewSession"
    | "selectedGeneratorPreviewSchema"
    | "selectedGeneratorPreviewFile"
    | "generatorPreviewSqlPreview"
    | "resetGeneratorPreviewFilters"
    | "refreshGeneratorPreview"
    | "applyGeneratorPreview"
  >
}

export type RoleWorkspaceBindingsOptions = BindingSegment<
  | "isRoleWorkspace"
  | "roleLoading"
  | "canCreateRoles"
  | "canViewRoles"
  | "roleModuleReady"
  | "canEnterRoleWorkspace"
  | "roleErrorMessage"
  | "enterpriseRoleQueryFields"
  | "enterpriseRoleTableColumns"
  | "enterpriseRoleTableItems"
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
  | "startRoleEdit"
  | "submitRoleForm"
  | "cancelRolePanel"
>

export type CustomerWorkspaceBindingsOptions = BindingSegment<
  | "isCustomerWorkspace"
  | "customerLoading"
  | "canCreateCustomers"
  | "canViewCustomers"
  | "canUpdateCustomers"
  | "canDeleteCustomers"
  | "customerModuleReady"
  | "canEnterCustomerWorkspace"
  | "customerErrorMessage"
  | "enterpriseQueryFields"
  | "enterpriseTableColumns"
  | "enterpriseTableItems"
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
  | "canCreateDictionaryTypes"
  | "canViewDictionaries"
  | "dictionaryModuleReady"
  | "canEnterDictionaryWorkspace"
  | "dictionaryErrorMessage"
  | "enterpriseDictionaryQueryFields"
  | "enterpriseDictionaryTableColumns"
  | "enterpriseDictionaryTableItems"
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
  | "startDictionaryEdit"
  | "submitDictionaryForm"
  | "cancelDictionaryPanel"
>

export type DepartmentWorkspaceBindingsOptions = BindingSegment<
  | "isDepartmentWorkspace"
  | "departmentLoading"
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
  | "canCreatePosts"
  | "canViewPosts"
  | "postModuleReady"
  | "canEnterPostWorkspace"
  | "postErrorMessage"
  | "enterprisePostQueryFields"
  | "enterprisePostTableColumns"
  | "enterprisePostTableItems"
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
  | "startPostEdit"
  | "submitPostForm"
  | "cancelPostPanel"
>

export type MenuWorkspaceBindingsOptions = BindingSegment<
  | "isMenuWorkspace"
  | "menuLoading"
  | "canCreateMenus"
  | "canViewMenus"
  | "menuModuleReady"
  | "canEnterMenuWorkspace"
  | "menuErrorMessage"
  | "enterpriseMenuQueryFields"
  | "enterpriseMenuTableColumns"
  | "enterpriseMenuTableItems"
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
  | "startMenuEdit"
  | "submitMenuForm"
  | "cancelMenuPanel"
>

export type NotificationWorkspaceBindingsOptions = BindingSegment<
  | "isNotificationWorkspace"
  | "notificationLoading"
  | "canCreateNotifications"
  | "canViewNotifications"
  | "notificationModuleReady"
  | "canEnterNotificationWorkspace"
  | "notificationErrorMessage"
  | "enterpriseNotificationQueryFields"
  | "enterpriseNotificationTableColumns"
  | "enterpriseNotificationTableItems"
  | "notificationCountLabel"
  | "canUpdateNotifications"
  | "notificationDetailLoading"
  | "notificationDetailErrorMessage"
  | "notificationPanelMode"
  | "notificationPanelTitle"
  | "notificationPanelDescription"
  | "selectedNotification"
  | "enterpriseNotificationFormFields"
  | "enterpriseNotificationFormValues"
  | "localizeNotificationStatus"
  | "localizeNotificationLevel"
  | "handleNotificationSearch"
  | "handleNotificationReset"
  | "handleNotificationRowClick"
  | "openNotificationCreatePanel"
  | "reloadNotifications"
  | "markSelectedNotificationAsRead"
  | "submitNotificationForm"
  | "cancelNotificationPanel"
>

export type OperationLogWorkspaceBindingsOptions = BindingSegment<
  | "isOperationLogWorkspace"
  | "operationLogLoading"
  | "canViewOperationLogs"
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
>

export type UserWorkspaceBindingsOptions = BindingSegment<
  | "isUserWorkspace"
  | "userLoading"
  | "canCreateUsers"
  | "canViewUsers"
  | "userModuleReady"
  | "canEnterUserWorkspace"
  | "userErrorMessage"
  | "enterpriseUserQueryFields"
  | "enterpriseUserTableColumns"
  | "enterpriseUserTableItems"
  | "userCountLabel"
  | "canUpdateUsers"
  | "canResetUserPasswords"
  | "userPanelMode"
  | "userPanelTitle"
  | "userPanelDescription"
  | "selectedUser"
  | "enterpriseUserFormFields"
  | "enterpriseUserFormValues"
  | "userPasswordInput"
  | "handleUserSearch"
  | "handleUserReset"
  | "handleUserRowClick"
  | "openUserCreatePanel"
  | "reloadUsers"
  | "startUserEdit"
  | "startUserPasswordReset"
  | "submitUserForm"
  | "cancelUserPanel"
  | "submitUserPasswordReset"
>

export type SettingWorkspaceBindingsOptions = BindingSegment<
  | "isSettingWorkspace"
  | "settingLoading"
  | "canCreateSettings"
  | "canViewSettings"
  | "settingModuleReady"
  | "canEnterSettingWorkspace"
  | "settingErrorMessage"
  | "enterpriseSettingQueryFields"
  | "enterpriseSettingTableColumns"
  | "enterpriseSettingTableItems"
  | "settingCountLabel"
  | "canUpdateSettings"
  | "settingDetailLoading"
  | "settingDetailErrorMessage"
  | "settingPanelMode"
  | "settingPanelTitle"
  | "settingPanelDescription"
  | "selectedSetting"
  | "enterpriseSettingFormFields"
  | "enterpriseSettingFormValues"
  | "handleSettingSearch"
  | "handleSettingReset"
  | "handleSettingRowClick"
  | "openSettingCreatePanel"
  | "reloadSettings"
  | "startSettingEdit"
  | "submitSettingForm"
  | "cancelSettingPanel"
>

export type TenantWorkspaceBindingsOptions = BindingSegment<
  | "isTenantWorkspace"
  | "tenantLoading"
  | "canCreateTenants"
  | "canViewTenants"
  | "tenantModuleReady"
  | "canEnterTenantWorkspace"
  | "tenantErrorMessage"
  | "enterpriseTenantQueryFields"
  | "enterpriseTenantTableColumns"
  | "enterpriseTenantTableItems"
  | "tenantCountLabel"
  | "canUpdateTenants"
  | "tenantDetailLoading"
  | "tenantDetailErrorMessage"
  | "tenantPanelMode"
  | "tenantPanelTitle"
  | "tenantPanelDescription"
  | "selectedTenant"
  | "enterpriseTenantFormFields"
  | "enterpriseTenantFormValues"
  | "handleTenantSearch"
  | "handleTenantReset"
  | "handleTenantRowClick"
  | "openTenantCreatePanel"
  | "reloadTenants"
  | "startTenantEdit"
  | "toggleSelectedTenantStatus"
  | "submitTenantForm"
  | "cancelTenantPanel"
>

export type FileWorkspaceBindingsOptions = BindingSegment<
  | "isFileWorkspace"
  | "fileLoading"
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
  | "workflowStatusFilter"
  | "workflowFilterSummary"
  | "workflowDefinitionCards"
  | "workflowDefinitions"
  | "selectedWorkflowDefinitionId"
  | "workflowDetailLoading"
  | "workflowDetailErrorMessage"
  | "selectedWorkflowDefinition"
  | "workflowVersionHistoryCards"
  | "workflowDefinitionDetailCards"
  | "localizeWorkflowStatus"
  | "handleWorkflowDefinitionSelect"
  | "setWorkflowStatusFilter"
  | "resetWorkflowFilters"
  | "reloadWorkflowDefinitions"
>
