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
  formCopy: ElyFormCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<CustomerWorkspacePanelProps>()

const emit = defineEmits<{
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

const showIdentity = computed(
  () => resolvedSelectedCustomer.value && resolvedPanelMode.value !== "create",
)

const handleFormSubmit = (values: ElyFormValues) => {
  emit("submit-form", values)
}

const handleFormCancel = () => {
  emit("cancel-form")
}
</script>

<template>
  <div class="customer-panel-content">
    <!-- Identity section -->
    <div
      class="ely-context-panel__identity"
      v-if="showIdentity && resolvedSelectedCustomer"
    >
      <div>
        <div class="ely-context-panel__identity-name">
          {{ resolvedSelectedCustomer.name }}
        </div>
        <div class="ely-context-panel__identity-sub">
          {{ resolvedSelectedCustomer.id }}
        </div>
      </div>
    </div>

    <!-- Form -->
    <ElyForm
      class="customer-panel-form"
      :fields="resolvedFormFields"
      :values="resolvedFormValues"
      :loading="resolvedLoading"
      :readonly="resolvedPanelMode === 'detail'"
      :copy="formCopy"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    />
  </div>
</template>

<style scoped>
.customer-panel-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ely-context-panel__identity {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.ely-context-panel__identity-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  line-height: 22px;
}

.ely-context-panel__identity-sub {
  font-size: 12px;
  color: #64748b;
  line-height: 18px;
  margin-top: 2px;
}

.customer-panel-form {
  margin-top: 4px;
}
</style>
