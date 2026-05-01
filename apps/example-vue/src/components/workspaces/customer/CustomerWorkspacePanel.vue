<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { CustomerRecord } from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolveCustomerWorkspacePanelState,
} from "./customer-workspace-state"

type CustomerWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface CustomerWorkspacePanelProps {
  t: CustomerWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canCreateCustomers: boolean
  canUpdateCustomers: boolean
  canDeleteCustomers: boolean
  formCopy: ElyFormCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<CustomerWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "confirm-delete"): void
  (e: "cancel-delete"): void
  (e: "start-edit", row: CustomerRecord): void
  (e: "request-delete", row: CustomerRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-form"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedCustomerWorkspaceState = computed(() =>
  resolveCustomerWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedCustomerWorkspaceState.value?.customerLoading ?? null),
  false,
)
const resolvedPanelMode = readInjectedValue(
  computed(
    () => resolvedCustomerWorkspaceState.value?.customerFormMode ?? null,
  ),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedCustomerWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(
    () => resolvedCustomerWorkspaceState.value?.panelDescription ?? null,
  ),
  "",
)
const resolvedDeleteConfirmId = readInjectedValue(
  computed(() => resolvedCustomerWorkspaceState.value?.deleteConfirmId ?? null),
  null as string | null,
)
const resolvedSelectedCustomer = readInjectedValue(
  computed(
    () => resolvedCustomerWorkspaceState.value?.selectedCustomer ?? null,
  ),
  null as CustomerRecord | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedCustomerWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedCustomerWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.panel.formDetail") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.panel.customerModulePreview") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.panel.signInToUnlock") }}
    </div>

    <div
      v-else-if="resolvedDeleteConfirmId && resolvedSelectedCustomer"
      class="enterprise-danger-zone"
    >
      <p>
        {{
          t("app.panel.deletePrompt", {
            name: resolvedSelectedCustomer.name,
          })
        }}
      </p>
      <div class="enterprise-button-row">
        <button
          type="button"
          class="enterprise-button enterprise-button-danger"
          :disabled="resolvedLoading"
          @click="emit('confirm-delete')"
        >
          {{ t("app.panel.deleteConfirm") }}
        </button>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('cancel-delete')"
        >
          {{ t("app.panel.cancel") }}
        </button>
      </div>
    </div>

    <div
      v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedCustomer"
      class="enterprise-button-row"
    >
      <button
        v-if="canUpdateCustomers"
        type="button"
        class="enterprise-button"
        :disabled="resolvedLoading"
        @click="emit('start-edit', resolvedSelectedCustomer)"
      >
        {{ t("app.panel.editCustomer") }}
      </button>
      <button
        v-if="canDeleteCustomers"
        type="button"
        class="enterprise-button enterprise-button-danger"
        :disabled="resolvedLoading"
        @click="emit('request-delete', resolvedSelectedCustomer)"
      >
        {{ t("app.panel.deleteCustomer") }}
      </button>
      <button
        v-if="canCreateCustomers"
        type="button"
        class="enterprise-button enterprise-button-ghost"
        @click="emit('open-create')"
      >
        {{ t("app.panel.newCustomer") }}
      </button>
    </div>

    <div
      v-else-if="resolvedPanelMode === 'create' && !canCreateCustomers"
      class="enterprise-inline-warning"
    >
      {{ t("app.panel.noCreatePermission") }}
    </div>

    <div
      v-if="
        moduleReady &&
        (!authModuleReady || isAuthenticated) &&
        !(resolvedPanelMode === 'detail' && !resolvedSelectedCustomer)
      "
    >
      <ElyForm
        class="mt-5"
        :fields="resolvedFormFields"
        :values="resolvedFormValues"
        :readonly="resolvedPanelMode === 'detail'"
        :loading="resolvedLoading"
        :copy="formCopy"
        @submit="emit('submit-form', $event)"
        @cancel="emit('cancel-form')"
      />
    </div>

    <div
      v-else-if="
        moduleReady &&
        (!authModuleReady || isAuthenticated) &&
        resolvedPanelMode === 'detail' &&
        !resolvedSelectedCustomer
      "
      class="enterprise-inline-warning mt-5"
    >
      {{ t("app.panel.selectRowHint") }}
    </div>
  </section>
</template>
