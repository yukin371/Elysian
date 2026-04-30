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
.enterprise-inline-warning,
.enterprise-danger-zone p {
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

.enterprise-inline-warning,
.enterprise-danger-zone {
  margin-top: 1rem;
  border-radius: 12px;
  padding: 0.85rem 0.95rem;
}

.enterprise-inline-warning {
  border: 1px solid rgba(245, 158, 11, 0.16);
  background: rgba(255, 251, 235, 0.96);
  color: #92400e;
}

.enterprise-danger-zone {
  border: 1px solid rgba(239, 68, 68, 0.16);
  background: rgba(254, 242, 242, 0.96);
  color: #991b1b;
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

.enterprise-button-danger {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border-color: rgba(220, 38, 38, 0.18);
}
</style>
