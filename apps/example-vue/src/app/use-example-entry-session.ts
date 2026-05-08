import {
  clearAccessToken,
  fetchPlatform,
  fetchSystemModules,
  login,
  refreshAuth,
} from "../lib/platform-api"
import type { AppTranslate } from "./app-shell-helpers"
import { isRecoverableAuthError } from "./example-auth-errors"
import type { useExampleRuntimeState } from "./use-example-runtime-state"
import { isWorkflowModuleRegistered } from "./use-example-session-orchestration"

interface UseExampleEntrySessionOptions {
  t: AppTranslate
  runtimeState: ReturnType<typeof useExampleRuntimeState>
}

export const useExampleEntrySession = ({
  t,
  runtimeState,
}: UseExampleEntrySessionOptions) => {
  const restoreSession = async () => {
    if (!runtimeState.authModuleReady.value) {
      runtimeState.authIdentity.value = null
      runtimeState.authErrorMessage.value = ""
      return
    }

    runtimeState.authLoading.value = true
    runtimeState.authErrorMessage.value = ""

    try {
      runtimeState.authIdentity.value = await refreshAuth()
    } catch (error) {
      clearAccessToken()
      runtimeState.authIdentity.value = null

      if (!isRecoverableAuthError(error)) {
        runtimeState.authErrorMessage.value =
          error instanceof Error ? error.message : t("app.error.restoreSession")
      }
    } finally {
      runtimeState.authLoading.value = false
    }
  }

  const initializeApp = async () => {
    try {
      const [platformPayload, modulePayload] = await Promise.all([
        fetchPlatform(),
        fetchSystemModules(),
      ])

      const registeredModules = modulePayload.modules

      runtimeState.platform.value = platformPayload
      runtimeState.envName.value = modulePayload.env
      runtimeState.registeredModuleCodes.value = registeredModules
      runtimeState.authModuleReady.value = registeredModules.includes("auth")
      runtimeState.customerModuleReady.value =
        registeredModules.includes("customer")
      runtimeState.departmentModuleReady.value =
        registeredModules.includes("department")
      runtimeState.postModuleReady.value = registeredModules.includes("post")
      runtimeState.fileModuleReady.value = registeredModules.includes("file")
      runtimeState.menuModuleReady.value = registeredModules.includes("menu")
      runtimeState.notificationModuleReady.value =
        registeredModules.includes("notification")
      runtimeState.operationLogModuleReady.value =
        registeredModules.includes("operation-log")
      runtimeState.roleModuleReady.value = registeredModules.includes("role")
      runtimeState.settingModuleReady.value =
        registeredModules.includes("setting")
      runtimeState.tenantModuleReady.value =
        registeredModules.includes("tenant")
      runtimeState.userModuleReady.value = registeredModules.includes("user")
      runtimeState.dictionaryModuleReady.value =
        registeredModules.includes("dictionary")
      runtimeState.workflowModuleReady.value =
        isWorkflowModuleRegistered(registeredModules)

      await restoreSession()
    } catch (error) {
      runtimeState.errorMessage.value =
        error instanceof Error ? error.message : t("app.error.loadPlatform")
    } finally {
      runtimeState.loading.value = false
    }
  }

  const submitLogin = async () => {
    if (!runtimeState.authModuleReady.value || runtimeState.authLoading.value) {
      return
    }

    runtimeState.authLoading.value = true
    runtimeState.authErrorMessage.value = ""

    try {
      runtimeState.authIdentity.value = await login(
        runtimeState.loginForm.value,
      )
    } catch (error) {
      runtimeState.authIdentity.value = null
      runtimeState.authErrorMessage.value =
        error instanceof Error ? error.message : t("app.error.signIn")
    } finally {
      runtimeState.authLoading.value = false
    }
  }

  return {
    initializeApp,
    restoreSession,
    submitLogin,
  }
}
