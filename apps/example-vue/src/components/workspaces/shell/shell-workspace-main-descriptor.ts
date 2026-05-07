import type { Component } from "vue"

import type { AppTranslate } from "../../../app/app-shell-helpers"
import { generatedStandardCrudWorkspaceKinds } from "../../../app/workspace-registry/generated"
import type { FileWorkspaceQuery } from "../../../lib/file-workspace"
import type { WorkflowDefinitionRecord } from "../../../lib/platform-api"
import { generatedStandardCrudMainComponents } from "../../../modules/generated"
import AuthSessionWorkspaceMain from "../auth-session/AuthSessionWorkspaceMain.vue"
import CustomerWorkspaceMain from "../customer/CustomerWorkspaceMain.vue"
import FileWorkspaceMain from "../file/FileWorkspaceMain.vue"
import GeneratorPreviewWorkspaceMain from "../generator/GeneratorPreviewWorkspaceMain.vue"
import type { GeneratorPreviewDiffSummary } from "../generator/types"
import OperationLogWorkspaceMain from "../operation-log/OperationLogWorkspaceMain.vue"
import WorkflowWorkspaceMain from "../workflow/WorkflowWorkspaceMain.vue"
import ShellWorkspaceStatusMain from "./ShellWorkspaceStatusMain.vue"

interface GeneratorPreviewSessionSummary {
  status?: string | null
  applyEvidence?: unknown
  reviewEvidence?: unknown
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
  workflowDefinitionCards: ReadonlyArray<unknown>
  workflowDefinitionCount: number
  workflowPaginationSummary: string
  workflowCanGoToPreviousPage: boolean
  workflowCanGoToNextPage: boolean
  workflowDetailDialogOpen: boolean
  selectedWorkflowDefinitionId: string | null
  workflowDetailLoading: boolean
  workflowDetailErrorMessage: string
  selectedWorkflowDefinition: Record<string, unknown> | null
  localizeWorkflowStatus: (status: string) => string
  fileModuleReady: boolean
  canEnterFileWorkspace: boolean
  canViewFiles: boolean
  canUploadFiles: boolean
  fileErrorMessage: string
  fileLoading: boolean
  fileQuery: FileWorkspaceQuery
  fileFilterSummary: string
  fileCountLabel: string
  fileTableItems: ReadonlyArray<unknown>
  selectedFileId: string | null
  generatorPreviewLoading: boolean
  generatorPreviewReviewLoading: boolean
  generatorPreviewApplyLoading: boolean
  generatorPreviewErrorMessage: string
  generatorPreviewInputModeOptions: ReadonlyArray<unknown>
  generatorPreviewSchemaOptions: ReadonlyArray<unknown>
  generatorPreviewConflictStrategyOptions: ReadonlyArray<unknown>
  generatorPreviewRecentSessionOptions: ReadonlyArray<unknown>
  selectedGeneratorPreviewInputMode: string
  selectedGeneratorPreviewConflictStrategy: string
  selectedGeneratorPreviewRecentSessionId: string
  selectedGeneratorPreviewSchemaName: string
  selectedGeneratorPreviewFrontendTarget: string
  generatorPreviewManualSchemaDraft: string
  generatorPreviewManualSchemaDraftError: string | null
  generatorPreviewQuery: string
  generatorPreviewFiles: ReadonlyArray<unknown>
  selectedGeneratorPreviewFilePath: string | null
  canApproveGeneratorPreview: boolean
  canRejectGeneratorPreview: boolean
  canApplyGeneratorPreview: boolean
  canConfirmGeneratorPreview: boolean
  generatorPreviewDiffSummary: GeneratorPreviewDiffSummary | null
  generatorPreviewSession: GeneratorPreviewSessionSummary | null
  dictionaryModuleReady: boolean
  canEnterDictionaryWorkspace: boolean
  canViewDictionaries: boolean
  dictionaryWorkspaceState: Record<string, unknown>
  enterpriseDictionaryQueryFields: ReadonlyArray<unknown>
  enterpriseDictionaryTableColumns: ReadonlyArray<unknown>
  dictionaryCountLabel: string
  departmentModuleReady: boolean
  canEnterDepartmentWorkspace: boolean
  canViewDepartments: boolean
  departmentWorkspaceState: Record<string, unknown>
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
  postWorkspaceState: Record<string, unknown>
  postLoading: boolean
  postErrorMessage: string
  enterprisePostQueryFields: ReadonlyArray<unknown>
  enterprisePostTableColumns: ReadonlyArray<unknown>
  postCountLabel: string
  menuModuleReady: boolean
  canEnterMenuWorkspace: boolean
  canViewMenus: boolean
  menuWorkspaceState: Record<string, unknown>
  menuLoading: boolean
  menuErrorMessage: string
  enterpriseMenuQueryFields: ReadonlyArray<unknown>
  enterpriseMenuTableColumns: ReadonlyArray<unknown>
  menuCountLabel: string
  notificationModuleReady: boolean
  canEnterNotificationWorkspace: boolean
  canViewNotifications: boolean
  notificationWorkspaceState: Record<string, unknown>
  enterpriseNotificationQueryFields: ReadonlyArray<unknown>
  enterpriseNotificationTableColumns: ReadonlyArray<unknown>
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
  roleWorkspaceState: Record<string, unknown>
  enterpriseRoleQueryFields: ReadonlyArray<unknown>
  enterpriseRoleTableColumns: ReadonlyArray<unknown>
  roleCountLabel: string
  settingModuleReady: boolean
  canEnterSettingWorkspace: boolean
  canViewSettings: boolean
  settingWorkspaceState: Record<string, unknown>
  enterpriseSettingQueryFields: ReadonlyArray<unknown>
  enterpriseSettingTableColumns: ReadonlyArray<unknown>
  settingCountLabel: string
  tenantModuleReady: boolean
  tenantIsSuperAdmin: boolean
  canEnterTenantWorkspace: boolean
  canViewTenants: boolean
  tenantWorkspaceState: Record<string, unknown>
  enterpriseTenantQueryFields: ReadonlyArray<unknown>
  enterpriseTenantTableColumns: ReadonlyArray<unknown>
  tenantCountLabel: string
  userModuleReady: boolean
  canEnterUserWorkspace: boolean
  canViewUsers: boolean
  userWorkspaceState: Record<string, unknown>
  enterpriseUserQueryFields: ReadonlyArray<unknown>
  enterpriseUserTableColumns: ReadonlyArray<unknown>
  userCountLabel: string
  customerModuleReady: boolean
  canEnterCustomerWorkspace: boolean
  canViewCustomers: boolean
  customerLoading: boolean
  customerErrorMessage: string
  customerWorkspaceState: Record<string, unknown>
  enterpriseQueryFields: ReadonlyArray<unknown>
  enterpriseTableColumns: ReadonlyArray<unknown>
  enterpriseTableActions: ReadonlyArray<unknown>
  customerCountLabel: string
  currentQuerySummary: string
  enterpriseCrudCopy: Record<string, unknown>
  customerFooterStatusLabel: string
  customerPaginationSummary: string
  customerListPageSize: number
  customerListSortValue: string
  customerPageInputValue: string
  customerPageSizeOptions: ReadonlyArray<unknown>
  customerSortOptions: ReadonlyArray<unknown>
  canGoToPreviousCustomerPage: boolean
  canGoToNextCustomerPage: boolean
  canJumpToCustomerPage: boolean
}

type ShellWorkspaceMainListPayloadEvent =
  | "dictionary-search"
  | "dictionary-row-click"
  | "department-search"
  | "department-row-click"
  | "session-search"
  | "session-row-click"
  | "post-search"
  | "post-row-click"
  | "menu-search"
  | "menu-row-click"
  | "notification-search"
  | "notification-row-click"
  | "operation-log-search"
  | "operation-log-row-click"
  | "role-search"
  | "role-row-click"
  | "setting-search"
  | "setting-row-click"
  | "tenant-search"
  | "tenant-row-click"
  | "user-search"
  | "user-row-click"

type ShellWorkspaceMainListResetEvent =
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
  | "user-reset"

export type ShellWorkspaceMainSwitchEmitFn = {
  (event: ShellWorkspaceMainListPayloadEvent, payload: unknown): void
  (event: ShellWorkspaceMainListResetEvent): void
  (event: "workflow-update-query", value: string): void
  (event: "select-workflow-definition", definitionId: string): void
  (event: "close-workflow-definition-detail"): void
  (event: "reset-workflow-filters"): void
  (event: "go-previous-workflow-page"): void
  (event: "go-next-workflow-page"): void
  (event: "update-file-query", value: FileWorkspaceQuery): void
  (event: "reset-file-filters"): void
  (event: "select-file", fileId: string): void
  (event: "open-file-upload"): void
  (event: "update-generator-schema-name", schemaName: string): void
  (event: "update-generator-input-mode", inputMode: string): void
  (event: "update-generator-conflict-strategy", strategy: string): void
  (event: "update-generator-frontend-target", frontendTarget: string): void
  (event: "update-generator-manual-schema-draft", value: string): void
  (event: "update-generator-query", value: string): void
  (event: "load-generator-current-schema-draft"): void
  (event: "restore-generator-session", sessionId: string): void
  (event: "select-generator-file", filePath: string): void
  (event: "reset-generator-filters"): void
  (event: "refresh-generator-preview"): void
  (
    event: "review-generator-preview",
    input: { decision: "approve" | "reject"; comment?: string },
  ): void
  (event: "confirm-generator-preview"): void
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

const emitMainListPayloadEvent = (
  emit: ShellWorkspaceMainSwitchEmitFn,
  event: ShellWorkspaceMainListPayloadEvent,
  payload: unknown,
) => {
  emit(event, payload)
}

const emitMainListResetEvent = (
  emit: ShellWorkspaceMainSwitchEmitFn,
  event: ShellWorkspaceMainListResetEvent,
) => {
  emit(event)
}

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
  search: (payload: unknown) =>
    emitMainListPayloadEvent(emit, searchEvent, payload),
  reset: () => emitMainListResetEvent(emit, resetEvent),
  "row-click": (payload: unknown) =>
    emitMainListPayloadEvent(emit, rowClickEvent, payload),
})

const placeholderResolver: ShellWorkspaceMainResolver = (props, emit) => ({
  component: ShellWorkspaceStatusMain,
  props: {
    mode: "placeholder",
    title: props.selectedNavigationItemName,
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
    queryFields: props.enterpriseQueryFields,
    tableColumns: props.enterpriseTableColumns,
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
    workspaceStateInjected: true,
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

export const shellWorkspaceMainResolverKinds = [
  "workflow-definitions",
  "file",
  "generator-preview",
  "dictionary",
  "department",
  "session",
  "post",
  "menu",
  "notification",
  "operation-log",
  "role",
  "setting",
  "tenant",
  "user",
] as const

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
      definitionCards: props.workflowDefinitionCards,
      definitionCount: props.workflowDefinitionCount,
      paginationSummary: props.workflowPaginationSummary,
      canGoToPreviousPage: props.workflowCanGoToPreviousPage,
      canGoToNextPage: props.workflowCanGoToNextPage,
      detailDialogOpen: props.workflowDetailDialogOpen,
      selectedDefinitionId: props.selectedWorkflowDefinitionId,
      detailLoading: props.workflowDetailLoading,
      detailErrorMessage: props.workflowDetailErrorMessage,
      selectedDefinition:
        props.selectedWorkflowDefinition as WorkflowDefinitionRecord | null,
      localizeStatus: props.localizeWorkflowStatus,
    },
    listeners: {
      "update:query": (value: unknown) =>
        emit("workflow-update-query", value as string),
      "select-definition": (definitionId: unknown) =>
        emit("select-workflow-definition", definitionId as string),
      "close-detail": () => emit("close-workflow-definition-detail"),
      "reset-filters": () => emit("reset-workflow-filters"),
      "go-previous-page": () => emit("go-previous-workflow-page"),
      "go-next-page": () => emit("go-next-workflow-page"),
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
        emit("update-file-query", value as FileWorkspaceQuery),
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
      reviewLoading: props.generatorPreviewReviewLoading,
      applyLoading: props.generatorPreviewApplyLoading,
      errorMessage: props.generatorPreviewErrorMessage,
      inputModeOptions: props.generatorPreviewInputModeOptions as Array<{
        label: string
        value: string
      }>,
      schemaOptions: props.generatorPreviewSchemaOptions,
      conflictStrategyOptions:
        props.generatorPreviewConflictStrategyOptions as Array<{
          label: string
          value: string
        }>,
      recentSessionOptions:
        props.generatorPreviewRecentSessionOptions as Array<{
          label: string
          value: string
        }>,
      selectedInputMode: props.selectedGeneratorPreviewInputMode,
      selectedConflictStrategy: props.selectedGeneratorPreviewConflictStrategy,
      selectedRecentSessionId: props.selectedGeneratorPreviewRecentSessionId,
      selectedSchemaName: props.selectedGeneratorPreviewSchemaName,
      selectedFrontendTarget: props.selectedGeneratorPreviewFrontendTarget,
      manualSchemaDraft: props.generatorPreviewManualSchemaDraft,
      manualSchemaDraftError: props.generatorPreviewManualSchemaDraftError,
      query: props.generatorPreviewQuery,
      files: props.generatorPreviewFiles,
      selectedFilePath: props.selectedGeneratorPreviewFilePath,
      canApprove: props.canApproveGeneratorPreview,
      canReject: props.canRejectGeneratorPreview,
      canApply: props.canApplyGeneratorPreview,
      canConfirm: props.canConfirmGeneratorPreview,
      diffSummary: props.generatorPreviewDiffSummary,
      sessionStatus: props.generatorPreviewSession?.status ?? null,
      reviewEvidence: props.generatorPreviewSession?.reviewEvidence ?? null,
      applyEvidence: props.generatorPreviewSession?.applyEvidence ?? null,
      hasBlockingConflicts:
        props.generatorPreviewSession?.hasBlockingConflicts ?? false,
    },
    listeners: {
      "update:selected-input-mode": (value: unknown) =>
        emit("update-generator-input-mode", value as string),
      "update:selected-schema-name": (schemaName: unknown) =>
        emit("update-generator-schema-name", schemaName as string),
      "update:selected-conflict-strategy": (strategy: unknown) =>
        emit("update-generator-conflict-strategy", strategy as string),
      "update:selected-frontend-target": (frontendTarget: unknown) =>
        emit("update-generator-frontend-target", frontendTarget as string),
      "update:manual-schema-draft": (value: unknown) =>
        emit("update-generator-manual-schema-draft", value as string),
      "update:query": (value: unknown) =>
        emit("update-generator-query", value as string),
      "load-current-schema-draft": () =>
        emit("load-generator-current-schema-draft"),
      "restore-session": (sessionId: unknown) =>
        emit("restore-generator-session", sessionId as string),
      "select-file": (filePath: unknown) =>
        emit("select-generator-file", filePath as string),
      "reset-filters": () => emit("reset-generator-filters"),
      "refresh-preview": () => emit("refresh-generator-preview"),
      "review-preview": (input: unknown) =>
        emit(
          "review-generator-preview",
          input as {
            decision: "approve" | "reject"
            comment?: string
          },
        ),
      "confirm-preview": () => emit("confirm-generator-preview"),
      "apply-preview": () => emit("apply-generator-preview"),
    },
  }),
  dictionary: (props, emit) => ({
    component: generatedStandardCrudMainComponents.dictionary,
    props: {
      t: props.t,
      moduleReady: props.dictionaryModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterDictionaryWorkspace,
      canViewDictionaries: props.canViewDictionaries,
      queryFields: props.enterpriseDictionaryQueryFields,
      tableColumns: props.enterpriseDictionaryTableColumns,
      itemCountLabel: props.dictionaryCountLabel,
      emptyTitle: props.t("app.dictionary.emptyTitle"),
      emptyDescription: props.t("app.dictionary.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
      workspaceStateInjected: true,
    },
    listeners: workspaceListListeners(
      emit,
      "dictionary-search",
      "dictionary-reset",
      "dictionary-row-click",
    ),
  }),
  department: (props, emit) => ({
    component: generatedStandardCrudMainComponents.department,
    props: {
      t: props.t,
      moduleReady: props.departmentModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterDepartmentWorkspace,
      canViewDepartments: props.canViewDepartments,
      queryFields: props.enterpriseDepartmentQueryFields,
      tableColumns: props.enterpriseDepartmentTableColumns,
      itemCountLabel: props.departmentCountLabel,
      emptyTitle: props.t("app.department.emptyTitle"),
      emptyDescription: props.t("app.department.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
      workspaceStateInjected: true,
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
    component: generatedStandardCrudMainComponents.post,
    props: {
      t: props.t,
      moduleReady: props.postModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterPostWorkspace,
      canViewPosts: props.canViewPosts,
      queryFields: props.enterprisePostQueryFields,
      tableColumns: props.enterprisePostTableColumns,
      itemCountLabel: props.postCountLabel,
      emptyTitle: props.t("app.post.emptyTitle"),
      emptyDescription: props.t("app.post.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
      workspaceStateInjected: true,
    },
    listeners: workspaceListListeners(
      emit,
      "post-search",
      "post-reset",
      "post-row-click",
    ),
  }),
  menu: (props, emit) => ({
    component: generatedStandardCrudMainComponents.menu,
    props: {
      t: props.t,
      moduleReady: props.menuModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterMenuWorkspace,
      canViewMenus: props.canViewMenus,
      queryFields: props.enterpriseMenuQueryFields,
      tableColumns: props.enterpriseMenuTableColumns,
      itemCountLabel: props.menuCountLabel,
      emptyTitle: props.t("app.menu.emptyTitle"),
      emptyDescription: props.t("app.menu.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
      workspaceStateInjected: true,
    },
    listeners: workspaceListListeners(
      emit,
      "menu-search",
      "menu-reset",
      "menu-row-click",
    ),
  }),
  notification: (props, emit) => ({
    component: generatedStandardCrudMainComponents.notification,
    props: {
      t: props.t,
      moduleReady: props.notificationModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterNotificationWorkspace,
      canViewNotifications: props.canViewNotifications,
      queryFields: props.enterpriseNotificationQueryFields,
      tableColumns: props.enterpriseNotificationTableColumns,
      itemCountLabel: props.notificationCountLabel,
      emptyTitle: props.t("app.notification.emptyTitle"),
      emptyDescription: props.t("app.notification.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
      workspaceStateInjected: true,
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
    component: generatedStandardCrudMainComponents.role,
    props: {
      t: props.t,
      moduleReady: props.roleModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterRoleWorkspace,
      canViewRoles: props.canViewRoles,
      queryFields: props.enterpriseRoleQueryFields,
      tableColumns: props.enterpriseRoleTableColumns,
      itemCountLabel: props.roleCountLabel,
      emptyTitle: props.t("app.role.emptyTitle"),
      emptyDescription: props.t("app.role.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
      workspaceStateInjected: true,
    },
    listeners: workspaceListListeners(
      emit,
      "role-search",
      "role-reset",
      "role-row-click",
    ),
  }),
  setting: (props, emit) => ({
    component: generatedStandardCrudMainComponents.setting,
    props: {
      t: props.t,
      moduleReady: props.settingModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterSettingWorkspace,
      canViewSettings: props.canViewSettings,
      queryFields: props.enterpriseSettingQueryFields,
      tableColumns: props.enterpriseSettingTableColumns,
      itemCountLabel: props.settingCountLabel,
      emptyTitle: props.t("app.setting.emptyTitle"),
      emptyDescription: props.t("app.setting.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
      workspaceStateInjected: true,
    },
    listeners: workspaceListListeners(
      emit,
      "setting-search",
      "setting-reset",
      "setting-row-click",
    ),
  }),
  tenant: (props, emit) => ({
    component: generatedStandardCrudMainComponents.tenant,
    props: {
      t: props.t,
      moduleReady: props.tenantModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      isSuperAdmin: props.tenantIsSuperAdmin,
      canEnterWorkspace: props.canEnterTenantWorkspace,
      canViewTenants: props.canViewTenants,
      queryFields: props.enterpriseTenantQueryFields,
      tableColumns: props.enterpriseTenantTableColumns,
      itemCountLabel: props.tenantCountLabel,
      emptyTitle: props.t("app.tenant.emptyTitle"),
      emptyDescription: props.t("app.tenant.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
      workspaceStateInjected: true,
    },
    listeners: workspaceListListeners(
      emit,
      "tenant-search",
      "tenant-reset",
      "tenant-row-click",
    ),
  }),
  user: (props, emit) => ({
    component: generatedStandardCrudMainComponents.user,
    props: {
      t: props.t,
      moduleReady: props.userModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterUserWorkspace,
      canViewUsers: props.canViewUsers,
      queryFields: props.enterpriseUserQueryFields,
      tableColumns: props.enterpriseUserTableColumns,
      itemCountLabel: props.userCountLabel,
      emptyTitle: props.t("app.user.emptyTitle"),
      emptyDescription: props.t("app.user.emptyDescription"),
      currentQuerySummary: props.currentQuerySummary,
      copy: props.enterpriseCrudCopy,
      workspaceStateInjected: true,
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

const standardCrudWorkspaceKindSet = new Set<string>(
  generatedStandardCrudWorkspaceKinds,
)

const assertShellWorkspaceMainResolverCoverage = (workspaceKind: string) => {
  if (
    standardCrudWorkspaceKindSet.has(workspaceKind) &&
    !(workspaceKind in workspaceResolvers)
  ) {
    throw new Error(
      `Missing shell main resolver for generated standard CRUD workspace "${workspaceKind}"`,
    )
  }
}

export const resolveShellWorkspaceMainDescriptor = (
  props: ShellWorkspaceMainSwitchProps,
  emit: ShellWorkspaceMainSwitchEmitFn,
): ShellWorkspaceMainDescriptor => {
  assertShellWorkspaceMainResolverCoverage(props.currentWorkspaceKind)

  return (workspaceResolvers[props.currentWorkspaceKind] ?? customerResolver)(
    props,
    emit,
  )
}
