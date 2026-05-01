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
import type { MenuRecord } from "../../../lib/platform-api"
import { resolveMenuWorkspaceMainState } from "./menu-workspace-state"

type MenuWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface MenuWorkspaceMainProps {
  t: MenuWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewMenus: boolean
  queryFields: ElyQueryField[]
  tableColumns: ElyTableColumn[]
  itemCountLabel: string
  emptyTitle: string
  emptyDescription: string
  currentQuerySummary: string
  copy: ElyCrudWorkspaceProps["copy"]
  workspaceStateInjected?: boolean
}

const props = defineProps<MenuWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "row-click", row: MenuRecord): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedMenuWorkspaceState = computed(() =>
  resolveMenuWorkspaceMainState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = computed(
  () => resolvedMenuWorkspaceState.value?.menuLoading.value ?? false,
)
const resolvedErrorMessage = computed(
  () => resolvedMenuWorkspaceState.value?.menuErrorMessage.value ?? "",
)
const resolvedItems = computed(
  () => resolvedMenuWorkspaceState.value?.tableItems.value ?? [],
)
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <div v-if="!moduleReady" class="enterprise-message enterprise-message-warning">
      {{ t("app.message.menuModuleOffline") }}
    </div>

    <div
      v-else-if="authModuleReady && !isAuthenticated"
      class="enterprise-message enterprise-message-info"
    >
      {{ t("app.message.menuSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewMenus"
      class="enterprise-message enterprise-message-warning"
    >
      {{ t("app.message.menuNoListPermission") }}
    </div>

    <div
      v-else-if="resolvedErrorMessage"
      class="enterprise-message enterprise-message-danger"
    >
      {{ resolvedErrorMessage }}
    </div>

    <ElyCrudWorkspace
      v-else
      :eyebrow="t('app.menu.workspaceEyebrow')"
      :title="t('app.menu.workspaceTitle')"
      :description="t('app.menu.workspaceDescription')"
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
      @row-click="emit('row-click', $event as MenuRecord)"
    >
      <template #toolbar>
        <span class="enterprise-toolbar-pill">
          {{ currentQuerySummary }}
        </span>
      </template>
    </ElyCrudWorkspace>
  </section>
</template>
