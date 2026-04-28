<script setup lang="ts">
import {
  applyCrudDictionaryOptions,
  buildCrudDictionaryOptionCatalog,
  buildVueCustomCrudPage,
  createVueLocaleRuntime,
  customerWorkspacePageDefinition,
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

import { departmentModuleSchema } from "../../../packages/schema/src/department"
import { dictionaryModuleSchema } from "../../../packages/schema/src/dictionary"
import { menuModuleSchema } from "../../../packages/schema/src/menu"
import { notificationModuleSchema } from "../../../packages/schema/src/notification"
import { operationLogModuleSchema } from "../../../packages/schema/src/operation-log"
import { postModuleSchema } from "../../../packages/schema/src/post"
import { roleModuleSchema } from "../../../packages/schema/src/role"
import { settingModuleSchema } from "../../../packages/schema/src/setting"
import { tenantModuleSchema } from "../../../packages/schema/src/tenant"
import { userModuleSchema } from "../../../packages/schema/src/user"
import ShellWorkspaceHeaderActions from "./components/workspaces/shell/ShellWorkspaceHeaderActions.vue"
import ShellHeroBanner from "./components/workspaces/shell/ShellHeroBanner.vue"
import ShellWorkspaceMainSwitch from "./components/workspaces/shell/ShellWorkspaceMainSwitch.vue"
import ShellWorkspaceSectionIntro from "./components/workspaces/shell/ShellWorkspaceSectionIntro.vue"
import ShellWorkspaceSecondarySwitch from "./components/workspaces/shell/ShellWorkspaceSecondarySwitch.vue"
import { createAppShellLocalization } from "./app/app-shell-helpers"
import { useExampleQuerySummary } from "./app/use-example-query-summary"
import { useExampleNavigation } from "./app/use-example-navigation"
import { useExampleShellBindings } from "./app/use-example-shell-bindings"
import { useExampleSessionOrchestration } from "./app/use-example-session-orchestration"
import { useExampleShellMeta } from "./app/use-example-shell-meta"
import { useExampleWorkspaceGates } from "./app/use-example-workspace-gates"
import { useExampleWorkspaceSync } from "./app/use-example-workspace-sync"
import { exampleLocaleMessages } from "./i18n"
import { resolveWorkspaceMenuKey } from "./lib/navigation-workspace"
import {
  type AuthIdentityResponse,
  type PlatformResponse,
} from "./lib/platform-api"
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

const customerPageDefinition = customerWorkspacePageDefinition
const dictionaryPageDefinition = buildVueCustomCrudPage(dictionaryModuleSchema)
const departmentPageDefinition = buildVueCustomCrudPage(departmentModuleSchema)
const menuPageDefinition = buildVueCustomCrudPage(menuModuleSchema)
const notificationPageDefinition = buildVueCustomCrudPage(
  notificationModuleSchema,
)
const operationLogPageDefinition = buildVueCustomCrudPage(
  operationLogModuleSchema,
)
const postPageDefinition = buildVueCustomCrudPage(postModuleSchema)
const rolePageDefinition = buildVueCustomCrudPage(roleModuleSchema)
const settingPageDefinition = buildVueCustomCrudPage(settingModuleSchema)
const tenantPageDefinition = buildVueCustomCrudPage(tenantModuleSchema)
const userPageDefinition = buildVueCustomCrudPage(userModuleSchema)

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
} = useCustomerWorkspace({
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
} = useFileWorkspace({
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
} = useNotificationWorkspace({
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
} = useOperationLogWorkspace({
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
} = useDictionaryWorkspace({
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
} = useDepartmentWorkspace({
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
} = usePostWorkspace({
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
} = useMenuWorkspace({
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
} = useRoleWorkspace({
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
} = useTenantWorkspace({
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
} = useUserWorkspace({
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
} = useWorkflowWorkspace({
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
} = useSettingWorkspace({
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

const {
  isRecoverableAuthError,
  submitLogin,
  submitLogout,
} = useExampleSessionOrchestration({
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

const {
  shellHeaderActionProps,
  shellHeaderActionListeners,
  shellWorkspaceMainProps,
  shellWorkspaceMainListeners,
  shellWorkspaceSecondaryProps,
  shellWorkspaceSecondaryListeners,
} = useExampleShellBindings({
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
  isRoleWorkspace,
  roleLoading,
  canCreateRoles,
  canViewRoles,
  isCustomerWorkspace,
  customerLoading,
  canCreateCustomers,
  canViewCustomers,
  canUpdateCustomers,
  canDeleteCustomers,
  isDictionaryWorkspace,
  dictionaryLoading,
    canCreateDictionaryTypes,
    canViewDictionaries,
    isDepartmentWorkspace,
    departmentLoading,
    canCreateDepartments,
    canViewDepartments,
    isPostWorkspace,
    postLoading,
    canCreatePosts,
    canViewPosts,
    isMenuWorkspace,
  menuLoading,
  canCreateMenus,
  canViewMenus,
  isNotificationWorkspace,
  notificationLoading,
  canCreateNotifications,
  canViewNotifications,
  isOperationLogWorkspace,
  operationLogLoading,
  canViewOperationLogs,
  isUserWorkspace,
  userLoading,
  canCreateUsers,
  canViewUsers,
  isSettingWorkspace,
  settingLoading,
  canCreateSettings,
  canViewSettings,
  isTenantWorkspace,
  tenantLoading,
  canCreateTenants,
  canViewTenants,
  isFileWorkspace,
  fileLoading,
  canViewFiles,
  canUploadFiles,
  canDownloadFiles,
  canDeleteFiles,
  isWorkflowDefinitionsWorkspace,
  workflowLoading,
  canViewWorkflowDefinitions,
  workflowModuleReady,
  canEnterWorkflowWorkspace,
  workflowErrorMessage,
  workflowQuery,
  workflowStatusFilter,
  workflowFilterSummary,
  workflowDefinitionCards,
  workflowDefinitions,
  selectedWorkflowDefinitionId,
  fileModuleReady,
  canEnterFileWorkspace,
  fileErrorMessage,
  fileQuery,
  fileFilterSummary,
  fileCountLabel,
  fileTableItems,
  selectedFileId,
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
  dictionaryModuleReady,
  canEnterDictionaryWorkspace,
  dictionaryErrorMessage,
  enterpriseDictionaryQueryFields,
  enterpriseDictionaryTableColumns,
  enterpriseDictionaryTableItems,
  dictionaryCountLabel,
  departmentModuleReady,
  canEnterDepartmentWorkspace,
  departmentErrorMessage,
  enterpriseDepartmentQueryFields,
  enterpriseDepartmentTableColumns,
  enterpriseDepartmentTableItems,
  departmentCountLabel,
  menuModuleReady,
  canEnterMenuWorkspace,
  menuErrorMessage,
  enterpriseMenuQueryFields,
  enterpriseMenuTableColumns,
  enterpriseMenuTableItems,
  menuCountLabel,
  notificationModuleReady,
  canEnterNotificationWorkspace,
  notificationErrorMessage,
  enterpriseNotificationQueryFields,
  enterpriseNotificationTableColumns,
  enterpriseNotificationTableItems,
  notificationCountLabel,
  operationLogModuleReady,
  canEnterOperationLogWorkspace,
  operationLogErrorMessage,
  enterpriseOperationLogQueryFields,
  enterpriseOperationLogTableColumns,
  enterpriseOperationLogTableItems,
  operationLogCountLabel,
  roleModuleReady,
  canEnterRoleWorkspace,
  roleErrorMessage,
  enterpriseRoleQueryFields,
  enterpriseRoleTableColumns,
  enterpriseRoleTableItems,
  roleCountLabel,
  settingModuleReady,
  canEnterSettingWorkspace,
  settingErrorMessage,
  enterpriseSettingQueryFields,
  enterpriseSettingTableColumns,
  enterpriseSettingTableItems,
  settingCountLabel,
  tenantModuleReady,
  canEnterTenantWorkspace,
  tenantErrorMessage,
  enterpriseTenantQueryFields,
  enterpriseTenantTableColumns,
  enterpriseTenantTableItems,
  tenantCountLabel,
  userModuleReady,
  canEnterUserWorkspace,
  userErrorMessage,
  enterpriseUserQueryFields,
  enterpriseUserTableColumns,
  enterpriseUserTableItems,
  userCountLabel,
  customerModuleReady,
  canEnterCustomerWorkspace,
  customerErrorMessage,
  enterpriseQueryFields,
  enterpriseTableColumns,
  enterpriseTableItems,
  enterpriseTableActions,
  customerCountLabel,
  currentQuerySummary,
  enterpriseCrudCopy,
  localizePlatformStatus,
  customerPaginationSummary,
  customerListPageSize,
  customerListSortValue,
  customerPageInputValue,
  customerPageSizeOptions,
  customerSortOptions,
  canGoToPreviousCustomerPage,
  canGoToNextCustomerPage,
  canJumpToCustomerPage,
  dictionaryDetailLoading,
  dictionaryDetailErrorMessage,
  dictionaryPanelMode,
  dictionaryPanelTitle,
  dictionaryPanelDescription,
  selectedDictionaryType,
  selectedDictionaryTypeItems,
  enterpriseDictionaryFormFields,
  enterpriseDictionaryFormValues,
  enterpriseFormCopy,
  localizeDictionaryStatus,
  canUpdateDictionaryTypes,
  canUpdateDepartments,
  departmentDetailLoading,
  departmentDetailErrorMessage,
  departmentPanelMode,
  departmentPanelTitle,
  departmentPanelDescription,
  selectedDepartment,
  selectedDepartmentDetail,
  enterpriseDepartmentFormFields,
  enterpriseDepartmentFormValues,
  departmentParentLookup,
  canUpdateMenus,
  menuDetailLoading,
  menuDetailErrorMessage,
  menuPanelMode,
  menuPanelTitle,
  menuPanelDescription,
  selectedMenu,
  selectedMenuDetail,
  enterpriseMenuFormFields,
  enterpriseMenuFormValues,
  menuParentLookup,
  canUpdateNotifications,
  notificationDetailLoading,
  notificationDetailErrorMessage,
  notificationPanelMode,
  notificationPanelTitle,
  notificationPanelDescription,
  selectedNotification,
  enterpriseNotificationFormFields,
  enterpriseNotificationFormValues,
  localizeNotificationStatus,
  localizeNotificationLevel,
  operationLogDetailLoading,
  operationLogDetailErrorMessage,
  operationLogPanelTitle,
  operationLogPanelDescription,
  selectedOperationLog,
  enterpriseOperationLogDetailFields,
  enterpriseOperationLogDetailValues,
  operationLogDetailsText,
  canUpdateRoles,
  roleDetailLoading,
  roleDetailErrorMessage,
  rolePanelMode,
  rolePanelTitle,
  rolePanelDescription,
  selectedRole,
  selectedRoleDetail,
  enterpriseRoleFormFields,
  enterpriseRoleFormValues,
  canUpdateSettings,
  settingDetailLoading,
  settingDetailErrorMessage,
  settingPanelMode,
  settingPanelTitle,
  settingPanelDescription,
  selectedSetting,
  enterpriseSettingFormFields,
  enterpriseSettingFormValues,
  canUpdateTenants,
  tenantDetailLoading,
  tenantDetailErrorMessage,
  tenantPanelMode,
  tenantPanelTitle,
  tenantPanelDescription,
  selectedTenant,
  enterpriseTenantFormFields,
  enterpriseTenantFormValues,
  canUpdateUsers,
  canResetUserPasswords,
  userPanelMode,
  userPanelTitle,
  userPanelDescription,
  selectedUser,
  enterpriseUserFormFields,
  enterpriseUserFormValues,
  userPasswordInput,
  workflowDetailLoading,
  workflowDetailErrorMessage,
  selectedWorkflowDefinition,
  workflowVersionHistoryCards,
  workflowDefinitionDetailCards,
  localizeWorkflowStatus,
  fileDetailLoading,
  fileActionLoading,
  fileDetailErrorMessage,
  filePanelMode,
  selectedFile,
  pendingUploadFile,
  selectedGeneratorPreviewSchema,
  selectedGeneratorPreviewFile,
  generatorPreviewSqlPreview,
  enterpriseFormMode,
  enterprisePanelTitle,
  enterprisePanelDescription,
  deleteConfirmId,
  selectedCustomer,
  enterpriseFormFields,
  enterpriseFormValues,
  fileItems,
  handleWorkflowDefinitionSelect,
  setWorkflowStatusFilter,
  resetWorkflowFilters,
  updateFileQuery,
  resetFileQuery,
  selectFile,
  openFileUploadPanel,
  resetGeneratorPreviewFilters,
  refreshGeneratorPreview,
  applyGeneratorPreview,
  handleDictionarySearch,
  handleDictionaryReset,
  handleDictionaryRowClick,
  handleDepartmentSearch,
  handleDepartmentReset,
  handleDepartmentRowClick,
  handleMenuSearch,
  handleMenuReset,
  handleMenuRowClick,
  handleNotificationSearch,
  handleNotificationReset,
  handleNotificationRowClick,
  handleOperationLogSearch,
  handleOperationLogReset,
  handleOperationLogRowClick,
  handleRoleSearch,
  handleRoleReset,
  handleRoleRowClick,
  handleSettingSearch,
  handleSettingReset,
  handleSettingRowClick,
  handleTenantSearch,
  handleTenantReset,
  handleTenantRowClick,
  handleUserSearch,
  handleUserReset,
  handleUserRowClick,
  openCustomerWorkspace,
  handleEnterpriseSearch,
  handleEnterpriseReset,
  handleEnterpriseAction,
  handleEnterpriseRowClick,
  handleCustomerPageSizeChange,
  handleCustomerSortChange,
  goToFirstCustomerPage,
  goToPreviousCustomerPage,
  goToNextCustomerPage,
  goToLastCustomerPage,
  updateCustomerPageInput,
  submitCustomerPageJump,
  openRoleCreatePanel,
  reloadRoles,
  openCreatePanel,
  reloadCustomers,
  openDictionaryCreatePanel,
  reloadDictionaries,
  openDepartmentCreatePanel,
  reloadDepartments,
  openMenuCreatePanel,
  reloadMenus,
  openNotificationCreatePanel,
  reloadNotifications,
  reloadOperationLogs,
  openUserCreatePanel,
  reloadUsers,
  openSettingCreatePanel,
  reloadSettings,
  openTenantCreatePanel,
  reloadTenants,
  reloadFiles,
  reloadWorkflowDefinitions,
  openCurrentWorkspaceTab,
  submitLogout,
  startDictionaryEdit,
  submitDictionaryForm,
  cancelDictionaryPanel,
  startDepartmentEdit,
  submitDepartmentForm,
  cancelDepartmentPanel,
  startMenuEdit,
  submitMenuForm,
  cancelMenuPanel,
  markSelectedNotificationAsRead,
  submitNotificationForm,
  cancelNotificationPanel,
  startRoleEdit,
  submitRoleForm,
  cancelRolePanel,
  startSettingEdit,
  submitSettingForm,
  cancelSettingPanel,
  startTenantEdit,
  toggleSelectedTenantStatus,
  submitTenantForm,
  cancelTenantPanel,
  startUserEdit,
  startUserPasswordReset,
  submitUserForm,
  cancelUserPanel,
  submitUserPasswordReset,
  setPendingUploadFile,
  submitFileUpload,
  downloadSelectedFile,
  openFileDeletePanel,
  confirmFileDelete,
  cancelFilePanel,
  confirmDelete,
  cancelDelete,
  startEdit,
  requestDelete,
  handleEnterpriseFormSubmit,
  handleEnterpriseFormCancel,
  submitLogin,
  vueEnterprisePresetStatus: vueEnterprisePresetManifest.status,
})
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
