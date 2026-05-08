import type { ModuleSchema } from "@elysian/schema"
import { getPanelTemplatePermissionProps } from "./shared"
export const renderNotificationPanelTemplateOverride = (
  schema: ModuleSchema,
) => {
  const { createPermission, updatePermission, viewPermission } =
    getPanelTemplatePermissionProps(schema)
  return `<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import {
  readInjectedValue,
  resolveNotificationWorkspacePanelState,
} from "./notification-workspace"
import type { NotificationRecord } from "./notification.schema"

type NotificationWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface NotificationWorkspacePanelProps {
  t: NotificationWorkspaceTranslation
  locale: string
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  ${viewPermission}: boolean
  ${createPermission}: boolean
  ${updatePermission}: boolean
  formCopy: ElyFormCopy
  localizeNotificationStatus: (status: string) => string
  localizeNotificationLevel: (level: string) => string
  workspaceStateInjected?: boolean
}

const props = defineProps<NotificationWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "mark-read"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedNotificationWorkspaceState = computed(() =>
  resolveNotificationWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(
    () => resolvedNotificationWorkspaceState.value?.notificationLoading ?? null,
  ),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(
    () =>
      resolvedNotificationWorkspaceState.value?.notificationDetailLoading ??
      null,
  ),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedNotificationWorkspaceState.value?.notificationErrorMessage ??
      null,
  ),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedNotificationWorkspaceState.value
        ?.notificationDetailErrorMessage ?? null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(
    () =>
      resolvedNotificationWorkspaceState.value?.notificationPanelMode ?? null,
  ),
  "detail" as "detail" | "create",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedNotificationWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedSelectedNotification = readInjectedValue(
  computed(
    () =>
      resolvedNotificationWorkspaceState.value?.selectedNotification ?? null,
  ),
  null as NotificationRecord | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedNotificationWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedNotificationWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.notificationModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.notificationSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !${viewPermission}"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.notificationNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedNotification"
      class="enterprise-inline-warning"
    >
      {{ t("app.notification.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template
      v-else-if="
        resolvedPanelMode === 'detail' && resolvedSelectedNotification
      "
    >
      <div
        v-if="
          ${updatePermission} &&
          resolvedSelectedNotification.status === 'unread'
        "
        class="enterprise-button-row"
      >
        <button
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('mark-read')"
        >
          {{ t("app.notification.action.markRead") }}
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

    <template v-else-if="resolvedPanelMode === 'create'">
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
      {{ t("app.notification.detailEmptyDescription") }}
    </div>
  </section>
  </template>
`
}
