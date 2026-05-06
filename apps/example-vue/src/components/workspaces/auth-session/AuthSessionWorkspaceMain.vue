<script setup lang="ts">
import {
  ElyCrudWorkspace,
  type ElyCrudWorkspaceProps,
  type ElyQueryField,
  type ElyQueryValues,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { computed, ref, watch } from "vue"

type AuthSessionWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface AuthSessionWorkspaceMainProps {
  t: AuthSessionWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  loading: boolean
  errorMessage: string
  queryFields: ElyQueryField[]
  tableColumns: ElyTableColumn[]
  items: ReadonlyArray<Record<string, unknown>>
  itemCountLabel: string
  emptyTitle: string
  emptyDescription: string
  currentQuerySummary: string
  copy: ElyCrudWorkspaceProps["copy"]
}

const props = defineProps<AuthSessionWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "row-click", row: Record<string, unknown>): void
}>()

const pageSizeOptions = [20, 50, 100]
const currentPage = ref(1)
const pageSize = ref(20)
const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.items.length / pageSize.value)),
)
const pageStart = computed(() =>
  props.items.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1,
)
const pageEnd = computed(() =>
  Math.min(props.items.length, currentPage.value * pageSize.value),
)
const paginatedItems = computed(
  () =>
    props.items.slice(
      (currentPage.value - 1) * pageSize.value,
      currentPage.value * pageSize.value,
    ) as Record<string, unknown>[],
)
const paginatedCountLabel = computed(() =>
  props.t("app.onlineSession.countLabel", {
    visible: paginatedItems.value.length,
    total: props.items.length,
  }),
)
const paginationSummary = computed(() =>
  props.t("app.pagination.summary", {
    page: currentPage.value,
    totalPages: totalPages.value,
    start: pageStart.value,
    end: pageEnd.value,
    total: props.items.length,
  }),
)

const goPreviousPage = () => {
  currentPage.value = Math.max(1, currentPage.value - 1)
}

const goNextPage = () => {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
}

const updatePageSize = (event: Event) => {
  const nextValue = Number((event.target as HTMLSelectElement).value)

  pageSize.value = pageSizeOptions.includes(nextValue) ? nextValue : 20
  currentPage.value = 1
}

watch(
  () => props.items,
  () => {
    currentPage.value = Math.min(currentPage.value, totalPages.value)
  },
)
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <div v-if="!moduleReady" class="enterprise-message enterprise-message-warning">
      {{ t("app.message.onlineSessionModuleOffline") }}
    </div>

    <div
      v-else-if="authModuleReady && !isAuthenticated"
      class="enterprise-message enterprise-message-info"
    >
      {{ t("app.message.onlineSessionSignInToLoad") }}
    </div>

    <div
      v-else-if="!canEnterWorkspace"
      class="enterprise-message enterprise-message-warning"
    >
      {{ t("app.message.onlineSessionNoAccess") }}
    </div>

    <div v-else-if="errorMessage" class="enterprise-message enterprise-message-danger">
      {{ errorMessage }}
    </div>

    <ElyCrudWorkspace
      v-else
      :eyebrow="t('app.onlineSession.workspaceEyebrow')"
      :title="t('app.onlineSession.workspaceTitle')"
      :description="''"
      :query-fields="queryFields"
      :query-loading="loading"
      :table-columns="tableColumns"
      :items="paginatedItems"
      :table-loading="loading"
      :table-actions="[]"
      :item-count-label="paginatedCountLabel"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      :copy="copy"
      @search="emit('search', $event)"
      @reset="emit('reset')"
      @row-click="emit('row-click', $event as Record<string, unknown>)"
    >
      <template #toolbar>
        <span class="enterprise-toolbar-pill">
          {{ currentQuerySummary }}
        </span>
      </template>
      <template #footer>
        <div class="online-session-pagination">
          <span>{{ paginationSummary }}</span>
          <label>
            <small>{{ t("app.pagination.pageSize") }}</small>
            <select :value="pageSize" @change="updatePageSize">
              <option
                v-for="option in pageSizeOptions"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </label>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="currentPage <= 1"
            @click="goPreviousPage"
          >
            {{ t("app.pagination.previous") }}
          </button>
          <button
            type="button"
            class="enterprise-button enterprise-button-ghost"
            :disabled="currentPage >= totalPages"
            @click="goNextPage"
          >
            {{ t("app.pagination.next") }}
          </button>
        </div>
      </template>
    </ElyCrudWorkspace>
  </section>
</template>

<style scoped>
.enterprise-message {
  border-radius: 12px;
  padding: 1rem 1.1rem;
  line-height: 1.75;
}

.enterprise-message-info {
  border: 1px solid rgba(14, 165, 233, 0.18);
  background: rgba(14, 165, 233, 0.08);
  color: #0c4a6e;
}

.enterprise-message-warning {
  border: 1px solid rgba(245, 158, 11, 0.18);
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.enterprise-message-danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.08);
  color: #991b1b;
}

.enterprise-toolbar-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  padding: 0.45rem 0.85rem;
  font-size: 0.78rem;
  color: #475569;
}

.online-session-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  color: #475569;
  font-size: 0.82rem;
}

.online-session-pagination label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.online-session-pagination small {
  color: #64748b;
}

.online-session-pagination select {
  height: 2rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 4px;
  background: white;
  color: #0f172a;
}
</style>
