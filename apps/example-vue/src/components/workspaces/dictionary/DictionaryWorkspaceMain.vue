<script setup lang="ts">
import {
  ElyCrudWorkspace,
  type ElyCrudWorkspaceProps,
  type ElyQueryField,
  type ElyQueryValues,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { DictionaryTypeRecord } from "../../../lib/platform-api"

type DictionaryWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface DictionaryWorkspaceMainProps {
  t: DictionaryWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewDictionaries: boolean
  queryFields: ElyQueryField[]
  tableColumns: ElyTableColumn[]
  itemCountLabel: string
  emptyTitle: string
  emptyDescription: string
  currentQuerySummary: string
  copy: ElyCrudWorkspaceProps["copy"]
  workspaceStateInjected?: boolean
}

const props = defineProps<DictionaryWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "row-click", row: DictionaryTypeRecord): void
}>()

interface DictionaryWorkspaceInjectedState {
  dictionaryErrorMessage: { value: string }
  dictionaryLoading: { value: boolean }
  tableItems: { value: DictionaryTypeRecord[] }
}

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedDictionaryWorkspaceState =
  computed<DictionaryWorkspaceInjectedState | null>(() => {
    const context = injectedWorkspaceState.value

    if (!props.workspaceStateInjected || context?.kind !== "dictionary") {
      return null
    }

    return context.state as DictionaryWorkspaceInjectedState
  })

const resolvedLoading = computed(
  () =>
    resolvedDictionaryWorkspaceState.value?.dictionaryLoading.value ?? false,
)
const resolvedErrorMessage = computed(
  () =>
    resolvedDictionaryWorkspaceState.value?.dictionaryErrorMessage.value ?? "",
)
const resolvedItems = computed(
  () => resolvedDictionaryWorkspaceState.value?.tableItems.value ?? [],
)
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <div v-if="!moduleReady" class="enterprise-message enterprise-message-warning">
      {{ t("app.message.dictionaryModuleOffline") }}
    </div>

    <div
      v-else-if="authModuleReady && !isAuthenticated"
      class="enterprise-message enterprise-message-info"
    >
      {{ t("app.message.dictionarySignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewDictionaries"
      class="enterprise-message enterprise-message-warning"
    >
      {{ t("app.message.dictionaryNoListPermission") }}
    </div>

    <div
      v-else-if="resolvedErrorMessage"
      class="enterprise-message enterprise-message-danger"
    >
      {{ resolvedErrorMessage }}
    </div>

    <ElyCrudWorkspace
      v-else
      :eyebrow="t('app.dictionary.workspaceEyebrow')"
      :title="t('app.dictionary.workspaceTitle')"
      :description="''"
      :query-fields="queryFields"
      :query-loading="resolvedLoading"
      :table-columns="tableColumns"
      :items="resolvedItems"
      :table-loading="resolvedLoading"
      :table-actions="[]"
      :item-count-label="itemCountLabel"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      :copy="copy"
      @search="emit('search', $event)"
      @reset="emit('reset')"
      @row-click="emit('row-click', $event as DictionaryTypeRecord)"
    >
      <template #toolbar>
        <span class="enterprise-toolbar-pill">
          {{ currentQuerySummary }}
        </span>
      </template>
    </ElyCrudWorkspace>
  </section>
</template>
