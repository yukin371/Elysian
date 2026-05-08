<script setup lang="ts">
import { ConfigProvider as TConfigProvider } from "tdesign-vue-next/es/config-provider"
import { onMounted } from "vue"
import { isRecoverableAuthError } from "./app/example-auth-errors"
import { useExampleAppBootstrap } from "./app/use-example-app-bootstrap"
import { useExampleEntrySession } from "./app/use-example-entry-session"
import { useExampleRuntimeState } from "./app/use-example-runtime-state"
import ExampleAppStageGate from "./components/layout/ExampleAppStageGate.vue"

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

const { initializeApp, submitLogin } = useExampleEntrySession({
  t,
  runtimeState: exampleRuntimeState,
})

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
