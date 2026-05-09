import type { ElyQueryValues } from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, isRef } from "vue"

import type { FileWorkspaceQuery } from "../lib/file-workspace"
import type { GeneratorPreviewFileCard } from "../lib/generator-preview-workspace"
import type {
  AuthIdentityResponse,
  FileRecord,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
  PlatformResponse,
} from "../lib/platform-api"
import type { AppTranslate } from "./app-shell-helpers"

export type ValueSource<T> = Ref<T> | ComputedRef<T>

export const read = <T>(source: ValueSource<T> | T): T =>
  isRef(source) ? source.value : source

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
  roleExportLoading: ValueSource<boolean>
  canCreateRoles: ValueSource<boolean>
  canViewRoles: ValueSource<boolean>
  isCustomerWorkspace: ComputedRef<boolean>
  customerLoading: ValueSource<boolean>
  customerWorkspaceState: Record<string, unknown>
  canCreateCustomers: ValueSource<boolean>
  canViewCustomers: ValueSource<boolean>
  canUpdateCustomers: ValueSource<boolean>
  canDeleteCustomers: ValueSource<boolean>
  isDictionaryWorkspace: ComputedRef<boolean>
  dictionaryLoading: ValueSource<boolean>
  dictionaryTypeExportLoading: ValueSource<boolean>
  dictionaryItemsExportLoading: ValueSource<boolean>
  canCreateDictionaryTypes: ValueSource<boolean>
  canViewDictionaries: ValueSource<boolean>
  isDepartmentWorkspace: ComputedRef<boolean>
  departmentLoading: ValueSource<boolean>
  departmentWorkspaceState: Record<string, unknown>
  departmentExportLoading: ValueSource<boolean>
  canCreateDepartments: ValueSource<boolean>
  canViewDepartments: ValueSource<boolean>
  isSessionWorkspace: ComputedRef<boolean>
  sessionLoading: ValueSource<boolean>
  canEnterSessionWorkspace: ValueSource<boolean>
  isPostWorkspace: ComputedRef<boolean>
  postLoading: ValueSource<boolean>
  postWorkspaceState: Record<string, unknown>
  postExportLoading: ValueSource<boolean>
  canCreatePosts: ValueSource<boolean>
  canViewPosts: ValueSource<boolean>
  isMenuWorkspace: ComputedRef<boolean>
  menuLoading: ValueSource<boolean>
  menuWorkspaceState: Record<string, unknown>
  menuExportLoading: ValueSource<boolean>
  canCreateMenus: ValueSource<boolean>
  canViewMenus: ValueSource<boolean>
  isNotificationWorkspace: ComputedRef<boolean>
  notificationLoading: ValueSource<boolean>
  notificationWorkspaceState: Record<string, unknown>
  notificationExportLoading: ValueSource<boolean>
  canCreateNotifications: ValueSource<boolean>
  canViewNotifications: ValueSource<boolean>
  visibleUnreadNotificationCount: ValueSource<number>
  isOperationLogWorkspace: ComputedRef<boolean>
  operationLogLoading: ValueSource<boolean>
  operationLogExportLoading: ValueSource<boolean>
  canViewOperationLogs: ValueSource<boolean>
  canExportOperationLogs: ValueSource<boolean>
  isUserWorkspace: ComputedRef<boolean>
  userLoading: ValueSource<boolean>
  userWorkspaceState: Record<string, unknown>
  userExportLoading: ValueSource<boolean>
  canCreateUsers: ValueSource<boolean>
  canViewUsers: ValueSource<boolean>
  isSettingWorkspace: ComputedRef<boolean>
  settingLoading: ValueSource<boolean>
  settingWorkspaceState: Record<string, unknown>
  settingExportLoading: ValueSource<boolean>
  canCreateSettings: ValueSource<boolean>
  canViewSettings: ValueSource<boolean>
  isTenantWorkspace: ComputedRef<boolean>
  tenantLoading: ValueSource<boolean>
  tenantWorkspaceState: Record<string, unknown>
  tenantExportLoading: ValueSource<boolean>
  canCreateTenants: ValueSource<boolean>
  canViewTenants: ValueSource<boolean>
  isFileWorkspace: ComputedRef<boolean>
  fileLoading: ValueSource<boolean>
  fileExportLoading: ValueSource<boolean>
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
  workflowDefinitionCards: ValueSource<unknown[]>
  workflowDefinitions: ValueSource<unknown[]>
  workflowPaginationSummary: ValueSource<string>
  workflowCanGoToPreviousPage: ValueSource<boolean>
  workflowCanGoToNextPage: ValueSource<boolean>
  workflowDetailDialogOpen: ValueSource<boolean>
  selectedWorkflowDefinitionId: ValueSource<string | null>
  fileModuleReady: ValueSource<boolean>
  canEnterFileWorkspace: ValueSource<boolean>
  fileErrorMessage: ValueSource<string>
  fileQuery: Ref<FileWorkspaceQuery>
  fileFilterSummary: ValueSource<string>
  fileCountLabel: ValueSource<string>
  fileTableItems: ValueSource<unknown[]>
  hasActiveFileFilters: ValueSource<boolean>
  visibleFileCount: ValueSource<number>
  selectedFileId: ValueSource<string | null>
  generatorPreviewLoading: ValueSource<boolean>
  generatorPreviewReviewLoading: ValueSource<boolean>
  generatorPreviewApplyLoading: ValueSource<boolean>
  generatorPreviewErrorMessage: ValueSource<string>
  generatorPreviewInputModeOptions: ValueSource<unknown[]>
  generatorPreviewSchemaOptions: ValueSource<unknown[]>
  generatorPreviewConflictStrategyOptions: ValueSource<unknown[]>
  generatorPreviewRecentSessionOptions: ValueSource<unknown[]>
  selectedGeneratorPreviewInputMode: Ref<string>
  selectedGeneratorPreviewConflictStrategy: Ref<string>
  selectedGeneratorPreviewSchemaName: Ref<string>
  selectedGeneratorPreviewRecentSessionId: Ref<string>
  selectedGeneratorPreviewFrontendTarget: Ref<string>
  generatorPreviewManualSchemaDraft: Ref<string>
  generatorPreviewManualSchemaDraftError: ValueSource<string | null>
  generatorPreviewManualSchemaDraftErrorDetails: ValueSource<string | null>
  loadSelectedSchemaDraft: () => void
  loadGeneratorSchemaTemplate: (templateId: string) => void
  generatorPreviewQuery: Ref<string>
  generatorPreviewFiles: ValueSource<unknown[]>
  selectedGeneratorPreviewFilePath: Ref<string | null>
  canApproveGeneratorPreview: ValueSource<boolean>
  canRejectGeneratorPreview: ValueSource<boolean>
  canApplyGeneratorPreview: ValueSource<boolean>
  canConfirmGeneratorPreview: ValueSource<boolean>
  generatorPreviewDiffSummary: ValueSource<GeneratorPreviewDiffSummary | null>
  generatorPreviewSession: ValueSource<Record<string, unknown> | null>
  dictionaryModuleReady: ValueSource<boolean>
  canEnterDictionaryWorkspace: ValueSource<boolean>
  dictionaryWorkspaceState: Record<string, unknown>
  dictionaryErrorMessage: ValueSource<string>
  enterpriseDictionaryQueryFields: ValueSource<unknown[]>
  enterpriseDictionaryTableColumns: ValueSource<unknown[]>
  dictionaryCountLabel: ValueSource<string>
  departmentModuleReady: ValueSource<boolean>
  canEnterDepartmentWorkspace: ValueSource<boolean>
  departmentErrorMessage: ValueSource<string>
  enterpriseDepartmentQueryFields: ValueSource<unknown[]>
  enterpriseDepartmentTableColumns: ValueSource<unknown[]>
  enterpriseDepartmentTableActions: ValueSource<unknown[]>
  enterpriseDepartmentTableItems: ValueSource<unknown[]>
  departmentCountLabel: ValueSource<string>
  sessionErrorMessage: ValueSource<string>
  enterpriseSessionQueryFields: ValueSource<unknown[]>
  enterpriseSessionTableColumns: ValueSource<unknown[]>
  enterpriseSessionTableItems: ValueSource<unknown[]>
  sessionCountLabel: ValueSource<string>
  postModuleReady: ValueSource<boolean>
  canEnterPostWorkspace: ValueSource<boolean>
  postErrorMessage: ValueSource<string>
  enterprisePostQueryFields: ValueSource<unknown[]>
  enterprisePostTableColumns: ValueSource<unknown[]>
  postCountLabel: ValueSource<string>
  menuModuleReady: ValueSource<boolean>
  canEnterMenuWorkspace: ValueSource<boolean>
  menuErrorMessage: ValueSource<string>
  enterpriseMenuQueryFields: ValueSource<unknown[]>
  enterpriseMenuTableColumns: ValueSource<unknown[]>
  menuCountLabel: ValueSource<string>
  notificationModuleReady: ValueSource<boolean>
  canEnterNotificationWorkspace: ValueSource<boolean>
  enterpriseNotificationQueryFields: ValueSource<unknown[]>
  enterpriseNotificationTableColumns: ValueSource<unknown[]>
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
  roleWorkspaceState: Record<string, unknown>
  roleErrorMessage: ValueSource<string>
  enterpriseRoleQueryFields: ValueSource<unknown[]>
  enterpriseRoleTableColumns: ValueSource<unknown[]>
  roleCountLabel: ValueSource<string>
  settingModuleReady: ValueSource<boolean>
  canEnterSettingWorkspace: ValueSource<boolean>
  enterpriseSettingQueryFields: ValueSource<unknown[]>
  enterpriseSettingTableColumns: ValueSource<unknown[]>
  settingCountLabel: ValueSource<string>
  tenantModuleReady: ValueSource<boolean>
  canEnterTenantWorkspace: ValueSource<boolean>
  enterpriseTenantQueryFields: ValueSource<unknown[]>
  enterpriseTenantTableColumns: ValueSource<unknown[]>
  tenantCountLabel: ValueSource<string>
  userModuleReady: ValueSource<boolean>
  canEnterUserWorkspace: ValueSource<boolean>
  enterpriseUserQueryFields: ValueSource<unknown[]>
  enterpriseUserTableColumns: ValueSource<unknown[]>
  userCountLabel: ValueSource<string>
  customerModuleReady: ValueSource<boolean>
  canEnterCustomerWorkspace: ValueSource<boolean>
  customerErrorMessage: ValueSource<string>
  enterpriseQueryFields: ValueSource<unknown[]>
  enterpriseTableColumns: ValueSource<unknown[]>
  enterpriseTableActions: ValueSource<unknown[]>
  customerCountLabel: ValueSource<string>
  currentQuerySummary: ValueSource<string>
  enterpriseCrudCopy: ValueSource<Record<string, unknown>>
  localizePlatformStatus: (status: string | null | undefined) => string
  customerPaginationSummary: ValueSource<string>
  customerListPageSize: ValueSource<number>
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
  departmentParentLookup: ValueSource<Map<string, unknown>>
  sessionActionLoading: ValueSource<boolean>
  selectedSession: ValueSource<Record<string, unknown> | null>
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
  menuParentLookup: ValueSource<Map<string, unknown>>
  canUpdateNotifications: ValueSource<boolean>
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
  canUpdateTenants: ValueSource<boolean>
  canUpdateUsers: ValueSource<boolean>
  canResetUserPasswords: ValueSource<boolean>
  userPasswordInput: Ref<string>
  workflowDetailLoading: ValueSource<boolean>
  workflowDetailErrorMessage: ValueSource<string>
  selectedWorkflowDefinition: ValueSource<Record<string, unknown> | null>
  localizeWorkflowStatus: (status: string) => string
  fileDetailLoading: ValueSource<boolean>
  fileActionLoading: ValueSource<boolean>
  fileDetailErrorMessage: ValueSource<string>
  filePanelMode: ValueSource<string>
  selectedFile: ValueSource<FileRecord | null>
  pendingUploadFile: Ref<File | null>
  selectedGeneratorPreviewSchema: ValueSource<{ name?: string } | null>
  selectedGeneratorPreviewFile: ValueSource<GeneratorPreviewFileCard | null>
  generatorPreviewSqlPreview: ValueSource<GeneratorPreviewSqlPreview | null>
  generatorPreviewSqlProposal: ValueSource<GeneratorPreviewSqlProposal | null>
  generatorPreviewSqlProposalHandoff: ValueSource<GeneratorPreviewSqlProposalHandoff | null>
  enterpriseFormMode: ValueSource<string>
  enterprisePanelTitle: ValueSource<string>
  enterprisePanelDescription: ValueSource<string>
  deleteConfirmId: ValueSource<string | null>
  selectedCustomer: ValueSource<Record<string, unknown> | null>
  enterpriseFormFields: ValueSource<unknown[]>
  enterpriseFormValues: ValueSource<Record<string, unknown>>
  fileItems: ValueSource<FileRecord[]>
  handleWorkflowDefinitionSelect: (definitionId: string) => void
  closeWorkflowDefinitionDetail: () => void
  setWorkflowQuery: (query: string) => void
  resetWorkflowFilters: () => void
  goToPreviousWorkflowPage: () => void
  goToNextWorkflowPage: () => void
  updateFileQuery: (query: FileWorkspaceQuery) => void
  resetFileQuery: () => void
  selectFile: (file: FileRecord) => Promise<void> | void
  openFileUploadPanel: () => void
  resetGeneratorPreviewFilters: () => void
  refreshGeneratorPreview: () => void
  restoreGeneratorPreviewSession: (sessionId: string) => void
  reviewGeneratorPreview: (input: {
    decision: "approve" | "reject"
    comment?: string
  }) => void
  confirmGeneratorPreview: () => void
  applyGeneratorPreview: () => void
  handleDictionarySearch: (payload: ElyQueryValues) => void
  handleDictionaryReset: () => void
  handleDictionaryRowClick: (payload: Record<string, unknown>) => void
  handleDictionaryAction: (key: string, row: Record<string, unknown>) => void
  handleDepartmentSearch: (payload: ElyQueryValues) => void
  handleDepartmentReset: () => void
  handleDepartmentRowClick: (payload: Record<string, unknown>) => void
  handleDepartmentAction: (key: string, row: Record<string, unknown>) => void
  handleSessionSearch: (payload: ElyQueryValues) => void
  handleSessionReset: () => void
  handleSessionRowClick: (payload: Record<string, unknown>) => void
  handlePostSearch: (payload: ElyQueryValues) => void
  handlePostReset: () => void
  handlePostRowClick: (payload: Record<string, unknown>) => void
  handlePostAction: (key: string, row: Record<string, unknown>) => void
  handleMenuSearch: (payload: ElyQueryValues) => void
  handleMenuReset: () => void
  handleMenuRowClick: (payload: Record<string, unknown>) => void
  handleMenuAction: (key: string, row: Record<string, unknown>) => void
  handleNotificationSearch: (payload: ElyQueryValues) => void
  handleNotificationReset: () => void
  handleNotificationRowClick: (payload: Record<string, unknown>) => void
  handleNotificationAction: (key: string, row: Record<string, unknown>) => void
  handleOperationLogSearch: (payload: ElyQueryValues) => void
  handleOperationLogReset: () => void
  handleOperationLogRowClick: (payload: Record<string, unknown>) => void
  handleRoleSearch: (payload: ElyQueryValues) => void
  handleRoleReset: () => void
  handleRoleRowClick: (payload: Record<string, unknown>) => void
  handleRoleAction: (key: string, row: Record<string, unknown>) => void
  handleSettingSearch: (payload: ElyQueryValues) => void
  handleSettingReset: () => void
  handleSettingRowClick: (payload: Record<string, unknown>) => void
  handleSettingAction: (key: string, row: Record<string, unknown>) => void
  handleTenantSearch: (payload: ElyQueryValues) => void
  handleTenantReset: () => void
  handleTenantRowClick: (payload: Record<string, unknown>) => void
  handleTenantAction: (key: string, row: Record<string, unknown>) => void
  handleUserSearch: (payload: ElyQueryValues) => void
  handleUserReset: () => void
  handleUserRowClick: (payload: Record<string, unknown>) => void
  handleUserAction: (key: string, row: Record<string, unknown>) => void
  openCustomerWorkspace: () => void
  handleEnterpriseSearch: (payload: ElyQueryValues) => void
  handleEnterpriseReset: () => void
  handleEnterpriseAction: (key: string, row: Record<string, unknown>) => void
  handleEnterpriseRowClick: (payload: Record<string, unknown>) => void
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
  handleExportRoles: () => void
  openCreatePanel: () => void
  reloadCustomers: () => void
  openDictionaryCreatePanel: () => void
  reloadDictionaries: () => void
  handleExportDictionaryTypes: () => void
  handleExportDictionaryItems: () => void
  openDepartmentCreatePanel: () => void
  reloadDepartments: () => void
  handleExportDepartments: () => void
  openPostCreatePanel: () => void
  reloadPosts: () => void
  handleExportPosts: () => void
  openMenuCreatePanel: () => void
  reloadMenus: () => void
  handleExportMenus: () => void
  openNotificationCreatePanel: () => void
  reloadNotifications: () => void
  handleExportNotifications: () => void
  reloadOperationLogs: () => void
  handleExportOperationLogs: () => void
  openUserCreatePanel: () => void
  reloadUsers: () => void
  handleExportUsers: () => void
  openSettingCreatePanel: () => void
  reloadSettings: () => void
  handleExportSettings: () => void
  openTenantCreatePanel: () => void
  reloadTenants: () => void
  handleExportTenants: () => void
  reloadFiles: () => void
  handleExportFiles: () => void
  deleteVisibleFiles: () => void
  reloadWorkflowDefinitions: () => void
  submitLogout: () => void
  startDictionaryEdit: () => void
  submitDictionaryForm: (payload: Record<string, unknown>) => void
  cancelDictionaryPanel: () => void
  startDepartmentEdit: () => void
  submitDepartmentForm: (payload: Record<string, unknown>) => void
  cancelDepartmentPanel: () => void
  revokeSelectedSession: () => void
  startPostEdit: () => void
  submitPostForm: (payload: Record<string, unknown>) => void
  cancelPostPanel: () => void
  startMenuEdit: () => void
  submitMenuForm: (payload: Record<string, unknown>) => void
  cancelMenuPanel: () => void
  markSelectedNotificationAsRead: () => void
  markVisibleNotificationsAsRead: () => void
  submitNotificationForm: (payload: Record<string, unknown>) => void
  cancelNotificationPanel: () => void
  startRoleEdit: () => void
  submitRoleForm: (payload: Record<string, unknown>) => void
  cancelRolePanel: () => void
  startSettingEdit: () => void
  submitSettingForm: (payload: Record<string, unknown>) => void
  cancelSettingPanel: () => void
  startTenantEdit: () => void
  toggleSelectedTenantStatus: () => void
  submitTenantForm: (payload: Record<string, unknown>) => void
  cancelTenantPanel: () => void
  startUserEdit: () => void
  startUserPasswordReset: () => void
  submitUserForm: (payload: Record<string, unknown>) => void
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
  handleEnterpriseFormSubmit: (payload: Record<string, unknown>) => void
  handleEnterpriseFormCancel: () => void
  submitLogin: () => void
  vueEnterprisePresetStatus: string
}
