<script setup lang="ts">
import type { AppTranslate } from "../../../app/app-shell-helpers"
import CustomerWorkspaceMain from "../customer/CustomerWorkspaceMain.vue"
import DictionaryWorkspaceMain from "../dictionary/DictionaryWorkspaceMain.vue"
import FileWorkspaceMain from "../file/FileWorkspaceMain.vue"
import GeneratorPreviewWorkspaceMain from "../generator/GeneratorPreviewWorkspaceMain.vue"
import MenuWorkspaceMain from "../menu/MenuWorkspaceMain.vue"
import NotificationWorkspaceMain from "../notification/NotificationWorkspaceMain.vue"
import OperationLogWorkspaceMain from "../operation-log/OperationLogWorkspaceMain.vue"
import PostWorkspaceMain from "../post/PostWorkspaceMain.vue"
import RoleWorkspaceMain from "../role/RoleWorkspaceMain.vue"
import DepartmentWorkspaceMain from "../department/DepartmentWorkspaceMain.vue"
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

interface ShellWorkspaceMainSwitchProps {
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

defineProps<ShellWorkspaceMainSwitchProps>()

defineEmits<{
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
}>()
</script>

<template>
  <ShellWorkspaceStatusMain
    v-if="enterpriseSelectedTabKey === 'runtime'"
    mode="runtime"
    :title="selectedNavigationItemName"
    :subtitle="currentNavigationPath"
    :badge="authStatusLabel"
    :current-page="selectedNavigationItemName"
    :current-path="currentNavigationPath"
    :module-status-label="currentModuleStatusLabel"
    :auth-status-label="authStatusLabel"
    :permission-count="permissionCount"
    :module-code-label="currentModuleCodeLabel"
    :back-button-label="t('app.placeholder.backToCustomer')"
    :show-back-button="false"
  />

  <WorkflowWorkspaceMain
    v-else-if="currentWorkspaceKind === 'workflow-definitions'"
    :t="t"
    :module-ready="workflowModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterWorkflowWorkspace"
    :can-view-definitions="canViewWorkflowDefinitions"
    :error-message="workflowErrorMessage"
    :loading="workflowLoading"
    :query="workflowQuery"
    :status-filter="workflowStatusFilter"
    :filter-summary="workflowFilterSummary"
    :definition-cards="workflowDefinitionCards"
    :definition-count="workflowDefinitionCount"
    :selected-definition-id="selectedWorkflowDefinitionId"
    @update:query="$emit('workflow-update-query', $event)"
    @select-definition="$emit('select-workflow-definition', $event)"
    @select-status-filter="$emit('select-workflow-status-filter', $event)"
    @reset-filters="$emit('reset-workflow-filters')"
  />

  <FileWorkspaceMain
    v-else-if="currentWorkspaceKind === 'file'"
    :t="t"
    :module-ready="fileModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterFileWorkspace"
    :can-view-files="canViewFiles"
    :can-upload-files="canUploadFiles"
    :error-message="fileErrorMessage"
    :loading="fileLoading"
    :query="fileQuery"
    :filter-summary="fileFilterSummary"
    :count-label="fileCountLabel"
    :table-items="fileTableItems"
    :selected-file-id="selectedFileId"
    @update:query="$emit('update-file-query', $event)"
    @reset-filters="$emit('reset-file-filters')"
    @select-file="$emit('select-file', $event)"
    @open-upload="$emit('open-file-upload')"
  />

  <GeneratorPreviewWorkspaceMain
    v-else-if="currentWorkspaceKind === 'generator-preview'"
    :t="t"
    :loading="generatorPreviewLoading"
    :action-loading="generatorPreviewApplyLoading"
    :error-message="generatorPreviewErrorMessage"
    :schema-options="generatorPreviewSchemaOptions"
    :selected-schema-name="selectedGeneratorPreviewSchemaName"
    :selected-frontend-target="selectedGeneratorPreviewFrontendTarget"
    :query="generatorPreviewQuery"
    :filter-summary="generatorPreviewFilterSummary"
    :files="generatorPreviewFiles"
    :selected-file-path="selectedGeneratorPreviewFilePath"
    :can-apply="canApplyGeneratorPreview"
    :diff-summary="generatorPreviewDiffSummary"
    :session-status="generatorPreviewSession?.status ?? null"
    :apply-evidence="generatorPreviewSession?.applyEvidence ?? null"
    :has-blocking-conflicts="
      generatorPreviewSession?.hasBlockingConflicts ?? false
    "
    @update:selected-schema-name="$emit('update-generator-schema-name', $event)"
    @update:selected-frontend-target="
      $emit('update-generator-frontend-target', $event)
    "
    @update:query="$emit('update-generator-query', $event)"
    @select-file="$emit('select-generator-file', $event)"
    @reset-filters="$emit('reset-generator-filters')"
    @refresh-preview="$emit('refresh-generator-preview')"
    @apply-preview="$emit('apply-generator-preview')"
  />

  <DictionaryWorkspaceMain
    v-else-if="currentWorkspaceKind === 'dictionary'"
    :t="t"
    :module-ready="dictionaryModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterDictionaryWorkspace"
    :can-view-dictionaries="canViewDictionaries"
    :loading="dictionaryLoading"
    :error-message="dictionaryErrorMessage"
    :query-fields="enterpriseDictionaryQueryFields"
    :table-columns="enterpriseDictionaryTableColumns"
    :items="enterpriseDictionaryTableItems"
    :item-count-label="dictionaryCountLabel"
    :empty-title="t('app.dictionary.emptyTitle')"
    :empty-description="t('app.dictionary.emptyDescription')"
    :current-query-summary="currentQuerySummary"
    :copy="enterpriseCrudCopy"
    @search="$emit('dictionary-search', $event)"
    @reset="$emit('dictionary-reset')"
    @row-click="$emit('dictionary-row-click', $event)"
  />

  <DepartmentWorkspaceMain
    v-else-if="currentWorkspaceKind === 'department'"
    :t="t"
    :module-ready="departmentModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterDepartmentWorkspace"
    :can-view-departments="canViewDepartments"
    :loading="departmentLoading"
    :error-message="departmentErrorMessage"
    :query-fields="enterpriseDepartmentQueryFields"
    :table-columns="enterpriseDepartmentTableColumns"
    :items="enterpriseDepartmentTableItems"
    :item-count-label="departmentCountLabel"
    :empty-title="t('app.department.emptyTitle')"
    :empty-description="t('app.department.emptyDescription')"
    :current-query-summary="currentQuerySummary"
    :copy="enterpriseCrudCopy"
    @search="$emit('department-search', $event)"
    @reset="$emit('department-reset')"
    @row-click="$emit('department-row-click', $event)"
  />

  <PostWorkspaceMain
    v-else-if="currentWorkspaceKind === 'post'"
    :t="t"
    :module-ready="postModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterPostWorkspace"
    :can-view-posts="canViewPosts"
    :loading="postLoading"
    :error-message="postErrorMessage"
    :query-fields="enterprisePostQueryFields"
    :table-columns="enterprisePostTableColumns"
    :items="enterprisePostTableItems"
    :item-count-label="postCountLabel"
    :empty-title="t('app.post.emptyTitle')"
    :empty-description="t('app.post.emptyDescription')"
    :current-query-summary="currentQuerySummary"
    :copy="enterpriseCrudCopy"
    @search="$emit('post-search', $event)"
    @reset="$emit('post-reset')"
    @row-click="$emit('post-row-click', $event)"
  />

  <MenuWorkspaceMain
    v-else-if="currentWorkspaceKind === 'menu'"
    :t="t"
    :module-ready="menuModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterMenuWorkspace"
    :can-view-menus="canViewMenus"
    :loading="menuLoading"
    :error-message="menuErrorMessage"
    :query-fields="enterpriseMenuQueryFields"
    :table-columns="enterpriseMenuTableColumns"
    :items="enterpriseMenuTableItems"
    :item-count-label="menuCountLabel"
    :empty-title="t('app.menu.emptyTitle')"
    :empty-description="t('app.menu.emptyDescription')"
    :current-query-summary="currentQuerySummary"
    :copy="enterpriseCrudCopy"
    @search="$emit('menu-search', $event)"
    @reset="$emit('menu-reset')"
    @row-click="$emit('menu-row-click', $event)"
  />

  <NotificationWorkspaceMain
    v-else-if="currentWorkspaceKind === 'notification'"
    :t="t"
    :module-ready="notificationModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterNotificationWorkspace"
    :can-view-notifications="canViewNotifications"
    :loading="notificationLoading"
    :error-message="notificationErrorMessage"
    :query-fields="enterpriseNotificationQueryFields"
    :table-columns="enterpriseNotificationTableColumns"
    :items="enterpriseNotificationTableItems"
    :item-count-label="notificationCountLabel"
    :empty-title="t('app.notification.emptyTitle')"
    :empty-description="t('app.notification.emptyDescription')"
    :current-query-summary="currentQuerySummary"
    :copy="enterpriseCrudCopy"
    @search="$emit('notification-search', $event)"
    @reset="$emit('notification-reset')"
    @row-click="$emit('notification-row-click', $event)"
  />

  <OperationLogWorkspaceMain
    v-else-if="currentWorkspaceKind === 'operation-log'"
    :t="t"
    :module-ready="operationLogModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterOperationLogWorkspace"
    :can-view-operation-logs="canViewOperationLogs"
    :loading="operationLogLoading"
    :error-message="operationLogErrorMessage"
    :query-fields="enterpriseOperationLogQueryFields"
    :table-columns="enterpriseOperationLogTableColumns"
    :items="enterpriseOperationLogTableItems"
    :item-count-label="operationLogCountLabel"
    :empty-title="t('app.operationLog.emptyTitle')"
    :empty-description="t('app.operationLog.emptyDescription')"
    :current-query-summary="currentQuerySummary"
    :copy="enterpriseCrudCopy"
    @search="$emit('operation-log-search', $event)"
    @reset="$emit('operation-log-reset')"
    @row-click="$emit('operation-log-row-click', $event)"
  />

  <RoleWorkspaceMain
    v-else-if="currentWorkspaceKind === 'role'"
    :t="t"
    :module-ready="roleModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterRoleWorkspace"
    :can-view-roles="canViewRoles"
    :loading="roleLoading"
    :error-message="roleErrorMessage"
    :query-fields="enterpriseRoleQueryFields"
    :table-columns="enterpriseRoleTableColumns"
    :items="enterpriseRoleTableItems"
    :item-count-label="roleCountLabel"
    :empty-title="t('app.role.emptyTitle')"
    :empty-description="t('app.role.emptyDescription')"
    :current-query-summary="currentQuerySummary"
    :copy="enterpriseCrudCopy"
    @search="$emit('role-search', $event)"
    @reset="$emit('role-reset')"
    @row-click="$emit('role-row-click', $event)"
  />

  <SettingWorkspaceMain
    v-else-if="currentWorkspaceKind === 'setting'"
    :t="t"
    :module-ready="settingModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterSettingWorkspace"
    :can-view-settings="canViewSettings"
    :loading="settingLoading"
    :error-message="settingErrorMessage"
    :query-fields="enterpriseSettingQueryFields"
    :table-columns="enterpriseSettingTableColumns"
    :items="enterpriseSettingTableItems"
    :item-count-label="settingCountLabel"
    :empty-title="t('app.setting.emptyTitle')"
    :empty-description="t('app.setting.emptyDescription')"
    :current-query-summary="currentQuerySummary"
    :copy="enterpriseCrudCopy"
    @search="$emit('setting-search', $event)"
    @reset="$emit('setting-reset')"
    @row-click="$emit('setting-row-click', $event)"
  />

  <TenantWorkspaceMain
    v-else-if="currentWorkspaceKind === 'tenant'"
    :t="t"
    :module-ready="tenantModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :is-super-admin="tenantIsSuperAdmin"
    :can-enter-workspace="canEnterTenantWorkspace"
    :can-view-tenants="canViewTenants"
    :loading="tenantLoading"
    :error-message="tenantErrorMessage"
    :query-fields="enterpriseTenantQueryFields"
    :table-columns="enterpriseTenantTableColumns"
    :items="enterpriseTenantTableItems"
    :item-count-label="tenantCountLabel"
    :empty-title="t('app.tenant.emptyTitle')"
    :empty-description="t('app.tenant.emptyDescription')"
    :current-query-summary="currentQuerySummary"
    :copy="enterpriseCrudCopy"
    @search="$emit('tenant-search', $event)"
    @reset="$emit('tenant-reset')"
    @row-click="$emit('tenant-row-click', $event)"
  />

  <UserWorkspaceMain
    v-else-if="currentWorkspaceKind === 'user'"
    :t="t"
    :module-ready="userModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterUserWorkspace"
    :can-view-users="canViewUsers"
    :loading="userLoading"
    :error-message="userErrorMessage"
    :query-fields="enterpriseUserQueryFields"
    :table-columns="enterpriseUserTableColumns"
    :items="enterpriseUserTableItems"
    :item-count-label="userCountLabel"
    :empty-title="t('app.user.emptyTitle')"
    :empty-description="t('app.user.emptyDescription')"
    :current-query-summary="currentQuerySummary"
    :copy="enterpriseCrudCopy"
    @search="$emit('user-search', $event)"
    @reset="$emit('user-reset')"
    @row-click="$emit('user-row-click', $event)"
  />

  <ShellWorkspaceStatusMain
    v-else-if="currentWorkspaceKind === 'placeholder'"
    mode="placeholder"
    :title="selectedNavigationItemName"
    :subtitle="placeholderWorkspaceCopy"
    :badge="currentModuleStatusLabel"
    :current-page="selectedNavigationItemName"
    :current-path="currentNavigationPath"
    :module-status-label="currentModuleStatusLabel"
    :auth-status-label="authStatusLabel"
    :permission-count="permissionCount"
    :module-code-label="currentModuleCodeLabel"
    :back-button-label="t('app.placeholder.backToCustomer')"
    :show-back-button="showPlaceholderBackButton"
    @back-to-customer="$emit('back-to-customer')"
  />

  <CustomerWorkspaceMain
    v-else
    :t="t"
    :module-ready="customerModuleReady"
    :auth-module-ready="authModuleReady"
    :is-authenticated="isAuthenticated"
    :can-enter-workspace="canEnterCustomerWorkspace"
    :can-view-customers="canViewCustomers"
    :loading="customerLoading"
    :error-message="customerErrorMessage"
    :query-fields="enterpriseQueryFields"
    :table-columns="enterpriseTableColumns"
    :items="enterpriseTableItems"
    :table-actions="enterpriseTableActions"
    :item-count-label="customerCountLabel"
    :empty-title="t('app.workspace.emptyTitle')"
    :empty-description="t('app.workspace.emptyDescription')"
    :current-query-summary="currentQuerySummary"
    :copy="enterpriseCrudCopy"
    :footer-status-label="customerFooterStatusLabel"
    :pagination-summary="customerPaginationSummary"
    :page-size-value="customerListPageSize"
    :sort-value="customerListSortValue"
    :page-input-value="customerPageInputValue"
    :page-size-options="customerPageSizeOptions"
    :sort-options="customerSortOptions"
    :can-go-to-previous-page="canGoToPreviousCustomerPage"
    :can-go-to-next-page="canGoToNextCustomerPage"
    :can-jump-to-page="canJumpToCustomerPage"
    @search="$emit('customer-search', $event)"
    @reset="$emit('customer-reset')"
    @action="$emit('customer-action', $event)"
    @row-click="$emit('customer-row-click', $event)"
    @change-page-size="$emit('change-customer-page-size', $event)"
    @change-sort="$emit('change-customer-sort', $event)"
    @go-first-page="$emit('go-first-customer-page')"
    @go-previous-page="$emit('go-previous-customer-page')"
    @go-next-page="$emit('go-next-customer-page')"
    @go-last-page="$emit('go-last-customer-page')"
    @update-page-input="$emit('update-customer-page-input', $event)"
    @submit-page-jump="$emit('submit-customer-page-jump')"
  />
</template>
