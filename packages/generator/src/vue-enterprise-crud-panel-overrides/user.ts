import type { ModuleSchema } from "@elysian/schema"
import { getPanelTemplatePermissionProps } from "./shared"
export const renderUserPanelTemplateOverride = (schema: ModuleSchema) => {
  const { createPermission, updatePermission, viewPermission } =
    getPanelTemplatePermissionProps(schema)
  return `<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { Input as TInput } from "tdesign-vue-next/es/input"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import {
  readInjectedValue,
  resolveUserWorkspacePanelState,
} from "./user-workspace"
import type { UserRecord } from "./user.schema"

type UserWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface UserWorkspacePanelProps {
  t: UserWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  ${viewPermission}: boolean
  ${createPermission}: boolean
  ${updatePermission}: boolean
  canResetUserPasswords: boolean
  formCopy: ElyFormCopy
  passwordInput: string
  workspaceStateInjected?: boolean
}

const props = defineProps<UserWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", user: UserRecord): void
  (e: "start-password-reset", user: UserRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
  (e: "update:password-input", value: string): void
  (e: "submit-password-reset"): void
}>()

const handlePasswordInput = (value: string | number) => {
  emit("update:password-input", String(value))
}

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedUserWorkspaceState = computed(() =>
  resolveUserWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.userLoading ?? null),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.userErrorMessage ?? null),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.userPanelMode ?? null),
  "detail" as "detail" | "create" | "edit" | "reset",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.panelDescription ?? null),
  "",
)
const resolvedSelectedUser = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.selectedUser ?? null),
  null as UserRecord | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.user.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.userModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.userSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !${viewPermission}"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.userNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <template v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedUser">
      <div class="enterprise-button-row">
        <button
          v-if="${updatePermission}"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading"
          @click="emit('start-edit', resolvedSelectedUser)"
        >
          {{ t("app.user.action.edit") }}
        </button>
        <button
          v-if="canResetUserPasswords"
          type="button"
          class="enterprise-button enterprise-button-danger"
          :disabled="resolvedLoading"
          @click="emit('start-password-reset', resolvedSelectedUser)"
        >
          {{ t("app.user.action.resetPassword") }}
        </button>
        <button
          v-if="${createPermission}"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.user.action.create") }}
        </button>
      </div>

      <ElyForm
        class="mt-5"
        :fields="resolvedFormFields"
        :values="resolvedFormValues"
        readonly
        :loading="resolvedLoading"
        :copy="formCopy"
      />
    </template>

    <template
      v-else-if="resolvedPanelMode === 'create' || resolvedPanelMode === 'edit'"
    >
      <ElyForm
        class="mt-5"
        :fields="resolvedFormFields"
        :values="resolvedFormValues"
        :loading="resolvedLoading"
        :copy="formCopy"
        @submit="emit('submit-form', $event)"
        @cancel="emit('cancel-panel')"
      />

      <label v-if="resolvedPanelMode === 'create'" class="enterprise-field mt-2">
        <span>{{ t("app.user.field.password") }}</span>
        <TInput
          :model-value="passwordInput"
          type="password"
          :disabled="resolvedLoading"
          :placeholder="t('app.user.passwordPlaceholder')"
          @update:model-value="handlePasswordInput"
        />
      </label>
    </template>

    <template v-else-if="resolvedPanelMode === 'reset' && resolvedSelectedUser">
      <div class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.user.field.username") }}</span>
          <strong>{{ resolvedSelectedUser.username }}</strong>
        </div>
        <div>
          <span>{{ t("app.user.field.displayName") }}</span>
          <strong>{{ resolvedSelectedUser.displayName }}</strong>
        </div>
      </div>

      <label class="enterprise-field mt-5">
        <span>{{ t("app.user.field.password") }}</span>
        <TInput
          :model-value="passwordInput"
          type="password"
          :disabled="resolvedLoading"
          :placeholder="t('app.user.passwordPlaceholder')"
          @update:model-value="handlePasswordInput"
        />
      </label>

      <div class="enterprise-button-row">
        <button
          type="button"
          class="enterprise-button enterprise-button-danger"
          :disabled="resolvedLoading"
          @click="emit('submit-password-reset')"
        >
          {{ t("app.user.action.confirmResetPassword") }}
        </button>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('cancel-panel')"
        >
          {{ t("app.panel.cancel") }}
        </button>
      </div>
    </template>

    <div v-else class="enterprise-inline-warning mt-5">
      {{ t("app.user.detailEmptyDescription") }}
    </div>
  </section>
  </template>
`
}
