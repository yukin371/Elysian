<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { TenantRecord } from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolveTenantWorkspacePanelState,
} from "./tenant-workspace-state"

type TenantWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface TenantWorkspacePanelProps {
  t: TenantWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  isSuperAdmin: boolean
  canEnterWorkspace: boolean
  canViewTenants: boolean
  canCreateTenants: boolean
  canUpdateTenants: boolean
  formCopy: ElyFormCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<TenantWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", tenant: TenantRecord): void
  (e: "toggle-status"): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedTenantWorkspaceState = computed(() =>
  resolveTenantWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.tenantLoading ?? null),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(
    () => resolvedTenantWorkspaceState.value?.tenantDetailLoading ?? null,
  ),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(
    () => resolvedTenantWorkspaceState.value?.tenantErrorMessage ?? null,
  ),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () => resolvedTenantWorkspaceState.value?.tenantDetailErrorMessage ?? null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.tenantPanelMode ?? null),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedSelectedTenant = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.selectedTenant ?? null),
  null as TenantRecord | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.tenantModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.tenantSignInToLoad") }}
    </div>

    <div
      v-else-if="authModuleReady && isAuthenticated && !isSuperAdmin"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.tenantSuperAdminRequired") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewTenants"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.tenantNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedTenant"
      class="enterprise-inline-warning"
    >
      {{ t("app.tenant.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedTenant">
      <div class="enterprise-button-row">
        <button
          v-if="canUpdateTenants"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedTenant)"
        >
          {{ t("app.tenant.action.edit") }}
        </button>
        <button
          v-if="canUpdateTenants"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('toggle-status')"
        >
          {{
            resolvedSelectedTenant.status === "active"
              ? t("app.tenant.action.suspend")
              : t("app.tenant.action.activate")
          }}
        </button>
        <button
          v-if="canCreateTenants"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.tenant.action.create") }}
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
      {{ t("app.tenant.detailEmptyDescription") }}
    </div>
  </section>
</template>
