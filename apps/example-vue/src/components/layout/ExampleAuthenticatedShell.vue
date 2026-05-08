<script setup lang="ts">
import { defineAsyncComponent, toRef } from "vue"

import type { AppTranslate } from "../../app/app-shell-helpers"
import type { useExampleAppBootstrap } from "../../app/use-example-app-bootstrap"
import { useExampleAppShellOrchestration } from "../../app/use-example-app-shell-orchestration"
import type { useExampleRuntimeState } from "../../app/use-example-runtime-state"
import { useExampleWorkspaces } from "../../app/use-example-workspaces"

const AdminShellLayout = defineAsyncComponent(
  () => import("./AdminShellLayout.vue"),
)

type ExampleBootstrapLocalizers = ReturnType<
  typeof useExampleAppBootstrap
>["localizers"]
type ExampleRuntimeState = ReturnType<typeof useExampleRuntimeState>

interface ExampleAuthenticatedShellProps {
  t: AppTranslate
  locale: string
  localizers: ExampleBootstrapLocalizers
  runtimeState: ExampleRuntimeState
  onRecoverableAuthError: (error: unknown) => void
}

const props = defineProps<ExampleAuthenticatedShellProps>()
const locale = toRef(props, "locale")

let submitLogout: () => Promise<void> = async () => {}

const exampleWorkspaces = useExampleWorkspaces({
  t: props.t,
  locale,
  localizers: props.localizers,
  runtimeState: props.runtimeState,
  onCurrentSessionRevoked: async () => {
    await submitLogout()
  },
  onRecoverableAuthError: props.onRecoverableAuthError,
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
  submitLogout: resolvedSubmitLogout,
} = useExampleAppShellOrchestration({
  t: props.t,
  locale,
  localizers: props.localizers,
  runtimeState: props.runtimeState,
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
  <AdminShellLayout
    :t="t"
    :locale="locale"
    :title="t('app.shell.title')"
    :subtitle="t('app.shell.subtitle')"
    :workspace-title="shellWorkspaceTitle"
    :workspace-description="shellWorkspaceDescription"
    :preset-label="t('app.shell.presetLabel')"
    :environment="runtimeState.envName.value"
    :status="
      runtimeState.authModuleReady.value
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
    @menu-select="selectShellMenu"
    @tab-select="selectShellTab"
    @user-click="openSessionWorkspace"
  />
</template>
