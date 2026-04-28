import type { useAuthSessionWorkspace } from "../workspaces/use-auth-session-workspace"
import type { useCustomerWorkspace } from "../workspaces/use-customer-workspace"
import type { useDictionaryWorkspace } from "../workspaces/use-dictionary-workspace"
import type { useNotificationWorkspace } from "../workspaces/use-notification-workspace"
import type { useOperationLogWorkspace } from "../workspaces/use-operation-log-workspace"
import type { useRoleWorkspace } from "../workspaces/use-role-workspace"
import type { UseExampleShellBindingsOptions } from "./use-example-shell-binding-types"

type BindingSegment<
  Keys extends keyof UseExampleShellBindingsOptions,
> = Pick<UseExampleShellBindingsOptions, Keys>
type OptionValue<Key extends keyof UseExampleShellBindingsOptions> =
  UseExampleShellBindingsOptions[Key]

interface CreateExampleShellBindingsOptionsInput {
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
  departmentWorkspace: BindingSegment<
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
  sessionWorkspace: {
    workspace: ReturnType<typeof useAuthSessionWorkspace>
    isSessionWorkspace: OptionValue<"isSessionWorkspace">
    canEnterSessionWorkspace: OptionValue<"canEnterSessionWorkspace">
  }
  postWorkspace: BindingSegment<
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
  menuWorkspace: BindingSegment<
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
  userWorkspace: BindingSegment<
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
  settingWorkspace: BindingSegment<
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
  tenantWorkspace: BindingSegment<
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
  fileWorkspace: BindingSegment<
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
  workflowWorkspace: BindingSegment<
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

export const createExampleShellBindingsOptions = (
  input: CreateExampleShellBindingsOptionsInput,
): UseExampleShellBindingsOptions => {
  const roleWorkspaceOptions: BindingSegment<
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
  > = {
    isRoleWorkspace: input.roleWorkspace.isRoleWorkspace,
    roleLoading: input.roleWorkspace.workspace.roleLoading,
    canCreateRoles: input.roleWorkspace.canCreateRoles,
    canViewRoles: input.roleWorkspace.canViewRoles,
    roleModuleReady: input.roleWorkspace.roleModuleReady,
    canEnterRoleWorkspace: input.roleWorkspace.canEnterRoleWorkspace,
    roleErrorMessage: input.roleWorkspace.workspace.roleErrorMessage,
    enterpriseRoleQueryFields: input.roleWorkspace.workspace.queryFields,
    enterpriseRoleTableColumns: input.roleWorkspace.workspace.tableColumns,
    enterpriseRoleTableItems: input.roleWorkspace.workspace.tableItems,
    roleCountLabel: input.roleWorkspace.workspace.countLabel,
    canUpdateRoles: input.roleWorkspace.canUpdateRoles,
    roleDetailLoading: input.roleWorkspace.workspace.roleDetailLoading,
    roleDetailErrorMessage: input.roleWorkspace.workspace.roleDetailErrorMessage,
    rolePanelMode: input.roleWorkspace.workspace.rolePanelMode,
    rolePanelTitle: input.roleWorkspace.workspace.panelTitle,
    rolePanelDescription: input.roleWorkspace.workspace.panelDescription,
    selectedRole: input.roleWorkspace.workspace.selectedRole,
    selectedRoleDetail: input.roleWorkspace.workspace.selectedRoleDetail,
    enterpriseRoleFormFields: input.roleWorkspace.workspace.formFields,
    enterpriseRoleFormValues: input.roleWorkspace.workspace.formValues,
    handleRoleSearch: input.roleWorkspace.workspace.handleSearch,
    handleRoleReset: input.roleWorkspace.workspace.handleReset,
    handleRoleRowClick: input.roleWorkspace.workspace.handleRowClick,
    openRoleCreatePanel: input.roleWorkspace.workspace.openCreatePanel,
    reloadRoles: input.roleWorkspace.workspace.reloadRoles,
    startRoleEdit: input.roleWorkspace.workspace.startEdit,
    submitRoleForm: input.roleWorkspace.workspace.submitForm,
    cancelRolePanel: input.roleWorkspace.workspace.cancelPanel,
  }

  const customerWorkspaceOptions: BindingSegment<
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
  > = {
    isCustomerWorkspace: input.customerWorkspace.isCustomerWorkspace,
    customerLoading: input.customerWorkspace.workspace.customerLoading,
    canCreateCustomers: input.customerWorkspace.canCreateCustomers,
    canViewCustomers: input.customerWorkspace.canViewCustomers,
    canUpdateCustomers: input.customerWorkspace.canUpdateCustomers,
    canDeleteCustomers: input.customerWorkspace.canDeleteCustomers,
    customerModuleReady: input.customerWorkspace.customerModuleReady,
    canEnterCustomerWorkspace: input.customerWorkspace.canEnterCustomerWorkspace,
    customerErrorMessage: input.customerWorkspace.workspace.customerErrorMessage,
    enterpriseQueryFields: input.customerWorkspace.workspace.queryFields,
    enterpriseTableColumns: input.customerWorkspace.workspace.tableColumns,
    enterpriseTableItems: input.customerWorkspace.workspace.tableItems,
    enterpriseTableActions: input.customerWorkspace.workspace.tableActions,
    customerCountLabel: input.customerWorkspace.workspace.customerCountLabel,
    currentQuerySummary: input.customerWorkspace.currentQuerySummary,
    enterpriseCrudCopy: input.customerWorkspace.enterpriseCrudCopy,
    localizePlatformStatus: input.customerWorkspace.localizePlatformStatus,
    customerPaginationSummary:
      input.customerWorkspace.workspace.customerPaginationSummary,
    customerListPageSize: input.customerWorkspace.workspace.customerListPageSize,
    customerListSortValue: input.customerWorkspace.workspace.customerListSortValue,
    customerPageInputValue: input.customerWorkspace.workspace.customerPageInputValue,
    customerPageSizeOptions:
      input.customerWorkspace.workspace.customerPageSizeOptions,
    customerSortOptions: input.customerWorkspace.workspace.customerSortOptions,
    canGoToPreviousCustomerPage:
      input.customerWorkspace.workspace.canGoToPreviousCustomerPage,
    canGoToNextCustomerPage:
      input.customerWorkspace.workspace.canGoToNextCustomerPage,
    canJumpToCustomerPage:
      input.customerWorkspace.workspace.canJumpToCustomerPage,
    enterpriseFormMode: input.customerWorkspace.workspace.customerFormMode,
    enterprisePanelTitle: input.customerWorkspace.workspace.panelTitle,
    enterprisePanelDescription: input.customerWorkspace.workspace.panelDescription,
    deleteConfirmId: input.customerWorkspace.workspace.deleteConfirmId,
    selectedCustomer: input.customerWorkspace.workspace.selectedCustomer,
    enterpriseFormFields: input.customerWorkspace.workspace.formFields,
    enterpriseFormValues: input.customerWorkspace.workspace.formValues,
    openCustomerWorkspace: input.customerWorkspace.openCustomerWorkspace,
    handleEnterpriseSearch: input.customerWorkspace.workspace.handleSearch,
    handleEnterpriseReset: input.customerWorkspace.workspace.handleReset,
    handleEnterpriseAction: input.customerWorkspace.workspace.handleAction,
    handleEnterpriseRowClick: input.customerWorkspace.workspace.handleRowClick,
    handleCustomerPageSizeChange:
      input.customerWorkspace.workspace.handlePageSizeChange,
    handleCustomerSortChange: input.customerWorkspace.workspace.handleSortChange,
    goToFirstCustomerPage: input.customerWorkspace.workspace.goToFirstCustomerPage,
    goToPreviousCustomerPage:
      input.customerWorkspace.workspace.goToPreviousCustomerPage,
    goToNextCustomerPage: input.customerWorkspace.workspace.goToNextCustomerPage,
    goToLastCustomerPage: input.customerWorkspace.workspace.goToLastCustomerPage,
    updateCustomerPageInput:
      input.customerWorkspace.workspace.updateCustomerPageInput,
    submitCustomerPageJump: input.customerWorkspace.workspace.submitCustomerPageJump,
    openCreatePanel: input.customerWorkspace.workspace.openCreatePanel,
    reloadCustomers: input.customerWorkspace.workspace.reloadCustomers,
    confirmDelete: input.customerWorkspace.workspace.confirmDelete,
    cancelDelete: input.customerWorkspace.workspace.cancelDelete,
    startEdit: input.customerWorkspace.workspace.startEdit,
    requestDelete: input.customerWorkspace.workspace.requestDelete,
    handleEnterpriseFormSubmit:
      input.customerWorkspace.workspace.handleFormSubmit,
    handleEnterpriseFormCancel:
      input.customerWorkspace.workspace.handleFormCancel,
  }

  const dictionaryWorkspaceOptions: BindingSegment<
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
  > = {
    isDictionaryWorkspace: input.dictionaryWorkspace.isDictionaryWorkspace,
    dictionaryLoading: input.dictionaryWorkspace.workspace.dictionaryLoading,
    canCreateDictionaryTypes: input.dictionaryWorkspace.canCreateDictionaryTypes,
    canViewDictionaries: input.dictionaryWorkspace.canViewDictionaries,
    dictionaryModuleReady: input.dictionaryWorkspace.dictionaryModuleReady,
    canEnterDictionaryWorkspace: input.dictionaryWorkspace.canEnterDictionaryWorkspace,
    dictionaryErrorMessage: input.dictionaryWorkspace.workspace.dictionaryErrorMessage,
    enterpriseDictionaryQueryFields: input.dictionaryWorkspace.workspace.queryFields,
    enterpriseDictionaryTableColumns: input.dictionaryWorkspace.workspace.tableColumns,
    enterpriseDictionaryTableItems: input.dictionaryWorkspace.workspace.tableItems,
    dictionaryCountLabel: input.dictionaryWorkspace.workspace.countLabel,
    dictionaryDetailLoading: input.dictionaryWorkspace.workspace.dictionaryDetailLoading,
    dictionaryDetailErrorMessage:
      input.dictionaryWorkspace.workspace.dictionaryDetailErrorMessage,
    dictionaryPanelMode: input.dictionaryWorkspace.workspace.dictionaryPanelMode,
    dictionaryPanelTitle: input.dictionaryWorkspace.workspace.panelTitle,
    dictionaryPanelDescription: input.dictionaryWorkspace.workspace.panelDescription,
    selectedDictionaryType: input.dictionaryWorkspace.workspace.selectedDictionaryType,
    selectedDictionaryTypeItems:
      input.dictionaryWorkspace.workspace.selectedDictionaryTypeItems,
    enterpriseDictionaryFormFields: input.dictionaryWorkspace.workspace.formFields,
    enterpriseDictionaryFormValues: input.dictionaryWorkspace.workspace.formValues,
    enterpriseFormCopy: input.dictionaryWorkspace.enterpriseFormCopy,
    localizeDictionaryStatus: input.dictionaryWorkspace.localizeDictionaryStatus,
    canUpdateDictionaryTypes: input.dictionaryWorkspace.canUpdateDictionaryTypes,
    handleDictionarySearch: input.dictionaryWorkspace.workspace.handleSearch,
    handleDictionaryReset: input.dictionaryWorkspace.workspace.handleReset,
    handleDictionaryRowClick: input.dictionaryWorkspace.workspace.handleRowClick,
    openDictionaryCreatePanel: input.dictionaryWorkspace.workspace.openCreatePanel,
    reloadDictionaries: input.dictionaryWorkspace.workspace.reloadDictionaries,
    startDictionaryEdit: input.dictionaryWorkspace.workspace.startEdit,
    submitDictionaryForm: input.dictionaryWorkspace.workspace.submitForm,
    cancelDictionaryPanel: input.dictionaryWorkspace.workspace.cancelPanel,
  }

  const sessionWorkspaceOptions: BindingSegment<
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
  > = {
    isSessionWorkspace: input.sessionWorkspace.isSessionWorkspace,
    sessionLoading: input.sessionWorkspace.workspace.sessionLoading,
    canEnterSessionWorkspace: input.sessionWorkspace.canEnterSessionWorkspace,
    sessionErrorMessage: input.sessionWorkspace.workspace.sessionErrorMessage,
    enterpriseSessionQueryFields: input.sessionWorkspace.workspace.queryFields,
    enterpriseSessionTableColumns: input.sessionWorkspace.workspace.tableColumns,
    enterpriseSessionTableItems: input.sessionWorkspace.workspace.tableItems,
    sessionCountLabel: input.sessionWorkspace.workspace.countLabel,
    sessionActionLoading: input.sessionWorkspace.workspace.sessionActionLoading,
    selectedSession: input.sessionWorkspace.workspace.selectedSession,
    handleSessionSearch: input.sessionWorkspace.workspace.handleSearch,
    handleSessionReset: input.sessionWorkspace.workspace.handleReset,
    handleSessionRowClick: input.sessionWorkspace.workspace.handleRowClick,
    revokeSelectedSession: input.sessionWorkspace.workspace.revokeSelectedSession,
  }

  const notificationWorkspaceOptions: BindingSegment<
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
  > = {
    isNotificationWorkspace: input.notificationWorkspace.isNotificationWorkspace,
    notificationLoading: input.notificationWorkspace.workspace.notificationLoading,
    canCreateNotifications: input.notificationWorkspace.canCreateNotifications,
    canViewNotifications: input.notificationWorkspace.canViewNotifications,
    notificationModuleReady: input.notificationWorkspace.notificationModuleReady,
    canEnterNotificationWorkspace:
      input.notificationWorkspace.canEnterNotificationWorkspace,
    notificationErrorMessage:
      input.notificationWorkspace.workspace.notificationErrorMessage,
    enterpriseNotificationQueryFields:
      input.notificationWorkspace.workspace.queryFields,
    enterpriseNotificationTableColumns:
      input.notificationWorkspace.workspace.tableColumns,
    enterpriseNotificationTableItems:
      input.notificationWorkspace.workspace.tableItems,
    notificationCountLabel: input.notificationWorkspace.workspace.countLabel,
    canUpdateNotifications: input.notificationWorkspace.canUpdateNotifications,
    notificationDetailLoading:
      input.notificationWorkspace.workspace.notificationDetailLoading,
    notificationDetailErrorMessage:
      input.notificationWorkspace.workspace.notificationDetailErrorMessage,
    notificationPanelMode: input.notificationWorkspace.workspace.notificationPanelMode,
    notificationPanelTitle: input.notificationWorkspace.workspace.panelTitle,
    notificationPanelDescription:
      input.notificationWorkspace.workspace.panelDescription,
    selectedNotification: input.notificationWorkspace.workspace.selectedNotification,
    enterpriseNotificationFormFields:
      input.notificationWorkspace.workspace.formFields,
    enterpriseNotificationFormValues:
      input.notificationWorkspace.workspace.formValues,
    localizeNotificationStatus:
      input.notificationWorkspace.localizeNotificationStatus,
    localizeNotificationLevel: input.notificationWorkspace.localizeNotificationLevel,
    handleNotificationSearch: input.notificationWorkspace.workspace.handleSearch,
    handleNotificationReset: input.notificationWorkspace.workspace.handleReset,
    handleNotificationRowClick:
      input.notificationWorkspace.workspace.handleRowClick,
    openNotificationCreatePanel:
      input.notificationWorkspace.workspace.openCreatePanel,
    reloadNotifications: input.notificationWorkspace.workspace.reloadNotifications,
    markSelectedNotificationAsRead:
      input.notificationWorkspace.workspace.markSelectedAsRead,
    submitNotificationForm: input.notificationWorkspace.workspace.submitForm,
    cancelNotificationPanel: input.notificationWorkspace.workspace.cancelPanel,
  }

  const operationLogWorkspaceOptions: BindingSegment<
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
  > = {
    isOperationLogWorkspace: input.operationLogWorkspace.isOperationLogWorkspace,
    operationLogLoading: input.operationLogWorkspace.workspace.operationLogLoading,
    canViewOperationLogs: input.operationLogWorkspace.canViewOperationLogs,
    operationLogModuleReady: input.operationLogWorkspace.operationLogModuleReady,
    canEnterOperationLogWorkspace:
      input.operationLogWorkspace.canEnterOperationLogWorkspace,
    operationLogErrorMessage:
      input.operationLogWorkspace.workspace.operationLogErrorMessage,
    enterpriseOperationLogQueryFields:
      input.operationLogWorkspace.workspace.queryFields,
    enterpriseOperationLogTableColumns:
      input.operationLogWorkspace.workspace.tableColumns,
    enterpriseOperationLogTableItems:
      input.operationLogWorkspace.workspace.tableItems,
    operationLogCountLabel: input.operationLogWorkspace.workspace.countLabel,
    operationLogDetailLoading:
      input.operationLogWorkspace.workspace.operationLogDetailLoading,
    operationLogDetailErrorMessage:
      input.operationLogWorkspace.workspace.operationLogDetailErrorMessage,
    operationLogPanelTitle: input.operationLogWorkspace.workspace.panelTitle,
    operationLogPanelDescription:
      input.operationLogWorkspace.workspace.panelDescription,
    selectedOperationLog: input.operationLogWorkspace.workspace.selectedOperationLog,
    enterpriseOperationLogDetailFields:
      input.operationLogWorkspace.workspace.detailFields,
    enterpriseOperationLogDetailValues:
      input.operationLogWorkspace.workspace.detailValues,
    operationLogDetailsText: input.operationLogWorkspace.workspace.detailsText,
    handleOperationLogSearch:
      input.operationLogWorkspace.workspace.handleSearch,
    handleOperationLogReset: input.operationLogWorkspace.workspace.handleReset,
    handleOperationLogRowClick:
      input.operationLogWorkspace.workspace.handleRowClick,
    reloadOperationLogs: input.operationLogWorkspace.workspace.reloadOperationLogs,
  }

  return {
    ...input.shell,
    ...roleWorkspaceOptions,
    ...customerWorkspaceOptions,
    ...dictionaryWorkspaceOptions,
    ...input.departmentWorkspace,
    ...sessionWorkspaceOptions,
    ...input.postWorkspace,
    ...input.menuWorkspace,
    ...notificationWorkspaceOptions,
    ...operationLogWorkspaceOptions,
    ...input.userWorkspace,
    ...input.settingWorkspace,
    ...input.tenantWorkspace,
    ...input.fileWorkspace,
    ...input.workflowWorkspace,
    ...input.generatorPreviewWorkspace,
  }
}
