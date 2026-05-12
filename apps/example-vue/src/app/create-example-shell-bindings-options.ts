import { computed, unref } from "vue"
import type { CreateExampleShellBindingsOptionsInput } from "./create-example-shell-bindings-options-types"

import type { UseExampleShellBindingsOptions } from "./use-example-shell-binding-types"

export const createExampleShellBindingsOptions = (
  input: CreateExampleShellBindingsOptionsInput,
): UseExampleShellBindingsOptions => {
  const runWithSelectedRecord = <TRecord>(
    selectedRecord: { value: TRecord | null },
    run: (record: TRecord) => void,
  ) => {
    if (selectedRecord.value) {
      run(selectedRecord.value)
    }
  }

  const createCrudActionHandler = <TRecord extends Record<string, unknown>>(
    openCreatePanel: () => void,
    startEdit?: (record: TRecord) => void,
  ) => {
    return (key: string, row: Record<string, unknown>) => {
      if (key === "create") {
        openCreatePanel()
        return
      }

      if (key === "edit" && startEdit) {
        startEdit(row as TRecord)
      }
    }
  }

  const roleWorkspaceOptions = {
    isRoleWorkspace: input.roleWorkspace.isRoleWorkspace,
    roleLoading: input.roleWorkspace.workspace.roleLoading,
    roleExportLoading: input.roleWorkspace.roleExportLoading,
    canCreateRoles: input.roleWorkspace.canCreateRoles,
    canViewRoles: input.roleWorkspace.canViewRoles,
    roleModuleReady: input.roleWorkspace.roleModuleReady,
    canEnterRoleWorkspace: input.roleWorkspace.canEnterRoleWorkspace,
    roleWorkspaceState: input.roleWorkspace.workspace,
    roleErrorMessage: input.roleWorkspace.workspace.roleErrorMessage,
    enterpriseRoleQueryFields: input.roleWorkspace.workspace.queryFields,
    enterpriseRoleTableColumns: input.roleWorkspace.workspace.tableColumns,
    roleCountLabel: input.roleWorkspace.workspace.countLabel,
    canUpdateRoles: input.roleWorkspace.canUpdateRoles,
    roleDetailLoading: input.roleWorkspace.workspace.roleDetailLoading,
    roleDetailErrorMessage:
      input.roleWorkspace.workspace.roleDetailErrorMessage,
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
    handleRoleAction: createCrudActionHandler(
      input.roleWorkspace.workspace.openCreatePanel,
      input.roleWorkspace.workspace.startEdit,
    ),
    openRoleCreatePanel: input.roleWorkspace.workspace.openCreatePanel,
    reloadRoles: input.roleWorkspace.workspace.reloadRoles,
    handleExportRoles: input.roleWorkspace.handleExportRoles,
    startRoleEdit: () =>
      runWithSelectedRecord(
        input.roleWorkspace.workspace.selectedRole,
        input.roleWorkspace.workspace.startEdit,
      ),
    submitRoleForm: input.roleWorkspace.workspace.submitForm,
    cancelRolePanel: input.roleWorkspace.workspace.cancelPanel,
  }

  const customerWorkspaceOptions = {
    isCustomerWorkspace: input.customerWorkspace.isCustomerWorkspace,
    customerLoading: input.customerWorkspace.workspace.customerLoading,
    customerWorkspaceState: input.customerWorkspace.workspace,
    canCreateCustomers: input.customerWorkspace.canCreateCustomers,
    canViewCustomers: input.customerWorkspace.canViewCustomers,
    canUpdateCustomers: input.customerWorkspace.canUpdateCustomers,
    canDeleteCustomers: input.customerWorkspace.canDeleteCustomers,
    customerModuleReady: input.customerWorkspace.customerModuleReady,
    canEnterCustomerWorkspace:
      input.customerWorkspace.canEnterCustomerWorkspace,
    customerErrorMessage:
      input.customerWorkspace.workspace.customerErrorMessage,
    enterpriseQueryFields: input.customerWorkspace.workspace.queryFields,
    enterpriseTableColumns: input.customerWorkspace.workspace.tableColumns,
    enterpriseTableActions: input.customerWorkspace.workspace.tableActions,
    customerCountLabel: input.customerWorkspace.workspace.customerCountLabel,
    currentQuerySummary: input.customerWorkspace.currentQuerySummary,
    enterpriseCrudCopy: input.customerWorkspace.enterpriseCrudCopy,
    localizePlatformStatus: input.customerWorkspace.localizePlatformStatus,
    customerPaginationSummary:
      input.customerWorkspace.workspace.customerPaginationSummary,
    customerListPageSize:
      input.customerWorkspace.workspace.customerListPageSize,
    customerListSortValue:
      input.customerWorkspace.workspace.customerListSortValue,
    customerPageInputValue:
      input.customerWorkspace.workspace.customerPageInputValue,
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
    enterprisePanelDescription:
      input.customerWorkspace.workspace.panelDescription,
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
    handleCustomerSortChange:
      input.customerWorkspace.workspace.handleSortChange,
    goToFirstCustomerPage:
      input.customerWorkspace.workspace.goToFirstCustomerPage,
    goToPreviousCustomerPage:
      input.customerWorkspace.workspace.goToPreviousCustomerPage,
    goToNextCustomerPage:
      input.customerWorkspace.workspace.goToNextCustomerPage,
    goToLastCustomerPage:
      input.customerWorkspace.workspace.goToLastCustomerPage,
    updateCustomerPageInput:
      input.customerWorkspace.workspace.updateCustomerPageInput,
    submitCustomerPageJump:
      input.customerWorkspace.workspace.submitCustomerPageJump,
    openCreatePanel: input.customerWorkspace.workspace.openCreatePanel,
    reloadCustomers: input.customerWorkspace.workspace.reloadCustomers,
    confirmDelete: input.customerWorkspace.workspace.confirmDelete,
    cancelDelete: input.customerWorkspace.workspace.cancelDelete,
    startEdit: () =>
      runWithSelectedRecord(
        input.customerWorkspace.workspace.selectedCustomer,
        input.customerWorkspace.workspace.startEdit,
      ),
    requestDelete: () =>
      runWithSelectedRecord(
        input.customerWorkspace.workspace.selectedCustomer,
        input.customerWorkspace.workspace.requestDelete,
      ),
    handleEnterpriseFormSubmit:
      input.customerWorkspace.workspace.handleFormSubmit,
    handleEnterpriseFormCancel:
      input.customerWorkspace.workspace.handleFormCancel,
  }

  const dictionaryWorkspaceOptions = {
    isDictionaryWorkspace: input.dictionaryWorkspace.isDictionaryWorkspace,
    dictionaryLoading: input.dictionaryWorkspace.workspace.dictionaryLoading,
    dictionaryTypeExportLoading:
      input.dictionaryWorkspace.dictionaryTypeExportLoading,
    dictionaryItemsExportLoading:
      input.dictionaryWorkspace.dictionaryItemsExportLoading,
    canCreateDictionaryTypes:
      input.dictionaryWorkspace.canCreateDictionaryTypes,
    canViewDictionaries: input.dictionaryWorkspace.canViewDictionaries,
    dictionaryModuleReady: input.dictionaryWorkspace.dictionaryModuleReady,
    canEnterDictionaryWorkspace:
      input.dictionaryWorkspace.canEnterDictionaryWorkspace,
    dictionaryWorkspaceState: input.dictionaryWorkspace.workspace,
    dictionaryErrorMessage:
      input.dictionaryWorkspace.workspace.dictionaryErrorMessage,
    enterpriseDictionaryQueryFields:
      input.dictionaryWorkspace.workspace.queryFields,
    enterpriseDictionaryTableColumns:
      input.dictionaryWorkspace.workspace.tableColumns,
    dictionaryCountLabel: input.dictionaryWorkspace.workspace.countLabel,
    dictionaryDetailLoading:
      input.dictionaryWorkspace.workspace.dictionaryDetailLoading,
    dictionaryDetailErrorMessage:
      input.dictionaryWorkspace.workspace.dictionaryDetailErrorMessage,
    dictionaryPanelMode:
      input.dictionaryWorkspace.workspace.dictionaryPanelMode,
    dictionaryPanelTitle: input.dictionaryWorkspace.workspace.panelTitle,
    dictionaryPanelDescription:
      input.dictionaryWorkspace.workspace.panelDescription,
    selectedDictionaryType:
      input.dictionaryWorkspace.workspace.selectedDictionaryType,
    selectedDictionaryTypeItems:
      input.dictionaryWorkspace.workspace.selectedDictionaryTypeItems,
    enterpriseDictionaryFormFields:
      input.dictionaryWorkspace.workspace.formFields,
    enterpriseDictionaryFormValues:
      input.dictionaryWorkspace.workspace.formValues,
    enterpriseFormCopy: input.dictionaryWorkspace.enterpriseFormCopy,
    localizeDictionaryStatus:
      input.dictionaryWorkspace.localizeDictionaryStatus,
    canUpdateDictionaryTypes:
      input.dictionaryWorkspace.canUpdateDictionaryTypes,
    handleDictionarySearch: input.dictionaryWorkspace.workspace.handleSearch,
    handleDictionaryReset: input.dictionaryWorkspace.workspace.handleReset,
    handleDictionaryRowClick:
      input.dictionaryWorkspace.workspace.handleRowClick,
    handleDictionaryAction: createCrudActionHandler(
      input.dictionaryWorkspace.workspace.openCreatePanel,
      input.dictionaryWorkspace.workspace.startEdit,
    ),
    openDictionaryCreatePanel:
      input.dictionaryWorkspace.workspace.openCreatePanel,
    reloadDictionaries: input.dictionaryWorkspace.workspace.reloadDictionaries,
    handleExportDictionaryTypes:
      input.dictionaryWorkspace.handleExportDictionaryTypes,
    handleExportDictionaryItems:
      input.dictionaryWorkspace.handleExportDictionaryItems,
    startDictionaryEdit: () =>
      runWithSelectedRecord(
        input.dictionaryWorkspace.workspace.selectedDictionaryType,
        input.dictionaryWorkspace.workspace.startEdit,
      ),
    submitDictionaryForm: input.dictionaryWorkspace.workspace.submitForm,
    cancelDictionaryPanel: input.dictionaryWorkspace.workspace.cancelPanel,
  }

  const departmentWorkspaceOptions = {
    isDepartmentWorkspace: input.departmentWorkspace.isDepartmentWorkspace,
    departmentLoading: input.departmentWorkspace.workspace.departmentLoading,
    departmentWorkspaceState: input.departmentWorkspace.workspace,
    departmentExportLoading: input.departmentWorkspace.departmentExportLoading,
    canCreateDepartments: input.departmentWorkspace.canCreateDepartments,
    canViewDepartments: input.departmentWorkspace.canViewDepartments,
    departmentModuleReady: input.departmentWorkspace.departmentModuleReady,
    canEnterDepartmentWorkspace:
      input.departmentWorkspace.canEnterDepartmentWorkspace,
    departmentErrorMessage:
      input.departmentWorkspace.workspace.departmentErrorMessage,
    enterpriseDepartmentQueryFields:
      input.departmentWorkspace.workspace.queryFields,
    enterpriseDepartmentTableColumns:
      input.departmentWorkspace.workspace.tableColumns,
    enterpriseDepartmentTableActions: computed(() =>
      unref(input.departmentWorkspace.canUpdateDepartments)
        ? [
            {
              key: "edit",
              label: input.shell.t("app.department.action.edit"),
            },
          ]
        : [],
    ),
    enterpriseDepartmentTableItems:
      input.departmentWorkspace.workspace.tableItems,
    departmentCountLabel: input.departmentWorkspace.workspace.countLabel,
    canUpdateDepartments: input.departmentWorkspace.canUpdateDepartments,
    departmentDetailLoading:
      input.departmentWorkspace.workspace.departmentDetailLoading,
    departmentDetailErrorMessage:
      input.departmentWorkspace.workspace.departmentDetailErrorMessage,
    departmentPanelMode:
      input.departmentWorkspace.workspace.departmentPanelMode,
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
    handleDepartmentAction: createCrudActionHandler(
      input.departmentWorkspace.workspace.openCreatePanel,
      input.departmentWorkspace.workspace.startEdit,
    ),
    openDepartmentCreatePanel:
      input.departmentWorkspace.workspace.openCreatePanel,
    reloadDepartments: input.departmentWorkspace.workspace.reloadDepartments,
    handleExportDepartments: input.departmentWorkspace.handleExportDepartments,
    startDepartmentEdit: () =>
      runWithSelectedRecord(
        input.departmentWorkspace.workspace.selectedDepartment,
        input.departmentWorkspace.workspace.startEdit,
      ),
    submitDepartmentForm: input.departmentWorkspace.workspace.submitForm,
    cancelDepartmentPanel: input.departmentWorkspace.workspace.cancelPanel,
  }

  const sessionWorkspaceOptions = {
    isSessionWorkspace: input.sessionWorkspace.isSessionWorkspace,
    sessionLoading: input.sessionWorkspace.workspace.sessionLoading,
    canEnterSessionWorkspace: input.sessionWorkspace.canEnterSessionWorkspace,
    sessionErrorMessage: input.sessionWorkspace.workspace.sessionErrorMessage,
    enterpriseSessionQueryFields: input.sessionWorkspace.workspace.queryFields,
    enterpriseSessionTableColumns:
      input.sessionWorkspace.workspace.tableColumns,
    enterpriseSessionTableItems: input.sessionWorkspace.workspace.tableItems,
    sessionCountLabel: input.sessionWorkspace.workspace.countLabel,
    sessionCurrentQuerySummary:
      input.sessionWorkspace.workspace.currentQuerySummary,
    sessionHasActiveFilters: input.sessionWorkspace.workspace.hasActiveFilters,
    sessionActionLoading: input.sessionWorkspace.workspace.sessionActionLoading,
    selectedSession: input.sessionWorkspace.workspace.selectedSession,
    handleSessionSearch: input.sessionWorkspace.workspace.handleSearch,
    handleSessionReset: input.sessionWorkspace.workspace.handleReset,
    handleSessionRowClick: input.sessionWorkspace.workspace.handleRowClick,
    revokeSelectedSession:
      input.sessionWorkspace.workspace.revokeSelectedSession,
  }

  const postWorkspaceOptions = {
    isPostWorkspace: input.postWorkspace.isPostWorkspace,
    postLoading: input.postWorkspace.workspace.postLoading,
    postWorkspaceState: input.postWorkspace.workspace,
    postExportLoading: input.postWorkspace.postExportLoading,
    canCreatePosts: input.postWorkspace.canCreatePosts,
    canViewPosts: input.postWorkspace.canViewPosts,
    postModuleReady: input.postWorkspace.postModuleReady,
    canEnterPostWorkspace: input.postWorkspace.canEnterPostWorkspace,
    postErrorMessage: input.postWorkspace.workspace.postErrorMessage,
    enterprisePostQueryFields: input.postWorkspace.workspace.queryFields,
    enterprisePostTableColumns: input.postWorkspace.workspace.tableColumns,
    postCountLabel: input.postWorkspace.workspace.countLabel,
    canUpdatePosts: input.postWorkspace.canUpdatePosts,
    postDetailLoading: input.postWorkspace.workspace.postDetailLoading,
    postDetailErrorMessage:
      input.postWorkspace.workspace.postDetailErrorMessage,
    postPanelMode: input.postWorkspace.workspace.postPanelMode,
    postPanelTitle: input.postWorkspace.workspace.panelTitle,
    postPanelDescription: input.postWorkspace.workspace.panelDescription,
    selectedPost: input.postWorkspace.workspace.selectedPost,
    enterprisePostFormFields: input.postWorkspace.workspace.formFields,
    enterprisePostFormValues: input.postWorkspace.workspace.formValues,
    handlePostSearch: input.postWorkspace.workspace.handleSearch,
    handlePostReset: input.postWorkspace.workspace.handleReset,
    handlePostRowClick: input.postWorkspace.workspace.handleRowClick,
    handlePostAction: createCrudActionHandler(
      input.postWorkspace.workspace.openCreatePanel,
      input.postWorkspace.workspace.startEdit,
    ),
    openPostCreatePanel: input.postWorkspace.workspace.openCreatePanel,
    reloadPosts: input.postWorkspace.workspace.reloadPosts,
    handleExportPosts: input.postWorkspace.handleExportPosts,
    startPostEdit: () =>
      runWithSelectedRecord(
        input.postWorkspace.workspace.selectedPost,
        input.postWorkspace.workspace.startEdit,
      ),
    submitPostForm: input.postWorkspace.workspace.submitForm,
    cancelPostPanel: input.postWorkspace.workspace.cancelPanel,
  }

  const menuWorkspaceOptions = {
    isMenuWorkspace: input.menuWorkspace.isMenuWorkspace,
    menuLoading: input.menuWorkspace.workspace.menuLoading,
    menuWorkspaceState: input.menuWorkspace.workspace,
    menuExportLoading: input.menuWorkspace.menuExportLoading,
    canCreateMenus: input.menuWorkspace.canCreateMenus,
    canViewMenus: input.menuWorkspace.canViewMenus,
    menuModuleReady: input.menuWorkspace.menuModuleReady,
    canEnterMenuWorkspace: input.menuWorkspace.canEnterMenuWorkspace,
    menuErrorMessage: input.menuWorkspace.workspace.menuErrorMessage,
    enterpriseMenuQueryFields: input.menuWorkspace.workspace.queryFields,
    enterpriseMenuTableColumns: input.menuWorkspace.workspace.tableColumns,
    menuCountLabel: input.menuWorkspace.workspace.countLabel,
    canUpdateMenus: input.menuWorkspace.canUpdateMenus,
    menuDetailLoading: input.menuWorkspace.workspace.menuDetailLoading,
    menuDetailErrorMessage:
      input.menuWorkspace.workspace.menuDetailErrorMessage,
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
    handleMenuAction: createCrudActionHandler(
      input.menuWorkspace.workspace.openCreatePanel,
      input.menuWorkspace.workspace.startEdit,
    ),
    openMenuCreatePanel: input.menuWorkspace.workspace.openCreatePanel,
    reloadMenus: input.menuWorkspace.workspace.reloadMenus,
    handleExportMenus: input.menuWorkspace.handleExportMenus,
    startMenuEdit: () =>
      runWithSelectedRecord(
        input.menuWorkspace.workspace.selectedMenu,
        input.menuWorkspace.workspace.startEdit,
      ),
    submitMenuForm: input.menuWorkspace.workspace.submitForm,
    cancelMenuPanel: input.menuWorkspace.workspace.cancelPanel,
  }

  const notificationWorkspaceOptions = {
    isNotificationWorkspace:
      input.notificationWorkspace.isNotificationWorkspace,
    notificationLoading:
      input.notificationWorkspace.workspace.notificationLoading,
    notificationWorkspaceState: input.notificationWorkspace.workspace,
    notificationExportLoading:
      input.notificationWorkspace.notificationExportLoading,
    canCreateNotifications: input.notificationWorkspace.canCreateNotifications,
    canViewNotifications: input.notificationWorkspace.canViewNotifications,
    visibleUnreadNotificationCount:
      input.notificationWorkspace.visibleUnreadNotificationCount,
    notificationModuleReady:
      input.notificationWorkspace.notificationModuleReady,
    canEnterNotificationWorkspace:
      input.notificationWorkspace.canEnterNotificationWorkspace,
    enterpriseNotificationQueryFields:
      input.notificationWorkspace.workspace.queryFields,
    enterpriseNotificationTableColumns:
      input.notificationWorkspace.workspace.tableColumns,
    notificationCountLabel: input.notificationWorkspace.workspace.countLabel,
    canUpdateNotifications: input.notificationWorkspace.canUpdateNotifications,
    localizeNotificationStatus:
      input.notificationWorkspace.localizeNotificationStatus,
    localizeNotificationLevel:
      input.notificationWorkspace.localizeNotificationLevel,
    handleNotificationSearch:
      input.notificationWorkspace.workspace.handleSearch,
    handleNotificationReset: input.notificationWorkspace.workspace.handleReset,
    handleNotificationRowClick:
      input.notificationWorkspace.workspace.handleRowClick,
    handleNotificationAction: createCrudActionHandler(
      input.notificationWorkspace.workspace.openCreatePanel,
    ),
    openNotificationCreatePanel:
      input.notificationWorkspace.workspace.openCreatePanel,
    reloadNotifications:
      input.notificationWorkspace.workspace.reloadNotifications,
    handleExportNotifications:
      input.notificationWorkspace.handleExportNotifications,
    markSelectedNotificationAsRead:
      input.notificationWorkspace.workspace.markSelectedAsRead,
    markVisibleNotificationsAsRead:
      input.notificationWorkspace.workspace.markVisibleAsRead,
    submitNotificationForm: input.notificationWorkspace.workspace.submitForm,
    cancelNotificationPanel: input.notificationWorkspace.workspace.cancelPanel,
  }

  const operationLogWorkspaceOptions = {
    isOperationLogWorkspace:
      input.operationLogWorkspace.isOperationLogWorkspace,
    operationLogLoading:
      input.operationLogWorkspace.workspace.operationLogLoading,
    operationLogExportLoading:
      input.operationLogWorkspace.operationLogExportLoading,
    canViewOperationLogs: input.operationLogWorkspace.canViewOperationLogs,
    canExportOperationLogs: input.operationLogWorkspace.canExportOperationLogs,
    operationLogModuleReady:
      input.operationLogWorkspace.operationLogModuleReady,
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
    operationLogCurrentQuerySummary:
      input.operationLogWorkspace.workspace.currentQuerySummary,
    operationLogHasActiveFilters:
      input.operationLogWorkspace.workspace.hasActiveFilters,
    operationLogDetailLoading:
      input.operationLogWorkspace.workspace.operationLogDetailLoading,
    operationLogDetailErrorMessage:
      input.operationLogWorkspace.workspace.operationLogDetailErrorMessage,
    operationLogPanelTitle: input.operationLogWorkspace.workspace.panelTitle,
    operationLogPanelDescription:
      input.operationLogWorkspace.workspace.panelDescription,
    selectedOperationLog:
      input.operationLogWorkspace.workspace.selectedOperationLog,
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
    reloadOperationLogs:
      input.operationLogWorkspace.workspace.reloadOperationLogs,
    handleExportOperationLogs:
      input.operationLogWorkspace.handleExportOperationLogs,
  }

  const userWorkspaceOptions = {
    isUserWorkspace: input.userWorkspace.isUserWorkspace,
    userLoading: input.userWorkspace.workspace.userLoading,
    userWorkspaceState: input.userWorkspace.workspace,
    userExportLoading: input.userWorkspace.userExportLoading,
    canCreateUsers: input.userWorkspace.canCreateUsers,
    canViewUsers: input.userWorkspace.canViewUsers,
    userModuleReady: input.userWorkspace.userModuleReady,
    canEnterUserWorkspace: input.userWorkspace.canEnterUserWorkspace,
    enterpriseUserQueryFields: input.userWorkspace.workspace.queryFields,
    enterpriseUserTableColumns: input.userWorkspace.workspace.tableColumns,
    userCountLabel: input.userWorkspace.workspace.countLabel,
    canUpdateUsers: input.userWorkspace.canUpdateUsers,
    canResetUserPasswords: input.userWorkspace.canResetUserPasswords,
    userPasswordInput: input.userWorkspace.workspace.userPasswordInput,
    handleUserSearch: input.userWorkspace.workspace.handleSearch,
    handleUserReset: input.userWorkspace.workspace.handleReset,
    handleUserRowClick: input.userWorkspace.workspace.handleRowClick,
    handleUserAction: createCrudActionHandler(
      input.userWorkspace.workspace.openCreatePanel,
      input.userWorkspace.workspace.startEdit,
    ),
    openUserCreatePanel: input.userWorkspace.workspace.openCreatePanel,
    reloadUsers: input.userWorkspace.workspace.reloadUsers,
    handleExportUsers: input.userWorkspace.handleExportUsers,
    startUserEdit: () =>
      runWithSelectedRecord(
        input.userWorkspace.workspace.selectedUser,
        input.userWorkspace.workspace.startEdit,
      ),
    startUserPasswordReset: () =>
      runWithSelectedRecord(
        input.userWorkspace.workspace.selectedUser,
        input.userWorkspace.workspace.startPasswordReset,
      ),
    submitUserForm: input.userWorkspace.workspace.submitForm,
    cancelUserPanel: input.userWorkspace.workspace.cancelPanel,
    submitUserPasswordReset: input.userWorkspace.workspace.submitPasswordReset,
  }

  const settingWorkspaceOptions = {
    isSettingWorkspace: input.settingWorkspace.isSettingWorkspace,
    settingLoading: input.settingWorkspace.workspace.settingLoading,
    settingWorkspaceState: input.settingWorkspace.workspace,
    settingExportLoading: input.settingWorkspace.settingExportLoading,
    canCreateSettings: input.settingWorkspace.canCreateSettings,
    canViewSettings: input.settingWorkspace.canViewSettings,
    settingModuleReady: input.settingWorkspace.settingModuleReady,
    canEnterSettingWorkspace: input.settingWorkspace.canEnterSettingWorkspace,
    enterpriseSettingQueryFields: input.settingWorkspace.workspace.queryFields,
    enterpriseSettingTableColumns:
      input.settingWorkspace.workspace.tableColumns,
    settingCountLabel: input.settingWorkspace.workspace.countLabel,
    canUpdateSettings: input.settingWorkspace.canUpdateSettings,
    handleSettingSearch: input.settingWorkspace.workspace.handleSearch,
    handleSettingReset: input.settingWorkspace.workspace.handleReset,
    handleSettingRowClick: input.settingWorkspace.workspace.handleRowClick,
    handleSettingAction: createCrudActionHandler(
      input.settingWorkspace.workspace.openCreatePanel,
      input.settingWorkspace.workspace.startEdit,
    ),
    openSettingCreatePanel: input.settingWorkspace.workspace.openCreatePanel,
    reloadSettings: input.settingWorkspace.workspace.reloadSettings,
    handleExportSettings: input.settingWorkspace.handleExportSettings,
    startSettingEdit: () =>
      runWithSelectedRecord(
        input.settingWorkspace.workspace.selectedSetting,
        input.settingWorkspace.workspace.startEdit,
      ),
    submitSettingForm: input.settingWorkspace.workspace.submitForm,
    cancelSettingPanel: input.settingWorkspace.workspace.cancelPanel,
  }

  const tenantWorkspaceOptions = {
    isTenantWorkspace: input.tenantWorkspace.isTenantWorkspace,
    tenantLoading: input.tenantWorkspace.workspace.tenantLoading,
    tenantWorkspaceState: input.tenantWorkspace.workspace,
    tenantExportLoading: input.tenantWorkspace.tenantExportLoading,
    canCreateTenants: input.tenantWorkspace.canCreateTenants,
    canViewTenants: input.tenantWorkspace.canViewTenants,
    tenantModuleReady: input.tenantWorkspace.tenantModuleReady,
    canEnterTenantWorkspace: input.tenantWorkspace.canEnterTenantWorkspace,
    enterpriseTenantQueryFields: input.tenantWorkspace.workspace.queryFields,
    enterpriseTenantTableColumns: input.tenantWorkspace.workspace.tableColumns,
    tenantCountLabel: input.tenantWorkspace.workspace.countLabel,
    canUpdateTenants: input.tenantWorkspace.canUpdateTenants,
    handleTenantSearch: input.tenantWorkspace.workspace.handleSearch,
    handleTenantReset: input.tenantWorkspace.workspace.handleReset,
    handleTenantRowClick: input.tenantWorkspace.workspace.handleRowClick,
    handleTenantAction: createCrudActionHandler(
      input.tenantWorkspace.workspace.openCreatePanel,
      input.tenantWorkspace.workspace.startEdit,
    ),
    openTenantCreatePanel: input.tenantWorkspace.workspace.openCreatePanel,
    reloadTenants: input.tenantWorkspace.workspace.reloadTenants,
    handleExportTenants: input.tenantWorkspace.handleExportTenants,
    startTenantEdit: () =>
      runWithSelectedRecord(
        input.tenantWorkspace.workspace.selectedTenant,
        input.tenantWorkspace.workspace.startEdit,
      ),
    toggleSelectedTenantStatus:
      input.tenantWorkspace.workspace.toggleSelectedStatus,
    submitTenantForm: input.tenantWorkspace.workspace.submitForm,
    cancelTenantPanel: input.tenantWorkspace.workspace.cancelPanel,
  }

  const fileWorkspaceOptions = {
    isFileWorkspace: input.fileWorkspace.isFileWorkspace,
    fileLoading: input.fileWorkspace.workspace.fileLoading,
    fileExportLoading: input.fileWorkspace.fileExportLoading,
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
    hasActiveFileFilters: input.fileWorkspace.workspace.hasActiveFilters,
    visibleFileCount: input.fileWorkspace.workspace.visibleFileCount,
    selectedFileId: input.fileWorkspace.workspace.selectedFileId,
    fileDetailLoading: input.fileWorkspace.workspace.fileDetailLoading,
    fileActionLoading: input.fileWorkspace.workspace.fileActionLoading,
    fileDetailErrorMessage:
      input.fileWorkspace.workspace.fileDetailErrorMessage,
    filePanelMode: input.fileWorkspace.workspace.filePanelMode,
    selectedFile: input.fileWorkspace.workspace.selectedFile,
    pendingUploadFile: input.fileWorkspace.workspace.pendingUploadFile,
    fileItems: input.fileWorkspace.workspace.fileItems,
    updateFileQuery: input.fileWorkspace.workspace.updateQuery,
    resetFileQuery: input.fileWorkspace.workspace.resetQuery,
    selectFile: input.fileWorkspace.workspace.selectFile,
    openFileUploadPanel: input.fileWorkspace.workspace.openUploadPanel,
    reloadFiles: input.fileWorkspace.workspace.reloadFiles,
    handleExportFiles: input.fileWorkspace.handleExportFiles,
    deleteVisibleFiles: input.fileWorkspace.workspace.deleteVisibleFiles,
    setPendingUploadFile: input.fileWorkspace.workspace.setPendingUploadFile,
    submitFileUpload: input.fileWorkspace.workspace.submitUpload,
    downloadSelectedFile: input.fileWorkspace.workspace.downloadSelectedFile,
    openFileDeletePanel: input.fileWorkspace.workspace.openDeletePanel,
    confirmFileDelete: input.fileWorkspace.workspace.confirmDelete,
    cancelFilePanel: input.fileWorkspace.workspace.cancelPanel,
  }

  const workflowWorkspaceOptions = {
    isWorkflowDefinitionsWorkspace:
      input.workflowWorkspace.isWorkflowDefinitionsWorkspace,
    workflowLoading: input.workflowWorkspace.workspace.workflowLoading,
    canViewWorkflowDefinitions:
      input.workflowWorkspace.canViewWorkflowDefinitions,
    workflowModuleReady: input.workflowWorkspace.workflowModuleReady,
    canEnterWorkflowWorkspace:
      input.workflowWorkspace.canEnterWorkflowWorkspace,
    workflowErrorMessage:
      input.workflowWorkspace.workspace.workflowErrorMessage,
    workflowQuery: input.workflowWorkspace.workspace.workflowQuery,
    workflowDefinitionCards:
      input.workflowWorkspace.workspace.workflowDefinitionCards,
    workflowDefinitions: input.workflowWorkspace.workspace.workflowDefinitions,
    workflowPaginationSummary:
      input.workflowWorkspace.workspace.workflowPaginationSummary,
    workflowCanGoToPreviousPage:
      input.workflowWorkspace.workspace.workflowCanGoToPreviousPage,
    workflowCanGoToNextPage:
      input.workflowWorkspace.workspace.workflowCanGoToNextPage,
    workflowDetailDialogOpen:
      input.workflowWorkspace.workspace.workflowDetailDialogOpen,
    selectedWorkflowDefinitionId:
      input.workflowWorkspace.workspace.selectedWorkflowDefinitionId,
    workflowDetailLoading:
      input.workflowWorkspace.workspace.workflowDetailLoading,
    workflowDetailErrorMessage:
      input.workflowWorkspace.workspace.workflowDetailErrorMessage,
    selectedWorkflowDefinition:
      input.workflowWorkspace.workspace.selectedWorkflowDefinition,
    localizeWorkflowStatus: input.workflowWorkspace.localizeWorkflowStatus,
    handleWorkflowDefinitionSelect:
      input.workflowWorkspace.workspace.handleWorkflowDefinitionSelect,
    closeWorkflowDefinitionDetail:
      input.workflowWorkspace.workspace.closeWorkflowDefinitionDetail,
    setWorkflowQuery: input.workflowWorkspace.workspace.setWorkflowQuery,
    resetWorkflowFilters:
      input.workflowWorkspace.workspace.resetWorkflowFilters,
    goToPreviousWorkflowPage:
      input.workflowWorkspace.workspace.goToPreviousWorkflowPage,
    goToNextWorkflowPage:
      input.workflowWorkspace.workspace.goToNextWorkflowPage,
    reloadWorkflowDefinitions:
      input.workflowWorkspace.workspace.reloadWorkflowDefinitions,
  }

  const options = {
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
    ...workflowWorkspaceOptions,
    ...input.generatorPreviewWorkspace,
  } satisfies UseExampleShellBindingsOptions

  return options
}
