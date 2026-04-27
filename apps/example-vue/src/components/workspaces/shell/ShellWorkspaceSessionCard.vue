<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"
import { Input as TInput } from "tdesign-vue-next/es/input"

import type { AppTranslate } from "../../../app/app-shell-helpers"

defineProps<{
  t: AppTranslate
  authModuleReady: boolean
  isAuthenticated: boolean
  platformDisplayName: string
  platformVersion: string
  platformStatusLabel: string
  authDisplayName: string
  authUsername: string
  authRolesLabel: string
  envName: string
  permissionCount: number
  authLoading: boolean
  loginUsername: string
  loginPassword: string
  authErrorMessage: string
}>()

defineEmits<{
  (event: "submit-logout"): void
  (event: "update:login-username", value: string): void
  (event: "update:login-password", value: string): void
  (event: "submit-login"): void
}>()
</script>

<template>
  <section class="enterprise-card">
    <div class="enterprise-status-header">
      <div>
        <h3 class="enterprise-heading">{{ platformDisplayName }}</h3>
        <p v-if="!authModuleReady" class="enterprise-copy">
          {{ t("app.session.offlineCopy") }}
        </p>
        <p v-else-if="isAuthenticated" class="enterprise-copy">
          {{
            t("app.session.signedInAs", {
              displayName: authDisplayName,
              username: authUsername,
            })
          }}
        </p>
        <p v-else class="enterprise-copy">
          {{ t("app.session.title.online") }}
        </p>
      </div>

      <span class="enterprise-toolbar-pill">
        {{ envName }}
      </span>
    </div>

    <div class="enterprise-metadata enterprise-status-metadata">
      <div>
        <span>{{ t("app.platform.version") }}</span>
        <strong>{{ platformVersion }}</strong>
      </div>
      <div>
        <span>{{ t("app.platform.status") }}</span>
        <strong class="capitalize">{{ platformStatusLabel }}</strong>
      </div>
      <div v-if="authModuleReady && isAuthenticated">
        <span>{{ t("app.session.roles") }}</span>
        <strong>{{ authRolesLabel }}</strong>
      </div>
      <div v-if="authModuleReady && isAuthenticated">
        <span>{{ t("app.session.permissions") }}</span>
        <strong>{{ permissionCount }}</strong>
      </div>
    </div>

    <TButton
      v-if="authModuleReady && isAuthenticated"
      theme="primary"
      variant="outline"
      class="mt-5"
      :loading="authLoading"
      @click="$emit('submit-logout')"
    >
      {{ authLoading ? t("app.session.working") : t("app.session.signOut") }}
    </TButton>

    <form
      v-else-if="authModuleReady"
      class="mt-5 space-y-4"
      @submit.prevent="$emit('submit-login')"
    >
      <label class="enterprise-field">
        <span>{{ t("app.session.username") }}</span>
        <TInput
          :model-value="loginUsername"
          :disabled="authLoading"
          placeholder="admin"
          clearable
          @update:model-value="
            $emit('update:login-username', String($event ?? ''))
          "
        />
      </label>

      <label class="enterprise-field">
        <span>{{ t("app.session.password") }}</span>
        <TInput
          :model-value="loginPassword"
          :disabled="authLoading"
          type="password"
          placeholder="admin123"
          @update:model-value="
            $emit('update:login-password', String($event ?? ''))
          "
        />
      </label>

      <TButton
        type="submit"
        theme="primary"
        style="width: 100%"
        :loading="authLoading"
        :disabled="
          loginUsername.trim().length === 0 || loginPassword.trim().length === 0
        "
      >
        {{ authLoading ? t("app.session.signingIn") : t("app.session.signIn") }}
      </TButton>
    </form>

    <p
      v-if="authErrorMessage"
      class="enterprise-message enterprise-message-danger mt-4"
    >
      {{ authErrorMessage }}
    </p>
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

.enterprise-heading {
  margin: 0.7rem 0 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-copy {
  margin: 0.75rem 0 0;
  line-height: 1.75;
  color: #475569;
}

.enterprise-field {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  color: #334155;
}

.enterprise-metadata {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin-top: 1rem;
}

.enterprise-metadata div {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(248, 250, 252, 0.58);
  padding: 0.85rem 0.95rem;
}

.enterprise-metadata span {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-metadata strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
}

.enterprise-status-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.enterprise-status-header .enterprise-copy {
  margin-top: 0.55rem;
}

.enterprise-status-metadata {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.enterprise-message {
  border-radius: 12px;
  padding: 0.9rem 1rem;
  line-height: 1.75;
}

.enterprise-message-danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.08);
  color: #991b1b;
}

.enterprise-toolbar-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  padding: 0.45rem 0.85rem;
  font-size: 0.78rem;
  color: #475569;
}

.capitalize {
  text-transform: capitalize;
}

@media (max-width: 900px) {
  .enterprise-status-header {
    flex-direction: column;
  }
}
</style>
