<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { RoleDetailRecord, RoleRecord } from "../../../lib/platform-api"

type RoleWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface RoleWorkspacePanelProps {
  t: RoleWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewRoles: boolean
  canCreateRoles: boolean
  canUpdateRoles: boolean
  formCopy: ElyFormCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<RoleWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", role: RoleRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

interface RoleWorkspaceInjectedState {
  formFields: { value: ElyFormField[] }
  formValues: { value: ElyFormValues }
  panelTitle: { value: string }
  roleDetailErrorMessage: { value: string }
  roleDetailLoading: { value: boolean }
  roleErrorMessage: { value: string }
  roleLoading: { value: boolean }
  rolePanelMode: { value: "detail" | "create" | "edit" }
  selectedRole: { value: RoleRecord | null }
  selectedRoleDetail: { value: RoleDetailRecord | null }
}

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedRoleWorkspaceState = computed<RoleWorkspaceInjectedState | null>(
  () => {
    const context = injectedWorkspaceState.value

    if (!props.workspaceStateInjected || context?.kind !== "role") {
      return null
    }

    return context.state as RoleWorkspaceInjectedState
  },
)

const resolvedLoading = computed(
  () => resolvedRoleWorkspaceState.value?.roleLoading.value ?? false,
)
const resolvedDetailLoading = computed(
  () => resolvedRoleWorkspaceState.value?.roleDetailLoading.value ?? false,
)
const resolvedErrorMessage = computed(
  () => resolvedRoleWorkspaceState.value?.roleErrorMessage.value ?? "",
)
const resolvedDetailErrorMessage = computed(
  () => resolvedRoleWorkspaceState.value?.roleDetailErrorMessage.value ?? "",
)
const resolvedPanelMode = computed(
  () => resolvedRoleWorkspaceState.value?.rolePanelMode.value ?? "detail",
)
const resolvedPanelTitle = computed(
  () => resolvedRoleWorkspaceState.value?.panelTitle.value ?? "",
)
const resolvedSelectedRole = computed(
  () => resolvedRoleWorkspaceState.value?.selectedRole.value ?? null,
)
const resolvedSelectedRoleDetail = computed(
  () => resolvedRoleWorkspaceState.value?.selectedRoleDetail.value ?? null,
)
const resolvedFormFields = computed(
  () => resolvedRoleWorkspaceState.value?.formFields.value ?? [],
)
const resolvedFormValues = computed(
  () => resolvedRoleWorkspaceState.value?.formValues.value ?? {},
)
</script>

<template>
  <section class="enterprise-card">
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.roleModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.roleSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewRoles"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.roleNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedRole"
      class="enterprise-inline-warning"
    >
      {{ t("app.role.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedRole">
      <div v-if="canUpdateRoles" class="enterprise-button-row">
        <button
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedRole)"
        >
          {{ t("app.role.action.edit") }}
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

      <div v-if="resolvedSelectedRoleDetail" class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.role.meta.permissionCount") }}</span>
          <strong>{{ resolvedSelectedRoleDetail.permissionCodes.length }}</strong>
        </div>
        <div>
          <span>{{ t("app.role.meta.userCount") }}</span>
          <strong>{{ resolvedSelectedRoleDetail.userIds.length }}</strong>
        </div>
        <div>
          <span>{{ t("app.role.meta.deptCount") }}</span>
          <strong>{{ resolvedSelectedRoleDetail.deptIds.length }}</strong>
        </div>
      </div>

      <div v-if="resolvedSelectedRoleDetail" class="mt-5 space-y-4">
        <div>
          <p class="enterprise-subheading">
            {{ t("app.role.meta.permissionCodes") }}
          </p>
          <p class="enterprise-copy">
            {{
              resolvedSelectedRoleDetail.permissionCodes.length > 0
                ? resolvedSelectedRoleDetail.permissionCodes.join(", ")
                : t("app.role.meta.empty")
            }}
          </p>
        </div>
        <div>
          <p class="enterprise-subheading">
            {{ t("app.role.meta.userIds") }}
          </p>
          <p class="enterprise-copy">
            {{
              resolvedSelectedRoleDetail.userIds.length > 0
                ? resolvedSelectedRoleDetail.userIds.join(", ")
                : t("app.role.meta.empty")
            }}
          </p>
        </div>
        <div>
          <p class="enterprise-subheading">
            {{ t("app.role.meta.deptIds") }}
          </p>
          <p class="enterprise-copy">
            {{
              resolvedSelectedRoleDetail.deptIds.length > 0
                ? resolvedSelectedRoleDetail.deptIds.join(", ")
                : t("app.role.meta.empty")
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
      {{ t("app.role.detailEmptyDescription") }}
    </div>
  </section>
</template>
