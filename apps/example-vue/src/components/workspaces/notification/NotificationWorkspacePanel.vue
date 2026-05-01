<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { NotificationRecord } from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolveNotificationWorkspacePanelState,
} from "./notification-workspace-state"

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
  canViewNotifications: boolean
  canCreateNotifications: boolean
  canUpdateNotifications: boolean
  formCopy: ElyFormCopy
  localizeNotificationStatus: (status: NotificationRecord["status"]) => string
  localizeNotificationLevel: (level: NotificationRecord["level"]) => string
  workspaceStateInjected?: boolean
}

const props = defineProps<NotificationWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "mark-read"): void
  (e: "open-create"): void
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
const resolvedPanelDescription = readInjectedValue(
  computed(
    () => resolvedNotificationWorkspaceState.value?.panelDescription ?? null,
  ),
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
    <p class="enterprise-eyebrow">{{ t("app.notification.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.notificationModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.notificationSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewNotifications"
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
      <div class="enterprise-button-row">
        <button
          v-if="
            canUpdateNotifications &&
            resolvedSelectedNotification.status === 'unread'
          "
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('mark-read')"
        >
          {{ t("app.notification.action.markRead") }}
        </button>
        <button
          v-if="canCreateNotifications"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.notification.action.create") }}
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

      <div class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.notification.meta.status") }}</span>
          <strong>{{
            localizeNotificationStatus(resolvedSelectedNotification.status)
          }}</strong>
        </div>
        <div>
          <span>{{ t("app.notification.meta.level") }}</span>
          <strong>{{
            localizeNotificationLevel(resolvedSelectedNotification.level)
          }}</strong>
        </div>
        <div>
          <span>{{ t("app.notification.meta.readAt") }}</span>
          <strong>{{
            resolvedSelectedNotification.readAt
              ? new Date(resolvedSelectedNotification.readAt).toLocaleString(
                  locale,
                )
              : t("app.notification.readAtEmpty")
          }}</strong>
        </div>
      </div>
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
