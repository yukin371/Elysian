<script setup lang="ts">
import {
  ElyCrudWorkbench,
  type ElyCrudWorkspaceCopy,
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
  tableColumns: ElyTableColumn[]
  emptyTitle: string
  emptyDescription: string
  copy: ElyCrudWorkspaceCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<DictionaryWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "row-click", row: DictionaryTypeRecord): void
  (e: "search", value: string): void
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
const resolvedItems = computed(
  () => resolvedDictionaryWorkspaceState.value?.tableItems.value ?? [],
)

const panelTitle = computed(() => props.t("app.dictionary.workspaceTitle"))

const handleSearch = (value: string) => {
  emit("search", value)
}

const handleRowClick = (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const dict = resolvedItems.value.find(
    (item: DictionaryTypeRecord) => item.id === rowId,
  )
  if (dict) {
    emit("row-click", dict)
  }
}
</script>

<template>
  <ElyCrudWorkbench
    :title="panelTitle"
    :table-columns="tableColumns"
    :items="resolvedItems"
    :table-loading="resolvedLoading"
    :table-actions="[]"
    :search-placeholder="t('app.dictionary.searchPlaceholder', '搜索字典...')"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :copy="copy"
    row-key="id"
    @search="handleSearch"
    @row-click="handleRowClick"
  />
</template>
