import type { ComputedRef, Ref } from "vue"

import type { AuthIdentityResponse, PlatformResponse } from "../lib/platform-api"
import type { AppTranslate } from "./app-shell-helpers"

export type ValueSource<T> = Ref<T> | ComputedRef<T>

export const read = <T>(source: ValueSource<T>): T => source.value

export interface LoginFormState {
  username: string
  password: string
}

export interface UseExampleShellBindingsOptions {
  t: AppTranslate
  platform: Ref<PlatformResponse | null>
  authIdentity: Ref<AuthIdentityResponse | null>
  locale: Ref<string>
  loginForm: Ref<LoginFormState>
  envName: Ref<string>
  authErrorMessage: Ref<string>
  selectedNavigationItemName: ComputedRef<string>
  currentNavigationPath: ComputedRef<string>
  enterpriseSelectedTabKey: ComputedRef<string>
  currentWorkspaceKind: ComputedRef<string>
  isRuntimeShellTab: ComputedRef<boolean>
  authStatusLabel: ComputedRef<string>
  currentModuleStatusLabel: ComputedRef<string>
  currentModuleCodeLabel: ComputedRef<string>
  placeholderWorkspaceCopy: ComputedRef<string>
  customerNavigationItem: ComputedRef<unknown>
  permissionCodes: ComputedRef<string[]>
  authModuleReady: Ref<boolean>
  isAuthenticated: ComputedRef<boolean>
  authLoading: Ref<boolean>
  isRoleWorkspace: ComputedRef<boolean>
  roleLoading: ValueSource<boolean>
  canCreateRoles: ValueSource<boolean>
  canViewRoles: ValueSource<boolean>
  isCustomerWorkspace: ComputedRef<boolean>
  customerLoading: ValueSource<boolean>
  canCreateCustomers: ValueSource<boolean>
  canViewCustomers: ValueSource<boolean>
  canUpdateCustomers: ValueSource<boolean>
  canDeleteCustomers: ValueSource<boolean>
  isDictionaryWorkspace: ComputedRef<boolean>
  dictionaryLoading: ValueSource<boolean>
  canCreateDictionaryTypes: ValueSource<boolean>
  canViewDictionaries: ValueSource<boolean>
  isDepartmentWorkspace: ComputedRef<boolean>
  departmentLoading: ValueSource<boolean>
  canCreateDepartments: ValueSource<boolean>
  canViewDepartments: ValueSource<boolean>
  isPostWorkspace: ComputedRef<boolean>
  postLoading: ValueSource<boolean>
  canCreatePosts: ValueSource<boolean>
  canViewPosts: ValueSource<boolean>
  isMenuWorkspace: ComputedRef<boolean>
  menuLoading: ValueSource<boolean>
  canCreateMenus: ValueSource<boolean>
  canViewMenus: ValueSource<boolean>
  isNotificationWorkspace: ComputedRef<boolean>
  notificationLoading: ValueSource<boolean>
  canCreateNotifications: ValueSource<boolean>
  canViewNotifications: ValueSource<boolean>
  isOperationLogWorkspace: ComputedRef<boolean>
  operationLogLoading: ValueSource<boolean>
  canViewOperationLogs: ValueSource<boolean>
  isUserWorkspace: ComputedRef<boolean>
  userLoading: ValueSource<boolean>
  canCreateUsers: ValueSource<boolean>
  canViewUsers: ValueSource<boolean>
  isSettingWorkspace: ComputedRef<boolean>
  settingLoading: ValueSource<boolean>
  canCreateSettings: ValueSource<boolean>
  canViewSettings: ValueSource<boolean>
  isTenantWorkspace: ComputedRef<boolean>
  tenantLoading: ValueSource<boolean>
  canCreateTenants: ValueSource<boolean>
  canViewTenants: ValueSource<boolean>
  isFileWorkspace: ComputedRef<boolean>
  fileLoading: ValueSource<boolean>
  canViewFiles: ValueSource<boolean>
  canUploadFiles: ValueSource<boolean>
  canDownloadFiles: ValueSource<boolean>
  canDeleteFiles: ValueSource<boolean>
  isWorkflowDefinitionsWorkspace: ComputedRef<boolean>
  workflowLoading: ValueSource<boolean>
  canViewWorkflowDefinitions: ValueSource<boolean>
  workflowModuleReady: ValueSource<boolean>
  canEnterWorkflowWorkspace: ValueSource<boolean>
  workflowErrorMessage: ValueSource<string>
  workflowQuery: Ref<string>
  workflowStatusFilter: ValueSource<string>
  workflowFilterSummary: ValueSource<string>
  workflowDefinitionCards: ValueSource<unknown[]>
  workflowDefinitions: ValueSource<unknown[]>
  selectedWorkflowDefinitionId: ValueSource<string | null>
  fileModuleReady: ValueSource<boolean>
  canEnterFileWorkspace: ValueSource<boolean>
  fileErrorMessage: ValueSource<string>
  fileQuery: Ref<string>
  fileFilterSummary: ValueSource<string>
  fileCountLabel: ValueSource<string>
  fileTableItems: ValueSource<unknown[]>
  selectedFileId: ValueSource<string | null>
  generatorPreviewLoading: ValueSource<boolean>
  generatorPreviewApplyLoading: ValueSource<boolean>
  generatorPreviewErrorMessage: ValueSource<string>
  generatorPreviewSchemaOptions: ValueSource<unknown[]>
  selectedGeneratorPreviewSchemaName: Ref<string>
  selectedGeneratorPreviewFrontendTarget: Ref<string>
  generatorPreviewQuery: Ref<string>
  generatorPreviewFilterSummary: ValueSource<string>
  generatorPreviewFiles: ValueSource<unknown[]>
  selectedGeneratorPreviewFilePath: Ref<string | null>
  canApplyGeneratorPreview: ValueSource<boolean>
  generatorPreviewDiffSummary: ValueSource<string>
  generatorPreviewSession: ValueSource<Record<string, unknown> | null>
  dictionaryModuleReady: ValueSource<boolean>
  canEnterDictionaryWorkspace: ValueSource<boolean>
  dictionaryErrorMessage: ValueSource<string>
  enterpriseDictionaryQueryFields: ValueSource<unknown[]>
  enterpriseDictionaryTableColumns: ValueSource<unknown[]>
  enterpriseDictionaryTableItems: ValueSource<unknown[]>
  dictionaryCountLabel: ValueSource<string>
  departmentModuleReady: ValueSource<boolean>
  canEnterDepartmentWorkspace: ValueSource<boolean>
  departmentErrorMessage: ValueSource<string>
  enterpriseDepartmentQueryFields: ValueSource<unknown[]>
  enterpriseDepartmentTableColumns: ValueSource<unknown[]>
  enterpriseDepartmentTableItems: ValueSource<unknown[]>
  departmentCountLabel: ValueSource<string>
  postModuleReady: ValueSource<boolean>
  canEnterPostWorkspace: ValueSource<boolean>
  postErrorMessage: ValueSource<string>
  enterprisePostQueryFields: ValueSource<unknown[]>
  enterprisePostTableColumns: ValueSource<unknown[]>
  enterprisePostTableItems: ValueSource<unknown[]>
  postCountLabel: ValueSource<string>
  menuModuleReady: ValueSource<boolean>
  canEnterMenuWorkspace: ValueSource<boolean>
  menuErrorMessage: ValueSource<string>
  enterpriseMenuQueryFields: ValueSource<unknown[]>
  enterpriseMenuTableColumns: ValueSource<unknown[]>
  enterpriseMenuTableItems: ValueSource<unknown[]>
  menuCountLabel: ValueSource<string>
  notificationModuleReady: ValueSource<boolean>
  canEnterNotificationWorkspace: ValueSource<boolean>
  notificationErrorMessage: ValueSource<string>
  enterpriseNotificationQueryFields: ValueSource<unknown[]>
  enterpriseNotificationTableColumns: ValueSource<unknown[]>
  enterpriseNotificationTableItems: ValueSource<unknown[]>
  notificationCountLabel: ValueSource<string>
  operationLogModuleReady: ValueSource<boolean>
  canEnterOperationLogWorkspace: ValueSource<boolean>
  operationLogErrorMessage: ValueSource<string>
  enterpriseOperationLogQueryFields: ValueSource<unknown[]>
  enterpriseOperationLogTableColumns: ValueSource<unknown[]>
  enterpriseOperationLogTableItems: ValueSource<unknown[]>
  operationLogCountLabel: ValueSource<string>
  roleModuleReady: ValueSource<boolean>
  canEnterRoleWorkspace: ValueSource<boolean>
  roleErrorMessage: ValueSource<string>
  enterpriseRoleQueryFields: ValueSource<unknown[]>
  enterpriseRoleTableColumns: ValueSource<unknown[]>
  enterpriseRoleTableItems: ValueSource<unknown[]>
  roleCountLabel: ValueSource<string>
  settingModuleReady: ValueSource<boolean>
  canEnterSettingWorkspace: ValueSource<boolean>
  settingErrorMessage: ValueSource<string>
  enterpriseSettingQueryFields: ValueSource<unknown[]>
  enterpriseSettingTableColumns: ValueSource<unknown[]>
  enterpriseSettingTableItems: ValueSource<unknown[]>
  settingCountLabel: ValueSource<string>
  tenantModuleReady: ValueSource<boolean>
  canEnterTenantWorkspace: ValueSource<boolean>
  tenantErrorMessage: ValueSource<string>
  enterpriseTenantQueryFields: ValueSource<unknown[]>
  enterpriseTenantTableColumns: ValueSource<unknown[]>
  enterpriseTenantTableItems: ValueSource<unknown[]>
  tenantCountLabel: ValueSource<string>
  userModuleReady: ValueSource<boolean>
  canEnterUserWorkspace: ValueSource<boolean>
  userErrorMessage: ValueSource<string>
  enterpriseUserQueryFields: ValueSource<unknown[]>
  enterpriseUserTableColumns: ValueSource<unknown[]>
  enterpriseUserTableItems: ValueSource<unknown[]>
  userCountLabel: ValueSource<string>
  customerModuleReady: ValueSource<boolean>
  canEnterCustomerWorkspace: ValueSource<boolean>
  customerErrorMessage: ValueSource<string>
  enterpriseQueryFields: ValueSource<unknown[]>
  enterpriseTableColumns: ValueSource<unknown[]>
  enterpriseTableItems: ValueSource<unknown[]>
  enterpriseTableActions: ValueSource<unknown[]>
  customerCountLabel: ValueSource<string>
  currentQuerySummary: ValueSource<string>
  enterpriseCrudCopy: ValueSource<Record<string, unknown>>
  localizePlatformStatus: (status: string | null | undefined) => string
  customerPaginationSummary: ValueSource<string>
  customerListPageSize: ValueSource<string>
  customerListSortValue: ValueSource<string>
  customerPageInputValue: ValueSource<string>
  customerPageSizeOptions: ValueSource<unknown[]>
  customerSortOptions: ValueSource<unknown[]>
  canGoToPreviousCustomerPage: ValueSource<boolean>
  canGoToNextCustomerPage: ValueSource<boolean>
  canJumpToCustomerPage: ValueSource<boolean>
  dictionaryDetailLoading: ValueSource<boolean>
  dictionaryDetailErrorMessage: ValueSource<string>
  dictionaryPanelMode: ValueSource<string>
  dictionaryPanelTitle: ValueSource<string>
  dictionaryPanelDescription: ValueSource<string>
  selectedDictionaryType: ValueSource<Record<string, unknown> | null>
  selectedDictionaryTypeItems: ValueSource<unknown[]>
  enterpriseDictionaryFormFields: ValueSource<unknown[]>
  enterpriseDictionaryFormValues: ValueSource<Record<string, unknown>>
  enterpriseFormCopy: ValueSource<Record<string, unknown>>
  localizeDictionaryStatus: (status: string) => string
  canUpdateDictionaryTypes: ValueSource<boolean>
  canUpdateDepartments: ValueSource<boolean>
  departmentDetailLoading: ValueSource<boolean>
  departmentDetailErrorMessage: ValueSource<string>
  departmentPanelMode: ValueSource<string>
  departmentPanelTitle: ValueSource<string>
  departmentPanelDescription: ValueSource<string>
  selectedDepartment: ValueSource<Record<string, unknown> | null>
  selectedDepartmentDetail: ValueSource<Record<string, unknown> | null>
  enterpriseDepartmentFormFields: ValueSource<unknown[]>
  enterpriseDepartmentFormValues: ValueSource<Record<string, unknown>>
  departmentParentLookup: ValueSource<Record<string, string>>
  canUpdatePosts: ValueSource<boolean>
  postDetailLoading: ValueSource<boolean>
  postDetailErrorMessage: ValueSource<string>
  postPanelMode: ValueSource<string>
  postPanelTitle: ValueSource<string>
  postPanelDescription: ValueSource<string>
  selectedPost: ValueSource<Record<string, unknown> | null>
  enterprisePostFormFields: ValueSource<unknown[]>
  enterprisePostFormValues: ValueSource<Record<string, unknown>>
  canUpdateMenus: ValueSource<boolean>
  menuDetailLoading: ValueSource<boolean>
  menuDetailErrorMessage: ValueSource<string>
  menuPanelMode: ValueSource<string>
  menuPanelTitle: ValueSource<string>
  menuPanelDescription: ValueSource<string>
  selectedMenu: ValueSource<Record<string, unknown> | null>
  selectedMenuDetail: ValueSource<Record<string, unknown> | null>
  enterpriseMenuFormFields: ValueSource<unknown[]>
  enterpriseMenuFormValues: ValueSource<Record<string, unknown>>
  menuParentLookup: ValueSource<Record<string, string>>
  canUpdateNotifications: ValueSource<boolean>
  notificationDetailLoading: ValueSource<boolean>
  notificationDetailErrorMessage: ValueSource<string>
  notificationPanelMode: ValueSource<string>
  notificationPanelTitle: ValueSource<string>
  notificationPanelDescription: ValueSource<string>
  selectedNotification: ValueSource<Record<string, unknown> | null>
  enterpriseNotificationFormFields: ValueSource<unknown[]>
  enterpriseNotificationFormValues: ValueSource<Record<string, unknown>>
  localizeNotificationStatus: (status: string) => string
  localizeNotificationLevel: (level: string) => string
  operationLogDetailLoading: ValueSource<boolean>
  operationLogDetailErrorMessage: ValueSource<string>
  operationLogPanelTitle: ValueSource<string>
  operationLogPanelDescription: ValueSource<string>
  selectedOperationLog: ValueSource<Record<string, unknown> | null>
  enterpriseOperationLogDetailFields: ValueSource<unknown[]>
  enterpriseOperationLogDetailValues: ValueSource<Record<string, unknown>>
  operationLogDetailsText: ValueSource<string>
  canUpdateRoles: ValueSource<boolean>
  roleDetailLoading: ValueSource<boolean>
  roleDetailErrorMessage: ValueSource<string>
  rolePanelMode: ValueSource<string>
  rolePanelTitle: ValueSource<string>
  rolePanelDescription: ValueSource<string>
  selectedRole: ValueSource<Record<string, unknown> | null>
  selectedRoleDetail: ValueSource<Record<string, unknown> | null>
  enterpriseRoleFormFields: ValueSource<unknown[]>
  enterpriseRoleFormValues: ValueSource<Record<string, unknown>>
  canUpdateSettings: ValueSource<boolean>
  settingDetailLoading: ValueSource<boolean>
  settingDetailErrorMessage: ValueSource<string>
  settingPanelMode: ValueSource<string>
  settingPanelTitle: ValueSource<string>
  settingPanelDescription: ValueSource<string>
  selectedSetting: ValueSource<Record<string, unknown> | null>
  enterpriseSettingFormFields: ValueSource<unknown[]>
  enterpriseSettingFormValues: ValueSource<Record<string, unknown>>
  canUpdateTenants: ValueSource<boolean>
  tenantDetailLoading: ValueSource<boolean>
  tenantDetailErrorMessage: ValueSource<string>
  tenantPanelMode: ValueSource<string>
  tenantPanelTitle: ValueSource<string>
  tenantPanelDescription: ValueSource<string>
  selectedTenant: ValueSource<Record<string, unknown> | null>
  enterpriseTenantFormFields: ValueSource<unknown[]>
  enterpriseTenantFormValues: ValueSource<Record<string, unknown>>
  canUpdateUsers: ValueSource<boolean>
  canResetUserPasswords: ValueSource<boolean>
  userPanelMode: ValueSource<string>
  userPanelTitle: ValueSource<string>
  userPanelDescription: ValueSource<string>
  selectedUser: ValueSource<Record<string, unknown> | null>
  enterpriseUserFormFields: ValueSource<unknown[]>
  enterpriseUserFormValues: ValueSource<Record<string, unknown>>
  userPasswordInput: Ref<string>
  workflowDetailLoading: ValueSource<boolean>
  workflowDetailErrorMessage: ValueSource<string>
  selectedWorkflowDefinition: ValueSource<Record<string, unknown> | null>
  workflowVersionHistoryCards: ValueSource<unknown[]>
  workflowDefinitionDetailCards: ValueSource<unknown[]>
  localizeWorkflowStatus: (status: string) => string
  fileDetailLoading: ValueSource<boolean>
  fileActionLoading: ValueSource<boolean>
  fileDetailErrorMessage: ValueSource<string>
  filePanelMode: ValueSource<string>
  selectedFile: ValueSource<Record<string, unknown> | null>
  pendingUploadFile: Ref<File | null>
  selectedGeneratorPreviewSchema: ValueSource<{ name?: string } | null>
  selectedGeneratorPreviewFile: ValueSource<Record<string, unknown> | null>
  generatorPreviewSqlPreview: ValueSource<string>
  enterpriseFormMode: ValueSource<string>
  enterprisePanelTitle: ValueSource<string>
  enterprisePanelDescription: ValueSource<string>
  deleteConfirmId: ValueSource<string | null>
  selectedCustomer: ValueSource<Record<string, unknown> | null>
  enterpriseFormFields: ValueSource<unknown[]>
  enterpriseFormValues: ValueSource<Record<string, unknown>>
  fileItems: ValueSource<Array<{ id: string } & Record<string, unknown>>>
  handleWorkflowDefinitionSelect: (definitionId: string) => void
  setWorkflowStatusFilter: (status: string) => void
  resetWorkflowFilters: () => void
  updateFileQuery: (query: string) => void
  resetFileQuery: () => void
  selectFile: (file: Record<string, unknown>) => Promise<void> | void
  openFileUploadPanel: () => void
  resetGeneratorPreviewFilters: () => void
  refreshGeneratorPreview: () => void
  applyGeneratorPreview: () => void
  handleDictionarySearch: (payload: unknown) => void
  handleDictionaryReset: () => void
  handleDictionaryRowClick: (payload: unknown) => void
  handleDepartmentSearch: (payload: unknown) => void
  handleDepartmentReset: () => void
  handleDepartmentRowClick: (payload: unknown) => void
  handlePostSearch: (payload: unknown) => void
  handlePostReset: () => void
  handlePostRowClick: (payload: unknown) => void
  handleMenuSearch: (payload: unknown) => void
  handleMenuReset: () => void
  handleMenuRowClick: (payload: unknown) => void
  handleNotificationSearch: (payload: unknown) => void
  handleNotificationReset: () => void
  handleNotificationRowClick: (payload: unknown) => void
  handleOperationLogSearch: (payload: unknown) => void
  handleOperationLogReset: () => void
  handleOperationLogRowClick: (payload: unknown) => void
  handleRoleSearch: (payload: unknown) => void
  handleRoleReset: () => void
  handleRoleRowClick: (payload: unknown) => void
  handleSettingSearch: (payload: unknown) => void
  handleSettingReset: () => void
  handleSettingRowClick: (payload: unknown) => void
  handleTenantSearch: (payload: unknown) => void
  handleTenantReset: () => void
  handleTenantRowClick: (payload: unknown) => void
  handleUserSearch: (payload: unknown) => void
  handleUserReset: () => void
  handleUserRowClick: (payload: unknown) => void
  openCustomerWorkspace: () => void
  handleEnterpriseSearch: (payload: unknown) => void
  handleEnterpriseReset: () => void
  handleEnterpriseAction: (payload: unknown) => void
  handleEnterpriseRowClick: (payload: unknown) => void
  handleCustomerPageSizeChange: (value: string) => void
  handleCustomerSortChange: (value: string) => void
  goToFirstCustomerPage: () => void
  goToPreviousCustomerPage: () => void
  goToNextCustomerPage: () => void
  goToLastCustomerPage: () => void
  updateCustomerPageInput: (value: string) => void
  submitCustomerPageJump: () => void
  openRoleCreatePanel: () => void
  reloadRoles: () => void
  openCreatePanel: () => void
  reloadCustomers: () => void
  openDictionaryCreatePanel: () => void
  reloadDictionaries: () => void
  openDepartmentCreatePanel: () => void
  reloadDepartments: () => void
  openPostCreatePanel: () => void
  reloadPosts: () => void
  openMenuCreatePanel: () => void
  reloadMenus: () => void
  openNotificationCreatePanel: () => void
  reloadNotifications: () => void
  reloadOperationLogs: () => void
  openUserCreatePanel: () => void
  reloadUsers: () => void
  openSettingCreatePanel: () => void
  reloadSettings: () => void
  openTenantCreatePanel: () => void
  reloadTenants: () => void
  reloadFiles: () => void
  reloadWorkflowDefinitions: () => void
  openCurrentWorkspaceTab: () => void
  submitLogout: () => void
  startDictionaryEdit: () => void
  submitDictionaryForm: (payload: unknown) => void
  cancelDictionaryPanel: () => void
  startDepartmentEdit: () => void
  submitDepartmentForm: (payload: unknown) => void
  cancelDepartmentPanel: () => void
  startPostEdit: () => void
  submitPostForm: (payload: unknown) => void
  cancelPostPanel: () => void
  startMenuEdit: () => void
  submitMenuForm: (payload: unknown) => void
  cancelMenuPanel: () => void
  markSelectedNotificationAsRead: () => void
  submitNotificationForm: (payload: unknown) => void
  cancelNotificationPanel: () => void
  startRoleEdit: () => void
  submitRoleForm: (payload: unknown) => void
  cancelRolePanel: () => void
  startSettingEdit: () => void
  submitSettingForm: (payload: unknown) => void
  cancelSettingPanel: () => void
  startTenantEdit: () => void
  toggleSelectedTenantStatus: () => void
  submitTenantForm: (payload: unknown) => void
  cancelTenantPanel: () => void
  startUserEdit: () => void
  startUserPasswordReset: () => void
  submitUserForm: (payload: unknown) => void
  cancelUserPanel: () => void
  submitUserPasswordReset: () => void
  setPendingUploadFile: (value: File | null) => void
  submitFileUpload: () => void
  downloadSelectedFile: () => void
  openFileDeletePanel: () => void
  confirmFileDelete: () => void
  cancelFilePanel: () => void
  confirmDelete: () => void
  cancelDelete: () => void
  startEdit: () => void
  requestDelete: () => void
  handleEnterpriseFormSubmit: (payload: unknown) => void
  handleEnterpriseFormCancel: () => void
  submitLogin: () => void
  vueEnterprisePresetStatus: string
}
