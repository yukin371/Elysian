import type { useAuthSessionWorkspace } from "../workspaces/use-auth-session-workspace"
import type { useCustomerWorkspace } from "../workspaces/use-customer-workspace"
import type { useDepartmentWorkspace } from "../workspaces/use-department-workspace"
import type { useDictionaryWorkspace } from "../workspaces/use-dictionary-workspace"
import type { useFileWorkspace } from "../workspaces/use-file-workspace"
import type { useGeneratorPreviewWorkspace } from "../workspaces/use-generator-preview-workspace"
import type { useMenuWorkspace } from "../workspaces/use-menu-workspace"
import type { useNotificationWorkspace } from "../workspaces/use-notification-workspace"
import type { useOperationLogWorkspace } from "../workspaces/use-operation-log-workspace"
import type { useRoleWorkspace } from "../workspaces/use-role-workspace"
import type { useSettingWorkspace } from "../workspaces/use-setting-workspace"
import type { useTenantWorkspace } from "../workspaces/use-tenant-workspace"
import type { useUserWorkspace } from "../workspaces/use-user-workspace"
import type { useWorkflowWorkspace } from "../workspaces/use-workflow-workspace"
import type { AppTranslate } from "./app-shell-helpers"
import type { useExampleNavigation } from "./use-example-navigation"
import type { useExampleRuntimeState } from "./use-example-runtime-state"
import type { UseExampleShellMetaOptions } from "./use-example-shell-meta"

interface ExampleShellMetaWorkspaces {
  customerWorkspace: ReturnType<typeof useCustomerWorkspace>
  dictionaryWorkspace: ReturnType<typeof useDictionaryWorkspace>
  departmentWorkspace: ReturnType<typeof useDepartmentWorkspace>
  fileWorkspace: ReturnType<typeof useFileWorkspace>
  generatorPreviewWorkspace: ReturnType<typeof useGeneratorPreviewWorkspace>
  menuWorkspace: ReturnType<typeof useMenuWorkspace>
  notificationWorkspace: ReturnType<typeof useNotificationWorkspace>
  operationLogWorkspace: ReturnType<typeof useOperationLogWorkspace>
  roleWorkspace: ReturnType<typeof useRoleWorkspace>
  sessionWorkspace: ReturnType<typeof useAuthSessionWorkspace>
  settingWorkspace: ReturnType<typeof useSettingWorkspace>
  tenantWorkspace: ReturnType<typeof useTenantWorkspace>
  userWorkspace: ReturnType<typeof useUserWorkspace>
  workflowWorkspace: ReturnType<typeof useWorkflowWorkspace>
}

interface CreateExampleShellMetaOptionsInput {
  t: AppTranslate
  runtimeState: ReturnType<typeof useExampleRuntimeState>
  navigation: ReturnType<typeof useExampleNavigation>
  workspaces: ExampleShellMetaWorkspaces
}

export const createExampleShellMetaOptions = ({
  navigation,
  runtimeState,
  t,
  workspaces,
}: CreateExampleShellMetaOptionsInput): UseExampleShellMetaOptions => ({
  t,
  platform: runtimeState.platform,
  authIdentity: runtimeState.authIdentity,
  authModuleReady: runtimeState.authModuleReady,
  authLoading: runtimeState.authLoading,
  isAuthenticated: runtimeState.isAuthenticated,
  isCustomerWorkspace: navigation.isCustomerWorkspace,
  isDictionaryWorkspace: navigation.isDictionaryWorkspace,
  isDepartmentWorkspace: navigation.isDepartmentWorkspace,
  isSessionWorkspace: navigation.isSessionWorkspace,
  isMenuWorkspace: navigation.isMenuWorkspace,
  isNotificationWorkspace: navigation.isNotificationWorkspace,
  isOperationLogWorkspace: navigation.isOperationLogWorkspace,
  isRoleWorkspace: navigation.isRoleWorkspace,
  isSettingWorkspace: navigation.isSettingWorkspace,
  isTenantWorkspace: navigation.isTenantWorkspace,
  isUserWorkspace: navigation.isUserWorkspace,
  isWorkflowDefinitionsWorkspace: navigation.isWorkflowDefinitionsWorkspace,
  isFileWorkspace: navigation.isFileWorkspace,
  isGeneratorPreviewWorkspace: navigation.isGeneratorPreviewWorkspace,
  isRuntimeShellTab: navigation.isRuntimeShellTab,
  currentWorkspaceKind: navigation.currentWorkspaceKind,
  currentWorkspaceTitle: navigation.currentWorkspaceTitle,
  currentWorkspaceDescription: navigation.currentWorkspaceDescription,
  currentNavigationPath: navigation.currentNavigationPath,
  navigationItemCount: navigation.navigationItemCount,
  customerItems: workspaces.customerWorkspace.customerItems,
  dictionaryItems: workspaces.dictionaryWorkspace.filteredDictionaryTypes,
  departmentItems: workspaces.departmentWorkspace.filteredDepartmentItems,
  sessionItems: workspaces.sessionWorkspace.filteredSessionItems,
  menuItems: workspaces.menuWorkspace.filteredMenuItems,
  notificationItems: workspaces.notificationWorkspace.filteredNotificationItems,
  operationLogItems: workspaces.operationLogWorkspace.filteredOperationLogItems,
  roleItems: workspaces.roleWorkspace.filteredRoleItems,
  settingItems: workspaces.settingWorkspace.filteredSettingItems,
  tenantItems: workspaces.tenantWorkspace.filteredTenantItems,
  userItems: workspaces.userWorkspace.filteredUserItems,
  workflowDefinitions: workspaces.workflowWorkspace.workflowDefinitionCards,
  workflowDefinitionTotal: workspaces.workflowWorkspace.workflowTotal,
  fileItems: workspaces.fileWorkspace.filteredFileItems,
  generatorPreviewFiles:
    workspaces.generatorPreviewWorkspace.filteredPreviewFiles,
})
