import type { Component } from "vue"

import type { AppTranslate } from "../../../app/app-shell-helpers"
import AuthSessionWorkspaceMain from "../auth-session/AuthSessionWorkspaceMain.vue"
import CustomerWorkspaceMain from "../customer/CustomerWorkspaceMain.vue"
import DepartmentWorkspaceMain from "../department/DepartmentWorkspaceMain.vue"
import DictionaryWorkspaceMain from "../dictionary/DictionaryWorkspaceMain.vue"
import FileWorkspaceMain from "../file/FileWorkspaceMain.vue"
import GeneratorPreviewWorkspaceMain from "../generator/GeneratorPreviewWorkspaceMain.vue"
import MenuWorkspaceMain from "../menu/MenuWorkspaceMain.vue"
import NotificationWorkspaceMain from "../notification/NotificationWorkspaceMain.vue"
import OperationLogWorkspaceMain from "../operation-log/OperationLogWorkspaceMain.vue"
import PostWorkspaceMain from "../post/PostWorkspaceMain.vue"
import RoleWorkspaceMain from "../role/RoleWorkspaceMain.vue"
import SettingWorkspaceMain from "../setting/SettingWorkspaceMain.vue"
import TenantWorkspaceMain from "../tenant/TenantWorkspaceMain.vue"
import UserWorkspaceMain from "../user/UserWorkspaceMain.vue"
import WorkflowWorkspaceMain from "../workflow/WorkflowWorkspaceMain.vue"
import ShellWorkspaceStatusMain from "./ShellWorkspaceStatusMain.vue"

interface GeneratorPreviewSessionSummary {
  status?: string | null
  applyEvidence?: unknown
  hasBlockingConflicts?: boolean
}

export interface ShellWorkspaceMainSwitchProps {
  t: AppTranslate
  enterpriseSelectedTabKey: string
  currentWorkspaceKind: string
  selectedNavigationItemName: string
  currentNavigationPath: string
  authStatusLabel: string
  currentModuleStatusLabel: string
  permissionCount: number
  currentModuleCodeLabel: string
  placeholderWorkspaceCopy: string
  showPlaceholderBackButton: boolean
  workflowModuleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkflowWorkspace: boolean
  canViewWorkflowDefinitions: boolean
  workflowErrorMessage: string
  workflowLoading: boolean
  workflowQuery: string
  workflowStatusFilter: string
  workflowFilterSummary: string
  workflowDefinitionCards: ReadonlyArray<unknown>
  workflowDefinitionCount: number
  selectedWorkflowDefinitionId: string | null
  fileModuleReady: boolean
  canEnterFileWorkspace: boolean
  canViewFiles: boolean
  canUploadFiles: boolean
  fileErrorMessage: string
  fileLoading: boolean
  fileQuery: string
  fileFilterSummary: string
  fileCountLabel: string
  fileTableItems: ReadonlyArray<unknown>
  selectedFileId: string | null
  generatorPreviewLoading: boolean
  generatorPreviewApplyLoading: boolean
  generatorPreviewErrorMessage: string
  generatorPreviewSchemaOptions: ReadonlyArray<unknown>
  selectedGeneratorPreviewSchemaName: string
  selectedGeneratorPreviewFrontendTarget: string
  generatorPreviewQuery: string
  generatorPreviewFilterSummary: string
  generatorPreviewFiles: ReadonlyArray<unknown>
  selectedGeneratorPreviewFilePath: string | null
  canApplyGeneratorPreview: boolean
  generatorPreviewDiffSummary: string
  generatorPreviewSession: GeneratorPreviewSessionSummary | null
  dictionaryModuleReady: boolean
  canEnterDictionaryWorkspace: boolean
  canViewDictionaries: boolean
  dictionaryLoading: boolean
  dictionaryErrorMessage: string
  enterpriseDictionaryQueryFields: ReadonlyArray<unknown>
  enterpriseDictionaryTableColumns: ReadonlyArray<unknown>
  enterpriseDictionaryTableItems: ReadonlyArray<unknown>
  dictionaryCountLabel: string
  departmentModuleReady: boolean
  canEnterDepartmentWorkspace: boolean
  canViewDepartments: boolean
  departmentLoading: boolean
  departmentErrorMessage: string
  enterpriseDepartmentQueryFields: ReadonlyArray<unknown>
  enterpriseDepartmentTableColumns: ReadonlyArray<unknown>
  enterpriseDepartmentTableItems: ReadonlyArray<unknown>
  departmentCountLabel: string
  isSessionWorkspace: boolean
  sessionModuleReady: boolean
  canEnterSessionWorkspace: boolean
  sessionLoading: boolean
  sessionErrorMessage: string
  enterpriseSessionQueryFields: ReadonlyArray<unknown>
  enterpriseSessionTableColumns: ReadonlyArray<unknown>
  enterpriseSessionTableItems: ReadonlyArray<unknown>
  sessionCountLabel: string
  postModuleReady: boolean
  canEnterPostWorkspace: boolean
  canViewPosts: boolean
  postLoading: boolean
  postErrorMessage: string
  enterprisePostQueryFields: ReadonlyArray<unknown>
  enterprisePostTableColumns: ReadonlyArray<unknown>
  enterprisePostTableItems: ReadonlyArray<unknown>
  postCountLabel: string
  menuModuleReady: boolean
  canEnterMenuWorkspace: boolean
  canViewMenus: boolean
  menuLoading: boolean
  menuErrorMessage: string
  enterpriseMenuQueryFields: ReadonlyArray<unknown>
  enterpriseMenuTableColumns: ReadonlyArray<unknown>
  enterpriseMenuTableItems: ReadonlyArray<unknown>
  menuCountLabel: string
  notificationModuleReady: boolean
  canEnterNotificationWorkspace: boolean
  canViewNotifications: boolean
  notificationLoading: boolean
  notificationErrorMessage: string
  enterpriseNotificationQueryFields: ReadonlyArray<unknown>
  enterpriseNotificationTableColumns: ReadonlyArray<unknown>
  enterpriseNotificationTableItems: ReadonlyArray<unknown>
  notificationCountLabel: string
  operationLogModuleReady: boolean
  canEnterOperationLogWorkspace: boolean
  canViewOperationLogs: boolean
  operationLogLoading: boolean
  operationLogErrorMessage: string
  enterpriseOperationLogQueryFields: ReadonlyArray<unknown>
  enterpriseOperationLogTableColumns: ReadonlyArray<unknown>
  enterpriseOperationLogTableItems: ReadonlyArray<unknown>
  operationLogCountLabel: string
  roleModuleReady: boolean
  canEnterRoleWorkspace: boolean
  canViewRoles: boolean
  roleLoading: boolean
  roleErrorMessage: string
  enterpriseRoleQueryFields: ReadonlyArray<unknown>
  enterpriseRoleTableColumns: ReadonlyArray<unknown>
  enterpriseRoleTableItems: ReadonlyArray<unknown>
  roleCountLabel: string
  settingModuleReady: boolean
  canEnterSettingWorkspace: boolean
  canViewSettings: boolean
  settingLoading: boolean
  settingErrorMessage: string
  enterpriseSettingQueryFields: ReadonlyArray<unknown>
  enterpriseSettingTableColumns: ReadonlyArray<unknown>
  enterpriseSettingTableItems: ReadonlyArray<unknown>
  settingCountLabel: string
  tenantModuleReady: boolean
  tenantIsSuperAdmin: boolean
  canEnterTenantWorkspace: boolean
  canViewTenants: boolean
  tenantLoading: boolean
  tenantErrorMessage: string
  enterpriseTenantQueryFields: ReadonlyArray<unknown>
  enterpriseTenantTableColumns: ReadonlyArray<unknown>
  enterpriseTenantTableItems: ReadonlyArray<unknown>
  tenantCountLabel: string
  userModuleReady: boolean
  canEnterUserWorkspace: boolean
  canViewUsers: boolean
  userLoading: boolean
  userErrorMessage: string
  enterpriseUserQueryFields: ReadonlyArray<unknown>
  enterpriseUserTableColumns: ReadonlyArray<unknown>
  enterpriseUserTableItems: ReadonlyArray<unknown>
  userCountLabel: string
  customerModuleReady: boolean
  canEnterCustomerWorkspace: boolean
  canViewCustomers: boolean
  customerLoading: boolean
  customerErrorMessage: string
  enterpriseQueryFields: ReadonlyArray<unknown>
  enterpriseTableColumns: ReadonlyArray<unknown>
  enterpriseTableItems: ReadonlyArray<unknown>
  enterpriseTableActions: ReadonlyArray<unknown>
  customerCountLabel: string
  currentQuerySummary: string
  enterpriseCrudCopy: Record<string, unknown>
  customerFooterStatusLabel: string
  customerPaginationSummary: string
  customerListPageSize: string
  customerListSortValue: string
  customerPageInputValue: string
  customerPageSizeOptions: ReadonlyArray<unknown>
  customerSortOptions: ReadonlyArray<unknown>
  canGoToPreviousCustomerPage: boolean
  canGoToNextCustomerPage: boolean
  canJumpToCustomerPage: boolean
}

export type ShellWorkspaceMainSwitchEmitFn = {
  (event: "workflow-update-query", value: string): void
  (event: "select-workflow-definition", definitionId: string): void
  (event: "select-workflow-status-filter", status: string): void
  (event: "reset-workflow-filters"): void
  (event: "update-file-query", value: string): void
  (event: "reset-file-filters"): void
  (event: "select-file", fileId: string): void
  (event: "open-file-upload"): void
  (event: "update-generator-schema-name", schemaName: string): void
  (event: "update-generator-frontend-target", frontendTarget: string): void
  (event: "update-generator-query", value: string): void
  (event: "select-generator-file", filePath: string): void
  (event: "reset-generator-filters"): void
  (event: "refresh-generator-preview"): void
  (event: "apply-generator-preview"): void
  (event: "dictionary-search", payload: unknown): void
  (event: "dictionary-reset"): void
  (event: "dictionary-row-click", payload: unknown): void
  (event: "department-search", payload: unknown): void
  (event: "department-reset"): void
  (event: "department-row-click", payload: unknown): void
  (event: "session-search", payload: unknown): void
  (event: "session-reset"): void
  (event: "session-row-click", payload: unknown): void
  (event: "post-search", payload: unknown): void
  (event: "post-reset"): void
  (event: "post-row-click", payload: unknown): void
  (event: "menu-search", payload: unknown): void
  (event: "menu-reset"): void
  (event: "menu-row-click", payload: unknown): void
  (event: "notification-search", payload: unknown): void
  (event: "notification-reset"): void
  (event: "notification-row-click", payload: unknown): void
  (event: "operation-log-search", payload: unknown): void
  (event: "operation-log-reset"): void
  (event: "operation-log-row-click", payload: unknown): void
  (event: "role-search", payload: unknown): void
  (event: "role-reset"): void
  (event: "role-row-click", payload: unknown): void
  (event: "setting-search", payload: unknown): void
  (event: "setting-reset"): void
  (event: "setting-row-click", payload: unknown): void
  (event: "tenant-search", payload: unknown): void
  (event: "tenant-reset"): void
  (event: "tenant-row-click", payload: unknown): void
  (event: "user-search", payload: unknown): void
  (event: "user-reset"): void
  (event: "user-row-click", payload: unknown): void
  (event: "back-to-customer"): void
  (event: "customer-search", payload: unknown): void
  (event: "customer-reset"): void
  (event: "customer-action", payload: unknown): void
  (event: "customer-row-click", payload: unknown): void
  (event: "change-customer-page-size", value: string): void
  (event: "change-customer-sort", value: string): void
  (event: "go-first-customer-page"): void
  (event: "go-previous-customer-page"): void
  (event: "go-next-customer-page"): void
  (event: "go-last-customer-page"): void
  (event: "update-customer-page-input", value: string): void
  (event: "submit-customer-page-jump"): void
}

interface ShellWorkspaceMainDescriptor {
  component: Component
  props: Record<string, unknown>
  listeners?: Record<string, (...args: unknown[]) => void>
}

type ShellWorkspaceMainResolver = (
  props: ShellWorkspaceMainSwitchProps,
  emit: ShellWorkspaceMainSwitchEmitFn,
) => ShellWorkspaceMainDescriptor

const workspaceListListeners = (
  emit: ShellWorkspaceMainSwitchEmitFn,
  searchEvent:
    | "dictionary-search"
    | "department-search"
    | "session-search"
    | "post-search"
    | "menu-search"
    | "notification-search"
    | "operation-log-search"
    | "role-search"
    | "setting-search"
    | "tenant-search"
    | "user-search",
  resetEvent:
    | "dictionary-reset"
    | "department-reset"
    | "session-reset"
    | "post-reset"
    | "menu-reset"
    | "notification-reset"
    | "operation-log-reset"
    | "role-reset"
    | "setting-reset"
    | "tenant-reset"
    | "user-reset",
  rowClickEvent:
    | "dictionary-row-click"
    | "department-row-click"
    | "session-row-click"
    | "post-row-click"
    | "menu-row-click"
    | "notification-row-click"
    | "operation-log-row-click"
    | "role-row-click"
    | "setting-row-click"
    | "tenant-row-click"
    | "user-row-click",
) => ({
  search: (payload: unknown) => emit(searchEvent, payload),
  reset: () => emit(resetEvent),
  "row-click": (payload: unknown) => emit(rowClickEvent, payload),
})

const runtimeResolver: ShellWorkspaceMainResolver = (props) => ({
  component: ShellWorkspaceStatusMain,
  props: {
    mode: "runtime",
    title: props.selectedNavigationItemName,
    subtitle: props.currentNavigationPath,
    badge: props.authStatusLabel,
    currentPage: props.selectedNavigationItemName,
    currentPath: props.currentNavigationPath,
    moduleStatusLabel: props.currentModuleStatusLabel,
    authStatusLabel: props.authStatusLabel,
    permissionCount: props.permissionCount,
    moduleCodeLabel: props.currentModuleCodeLabel,
    backButtonLabel: props.t("app.placeholder.backToCustomer"),
    showBackButton: false,
  },
})

const placeholderResolver: ShellWorkspaceMainResolver = (props, emit) => ({
  component: ShellWorkspaceStatusMain,
  props: {
    mode: "placeholder",
    title: props.selectedNavigationItemName,
    subtitle: props.placeholderWorkspaceCopy,
    badge: props.currentModuleStatusLabel,
    currentPage: props.selectedNavigationItemName,
    currentPath: props.currentNavigationPath,
    moduleStatusLabel: props.currentModuleStatusLabel,
    authStatusLabel: props.authStatusLabel,
    permissionCount: props.permissionCount,
    moduleCodeLabel: props.currentModuleCodeLabel,
    backButtonLabel: props.t("app.placeholder.backToCustomer"),
    showBackButton: props.showPlaceholderBackButton,
  },
  listeners: {
    "back-to-customer": () => emit("back-to-customer"),
  },
})

const customerResolver: ShellWorkspaceMainResolver = (props, emit) => ({
  component: CustomerWorkspaceMain,
  props: {
    t: props.t,
    moduleReady: props.customerModuleReady,
    authModuleReady: props.authModuleReady,
    isAuthenticated: props.isAuthenticated,
    canEnterWorkspace: props.canEnterCustomerWorkspace,
    canViewCustomers: props.canViewCustomers,
    loading: props.customerLoading,
    errorMessage: props.customerErrorMessage,
    queryFields: props.enterpriseQueryFields,
    tableColumns: props.enterpriseTableColumns,
    items: props.enterpriseTableItems,
    tableActions: props.enterpriseTableActions,
    itemCountLabel: props.customerCountLabel,
    emptyTitle: props.t("app.workspace.emptyTitle"),
    emptyDescription: props.t("app.workspace.emptyDescription"),
    currentQuerySummary: props.currentQuerySummary,
    copy: props.enterpriseCrudCopy,
    footerStatusLabel: props.customerFooterStatusLabel,
    paginationSummary: props.customerPaginationSummary,
    pageSizeValue: props.customerListPageSize,
    sortValue: props.customerListSortValue,
    pageInputValue: props.customerPageInputValue,
    pageSizeOptions: props.customerPageSizeOptions,
    sortOptions: props.customerSortOptions,
    canGoToPreviousPage: props.canGoToPreviousCustomerPage,
    canGoToNextPage: props.canGoToNextCustomerPage,
    canJumpToPage: props.canJumpToCustomerPage,
  },
  listeners: {
    search: (payload: unknown) => emit("customer-search", payload),
    reset: () => emit("customer-reset"),
    action: (payload: unknown) => emit("customer-action", payload),
    "row-click": (payload: unknown) => emit("customer-row-click", payload),
    "change-page-size": (value: unknown) =>
      emit("change-customer-page-size", value as string),
    "change-sort": (value: unknown) =>
      emit("change-customer-sort", value as string),
    "go-first-page": () => emit("go-first-customer-page"),
    "go-previous-page": () => emit("go-previous-customer-page"),
    "go-next-page": () => emit("go-next-customer-page"),
    "go-last-page": () => emit("go-last-customer-page"),
    "update-page-input": (value: unknown) =>
      emit("update-customer-page-input", value as string),
    "submit-page-jump": () => emit("submit-customer-page-jump"),
  },
})

const workspaceResolvers: Record<string, ShellWorkspaceMainResolver> = {
  "workflow-definitions": (props, emit) => ({
    component: WorkflowWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.workflowModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterWorkflowWorkspace,
      canViewDefinitions: props.canViewWorkflowDefinitions,
      errorMessage: props.workflowErrorMessage,
      loading: props.workflowLoading,
      query: props.workflowQuery,
      statusFilter: props.workflowStatusFilter,
      filterSummary: props.workflowFilterSummary,
      definitionCards: props.workflowDefinitionCards,
      definitionCount: props.workflowDefinitionCount,
      selectedDefinitionId: props.selectedWorkflowDefinitionId,
    },
    listeners: {
      "update:query": (value: unknown) =>
        emit("workflow-update-query", value as string),
      "select-definition": (definitionId: unknown) =>
        emit("select-workflow-definition", definitionId as string),
      "select-status-filter": (status: unknown) =>
        emit("select-workflow-status-filter", status as string),
      "reset-filters": () => emit("reset-workflow-filters"),
    },
  }),
  file: (props, emit) => ({
    component: FileWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.fileModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterFileWorkspace,
      canViewFiles: props.canViewFiles,
      canUploadFiles: props.canUploadFiles,
      errorMessage: props.fileErrorMessage,
      loading: props.fileLoading,
      query: props.fileQuery,
      filterSummary: props.fileFilterSummary,
      countLabel: props.fileCountLabel,
      tableItems: props.fileTableItems,
      selectedFileId: props.selectedFileId,
    },
    listeners: {
      "update:query": (value: unknown) =>
        emit("update-file-query", value as string),
      "reset-filters": () => emit("reset-file-filters"),
      "select-file": (fileId: unknown) => emit("select-file", fileId as string),
      "open-upload": () => emit("open-file-upload"),
    },
  }),
  "generator-preview": (props, emit) => ({
    component: GeneratorPreviewWorkspaceMain,
    props: {
      t: props.t,
      loading: props.generatorPreviewLoading,
      actionLoading: props.generatorPreviewApplyLoading,
      errorMessage: props.generatorPreviewErrorMessage,
      schemaOptions: props.generatorPreviewSchemaOptions,
      selectedSchemaName: props.selectedGeneratorPreviewSchemaName,
      selectedFrontendTarget: props.selectedGeneratorPreviewFrontendTarget,
      query: props.generatorPreviewQuery,
      filterSummary: props.generatorPreviewFilterSummary,
      files: props.generatorPreviewFiles,
      selectedFilePath: props.selectedGeneratorPreviewFilePath,
      canApply: props.canApplyGeneratorPreview,
      diffSummary: props.generatorPreviewDiffSummary,
      sessionStatus: props.generatorPreviewSession?.status ?? null,
      applyEvidence: props.generatorPreviewSession?.applyEvidence ?? null,
      hasBlockingConflicts:
        props.generatorPreviewSession?.hasBlockingConflicts ?? false,
    },
    listeners: {
      "update:selected-schema-name": (schemaName: unknown) =>
        emit("update-generator-schema-name", schemaName as string),
      "update:selected-frontend-target": (frontendTarget: unknown) =>
        emit("update-generator-frontend-target", frontendTarget as string),
      "update:query": (value: unknown) =>
        emit("update-generator-query", value as string),
      "select-file": (filePath: unknown) =>
        emit("select-generator-file", filePath as string),
      "reset-filters": () => emit("reset-generator-filters"),
      "refresh-preview": () => emit("refresh-generator-preview"),
      "apply-preview": () => emit("apply-generator-preview"),
    },
  }),
  dictionary: (props, emit) => ({
    component: DictionaryWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.dictionaryModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterDictionaryWorkspace,
      canViewDictionaries: props.canViewDictionaries,
      loading: props.dictionaryLoading,
      errorMessage: props.dictionaryErrorMessage,
      queryFields: props.enterpriseDictionaryQueryFields,
      tableColumns: props.enterpriseDictionaryTableColumns,
      items: props.enterpriseDictionaryTableItems,
      itemCountLabel: props.dictionaryCountLabel,
      emptyTitle: props.t("app.dictionary.emptyTitle"),
      emptyDescription: props.t("app.dictionary.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
    },
    listeners: workspaceListListeners(
      emit,
      "dictionary-search",
      "dictionary-reset",
      "dictionary-row-click",
    ),
  }),
  department: (props, emit) => ({
    component: DepartmentWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.departmentModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterDepartmentWorkspace,
      canViewDepartments: props.canViewDepartments,
      loading: props.departmentLoading,
      errorMessage: props.departmentErrorMessage,
      queryFields: props.enterpriseDepartmentQueryFields,
      tableColumns: props.enterpriseDepartmentTableColumns,
      items: props.enterpriseDepartmentTableItems,
      itemCountLabel: props.departmentCountLabel,
      emptyTitle: props.t("app.department.emptyTitle"),
      emptyDescription: props.t("app.department.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
    },
    listeners: workspaceListListeners(
      emit,
      "department-search",
      "department-reset",
      "department-row-click",
    ),
  }),
  session: (props, emit) => ({
    component: AuthSessionWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.sessionModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterSessionWorkspace,
      loading: props.sessionLoading,
      errorMessage: props.sessionErrorMessage,
      queryFields: props.enterpriseSessionQueryFields,
      tableColumns: props.enterpriseSessionTableColumns,
      items: props.enterpriseSessionTableItems,
      itemCountLabel: props.sessionCountLabel,
      emptyTitle: props.t("app.onlineSession.emptyTitle"),
      emptyDescription: props.t("app.onlineSession.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
    },
    listeners: workspaceListListeners(
      emit,
      "session-search",
      "session-reset",
      "session-row-click",
    ),
  }),
  post: (props, emit) => ({
    component: PostWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.postModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterPostWorkspace,
      canViewPosts: props.canViewPosts,
      loading: props.postLoading,
      errorMessage: props.postErrorMessage,
      queryFields: props.enterprisePostQueryFields,
      tableColumns: props.enterprisePostTableColumns,
      items: props.enterprisePostTableItems,
      itemCountLabel: props.postCountLabel,
      emptyTitle: props.t("app.post.emptyTitle"),
      emptyDescription: props.t("app.post.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
    },
    listeners: workspaceListListeners(
      emit,
      "post-search",
      "post-reset",
      "post-row-click",
    ),
  }),
  menu: (props, emit) => ({
    component: MenuWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.menuModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterMenuWorkspace,
      canViewMenus: props.canViewMenus,
      loading: props.menuLoading,
      errorMessage: props.menuErrorMessage,
      queryFields: props.enterpriseMenuQueryFields,
      tableColumns: props.enterpriseMenuTableColumns,
      items: props.enterpriseMenuTableItems,
      itemCountLabel: props.menuCountLabel,
      emptyTitle: props.t("app.menu.emptyTitle"),
      emptyDescription: props.t("app.menu.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
    },
    listeners: workspaceListListeners(
      emit,
      "menu-search",
      "menu-reset",
      "menu-row-click",
    ),
  }),
  notification: (props, emit) => ({
    component: NotificationWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.notificationModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterNotificationWorkspace,
      canViewNotifications: props.canViewNotifications,
      loading: props.notificationLoading,
      errorMessage: props.notificationErrorMessage,
      queryFields: props.enterpriseNotificationQueryFields,
      tableColumns: props.enterpriseNotificationTableColumns,
      items: props.enterpriseNotificationTableItems,
      itemCountLabel: props.notificationCountLabel,
      emptyTitle: props.t("app.notification.emptyTitle"),
      emptyDescription: props.t("app.notification.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
    },
    listeners: workspaceListListeners(
      emit,
      "notification-search",
      "notification-reset",
      "notification-row-click",
    ),
  }),
  "operation-log": (props, emit) => ({
    component: OperationLogWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.operationLogModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterOperationLogWorkspace,
      canViewOperationLogs: props.canViewOperationLogs,
      loading: props.operationLogLoading,
      errorMessage: props.operationLogErrorMessage,
      queryFields: props.enterpriseOperationLogQueryFields,
      tableColumns: props.enterpriseOperationLogTableColumns,
      items: props.enterpriseOperationLogTableItems,
      itemCountLabel: props.operationLogCountLabel,
      emptyTitle: props.t("app.operationLog.emptyTitle"),
      emptyDescription: props.t("app.operationLog.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
    },
    listeners: workspaceListListeners(
      emit,
      "operation-log-search",
      "operation-log-reset",
      "operation-log-row-click",
    ),
  }),
  role: (props, emit) => ({
    component: RoleWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.roleModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterRoleWorkspace,
      canViewRoles: props.canViewRoles,
      loading: props.roleLoading,
      errorMessage: props.roleErrorMessage,
      queryFields: props.enterpriseRoleQueryFields,
      tableColumns: props.enterpriseRoleTableColumns,
      items: props.enterpriseRoleTableItems,
      itemCountLabel: props.roleCountLabel,
      emptyTitle: props.t("app.role.emptyTitle"),
      emptyDescription: props.t("app.role.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
    },
    listeners: workspaceListListeners(
      emit,
      "role-search",
      "role-reset",
      "role-row-click",
    ),
  }),
  setting: (props, emit) => ({
    component: SettingWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.settingModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterSettingWorkspace,
      canViewSettings: props.canViewSettings,
      loading: props.settingLoading,
      errorMessage: props.settingErrorMessage,
      queryFields: props.enterpriseSettingQueryFields,
      tableColumns: props.enterpriseSettingTableColumns,
      items: props.enterpriseSettingTableItems,
      itemCountLabel: props.settingCountLabel,
      emptyTitle: props.t("app.setting.emptyTitle"),
      emptyDescription: props.t("app.setting.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
    },
    listeners: workspaceListListeners(
      emit,
      "setting-search",
      "setting-reset",
      "setting-row-click",
    ),
  }),
  tenant: (props, emit) => ({
    component: TenantWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.tenantModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      isSuperAdmin: props.tenantIsSuperAdmin,
      canEnterWorkspace: props.canEnterTenantWorkspace,
      canViewTenants: props.canViewTenants,
      loading: props.tenantLoading,
      errorMessage: props.tenantErrorMessage,
      queryFields: props.enterpriseTenantQueryFields,
      tableColumns: props.enterpriseTenantTableColumns,
      items: props.enterpriseTenantTableItems,
      itemCountLabel: props.tenantCountLabel,
      emptyTitle: props.t("app.tenant.emptyTitle"),
      emptyDescription: props.t("app.tenant.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
    },
    listeners: workspaceListListeners(
      emit,
      "tenant-search",
      "tenant-reset",
      "tenant-row-click",
    ),
  }),
  user: (props, emit) => ({
    component: UserWorkspaceMain,
    props: {
      t: props.t,
      moduleReady: props.userModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterUserWorkspace,
      canViewUsers: props.canViewUsers,
      loading: props.userLoading,
      errorMessage: props.userErrorMessage,
      queryFields: props.enterpriseUserQueryFields,
      tableColumns: props.enterpriseUserTableColumns,
      items: props.enterpriseUserTableItems,
      itemCountLabel: props.userCountLabel,
      emptyTitle: props.t("app.user.emptyTitle"),
      emptyDescription: props.t("app.user.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
    },
    listeners: workspaceListListeners(
      emit,
      "user-search",
      "user-reset",
      "user-row-click",
    ),
  }),
  placeholder: placeholderResolver,
}

export const resolveShellWorkspaceMainDescriptor = (
  props: ShellWorkspaceMainSwitchProps,
  emit: ShellWorkspaceMainSwitchEmitFn,
): ShellWorkspaceMainDescriptor => {
  if (props.enterpriseSelectedTabKey === "runtime") {
    return runtimeResolver(props, emit)
  }

  return (workspaceResolvers[props.currentWorkspaceKind] ?? customerResolver)(
    props,
    emit,
  )
}
