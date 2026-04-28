import type { useAuthSessionWorkspace } from "../workspaces/use-auth-session-workspace"
import type { useCustomerWorkspace } from "../workspaces/use-customer-workspace"
import type { useDepartmentWorkspace } from "../workspaces/use-department-workspace"
import type { useDictionaryWorkspace } from "../workspaces/use-dictionary-workspace"
import type { useNotificationWorkspace } from "../workspaces/use-notification-workspace"
import type { useOperationLogWorkspace } from "../workspaces/use-operation-log-workspace"
import type { usePostWorkspace } from "../workspaces/use-post-workspace"
import type { useRoleWorkspace } from "../workspaces/use-role-workspace"
import type { useMenuWorkspace } from "../workspaces/use-menu-workspace"
import type { useSettingWorkspace } from "../workspaces/use-setting-workspace"
import type { useTenantWorkspace } from "../workspaces/use-tenant-workspace"
import type { useUserWorkspace } from "../workspaces/use-user-workspace"
import type { useFileWorkspace } from "../workspaces/use-file-workspace"
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

  const departmentWorkspaceOptions: BindingSegment<
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
  > = {
    isDepartmentWorkspace: input.departmentWorkspace.isDepartmentWorkspace,
    departmentLoading: input.departmentWorkspace.workspace.departmentLoading,
    canCreateDepartments: input.departmentWorkspace.canCreateDepartments,
    canViewDepartments: input.departmentWorkspace.canViewDepartments,
    departmentModuleReady: input.departmentWorkspace.departmentModuleReady,
    canEnterDepartmentWorkspace:
      input.departmentWorkspace.canEnterDepartmentWorkspace,
    departmentErrorMessage: input.departmentWorkspace.workspace.departmentErrorMessage,
    enterpriseDepartmentQueryFields:
      input.departmentWorkspace.workspace.queryFields,
    enterpriseDepartmentTableColumns:
      input.departmentWorkspace.workspace.tableColumns,
    enterpriseDepartmentTableItems:
      input.departmentWorkspace.workspace.tableItems,
    departmentCountLabel: input.departmentWorkspace.workspace.countLabel,
    canUpdateDepartments: input.departmentWorkspace.canUpdateDepartments,
    departmentDetailLoading:
      input.departmentWorkspace.workspace.departmentDetailLoading,
    departmentDetailErrorMessage:
      input.departmentWorkspace.workspace.departmentDetailErrorMessage,
    departmentPanelMode: input.departmentWorkspace.workspace.departmentPanelMode,
    departmentPanelTitle: input.departmentWorkspace.workspace.panelTitle,
    departmentPanelDescription:
      input.departmentWorkspace.workspace.panelDescription,
    selectedDepartment: input.departmentWorkspace.workspace.selectedDepartment,
    selectedDepartmentDetail:
      input.departmentWorkspace.workspace.selectedDepartmentDetail,
    enterpriseDepartmentFormFields:
      input.departmentWorkspace.workspace.formFields,
    enterpriseDepartmentFormValues:
      input.departmentWorkspace.workspace.formValues,
    departmentParentLookup: input.departmentWorkspace.workspace.parentLookup,
    handleDepartmentSearch: input.departmentWorkspace.workspace.handleSearch,
    handleDepartmentReset: input.departmentWorkspace.workspace.handleReset,
    handleDepartmentRowClick:
      input.departmentWorkspace.workspace.handleRowClick,
    openDepartmentCreatePanel:
      input.departmentWorkspace.workspace.openCreatePanel,
    reloadDepartments: input.departmentWorkspace.workspace.reloadDepartments,
    startDepartmentEdit: input.departmentWorkspace.workspace.startEdit,
    submitDepartmentForm: input.departmentWorkspace.workspace.submitForm,
    cancelDepartmentPanel: input.departmentWorkspace.workspace.cancelPanel,
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

  const postWorkspaceOptions: BindingSegment<
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
  > = {
    isPostWorkspace: input.postWorkspace.isPostWorkspace,
    postLoading: input.postWorkspace.workspace.postLoading,
    canCreatePosts: input.postWorkspace.canCreatePosts,
    canViewPosts: input.postWorkspace.canViewPosts,
    postModuleReady: input.postWorkspace.postModuleReady,
    canEnterPostWorkspace: input.postWorkspace.canEnterPostWorkspace,
    postErrorMessage: input.postWorkspace.workspace.postErrorMessage,
    enterprisePostQueryFields: input.postWorkspace.workspace.queryFields,
    enterprisePostTableColumns: input.postWorkspace.workspace.tableColumns,
    enterprisePostTableItems: input.postWorkspace.workspace.tableItems,
    postCountLabel: input.postWorkspace.workspace.countLabel,
    canUpdatePosts: input.postWorkspace.canUpdatePosts,
    postDetailLoading: input.postWorkspace.workspace.postDetailLoading,
    postDetailErrorMessage: input.postWorkspace.workspace.postDetailErrorMessage,
    postPanelMode: input.postWorkspace.workspace.postPanelMode,
    postPanelTitle: input.postWorkspace.workspace.panelTitle,
    postPanelDescription: input.postWorkspace.workspace.panelDescription,
    selectedPost: input.postWorkspace.workspace.selectedPost,
    enterprisePostFormFields: input.postWorkspace.workspace.formFields,
    enterprisePostFormValues: input.postWorkspace.workspace.formValues,
    handlePostSearch: input.postWorkspace.workspace.handleSearch,
    handlePostReset: input.postWorkspace.workspace.handleReset,
    handlePostRowClick: input.postWorkspace.workspace.handleRowClick,
    openPostCreatePanel: input.postWorkspace.workspace.openCreatePanel,
    reloadPosts: input.postWorkspace.workspace.reloadPosts,
    startPostEdit: input.postWorkspace.workspace.startEdit,
    submitPostForm: input.postWorkspace.workspace.submitForm,
    cancelPostPanel: input.postWorkspace.workspace.cancelPanel,
  }

  const menuWorkspaceOptions: BindingSegment<
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
  > = {
    isMenuWorkspace: input.menuWorkspace.isMenuWorkspace,
    menuLoading: input.menuWorkspace.workspace.menuLoading,
    canCreateMenus: input.menuWorkspace.canCreateMenus,
    canViewMenus: input.menuWorkspace.canViewMenus,
    menuModuleReady: input.menuWorkspace.menuModuleReady,
    canEnterMenuWorkspace: input.menuWorkspace.canEnterMenuWorkspace,
    menuErrorMessage: input.menuWorkspace.workspace.menuErrorMessage,
    enterpriseMenuQueryFields: input.menuWorkspace.workspace.queryFields,
    enterpriseMenuTableColumns: input.menuWorkspace.workspace.tableColumns,
    enterpriseMenuTableItems: input.menuWorkspace.workspace.tableItems,
    menuCountLabel: input.menuWorkspace.workspace.countLabel,
    canUpdateMenus: input.menuWorkspace.canUpdateMenus,
    menuDetailLoading: input.menuWorkspace.workspace.menuDetailLoading,
    menuDetailErrorMessage: input.menuWorkspace.workspace.menuDetailErrorMessage,
    menuPanelMode: input.menuWorkspace.workspace.menuPanelMode,
    menuPanelTitle: input.menuWorkspace.workspace.panelTitle,
    menuPanelDescription: input.menuWorkspace.workspace.panelDescription,
    selectedMenu: input.menuWorkspace.workspace.selectedMenu,
    selectedMenuDetail: input.menuWorkspace.workspace.selectedMenuDetail,
    enterpriseMenuFormFields: input.menuWorkspace.workspace.formFields,
    enterpriseMenuFormValues: input.menuWorkspace.workspace.formValues,
    menuParentLookup: input.menuWorkspace.workspace.parentLookup,
    handleMenuSearch: input.menuWorkspace.workspace.handleSearch,
    handleMenuReset: input.menuWorkspace.workspace.handleReset,
    handleMenuRowClick: input.menuWorkspace.workspace.handleRowClick,
    openMenuCreatePanel: input.menuWorkspace.workspace.openCreatePanel,
    reloadMenus: input.menuWorkspace.workspace.reloadMenus,
    startMenuEdit: input.menuWorkspace.workspace.startEdit,
    submitMenuForm: input.menuWorkspace.workspace.submitForm,
    cancelMenuPanel: input.menuWorkspace.workspace.cancelPanel,
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

  const userWorkspaceOptions: BindingSegment<
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
  > = {
    isUserWorkspace: input.userWorkspace.isUserWorkspace,
    userLoading: input.userWorkspace.workspace.userLoading,
    canCreateUsers: input.userWorkspace.canCreateUsers,
    canViewUsers: input.userWorkspace.canViewUsers,
    userModuleReady: input.userWorkspace.userModuleReady,
    canEnterUserWorkspace: input.userWorkspace.canEnterUserWorkspace,
    userErrorMessage: input.userWorkspace.workspace.userErrorMessage,
    enterpriseUserQueryFields: input.userWorkspace.workspace.queryFields,
    enterpriseUserTableColumns: input.userWorkspace.workspace.tableColumns,
    enterpriseUserTableItems: input.userWorkspace.workspace.tableItems,
    userCountLabel: input.userWorkspace.workspace.countLabel,
    canUpdateUsers: input.userWorkspace.canUpdateUsers,
    canResetUserPasswords: input.userWorkspace.canResetUserPasswords,
    userPanelMode: input.userWorkspace.workspace.userPanelMode,
    userPanelTitle: input.userWorkspace.workspace.panelTitle,
    userPanelDescription: input.userWorkspace.workspace.panelDescription,
    selectedUser: input.userWorkspace.workspace.selectedUser,
    enterpriseUserFormFields: input.userWorkspace.workspace.formFields,
    enterpriseUserFormValues: input.userWorkspace.workspace.formValues,
    userPasswordInput: input.userWorkspace.workspace.userPasswordInput,
    handleUserSearch: input.userWorkspace.workspace.handleSearch,
    handleUserReset: input.userWorkspace.workspace.handleReset,
    handleUserRowClick: input.userWorkspace.workspace.handleRowClick,
    openUserCreatePanel: input.userWorkspace.workspace.openCreatePanel,
    reloadUsers: input.userWorkspace.workspace.reloadUsers,
    startUserEdit: input.userWorkspace.workspace.startEdit,
    startUserPasswordReset: input.userWorkspace.workspace.startPasswordReset,
    submitUserForm: input.userWorkspace.workspace.submitForm,
    cancelUserPanel: input.userWorkspace.workspace.cancelPanel,
    submitUserPasswordReset: input.userWorkspace.workspace.submitPasswordReset,
  }

  const settingWorkspaceOptions: BindingSegment<
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
  > = {
    isSettingWorkspace: input.settingWorkspace.isSettingWorkspace,
    settingLoading: input.settingWorkspace.workspace.settingLoading,
    canCreateSettings: input.settingWorkspace.canCreateSettings,
    canViewSettings: input.settingWorkspace.canViewSettings,
    settingModuleReady: input.settingWorkspace.settingModuleReady,
    canEnterSettingWorkspace: input.settingWorkspace.canEnterSettingWorkspace,
    settingErrorMessage: input.settingWorkspace.workspace.settingErrorMessage,
    enterpriseSettingQueryFields: input.settingWorkspace.workspace.queryFields,
    enterpriseSettingTableColumns: input.settingWorkspace.workspace.tableColumns,
    enterpriseSettingTableItems: input.settingWorkspace.workspace.tableItems,
    settingCountLabel: input.settingWorkspace.workspace.countLabel,
    canUpdateSettings: input.settingWorkspace.canUpdateSettings,
    settingDetailLoading: input.settingWorkspace.workspace.settingDetailLoading,
    settingDetailErrorMessage:
      input.settingWorkspace.workspace.settingDetailErrorMessage,
    settingPanelMode: input.settingWorkspace.workspace.settingPanelMode,
    settingPanelTitle: input.settingWorkspace.workspace.panelTitle,
    settingPanelDescription: input.settingWorkspace.workspace.panelDescription,
    selectedSetting: input.settingWorkspace.workspace.selectedSetting,
    enterpriseSettingFormFields: input.settingWorkspace.workspace.formFields,
    enterpriseSettingFormValues: input.settingWorkspace.workspace.formValues,
    handleSettingSearch: input.settingWorkspace.workspace.handleSearch,
    handleSettingReset: input.settingWorkspace.workspace.handleReset,
    handleSettingRowClick: input.settingWorkspace.workspace.handleRowClick,
    openSettingCreatePanel: input.settingWorkspace.workspace.openCreatePanel,
    reloadSettings: input.settingWorkspace.workspace.reloadSettings,
    startSettingEdit: input.settingWorkspace.workspace.startEdit,
    submitSettingForm: input.settingWorkspace.workspace.submitForm,
    cancelSettingPanel: input.settingWorkspace.workspace.cancelPanel,
  }

  const tenantWorkspaceOptions: BindingSegment<
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
  > = {
    isTenantWorkspace: input.tenantWorkspace.isTenantWorkspace,
    tenantLoading: input.tenantWorkspace.workspace.tenantLoading,
    canCreateTenants: input.tenantWorkspace.canCreateTenants,
    canViewTenants: input.tenantWorkspace.canViewTenants,
    tenantModuleReady: input.tenantWorkspace.tenantModuleReady,
    canEnterTenantWorkspace: input.tenantWorkspace.canEnterTenantWorkspace,
    tenantErrorMessage: input.tenantWorkspace.workspace.tenantErrorMessage,
    enterpriseTenantQueryFields: input.tenantWorkspace.workspace.queryFields,
    enterpriseTenantTableColumns: input.tenantWorkspace.workspace.tableColumns,
    enterpriseTenantTableItems: input.tenantWorkspace.workspace.tableItems,
    tenantCountLabel: input.tenantWorkspace.workspace.countLabel,
    canUpdateTenants: input.tenantWorkspace.canUpdateTenants,
    tenantDetailLoading: input.tenantWorkspace.workspace.tenantDetailLoading,
    tenantDetailErrorMessage:
      input.tenantWorkspace.workspace.tenantDetailErrorMessage,
    tenantPanelMode: input.tenantWorkspace.workspace.tenantPanelMode,
    tenantPanelTitle: input.tenantWorkspace.workspace.panelTitle,
    tenantPanelDescription: input.tenantWorkspace.workspace.panelDescription,
    selectedTenant: input.tenantWorkspace.workspace.selectedTenant,
    enterpriseTenantFormFields: input.tenantWorkspace.workspace.formFields,
    enterpriseTenantFormValues: input.tenantWorkspace.workspace.formValues,
    handleTenantSearch: input.tenantWorkspace.workspace.handleSearch,
    handleTenantReset: input.tenantWorkspace.workspace.handleReset,
    handleTenantRowClick: input.tenantWorkspace.workspace.handleRowClick,
    openTenantCreatePanel: input.tenantWorkspace.workspace.openCreatePanel,
    reloadTenants: input.tenantWorkspace.workspace.reloadTenants,
    startTenantEdit: input.tenantWorkspace.workspace.startEdit,
    toggleSelectedTenantStatus:
      input.tenantWorkspace.workspace.toggleSelectedStatus,
    submitTenantForm: input.tenantWorkspace.workspace.submitForm,
    cancelTenantPanel: input.tenantWorkspace.workspace.cancelPanel,
  }

  const fileWorkspaceOptions: BindingSegment<
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
  > = {
    isFileWorkspace: input.fileWorkspace.isFileWorkspace,
    fileLoading: input.fileWorkspace.workspace.fileLoading,
    canViewFiles: input.fileWorkspace.canViewFiles,
    canUploadFiles: input.fileWorkspace.canUploadFiles,
    canDownloadFiles: input.fileWorkspace.canDownloadFiles,
    canDeleteFiles: input.fileWorkspace.canDeleteFiles,
    fileModuleReady: input.fileWorkspace.fileModuleReady,
    canEnterFileWorkspace: input.fileWorkspace.canEnterFileWorkspace,
    fileErrorMessage: input.fileWorkspace.workspace.fileErrorMessage,
    fileQuery: input.fileWorkspace.workspace.fileQuery,
    fileFilterSummary: input.fileWorkspace.workspace.filterSummary,
    fileCountLabel: input.fileWorkspace.workspace.countLabel,
    fileTableItems: input.fileWorkspace.workspace.tableItems,
    selectedFileId: input.fileWorkspace.workspace.selectedFileId,
    fileDetailLoading: input.fileWorkspace.workspace.fileDetailLoading,
    fileActionLoading: input.fileWorkspace.workspace.fileActionLoading,
    fileDetailErrorMessage: input.fileWorkspace.workspace.fileDetailErrorMessage,
    filePanelMode: input.fileWorkspace.workspace.filePanelMode,
    selectedFile: input.fileWorkspace.workspace.selectedFile,
    pendingUploadFile: input.fileWorkspace.workspace.pendingUploadFile,
    fileItems: input.fileWorkspace.workspace.fileItems,
    updateFileQuery: input.fileWorkspace.workspace.updateQuery,
    resetFileQuery: input.fileWorkspace.workspace.resetQuery,
    selectFile: input.fileWorkspace.workspace.selectFile,
    openFileUploadPanel: input.fileWorkspace.workspace.openUploadPanel,
    reloadFiles: input.fileWorkspace.workspace.reloadFiles,
    setPendingUploadFile: input.fileWorkspace.workspace.setPendingUploadFile,
    submitFileUpload: input.fileWorkspace.workspace.submitUpload,
    downloadSelectedFile: input.fileWorkspace.workspace.downloadSelectedFile,
    openFileDeletePanel: input.fileWorkspace.workspace.openDeletePanel,
    confirmFileDelete: input.fileWorkspace.workspace.confirmDelete,
    cancelFilePanel: input.fileWorkspace.workspace.cancelPanel,
  }

  return {
    ...input.shell,
    ...roleWorkspaceOptions,
    ...customerWorkspaceOptions,
    ...dictionaryWorkspaceOptions,
    ...departmentWorkspaceOptions,
    ...sessionWorkspaceOptions,
    ...postWorkspaceOptions,
    ...menuWorkspaceOptions,
    ...notificationWorkspaceOptions,
    ...operationLogWorkspaceOptions,
    ...userWorkspaceOptions,
    ...settingWorkspaceOptions,
    ...tenantWorkspaceOptions,
    ...fileWorkspaceOptions,
    ...input.workflowWorkspace,
    ...input.generatorPreviewWorkspace,
  }
}
