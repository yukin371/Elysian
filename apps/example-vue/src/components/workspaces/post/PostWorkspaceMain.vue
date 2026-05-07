<script setup lang="ts">
import {
  ElyCrudWorkbench,
  type ElyCrudWorkspaceCopy,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "../../../app/workspace-registry"
import type { PostRecord } from "../../../lib/platform-api"
import { resolvePostWorkspaceMainState } from "./post-workspace-state"

type PostWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface PostWorkspaceMainProps {
  t: PostWorkspaceTranslation
  tableColumns: ElyTableColumn[]
  emptyTitle: string
  emptyDescription: string
  copy: ElyCrudWorkspaceCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<PostWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "row-click", row: PostRecord): void
  (e: "search", value: string): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedPostWorkspaceState = computed(() =>
  resolvePostWorkspaceMainState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = computed(
  () => resolvedPostWorkspaceState.value?.postLoading.value ?? false,
)
const resolvedItems = computed(
  () => resolvedPostWorkspaceState.value?.tableItems.value ?? [],
)

const panelTitle = computed(() => props.t("app.post.workspaceTitle"))

const handleSearch = (value: string) => {
  emit("search", value)
}

const handleRowClick = (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const post = resolvedItems.value.find(
    (item: PostRecord) => item.id === rowId,
  )
  if (post) {
    emit("row-click", post)
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
    :search-placeholder="t('app.post.searchPlaceholder', '搜索文章...')"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :copy="copy"
    row-key="id"
    @search="handleSearch"
    @row-click="handleRowClick"
  />
</template>
