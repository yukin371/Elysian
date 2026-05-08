import type { ModuleSchema } from "@elysian/schema"
import { getPanelTemplatePermissionProps } from "./shared"
export const renderTenantPanelTemplateOverride = (schema: ModuleSchema) => {
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
  resolveTenantWorkspacePanelState,
} from "./tenant-workspace"
import type { TenantRecord } from "./tenant.schema"

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
  ${viewPermission}: boolean
  ${createPermission}: boolean
  ${updatePermission}: boolean
  formCopy: ElyFormCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<TenantWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", tenant: TenantRecord): void
  (e: "toggle-status"): void
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
      v-else-if="canEnterWorkspace && !${viewPermission}"
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
      <div
        v-if="resolvedPanelMode === 'edit' && ${updatePermission} && resolvedSelectedTenant"
        class="enterprise-button-row"
      >
        <button
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
      </div>

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
`
}
