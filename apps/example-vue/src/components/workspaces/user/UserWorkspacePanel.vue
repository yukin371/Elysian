<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { Input as TInput } from "tdesign-vue-next/es/input"

import type { UserRecord } from "../../../lib/platform-api"

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
  canViewUsers: boolean
  canCreateUsers: boolean
  canUpdateUsers: boolean
  canResetUserPasswords: boolean
  loading: boolean
  errorMessage: string
  panelMode: "detail" | "create" | "edit" | "reset"
  panelTitle: string
  panelDescription: string
  selectedUser: UserRecord | null
  formFields: ElyFormField[]
  formValues: ElyFormValues
  formCopy: ElyFormCopy
  passwordInput: string
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
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.user.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ panelTitle }}</h3>
    <p class="enterprise-copy">{{ panelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.userModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.userSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewUsers"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.userNoListPermission") }}
    </div>

    <div v-else-if="errorMessage" class="enterprise-inline-warning">
      {{ errorMessage }}
    </div>

    <template v-else-if="panelMode === 'detail' && selectedUser">
      <div class="enterprise-button-row">
        <button
          v-if="canUpdateUsers"
          type="button"
          class="enterprise-button"
          :disabled="loading"
          @click="emit('start-edit', selectedUser)"
        >
          {{ t("app.user.action.edit") }}
        </button>
        <button
          v-if="canResetUserPasswords"
          type="button"
          class="enterprise-button enterprise-button-danger"
          :disabled="loading"
          @click="emit('start-password-reset', selectedUser)"
        >
          {{ t("app.user.action.resetPassword") }}
        </button>
        <button
          v-if="canCreateUsers"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.user.action.create") }}
        </button>
      </div>

      <ElyForm
        class="mt-5"
        :fields="formFields"
        :values="formValues"
        readonly
        :loading="loading"
        :copy="formCopy"
      />
    </template>

    <template v-else-if="panelMode === 'create' || panelMode === 'edit'">
      <ElyForm
        class="mt-5"
        :fields="formFields"
        :values="formValues"
        :loading="loading"
        :copy="formCopy"
        @submit="emit('submit-form', $event)"
        @cancel="emit('cancel-panel')"
      />

      <label v-if="panelMode === 'create'" class="enterprise-field mt-2">
        <span>{{ t("app.user.field.password") }}</span>
        <TInput
          :model-value="passwordInput"
          type="password"
          :disabled="loading"
          :placeholder="t('app.user.passwordPlaceholder')"
          @update:model-value="handlePasswordInput"
        />
      </label>
    </template>

    <template v-else-if="panelMode === 'reset' && selectedUser">
      <div class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.user.field.username") }}</span>
          <strong>{{ selectedUser.username }}</strong>
        </div>
        <div>
          <span>{{ t("app.user.field.displayName") }}</span>
          <strong>{{ selectedUser.displayName }}</strong>
        </div>
      </div>

      <label class="enterprise-field mt-5">
        <span>{{ t("app.user.field.password") }}</span>
        <TInput
          :model-value="passwordInput"
          type="password"
          :disabled="loading"
          :placeholder="t('app.user.passwordPlaceholder')"
          @update:model-value="handlePasswordInput"
        />
      </label>

      <div class="enterprise-button-row">
        <button
          type="button"
          class="enterprise-button enterprise-button-danger"
          :disabled="loading"
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

<style scoped>
.enterprise-card {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  padding: 1.2rem;
  color: #0f172a;
}

.enterprise-eyebrow,
.enterprise-heading,
.enterprise-copy,
.enterprise-inline-warning,
.enterprise-field span,
.enterprise-metadata span {
  margin: 0;
}

.enterprise-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-heading {
  margin-top: 0.7rem;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-copy {
  margin-top: 0.75rem;
  line-height: 1.75;
  color: #475569;
}

.enterprise-inline-warning {
  margin-top: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.16);
  background: rgba(255, 251, 235, 0.96);
  padding: 0.85rem 0.95rem;
  color: #92400e;
}

.enterprise-metadata {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  margin-top: 1rem;
}

.enterprise-metadata div {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(248, 250, 252, 0.58);
  padding: 0.85rem 0.95rem;
}

.enterprise-metadata strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
}

.enterprise-field {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  color: #334155;
}

.enterprise-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.enterprise-button {
  border: 1px solid rgba(36, 87, 214, 0.18);
  border-radius: 12px;
  background: linear-gradient(135deg, #2457d6, #173ea6);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.65rem 1rem;
}

.enterprise-button-ghost {
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
}

.enterprise-button-danger {
  background: linear-gradient(135deg, #dc2626, #7f1d1d);
}
</style>
