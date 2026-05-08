<script setup lang="ts">
import { ConfigProvider as TConfigProvider } from "tdesign-vue-next/es/config-provider"
import { onMounted } from "vue"
import { isRecoverableAuthError } from "./app/example-auth-errors"
import { useExampleAppBootstrap } from "./app/use-example-app-bootstrap"
import { useExampleRuntimeState } from "./app/use-example-runtime-state"
import ExampleAppStageGate from "./components/layout/ExampleAppStageGate.vue"
import {
  clearAccessToken,
  fetchPlatform,
  fetchSystemModules,
  login,
  refreshAuth,
} from "./lib/platform-api"

const { locale, localizers, t, tdesignGlobalConfig } = useExampleAppBootstrap()
const exampleRuntimeState = useExampleRuntimeState()

const {
  authErrorMessage,
  authIdentity,
  authLoading,
  authModuleReady,
  envName,
  errorMessage,
  exampleAppLayout,
  loading,
  loginForm,
} = exampleRuntimeState

const handleRecoverableAuthError = (error: unknown) => {
  if (isRecoverableAuthError(error)) {
    authIdentity.value = null
  }
}

const restoreSession = async () => {
  if (!authModuleReady.value) {
    authIdentity.value = null
    authErrorMessage.value = ""
    return
  }

  authLoading.value = true
  authErrorMessage.value = ""

  try {
    authIdentity.value = await refreshAuth()
  } catch (error) {
    clearAccessToken()
    authIdentity.value = null

    if (!isRecoverableAuthError(error)) {
      authErrorMessage.value =
        error instanceof Error ? error.message : t("app.error.restoreSession")
    }
  } finally {
    authLoading.value = false
  }
}

const initializeApp = async () => {
  try {
    const [platformPayload, modulePayload] = await Promise.all([
      fetchPlatform(),
      fetchSystemModules(),
    ])

    const registeredModules = modulePayload.modules

    exampleRuntimeState.platform.value = platformPayload
    envName.value = modulePayload.env
    exampleRuntimeState.registeredModuleCodes.value = registeredModules
    authModuleReady.value = registeredModules.includes("auth")
    exampleRuntimeState.customerModuleReady.value =
      registeredModules.includes("customer")
    exampleRuntimeState.departmentModuleReady.value =
      registeredModules.includes("department")
    exampleRuntimeState.postModuleReady.value =
      registeredModules.includes("post")
    exampleRuntimeState.fileModuleReady.value =
      registeredModules.includes("file")
    exampleRuntimeState.menuModuleReady.value =
      registeredModules.includes("menu")
    exampleRuntimeState.notificationModuleReady.value =
      registeredModules.includes("notification")
    exampleRuntimeState.operationLogModuleReady.value =
      registeredModules.includes("operation-log")
    exampleRuntimeState.roleModuleReady.value =
      registeredModules.includes("role")
    exampleRuntimeState.settingModuleReady.value =
      registeredModules.includes("setting")
    exampleRuntimeState.tenantModuleReady.value =
      registeredModules.includes("tenant")
    exampleRuntimeState.userModuleReady.value =
      registeredModules.includes("user")
    exampleRuntimeState.dictionaryModuleReady.value =
      registeredModules.includes("dictionary")
    exampleRuntimeState.workflowModuleReady.value =
      registeredModules.includes("workflow-definition") ||
      registeredModules.includes("workflow")

    await restoreSession()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadPlatform")
  } finally {
    loading.value = false
  }
}

const submitLogin = async () => {
  if (!authModuleReady.value || authLoading.value) {
    return
  }

  authLoading.value = true
  authErrorMessage.value = ""

  try {
    authIdentity.value = await login(loginForm.value)
  } catch (error) {
    authIdentity.value = null
    authErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.signIn")
  } finally {
    authLoading.value = false
  }
}

onMounted(async () => {
  await initializeApp()
})
</script>

<template>
  <TConfigProvider :global-config="tdesignGlobalConfig">
    <ExampleAppStageGate
      :t="t"
      :loading="loading"
      :error-message="errorMessage"
      :layout="exampleAppLayout"
      :title="t('app.shell.title')"
      :subtitle="t('app.shell.subtitle')"
      :env-name="envName"
      :auth-module-ready="authModuleReady"
      :auth-loading="authLoading"
      :username="loginForm.username"
      :credential="loginForm.password"
      :auth-error-message="authErrorMessage"
      :locale="locale"
      :localizers="localizers"
      :runtime-state="exampleRuntimeState"
      :on-recoverable-auth-error="handleRecoverableAuthError"
      @update:username="loginForm.username = $event"
      @update:credential="loginForm.password = $event"
      @submit-login="submitLogin"
    />
  </TConfigProvider>
</template>
