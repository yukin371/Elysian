import { type ComputedRef, type Ref, computed, ref, watch } from "vue"

export interface UseElyPaginationOptions {
  pageSize?: number
  pageSizeOptions?: number[]
  t: (key: string, params?: Record<string, unknown>) => string
  mode?: "client" | "server"
  serverTotal?: number
}

export interface UseElyPaginationReturn<T> {
  currentPage: Ref<number>
  pageSize: Ref<number>
  pageSizeOptions: number[]
  totalPages: ComputedRef<number>
  pageStart: ComputedRef<number>
  pageEnd: ComputedRef<number>
  paginatedItems: ComputedRef<T[]>
  total: ComputedRef<number>
  paginationSummary: ComputedRef<string>
  goPreviousPage: () => void
  goNextPage: () => void
  updatePageSize: (event: Event) => void
}

export const useElyPagination = <T extends Record<string, unknown>>(
  items: ComputedRef<T[]> | Ref<T[]>,
  options: UseElyPaginationOptions,
): UseElyPaginationReturn<T> => {
  const pageSizeOptions = options.pageSizeOptions ?? [20, 50, 100]
  const currentPage = ref(1)
  const pageSize = ref(options.pageSize ?? 20)
  const isServer = options.mode === "server"

  const resolveItems = () => ("value" in items ? items.value : items) as T[]

  const clientTotal = computed(() => resolveItems().length)
  const total = computed(() =>
    isServer ? (options.serverTotal ?? clientTotal.value) : clientTotal.value,
  )

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(total.value / pageSize.value)),
  )

  const pageStart = computed(() =>
    total.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1,
  )

  const pageEnd = computed(() =>
    Math.min(total.value, currentPage.value * pageSize.value),
  )

  const paginatedItems = computed(() =>
    isServer
      ? resolveItems()
      : resolveItems().slice(
          (currentPage.value - 1) * pageSize.value,
          currentPage.value * pageSize.value,
        ),
  )

  const paginationSummary = computed(() =>
    options.t("app.pagination.summary", {
      page: currentPage.value,
      totalPages: totalPages.value,
      start: pageStart.value,
      end: pageEnd.value,
      total: total.value,
    }),
  )

  const goPreviousPage = () => {
    currentPage.value = Math.max(1, currentPage.value - 1)
  }

  const goNextPage = () => {
    currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
  }

  const updatePageSize = (eventOrValue: Event | number) => {
    const nextValue =
      typeof eventOrValue === "number"
        ? eventOrValue
        : Number((eventOrValue.target as HTMLSelectElement).value)

    pageSize.value = pageSizeOptions.includes(nextValue) ? nextValue : 20
    currentPage.value = 1
  }

  watch(
    total,
    () => {
      currentPage.value = Math.min(currentPage.value, totalPages.value)
    },
    { flush: "sync" },
  )

  return {
    currentPage,
    pageSize,
    pageSizeOptions,
    totalPages,
    pageStart,
    pageEnd,
    paginatedItems,
    total,
    paginationSummary,
    goPreviousPage,
    goNextPage,
    updatePageSize,
  }
}
