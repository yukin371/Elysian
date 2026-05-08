<script setup lang="ts">
import { defineAsyncComponent } from "vue"

import type { AppTranslate } from "../../app/app-shell-helpers"
import type { useExampleAppBootstrap } from "../../app/use-example-app-bootstrap"
import type { useExampleRuntimeState } from "../../app/use-example-runtime-state"
import type { ExampleAppLayout } from "../../router/example-router"
import AdminLoginPage from "../auth/AdminLoginPage.vue"

const ExampleAuthenticatedShell = defineAsyncComponent(
  () => import("./ExampleAuthenticatedShell.vue"),
)

type ExampleBootstrapLocalizers = ReturnType<
  typeof useExampleAppBootstrap
>["localizers"]
type ExampleRuntimeState = ReturnType<typeof useExampleRuntimeState>

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
  localizers: ExampleBootstrapLocalizers
  runtimeState: ExampleRuntimeState
  onRecoverableAuthError: (error: unknown) => void
}

defineProps<ExampleAppStageGateProps>()

defineEmits<{
  (event: "update:username", value: string): void
  (event: "update:credential", value: string): void
  (event: "submit-login"): void
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
        <ExampleAuthenticatedShell
          v-else
          :t="t"
          :locale="locale"
          :localizers="localizers"
          :runtime-state="runtimeState"
          :on-recoverable-auth-error="onRecoverableAuthError"
        />
      </template>
    </div>
  </main>
</template>
