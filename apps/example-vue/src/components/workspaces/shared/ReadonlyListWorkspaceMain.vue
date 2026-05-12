<script setup lang="ts">
import {
  ElyCrudWorkspace,
  type ElyCrudWorkspaceCopy,
  type ElyQueryField,
  type ElyQueryValues,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { Empty as TEmpty } from "tdesign-vue-next/es/empty"
import { computed, ref, watch } from "vue"

type SharedWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface ReadonlyListWorkspaceMainProps {
  t: SharedWorkspaceTranslation
  queryFields: ElyQueryField[]
  queryLoading?: boolean
  tableColumns: ElyTableColumn[]
  items: ReadonlyArray<Record<string, unknown>>
  tableLoading?: boolean
  rowKey?: string
  itemCountLabel?: string
  countLabelKey?: string
  emptyTitle: string
  emptyDescription: string
  filteredEmptyTitle?: string
  filteredEmptyDescription?: string
  filterSummary?: string
  hasActiveFilters?: boolean
  recoveryHint?: string
  clearFiltersLabel?: string
  searchPlaceholder?: string
  copy: ElyCrudWorkspaceCopy
  paginate?: boolean
  pageSizeOptions?: number[]
}

const props = withDefaults(defineProps<ReadonlyListWorkspaceMainProps>(), {
  queryLoading: false,
  tableLoading: false,
  rowKey: "id",
  searchPlaceholder: "搜索...",
  paginate: false,
  pageSizeOptions: () => [20, 50, 100],
})

const emit = defineEmits<{
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "row-click", row: Record<string, unknown>): void
}>()

const currentPage = ref(1)
const pageSize = ref(props.pageSizeOptions[0] ?? 20)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.items.length / pageSize.value)),
)
const pageStart = computed(() =>
  props.items.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1,
)
const pageEnd = computed(() =>
  Math.min(props.items.length, currentPage.value * pageSize.value),
)
const displayedItems = computed<Record<string, unknown>[]>(() => {
  if (!props.paginate) {
    return [...props.items]
  }

  return props.items.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value,
  )
})

const resolvedItemCountLabel = computed(() => {
  if (!props.countLabelKey) {
    return props.itemCountLabel
  }

  return props.t(props.countLabelKey, {
    visible: displayedItems.value.length,
    total: props.items.length,
  })
})

const emptyTitle = computed(() =>
  props.hasActiveFilters
    ? (props.filteredEmptyTitle ?? props.emptyTitle)
    : props.emptyTitle,
)

const emptyDescription = computed(() =>
  props.hasActiveFilters
    ? (props.filteredEmptyDescription ?? props.emptyDescription)
    : props.emptyDescription,
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

const queryFields = computed<ElyQueryField[]>(() =>
  props.queryFields.map((field) =>
    field.kind === "text"
      ? { ...field, placeholder: field.placeholder ?? props.searchPlaceholder }
      : field,
  ),
)

const goPreviousPage = () => {
  currentPage.value = Math.max(1, currentPage.value - 1)
}

const goNextPage = () => {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
}

const updatePageSize = (event: Event) => {
  const nextValue = Number((event.target as HTMLSelectElement).value)

  pageSize.value = props.pageSizeOptions.includes(nextValue)
    ? nextValue
    : (props.pageSizeOptions[0] ?? 20)
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
  <ElyCrudWorkspace
    eyebrow=""
    title=""
    description=""
    :query-fields="queryFields"
    :query-loading="queryLoading"
    :table-columns="tableColumns"
    :items="displayedItems"
    :table-loading="tableLoading"
    :table-actions="[]"
    :row-key="rowKey"
    :item-count-label="resolvedItemCountLabel"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :copy="copy"
    @search="emit('search', $event)"
    @reset="emit('reset')"
    @row-click="emit('row-click', $event)"
  >
    <template #empty>
      <div v-if="items.length === 0 && !tableLoading" class="readonly-list-empty">
        <TEmpty :title="emptyTitle" :description="emptyDescription">
          <template #image>
            <div class="readonly-list-empty__orbit">∿</div>
          </template>
        </TEmpty>

        <div
          v-if="hasActiveFilters || recoveryHint"
          class="readonly-list-empty__recovery"
        >
          <p v-if="hasActiveFilters && filterSummary" class="readonly-list-empty__summary">
            {{ filterSummary }}
          </p>
          <p v-if="recoveryHint" class="readonly-list-empty__hint">
            {{ recoveryHint }}
          </p>
          <button
            v-if="hasActiveFilters"
            type="button"
            class="enterprise-button enterprise-button-ghost"
            @click="emit('reset')"
          >
            {{ clearFiltersLabel ?? t("copy.query.resetButton") }}
          </button>
        </div>
      </div>
    </template>

    <template v-if="paginate" #footer>
      <div class="readonly-list-pagination">
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
</template>

<style scoped>
.readonly-list-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  color: #475569;
  font-size: 0.82rem;
}

.readonly-list-pagination label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.readonly-list-pagination small {
  color: #64748b;
}

.readonly-list-pagination select {
  height: 2rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 4px;
  background: white;
  color: #0f172a;
}

.readonly-list-empty {
  display: grid;
  place-items: center;
  min-height: 320px;
  padding: 1.25rem 0;
}

.readonly-list-empty__orbit {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 6px;
  background: rgba(36, 87, 214, 0.1);
  color: #2457d6;
  font-size: 1.8rem;
  font-weight: 700;
}

.readonly-list-empty__recovery {
  display: grid;
  gap: 0.55rem;
  justify-items: center;
  max-width: 38rem;
  margin-top: 1rem;
  text-align: center;
}

.readonly-list-empty__summary {
  margin: 0;
  color: #0f172a;
  font-size: 0.85rem;
  line-height: 1.6;
}

.readonly-list-empty__hint {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.6;
}
</style>
