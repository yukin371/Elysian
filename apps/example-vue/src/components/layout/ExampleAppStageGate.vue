<script setup lang="ts">
import type { UiNavigationNode } from "@elysian/ui-core"

import type { AppTranslate } from "../../app/app-shell-helpers"
import type { ExampleAppLayout } from "../../router/example-router"
import AdminLoginPage from "../auth/AdminLoginPage.vue"
import AdminShellLayout from "./AdminShellLayout.vue"

type ListenerMap = Record<string, (...args: unknown[]) => void>

interface ExampleAppStageGateProps {
  t: AppTranslate
  loading: boolean
  errorMessage: string
  layout: ExampleAppLayout
  title: string
  subtitle: string
  envName: string
  authModuleReady: boolean
  authLoading: boolean
  username: string
  credential: string
  authErrorMessage: string
  locale: string
  workspaceTitle: string
  workspaceDescription: string
  presetLabel: string
  status: string
  copy: Record<string, unknown>
  navigation: ReadonlyArray<UiNavigationNode>
  selectedMenuKey: string | null
  tabs: ReadonlyArray<unknown>
  selectedTabKey: string
  user: Record<string, unknown> | null
  headerActionProps: Record<string, unknown>
  headerActionListeners: ListenerMap
  workspaceMainProps: Record<string, unknown>
  workspaceMainListeners: ListenerMap
  workspaceSecondaryProps: Record<string, unknown>
  workspaceSecondaryListeners: ListenerMap
}

defineProps<ExampleAppStageGateProps>()

defineEmits<{
  (event: "update:username", value: string): void
  (event: "update:credential", value: string): void
  (event: "submit-login"): void
  (event: "menu-select", menuKey: string): void
  (event: "tab-select", tabKey: string): void
  (event: "user-click"): void
}>()
</script>

<template>
  <main class="app-shell min-h-screen">
    <div class="admin-frame">
      <p v-if="loading" class="admin-loading">
        {{ t("app.loading.workspace") }}
      </p>
      <p v-else-if="errorMessage" class="admin-error">
        {{ errorMessage }}
      </p>

      <template v-else>
        <AdminLoginPage
          v-if="layout === 'auth'"
          :t="t"
          :title="title"
          :subtitle="subtitle"
          :env-name="envName"
          :auth-module-ready="authModuleReady"
          :auth-loading="authLoading"
          :username="username"
          :credential="credential"
          :error-message="authErrorMessage"
          @update:username="$emit('update:username', $event)"
          @update:credential="$emit('update:credential', $event)"
          @submit-login="$emit('submit-login')"
        />
        <AdminShellLayout
          v-else
          :t="t"
          :locale="locale"
          :title="title"
          :subtitle="subtitle"
          :workspace-title="workspaceTitle"
          :workspace-description="workspaceDescription"
          :preset-label="presetLabel"
          :environment="envName"
          :status="status"
          :copy="copy"
          :navigation="navigation"
          :selected-menu-key="selectedMenuKey"
          :tabs="tabs"
          :selected-tab-key="selectedTabKey"
          :user="user"
          :header-action-props="headerActionProps"
          :header-action-listeners="headerActionListeners"
          :workspace-main-props="workspaceMainProps"
          :workspace-main-listeners="workspaceMainListeners"
          :workspace-secondary-props="workspaceSecondaryProps"
          :workspace-secondary-listeners="workspaceSecondaryListeners"
          @menu-select="$emit('menu-select', $event)"
          @tab-select="$emit('tab-select', $event)"
          @user-click="$emit('user-click')"
        />
      </template>
    </div>
  </main>
</template>
