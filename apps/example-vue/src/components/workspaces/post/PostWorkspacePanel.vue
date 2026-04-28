<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"

import type { PostRecord } from "../../../lib/platform-api"

type PostWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface PostWorkspacePanelProps {
  t: PostWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewPosts: boolean
  canCreatePosts: boolean
  canUpdatePosts: boolean
  loading: boolean
  detailLoading: boolean
  errorMessage: string
  detailErrorMessage: string
  panelMode: "detail" | "create" | "edit"
  panelTitle: string
  panelDescription: string
  selectedPost: PostRecord | null
  formFields: ElyFormField[]
  formValues: ElyFormValues
  formCopy: ElyFormCopy
}

defineProps<PostWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", post: PostRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.post.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ panelTitle }}</h3>
    <p class="enterprise-copy">{{ panelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.postModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.postSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewPosts"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.postNoListPermission") }}
    </div>

    <div v-else-if="errorMessage" class="enterprise-inline-warning">
      {{ errorMessage }}
    </div>

    <div v-else-if="detailLoading && selectedPost" class="enterprise-inline-warning">
      {{ t("app.post.detailLoading") }}
    </div>

    <div v-else-if="detailErrorMessage" class="enterprise-inline-warning">
      {{ detailErrorMessage }}
    </div>

    <template v-else-if="panelMode === 'detail' && selectedPost">
      <div class="enterprise-button-row">
        <button
          v-if="canUpdatePosts"
          type="button"
          class="enterprise-button"
          :disabled="loading || detailLoading"
          @click="emit('start-edit', selectedPost)"
        >
          {{ t("app.post.action.edit") }}
        </button>
        <button
          v-if="canCreatePosts"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.post.action.create") }}
        </button>
      </div>

      <ElyForm
        class="mt-5"
        :fields="formFields"
        :values="formValues"
        readonly
        :loading="loading || detailLoading"
        :copy="formCopy"
      />
    </template>

    <template v-else-if="panelMode === 'create' || panelMode === 'edit'">
      <ElyForm
        class="mt-5"
        :fields="formFields"
        :values="formValues"
        :loading="loading || detailLoading"
        :copy="formCopy"
        @submit="emit('submit-form', $event)"
        @cancel="emit('cancel-panel')"
      />
    </template>

    <div v-else class="enterprise-inline-warning mt-5">
      {{ t("app.post.detailEmptyDescription") }}
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
.enterprise-inline-warning {
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
</style>
