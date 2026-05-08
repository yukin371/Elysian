<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"

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
  authErrorMessage: string
}>()

defineEmits<(event: "submit-logout") => void>()
</script>

<template>
  <section class="enterprise-card">
    <div class="enterprise-status-header">
      <div class="enterprise-status-copy">
        <h3 class="enterprise-heading">{{ platformDisplayName }}</h3>

        <div v-if="!authModuleReady" class="enterprise-facts">
          <span>{{ t("app.session.title.offline") }}</span>
          <span>{{ t("app.platform.status") }} {{ platformStatusLabel }}</span>
          <span>{{ t("app.platform.version") }} {{ platformVersion }}</span>
        </div>

        <div v-else-if="isAuthenticated" class="enterprise-facts">
          <span>{{ authDisplayName }}</span>
          <span>{{ authUsername }}</span>
          <span v-if="authRolesLabel">{{ authRolesLabel }}</span>
          <span v-if="permissionCount > 0">
            {{ permissionCount }} {{ t("app.session.permissions") }}
          </span>
          <span>{{ t("app.platform.status") }} {{ platformStatusLabel }}</span>
          <span>{{ t("app.platform.version") }} {{ platformVersion }}</span>
        </div>

        <div v-else class="enterprise-facts">
          <span>{{ t("app.session.signIn") }}</span>
          <span>{{ t("app.platform.status") }} {{ platformStatusLabel }}</span>
          <span>{{ t("app.platform.version") }} {{ platformVersion }}</span>
        </div>
      </div>

      <span class="enterprise-toolbar-pill">
        {{ envName }}
      </span>
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

    <p
      v-else-if="!authModuleReady"
      class="enterprise-message enterprise-message-muted mt-5"
    >
      {{ t("app.session.offlineCopy") }}
    </p>

    <p
      v-else
      class="enterprise-message enterprise-message-warning mt-5"
    >
      {{ t("app.session.loginRequiredCopy") }}
    </p>

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
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: #ffffff;
  padding: 1rem;
  color: #0f172a;
}

.enterprise-heading {
  margin: 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-status-copy {
  display: grid;
  gap: 0.55rem;
}

.enterprise-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
  color: #475569;
  font-size: 0.82rem;
}

.enterprise-status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.enterprise-message {
  border-radius: 4px;
  padding: 0.9rem 1rem;
  line-height: 1.75;
}

.enterprise-message-danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.08);
  color: #991b1b;
}

.enterprise-message-muted {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(241, 245, 249, 0.82);
  color: #475569;
}

.enterprise-message-warning {
  border: 1px solid rgba(245, 158, 11, 0.2);
  background: rgba(255, 247, 237, 0.9);
  color: #9a3412;
}

.enterprise-toolbar-pill {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 4px;
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
    align-items: flex-start;
  }
}
</style>
