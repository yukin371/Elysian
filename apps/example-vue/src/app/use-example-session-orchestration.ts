import { onMounted, type Ref } from "vue"

import {
  clearAccessToken,
  fetchPlatform,
  fetchSystemModules,
  login,
  logout,
  refreshAuth,
  type AuthIdentityResponse,
  type PlatformResponse,
} from "../lib/platform-api"

type AppTranslate = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface LoginFormState {
  username: string
  password: string
}

interface UseExampleSessionOrchestrationOptions {
  t: AppTranslate
  platform: Ref<PlatformResponse | null>
  authIdentity: Ref<AuthIdentityResponse | null>
  registeredModuleCodes: Ref<string[]>
  loading: Ref<boolean>
  authLoading: Ref<boolean>
  errorMessage: Ref<string>
  authErrorMessage: Ref<string>
  envName: Ref<string>
  loginForm: Ref<LoginFormState>
  authModuleReady: Ref<boolean>
  customerModuleReady: Ref<boolean>
  departmentModuleReady: Ref<boolean>
  fileModuleReady: Ref<boolean>
  menuModuleReady: Ref<boolean>
  notificationModuleReady: Ref<boolean>
  operationLogModuleReady: Ref<boolean>
  roleModuleReady: Ref<boolean>
  settingModuleReady: Ref<boolean>
  tenantModuleReady: Ref<boolean>
  userModuleReady: Ref<boolean>
  dictionaryModuleReady: Ref<boolean>
  workflowModuleReady: Ref<boolean>
  enterpriseFormMode: Ref<string>
  notificationQueryValues: Ref<Record<string, unknown>>
  reloadFiles: () => Promise<void>
  reloadNotifications: () => Promise<void>
  reloadDictionaries: () => Promise<void>
  reloadCustomers: () => Promise<void>
  reloadDepartments: () => Promise<void>
  reloadMenus: () => Promise<void>
  reloadOperationLogs: () => Promise<void>
  reloadRoles: () => Promise<void>
  reloadSettings: () => Promise<void>
  reloadTenants: () => Promise<void>
  reloadUsers: () => Promise<void>
  reloadWorkflowDefinitions: () => Promise<void>
  clearCustomerWorkspace: () => void
  clearDictionaryOptions: () => void
  clearFileWorkspace: () => void
  clearNotificationWorkspace: () => void
  clearDepartmentWorkspace: () => void
  clearMenuWorkspace: () => void
  clearOperationLogWorkspace: () => void
  clearRoleWorkspace: () => void
  clearSettingWorkspace: () => void
  clearTenantWorkspace: () => void
  clearUserWorkspace: () => void
  clearWorkflowDefinitions: () => void
  resetDepartmentQuery: () => void
  resetMenuQuery: () => void
  resetOperationLogQuery: () => void
  resetRoleQuery: () => void
  resetSettingQuery: () => void
  resetTenantQuery: () => void
  handleUserReset: () => void
}

export const useExampleSessionOrchestration = (
  options: UseExampleSessionOrchestrationOptions,
) => {
  const isRecoverableAuthError = (error: unknown) =>
    error instanceof Error &&
    (error.message.includes("[AUTH_REFRESH_TOKEN_REQUIRED]") ||
      error.message.includes("[AUTH_REFRESH_TOKEN_INVALID]") ||
      error.message.includes("[AUTH_REFRESH_TOKEN_EXPIRED]") ||
      error.message.includes("[AUTH_ACCESS_TOKEN_REQUIRED]") ||
      error.message.includes("[AUTH_ACCESS_TOKEN_INVALID]"))

  const reloadAllWorkspaces = async () => {
    await options.reloadFiles()
    await options.reloadNotifications()
    await options.reloadDictionaries()
    await options.reloadCustomers()
    await options.reloadDepartments()
    await options.reloadMenus()
    await options.reloadOperationLogs()
    await options.reloadRoles()
    await options.reloadSettings()
    await options.reloadTenants()
    await options.reloadUsers()
    await options.reloadWorkflowDefinitions()
  }

  const restoreSession = async () => {
    if (!options.authModuleReady.value) {
      options.authIdentity.value = null
      options.authErrorMessage.value = ""
      return
    }

    options.authLoading.value = true
    options.authErrorMessage.value = ""

    try {
      options.authIdentity.value = await refreshAuth()
    } catch (error) {
      clearAccessToken()
      options.authIdentity.value = null

      if (!isRecoverableAuthError(error)) {
        options.authErrorMessage.value =
          error instanceof Error
            ? error.message
            : options.t("app.error.restoreSession")
      }
    } finally {
      options.authLoading.value = false
    }
  }

  const submitLogin = async () => {
    if (!options.authModuleReady.value || options.authLoading.value) {
      return
    }

    options.authLoading.value = true
    options.authErrorMessage.value = ""

    try {
      options.authIdentity.value = await login(options.loginForm.value)
      await reloadAllWorkspaces()
    } catch (error) {
      options.authIdentity.value = null
      options.authErrorMessage.value =
        error instanceof Error ? error.message : options.t("app.error.signIn")
    } finally {
      options.authLoading.value = false
    }
  }

  const submitLogout = async () => {
    if (!options.authModuleReady.value || options.authLoading.value) {
      return
    }

    options.authLoading.value = true
    options.authErrorMessage.value = ""

    try {
      await logout()
    } catch (error) {
      options.authErrorMessage.value =
        error instanceof Error ? error.message : options.t("app.error.signOut")
    } finally {
      options.authIdentity.value = null
      clearAccessToken()
      options.clearCustomerWorkspace()
      options.clearDictionaryOptions()
      options.clearFileWorkspace()
      options.clearNotificationWorkspace()
      options.clearDepartmentWorkspace()
      options.clearMenuWorkspace()
      options.clearOperationLogWorkspace()
      options.clearRoleWorkspace()
      options.clearSettingWorkspace()
      options.clearTenantWorkspace()
      options.clearUserWorkspace()
      options.clearWorkflowDefinitions()
      options.enterpriseFormMode.value = "create"
      options.resetDepartmentQuery()
      options.resetMenuQuery()
      options.resetOperationLogQuery()
      options.resetRoleQuery()
      options.resetSettingQuery()
      options.resetTenantQuery()
      options.handleUserReset()
      options.notificationQueryValues.value = {}
      options.authLoading.value = false
    }
  }

  const initializeApp = async () => {
    try {
      const [platformPayload, modulePayload] = await Promise.all([
        fetchPlatform(),
        fetchSystemModules(),
      ])

      options.platform.value = platformPayload
      options.envName.value = modulePayload.env
      options.registeredModuleCodes.value = modulePayload.modules
      options.authModuleReady.value = modulePayload.modules.includes("auth")
      options.customerModuleReady.value =
        modulePayload.modules.includes("customer")
      options.departmentModuleReady.value =
        modulePayload.modules.includes("department")
      options.fileModuleReady.value = modulePayload.modules.includes("file")
      options.menuModuleReady.value = modulePayload.modules.includes("menu")
      options.notificationModuleReady.value =
        modulePayload.modules.includes("notification")
      options.operationLogModuleReady.value =
        modulePayload.modules.includes("operation-log")
      options.roleModuleReady.value = modulePayload.modules.includes("role")
      options.settingModuleReady.value =
        modulePayload.modules.includes("setting")
      options.tenantModuleReady.value = modulePayload.modules.includes("tenant")
      options.userModuleReady.value = modulePayload.modules.includes("user")
      options.dictionaryModuleReady.value =
        modulePayload.modules.includes("dictionary")
      options.workflowModuleReady.value =
        modulePayload.modules.includes("workflow")

      await restoreSession()
      await options.reloadFiles()
      await options.reloadNotifications()
      await options.reloadDictionaries()

      if (options.customerModuleReady.value) {
        if (options.authModuleReady.value) {
          options.enterpriseFormMode.value = "detail"
        } else {
          options.enterpriseFormMode.value = "create"
        }
      }

      await options.reloadCustomers()
      await options.reloadDepartments()
      await options.reloadMenus()
      await options.reloadOperationLogs()
      await options.reloadRoles()
      await options.reloadSettings()
      await options.reloadTenants()
      await options.reloadUsers()
      await options.reloadWorkflowDefinitions()
    } catch (error) {
      options.errorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadPlatform")
    } finally {
      options.loading.value = false
    }
  }

  onMounted(async () => {
    await initializeApp()
  })

  return {
    isRecoverableAuthError,
    restoreSession,
    submitLogin,
    submitLogout,
  }
}
