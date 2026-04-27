<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"

import type { MenuDetailRecord, MenuRecord } from "../../../lib/platform-api"

type MenuWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface MenuWorkspacePanelProps {
  t: MenuWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewMenus: boolean
  canCreateMenus: boolean
  canUpdateMenus: boolean
  loading: boolean
  detailLoading: boolean
  errorMessage: string
  detailErrorMessage: string
  panelMode: "detail" | "create" | "edit"
  panelTitle: string
  panelDescription: string
  selectedMenu: MenuRecord | null
  selectedMenuDetail: MenuDetailRecord | null
  formFields: ElyFormField[]
  formValues: ElyFormValues
  formCopy: ElyFormCopy
  menuParentLookup: Map<string, MenuRecord>
}

defineProps<MenuWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", record: MenuRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.menu.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ panelTitle }}</h3>
    <p class="enterprise-copy">{{ panelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.menuModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.menuSignInToLoad") }}
    </div>

    <div v-else-if="canEnterWorkspace && !canViewMenus" class="enterprise-inline-warning">
      {{ t("app.message.menuNoListPermission") }}
    </div>

    <div v-else-if="errorMessage" class="enterprise-inline-warning">
      {{ errorMessage }}
    </div>

    <div v-else-if="detailLoading && selectedMenu" class="enterprise-inline-warning">
      {{ t("app.menu.detailLoading") }}
    </div>

    <div v-else-if="detailErrorMessage" class="enterprise-inline-warning">
      {{ detailErrorMessage }}
    </div>

    <template v-else-if="panelMode === 'detail' && selectedMenu">
      <div class="enterprise-button-row">
        <button
          v-if="canUpdateMenus"
          type="button"
          class="enterprise-button"
          :disabled="loading || detailLoading"
          @click="emit('start-edit', selectedMenu)"
        >
          {{ t("app.menu.action.edit") }}
        </button>
        <button
          v-if="canCreateMenus"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.menu.action.create") }}
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

      <div class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.menu.meta.parent") }}</span>
          <strong>{{
            selectedMenu.parentId
              ? (menuParentLookup.get(selectedMenu.parentId)?.name ??
                selectedMenu.parentId)
              : t("app.menu.parentRoot")
          }}</strong>
        </div>
        <div v-if="selectedMenuDetail">
          <span>{{ t("app.menu.meta.roleCount") }}</span>
          <strong>{{ selectedMenuDetail.roleIds.length }}</strong>
        </div>
      </div>

      <div v-if="selectedMenuDetail" class="mt-5 space-y-4">
        <div>
          <p class="enterprise-subheading">
            {{ t("app.menu.meta.roleIds") }}
          </p>
          <p class="enterprise-copy">
            {{
              selectedMenuDetail.roleIds.length > 0
                ? selectedMenuDetail.roleIds.join(", ")
                : t("app.menu.meta.empty")
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
      {{ t("app.menu.detailEmptyDescription") }}
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
