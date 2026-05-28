<script setup lang="ts">
import { computed } from "vue"

type PaginationEntry =
  | {
      key: string
      page: number
      type: "page"
    }
  | {
      key: string
      type: "ellipsis"
    }

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    currentPageLabel?: string
    ellipsisLabel?: string
    modelValue?: number
    nextLabel?: string
    pageLabel?: string
    pageCount: number
    previousLabel?: string
  }>(),
  {
    ariaLabel: "Pagination",
    currentPageLabel: "Current page",
    ellipsisLabel: "Skipped pages",
    modelValue: 1,
    nextLabel: "Next page",
    pageLabel: "Page",
    previousLabel: "Previous page",
  },
)

const emit = defineEmits<{
  "update:modelValue": [page: number]
}>()

const safePageCount = computed(() => Math.max(1, Math.floor(props.pageCount)))
const currentPage = computed(() =>
  Math.min(Math.max(1, Math.floor(props.modelValue)), safePageCount.value),
)

const visibleEntries = computed<PaginationEntry[]>(() => {
  const total = safePageCount.value
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => ({
      key: `page-${index + 1}`,
      page: index + 1,
      type: "page",
    }))
  }

  const pages = new Set([1, total, current - 1, current, current + 1])
  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  return sortedPages.flatMap((page, index) => {
    const previous = sortedPages[index - 1]
    const entries: PaginationEntry[] = []

    if (previous && page - previous > 1) {
      entries.push({ key: `ellipsis-${previous}-${page}`, type: "ellipsis" })
    }

    entries.push({ key: `page-${page}`, page, type: "page" })

    return entries
  })
})

const goToPage = (page: number) => {
  const nextPage = Math.min(Math.max(1, page), safePageCount.value)

  if (nextPage !== currentPage.value) {
    emit("update:modelValue", nextPage)
  }
}

const getPageAriaLabel = (page: number) =>
  page === currentPage.value
    ? `${props.currentPageLabel}, ${props.pageLabel} ${page}`
    : `${props.pageLabel} ${page}`
</script>

<template>
  <nav class="ely-public-pagination" :aria-label="ariaLabel">
    <button
      class="ely-public-pagination__button"
      :disabled="currentPage <= 1"
      type="button"
      @click="goToPage(currentPage - 1)"
    >
      {{ previousLabel }}
    </button>

    <ol class="ely-public-pagination__list">
      <li
        v-for="entry in visibleEntries"
        :key="entry.key"
        class="ely-public-pagination__item"
      >
        <button
          v-if="entry.type === 'page'"
          class="ely-public-pagination__page"
          :aria-current="entry.page === currentPage ? 'page' : undefined"
          :aria-label="getPageAriaLabel(entry.page)"
          :data-current="entry.page === currentPage ? 'true' : 'false'"
          type="button"
          @click="goToPage(entry.page)"
        >
          {{ entry.page }}
        </button>
        <span
          v-else
          class="ely-public-pagination__ellipsis"
        >
          <span aria-hidden="true">…</span>
          <span class="ely-public-sr-only">{{ ellipsisLabel }}</span>
        </span>
      </li>
    </ol>

    <button
      class="ely-public-pagination__button"
      :disabled="currentPage >= safePageCount"
      type="button"
      @click="goToPage(currentPage + 1)"
    >
      {{ nextLabel }}
    </button>
  </nav>
</template>
