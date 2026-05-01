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
import type { RoleRecord } from "../../../lib/platform-api"

type RoleWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface RoleWorkspaceMainProps {
  t: RoleWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewRoles: boolean
  queryFields: ElyQueryField[]
  tableColumns: ElyTableColumn[]
  itemCountLabel: string
  emptyTitle: string
  emptyDescription: string
  currentQuerySummary: string
  copy: ElyCrudWorkspaceProps["copy"]
  workspaceStateInjected?: boolean
}

const props = defineProps<RoleWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "row-click", row: RoleRecord): void
}>()

interface RoleWorkspaceInjectedState {
  roleErrorMessage: { value: string }
  roleLoading: { value: boolean }
  tableItems: { value: RoleRecord[] }
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
const resolvedErrorMessage = computed(
  () => resolvedRoleWorkspaceState.value?.roleErrorMessage.value ?? "",
)
const resolvedItems = computed(
  () => resolvedRoleWorkspaceState.value?.tableItems.value ?? [],
)
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <div v-if="!moduleReady" class="enterprise-message enterprise-message-warning">
      {{ t("app.message.roleModuleOffline") }}
    </div>

    <div
      v-else-if="authModuleReady && !isAuthenticated"
      class="enterprise-message enterprise-message-info"
    >
      {{ t("app.message.roleSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewRoles"
      class="enterprise-message enterprise-message-warning"
    >
      {{ t("app.message.roleNoListPermission") }}
    </div>

    <div
      v-else-if="resolvedErrorMessage"
      class="enterprise-message enterprise-message-danger"
    >
      {{ resolvedErrorMessage }}
    </div>

    <ElyCrudWorkspace
      v-else
      :eyebrow="t('app.role.workspaceEyebrow')"
      :title="t('app.role.workspaceTitle')"
      :description="t('app.role.workspaceDescription')"
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
      @row-click="emit('row-click', $event as RoleRecord)"
    >
      <template #toolbar>
        <span class="enterprise-toolbar-pill">
          {{ currentQuerySummary }}
        </span>
      </template>
    </ElyCrudWorkspace>
  </section>
</template>
