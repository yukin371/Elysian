<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"

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
  loading: boolean
  detailLoading: boolean
  errorMessage: string
  detailErrorMessage: string
  panelMode: "detail" | "create" | "edit"
  panelTitle: string
  panelDescription: string
  selectedRole: RoleRecord | null
  selectedRoleDetail: RoleDetailRecord | null
  formFields: ElyFormField[]
  formValues: ElyFormValues
  formCopy: ElyFormCopy
}

defineProps<RoleWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", role: RoleRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.role.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ panelTitle }}</h3>
    <p class="enterprise-copy">{{ panelDescription }}</p>

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

    <div v-else-if="errorMessage" class="enterprise-inline-warning">
      {{ errorMessage }}
    </div>

    <div v-else-if="detailLoading && selectedRole" class="enterprise-inline-warning">
      {{ t("app.role.detailLoading") }}
    </div>

    <div v-else-if="detailErrorMessage" class="enterprise-inline-warning">
      {{ detailErrorMessage }}
    </div>

    <template v-else-if="panelMode === 'detail' && selectedRole">
      <div class="enterprise-button-row">
        <button
          v-if="canUpdateRoles"
          type="button"
          class="enterprise-button"
          :disabled="loading || detailLoading"
          @click="emit('start-edit', selectedRole)"
        >
          {{ t("app.role.action.edit") }}
        </button>
        <button
          v-if="canCreateRoles"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.role.action.create") }}
        </button>
      </div>

      <ElyForm
        class="mt-5"
        :fields="formFields"
        :values="formValues"
        readonly
        :loading="loading || detailLoading"
        :copy="formCopy"
      />

      <div v-if="selectedRoleDetail" class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.role.meta.permissionCount") }}</span>
          <strong>{{ selectedRoleDetail.permissionCodes.length }}</strong>
        </div>
        <div>
          <span>{{ t("app.role.meta.userCount") }}</span>
          <strong>{{ selectedRoleDetail.userIds.length }}</strong>
        </div>
        <div>
          <span>{{ t("app.role.meta.deptCount") }}</span>
          <strong>{{ selectedRoleDetail.deptIds.length }}</strong>
        </div>
      </div>

      <div v-if="selectedRoleDetail" class="mt-5 space-y-4">
        <div>
          <p class="enterprise-subheading">
            {{ t("app.role.meta.permissionCodes") }}
          </p>
          <p class="enterprise-copy">
            {{
              selectedRoleDetail.permissionCodes.length > 0
                ? selectedRoleDetail.permissionCodes.join(", ")
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
              selectedRoleDetail.userIds.length > 0
                ? selectedRoleDetail.userIds.join(", ")
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
              selectedRoleDetail.deptIds.length > 0
                ? selectedRoleDetail.deptIds.join(", ")
                : t("app.role.meta.empty")
            }}
          </p>
        </div>
      </div>
    </template>

    <template v-else-if="panelMode === 'create' || panelMode === 'edit'">
      <ElyForm
        class="mt-5"
        :fields="formFields"
        :values="formValues"
        :loading="loading || detailLoading"
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

<style scoped>
.enterprise-card {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  padding: 1.2rem;
  color: #0f172a;
}

.enterprise-eyebrow,
.enterprise-subheading,
.enterprise-heading,
.enterprise-copy,
.enterprise-inline-warning,
.enterprise-metadata span {
  margin: 0;
}

.enterprise-eyebrow,
.enterprise-subheading {
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

.enterprise-inline-warning {
  margin-top: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.16);
  background: rgba(255, 251, 235, 0.96);
  padding: 0.85rem 0.95rem;
  color: #92400e;
}

.enterprise-metadata {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  margin-top: 1rem;
}

.enterprise-metadata div {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(248, 250, 252, 0.58);
  padding: 0.85rem 0.95rem;
}

.enterprise-metadata strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
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
</style>
