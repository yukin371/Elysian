<script setup lang="ts">
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
import ShellWorkspaceSessionCard from "./ShellWorkspaceSessionCard.vue"
import ShellWorkspaceStatusPanel from "./ShellWorkspaceStatusPanel.vue"

interface ShellWorkspaceSecondarySwitchProps {
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

defineProps<ShellWorkspaceSecondarySwitchProps>()

defineEmits<{
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
}>()
</script>

<template>
  <ShellWorkspaceStatusPanel
    v-if="isRuntimeShellTab || currentWorkspaceKind === 'placeholder'"
    :title="selectedNavigationItemName"
    :current-page="selectedNavigationItemName"
    :current-path="currentNavigationPath"
    :auth-status-label="authStatusLabel"
    :module-code-label="currentModuleCodeLabel"
  />

  <DictionaryWorkspacePanel
    v-else-if="currentWorkspaceKind === 'dictionary'"
    :t="t"
    :module-ready="dictionaryModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterDictionaryWorkspace"
    :can-view-dictionaries="canViewDictionaries"
    :can-create-dictionary-types="canCreateDictionaryTypes"
    :can-update-dictionary-types="canUpdateDictionaryTypes"
    :loading="dictionaryLoading"
    :detail-loading="dictionaryDetailLoading"
    :error-message="dictionaryErrorMessage"
    :detail-error-message="dictionaryDetailErrorMessage"
    :panel-mode="dictionaryPanelMode"
    :panel-title="dictionaryPanelTitle"
    :panel-description="dictionaryPanelDescription"
    :selected-dictionary-type="selectedDictionaryType"
    :selected-dictionary-type-items="selectedDictionaryTypeItems"
    :form-fields="enterpriseDictionaryFormFields"
    :form-values="enterpriseDictionaryFormValues"
    :form-copy="enterpriseFormCopy"
    :localize-dictionary-status="localizeDictionaryStatus"
    @start-edit="$emit('start-dictionary-edit')"
    @open-create="$emit('open-dictionary-create')"
    @submit-form="$emit('submit-dictionary-form', $event)"
    @cancel-panel="$emit('cancel-dictionary-panel')"
  />

  <DepartmentWorkspacePanel
    v-else-if="currentWorkspaceKind === 'department'"
    :t="t"
    :module-ready="departmentModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterDepartmentWorkspace"
    :can-view-departments="canViewDepartments"
    :can-create-departments="canCreateDepartments"
    :can-update-departments="canUpdateDepartments"
    :loading="departmentLoading"
    :detail-loading="departmentDetailLoading"
    :error-message="departmentErrorMessage"
    :detail-error-message="departmentDetailErrorMessage"
    :panel-mode="departmentPanelMode"
    :panel-title="departmentPanelTitle"
    :panel-description="departmentPanelDescription"
    :selected-department="selectedDepartment"
    :selected-department-detail="selectedDepartmentDetail"
    :form-fields="enterpriseDepartmentFormFields"
    :form-values="enterpriseDepartmentFormValues"
    :form-copy="enterpriseFormCopy"
    :department-parent-lookup="departmentParentLookup"
    @start-edit="$emit('start-department-edit')"
    @open-create="$emit('open-department-create')"
    @submit-form="$emit('submit-department-form', $event)"
    @cancel-panel="$emit('cancel-department-panel')"
  />

  <AuthSessionWorkspacePanel
    v-else-if="currentWorkspaceKind === 'session'"
    :t="t"
    :module-ready="sessionModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterSessionWorkspace"
    :loading="sessionLoading"
    :action-loading="sessionActionLoading"
    :error-message="sessionErrorMessage"
    :selected-session="selectedSession"
    @revoke-selected-session="$emit('revoke-selected-session')"
  />

  <PostWorkspacePanel
    v-else-if="currentWorkspaceKind === 'post'"
    :t="t"
    :module-ready="postModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterPostWorkspace"
    :can-view-posts="canViewPosts"
    :can-create-posts="canCreatePosts"
    :can-update-posts="canUpdatePosts"
    :loading="postLoading"
    :detail-loading="postDetailLoading"
    :error-message="postErrorMessage"
    :detail-error-message="postDetailErrorMessage"
    :panel-mode="postPanelMode"
    :panel-title="postPanelTitle"
    :panel-description="postPanelDescription"
    :selected-post="selectedPost"
    :form-fields="enterprisePostFormFields"
    :form-values="enterprisePostFormValues"
    :form-copy="enterpriseFormCopy"
    @start-edit="$emit('start-post-edit')"
    @open-create="$emit('open-post-create')"
    @submit-form="$emit('submit-post-form', $event)"
    @cancel-panel="$emit('cancel-post-panel')"
  />

  <MenuWorkspacePanel
    v-else-if="currentWorkspaceKind === 'menu'"
    :t="t"
    :module-ready="menuModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterMenuWorkspace"
    :can-view-menus="canViewMenus"
    :can-create-menus="canCreateMenus"
    :can-update-menus="canUpdateMenus"
    :loading="menuLoading"
    :detail-loading="menuDetailLoading"
    :error-message="menuErrorMessage"
    :detail-error-message="menuDetailErrorMessage"
    :panel-mode="menuPanelMode"
    :panel-title="menuPanelTitle"
    :panel-description="menuPanelDescription"
    :selected-menu="selectedMenu"
    :selected-menu-detail="selectedMenuDetail"
    :form-fields="enterpriseMenuFormFields"
    :form-values="enterpriseMenuFormValues"
    :form-copy="enterpriseFormCopy"
    :menu-parent-lookup="menuParentLookup"
    @start-edit="$emit('start-menu-edit')"
    @open-create="$emit('open-menu-create')"
    @submit-form="$emit('submit-menu-form', $event)"
    @cancel-panel="$emit('cancel-menu-panel')"
  />

  <NotificationWorkspacePanel
    v-else-if="currentWorkspaceKind === 'notification'"
    :t="t"
    :locale="locale"
    :module-ready="notificationModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterNotificationWorkspace"
    :can-view-notifications="canViewNotifications"
    :can-create-notifications="canCreateNotifications"
    :can-update-notifications="canUpdateNotifications"
    :loading="notificationLoading"
    :detail-loading="notificationDetailLoading"
    :error-message="notificationErrorMessage"
    :detail-error-message="notificationDetailErrorMessage"
    :panel-mode="notificationPanelMode"
    :panel-title="notificationPanelTitle"
    :panel-description="notificationPanelDescription"
    :selected-notification="selectedNotification"
    :form-fields="enterpriseNotificationFormFields"
    :form-values="enterpriseNotificationFormValues"
    :form-copy="enterpriseFormCopy"
    :localize-notification-status="localizeNotificationStatus"
    :localize-notification-level="localizeNotificationLevel"
    @mark-read="$emit('mark-selected-notification-as-read')"
    @open-create="$emit('open-notification-create')"
    @submit-form="$emit('submit-notification-form', $event)"
    @cancel-panel="$emit('cancel-notification-panel')"
  />

  <OperationLogWorkspacePanel
    v-else-if="currentWorkspaceKind === 'operation-log'"
    :t="t"
    :module-ready="operationLogModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterOperationLogWorkspace"
    :can-view-operation-logs="canViewOperationLogs"
    :loading="operationLogLoading"
    :detail-loading="operationLogDetailLoading"
    :error-message="operationLogErrorMessage"
    :detail-error-message="operationLogDetailErrorMessage"
    :panel-title="operationLogPanelTitle"
    :panel-description="operationLogPanelDescription"
    :selected-operation-log="selectedOperationLog"
    :detail-fields="enterpriseOperationLogDetailFields"
    :detail-values="enterpriseOperationLogDetailValues"
    :details-text="operationLogDetailsText"
    :form-copy="enterpriseFormCopy"
  />

  <RoleWorkspacePanel
    v-else-if="currentWorkspaceKind === 'role'"
    :t="t"
    :module-ready="roleModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterRoleWorkspace"
    :can-view-roles="canViewRoles"
    :can-create-roles="canCreateRoles"
    :can-update-roles="canUpdateRoles"
    :loading="roleLoading"
    :detail-loading="roleDetailLoading"
    :error-message="roleErrorMessage"
    :detail-error-message="roleDetailErrorMessage"
    :panel-mode="rolePanelMode"
    :panel-title="rolePanelTitle"
    :panel-description="rolePanelDescription"
    :selected-role="selectedRole"
    :selected-role-detail="selectedRoleDetail"
    :form-fields="enterpriseRoleFormFields"
    :form-values="enterpriseRoleFormValues"
    :form-copy="enterpriseFormCopy"
    @start-edit="$emit('start-role-edit')"
    @open-create="$emit('open-role-create')"
    @submit-form="$emit('submit-role-form', $event)"
    @cancel-panel="$emit('cancel-role-panel')"
  />

  <SettingWorkspacePanel
    v-else-if="currentWorkspaceKind === 'setting'"
    :t="t"
    :module-ready="settingModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterSettingWorkspace"
    :can-view-settings="canViewSettings"
    :loading="settingLoading"
    :detail-loading="settingDetailLoading"
    :error-message="settingErrorMessage"
    :detail-error-message="settingDetailErrorMessage"
    :panel-mode="settingPanelMode"
    :panel-title="settingPanelTitle"
    :panel-description="settingPanelDescription"
    :selected-setting="selectedSetting"
    :form-fields="enterpriseSettingFormFields"
    :form-values="enterpriseSettingFormValues"
    :form-copy="enterpriseFormCopy"
    :can-create-settings="canCreateSettings"
    :can-update-settings="canUpdateSettings"
    @start-edit="$emit('start-setting-edit')"
    @open-create="$emit('open-setting-create')"
    @submit-form="$emit('submit-setting-form', $event)"
    @cancel-panel="$emit('cancel-setting-panel')"
  />

  <TenantWorkspacePanel
    v-else-if="currentWorkspaceKind === 'tenant'"
    :t="t"
    :module-ready="tenantModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :is-super-admin="tenantIsSuperAdmin"
    :can-enter-workspace="canEnterTenantWorkspace"
    :can-view-tenants="canViewTenants"
    :can-create-tenants="canCreateTenants"
    :can-update-tenants="canUpdateTenants"
    :loading="tenantLoading"
    :detail-loading="tenantDetailLoading"
    :error-message="tenantErrorMessage"
    :detail-error-message="tenantDetailErrorMessage"
    :panel-mode="tenantPanelMode"
    :panel-title="tenantPanelTitle"
    :panel-description="tenantPanelDescription"
    :selected-tenant="selectedTenant"
    :form-fields="enterpriseTenantFormFields"
    :form-values="enterpriseTenantFormValues"
    :form-copy="enterpriseFormCopy"
    @start-edit="$emit('start-tenant-edit')"
    @toggle-status="$emit('toggle-selected-tenant-status')"
    @open-create="$emit('open-tenant-create')"
    @submit-form="$emit('submit-tenant-form', $event)"
    @cancel-panel="$emit('cancel-tenant-panel')"
  />

  <UserWorkspacePanel
    v-else-if="currentWorkspaceKind === 'user'"
    :t="t"
    :module-ready="userModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterUserWorkspace"
    :can-view-users="canViewUsers"
    :can-create-users="canCreateUsers"
    :can-update-users="canUpdateUsers"
    :can-reset-user-passwords="canResetUserPasswords"
    :loading="userLoading"
    :error-message="userErrorMessage"
    :panel-mode="userPanelMode"
    :panel-title="userPanelTitle"
    :panel-description="userPanelDescription"
    :selected-user="selectedUser"
    :form-fields="enterpriseUserFormFields"
    :form-values="enterpriseUserFormValues"
    :form-copy="enterpriseFormCopy"
    :password-input="userPasswordInput"
    @start-edit="$emit('start-user-edit')"
    @start-password-reset="$emit('start-user-password-reset')"
    @open-create="$emit('open-user-create')"
    @submit-form="$emit('submit-user-form', $event)"
    @cancel-panel="$emit('cancel-user-panel')"
    @update:password-input="$emit('update:user-password-input', $event)"
    @submit-password-reset="$emit('submit-user-password-reset')"
  />

  <WorkflowWorkspacePanel
    v-else-if="currentWorkspaceKind === 'workflow-definitions'"
    :t="t"
    :locale="locale"
    :detail-loading="workflowDetailLoading"
    :detail-error-message="workflowDetailErrorMessage"
    :selected-definition="selectedWorkflowDefinition"
    :selected-definition-id="selectedWorkflowDefinitionId"
    :version-history-cards="workflowVersionHistoryCards"
    :detail-cards="workflowDefinitionDetailCards"
    :localize-status="localizeWorkflowStatus"
    @select-definition="$emit('select-workflow-definition', $event)"
  />

  <FileWorkspacePanel
    v-else-if="currentWorkspaceKind === 'file'"
    :t="t"
    :locale="locale"
    :module-ready="fileModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-view-files="canViewFiles"
    :can-upload-files="canUploadFiles"
    :can-download-files="canDownloadFiles"
    :can-delete-files="canDeleteFiles"
    :loading="fileLoading"
    :detail-loading="fileDetailLoading"
    :action-loading="fileActionLoading"
    :error-message="fileErrorMessage"
    :detail-error-message="fileDetailErrorMessage"
    :panel-mode="filePanelMode"
    :selected-file="selectedFile"
    :pending-upload-file="pendingUploadFile"
    @set-upload-file="$emit('set-pending-upload-file', $event)"
    @submit-upload="$emit('submit-file-upload')"
    @download-selected="$emit('download-selected-file')"
    @open-delete="$emit('open-file-delete-panel')"
    @confirm-delete="$emit('confirm-file-delete')"
    @cancel-panel="$emit('cancel-file-panel')"
  />

  <GeneratorPreviewWorkspacePanel
    v-else-if="currentWorkspaceKind === 'generator-preview'"
    :t="t"
    :selected-schema-name="selectedGeneratorPreviewSchemaName"
    :selected-frontend-target="selectedGeneratorPreviewFrontendTarget"
    :selected-file="selectedGeneratorPreviewFile"
    :sql-preview="generatorPreviewSqlPreview"
    :session="generatorPreviewSession"
    :diff-summary="generatorPreviewDiffSummary"
    :apply-evidence="generatorPreviewApplyEvidence"
  />

  <CustomerWorkspacePanel
    v-else
    :t="t"
    :module-ready="customerModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-create-customers="canCreateCustomers"
    :can-update-customers="canUpdateCustomers"
    :can-delete-customers="canDeleteCustomers"
    :loading="customerLoading"
    :panel-mode="enterpriseFormMode"
    :panel-title="enterprisePanelTitle"
    :panel-description="enterprisePanelDescription"
    :delete-confirm-id="deleteConfirmId"
    :selected-customer="selectedCustomer"
    :form-fields="enterpriseFormFields"
    :form-values="enterpriseFormValues"
    :form-copy="enterpriseFormCopy"
    @confirm-delete="$emit('confirm-delete')"
    @cancel-delete="$emit('cancel-delete')"
    @start-edit="$emit('start-customer-edit')"
    @request-delete="$emit('request-customer-delete')"
    @open-create="$emit('open-customer-create')"
    @submit-form="$emit('submit-customer-form', $event)"
    @cancel-form="$emit('cancel-customer-form')"
  />

  <ShellWorkspaceSessionCard
    :t="t"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :platform-display-name="platformDisplayName"
    :platform-version="platformVersion"
    :platform-status-label="platformStatusLabel"
    :auth-display-name="authDisplayName"
    :auth-username="authUsername"
    :auth-roles-label="authRolesLabel"
    :env-name="envName"
    :permission-count="permissionCount"
    :auth-loading="authLoading"
    :login-username="loginUsername"
    v-bind="{ loginPassword }"
    :auth-error-message="authErrorMessage"
    @submit-logout="$emit('submit-logout')"
    @update:login-username="$emit('update:login-username', $event)"
    @update:login-password="$emit('update:login-password', $event)"
    @submit-login="$emit('submit-login')"
  />
</template>
