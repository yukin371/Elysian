<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type {
  DepartmentDetailRecord,
  DepartmentRecord,
} from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolveDepartmentWorkspacePanelState,
} from "./department-workspace-state"

type DepartmentWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface DepartmentWorkspacePanelProps {
  t: DepartmentWorkspaceTranslation
  formCopy: ElyFormCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<DepartmentWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-form"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedDepartmentWorkspaceState = computed(() =>
  resolveDepartmentWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(
    () => resolvedDepartmentWorkspaceState.value?.departmentLoading ?? null,
  ),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(
    () =>
      resolvedDepartmentWorkspaceState.value?.departmentDetailLoading ?? null,
  ),
  false,
)
const resolvedPanelMode = readInjectedValue(
  computed(
    () => resolvedDepartmentWorkspaceState.value?.departmentPanelMode ?? null,
  ),
  "detail" as "detail" | "create" | "edit",
)
const resolvedSelectedDepartment = readInjectedValue(
  computed(
    () => resolvedDepartmentWorkspaceState.value?.selectedDepartment ?? null,
  ),
  null as DepartmentRecord | null,
)
const resolvedSelectedDepartmentDetail = readInjectedValue(
  computed(
    () =>
      resolvedDepartmentWorkspaceState.value?.selectedDepartmentDetail ?? null,
  ),
  null as DepartmentDetailRecord | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedDepartmentWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedDepartmentWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
const resolvedDepartmentParentLookup = readInjectedValue(
  computed(() => resolvedDepartmentWorkspaceState.value?.parentLookup ?? null),
  new Map<string, DepartmentRecord>(),
)

const showIdentity = computed(
  () =>
    resolvedSelectedDepartment.value && resolvedPanelMode.value !== "create",
)

const handleFormSubmit = (values: ElyFormValues) => {
  emit("submit-form", values)
}

const handleFormCancel = () => {
  emit("cancel-form")
}
</script>

<template>
  <div class="department-panel-content">
    <!-- Identity section -->
    <div
      class="ely-context-panel__identity"
      v-if="showIdentity && resolvedSelectedDepartment"
    >
      <div>
        <div class="ely-context-panel__identity-name">
          {{ resolvedSelectedDepartment.name }}
        </div>
        <div class="ely-context-panel__identity-sub">
          {{ resolvedSelectedDepartment.code }}
        </div>
        <div class="ely-context-panel__identity-sub">
          {{
            resolvedSelectedDepartment.parentId
              ? (resolvedDepartmentParentLookup.get(
                  resolvedSelectedDepartment.parentId,
                )?.name ?? resolvedSelectedDepartment.parentId)
              : t("app.department.parentRoot")
          }}
        </div>
      </div>
    </div>

    <!-- Form -->
    <ElyForm
      class="department-panel-form"
      :fields="resolvedFormFields"
      :values="resolvedFormValues"
      :loading="resolvedLoading || resolvedDetailLoading"
      :readonly="resolvedPanelMode === 'detail'"
      :copy="formCopy"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    />

    <!-- Department detail metadata (detail mode only) -->
    <template
      v-if="
        resolvedPanelMode === 'detail' &&
        resolvedSelectedDepartmentDetail &&
        resolvedSelectedDepartment
      "
    >
      <div class="department-panel-metadata">
        <div>
          <span class="department-panel-metadata__label">{{
            t("app.department.meta.userCount")
          }}</span>
          <strong>{{ resolvedSelectedDepartmentDetail.userIds.length }}</strong>
        </div>
        <div>
          <span class="department-panel-metadata__label">{{
            t("app.department.meta.userIds")
          }}</span>
          <span>{{
            resolvedSelectedDepartmentDetail.userIds.length > 0
              ? resolvedSelectedDepartmentDetail.userIds.join(", ")
              : t("app.department.meta.empty")
          }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.department-panel-content {
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

.department-panel-form {
  margin-top: 4px;
}

.department-panel-metadata {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  font-size: 13px;
  color: #334155;
}

.department-panel-metadata__label {
  color: #64748b;
  margin-right: 6px;
}
</style>
