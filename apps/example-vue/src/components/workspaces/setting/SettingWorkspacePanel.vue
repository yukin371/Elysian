<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { SettingRecord } from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolveSettingWorkspacePanelState,
} from "./setting-workspace-state"

type SettingWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface SettingWorkspacePanelProps {
  t: SettingWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewSettings: boolean
  formCopy: ElyFormCopy
  canCreateSettings: boolean
  canUpdateSettings: boolean
  workspaceStateInjected?: boolean
}

const props = defineProps<SettingWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", setting: SettingRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedSettingWorkspaceState = computed(() =>
  resolveSettingWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedSettingWorkspaceState.value?.settingLoading ?? null),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(
    () => resolvedSettingWorkspaceState.value?.settingDetailLoading ?? null,
  ),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(
    () => resolvedSettingWorkspaceState.value?.settingErrorMessage ?? null,
  ),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedSettingWorkspaceState.value?.settingDetailErrorMessage ?? null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(() => resolvedSettingWorkspaceState.value?.settingPanelMode ?? null),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedSettingWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(() => resolvedSettingWorkspaceState.value?.panelDescription ?? null),
  "",
)
const resolvedSelectedSetting = readInjectedValue(
  computed(() => resolvedSettingWorkspaceState.value?.selectedSetting ?? null),
  null as SettingRecord | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedSettingWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedSettingWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.setting.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.settingModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.settingSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewSettings"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.settingNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedSetting"
      class="enterprise-inline-warning"
    >
      {{ t("app.setting.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedSetting">
      <div class="enterprise-button-row">
        <button
          v-if="canUpdateSettings"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedSetting)"
        >
          {{ t("app.setting.action.edit") }}
        </button>
        <button
          v-if="canCreateSettings"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.setting.action.create") }}
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
      {{ t("app.setting.detailEmptyDescription") }}
    </div>
  </section>
</template>
