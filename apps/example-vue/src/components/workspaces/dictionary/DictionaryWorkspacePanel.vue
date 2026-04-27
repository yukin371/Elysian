<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"

import type {
  DictionaryItemRecord,
  DictionaryTypeRecord,
} from "../../../lib/platform-api"

type DictionaryWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface DictionaryWorkspacePanelProps {
  t: DictionaryWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewDictionaries: boolean
  canCreateDictionaryTypes: boolean
  canUpdateDictionaryTypes: boolean
  loading: boolean
  detailLoading: boolean
  errorMessage: string
  detailErrorMessage: string
  panelMode: "detail" | "create" | "edit"
  panelTitle: string
  panelDescription: string
  selectedDictionaryType: DictionaryTypeRecord | null
  selectedDictionaryTypeItems: DictionaryItemRecord[]
  formFields: ElyFormField[]
  formValues: ElyFormValues
  formCopy: ElyFormCopy
  localizeDictionaryStatus: (status: DictionaryItemRecord["status"]) => string
}

defineProps<DictionaryWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", record: DictionaryTypeRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.dictionary.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ panelTitle }}</h3>
    <p class="enterprise-copy">{{ panelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.dictionaryModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.dictionarySignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewDictionaries"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.dictionaryNoListPermission") }}
    </div>

    <div v-else-if="errorMessage" class="enterprise-inline-warning">
      {{ errorMessage }}
    </div>

    <div
      v-else-if="detailLoading && selectedDictionaryType"
      class="enterprise-inline-warning"
    >
      {{ t("app.dictionary.detailLoading") }}
    </div>

    <div v-else-if="detailErrorMessage" class="enterprise-inline-warning">
      {{ detailErrorMessage }}
    </div>

    <template v-else-if="panelMode === 'detail' && selectedDictionaryType">
      <div class="enterprise-button-row">
        <button
          v-if="canUpdateDictionaryTypes"
          type="button"
          class="enterprise-button"
          :disabled="loading || detailLoading"
          @click="emit('start-edit', selectedDictionaryType)"
        >
          {{ t("app.dictionary.action.edit") }}
        </button>
        <button
          v-if="canCreateDictionaryTypes"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.dictionary.action.create") }}
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
          <span>{{ t("app.dictionary.meta.itemCount") }}</span>
          <strong>{{ selectedDictionaryTypeItems.length }}</strong>
        </div>
        <div>
          <span>{{ t("app.dictionary.meta.defaultCount") }}</span>
          <strong>{{
            selectedDictionaryTypeItems.filter((item) => item.isDefault).length
          }}</strong>
        </div>
      </div>

      <div class="mt-5">
        <p class="enterprise-subheading">
          {{ t("app.dictionary.meta.items") }}
        </p>
        <div
          v-if="selectedDictionaryTypeItems.length === 0"
          class="enterprise-inline-warning mt-3"
        >
          {{ t("app.dictionary.meta.empty") }}
        </div>
        <div v-else class="mt-3 space-y-3">
          <div
            v-for="item in selectedDictionaryTypeItems"
            :key="item.id"
            class="enterprise-metadata"
          >
            <div>
              <span>{{ item.value }}</span>
              <strong>{{ item.label }}</strong>
            </div>
            <div>
              <span>{{ t("app.dictionary.meta.itemStatus") }}</span>
              <strong>{{ localizeDictionaryStatus(item.status) }}</strong>
            </div>
            <div>
              <span>{{ t("app.dictionary.meta.itemSort") }}</span>
              <strong>{{ item.sort }}</strong>
            </div>
            <div>
              <span>{{ t("app.dictionary.meta.itemDefault") }}</span>
              <strong>{{
                item.isDefault
                  ? t("app.dictionary.boolean.true")
                  : t("app.dictionary.boolean.false")
              }}</strong>
            </div>
          </div>
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
      {{ t("app.dictionary.detailEmptyDescription") }}
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
