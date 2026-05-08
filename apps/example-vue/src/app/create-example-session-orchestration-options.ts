import type { useAuthSessionWorkspace } from "../workspaces/use-auth-session-workspace"
import type { useCustomerWorkspace } from "../workspaces/use-customer-workspace"
import type { useDepartmentWorkspace } from "../workspaces/use-department-workspace"
import type { useDictionaryWorkspace } from "../workspaces/use-dictionary-workspace"
import type { useFileWorkspace } from "../workspaces/use-file-workspace"
import type { useMenuWorkspace } from "../workspaces/use-menu-workspace"
import type { useNotificationWorkspace } from "../workspaces/use-notification-workspace"
import type { useOperationLogWorkspace } from "../workspaces/use-operation-log-workspace"
import type { usePostWorkspace } from "../workspaces/use-post-workspace"
import type { useRoleWorkspace } from "../workspaces/use-role-workspace"
import type { useSettingWorkspace } from "../workspaces/use-setting-workspace"
import type { useTenantWorkspace } from "../workspaces/use-tenant-workspace"
import type { useUserWorkspace } from "../workspaces/use-user-workspace"
import type { useWorkflowWorkspace } from "../workspaces/use-workflow-workspace"
import type { AppTranslate } from "./app-shell-helpers"
import type { useExampleRuntimeState } from "./use-example-runtime-state"
import type { UseExampleSessionOrchestrationOptions } from "./use-example-session-orchestration"

interface ExampleSessionWorkspaces {
  customerWorkspace: ReturnType<typeof useCustomerWorkspace>
  dictionaryWorkspace: ReturnType<typeof useDictionaryWorkspace>
  departmentWorkspace: ReturnType<typeof useDepartmentWorkspace>
  fileWorkspace: ReturnType<typeof useFileWorkspace>
  menuWorkspace: ReturnType<typeof useMenuWorkspace>
  notificationWorkspace: ReturnType<typeof useNotificationWorkspace>
  operationLogWorkspace: ReturnType<typeof useOperationLogWorkspace>
  postWorkspace: ReturnType<typeof usePostWorkspace>
  roleWorkspace: ReturnType<typeof useRoleWorkspace>
  sessionWorkspace: ReturnType<typeof useAuthSessionWorkspace>
  settingWorkspace: ReturnType<typeof useSettingWorkspace>
  tenantWorkspace: ReturnType<typeof useTenantWorkspace>
  userWorkspace: ReturnType<typeof useUserWorkspace>
  workflowWorkspace: ReturnType<typeof useWorkflowWorkspace>
}

interface CreateExampleSessionOrchestrationOptionsInput {
  t: AppTranslate
  runtimeState: ReturnType<typeof useExampleRuntimeState>
  enterpriseFormMode: UseExampleSessionOrchestrationOptions["enterpriseFormMode"]
  notificationQueryValues: UseExampleSessionOrchestrationOptions["notificationQueryValues"]
  workspaces: ExampleSessionWorkspaces
}

export const createExampleSessionOrchestrationOptions = (
  input: CreateExampleSessionOrchestrationOptionsInput,
): UseExampleSessionOrchestrationOptions => {
  const { runtimeState, workspaces } = input

  return {
    t: input.t,
    platform: runtimeState.platform,
    authIdentity: runtimeState.authIdentity,
    registeredModuleCodes: runtimeState.registeredModuleCodes,
    loading: runtimeState.loading,
    authLoading: runtimeState.authLoading,
    errorMessage: runtimeState.errorMessage,
    authErrorMessage: runtimeState.authErrorMessage,
    envName: runtimeState.envName,
    loginForm: runtimeState.loginForm,
    authModuleReady: runtimeState.authModuleReady,
    customerModuleReady: runtimeState.customerModuleReady,
    departmentModuleReady: runtimeState.departmentModuleReady,
    postModuleReady: runtimeState.postModuleReady,
    fileModuleReady: runtimeState.fileModuleReady,
    menuModuleReady: runtimeState.menuModuleReady,
    notificationModuleReady: runtimeState.notificationModuleReady,
    operationLogModuleReady: runtimeState.operationLogModuleReady,
    roleModuleReady: runtimeState.roleModuleReady,
    settingModuleReady: runtimeState.settingModuleReady,
    tenantModuleReady: runtimeState.tenantModuleReady,
    userModuleReady: runtimeState.userModuleReady,
    dictionaryModuleReady: runtimeState.dictionaryModuleReady,
    workflowModuleReady: runtimeState.workflowModuleReady,
    enterpriseFormMode: input.enterpriseFormMode,
    notificationQueryValues: input.notificationQueryValues,
    reloadFiles: workspaces.fileWorkspace.reloadFiles,
    reloadNotifications: workspaces.notificationWorkspace.reloadNotifications,
    reloadDictionaries: workspaces.dictionaryWorkspace.reloadDictionaries,
    reloadCustomers: workspaces.customerWorkspace.reloadCustomers,
    reloadDepartments: workspaces.departmentWorkspace.reloadDepartments,
    reloadSessions: workspaces.sessionWorkspace.reloadSessions,
    reloadPosts: workspaces.postWorkspace.reloadPosts,
    reloadMenus: workspaces.menuWorkspace.reloadMenus,
    reloadOperationLogs: workspaces.operationLogWorkspace.reloadOperationLogs,
    reloadRoles: workspaces.roleWorkspace.reloadRoles,
    reloadSettings: workspaces.settingWorkspace.reloadSettings,
    reloadTenants: workspaces.tenantWorkspace.reloadTenants,
    reloadUsers: workspaces.userWorkspace.reloadUsers,
    reloadWorkflowDefinitions:
      workspaces.workflowWorkspace.reloadWorkflowDefinitions,
    clearCustomerWorkspace: workspaces.customerWorkspace.clearWorkspace,
    clearDictionaryOptions: workspaces.dictionaryWorkspace.clearWorkspace,
    clearFileWorkspace: workspaces.fileWorkspace.clearWorkspace,
    clearNotificationWorkspace: workspaces.notificationWorkspace.clearWorkspace,
    clearDepartmentWorkspace: workspaces.departmentWorkspace.clearWorkspace,
    clearSessionWorkspace: workspaces.sessionWorkspace.clearWorkspace,
    clearPostWorkspace: workspaces.postWorkspace.clearWorkspace,
    clearMenuWorkspace: workspaces.menuWorkspace.clearWorkspace,
    clearOperationLogWorkspace: workspaces.operationLogWorkspace.clearWorkspace,
    clearRoleWorkspace: workspaces.roleWorkspace.clearWorkspace,
    clearSettingWorkspace: workspaces.settingWorkspace.clearWorkspace,
    clearTenantWorkspace: workspaces.tenantWorkspace.clearWorkspace,
    clearUserWorkspace: workspaces.userWorkspace.clearWorkspace,
    clearWorkflowDefinitions:
      workspaces.workflowWorkspace.clearWorkflowDefinitions,
    resetDepartmentQuery: workspaces.departmentWorkspace.resetQuery,
    resetPostQuery: workspaces.postWorkspace.resetQuery,
    resetMenuQuery: workspaces.menuWorkspace.resetQuery,
    resetOperationLogQuery: workspaces.operationLogWorkspace.resetQuery,
    resetRoleQuery: workspaces.roleWorkspace.resetQuery,
    resetSettingQuery: workspaces.settingWorkspace.resetQuery,
    resetTenantQuery: workspaces.tenantWorkspace.resetQuery,
    handleUserReset: workspaces.userWorkspace.handleReset,
    onMountedBehavior: "reload-workspaces",
  }
}
