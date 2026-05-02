<script setup lang="ts">
import type { AppTranslate } from "../../../app/app-shell-helpers"
import ShellHeaderActionButton from "./ShellHeaderActionButton.vue"

defineProps<{
  t: AppTranslate
  isRuntimeShellTab: boolean
  isAuthenticated: boolean
  authLoading: boolean
  isRoleWorkspace: boolean
  roleLoading: boolean
  roleExportLoading: boolean
  canCreateRoles: boolean
  canViewRoles: boolean
  isCustomerWorkspace: boolean
  customerLoading: boolean
  canCreateCustomers: boolean
  canViewCustomers: boolean
  isDictionaryWorkspace: boolean
  dictionaryLoading: boolean
  dictionaryTypeExportLoading: boolean
  dictionaryItemsExportLoading: boolean
  canCreateDictionaryTypes: boolean
  canViewDictionaries: boolean
  isDepartmentWorkspace: boolean
  departmentLoading: boolean
  departmentExportLoading: boolean
  canCreateDepartments: boolean
  canViewDepartments: boolean
  isPostWorkspace: boolean
  postLoading: boolean
  postExportLoading: boolean
  canCreatePosts: boolean
  canViewPosts: boolean
  isMenuWorkspace: boolean
  menuLoading: boolean
  menuExportLoading: boolean
  canCreateMenus: boolean
  canViewMenus: boolean
  isNotificationWorkspace: boolean
  notificationLoading: boolean
  notificationExportLoading: boolean
  canCreateNotifications: boolean
  canViewNotifications: boolean
  canUpdateNotifications: boolean
  visibleUnreadNotificationCount: number
  isOperationLogWorkspace: boolean
  operationLogLoading: boolean
  operationLogExportLoading: boolean
  canViewOperationLogs: boolean
  canExportOperationLogs: boolean
  isUserWorkspace: boolean
  userLoading: boolean
  userExportLoading: boolean
  canCreateUsers: boolean
  canViewUsers: boolean
  isSettingWorkspace: boolean
  settingLoading: boolean
  settingExportLoading: boolean
  canCreateSettings: boolean
  canViewSettings: boolean
  isTenantWorkspace: boolean
  tenantLoading: boolean
  tenantExportLoading: boolean
  canCreateTenants: boolean
  canViewTenants: boolean
  isFileWorkspace: boolean
  fileLoading: boolean
  fileExportLoading: boolean
  canViewFiles: boolean
  canUploadFiles: boolean
  canDeleteFiles: boolean
  fileActionLoading: boolean
  hasActiveFileFilters: boolean
  visibleFileCount: number
  isWorkflowDefinitionsWorkspace: boolean
  workflowLoading: boolean
  canViewWorkflowDefinitions: boolean
}>()

defineEmits<{
  (event: "open-role-create"): void
  (event: "reload-roles"): void
  (event: "export-roles"): void
  (event: "open-customer-create"): void
  (event: "reload-customers"): void
  (event: "open-dictionary-create"): void
  (event: "reload-dictionaries"): void
  (event: "export-dictionary-types"): void
  (event: "export-dictionary-items"): void
  (event: "open-department-create"): void
  (event: "reload-departments"): void
  (event: "export-departments"): void
  (event: "open-post-create"): void
  (event: "reload-posts"): void
  (event: "export-posts"): void
  (event: "open-menu-create"): void
  (event: "reload-menus"): void
  (event: "export-menus"): void
  (event: "open-notification-create"): void
  (event: "reload-notifications"): void
  (event: "export-notifications"): void
  (event: "mark-visible-notifications-read"): void
  (event: "reload-operation-logs"): void
  (event: "export-operation-logs"): void
  (event: "open-user-create"): void
  (event: "reload-users"): void
  (event: "export-users"): void
  (event: "open-setting-create"): void
  (event: "reload-settings"): void
  (event: "export-settings"): void
  (event: "open-tenant-create"): void
  (event: "reload-tenants"): void
  (event: "export-tenants"): void
  (event: "reload-files"): void
  (event: "open-file-upload"): void
  (event: "export-files"): void
  (event: "delete-visible-files"): void
  (event: "reload-workflow-definitions"): void
  (event: "open-current-workspace-tab"): void
  (event: "submit-logout"): void
}>()
</script>

<template>
  <template v-if="!isRuntimeShellTab">
    <ShellHeaderActionButton
      v-if="isRoleWorkspace"
      theme="primary"
      variant="outline"
      :disabled="!canCreateRoles"
      @click="$emit('open-role-create')"
    >
      {{ t("app.action.newRole") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isRoleWorkspace"
      theme="default"
      variant="outline"
      :loading="roleExportLoading"
      :disabled="roleLoading || roleExportLoading || !canViewRoles"
      @click="$emit('export-roles')"
    >
      {{ t("app.action.exportRoles") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isRoleWorkspace"
      theme="default"
      variant="outline"
      :disabled="roleLoading || !canViewRoles"
      @click="$emit('reload-roles')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isCustomerWorkspace"
      theme="primary"
      variant="outline"
      :disabled="!canCreateCustomers"
      @click="$emit('open-customer-create')"
    >
      {{ t("app.action.newCustomer") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isCustomerWorkspace"
      theme="default"
      variant="outline"
      :disabled="customerLoading || !canViewCustomers"
      @click="$emit('reload-customers')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isDictionaryWorkspace"
      theme="primary"
      variant="outline"
      :disabled="!canCreateDictionaryTypes"
      @click="$emit('open-dictionary-create')"
    >
      {{ t("app.action.newDictionaryType") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isDictionaryWorkspace"
      theme="default"
      variant="outline"
      :loading="dictionaryTypeExportLoading"
      :disabled="
        dictionaryLoading || dictionaryTypeExportLoading || !canViewDictionaries
      "
      @click="$emit('export-dictionary-types')"
    >
      {{ t("app.action.exportDictionaryTypes") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isDictionaryWorkspace"
      theme="default"
      variant="outline"
      :loading="dictionaryItemsExportLoading"
      :disabled="
        dictionaryLoading || dictionaryItemsExportLoading || !canViewDictionaries
      "
      @click="$emit('export-dictionary-items')"
    >
      {{ t("app.action.exportDictionaryItems") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isDictionaryWorkspace"
      theme="default"
      variant="outline"
      :disabled="dictionaryLoading || !canViewDictionaries"
      @click="$emit('reload-dictionaries')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isDepartmentWorkspace"
      theme="primary"
      variant="outline"
      :disabled="!canCreateDepartments"
      @click="$emit('open-department-create')"
    >
      {{ t("app.action.newDepartment") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isDepartmentWorkspace"
      theme="default"
      variant="outline"
      :loading="departmentExportLoading"
      :disabled="departmentLoading || departmentExportLoading || !canViewDepartments"
      @click="$emit('export-departments')"
    >
      {{ t("app.action.exportDepartments") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isDepartmentWorkspace"
      theme="default"
      variant="outline"
      :disabled="departmentLoading || !canViewDepartments"
      @click="$emit('reload-departments')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isPostWorkspace"
      theme="primary"
      variant="outline"
      :disabled="!canCreatePosts"
      @click="$emit('open-post-create')"
    >
      {{ t("app.post.action.create") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isPostWorkspace"
      theme="default"
      variant="outline"
      :loading="postExportLoading"
      :disabled="postLoading || postExportLoading || !canViewPosts"
      @click="$emit('export-posts')"
    >
      {{ t("app.action.exportPosts") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isPostWorkspace"
      theme="default"
      variant="outline"
      :disabled="postLoading || !canViewPosts"
      @click="$emit('reload-posts')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isMenuWorkspace"
      theme="primary"
      variant="outline"
      :disabled="!canCreateMenus"
      @click="$emit('open-menu-create')"
    >
      {{ t("app.action.newMenu") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isMenuWorkspace"
      theme="default"
      variant="outline"
      :loading="menuExportLoading"
      :disabled="menuLoading || menuExportLoading || !canViewMenus"
      @click="$emit('export-menus')"
    >
      {{ t("app.action.exportMenus") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isMenuWorkspace"
      theme="default"
      variant="outline"
      :disabled="menuLoading || !canViewMenus"
      @click="$emit('reload-menus')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isNotificationWorkspace"
      theme="primary"
      variant="outline"
      :disabled="!canCreateNotifications"
      @click="$emit('open-notification-create')"
    >
      {{ t("app.action.newNotification") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isNotificationWorkspace"
      theme="default"
      variant="outline"
      :loading="notificationExportLoading"
      :disabled="
        notificationLoading || notificationExportLoading || !canViewNotifications
      "
      @click="$emit('export-notifications')"
    >
      {{ t("app.action.exportNotifications") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isNotificationWorkspace"
      theme="default"
      variant="outline"
      :disabled="
        notificationLoading ||
        !canViewNotifications ||
        !canUpdateNotifications ||
        visibleUnreadNotificationCount === 0
      "
      @click="$emit('mark-visible-notifications-read')"
    >
      {{
        t("app.action.markVisibleNotificationsRead", {
          count: visibleUnreadNotificationCount,
        })
      }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isNotificationWorkspace"
      theme="default"
      variant="outline"
      :disabled="notificationLoading || !canViewNotifications"
      @click="$emit('reload-notifications')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isOperationLogWorkspace"
      theme="default"
      variant="outline"
      :loading="operationLogExportLoading"
      :disabled="
        operationLogLoading || operationLogExportLoading || !canExportOperationLogs
      "
      @click="$emit('export-operation-logs')"
    >
      {{ t("app.action.exportOperationLogs") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isOperationLogWorkspace"
      theme="default"
      variant="outline"
      :disabled="operationLogLoading || !canViewOperationLogs"
      @click="$emit('reload-operation-logs')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isUserWorkspace"
      theme="primary"
      variant="outline"
      :disabled="!canCreateUsers"
      @click="$emit('open-user-create')"
    >
      {{ t("app.action.newUser") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isSettingWorkspace"
      theme="primary"
      variant="outline"
      :disabled="!canCreateSettings"
      @click="$emit('open-setting-create')"
    >
      {{ t("app.action.newSetting") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isSettingWorkspace"
      theme="default"
      variant="outline"
      :loading="settingExportLoading"
      :disabled="settingLoading || settingExportLoading || !canViewSettings"
      @click="$emit('export-settings')"
    >
      {{ t("app.action.exportSettings") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isSettingWorkspace"
      theme="default"
      variant="outline"
      :disabled="settingLoading || !canViewSettings"
      @click="$emit('reload-settings')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isTenantWorkspace"
      theme="primary"
      variant="outline"
      :disabled="!canCreateTenants"
      @click="$emit('open-tenant-create')"
    >
      {{ t("app.action.newTenant") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isTenantWorkspace"
      theme="default"
      variant="outline"
      :loading="tenantExportLoading"
      :disabled="tenantLoading || tenantExportLoading || !canViewTenants"
      @click="$emit('export-tenants')"
    >
      {{ t("app.action.exportTenants") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isTenantWorkspace"
      theme="default"
      variant="outline"
      :disabled="tenantLoading || !canViewTenants"
      @click="$emit('reload-tenants')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isUserWorkspace"
      theme="default"
      variant="outline"
      :loading="userExportLoading"
      :disabled="userLoading || userExportLoading || !canViewUsers"
      @click="$emit('export-users')"
    >
      {{ t("app.action.exportUsers") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isUserWorkspace"
      theme="default"
      variant="outline"
      :disabled="userLoading || !canViewUsers"
      @click="$emit('reload-users')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isFileWorkspace"
      theme="primary"
      variant="outline"
      :disabled="fileActionLoading || !canUploadFiles"
      @click="$emit('open-file-upload')"
    >
      {{ t("app.action.uploadFile") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isFileWorkspace"
      theme="default"
      variant="outline"
      :loading="fileExportLoading"
      :disabled="
        fileLoading || fileActionLoading || fileExportLoading || !canViewFiles
      "
      @click="$emit('export-files')"
    >
      {{ t("app.action.exportFiles") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isFileWorkspace"
      theme="danger"
      variant="outline"
      :loading="fileActionLoading"
      :disabled="
        fileLoading ||
        fileActionLoading ||
        !canViewFiles ||
        !canDeleteFiles ||
        !hasActiveFileFilters ||
        visibleFileCount === 0
      "
      @click="$emit('delete-visible-files')"
    >
      {{ t("app.action.deleteVisibleFiles", { count: visibleFileCount }) }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isFileWorkspace"
      theme="default"
      variant="outline"
      :loading="fileLoading"
      :disabled="fileLoading || (!canViewFiles && !canUploadFiles)"
      @click="$emit('reload-files')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
    <ShellHeaderActionButton
      v-if="isWorkflowDefinitionsWorkspace"
      theme="default"
      variant="outline"
      :loading="workflowLoading"
      :disabled="workflowLoading || !canViewWorkflowDefinitions"
      @click="$emit('reload-workflow-definitions')"
    >
      {{ t("app.action.refresh") }}
    </ShellHeaderActionButton>
  </template>
  <ShellHeaderActionButton
    v-if="isRuntimeShellTab"
    theme="default"
    variant="outline"
    @click="$emit('open-current-workspace-tab')"
  >
    {{ t("app.runtime.backToWorkspace") }}
  </ShellHeaderActionButton>
  <ShellHeaderActionButton
    v-if="isAuthenticated"
    theme="default"
    variant="text"
    :disabled="authLoading"
    @click="$emit('submit-logout')"
  >
    {{ t("app.action.signOut") }}
  </ShellHeaderActionButton>
</template>
