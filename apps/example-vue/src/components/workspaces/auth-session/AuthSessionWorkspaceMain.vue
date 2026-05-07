<script setup lang="ts">
import {
  ElyCrudWorkbench,
  type ElyCrudWorkspaceCopy,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { computed, ref, watch } from "vue"

type AuthSessionWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface AuthSessionWorkspaceMainProps {
  t: AuthSessionWorkspaceTranslation
  loading: boolean
  tableColumns: ElyTableColumn[]
  items: ReadonlyArray<Record<string, unknown>>
  emptyTitle: string
  emptyDescription: string
  copy: ElyCrudWorkspaceCopy
}

const props = defineProps<AuthSessionWorkspaceMainProps>()

const emit = defineEmits<{
  (e: "row-click", row: Record<string, unknown>): void
  (e: "search", value: string): void
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

const panelTitle = computed(() => props.t("app.onlineSession.workspaceTitle"))

const handleSearch = (value: string) => {
  emit("search", value)
}

const handleRowClick = (row: Record<string, unknown>) => {
  emit("row-click", row)
}
</script>

<template>
  <ElyCrudWorkbench
    :title="panelTitle"
    :table-columns="tableColumns"
    :items="paginatedItems"
    :table-loading="loading"
    :table-actions="[]"
    :item-count-label="paginatedCountLabel"
    :search-placeholder="t('app.onlineSession.searchPlaceholder', '搜索会话...')"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :copy="copy"
    @search="handleSearch"
    @row-click="handleRowClick"
  >
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
  </ElyCrudWorkbench>
</template>

<style scoped>
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
