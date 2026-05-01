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
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewDepartments: boolean
  canCreateDepartments: boolean
  canUpdateDepartments: boolean
  formCopy: ElyFormCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<DepartmentWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", record: DepartmentRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
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
const resolvedErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedDepartmentWorkspaceState.value?.departmentErrorMessage ?? null,
  ),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedDepartmentWorkspaceState.value?.departmentDetailErrorMessage ??
      null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(
    () => resolvedDepartmentWorkspaceState.value?.departmentPanelMode ?? null,
  ),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedDepartmentWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(
    () => resolvedDepartmentWorkspaceState.value?.panelDescription ?? null,
  ),
  "",
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
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.department.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.departmentModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.departmentSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewDepartments"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.departmentNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedDepartment"
      class="enterprise-inline-warning"
    >
      {{ t("app.department.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template
      v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedDepartment"
    >
      <div class="enterprise-button-row">
        <button
          v-if="canUpdateDepartments"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedDepartment)"
        >
          {{ t("app.department.action.edit") }}
        </button>
        <button
          v-if="canCreateDepartments"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.department.action.create") }}
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
          <span>{{ t("app.department.meta.parent") }}</span>
          <strong>{{
            resolvedSelectedDepartment.parentId
              ? (resolvedDepartmentParentLookup.get(
                  resolvedSelectedDepartment.parentId,
                )?.name ?? resolvedSelectedDepartment.parentId)
              : t("app.department.parentRoot")
          }}</strong>
        </div>
        <div v-if="resolvedSelectedDepartmentDetail">
          <span>{{ t("app.department.meta.userCount") }}</span>
          <strong>{{ resolvedSelectedDepartmentDetail.userIds.length }}</strong>
        </div>
      </div>

      <div v-if="resolvedSelectedDepartmentDetail" class="mt-5 space-y-4">
        <div>
          <p class="enterprise-subheading">
            {{ t("app.department.meta.userIds") }}
          </p>
          <p class="enterprise-copy">
            {{
              resolvedSelectedDepartmentDetail.userIds.length > 0
                ? resolvedSelectedDepartmentDetail.userIds.join(", ")
                : t("app.department.meta.empty")
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
      {{ t("app.department.detailEmptyDescription") }}
    </div>
  </section>
</template>
