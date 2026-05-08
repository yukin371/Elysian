<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { PostRecord } from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolvePostWorkspacePanelState,
} from "./post-workspace-state"

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
  formCopy: ElyFormCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<PostWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", post: PostRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedPostWorkspaceState = computed(() =>
  resolvePostWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedPostWorkspaceState.value?.postLoading ?? null),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(() => resolvedPostWorkspaceState.value?.postDetailLoading ?? null),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(() => resolvedPostWorkspaceState.value?.postErrorMessage ?? null),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () => resolvedPostWorkspaceState.value?.postDetailErrorMessage ?? null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(() => resolvedPostWorkspaceState.value?.postPanelMode ?? null),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedPostWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedSelectedPost = readInjectedValue(
  computed(() => resolvedPostWorkspaceState.value?.selectedPost ?? null),
  null as PostRecord | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedPostWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedPostWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>

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

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedPost"
      class="enterprise-inline-warning"
    >
      {{ t("app.post.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedPost">
      <div class="enterprise-button-row">
        <button
          v-if="canUpdatePosts"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedPost)"
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
        :fields="resolvedFormFields"
        :values="resolvedFormValues"
        readonly
        :loading="resolvedLoading || resolvedDetailLoading"
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
        :loading="resolvedLoading || resolvedDetailLoading"
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
