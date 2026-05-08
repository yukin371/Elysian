<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { MenuDetailRecord, MenuRecord } from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolveMenuWorkspacePanelState,
} from "./menu-workspace-state"

type MenuWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface MenuWorkspacePanelProps {
  t: MenuWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewMenus: boolean
  canCreateMenus: boolean
  canUpdateMenus: boolean
  formCopy: ElyFormCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<MenuWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", record: MenuRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedMenuWorkspaceState = computed(() =>
  resolveMenuWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.menuLoading ?? null),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.menuDetailLoading ?? null),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.menuErrorMessage ?? null),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () => resolvedMenuWorkspaceState.value?.menuDetailErrorMessage ?? null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.menuPanelMode ?? null),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedSelectedMenu = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.selectedMenu ?? null),
  null as MenuRecord | null,
)
const resolvedSelectedMenuDetail = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.selectedMenuDetail ?? null),
  null as MenuDetailRecord | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
const resolvedMenuParentLookup = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.parentLookup ?? null),
  new Map<string, MenuRecord>(),
)
</script>

<template>
  <section class="enterprise-card">
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.menuModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.menuSignInToLoad") }}
    </div>

    <div v-else-if="canEnterWorkspace && !canViewMenus" class="enterprise-inline-warning">
      {{ t("app.message.menuNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedMenu"
      class="enterprise-inline-warning"
    >
      {{ t("app.menu.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedMenu">
      <div class="enterprise-button-row">
        <button
          v-if="canUpdateMenus"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedMenu)"
        >
          {{ t("app.menu.action.edit") }}
        </button>
        <button
          v-if="canCreateMenus"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.menu.action.create") }}
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
          <span>{{ t("app.menu.meta.parent") }}</span>
          <strong>{{
            resolvedSelectedMenu.parentId
              ? (resolvedMenuParentLookup.get(resolvedSelectedMenu.parentId)?.name ??
                resolvedSelectedMenu.parentId)
              : t("app.menu.parentRoot")
          }}</strong>
        </div>
        <div v-if="resolvedSelectedMenuDetail">
          <span>{{ t("app.menu.meta.roleCount") }}</span>
          <strong>{{ resolvedSelectedMenuDetail.roleIds.length }}</strong>
        </div>
      </div>

      <div v-if="resolvedSelectedMenuDetail" class="mt-5 space-y-4">
        <div>
          <p class="enterprise-subheading">
            {{ t("app.menu.meta.roleIds") }}
          </p>
          <p class="enterprise-copy">
            {{
              resolvedSelectedMenuDetail.roleIds.length > 0
                ? resolvedSelectedMenuDetail.roleIds.join(", ")
                : t("app.menu.meta.empty")
            }}
          </p>
        </div>
      </div>
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
      {{ t("app.menu.detailEmptyDescription") }}
    </div>
  </section>
</template>
