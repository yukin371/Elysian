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
import type { DepartmentRecord } from "../../../lib/platform-api"
import {
  readInjectedValue,
  resolveDepartmentWorkspaceMainState,
} from "./department-workspace-state"

type DepartmentWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface DepartmentWorkspaceMainProps {
  t: DepartmentWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  canViewDepartments: boolean
  loading: boolean
  errorMessage: string
  queryFields: ElyQueryField[]
  tableColumns: ElyTableColumn[]
  itemCountLabel: string
  emptyTitle: string
  emptyDescription: string
  currentQuerySummary: string
  copy: ElyCrudWorkspaceProps["copy"]
  workspaceStateInjected?: boolean
}

const props = defineProps<DepartmentWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "row-click", row: DepartmentRecord): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedDepartmentWorkspaceState = computed(() =>
  resolveDepartmentWorkspaceMainState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(
    () => resolvedDepartmentWorkspaceState.value?.departmentLoading ?? null,
  ),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedDepartmentWorkspaceState.value?.departmentErrorMessage ?? null,
  ),
  "",
)
const resolvedItems = readInjectedValue(
  computed(() => resolvedDepartmentWorkspaceState.value?.tableItems ?? null),
  [] as DepartmentRecord[],
)
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <div v-if="!moduleReady" class="enterprise-message enterprise-message-warning">
      {{ t("app.message.departmentModuleOffline") }}
    </div>

    <div
      v-else-if="authModuleReady && !isAuthenticated"
      class="enterprise-message enterprise-message-info"
    >
      {{ t("app.message.departmentSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canViewDepartments"
      class="enterprise-message enterprise-message-warning"
    >
      {{ t("app.message.departmentNoListPermission") }}
    </div>

    <div
      v-else-if="resolvedErrorMessage"
      class="enterprise-message enterprise-message-danger"
    >
      {{ resolvedErrorMessage }}
    </div>

    <ElyCrudWorkspace
      v-else
      :eyebrow="t('app.department.workspaceEyebrow')"
      :title="t('app.department.workspaceTitle')"
      :description="t('app.department.workspaceDescription')"
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
      @row-click="emit('row-click', $event as DepartmentRecord)"
    >
      <template #toolbar>
        <span class="enterprise-toolbar-pill">
          {{ currentQuerySummary }}
        </span>
      </template>
    </ElyCrudWorkspace>
  </section>
</template>
