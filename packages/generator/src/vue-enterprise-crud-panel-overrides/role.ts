import type { ModuleSchema } from "@elysian/schema"
import { getPanelTemplatePermissionProps } from "./shared"
export const renderRolePanelTemplateOverride = (schema: ModuleSchema) => {
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
  resolveRoleWorkspacePanelState,
} from "./role-workspace"
import type { RoleRecord } from "./role.schema"

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
  ${viewPermission}: boolean
  ${createPermission}: boolean
  ${updatePermission}: boolean
  formCopy: ElyFormCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<RoleWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", role: RoleRecord): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedRoleWorkspaceState = computed(() =>
  resolveRoleWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.roleLoading ?? null),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.roleDetailLoading ?? null),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.roleErrorMessage ?? null),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () => resolvedRoleWorkspaceState.value?.roleDetailErrorMessage ?? null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.rolePanelMode ?? null),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedSelectedRole = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.selectedRole ?? null),
  null as RoleRecord | null,
)
const resolvedSelectedRoleDetail = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.selectedRoleDetail ?? null),
  null as {
    permissionCodes?: string[]
    userIds?: string[]
    deptIds?: string[]
  } | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
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
      v-else-if="canEnterWorkspace && !${viewPermission}"
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
          <strong>{{ resolvedSelectedRoleDetail.permissionCodes?.length ?? 0 }}</strong>
        </div>
        <div>
          <span>{{ t("app.role.meta.userCount") }}</span>
          <strong>{{ resolvedSelectedRoleDetail.userIds?.length ?? 0 }}</strong>
        </div>
        <div>
          <span>{{ t("app.role.meta.deptCount") }}</span>
          <strong>{{ resolvedSelectedRoleDetail.deptIds?.length ?? 0 }}</strong>
        </div>
      </div>

      <div v-if="resolvedSelectedRoleDetail" class="mt-5 space-y-4">
        <div>
          <p class="enterprise-subheading">
            {{ t("app.role.meta.permissionCodes") }}
          </p>
          <p class="enterprise-copy">
            {{
              (resolvedSelectedRoleDetail.permissionCodes?.length ?? 0) > 0
                ? resolvedSelectedRoleDetail.permissionCodes?.join(", ")
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
              (resolvedSelectedRoleDetail.userIds?.length ?? 0) > 0
                ? resolvedSelectedRoleDetail.userIds?.join(", ")
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
              (resolvedSelectedRoleDetail.deptIds?.length ?? 0) > 0
                ? resolvedSelectedRoleDetail.deptIds?.join(", ")
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
`
}
