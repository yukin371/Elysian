<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"
import { Input as TInput } from "tdesign-vue-next/es/input"

import type { AppTranslate } from "../../app/app-shell-helpers"

defineProps<{
  t: AppTranslate
  title: string
  subtitle: string
  envName: string
  authModuleReady: boolean
  authLoading: boolean
  username: string
  credential: string
  errorMessage: string
}>()

defineEmits<{
  (event: "update:username", value: string): void
  (event: "update:credential", value: string): void
  (event: "submit-login"): void
}>()
</script>

<template>
  <section class="admin-login-page">
    <header class="admin-login-header">
      <div>
        <p class="admin-login-eyebrow">{{ subtitle }}</p>
        <h1>{{ title }}</h1>
      </div>
      <span class="admin-login-env">{{ envName }}</span>
    </header>

    <main class="admin-login-main">
      <section class="admin-login-panel">
        <div class="admin-login-panel-head">
          <p class="admin-login-eyebrow">{{ t("app.session.title.online") }}</p>
          <h2>{{ t("app.session.signIn") }}</h2>
          <p>
            {{
              authModuleReady
                ? t("app.session.loginRequiredCopy")
                : t("app.session.offlineCopy")
            }}
          </p>
        </div>

        <form class="admin-login-form" @submit.prevent="$emit('submit-login')">
          <label class="admin-login-field">
            <span>{{ t("app.session.username") }}</span>
            <TInput
              :model-value="username"
              :disabled="authLoading || !authModuleReady"
              placeholder="admin"
              clearable
              @update:model-value="
                $emit('update:username', String($event ?? ''))
              "
            />
          </label>

          <label class="admin-login-field">
            <span>{{ t("app.session.password") }}</span>
            <TInput
              :model-value="credential"
              :disabled="authLoading || !authModuleReady"
              type="password"
              placeholder="admin123"
              @update:model-value="
                $emit('update:credential', String($event ?? ''))
              "
            />
          </label>

          <TButton
            type="submit"
            theme="primary"
            block
            :loading="authLoading"
            :disabled="
              !authModuleReady ||
              username.trim().length === 0 ||
              credential.trim().length === 0
            "
          >
            {{
              authLoading ? t("app.session.signingIn") : t("app.session.signIn")
            }}
          </TButton>
        </form>

        <p v-if="errorMessage" class="admin-login-error">
          {{ errorMessage }}
        </p>
      </section>
    </main>
  </section>
</template>

<style scoped>
.admin-login-page {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto 1fr;
  background: #eef2f7;
  color: #0f172a;
}

.admin-login-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  background: #ffffff;
  padding: 0.85rem 1.25rem;
}

.admin-login-header h1,
.admin-login-panel h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0;
}

.admin-login-main {
  display: grid;
  align-items: center;
  justify-items: center;
  padding: 1rem;
}

.admin-login-panel {
  width: min(100%, 380px);
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 6px;
  background: #ffffff;
  padding: 1.25rem;
}

.admin-login-panel-head p {
  margin: 0.55rem 0 0;
  color: #475569;
  line-height: 1.7;
}

.admin-login-eyebrow,
.admin-login-field span {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
}

.admin-login-eyebrow {
  margin-bottom: 0.25rem;
}

.admin-login-env {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 4px;
  background: #f8fafc;
  padding: 0.35rem 0.65rem;
  color: #475569;
  font-size: 0.78rem;
}

.admin-login-form {
  display: grid;
  gap: 0.9rem;
  margin-top: 1.1rem;
}

.admin-login-field {
  display: grid;
  gap: 0.45rem;
}

.admin-login-error {
  margin: 1rem 0 0;
  border: 1px solid rgba(239, 68, 68, 0.18);
  border-radius: 4px;
  background: rgba(239, 68, 68, 0.08);
  padding: 0.85rem;
  color: #991b1b;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .admin-login-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-login-main {
    align-items: start;
  }
}
</style>
