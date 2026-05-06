<script setup lang="ts">
import { ConfigProvider as TConfigProvider } from "tdesign-vue-next/es/config-provider"
import { isRecoverableAuthError } from "./app/example-auth-errors"
import { useExampleAppBootstrap } from "./app/use-example-app-bootstrap"
import { useExampleAppShellOrchestration } from "./app/use-example-app-shell-orchestration"
import { useExampleRuntimeState } from "./app/use-example-runtime-state"
import { useExampleWorkspaces } from "./app/use-example-workspaces"
import ExampleAppStageGate from "./components/layout/ExampleAppStageGate.vue"

const { locale, localizers, t, tdesignGlobalConfig } = useExampleAppBootstrap()
const exampleRuntimeState = useExampleRuntimeState()
let submitLogout: () => Promise<void> = async () => {}

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

const exampleWorkspaces = useExampleWorkspaces({
  t,
  locale,
  localizers,
  runtimeState: exampleRuntimeState,
  onCurrentSessionRevoked: async () => {
    await submitLogout()
  },
  onRecoverableAuthError: handleRecoverableAuthError,
})

const {
  enterpriseShellCopy,
  enterpriseShellTabs,
  enterpriseShellUser,
  shellHeaderActionListeners,
  shellHeaderActionProps,
  shellWorkspaceDescription,
  shellWorkspaceMainListeners,
  shellWorkspaceMainProps,
  shellWorkspaceSecondaryListeners,
  shellWorkspaceSecondaryProps,
  shellWorkspaceTitle,
  submitLogin,
  submitLogout: resolvedSubmitLogout,
} = useExampleAppShellOrchestration({
  t,
  locale,
  localizers,
  runtimeState: exampleRuntimeState,
  navigation: exampleWorkspaces.exampleNavigation,
  gates: exampleWorkspaces.workspaceGates,
  workspaces: exampleWorkspaces,
})

submitLogout = resolvedSubmitLogout

const {
  enterpriseNavigation,
  enterpriseSelectedMenuKey,
  enterpriseSelectedTabKey,
  openSessionWorkspace,
  selectShellMenu,
  selectShellTab,
} = exampleWorkspaces.exampleNavigation
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
      :workspace-title="shellWorkspaceTitle"
      :workspace-description="shellWorkspaceDescription"
      :preset-label="t('app.shell.presetLabel')"
      :status="
        authModuleReady
          ? t('app.shell.status.sessionAware')
          : t('app.shell.status.preview')
      "
      :copy="enterpriseShellCopy"
      :navigation="enterpriseNavigation"
      :selected-menu-key="enterpriseSelectedMenuKey"
      :tabs="enterpriseShellTabs"
      :selected-tab-key="enterpriseSelectedTabKey"
      :user="enterpriseShellUser"
      :header-action-props="shellHeaderActionProps"
      :header-action-listeners="shellHeaderActionListeners"
      :workspace-main-props="shellWorkspaceMainProps"
      :workspace-main-listeners="shellWorkspaceMainListeners"
      :workspace-secondary-props="shellWorkspaceSecondaryProps"
      :workspace-secondary-listeners="shellWorkspaceSecondaryListeners"
      @update:username="loginForm.username = $event"
      @update:credential="loginForm.password = $event"
      @submit-login="submitLogin"
      @menu-select="selectShellMenu"
      @tab-select="selectShellTab"
      @user-click="openSessionWorkspace"
    />
  </TConfigProvider>
</template>
