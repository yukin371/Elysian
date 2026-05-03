import type { ModuleSchema } from "@elysian/schema"
import { getPanelTemplatePermissionProps } from "./shared"
export const renderDictionaryPanelTemplateOverride = (schema: ModuleSchema) => {
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
  resolveDictionaryWorkspacePanelState,
} from "./dictionary-workspace"
import type { DictionaryRecord } from "./dictionary.schema"

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
  ${viewPermission}: boolean
  ${createPermission}: boolean
  ${updatePermission}: boolean
  formCopy: ElyFormCopy
  localizeDictionaryStatus: (status: string) => string
  workspaceStateInjected?: boolean
}

const props = defineProps<DictionaryWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", dictionary: DictionaryRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedDictionaryWorkspaceState = computed(() =>
  resolveDictionaryWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(
    () => resolvedDictionaryWorkspaceState.value?.dictionaryLoading ?? null,
  ),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(
    () =>
      resolvedDictionaryWorkspaceState.value?.dictionaryDetailLoading ?? null,
  ),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedDictionaryWorkspaceState.value?.dictionaryErrorMessage ?? null,
  ),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedDictionaryWorkspaceState.value?.dictionaryDetailErrorMessage ??
      null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(
    () => resolvedDictionaryWorkspaceState.value?.dictionaryPanelMode ?? null,
  ),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedDictionaryWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(
    () => resolvedDictionaryWorkspaceState.value?.panelDescription ?? null,
  ),
  "",
)
const resolvedSelectedDictionaryType = readInjectedValue(
  computed(
    () =>
      resolvedDictionaryWorkspaceState.value?.selectedDictionaryType ?? null,
  ),
  null as DictionaryRecord | null,
)
const resolvedSelectedDictionaryTypeItems = readInjectedValue(
  computed(
    () =>
      resolvedDictionaryWorkspaceState.value?.selectedDictionaryTypeItems ??
      null,
  ),
  [] as Array<{
    id?: string
    value?: string
    label?: string
    status?: string
    sort?: number
    isDefault?: boolean
  }>,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedDictionaryWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedDictionaryWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.dictionary.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.dictionaryModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.dictionarySignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !${viewPermission}"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.dictionaryNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedDictionaryType"
      class="enterprise-inline-warning"
    >
      {{ t("app.dictionary.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template
      v-else-if="
        resolvedPanelMode === 'detail' && resolvedSelectedDictionaryType
      "
    >
      <div class="enterprise-button-row">
        <button
          v-if="${updatePermission}"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedDictionaryType)"
        >
          {{ t("app.dictionary.action.edit") }}
        </button>
        <button
          v-if="${createPermission}"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.dictionary.action.create") }}
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
          <span>{{ t("app.dictionary.meta.itemCount") }}</span>
          <strong>{{ resolvedSelectedDictionaryTypeItems.length }}</strong>
        </div>
        <div>
          <span>{{ t("app.dictionary.meta.defaultCount") }}</span>
          <strong>{{
            resolvedSelectedDictionaryTypeItems.filter((item) => item.isDefault)
              .length
          }}</strong>
        </div>
      </div>

      <div class="mt-5">
        <p class="enterprise-subheading">
          {{ t("app.dictionary.meta.items") }}
        </p>
        <div
          v-if="resolvedSelectedDictionaryTypeItems.length === 0"
          class="enterprise-inline-warning mt-3"
        >
          {{ t("app.dictionary.meta.empty") }}
        </div>
        <div v-else class="mt-3 space-y-3">
          <div
            v-for="item in resolvedSelectedDictionaryTypeItems"
            :key="item.id"
            class="enterprise-metadata"
          >
            <div>
              <span>{{ item.value }}</span>
              <strong>{{ item.label }}</strong>
            </div>
            <div>
              <span>{{ t("app.dictionary.meta.itemStatus") }}</span>
              <strong>{{ localizeDictionaryStatus(String(item.status ?? "")) }}</strong>
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

    <template
      v-else-if="
        resolvedPanelMode === 'create' || resolvedPanelMode === 'edit'
      "
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
      {{ t("app.dictionary.detailEmptyDescription") }}
    </div>
  </section>
  </template>
`
}
