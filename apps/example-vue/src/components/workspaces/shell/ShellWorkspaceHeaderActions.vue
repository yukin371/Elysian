<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"

import type { AppTranslate } from "../../../app/app-shell-helpers"

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
  (event: "delete-visible-files"): void
  (event: "reload-workflow-definitions"): void
  (event: "open-current-workspace-tab"): void
  (event: "submit-logout"): void
}>()
</script>

<template>
  <template v-if="!isRuntimeShellTab">
    <TButton
      v-if="isRoleWorkspace"
      size="small"
      theme="primary"
      variant="outline"
      :disabled="!canCreateRoles"
      @click="$emit('open-role-create')"
    >
      {{ t("app.action.newRole") }}
    </TButton>
    <TButton
      v-if="isRoleWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="roleExportLoading"
      :disabled="roleExportLoading || !canViewRoles"
      @click="$emit('export-roles')"
    >
      {{ t("app.action.exportRoles") }}
    </TButton>
    <TButton
      v-if="isRoleWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :disabled="roleLoading || !canViewRoles"
      @click="$emit('reload-roles')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isCustomerWorkspace"
      size="small"
      theme="primary"
      variant="outline"
      :disabled="!canCreateCustomers"
      @click="$emit('open-customer-create')"
    >
      {{ t("app.action.newCustomer") }}
    </TButton>
    <TButton
      v-if="isCustomerWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :disabled="customerLoading || !canViewCustomers"
      @click="$emit('reload-customers')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isDictionaryWorkspace"
      size="small"
      theme="primary"
      variant="outline"
      :disabled="!canCreateDictionaryTypes"
      @click="$emit('open-dictionary-create')"
    >
      {{ t("app.action.newDictionaryType") }}
    </TButton>
    <TButton
      v-if="isDictionaryWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="dictionaryTypeExportLoading"
      :disabled="dictionaryTypeExportLoading || !canViewDictionaries"
      @click="$emit('export-dictionary-types')"
    >
      {{ t("app.action.exportDictionaryTypes") }}
    </TButton>
    <TButton
      v-if="isDictionaryWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="dictionaryItemsExportLoading"
      :disabled="dictionaryItemsExportLoading || !canViewDictionaries"
      @click="$emit('export-dictionary-items')"
    >
      {{ t("app.action.exportDictionaryItems") }}
    </TButton>
    <TButton
      v-if="isDictionaryWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :disabled="dictionaryLoading || !canViewDictionaries"
      @click="$emit('reload-dictionaries')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isDepartmentWorkspace"
      size="small"
      theme="primary"
      variant="outline"
      :disabled="!canCreateDepartments"
      @click="$emit('open-department-create')"
    >
      {{ t("app.action.newDepartment") }}
    </TButton>
    <TButton
      v-if="isDepartmentWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="departmentExportLoading"
      :disabled="departmentExportLoading || !canViewDepartments"
      @click="$emit('export-departments')"
    >
      {{ t("app.action.exportDepartments") }}
    </TButton>
    <TButton
      v-if="isDepartmentWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :disabled="departmentLoading || !canViewDepartments"
      @click="$emit('reload-departments')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isPostWorkspace"
      size="small"
      theme="primary"
      variant="outline"
      :disabled="!canCreatePosts"
      @click="$emit('open-post-create')"
    >
      {{ t("app.post.action.create") }}
    </TButton>
    <TButton
      v-if="isPostWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="postExportLoading"
      :disabled="postExportLoading || !canViewPosts"
      @click="$emit('export-posts')"
    >
      {{ t("app.action.exportPosts") }}
    </TButton>
    <TButton
      v-if="isPostWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :disabled="postLoading || !canViewPosts"
      @click="$emit('reload-posts')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isMenuWorkspace"
      size="small"
      theme="primary"
      variant="outline"
      :disabled="!canCreateMenus"
      @click="$emit('open-menu-create')"
    >
      {{ t("app.action.newMenu") }}
    </TButton>
    <TButton
      v-if="isMenuWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="menuExportLoading"
      :disabled="menuExportLoading || !canViewMenus"
      @click="$emit('export-menus')"
    >
      {{ t("app.action.exportMenus") }}
    </TButton>
    <TButton
      v-if="isMenuWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :disabled="menuLoading || !canViewMenus"
      @click="$emit('reload-menus')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isNotificationWorkspace"
      size="small"
      theme="primary"
      variant="outline"
      :disabled="!canCreateNotifications"
      @click="$emit('open-notification-create')"
    >
      {{ t("app.action.newNotification") }}
    </TButton>
    <TButton
      v-if="isNotificationWorkspace"
      size="small"
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
      {{ t("app.action.markVisibleNotificationsRead") }}
    </TButton>
    <TButton
      v-if="isNotificationWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :disabled="notificationLoading || !canViewNotifications"
      @click="$emit('reload-notifications')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isOperationLogWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="operationLogExportLoading"
      :disabled="
        operationLogLoading || operationLogExportLoading || !canExportOperationLogs
      "
      @click="$emit('export-operation-logs')"
    >
      {{ t("app.action.exportOperationLogs") }}
    </TButton>
    <TButton
      v-if="isOperationLogWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :disabled="operationLogLoading || !canViewOperationLogs"
      @click="$emit('reload-operation-logs')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isUserWorkspace"
      size="small"
      theme="primary"
      variant="outline"
      :disabled="!canCreateUsers"
      @click="$emit('open-user-create')"
    >
      {{ t("app.action.newUser") }}
    </TButton>
    <TButton
      v-if="isSettingWorkspace"
      size="small"
      theme="primary"
      variant="outline"
      :disabled="!canCreateSettings"
      @click="$emit('open-setting-create')"
    >
      {{ t("app.action.newSetting") }}
    </TButton>
    <TButton
      v-if="isSettingWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="settingExportLoading"
      :disabled="settingExportLoading || !canViewSettings"
      @click="$emit('export-settings')"
    >
      {{ t("app.action.exportSettings") }}
    </TButton>
    <TButton
      v-if="isSettingWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :disabled="settingLoading || !canViewSettings"
      @click="$emit('reload-settings')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isTenantWorkspace"
      size="small"
      theme="primary"
      variant="outline"
      :disabled="!canCreateTenants"
      @click="$emit('open-tenant-create')"
    >
      {{ t("app.action.newTenant") }}
    </TButton>
    <TButton
      v-if="isTenantWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="tenantExportLoading"
      :disabled="tenantExportLoading || !canViewTenants"
      @click="$emit('export-tenants')"
    >
      {{ t("app.action.exportTenants") }}
    </TButton>
    <TButton
      v-if="isTenantWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :disabled="tenantLoading || !canViewTenants"
      @click="$emit('reload-tenants')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isUserWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="userExportLoading"
      :disabled="userExportLoading || !canViewUsers"
      @click="$emit('export-users')"
    >
      {{ t("app.action.exportUsers") }}
    </TButton>
    <TButton
      v-if="isUserWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :disabled="userLoading || !canViewUsers"
      @click="$emit('reload-users')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isFileWorkspace"
      size="small"
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
    </TButton>
    <TButton
      v-if="isFileWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="fileLoading"
      :disabled="fileLoading || (!canViewFiles && !canUploadFiles)"
      @click="$emit('reload-files')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
    <TButton
      v-if="isWorkflowDefinitionsWorkspace"
      size="small"
      theme="default"
      variant="outline"
      :loading="workflowLoading"
      :disabled="workflowLoading || !canViewWorkflowDefinitions"
      @click="$emit('reload-workflow-definitions')"
    >
      {{ t("app.action.refresh") }}
    </TButton>
  </template>
  <TButton
    v-if="isRuntimeShellTab"
    size="small"
    theme="default"
    variant="outline"
    @click="$emit('open-current-workspace-tab')"
  >
    {{ t("app.runtime.backToWorkspace") }}
  </TButton>
  <TButton
    v-if="isAuthenticated"
    size="small"
    theme="default"
    variant="text"
    :disabled="authLoading"
    @click="$emit('submit-logout')"
  >
    {{ t("app.action.signOut") }}
  </TButton>
</template>
