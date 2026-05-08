import type { Component } from "vue"
import { defineAsyncComponent } from "vue"

import type { AppTranslate } from "../../../app/app-shell-helpers"
import { generatedStandardCrudWorkspaceKinds } from "../../../app/workspace-registry/generated"
import type { FileRecord } from "../../../lib/platform-api"
import { generatedStandardCrudPanelComponents } from "../../../modules/generated"
import type {
  GeneratorPreviewDiffSummary,
  GeneratorPreviewFileCard,
  GeneratorPreviewSqlPreview,
  GeneratorPreviewSqlProposal,
  GeneratorPreviewSqlProposalHandoff,
} from "../generator/types"
import ShellWorkspaceStatusPanel from "./ShellWorkspaceStatusPanel.vue"

const AuthSessionWorkspacePanel = defineAsyncComponent(
  () => import("../auth-session/AuthSessionWorkspacePanel.vue"),
)
const CustomerWorkspacePanel = defineAsyncComponent(
  () => import("../customer/CustomerWorkspacePanel.vue"),
)
const DepartmentWorkspacePanel = defineAsyncComponent(
  () => import("../department/DepartmentWorkspacePanel.vue"),
)
const FileWorkspacePanel = defineAsyncComponent(
  () => import("../file/FileWorkspacePanel.vue"),
)
const GeneratorPreviewWorkspacePanel = defineAsyncComponent(
  () => import("../generator/GeneratorPreviewWorkspacePanel.vue"),
)
const OperationLogWorkspacePanel = defineAsyncComponent(
  () => import("../operation-log/OperationLogWorkspacePanel.vue"),
)
const WorkflowWorkspacePanel = defineAsyncComponent(
  () => import("../workflow/WorkflowWorkspacePanel.vue"),
)

export interface ShellWorkspaceSecondarySwitchProps {
  t: AppTranslate
  locale: string
  currentWorkspaceKind: string
  selectedNavigationItemName: string
  currentNavigationPath: string
  authStatusLabel: string
  currentModuleCodeLabel: string
  dictionaryModuleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterDictionaryWorkspace: boolean
  canViewDictionaries: boolean
  canCreateDictionaryTypes: boolean
  canUpdateDictionaryTypes: boolean
  dictionaryWorkspaceState: Record<string, unknown>
  dictionaryLoading: boolean
  dictionaryDetailLoading: boolean
  dictionaryErrorMessage: string
  dictionaryDetailErrorMessage: string
  dictionaryPanelMode: string
  dictionaryPanelTitle: string
  dictionaryPanelDescription: string
  selectedDictionaryType: Record<string, unknown> | null
  selectedDictionaryTypeItems: ReadonlyArray<unknown>
  enterpriseDictionaryFormFields: ReadonlyArray<unknown>
  enterpriseDictionaryFormValues: Record<string, unknown>
  enterpriseFormCopy: Record<string, unknown>
  localizeDictionaryStatus: (status: string) => string
  departmentModuleReady: boolean
  canEnterDepartmentWorkspace: boolean
  canViewDepartments: boolean
  canCreateDepartments: boolean
  canUpdateDepartments: boolean
  departmentWorkspaceState: Record<string, unknown>
  departmentLoading: boolean
  departmentDetailLoading: boolean
  departmentErrorMessage: string
  departmentDetailErrorMessage: string
  departmentPanelMode: string
  departmentPanelTitle: string
  departmentPanelDescription: string
  selectedDepartment: Record<string, unknown> | null
  selectedDepartmentDetail: Record<string, unknown> | null
  enterpriseDepartmentFormFields: ReadonlyArray<unknown>
  enterpriseDepartmentFormValues: Record<string, unknown>
  departmentParentLookup: Map<string, unknown>
  sessionModuleReady: boolean
  canEnterSessionWorkspace: boolean
  sessionLoading: boolean
  sessionActionLoading: boolean
  sessionErrorMessage: string
  selectedSession: Record<string, unknown> | null
  hideSessionCard?: boolean
  postModuleReady: boolean
  canEnterPostWorkspace: boolean
  canViewPosts: boolean
  canCreatePosts: boolean
  canUpdatePosts: boolean
  postWorkspaceState: Record<string, unknown>
  postLoading: boolean
  postDetailLoading: boolean
  postErrorMessage: string
  postDetailErrorMessage: string
  postPanelMode: string
  postPanelTitle: string
  postPanelDescription: string
  selectedPost: Record<string, unknown> | null
  enterprisePostFormFields: ReadonlyArray<unknown>
  enterprisePostFormValues: Record<string, unknown>
  menuModuleReady: boolean
  canEnterMenuWorkspace: boolean
  canViewMenus: boolean
  canCreateMenus: boolean
  canUpdateMenus: boolean
  menuWorkspaceState: Record<string, unknown>
  menuLoading: boolean
  menuDetailLoading: boolean
  menuErrorMessage: string
  menuDetailErrorMessage: string
  menuPanelMode: string
  menuPanelTitle: string
  menuPanelDescription: string
  selectedMenu: Record<string, unknown> | null
  selectedMenuDetail: Record<string, unknown> | null
  enterpriseMenuFormFields: ReadonlyArray<unknown>
  enterpriseMenuFormValues: Record<string, unknown>
  menuParentLookup: Map<string, unknown>
  notificationModuleReady: boolean
  canEnterNotificationWorkspace: boolean
  canViewNotifications: boolean
  canCreateNotifications: boolean
  canUpdateNotifications: boolean
  notificationWorkspaceState: Record<string, unknown>
  localizeNotificationStatus: (status: string) => string
  localizeNotificationLevel: (level: string) => string
  operationLogModuleReady: boolean
  canEnterOperationLogWorkspace: boolean
  canViewOperationLogs: boolean
  operationLogLoading: boolean
  operationLogDetailLoading: boolean
  operationLogErrorMessage: string
  operationLogDetailErrorMessage: string
  operationLogPanelTitle: string
  operationLogPanelDescription: string
  selectedOperationLog: Record<string, unknown> | null
  enterpriseOperationLogDetailFields: ReadonlyArray<unknown>
  enterpriseOperationLogDetailValues: Record<string, unknown>
  operationLogDetailsText: string
  roleModuleReady: boolean
  canEnterRoleWorkspace: boolean
  canViewRoles: boolean
  canCreateRoles: boolean
  canUpdateRoles: boolean
  roleWorkspaceState: Record<string, unknown>
  roleLoading: boolean
  roleDetailLoading: boolean
  roleErrorMessage: string
  roleDetailErrorMessage: string
  rolePanelMode: string
  rolePanelTitle: string
  rolePanelDescription: string
  selectedRole: Record<string, unknown> | null
  selectedRoleDetail: Record<string, unknown> | null
  enterpriseRoleFormFields: ReadonlyArray<unknown>
  enterpriseRoleFormValues: Record<string, unknown>
  settingModuleReady: boolean
  canEnterSettingWorkspace: boolean
  canViewSettings: boolean
  canCreateSettings: boolean
  canUpdateSettings: boolean
  settingWorkspaceState: Record<string, unknown>
  tenantModuleReady: boolean
  tenantIsSuperAdmin: boolean
  canEnterTenantWorkspace: boolean
  canViewTenants: boolean
  canCreateTenants: boolean
  canUpdateTenants: boolean
  tenantWorkspaceState: Record<string, unknown>
  userModuleReady: boolean
  canEnterUserWorkspace: boolean
  canViewUsers: boolean
  canCreateUsers: boolean
  canUpdateUsers: boolean
  canResetUserPasswords: boolean
  userWorkspaceState: Record<string, unknown>
  userPasswordInput: string
  workflowDetailLoading: boolean
  workflowDetailErrorMessage: string
  selectedWorkflowDefinition: Record<string, unknown> | null
  localizeWorkflowStatus: (status: string) => string
  fileModuleReady: boolean
  canViewFiles: boolean
  canUploadFiles: boolean
  canDownloadFiles: boolean
  canDeleteFiles: boolean
  fileLoading: boolean
  fileDetailLoading: boolean
  fileActionLoading: boolean
  fileErrorMessage: string
  fileDetailErrorMessage: string
  filePanelMode: string
  selectedFile: FileRecord | null
  pendingUploadFile: File | null
  selectedGeneratorPreviewSchemaName: string
  selectedGeneratorPreviewFrontendTarget: string
  selectedGeneratorPreviewFile: GeneratorPreviewFileCard | null
  generatorPreviewSqlPreview: GeneratorPreviewSqlPreview | null
  generatorPreviewSqlProposal: GeneratorPreviewSqlProposal | null
  generatorPreviewSqlProposalHandoff: GeneratorPreviewSqlProposalHandoff | null
  generatorPreviewSession: Record<string, unknown> | null
  generatorPreviewDiffSummary: GeneratorPreviewDiffSummary | null
  generatorPreviewReviewEvidence: unknown
  generatorPreviewApplyEvidence: unknown
  customerModuleReady: boolean
  canCreateCustomers: boolean
  canUpdateCustomers: boolean
  canDeleteCustomers: boolean
  customerWorkspaceState: Record<string, unknown>
  platformDisplayName: string
  platformVersion: string
  platformStatusLabel: string
  authDisplayName: string
  authUsername: string
  authRolesLabel: string
  envName: string
  permissionCount: number
  authLoading: boolean
  authErrorMessage: string
}

type ShellWorkspaceSecondaryEditPayloadEvent =
  | "submit-dictionary-form"
  | "submit-department-form"
  | "submit-post-form"
  | "submit-menu-form"
  | "submit-role-form"
  | "submit-setting-form"

type ShellWorkspaceSecondaryEditNoPayloadEvent =
  | "start-dictionary-edit"
  | "open-dictionary-create"
  | "cancel-dictionary-panel"
  | "start-department-edit"
  | "open-department-create"
  | "cancel-department-panel"
  | "start-post-edit"
  | "open-post-create"
  | "cancel-post-panel"
  | "start-menu-edit"
  | "open-menu-create"
  | "cancel-menu-panel"
  | "start-role-edit"
  | "open-role-create"
  | "cancel-role-panel"
  | "start-setting-edit"
  | "open-setting-create"
  | "cancel-setting-panel"

export type ShellWorkspaceSecondarySwitchEmitFn = {
  (event: ShellWorkspaceSecondaryEditPayloadEvent, payload: unknown): void
  (event: ShellWorkspaceSecondaryEditNoPayloadEvent): void
  (event: "start-dictionary-edit"): void
  (event: "open-dictionary-create"): void
  (event: "submit-dictionary-form", payload: unknown): void
  (event: "cancel-dictionary-panel"): void
  (event: "start-department-edit"): void
  (event: "open-department-create"): void
  (event: "submit-department-form", payload: unknown): void
  (event: "cancel-department-panel"): void
  (event: "revoke-selected-session"): void
  (event: "start-post-edit"): void
  (event: "open-post-create"): void
  (event: "submit-post-form", payload: unknown): void
  (event: "cancel-post-panel"): void
  (event: "start-menu-edit"): void
  (event: "open-menu-create"): void
  (event: "submit-menu-form", payload: unknown): void
  (event: "cancel-menu-panel"): void
  (event: "mark-selected-notification-as-read"): void
  (event: "open-notification-create"): void
  (event: "submit-notification-form", payload: unknown): void
  (event: "cancel-notification-panel"): void
  (event: "start-role-edit"): void
  (event: "open-role-create"): void
  (event: "submit-role-form", payload: unknown): void
  (event: "cancel-role-panel"): void
  (event: "start-setting-edit"): void
  (event: "open-setting-create"): void
  (event: "submit-setting-form", payload: unknown): void
  (event: "cancel-setting-panel"): void
  (event: "start-tenant-edit"): void
  (event: "toggle-selected-tenant-status"): void
  (event: "open-tenant-create"): void
  (event: "submit-tenant-form", payload: unknown): void
  (event: "cancel-tenant-panel"): void
  (event: "start-user-edit"): void
  (event: "start-user-password-reset"): void
  (event: "open-user-create"): void
  (event: "submit-user-form", payload: unknown): void
  (event: "cancel-user-panel"): void
  (event: "update:user-password-input", value: string): void
  (event: "submit-user-password-reset"): void
  (event: "select-workflow-definition", definitionId: string): void
  (event: "set-pending-upload-file", value: File | null): void
  (event: "submit-file-upload"): void
  (event: "download-selected-file"): void
  (event: "open-file-delete-panel"): void
  (event: "confirm-file-delete"): void
  (event: "cancel-file-panel"): void
  (event: "confirm-delete"): void
  (event: "cancel-delete"): void
  (event: "start-customer-edit"): void
  (event: "request-customer-delete"): void
  (event: "open-customer-create"): void
  (event: "submit-customer-form", payload: unknown): void
  (event: "cancel-customer-form"): void
  (event: "submit-logout"): void
}

interface ShellWorkspaceSecondaryDescriptor {
  component: Component
  props: Record<string, unknown>
  listeners?: Record<string, (...args: unknown[]) => void>
}

type ShellWorkspaceSecondaryResolver = (
  props: ShellWorkspaceSecondarySwitchProps,
  emit: ShellWorkspaceSecondarySwitchEmitFn,
) => ShellWorkspaceSecondaryDescriptor

const emitSecondaryEditPayloadEvent = (
  emit: ShellWorkspaceSecondarySwitchEmitFn,
  event: ShellWorkspaceSecondaryEditPayloadEvent,
  payload: unknown,
) => {
  emit(event, payload)
}

const emitSecondaryEditNoPayloadEvent = (
  emit: ShellWorkspaceSecondarySwitchEmitFn,
  event: ShellWorkspaceSecondaryEditNoPayloadEvent,
) => {
  emit(event)
}

const editPanelListeners = (
  emit: ShellWorkspaceSecondarySwitchEmitFn,
  startEditEvent:
    | "start-dictionary-edit"
    | "start-department-edit"
    | "start-post-edit"
    | "start-menu-edit"
    | "start-role-edit"
    | "start-setting-edit",
  openCreateEvent:
    | "open-dictionary-create"
    | "open-department-create"
    | "open-post-create"
    | "open-menu-create"
    | "open-role-create"
    | "open-setting-create",
  submitEvent:
    | "submit-dictionary-form"
    | "submit-department-form"
    | "submit-post-form"
    | "submit-menu-form"
    | "submit-role-form"
    | "submit-setting-form",
  cancelEvent:
    | "cancel-dictionary-panel"
    | "cancel-department-panel"
    | "cancel-post-panel"
    | "cancel-menu-panel"
    | "cancel-role-panel"
    | "cancel-setting-panel",
) => ({
  "start-edit": () => emitSecondaryEditNoPayloadEvent(emit, startEditEvent),
  "open-create": () => emitSecondaryEditNoPayloadEvent(emit, openCreateEvent),
  "submit-form": (payload: unknown) =>
    emitSecondaryEditPayloadEvent(emit, submitEvent, payload),
  "cancel-panel": () => emitSecondaryEditNoPayloadEvent(emit, cancelEvent),
})

const statusResolver: ShellWorkspaceSecondaryResolver = (props) => ({
  component: ShellWorkspaceStatusPanel,
  props: {
    title: props.selectedNavigationItemName,
    currentPath: props.currentNavigationPath,
    authStatusLabel: props.authStatusLabel,
    moduleCodeLabel: props.currentModuleCodeLabel,
  },
})

const customerResolver: ShellWorkspaceSecondaryResolver = (props, emit) => ({
  component: CustomerWorkspacePanel,
  props: {
    t: props.t,
    formCopy: props.enterpriseFormCopy,
    workspaceStateInjected: true,
  },
  listeners: {
    "submit-form": (payload: unknown) => emit("submit-customer-form", payload),
    "cancel-form": () => emit("cancel-customer-form"),
  },
})

export const shellWorkspaceSecondaryResolverKinds = [
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
  "workflow-definitions",
  "file",
  "generator-preview",
] as const

const workspaceResolvers: Record<string, ShellWorkspaceSecondaryResolver> = {
  dictionary: (props, emit) => ({
    component: generatedStandardCrudPanelComponents.dictionary,
    props: {
      t: props.t,
      moduleReady: props.dictionaryModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterDictionaryWorkspace,
      canViewDictionaries: props.canViewDictionaries,
      canCreateDictionaryTypes: props.canCreateDictionaryTypes,
      canUpdateDictionaryTypes: props.canUpdateDictionaryTypes,
      formCopy: props.enterpriseFormCopy,
      localizeDictionaryStatus: props.localizeDictionaryStatus,
      workspaceStateInjected: true,
    },
    listeners: editPanelListeners(
      emit,
      "start-dictionary-edit",
      "open-dictionary-create",
      "submit-dictionary-form",
      "cancel-dictionary-panel",
    ),
  }),
  department: (props, emit) => ({
    component: DepartmentWorkspacePanel,
    props: {
      t: props.t,
      formCopy: props.enterpriseFormCopy,
      workspaceStateInjected: true,
    },
    listeners: {
      "submit-form": (payload: unknown) =>
        emit("submit-department-form", payload),
      "cancel-form": () => emit("cancel-department-panel"),
    },
  }),
  session: (props, emit) => ({
    component: AuthSessionWorkspacePanel,
    props: {
      t: props.t,
      moduleReady: props.sessionModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterSessionWorkspace,
      loading: props.sessionLoading,
      actionLoading: props.sessionActionLoading,
      errorMessage: props.sessionErrorMessage,
      selectedSession: props.selectedSession,
    },
    listeners: {
      "revoke-selected-session": () => emit("revoke-selected-session"),
    },
  }),
  post: (props, emit) => ({
    component: generatedStandardCrudPanelComponents.post,
    props: {
      t: props.t,
      moduleReady: props.postModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterPostWorkspace,
      canViewPosts: props.canViewPosts,
      canCreatePosts: props.canCreatePosts,
      canUpdatePosts: props.canUpdatePosts,
      formCopy: props.enterpriseFormCopy,
      workspaceStateInjected: true,
    },
    listeners: editPanelListeners(
      emit,
      "start-post-edit",
      "open-post-create",
      "submit-post-form",
      "cancel-post-panel",
    ),
  }),
  menu: (props, emit) => ({
    component: generatedStandardCrudPanelComponents.menu,
    props: {
      t: props.t,
      moduleReady: props.menuModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterMenuWorkspace,
      canViewMenus: props.canViewMenus,
      canCreateMenus: props.canCreateMenus,
      canUpdateMenus: props.canUpdateMenus,
      formCopy: props.enterpriseFormCopy,
      workspaceStateInjected: true,
    },
    listeners: editPanelListeners(
      emit,
      "start-menu-edit",
      "open-menu-create",
      "submit-menu-form",
      "cancel-menu-panel",
    ),
  }),
  notification: (props, emit) => ({
    component: generatedStandardCrudPanelComponents.notification,
    props: {
      t: props.t,
      locale: props.locale,
      moduleReady: props.notificationModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterNotificationWorkspace,
      canViewNotifications: props.canViewNotifications,
      canCreateNotifications: props.canCreateNotifications,
      canUpdateNotifications: props.canUpdateNotifications,
      formCopy: props.enterpriseFormCopy,
      localizeNotificationStatus: props.localizeNotificationStatus,
      localizeNotificationLevel: props.localizeNotificationLevel,
      workspaceStateInjected: true,
    },
    listeners: {
      "mark-read": () => emit("mark-selected-notification-as-read"),
      "open-create": () => emit("open-notification-create"),
      "submit-form": (payload: unknown) =>
        emit("submit-notification-form", payload),
      "cancel-panel": () => emit("cancel-notification-panel"),
    },
  }),
  "operation-log": (props) => ({
    component: OperationLogWorkspacePanel,
    props: {
      t: props.t,
      moduleReady: props.operationLogModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterOperationLogWorkspace,
      canViewOperationLogs: props.canViewOperationLogs,
      loading: props.operationLogLoading,
      detailLoading: props.operationLogDetailLoading,
      errorMessage: props.operationLogErrorMessage,
      detailErrorMessage: props.operationLogDetailErrorMessage,
      panelTitle: props.operationLogPanelTitle,
      panelDescription: props.operationLogPanelDescription,
      selectedOperationLog: props.selectedOperationLog,
      detailFields: props.enterpriseOperationLogDetailFields,
      detailValues: props.enterpriseOperationLogDetailValues,
      detailsText: props.operationLogDetailsText,
      formCopy: props.enterpriseFormCopy,
    },
  }),
  role: (props, emit) => ({
    component: generatedStandardCrudPanelComponents.role,
    props: {
      t: props.t,
      moduleReady: props.roleModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterRoleWorkspace,
      canViewRoles: props.canViewRoles,
      canCreateRoles: props.canCreateRoles,
      canUpdateRoles: props.canUpdateRoles,
      formCopy: props.enterpriseFormCopy,
      workspaceStateInjected: true,
    },
    listeners: editPanelListeners(
      emit,
      "start-role-edit",
      "open-role-create",
      "submit-role-form",
      "cancel-role-panel",
    ),
  }),
  setting: (props, emit) => ({
    component: generatedStandardCrudPanelComponents.setting,
    props: {
      t: props.t,
      moduleReady: props.settingModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterSettingWorkspace,
      canViewSettings: props.canViewSettings,
      formCopy: props.enterpriseFormCopy,
      canCreateSettings: props.canCreateSettings,
      canUpdateSettings: props.canUpdateSettings,
      workspaceStateInjected: true,
    },
    listeners: editPanelListeners(
      emit,
      "start-setting-edit",
      "open-setting-create",
      "submit-setting-form",
      "cancel-setting-panel",
    ),
  }),
  tenant: (props, emit) => ({
    component: generatedStandardCrudPanelComponents.tenant,
    props: {
      t: props.t,
      moduleReady: props.tenantModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      isSuperAdmin: props.tenantIsSuperAdmin,
      canEnterWorkspace: props.canEnterTenantWorkspace,
      canViewTenants: props.canViewTenants,
      canCreateTenants: props.canCreateTenants,
      canUpdateTenants: props.canUpdateTenants,
      formCopy: props.enterpriseFormCopy,
      workspaceStateInjected: true,
    },
    listeners: {
      "start-edit": () => emit("start-tenant-edit"),
      "toggle-status": () => emit("toggle-selected-tenant-status"),
      "open-create": () => emit("open-tenant-create"),
      "submit-form": (payload: unknown) => emit("submit-tenant-form", payload),
      "cancel-panel": () => emit("cancel-tenant-panel"),
    },
  }),
  user: (props, emit) => ({
    component: generatedStandardCrudPanelComponents.user,
    props: {
      t: props.t,
      moduleReady: props.userModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterUserWorkspace,
      canViewUsers: props.canViewUsers,
      canCreateUsers: props.canCreateUsers,
      canUpdateUsers: props.canUpdateUsers,
      canResetUserPasswords: props.canResetUserPasswords,
      formCopy: props.enterpriseFormCopy,
      passwordInput: props.userPasswordInput,
      workspaceStateInjected: true,
    },
    listeners: {
      "start-edit": () => emit("start-user-edit"),
      "start-password-reset": () => emit("start-user-password-reset"),
      "open-create": () => emit("open-user-create"),
      "submit-form": (payload: unknown) => emit("submit-user-form", payload),
      "cancel-panel": () => emit("cancel-user-panel"),
      "update:password-input": (value: unknown) =>
        emit("update:user-password-input", value as string),
      "submit-password-reset": () => emit("submit-user-password-reset"),
    },
  }),
  "workflow-definitions": (props, emit) => ({
    component: WorkflowWorkspacePanel,
    props: {
      t: props.t,
      locale: props.locale,
      detailLoading: props.workflowDetailLoading,
      detailErrorMessage: props.workflowDetailErrorMessage,
      selectedDefinition: props.selectedWorkflowDefinition,
      localizeStatus: props.localizeWorkflowStatus,
    },
    listeners: {
      "select-definition": (definitionId: unknown) =>
        emit("select-workflow-definition", definitionId as string),
    },
  }),
  file: (props, emit) => ({
    component: FileWorkspacePanel,
    props: {
      t: props.t,
      locale: props.locale,
      moduleReady: props.fileModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canViewFiles: props.canViewFiles,
      canUploadFiles: props.canUploadFiles,
      canDownloadFiles: props.canDownloadFiles,
      canDeleteFiles: props.canDeleteFiles,
      loading: props.fileLoading,
      detailLoading: props.fileDetailLoading,
      actionLoading: props.fileActionLoading,
      errorMessage: props.fileErrorMessage,
      detailErrorMessage: props.fileDetailErrorMessage,
      panelMode: props.filePanelMode,
      selectedFile: props.selectedFile,
      pendingUploadFile: props.pendingUploadFile,
    },
    listeners: {
      "set-upload-file": (value: unknown) =>
        emit("set-pending-upload-file", value as File | null),
      "submit-upload": () => emit("submit-file-upload"),
      "download-selected": () => emit("download-selected-file"),
      "open-delete": () => emit("open-file-delete-panel"),
      "confirm-delete": () => emit("confirm-file-delete"),
      "cancel-panel": () => emit("cancel-file-panel"),
    },
  }),
  "generator-preview": (props) => ({
    component: GeneratorPreviewWorkspacePanel,
    props: {
      t: props.t,
      selectedSchemaName: props.selectedGeneratorPreviewSchemaName,
      selectedFrontendTarget: props.selectedGeneratorPreviewFrontendTarget,
      selectedFile: props.selectedGeneratorPreviewFile,
      sqlPreview: props.generatorPreviewSqlPreview,
      sqlProposal: props.generatorPreviewSqlProposal,
      sqlProposalHandoff: props.generatorPreviewSqlProposalHandoff,
      session: props.generatorPreviewSession,
      diffSummary: props.generatorPreviewDiffSummary,
      reviewEvidence: props.generatorPreviewReviewEvidence,
      applyEvidence: props.generatorPreviewApplyEvidence,
    },
  }),
}

const standardCrudWorkspaceKindSet = new Set<string>(
  generatedStandardCrudWorkspaceKinds,
)

const assertShellWorkspaceSecondaryResolverCoverage = (
  workspaceKind: string,
) => {
  if (
    standardCrudWorkspaceKindSet.has(workspaceKind) &&
    !(workspaceKind in workspaceResolvers)
  ) {
    throw new Error(
      `Missing shell secondary resolver for generated standard CRUD workspace "${workspaceKind}"`,
    )
  }
}

export const resolveShellWorkspaceSecondaryDescriptor = (
  props: ShellWorkspaceSecondarySwitchProps,
  emit: ShellWorkspaceSecondarySwitchEmitFn,
): ShellWorkspaceSecondaryDescriptor => {
  if (props.currentWorkspaceKind === "placeholder") {
    return statusResolver(props, emit)
  }

  assertShellWorkspaceSecondaryResolverCoverage(props.currentWorkspaceKind)

  return (workspaceResolvers[props.currentWorkspaceKind] ?? customerResolver)(
    props,
    emit,
  )
}
