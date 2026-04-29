import type { Component } from "vue"

import type { AppTranslate } from "../../../app/app-shell-helpers"
import AuthSessionWorkspacePanel from "../auth-session/AuthSessionWorkspacePanel.vue"
import CustomerWorkspacePanel from "../customer/CustomerWorkspacePanel.vue"
import DepartmentWorkspacePanel from "../department/DepartmentWorkspacePanel.vue"
import DictionaryWorkspacePanel from "../dictionary/DictionaryWorkspacePanel.vue"
import FileWorkspacePanel from "../file/FileWorkspacePanel.vue"
import GeneratorPreviewWorkspacePanel from "../generator/GeneratorPreviewWorkspacePanel.vue"
import MenuWorkspacePanel from "../menu/MenuWorkspacePanel.vue"
import NotificationWorkspacePanel from "../notification/NotificationWorkspacePanel.vue"
import OperationLogWorkspacePanel from "../operation-log/OperationLogWorkspacePanel.vue"
import PostWorkspacePanel from "../post/PostWorkspacePanel.vue"
import RoleWorkspacePanel from "../role/RoleWorkspacePanel.vue"
import SettingWorkspacePanel from "../setting/SettingWorkspacePanel.vue"
import TenantWorkspacePanel from "../tenant/TenantWorkspacePanel.vue"
import UserWorkspacePanel from "../user/UserWorkspacePanel.vue"
import WorkflowWorkspacePanel from "../workflow/WorkflowWorkspacePanel.vue"
import ShellWorkspaceStatusPanel from "./ShellWorkspaceStatusPanel.vue"

export interface ShellWorkspaceSecondarySwitchProps {
  t: AppTranslate
  locale: string
  currentWorkspaceKind: string
  isRuntimeShellTab: boolean
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
  departmentParentLookup: Record<string, string>
  sessionModuleReady: boolean
  canEnterSessionWorkspace: boolean
  sessionLoading: boolean
  sessionActionLoading: boolean
  sessionErrorMessage: string
  selectedSession: Record<string, unknown> | null
  postModuleReady: boolean
  canEnterPostWorkspace: boolean
  canViewPosts: boolean
  canCreatePosts: boolean
  canUpdatePosts: boolean
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
  menuParentLookup: Record<string, string>
  notificationModuleReady: boolean
  canEnterNotificationWorkspace: boolean
  canViewNotifications: boolean
  canCreateNotifications: boolean
  canUpdateNotifications: boolean
  notificationLoading: boolean
  notificationDetailLoading: boolean
  notificationErrorMessage: string
  notificationDetailErrorMessage: string
  notificationPanelMode: string
  notificationPanelTitle: string
  notificationPanelDescription: string
  selectedNotification: Record<string, unknown> | null
  enterpriseNotificationFormFields: ReadonlyArray<unknown>
  enterpriseNotificationFormValues: Record<string, unknown>
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
  settingLoading: boolean
  settingDetailLoading: boolean
  settingErrorMessage: string
  settingDetailErrorMessage: string
  settingPanelMode: string
  settingPanelTitle: string
  settingPanelDescription: string
  selectedSetting: Record<string, unknown> | null
  enterpriseSettingFormFields: ReadonlyArray<unknown>
  enterpriseSettingFormValues: Record<string, unknown>
  tenantModuleReady: boolean
  tenantIsSuperAdmin: boolean
  canEnterTenantWorkspace: boolean
  canViewTenants: boolean
  canCreateTenants: boolean
  canUpdateTenants: boolean
  tenantLoading: boolean
  tenantDetailLoading: boolean
  tenantErrorMessage: string
  tenantDetailErrorMessage: string
  tenantPanelMode: string
  tenantPanelTitle: string
  tenantPanelDescription: string
  selectedTenant: Record<string, unknown> | null
  enterpriseTenantFormFields: ReadonlyArray<unknown>
  enterpriseTenantFormValues: Record<string, unknown>
  userModuleReady: boolean
  canEnterUserWorkspace: boolean
  canViewUsers: boolean
  canCreateUsers: boolean
  canUpdateUsers: boolean
  canResetUserPasswords: boolean
  userLoading: boolean
  userErrorMessage: string
  userPanelMode: string
  userPanelTitle: string
  userPanelDescription: string
  selectedUser: Record<string, unknown> | null
  enterpriseUserFormFields: ReadonlyArray<unknown>
  enterpriseUserFormValues: Record<string, unknown>
  userPasswordInput: string
  workflowDetailLoading: boolean
  workflowDetailErrorMessage: string
  selectedWorkflowDefinition: Record<string, unknown> | null
  selectedWorkflowDefinitionId: string | null
  workflowVersionHistoryCards: ReadonlyArray<unknown>
  workflowDefinitionDetailCards: ReadonlyArray<unknown>
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
  selectedFile: Record<string, unknown> | null
  pendingUploadFile: File | null
  selectedGeneratorPreviewSchemaName: string
  selectedGeneratorPreviewFrontendTarget: string
  selectedGeneratorPreviewFile: Record<string, unknown> | null
  generatorPreviewSqlPreview: string
  generatorPreviewSession: Record<string, unknown> | null
  generatorPreviewDiffSummary: string
  generatorPreviewApplyEvidence: unknown
  customerModuleReady: boolean
  canCreateCustomers: boolean
  canUpdateCustomers: boolean
  canDeleteCustomers: boolean
  customerLoading: boolean
  enterpriseFormMode: string
  enterprisePanelTitle: string
  enterprisePanelDescription: string
  deleteConfirmId: string | null
  selectedCustomer: Record<string, unknown> | null
  enterpriseFormFields: ReadonlyArray<unknown>
  enterpriseFormValues: Record<string, unknown>
  platformDisplayName: string
  platformVersion: string
  platformStatusLabel: string
  authDisplayName: string
  authUsername: string
  authRolesLabel: string
  envName: string
  permissionCount: number
  authLoading: boolean
  loginUsername: string
  loginPassword: string
  authErrorMessage: string
}

export type ShellWorkspaceSecondarySwitchEmitFn = {
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
  (event: "update:login-username", value: string): void
  (event: "update:login-password", value: string): void
  (event: "submit-login"): void
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

const emitSecondaryEvent = (
  emit: ShellWorkspaceSecondarySwitchEmitFn,
  event: string,
  ...args: unknown[]
) => {
  ;(emit as unknown as (event: string, ...args: unknown[]) => void)(
    event,
    ...args,
  )
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
  "start-edit": () => emitSecondaryEvent(emit, startEditEvent),
  "open-create": () => emitSecondaryEvent(emit, openCreateEvent),
  "submit-form": (payload: unknown) =>
    emitSecondaryEvent(emit, submitEvent, payload),
  "cancel-panel": () => emitSecondaryEvent(emit, cancelEvent),
})

const statusResolver: ShellWorkspaceSecondaryResolver = (props) => ({
  component: ShellWorkspaceStatusPanel,
  props: {
    title: props.selectedNavigationItemName,
    currentPage: props.selectedNavigationItemName,
    currentPath: props.currentNavigationPath,
    authStatusLabel: props.authStatusLabel,
    moduleCodeLabel: props.currentModuleCodeLabel,
  },
})

const customerResolver: ShellWorkspaceSecondaryResolver = (props, emit) => ({
  component: CustomerWorkspacePanel,
  props: {
    t: props.t,
    moduleReady: props.customerModuleReady,
    authModuleReady: props.authModuleReady,
    isAuthenticated: props.isAuthenticated,
    canCreateCustomers: props.canCreateCustomers,
    canUpdateCustomers: props.canUpdateCustomers,
    canDeleteCustomers: props.canDeleteCustomers,
    loading: props.customerLoading,
    panelMode: props.enterpriseFormMode,
    panelTitle: props.enterprisePanelTitle,
    panelDescription: props.enterprisePanelDescription,
    deleteConfirmId: props.deleteConfirmId,
    selectedCustomer: props.selectedCustomer,
    formFields: props.enterpriseFormFields,
    formValues: props.enterpriseFormValues,
    formCopy: props.enterpriseFormCopy,
  },
  listeners: {
    "confirm-delete": () => emit("confirm-delete"),
    "cancel-delete": () => emit("cancel-delete"),
    "start-edit": () => emit("start-customer-edit"),
    "request-delete": () => emit("request-customer-delete"),
    "open-create": () => emit("open-customer-create"),
    "submit-form": (payload: unknown) => emit("submit-customer-form", payload),
    "cancel-form": () => emit("cancel-customer-form"),
  },
})

const workspaceResolvers: Record<string, ShellWorkspaceSecondaryResolver> = {
  dictionary: (props, emit) => ({
    component: DictionaryWorkspacePanel,
    props: {
      t: props.t,
      moduleReady: props.dictionaryModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterDictionaryWorkspace,
      canViewDictionaries: props.canViewDictionaries,
      canCreateDictionaryTypes: props.canCreateDictionaryTypes,
      canUpdateDictionaryTypes: props.canUpdateDictionaryTypes,
      loading: props.dictionaryLoading,
      detailLoading: props.dictionaryDetailLoading,
      errorMessage: props.dictionaryErrorMessage,
      detailErrorMessage: props.dictionaryDetailErrorMessage,
      panelMode: props.dictionaryPanelMode,
      panelTitle: props.dictionaryPanelTitle,
      panelDescription: props.dictionaryPanelDescription,
      selectedDictionaryType: props.selectedDictionaryType,
      selectedDictionaryTypeItems: props.selectedDictionaryTypeItems,
      formFields: props.enterpriseDictionaryFormFields,
      formValues: props.enterpriseDictionaryFormValues,
      formCopy: props.enterpriseFormCopy,
      localizeDictionaryStatus: props.localizeDictionaryStatus,
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
      moduleReady: props.departmentModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterDepartmentWorkspace,
      canViewDepartments: props.canViewDepartments,
      canCreateDepartments: props.canCreateDepartments,
      canUpdateDepartments: props.canUpdateDepartments,
      loading: props.departmentLoading,
      detailLoading: props.departmentDetailLoading,
      errorMessage: props.departmentErrorMessage,
      detailErrorMessage: props.departmentDetailErrorMessage,
      panelMode: props.departmentPanelMode,
      panelTitle: props.departmentPanelTitle,
      panelDescription: props.departmentPanelDescription,
      selectedDepartment: props.selectedDepartment,
      selectedDepartmentDetail: props.selectedDepartmentDetail,
      formFields: props.enterpriseDepartmentFormFields,
      formValues: props.enterpriseDepartmentFormValues,
      formCopy: props.enterpriseFormCopy,
      departmentParentLookup: props.departmentParentLookup,
    },
    listeners: editPanelListeners(
      emit,
      "start-department-edit",
      "open-department-create",
      "submit-department-form",
      "cancel-department-panel",
    ),
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
    component: PostWorkspacePanel,
    props: {
      t: props.t,
      moduleReady: props.postModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterPostWorkspace,
      canViewPosts: props.canViewPosts,
      canCreatePosts: props.canCreatePosts,
      canUpdatePosts: props.canUpdatePosts,
      loading: props.postLoading,
      detailLoading: props.postDetailLoading,
      errorMessage: props.postErrorMessage,
      detailErrorMessage: props.postDetailErrorMessage,
      panelMode: props.postPanelMode,
      panelTitle: props.postPanelTitle,
      panelDescription: props.postPanelDescription,
      selectedPost: props.selectedPost,
      formFields: props.enterprisePostFormFields,
      formValues: props.enterprisePostFormValues,
      formCopy: props.enterpriseFormCopy,
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
    component: MenuWorkspacePanel,
    props: {
      t: props.t,
      moduleReady: props.menuModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterMenuWorkspace,
      canViewMenus: props.canViewMenus,
      canCreateMenus: props.canCreateMenus,
      canUpdateMenus: props.canUpdateMenus,
      loading: props.menuLoading,
      detailLoading: props.menuDetailLoading,
      errorMessage: props.menuErrorMessage,
      detailErrorMessage: props.menuDetailErrorMessage,
      panelMode: props.menuPanelMode,
      panelTitle: props.menuPanelTitle,
      panelDescription: props.menuPanelDescription,
      selectedMenu: props.selectedMenu,
      selectedMenuDetail: props.selectedMenuDetail,
      formFields: props.enterpriseMenuFormFields,
      formValues: props.enterpriseMenuFormValues,
      formCopy: props.enterpriseFormCopy,
      menuParentLookup: props.menuParentLookup,
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
    component: NotificationWorkspacePanel,
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
      loading: props.notificationLoading,
      detailLoading: props.notificationDetailLoading,
      errorMessage: props.notificationErrorMessage,
      detailErrorMessage: props.notificationDetailErrorMessage,
      panelMode: props.notificationPanelMode,
      panelTitle: props.notificationPanelTitle,
      panelDescription: props.notificationPanelDescription,
      selectedNotification: props.selectedNotification,
      formFields: props.enterpriseNotificationFormFields,
      formValues: props.enterpriseNotificationFormValues,
      formCopy: props.enterpriseFormCopy,
      localizeNotificationStatus: props.localizeNotificationStatus,
      localizeNotificationLevel: props.localizeNotificationLevel,
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
    component: RoleWorkspacePanel,
    props: {
      t: props.t,
      moduleReady: props.roleModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterRoleWorkspace,
      canViewRoles: props.canViewRoles,
      canCreateRoles: props.canCreateRoles,
      canUpdateRoles: props.canUpdateRoles,
      loading: props.roleLoading,
      detailLoading: props.roleDetailLoading,
      errorMessage: props.roleErrorMessage,
      detailErrorMessage: props.roleDetailErrorMessage,
      panelMode: props.rolePanelMode,
      panelTitle: props.rolePanelTitle,
      panelDescription: props.rolePanelDescription,
      selectedRole: props.selectedRole,
      selectedRoleDetail: props.selectedRoleDetail,
      formFields: props.enterpriseRoleFormFields,
      formValues: props.enterpriseRoleFormValues,
      formCopy: props.enterpriseFormCopy,
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
    component: SettingWorkspacePanel,
    props: {
      t: props.t,
      moduleReady: props.settingModuleReady,
      authModuleReady: props.authModuleReady,
      isAuthenticated: props.isAuthenticated,
      canEnterWorkspace: props.canEnterSettingWorkspace,
      canViewSettings: props.canViewSettings,
      loading: props.settingLoading,
      detailLoading: props.settingDetailLoading,
      errorMessage: props.settingErrorMessage,
      detailErrorMessage: props.settingDetailErrorMessage,
      panelMode: props.settingPanelMode,
      panelTitle: props.settingPanelTitle,
      panelDescription: props.settingPanelDescription,
      selectedSetting: props.selectedSetting,
      formFields: props.enterpriseSettingFormFields,
      formValues: props.enterpriseSettingFormValues,
      formCopy: props.enterpriseFormCopy,
      canCreateSettings: props.canCreateSettings,
      canUpdateSettings: props.canUpdateSettings,
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
    component: TenantWorkspacePanel,
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
      loading: props.tenantLoading,
      detailLoading: props.tenantDetailLoading,
      errorMessage: props.tenantErrorMessage,
      detailErrorMessage: props.tenantDetailErrorMessage,
      panelMode: props.tenantPanelMode,
      panelTitle: props.tenantPanelTitle,
      panelDescription: props.tenantPanelDescription,
      selectedTenant: props.selectedTenant,
      formFields: props.enterpriseTenantFormFields,
      formValues: props.enterpriseTenantFormValues,
      formCopy: props.enterpriseFormCopy,
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
    component: UserWorkspacePanel,
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
      loading: props.userLoading,
      errorMessage: props.userErrorMessage,
      panelMode: props.userPanelMode,
      panelTitle: props.userPanelTitle,
      panelDescription: props.userPanelDescription,
      selectedUser: props.selectedUser,
      formFields: props.enterpriseUserFormFields,
      formValues: props.enterpriseUserFormValues,
      formCopy: props.enterpriseFormCopy,
      passwordInput: props.userPasswordInput,
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
      selectedDefinitionId: props.selectedWorkflowDefinitionId,
      versionHistoryCards: props.workflowVersionHistoryCards,
      detailCards: props.workflowDefinitionDetailCards,
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
      session: props.generatorPreviewSession,
      diffSummary: props.generatorPreviewDiffSummary,
      applyEvidence: props.generatorPreviewApplyEvidence,
    },
  }),
}

export const resolveShellWorkspaceSecondaryDescriptor = (
  props: ShellWorkspaceSecondarySwitchProps,
  emit: ShellWorkspaceSecondarySwitchEmitFn,
): ShellWorkspaceSecondaryDescriptor => {
  if (props.isRuntimeShellTab || props.currentWorkspaceKind === "placeholder") {
    return statusResolver(props, emit)
  }

  return (workspaceResolvers[props.currentWorkspaceKind] ?? customerResolver)(
    props,
    emit,
  )
}
