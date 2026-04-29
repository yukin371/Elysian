<script setup lang="ts">
import {
  applyCrudDictionaryOptions,
  buildCrudDictionaryOptionCatalog,
  createVueLocaleRuntime,
  provideVueLocaleRuntime,
} from "@elysian/frontend-vue"
import {
  ElyCrudWorkspace,
  ElyShell,
  useElyCrudPage,
  vueEnterprisePresetManifest,
} from "@elysian/ui-enterprise-vue"
import { ConfigProvider as TConfigProvider } from "tdesign-vue-next/es/config-provider"
import enUs from "tdesign-vue-next/es/locale/en_US"
import zhCn from "tdesign-vue-next/es/locale/zh_CN"
import { Select as TSelect } from "tdesign-vue-next/es/select"
import { computed, ref } from "vue"
import { createAppShellLocalization } from "./app/app-shell-helpers"
import { createExampleShellBindingsOptions } from "./app/create-example-shell-bindings-options"
import {
  customerPageDefinition,
  departmentPageDefinition,
  dictionaryPageDefinition,
  menuPageDefinition,
  notificationPageDefinition,
  operationLogPageDefinition,
  postPageDefinition,
  rolePageDefinition,
  settingPageDefinition,
  tenantPageDefinition,
  userPageDefinition,
} from "./app/example-page-definitions"
import { useExampleNavigation } from "./app/use-example-navigation"
import { useExampleQuerySummary } from "./app/use-example-query-summary"
import { useExampleSessionOrchestration } from "./app/use-example-session-orchestration"
import { useExampleShellBindings } from "./app/use-example-shell-bindings"
import { useExampleShellMeta } from "./app/use-example-shell-meta"
import { useExampleWorkspaceGates } from "./app/use-example-workspace-gates"
import { useExampleWorkspaceSync } from "./app/use-example-workspace-sync"
import ShellHeroBanner from "./components/workspaces/shell/ShellHeroBanner.vue"
import ShellWorkspaceHeaderActions from "./components/workspaces/shell/ShellWorkspaceHeaderActions.vue"
import ShellWorkspaceMainSwitch from "./components/workspaces/shell/ShellWorkspaceMainSwitch.vue"
import ShellWorkspaceSecondarySwitch from "./components/workspaces/shell/ShellWorkspaceSecondarySwitch.vue"
import ShellWorkspaceSectionIntro from "./components/workspaces/shell/ShellWorkspaceSectionIntro.vue"
import { exampleLocaleMessages } from "./i18n"
import { resolveWorkspaceMenuKey } from "./lib/navigation-workspace"
import type { AuthIdentityResponse, PlatformResponse } from "./lib/platform-api"
import { useAuthSessionWorkspace } from "./workspaces/use-auth-session-workspace"
import { useCustomerWorkspace } from "./workspaces/use-customer-workspace"
import { useDepartmentWorkspace } from "./workspaces/use-department-workspace"
import { useDictionaryWorkspace } from "./workspaces/use-dictionary-workspace"
import { useFileWorkspace } from "./workspaces/use-file-workspace"
import { useGeneratorPreviewWorkspace } from "./workspaces/use-generator-preview-workspace"
import { useMenuWorkspace } from "./workspaces/use-menu-workspace"
import { useNotificationWorkspace } from "./workspaces/use-notification-workspace"
import { useOperationLogWorkspace } from "./workspaces/use-operation-log-workspace"
import { usePostWorkspace } from "./workspaces/use-post-workspace"
import { useRoleWorkspace } from "./workspaces/use-role-workspace"
import { useSettingWorkspace } from "./workspaces/use-setting-workspace"
import { useTenantWorkspace } from "./workspaces/use-tenant-workspace"
import { useUserWorkspace } from "./workspaces/use-user-workspace"
import { useWorkflowWorkspace } from "./workspaces/use-workflow-workspace"

const localeRuntime = provideVueLocaleRuntime(
  createVueLocaleRuntime({
    defaultLocale: "zh-CN",
    fallbackLocale: "en-US",
    messages: exampleLocaleMessages,
  }),
)

const { locale, t } = localeRuntime

const tdesignGlobalConfig = computed(() =>
  locale.value === "zh-CN" ? zhCn : enUs,
)

const localeOptions = [
  { key: "zh-CN", labelKey: "app.locale.zhCN" },
  { key: "en-US", labelKey: "app.locale.enUS" },
] as const

const {
  buildFallbackNavigation,
  describeWorkflowNode,
  localizeActionLabel,
  localizeCustomerStatus,
  localizeDepartmentFieldLabel,
  localizeDepartmentStatus,
  localizePostFieldLabel,
  localizePostStatus,
  localizeDictionaryFieldLabel,
  localizeDictionaryStatus,
  localizeFieldLabel,
  localizeMenuBoolean,
  localizeMenuFieldLabel,
  localizeMenuStatus,
  localizeMenuType,
  localizeNavigationItems,
  localizeNotificationFieldLabel,
  localizeNotificationLevel,
  localizeNotificationStatus,
  localizeOperationLogFieldLabel,
  localizeOperationLogResult,
  localizePlatformStatus,
  localizeRoleBoolean,
  localizeRoleDataScope,
  localizeRoleFieldLabel,
  localizeRoleStatus,
  localizeSettingFieldLabel,
  localizeSettingStatus,
  localizeTenantFieldLabel,
  localizeTenantStatus,
  localizeUserBoolean,
  localizeUserFieldLabel,
  localizeUserStatus,
  localizeWorkflowNodeType,
  localizeWorkflowStatus,
} = createAppShellLocalization(t)

const platform = ref<PlatformResponse | null>(null)
const authIdentity = ref<AuthIdentityResponse | null>(null)
const registeredModuleCodes = ref<string[]>([])
const loading = ref(true)
const authLoading = ref(false)
const errorMessage = ref("")
const authErrorMessage = ref("")
const authModuleReady = ref(false)
const customerModuleReady = ref(false)
const departmentModuleReady = ref(false)
const postModuleReady = ref(false)
const fileModuleReady = ref(false)
const menuModuleReady = ref(false)
const notificationModuleReady = ref(false)
const operationLogModuleReady = ref(false)
const roleModuleReady = ref(false)
const settingModuleReady = ref(false)
const tenantModuleReady = ref(false)
const userModuleReady = ref(false)
const dictionaryModuleReady = ref(false)
const workflowModuleReady = ref(false)
const envName = ref("unknown")
const demoAdminPassword = ["admin", "123"].join("")

const loginForm = ref({
  username: "admin",
  password: demoAdminPassword,
})

const isAuthenticated = computed(() => authIdentity.value !== null)
const permissionCodes = computed(
  () => authIdentity.value?.permissionCodes ?? [],
)
const {
  currentMenuKey,
  currentModuleCodeLabel,
  currentModuleReady,
  currentModuleStatusLabel,
  currentNavigationPath,
  currentShellTabKey,
  currentWorkspaceDescription,
  currentWorkspaceKind,
  currentWorkspaceSectionCopy,
  currentWorkspaceSectionTitle,
  currentWorkspaceTitle,
  customerNavigationItem,
  enterpriseNavigation,
  enterpriseSelectedMenuKey,
  enterpriseSelectedTabKey,
  isCustomerWorkspace,
  isDepartmentWorkspace,
  isSessionWorkspace,
  isPostWorkspace,
  isDictionaryWorkspace,
  isFileWorkspace,
  isGeneratorPreviewWorkspace,
  isMenuWorkspace,
  isNotificationWorkspace,
  isOperationLogWorkspace,
  isRoleWorkspace,
  isRuntimeShellTab,
  isSettingWorkspace,
  isTenantWorkspace,
  isUserWorkspace,
  isWorkflowDefinitionsWorkspace,
  navigationItemCount,
  openCurrentWorkspaceTab,
  openCustomerWorkspace,
  placeholderWorkspaceCopy,
  selectedNavigationItem,
} = useExampleNavigation({
  authIdentity,
  registeredModuleCodes,
  t,
  localizeNavigationItems,
  buildFallbackNavigation,
})

const {
  canCreateCustomers,
  canCreateDepartments,
  canCreatePosts,
  canCreateDictionaryTypes,
  canCreateMenus,
  canCreateNotifications,
  canCreateRoles,
  canCreateSettings,
  canCreateTenants,
  canCreateUsers,
  canDeleteCustomers,
  canDeleteFiles,
  canDownloadFiles,
  canEnterCustomerWorkspace,
  canEnterDepartmentWorkspace,
  canEnterSessionWorkspace,
  canEnterPostWorkspace,
  canEnterDictionaryWorkspace,
  canEnterFileWorkspace,
  canEnterMenuWorkspace,
  canEnterNotificationWorkspace,
  canEnterOperationLogWorkspace,
  canEnterRoleWorkspace,
  canEnterSettingWorkspace,
  canEnterTenantWorkspace,
  canEnterUserWorkspace,
  canEnterWorkflowWorkspace,
  canResetUserPasswords,
  canUpdateCustomers,
  canUpdateDepartments,
  canUpdatePosts,
  canUpdateDictionaryTypes,
  canUpdateMenus,
  canUpdateNotifications,
  canUpdateRoles,
  canUpdateSettings,
  canUpdateTenants,
  canUpdateUsers,
  canUploadFiles,
  canViewCustomers,
  canViewDepartments,
  canViewPosts,
  canViewDictionaries,
  canViewFiles,
  canViewMenus,
  canViewNotifications,
  canViewOperationLogs,
  canViewRoles,
  canViewSettings,
  canViewTenants,
  canViewUsers,
  canViewWorkflowDefinitions,
} = useExampleWorkspaceGates({
  permissionCodes,
  authModuleReady,
  isAuthenticated,
  authIdentity,
  customerModuleReady,
  departmentModuleReady,
  postModuleReady,
  dictionaryModuleReady,
  fileModuleReady,
  menuModuleReady,
  notificationModuleReady,
  operationLogModuleReady,
  roleModuleReady,
  settingModuleReady,
  tenantModuleReady,
  userModuleReady,
  workflowModuleReady,
})

const {
  applyLoading: generatorPreviewApplyLoading,
  applyPreview: applyGeneratorPreview,
  canApplyPreview: canApplyGeneratorPreview,
  currentDiffSummary: generatorPreviewDiffSummary,
  currentSession: generatorPreviewSession,
  errorMessage: generatorPreviewErrorMessage,
  filterSummary: generatorPreviewFilterSummary,
  filteredPreviewFiles: generatorPreviewFiles,
  loading: generatorPreviewLoading,
  previewQuery: generatorPreviewQuery,
  refreshPreview: refreshGeneratorPreview,
  resetFilters: resetGeneratorPreviewFilters,
  schemaOptions: generatorPreviewSchemaOptions,
  selectedFilePath: selectedGeneratorPreviewFilePath,
  selectedFrontendTarget: selectedGeneratorPreviewFrontendTarget,
  selectedPreviewFile: selectedGeneratorPreviewFile,
  selectedSchema: selectedGeneratorPreviewSchema,
  selectedSchemaName: selectedGeneratorPreviewSchemaName,
  sqlPreview: generatorPreviewSqlPreview,
} = useGeneratorPreviewWorkspace(t, isGeneratorPreviewWorkspace)

const dictionaryOptionCatalog = computed(() =>
  buildCrudDictionaryOptionCatalog(
    dictionaryTypes.value,
    dictionaryItems.value,
  ),
)

const resolvedCustomerPageDefinition = computed(() =>
  applyCrudDictionaryOptions(
    customerPageDefinition,
    dictionaryOptionCatalog.value,
  ),
)

const enterpriseCustomerPage = useElyCrudPage(
  resolvedCustomerPageDefinition,
  permissionCodes,
)

const customerWorkspace = useCustomerWorkspace({
  currentShellTabKey,
  page: enterpriseCustomerPage,
  locale,
  t,
  localizeFieldLabel,
  localizeStatus: (status) => localizeCustomerStatus(status),
  localizeActionLabel,
  canView: canViewCustomers,
  canCreate: canCreateCustomers,
  canUpdate: canUpdateCustomers,
  canDelete: canDeleteCustomers,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  canGoToNextCustomerPage,
  canGoToPreviousCustomerPage,
  canJumpToCustomerPage,
  cancelDelete,
  clearWorkspace: clearCustomerWorkspace,
  confirmDelete,
  customerCountLabel,
  customerErrorMessage,
  customerFormMode: enterpriseFormMode,
  customerItems,
  customerListPage,
  customerListPageSize,
  customerListSortValue,
  customerListTotal,
  customerListTotalPages,
  customerLoading,
  customerPageInputValue,
  customerPageSizeOptions,
  customerPaginationSummary,
  customerQuerySummary,
  customerQueryValues: enterpriseQueryValues,
  customerSortOptions,
  deleteConfirmId,
  formFields: enterpriseFormFields,
  formValues: enterpriseFormValues,
  goToFirstCustomerPage,
  goToLastCustomerPage,
  goToNextCustomerPage,
  goToPreviousCustomerPage,
  handleAction: handleEnterpriseAction,
  handleFormCancel: handleEnterpriseFormCancel,
  handleFormSubmit: handleEnterpriseFormSubmit,
  handlePageSizeChange: handleCustomerPageSizeChange,
  handleReset: handleEnterpriseReset,
  handleRowClick: handleEnterpriseRowClick,
  handleSearch: handleEnterpriseSearch,
  handleSortChange: handleCustomerSortChange,
  openCreatePanel,
  panelDescription: enterprisePanelDescription,
  panelTitle: enterprisePanelTitle,
  queryFields: enterpriseQueryFields,
  reloadCustomers,
  requestDelete,
  selectedCustomer,
  selectedCustomerId,
  startEdit,
  submitCustomerPageJump,
  tableActions: enterpriseTableActions,
  tableColumns: enterpriseTableColumns,
  tableItems: enterpriseTableItems,
  updateCustomerPageInput,
} = customerWorkspace

const fileWorkspace = useFileWorkspace({
  currentShellTabKey,
  isWorkspaceActive: isFileWorkspace,
  locale,
  t,
  canView: canViewFiles,
  canUpload: canUploadFiles,
  canDownload: canDownloadFiles,
  canDelete: canDeleteFiles,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelFilePanel,
  clearWorkspace: clearFileWorkspace,
  confirmDelete: confirmFileDelete,
  countLabel: fileCountLabel,
  downloadSelectedFile,
  fileActionLoading,
  fileDetailErrorMessage,
  fileDetailLoading,
  fileErrorMessage,
  fileItems,
  fileLoading,
  filePanelMode,
  fileQuery,
  filterSummary: fileFilterSummary,
  filteredFileItems,
  openDeletePanel: openFileDeletePanel,
  openUploadPanel: openFileUploadPanel,
  pendingUploadFile,
  reloadFiles,
  resetQuery: resetFileQuery,
  selectFile,
  selectedFile,
  selectedFileId,
  setPendingUploadFile,
  submitUpload: submitFileUpload,
  tableItems: fileTableItems,
  updateQuery: updateFileQuery,
} = fileWorkspace

const sessionWorkspace = useAuthSessionWorkspace({
  currentShellTabKey,
  locale,
  t,
  canEnterWorkspace: canEnterSessionWorkspace,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
  onCurrentSessionRevoked: async () => {
    await submitLogout()
  },
})

const {
  clearWorkspace: clearSessionWorkspace,
  countLabel: sessionCountLabel,
  currentQuerySummary: sessionQuerySummary,
  filteredSessionItems,
  handleReset: handleSessionReset,
  handleRowClick: handleSessionRowClick,
  handleSearch: handleSessionSearch,
  queryFields: enterpriseSessionQueryFields,
  reloadSessions,
  revokeSelectedSession,
  selectedSession,
  sessionActionLoading,
  sessionErrorMessage,
  sessionLoading,
  tableColumns: enterpriseSessionTableColumns,
  tableItems: enterpriseSessionTableItems,
} = sessionWorkspace

const enterpriseDictionaryPage = useElyCrudPage(
  dictionaryPageDefinition,
  permissionCodes,
)
const enterpriseDepartmentPage = useElyCrudPage(
  departmentPageDefinition,
  permissionCodes,
)
const enterprisePostPage = useElyCrudPage(postPageDefinition, permissionCodes)
const enterpriseMenuPage = useElyCrudPage(menuPageDefinition, permissionCodes)
const enterpriseNotificationPage = useElyCrudPage(
  notificationPageDefinition,
  permissionCodes,
)
const enterpriseOperationLogPage = useElyCrudPage(
  operationLogPageDefinition,
  permissionCodes,
)
const enterpriseUserPage = useElyCrudPage(userPageDefinition, permissionCodes)
const enterpriseRolePage = useElyCrudPage(rolePageDefinition, permissionCodes)
const enterpriseSettingPage = useElyCrudPage(
  settingPageDefinition,
  permissionCodes,
)
const enterpriseTenantPage = useElyCrudPage(
  tenantPageDefinition,
  permissionCodes,
)

const notificationWorkspace = useNotificationWorkspace({
  currentShellTabKey,
  page: enterpriseNotificationPage,
  locale,
  t,
  localizeFieldLabel: localizeNotificationFieldLabel,
  localizeLevel: localizeNotificationLevel,
  localizeStatus: localizeNotificationStatus,
  canView: canViewNotifications,
  canCreate: canCreateNotifications,
  canUpdate: canUpdateNotifications,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelNotificationPanel,
  clearWorkspace: clearNotificationWorkspace,
  countLabel: notificationCountLabel,
  filteredNotificationItems,
  formFields: enterpriseNotificationFormFields,
  formValues: enterpriseNotificationFormValues,
  handleReset: handleNotificationReset,
  handleRowClick: handleNotificationRowClick,
  handleSearch: handleNotificationSearch,
  markSelectedAsRead: markSelectedNotificationAsRead,
  notificationDetail,
  notificationDetailErrorMessage,
  notificationDetailLoading,
  notificationErrorMessage,
  notificationItems,
  notificationLoading,
  notificationPanelMode,
  notificationQueryValues,
  openCreatePanel: openNotificationCreatePanel,
  panelDescription: notificationPanelDescription,
  panelTitle: notificationPanelTitle,
  queryFields: enterpriseNotificationQueryFields,
  reloadNotifications,
  selectedNotification,
  selectedNotificationId,
  selectNotification,
  submitForm: submitNotificationForm,
  tableColumns: enterpriseNotificationTableColumns,
  tableItems: enterpriseNotificationTableItems,
} = notificationWorkspace

const operationLogWorkspace = useOperationLogWorkspace({
  currentShellTabKey,
  page: enterpriseOperationLogPage,
  locale,
  t,
  localizeFieldLabel: localizeOperationLogFieldLabel,
  localizeResult: localizeOperationLogResult,
  canView: canViewOperationLogs,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  clearWorkspace: clearOperationLogWorkspace,
  countLabel: operationLogCountLabel,
  detailFields: enterpriseOperationLogDetailFields,
  detailValues: enterpriseOperationLogDetailValues,
  detailsText: operationLogDetailsText,
  filteredOperationLogItems,
  handleReset: handleOperationLogReset,
  handleRowClick: handleOperationLogRowClick,
  handleSearch: handleOperationLogSearch,
  operationLogDetail,
  operationLogDetailErrorMessage,
  operationLogDetailLoading,
  operationLogErrorMessage,
  operationLogLoading,
  operationLogQueryValues,
  panelDescription: operationLogPanelDescription,
  panelTitle: operationLogPanelTitle,
  queryFields: enterpriseOperationLogQueryFields,
  reloadOperationLogs,
  resetQuery: resetOperationLogQuery,
  selectedOperationLog,
  selectedOperationLogId,
  selectOperationLog,
  tableColumns: enterpriseOperationLogTableColumns,
  tableItems: enterpriseOperationLogTableItems,
} = operationLogWorkspace

const dictionaryWorkspace = useDictionaryWorkspace({
  currentShellTabKey,
  page: enterpriseDictionaryPage,
  locale,
  t,
  localizeFieldLabel: localizeDictionaryFieldLabel,
  localizeStatus: localizeDictionaryStatus,
  canView: canViewDictionaries,
  canCreate: canCreateDictionaryTypes,
  canUpdate: canUpdateDictionaryTypes,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelDictionaryPanel,
  clearWorkspace: clearDictionaryOptions,
  countLabel: dictionaryCountLabel,
  dictionaryDetailErrorMessage,
  dictionaryDetailLoading,
  dictionaryErrorMessage,
  dictionaryItems,
  dictionaryLoading,
  dictionaryPanelMode,
  dictionaryQueryValues,
  dictionaryTypes,
  filteredDictionaryTypes,
  formFields: enterpriseDictionaryFormFields,
  formValues: enterpriseDictionaryFormValues,
  handleReset: handleDictionaryReset,
  handleRowClick: handleDictionaryRowClick,
  handleSearch: handleDictionarySearch,
  openCreatePanel: openDictionaryCreatePanel,
  panelDescription: dictionaryPanelDescription,
  panelTitle: dictionaryPanelTitle,
  queryFields: enterpriseDictionaryQueryFields,
  reloadDictionaries,
  resetQuery: resetDictionaryQuery,
  selectDictionaryType,
  selectedDictionaryType,
  selectedDictionaryTypeDetail,
  selectedDictionaryTypeId,
  selectedDictionaryTypeItems,
  startEdit: startDictionaryEdit,
  submitForm: submitDictionaryForm,
  tableColumns: enterpriseDictionaryTableColumns,
  tableItems: enterpriseDictionaryTableItems,
} = dictionaryWorkspace

const departmentWorkspace = useDepartmentWorkspace({
  currentShellTabKey,
  page: enterpriseDepartmentPage,
  locale,
  t,
  localizeFieldLabel: localizeDepartmentFieldLabel,
  localizeStatus: localizeDepartmentStatus,
  canView: canViewDepartments,
  canCreate: canCreateDepartments,
  canUpdate: canUpdateDepartments,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelDepartmentPanel,
  clearWorkspace: clearDepartmentWorkspace,
  countLabel: departmentCountLabel,
  departmentDetail,
  departmentDetailErrorMessage,
  departmentDetailLoading,
  departmentErrorMessage,
  departmentLoading,
  departmentPanelMode,
  departmentQueryValues,
  filteredDepartmentItems,
  formFields: enterpriseDepartmentFormFields,
  formValues: enterpriseDepartmentFormValues,
  handleReset: handleDepartmentReset,
  handleRowClick: handleDepartmentRowClick,
  handleSearch: handleDepartmentSearch,
  openCreatePanel: openDepartmentCreatePanel,
  panelDescription: departmentPanelDescription,
  panelTitle: departmentPanelTitle,
  parentLookup: departmentParentLookup,
  queryFields: enterpriseDepartmentQueryFields,
  reloadDepartments,
  resetQuery: resetDepartmentQuery,
  selectDepartment,
  selectedDepartment,
  selectedDepartmentDetail,
  selectedDepartmentId,
  startEdit: startDepartmentEdit,
  submitForm: submitDepartmentForm,
  tableColumns: enterpriseDepartmentTableColumns,
  tableItems: enterpriseDepartmentTableItems,
} = departmentWorkspace

const postWorkspace = usePostWorkspace({
  currentShellTabKey,
  page: enterprisePostPage,
  locale,
  t,
  localizeFieldLabel: localizePostFieldLabel,
  localizeStatus: localizePostStatus,
  canView: canViewPosts,
  canCreate: canCreatePosts,
  canUpdate: canUpdatePosts,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelPostPanel,
  clearWorkspace: clearPostWorkspace,
  countLabel: postCountLabel,
  formFields: enterprisePostFormFields,
  formValues: enterprisePostFormValues,
  handleReset: handlePostReset,
  handleRowClick: handlePostRowClick,
  handleSearch: handlePostSearch,
  openCreatePanel: openPostCreatePanel,
  panelDescription: postPanelDescription,
  panelTitle: postPanelTitle,
  postDetail,
  postDetailErrorMessage,
  postDetailLoading,
  postErrorMessage,
  postLoading,
  postPanelMode,
  postQueryValues,
  filteredPostItems,
  queryFields: enterprisePostQueryFields,
  reloadPosts,
  resetQuery: resetPostQuery,
  selectPost,
  selectedPost,
  selectedPostId,
  startEdit: startPostEdit,
  submitForm: submitPostForm,
  tableColumns: enterprisePostTableColumns,
  tableItems: enterprisePostTableItems,
} = postWorkspace

const menuWorkspace = useMenuWorkspace({
  currentShellTabKey,
  page: enterpriseMenuPage,
  locale,
  t,
  localizeFieldLabel: localizeMenuFieldLabel,
  localizeType: localizeMenuType,
  localizeBoolean: localizeMenuBoolean,
  localizeStatus: localizeMenuStatus,
  canView: canViewMenus,
  canCreate: canCreateMenus,
  canUpdate: canUpdateMenus,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelMenuPanel,
  clearWorkspace: clearMenuWorkspace,
  countLabel: menuCountLabel,
  filteredMenuItems,
  formFields: enterpriseMenuFormFields,
  formValues: enterpriseMenuFormValues,
  handleReset: handleMenuReset,
  handleRowClick: handleMenuRowClick,
  handleSearch: handleMenuSearch,
  menuDetail,
  menuDetailErrorMessage,
  menuDetailLoading,
  menuErrorMessage,
  menuLoading,
  menuPanelMode,
  menuQueryValues,
  openCreatePanel: openMenuCreatePanel,
  panelDescription: menuPanelDescription,
  panelTitle: menuPanelTitle,
  parentLookup: menuParentLookup,
  queryFields: enterpriseMenuQueryFields,
  reloadMenus,
  resetQuery: resetMenuQuery,
  selectMenu,
  selectedMenu,
  selectedMenuDetail,
  selectedMenuId,
  startEdit: startMenuEdit,
  submitForm: submitMenuForm,
  tableColumns: enterpriseMenuTableColumns,
  tableItems: enterpriseMenuTableItems,
} = menuWorkspace

const roleWorkspace = useRoleWorkspace({
  currentShellTabKey,
  page: enterpriseRolePage,
  locale,
  t,
  localizeFieldLabel: localizeRoleFieldLabel,
  localizeStatus: localizeRoleStatus,
  localizeBoolean: localizeRoleBoolean,
  localizeDataScope: localizeRoleDataScope,
  canView: canViewRoles,
  canCreate: canCreateRoles,
  canUpdate: canUpdateRoles,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelRolePanel,
  clearWorkspace: clearRoleWorkspace,
  countLabel: roleCountLabel,
  filteredRoleItems,
  formFields: enterpriseRoleFormFields,
  formValues: enterpriseRoleFormValues,
  handleReset: handleRoleReset,
  handleRowClick: handleRoleRowClick,
  handleSearch: handleRoleSearch,
  openCreatePanel: openRoleCreatePanel,
  panelDescription: rolePanelDescription,
  panelTitle: rolePanelTitle,
  queryFields: enterpriseRoleQueryFields,
  reloadRoles,
  resetQuery: resetRoleQuery,
  roleDetail,
  roleDetailErrorMessage,
  roleDetailLoading,
  roleErrorMessage,
  roleLoading,
  rolePanelMode,
  roleQueryValues,
  selectRole,
  selectedRole,
  selectedRoleDetail,
  selectedRoleId,
  startEdit: startRoleEdit,
  submitForm: submitRoleForm,
  tableColumns: enterpriseRoleTableColumns,
  tableItems: enterpriseRoleTableItems,
} = roleWorkspace

const tenantWorkspace = useTenantWorkspace({
  currentShellTabKey,
  page: enterpriseTenantPage,
  locale,
  t,
  localizeFieldLabel: localizeTenantFieldLabel,
  localizeStatus: localizeTenantStatus,
  canView: canViewTenants,
  canCreate: canCreateTenants,
  canUpdate: canUpdateTenants,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelTenantPanel,
  clearWorkspace: clearTenantWorkspace,
  countLabel: tenantCountLabel,
  filteredTenantItems,
  formFields: enterpriseTenantFormFields,
  formValues: enterpriseTenantFormValues,
  handleReset: handleTenantReset,
  handleRowClick: handleTenantRowClick,
  handleSearch: handleTenantSearch,
  openCreatePanel: openTenantCreatePanel,
  panelDescription: tenantPanelDescription,
  panelTitle: tenantPanelTitle,
  queryFields: enterpriseTenantQueryFields,
  reloadTenants,
  resetQuery: resetTenantQuery,
  selectTenant,
  selectedTenant,
  selectedTenantId,
  startEdit: startTenantEdit,
  submitForm: submitTenantForm,
  tableColumns: enterpriseTenantTableColumns,
  tableItems: enterpriseTenantTableItems,
  tenantDetail,
  tenantDetailErrorMessage,
  tenantDetailLoading,
  tenantErrorMessage,
  tenantLoading,
  tenantPanelMode,
  tenantQueryValues,
  toggleSelectedStatus: toggleSelectedTenantStatus,
} = tenantWorkspace

const userWorkspace = useUserWorkspace({
  currentShellTabKey,
  page: enterpriseUserPage,
  locale,
  t,
  localizeFieldLabel: localizeUserFieldLabel,
  localizeStatus: localizeUserStatus,
  localizeBoolean: localizeUserBoolean,
  canView: canViewUsers,
  canCreate: canCreateUsers,
  canUpdate: canUpdateUsers,
  canResetPassword: canResetUserPasswords,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelUserPanel,
  clearWorkspace: clearUserWorkspace,
  countLabel: userCountLabel,
  filteredUserItems,
  formFields: enterpriseUserFormFields,
  formValues: enterpriseUserFormValues,
  handleReset: handleUserReset,
  handleRowClick: handleUserRowClick,
  handleSearch: handleUserSearch,
  openCreatePanel: openUserCreatePanel,
  panelDescription: userPanelDescription,
  panelTitle: userPanelTitle,
  queryFields: enterpriseUserQueryFields,
  reloadUsers,
  selectedUser,
  selectedUserId,
  startEdit: startUserEdit,
  startPasswordReset: startUserPasswordReset,
  submitForm: submitUserForm,
  submitPasswordReset: submitUserPasswordReset,
  tableColumns: enterpriseUserTableColumns,
  tableItems: enterpriseUserTableItems,
  userErrorMessage,
  userLoading,
  userPanelMode,
  userPasswordInput,
  userQueryValues,
} = userWorkspace

const workflowWorkspace = useWorkflowWorkspace({
  currentShellTabKey,
  locale,
  t,
  localizeStatus: localizeWorkflowStatus,
  localizeNodeType: localizeWorkflowNodeType,
  describeNode: describeWorkflowNode,
  canView: canViewWorkflowDefinitions,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  clearWorkflowDefinitions,
  handleWorkflowDefinitionSelect,
  reloadWorkflowDefinitions,
  resetWorkflowFilters,
  selectWorkflowDefinition,
  selectedWorkflowDefinition,
  selectedWorkflowDefinitionId,
  setWorkflowStatusFilter,
  workflowDefinitionCards,
  workflowDefinitionDetailCards,
  workflowDefinitions,
  workflowDetailErrorMessage,
  workflowDetailLoading,
  workflowErrorMessage,
  workflowFilterSummary,
  workflowLoading,
  workflowQuery,
  workflowStatusFilter,
  workflowVersionHistoryCards,
} = workflowWorkspace

const settingWorkspace = useSettingWorkspace({
  currentShellTabKey,
  page: enterpriseSettingPage,
  locale,
  t,
  localizeFieldLabel: localizeSettingFieldLabel,
  localizeStatus: localizeSettingStatus,
  canView: canViewSettings,
  canCreate: canCreateSettings,
  canUpdate: canUpdateSettings,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelSettingPanel,
  clearWorkspace: clearSettingWorkspace,
  countLabel: settingCountLabel,
  filteredSettingItems,
  formFields: enterpriseSettingFormFields,
  formValues: enterpriseSettingFormValues,
  handleReset: handleSettingReset,
  handleRowClick: handleSettingRowClick,
  handleSearch: handleSettingSearch,
  openCreatePanel: openSettingCreatePanel,
  panelDescription: settingPanelDescription,
  panelTitle: settingPanelTitle,
  queryFields: enterpriseSettingQueryFields,
  reloadSettings,
  resetQuery: resetSettingQuery,
  selectedSetting,
  selectedSettingId,
  selectSetting,
  settingDetail,
  settingDetailErrorMessage,
  settingDetailLoading,
  settingErrorMessage,
  settingLoading,
  settingPanelMode,
  settingQueryValues,
  startEdit: startSettingEdit,
  submitForm: submitSettingForm,
  tableColumns: enterpriseSettingTableColumns,
  tableItems: enterpriseSettingTableItems,
} = settingWorkspace

const {
  authStatusLabel,
  authStatusTone,
  currentWorkspaceItemCount,
  enterpriseCrudCopy,
  enterpriseFormCopy,
  enterpriseShellCopy,
  enterpriseShellStats,
  enterpriseShellTabs,
  enterpriseShellUser,
  shellWorkspaceDescription,
  shellWorkspaceTitle,
} = useExampleShellMeta({
  t,
  platform,
  authIdentity,
  authModuleReady,
  authLoading,
  isAuthenticated,
  isCustomerWorkspace,
  isDictionaryWorkspace,
  isDepartmentWorkspace,
  isSessionWorkspace,
  isMenuWorkspace,
  isNotificationWorkspace,
  isOperationLogWorkspace,
  isRoleWorkspace,
  isSettingWorkspace,
  isTenantWorkspace,
  isUserWorkspace,
  isWorkflowDefinitionsWorkspace,
  isFileWorkspace,
  isGeneratorPreviewWorkspace,
  isRuntimeShellTab,
  currentWorkspaceKind,
  currentWorkspaceTitle,
  currentWorkspaceDescription,
  currentNavigationPath,
  navigationItemCount,
  customerItems,
  dictionaryItems: filteredDictionaryTypes,
  departmentItems: filteredDepartmentItems,
  sessionItems: filteredSessionItems,
  menuItems: filteredMenuItems,
  notificationItems: filteredNotificationItems,
  operationLogItems: filteredOperationLogItems,
  roleItems: filteredRoleItems,
  settingItems: filteredSettingItems,
  tenantItems: filteredTenantItems,
  userItems: filteredUserItems,
  workflowDefinitions: workflowDefinitionCards,
  fileItems: filteredFileItems,
  generatorPreviewFiles,
})

const { currentQuerySummary } = useExampleQuerySummary({
  t,
  customerQuerySummary,
  isDictionaryWorkspace,
  isDepartmentWorkspace,
  isSessionWorkspace,
  isPostWorkspace,
  isRoleWorkspace,
  isMenuWorkspace,
  isNotificationWorkspace,
  isOperationLogWorkspace,
  isUserWorkspace,
  isSettingWorkspace,
  isTenantWorkspace,
  dictionaryQueryValues,
  departmentQueryValues,
  sessionQuerySummary,
  postQueryValues,
  roleQueryValues,
  menuQueryValues,
  notificationQueryValues,
  operationLogQueryValues,
  userQueryValues,
  settingQueryValues,
  tenantQueryValues,
  localizeDictionaryStatus,
  localizeDepartmentStatus,
  localizePostStatus,
  localizeRoleStatus,
  localizeMenuType,
  localizeMenuStatus,
  localizeNotificationLevel,
  localizeNotificationStatus,
  localizeOperationLogResult,
  localizeUserStatus,
  localizeSettingStatus,
  localizeTenantStatus,
})

useExampleWorkspaceSync({
  customerItems,
  enterpriseFormMode,
  selectedCustomerId,
  canCreateCustomers,
  filteredDictionaryTypes,
  isDictionaryWorkspace,
  dictionaryLoading,
  dictionaryPanelMode,
  selectedDictionaryTypeId,
  canCreateDictionaryTypes,
  selectDictionaryType,
  filteredNotificationItems,
  isNotificationWorkspace,
  notificationLoading,
  notificationPanelMode,
  selectedNotificationId,
  notificationDetail,
  canCreateNotifications,
  selectNotification,
  filteredDepartmentItems,
  isDepartmentWorkspace,
  departmentLoading,
  departmentPanelMode,
  selectedDepartmentId,
  departmentDetail,
  canCreateDepartments,
  selectDepartment,
  filteredPostItems,
  isPostWorkspace,
  postLoading,
  postPanelMode,
  selectedPostId,
  postDetail,
  canCreatePosts,
  selectPost,
  filteredMenuItems,
  isMenuWorkspace,
  menuLoading,
  menuPanelMode,
  selectedMenuId,
  menuDetail,
  canCreateMenus,
  selectMenu,
  filteredOperationLogItems,
  isOperationLogWorkspace,
  operationLogLoading,
  operationLogDetailLoading,
  selectedOperationLogId,
  operationLogDetail,
  selectOperationLog,
  filteredRoleItems,
  isRoleWorkspace,
  roleLoading,
  rolePanelMode,
  selectedRoleId,
  roleDetail,
  canCreateRoles,
  selectRole,
  filteredSettingItems,
  isSettingWorkspace,
  settingLoading,
  settingPanelMode,
  selectedSettingId,
  settingDetail,
  canCreateSettings,
  selectSetting,
  filteredTenantItems,
  isTenantWorkspace,
  tenantLoading,
  tenantPanelMode,
  selectedTenantId,
  tenantDetail,
  canCreateTenants,
  selectTenant,
  filteredUserItems,
  selectedUserId,
  userPanelMode,
  canCreateUsers,
  workflowDefinitionCards,
  isWorkflowDefinitionsWorkspace,
  workflowLoading,
  selectedWorkflowDefinitionId,
  workflowDefinitionDetail,
  selectWorkflowDefinition,
})

const { isRecoverableAuthError, submitLogin, submitLogout } =
  useExampleSessionOrchestration({
    t,
    platform,
    authIdentity,
    registeredModuleCodes,
    loading,
    authLoading,
    errorMessage,
    authErrorMessage,
    envName,
    loginForm,
    authModuleReady,
    customerModuleReady,
    departmentModuleReady,
    postModuleReady,
    fileModuleReady,
    menuModuleReady,
    notificationModuleReady,
    operationLogModuleReady,
    roleModuleReady,
    settingModuleReady,
    tenantModuleReady,
    userModuleReady,
    dictionaryModuleReady,
    workflowModuleReady,
    enterpriseFormMode,
    notificationQueryValues,
    reloadFiles,
    reloadNotifications,
    reloadDictionaries,
    reloadCustomers,
    reloadDepartments,
    reloadSessions,
    reloadPosts,
    reloadMenus,
    reloadOperationLogs,
    reloadRoles,
    reloadSettings,
    reloadTenants,
    reloadUsers,
    reloadWorkflowDefinitions,
    clearCustomerWorkspace,
    clearDictionaryOptions,
    clearFileWorkspace,
    clearNotificationWorkspace,
    clearDepartmentWorkspace,
    clearSessionWorkspace,
    clearPostWorkspace,
    clearMenuWorkspace,
    clearOperationLogWorkspace,
    clearRoleWorkspace,
    clearSettingWorkspace,
    clearTenantWorkspace,
    clearUserWorkspace,
    clearWorkflowDefinitions,
    resetDepartmentQuery,
    resetPostQuery,
    resetMenuQuery,
    resetOperationLogQuery,
    resetRoleQuery,
    resetSettingQuery,
    resetTenantQuery,
    handleUserReset,
  })

const handleShellMenuSelect = (menuKey: string) => {
  const nextMenuKey = resolveWorkspaceMenuKey(
    enterpriseNavigation.value,
    menuKey,
  )

  if (!nextMenuKey) {
    return
  }

  currentMenuKey.value = nextMenuKey
  currentShellTabKey.value = "workspace"
}

const handleShellTabSelect = (tabKey: string) => {
  if (tabKey !== "workspace" && tabKey !== "runtime") {
    return
  }

  currentShellTabKey.value = tabKey
}
const selectedNavigationItemName = computed(
  () => selectedNavigationItem.value?.name ?? t("app.runtime.title"),
)

const shellBindingsOptions = createExampleShellBindingsOptions({
  shell: {
    t,
    platform,
    authIdentity,
    locale,
    loginForm,
    envName,
    authErrorMessage,
    selectedNavigationItemName,
    currentNavigationPath,
    enterpriseSelectedTabKey,
    currentWorkspaceKind,
    isRuntimeShellTab,
    authStatusLabel,
    currentModuleStatusLabel,
    currentModuleCodeLabel,
    placeholderWorkspaceCopy,
    customerNavigationItem,
    permissionCodes,
    authModuleReady,
    isAuthenticated,
    authLoading,
    openCurrentWorkspaceTab,
    submitLogout,
    submitLogin,
    vueEnterprisePresetStatus: vueEnterprisePresetManifest.status,
  },
  roleWorkspace: {
    workspace: roleWorkspace,
    isRoleWorkspace,
    canCreateRoles,
    canViewRoles,
    roleModuleReady,
    canEnterRoleWorkspace,
    canUpdateRoles,
  },
  customerWorkspace: {
    workspace: customerWorkspace,
    isCustomerWorkspace,
    canCreateCustomers,
    canViewCustomers,
    canUpdateCustomers,
    canDeleteCustomers,
    customerModuleReady,
    canEnterCustomerWorkspace,
    currentQuerySummary,
    enterpriseCrudCopy,
    localizePlatformStatus,
    openCustomerWorkspace,
  },
  dictionaryWorkspace: {
    workspace: dictionaryWorkspace,
    isDictionaryWorkspace,
    canCreateDictionaryTypes,
    canViewDictionaries,
    dictionaryModuleReady,
    canEnterDictionaryWorkspace,
    enterpriseFormCopy,
    localizeDictionaryStatus,
    canUpdateDictionaryTypes,
  },
  departmentWorkspace: {
    workspace: departmentWorkspace,
    isDepartmentWorkspace,
    canCreateDepartments,
    canViewDepartments,
    departmentModuleReady,
    canEnterDepartmentWorkspace,
    canUpdateDepartments,
  },
  sessionWorkspace: {
    workspace: sessionWorkspace,
    isSessionWorkspace,
    canEnterSessionWorkspace,
  },
  postWorkspace: {
    workspace: postWorkspace,
    isPostWorkspace,
    canCreatePosts,
    canViewPosts,
    postModuleReady,
    canEnterPostWorkspace,
    canUpdatePosts,
  },
  menuWorkspace: {
    workspace: menuWorkspace,
    isMenuWorkspace,
    canCreateMenus,
    canViewMenus,
    menuModuleReady,
    canEnterMenuWorkspace,
    canUpdateMenus,
  },
  notificationWorkspace: {
    workspace: notificationWorkspace,
    isNotificationWorkspace,
    canCreateNotifications,
    canViewNotifications,
    notificationModuleReady,
    canEnterNotificationWorkspace,
    canUpdateNotifications,
    localizeNotificationStatus,
    localizeNotificationLevel,
  },
  operationLogWorkspace: {
    workspace: operationLogWorkspace,
    isOperationLogWorkspace,
    canViewOperationLogs,
    operationLogModuleReady,
    canEnterOperationLogWorkspace,
  },
  userWorkspace: {
    workspace: userWorkspace,
    isUserWorkspace,
    canCreateUsers,
    canViewUsers,
    userModuleReady,
    canEnterUserWorkspace,
    canUpdateUsers,
    canResetUserPasswords,
  },
  settingWorkspace: {
    workspace: settingWorkspace,
    isSettingWorkspace,
    canCreateSettings,
    canViewSettings,
    settingModuleReady,
    canEnterSettingWorkspace,
    canUpdateSettings,
  },
  tenantWorkspace: {
    workspace: tenantWorkspace,
    isTenantWorkspace,
    canCreateTenants,
    canViewTenants,
    tenantModuleReady,
    canEnterTenantWorkspace,
    canUpdateTenants,
  },
  fileWorkspace: {
    workspace: fileWorkspace,
    isFileWorkspace,
    canViewFiles,
    canUploadFiles,
    canDownloadFiles,
    canDeleteFiles,
    fileModuleReady,
    canEnterFileWorkspace,
  },
  workflowWorkspace: {
    workspace: workflowWorkspace,
    isWorkflowDefinitionsWorkspace,
    canViewWorkflowDefinitions,
    workflowModuleReady,
    canEnterWorkflowWorkspace,
    localizeWorkflowStatus,
  },
  generatorPreviewWorkspace: {
    generatorPreviewLoading,
    generatorPreviewApplyLoading,
    generatorPreviewErrorMessage,
    generatorPreviewSchemaOptions,
    selectedGeneratorPreviewSchemaName,
    selectedGeneratorPreviewFrontendTarget,
    generatorPreviewQuery,
    generatorPreviewFilterSummary,
    generatorPreviewFiles,
    selectedGeneratorPreviewFilePath,
    canApplyGeneratorPreview,
    generatorPreviewDiffSummary,
    generatorPreviewSession,
    selectedGeneratorPreviewSchema,
    selectedGeneratorPreviewFile,
    generatorPreviewSqlPreview,
    resetGeneratorPreviewFilters,
    refreshGeneratorPreview,
    applyGeneratorPreview,
  },
})

const {
  shellHeaderActionProps,
  shellHeaderActionListeners,
  shellWorkspaceMainProps,
  shellWorkspaceMainListeners,
  shellWorkspaceSecondaryProps,
  shellWorkspaceSecondaryListeners,
} = useExampleShellBindings(shellBindingsOptions)
</script>

<template>
  <TConfigProvider :global-config="tdesignGlobalConfig">
    <main class="app-shell min-h-screen px-5 py-6 text-stone-100 sm:px-8 lg:px-10">
      <div class="mx-auto flex max-w-7xl flex-col gap-6">
        <ShellHeroBanner
          :t="t"
          :locale="locale"
          :locale-options="localeOptions"
          :runtime-label="platform?.manifest.runtime ?? t('app.loading.short')"
          :enterprise-status-label="
            localizePlatformStatus(vueEnterprisePresetManifest.status)
          "
          :auth-status-label="authStatusLabel"
          :auth-status-tone="authStatusTone"
          :workspace-item-count="currentWorkspaceItemCount"
          @select-locale="localeRuntime.setLocale"
        />

        <p v-if="loading" class="text-sm uppercase tracking-[0.28em] text-stone-400">
          {{ t("app.loading.workspace") }}
        </p>
        <p
          v-else-if="errorMessage"
          class="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-5 text-rose-200"
        >
          {{ errorMessage }}
        </p>

        <template v-else>
          <section class="content-panel p-3 lg:p-4">
              <ShellWorkspaceSectionIntro
                :t="t"
                :title="currentWorkspaceSectionTitle"
                :copy="currentWorkspaceSectionCopy"
              />

              <ElyShell
                :key="locale"
                :title="t('app.shell.title')"
                :subtitle="t('app.shell.subtitle')"
                :workspace-title="shellWorkspaceTitle"
                :workspace-description="shellWorkspaceDescription"
                :preset-label="t('app.shell.presetLabel')"
                :environment="envName"
                :status="
                  authModuleReady
                    ? t('app.shell.status.sessionAware')
                    : t('app.shell.status.preview')
                "
                :copy="enterpriseShellCopy"
                :navigation="enterpriseNavigation"
                :stats="enterpriseShellStats"
                :selected-menu-key="enterpriseSelectedMenuKey"
                :tabs="enterpriseShellTabs"
                :selected-tab-key="enterpriseSelectedTabKey"
                :user="enterpriseShellUser"
                @menu-select="handleShellMenuSelect"
                @tab-select="handleShellTabSelect"
              >
                <template #header-actions>
                  <ShellWorkspaceHeaderActions
                    v-bind="shellHeaderActionProps"
                    v-on="shellHeaderActionListeners"
                  />
                </template>

                <template #workspace>
                  <ShellWorkspaceMainSwitch
                    v-bind="shellWorkspaceMainProps"
                    v-on="shellWorkspaceMainListeners"
                  />
                </template>

                <template #secondary>
                  <ShellWorkspaceSecondarySwitch
                    v-bind="shellWorkspaceSecondaryProps"
                    v-on="shellWorkspaceSecondaryListeners"
                  />
                </template>
              </ElyShell>
          </section>
        </template>
      </div>
    </main>
  </TConfigProvider>
</template>
