import type { CreateExampleShellBindingsOptionsInput } from "./create-example-shell-bindings-options-types"
import type { UseExampleShellBindingsOptions } from "./use-example-shell-binding-types"

export const createExampleShellBindingsOptions = (
  input: CreateExampleShellBindingsOptionsInput,
): UseExampleShellBindingsOptions => {
  const roleWorkspaceOptions = {
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
    openRoleCreatePanel: input.roleWorkspace.workspace.openCreatePanel,
    reloadRoles: input.roleWorkspace.workspace.reloadRoles,
    startRoleEdit: input.roleWorkspace.workspace.startEdit,
    submitRoleForm: input.roleWorkspace.workspace.submitForm,
    cancelRolePanel: input.roleWorkspace.workspace.cancelPanel,
  }

  const customerWorkspaceOptions = {
    isCustomerWorkspace: input.customerWorkspace.isCustomerWorkspace,
    customerLoading: input.customerWorkspace.workspace.customerLoading,
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
    enterpriseTableItems: input.customerWorkspace.workspace.tableItems,
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
    startEdit: input.customerWorkspace.workspace.startEdit,
    requestDelete: input.customerWorkspace.workspace.requestDelete,
    handleEnterpriseFormSubmit:
      input.customerWorkspace.workspace.handleFormSubmit,
    handleEnterpriseFormCancel:
      input.customerWorkspace.workspace.handleFormCancel,
  }

  const dictionaryWorkspaceOptions = {
    isDictionaryWorkspace: input.dictionaryWorkspace.isDictionaryWorkspace,
    dictionaryLoading: input.dictionaryWorkspace.workspace.dictionaryLoading,
    canCreateDictionaryTypes:
      input.dictionaryWorkspace.canCreateDictionaryTypes,
    canViewDictionaries: input.dictionaryWorkspace.canViewDictionaries,
    dictionaryModuleReady: input.dictionaryWorkspace.dictionaryModuleReady,
    canEnterDictionaryWorkspace:
      input.dictionaryWorkspace.canEnterDictionaryWorkspace,
    dictionaryErrorMessage:
      input.dictionaryWorkspace.workspace.dictionaryErrorMessage,
    enterpriseDictionaryQueryFields:
      input.dictionaryWorkspace.workspace.queryFields,
    enterpriseDictionaryTableColumns:
      input.dictionaryWorkspace.workspace.tableColumns,
    enterpriseDictionaryTableItems:
      input.dictionaryWorkspace.workspace.tableItems,
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
    openDictionaryCreatePanel:
      input.dictionaryWorkspace.workspace.openCreatePanel,
    reloadDictionaries: input.dictionaryWorkspace.workspace.reloadDictionaries,
    startDictionaryEdit: input.dictionaryWorkspace.workspace.startEdit,
    submitDictionaryForm: input.dictionaryWorkspace.workspace.submitForm,
    cancelDictionaryPanel: input.dictionaryWorkspace.workspace.cancelPanel,
  }

  const departmentWorkspaceOptions = {
    isDepartmentWorkspace: input.departmentWorkspace.isDepartmentWorkspace,
    departmentLoading: input.departmentWorkspace.workspace.departmentLoading,
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
    openDepartmentCreatePanel:
      input.departmentWorkspace.workspace.openCreatePanel,
    reloadDepartments: input.departmentWorkspace.workspace.reloadDepartments,
    startDepartmentEdit: input.departmentWorkspace.workspace.startEdit,
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
    openPostCreatePanel: input.postWorkspace.workspace.openCreatePanel,
    reloadPosts: input.postWorkspace.workspace.reloadPosts,
    startPostEdit: input.postWorkspace.workspace.startEdit,
    submitPostForm: input.postWorkspace.workspace.submitForm,
    cancelPostPanel: input.postWorkspace.workspace.cancelPanel,
  }

  const menuWorkspaceOptions = {
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
    openMenuCreatePanel: input.menuWorkspace.workspace.openCreatePanel,
    reloadMenus: input.menuWorkspace.workspace.reloadMenus,
    startMenuEdit: input.menuWorkspace.workspace.startEdit,
    submitMenuForm: input.menuWorkspace.workspace.submitForm,
    cancelMenuPanel: input.menuWorkspace.workspace.cancelPanel,
  }

  const notificationWorkspaceOptions = {
    isNotificationWorkspace:
      input.notificationWorkspace.isNotificationWorkspace,
    notificationLoading:
      input.notificationWorkspace.workspace.notificationLoading,
    canCreateNotifications: input.notificationWorkspace.canCreateNotifications,
    canViewNotifications: input.notificationWorkspace.canViewNotifications,
    notificationModuleReady:
      input.notificationWorkspace.notificationModuleReady,
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
    notificationPanelMode:
      input.notificationWorkspace.workspace.notificationPanelMode,
    notificationPanelTitle: input.notificationWorkspace.workspace.panelTitle,
    notificationPanelDescription:
      input.notificationWorkspace.workspace.panelDescription,
    selectedNotification:
      input.notificationWorkspace.workspace.selectedNotification,
    enterpriseNotificationFormFields:
      input.notificationWorkspace.workspace.formFields,
    enterpriseNotificationFormValues:
      input.notificationWorkspace.workspace.formValues,
    localizeNotificationStatus:
      input.notificationWorkspace.localizeNotificationStatus,
    localizeNotificationLevel:
      input.notificationWorkspace.localizeNotificationLevel,
    handleNotificationSearch:
      input.notificationWorkspace.workspace.handleSearch,
    handleNotificationReset: input.notificationWorkspace.workspace.handleReset,
    handleNotificationRowClick:
      input.notificationWorkspace.workspace.handleRowClick,
    openNotificationCreatePanel:
      input.notificationWorkspace.workspace.openCreatePanel,
    reloadNotifications:
      input.notificationWorkspace.workspace.reloadNotifications,
    markSelectedNotificationAsRead:
      input.notificationWorkspace.workspace.markSelectedAsRead,
    submitNotificationForm: input.notificationWorkspace.workspace.submitForm,
    cancelNotificationPanel: input.notificationWorkspace.workspace.cancelPanel,
  }

  const operationLogWorkspaceOptions = {
    isOperationLogWorkspace:
      input.operationLogWorkspace.isOperationLogWorkspace,
    operationLogLoading:
      input.operationLogWorkspace.workspace.operationLogLoading,
    canViewOperationLogs: input.operationLogWorkspace.canViewOperationLogs,
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
  }

  const userWorkspaceOptions = {
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

  const settingWorkspaceOptions = {
    isSettingWorkspace: input.settingWorkspace.isSettingWorkspace,
    settingLoading: input.settingWorkspace.workspace.settingLoading,
    canCreateSettings: input.settingWorkspace.canCreateSettings,
    canViewSettings: input.settingWorkspace.canViewSettings,
    settingModuleReady: input.settingWorkspace.settingModuleReady,
    canEnterSettingWorkspace: input.settingWorkspace.canEnterSettingWorkspace,
    settingErrorMessage: input.settingWorkspace.workspace.settingErrorMessage,
    enterpriseSettingQueryFields: input.settingWorkspace.workspace.queryFields,
    enterpriseSettingTableColumns:
      input.settingWorkspace.workspace.tableColumns,
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

  const tenantWorkspaceOptions = {
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

  const fileWorkspaceOptions = {
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
    workflowStatusFilter:
      input.workflowWorkspace.workspace.workflowStatusFilter,
    workflowFilterSummary:
      input.workflowWorkspace.workspace.workflowFilterSummary,
    workflowDefinitionCards:
      input.workflowWorkspace.workspace.workflowDefinitionCards,
    workflowDefinitions: input.workflowWorkspace.workspace.workflowDefinitions,
    selectedWorkflowDefinitionId:
      input.workflowWorkspace.workspace.selectedWorkflowDefinitionId,
    workflowDetailLoading:
      input.workflowWorkspace.workspace.workflowDetailLoading,
    workflowDetailErrorMessage:
      input.workflowWorkspace.workspace.workflowDetailErrorMessage,
    selectedWorkflowDefinition:
      input.workflowWorkspace.workspace.selectedWorkflowDefinition,
    workflowVersionHistoryCards:
      input.workflowWorkspace.workspace.workflowVersionHistoryCards,
    workflowDefinitionDetailCards:
      input.workflowWorkspace.workspace.workflowDefinitionDetailCards,
    localizeWorkflowStatus: input.workflowWorkspace.localizeWorkflowStatus,
    handleWorkflowDefinitionSelect:
      input.workflowWorkspace.workspace.handleWorkflowDefinitionSelect,
    setWorkflowStatusFilter:
      input.workflowWorkspace.workspace.setWorkflowStatusFilter,
    resetWorkflowFilters:
      input.workflowWorkspace.workspace.resetWorkflowFilters,
    reloadWorkflowDefinitions:
      input.workflowWorkspace.workspace.reloadWorkflowDefinitions,
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
    ...workflowWorkspaceOptions,
    ...input.generatorPreviewWorkspace,
  } as unknown as UseExampleShellBindingsOptions
}
