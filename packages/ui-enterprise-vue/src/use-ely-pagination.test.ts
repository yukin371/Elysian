import { describe, expect, it } from "bun:test"
import { computed, ref } from "vue"

import { useElyPagination } from "./use-ely-pagination"

const mockT = (key: string, params?: Record<string, unknown>) => {
  if (key === "app.pagination.summary") {
    return `${params?.page}/${params?.totalPages} (${params?.start}-${params?.end}/${params?.total})`
  }

  return key
}

const makeItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `Item ${i + 1}`,
  }))

describe("useElyPagination", () => {
  it("paginates items with default page size", () => {
    const items = ref(makeItems(50))
    const pagination = useElyPagination(items, { t: mockT })

    expect(pagination.currentPage.value).toBe(1)
    expect(pagination.pageSize.value).toBe(20)
    expect(pagination.totalPages.value).toBe(3)
    expect(pagination.total.value).toBe(50)
    expect(pagination.paginatedItems.value).toHaveLength(20)
    expect(pagination.pageStart.value).toBe(1)
    expect(pagination.pageEnd.value).toBe(20)
  })

  it("navigates pages", () => {
    const items = ref(makeItems(50))
    const pagination = useElyPagination(items, { t: mockT })

    pagination.goNextPage()
    expect(pagination.currentPage.value).toBe(2)
    expect(pagination.paginatedItems.value[0]?.name).toBe("Item 21")

    pagination.goNextPage()
    expect(pagination.currentPage.value).toBe(3)
    expect(pagination.paginatedItems.value).toHaveLength(10)

    pagination.goNextPage()
    expect(pagination.currentPage.value).toBe(3)
  })

  it("respects custom page size", () => {
    const items = ref(makeItems(25))
    const pagination = useElyPagination(items, {
      t: mockT,
      pageSize: 10,
      pageSizeOptions: [10, 25, 50],
    })

    expect(pagination.pageSize.value).toBe(10)
    expect(pagination.totalPages.value).toBe(3)
    expect(pagination.paginatedItems.value).toHaveLength(10)
  })

  it("handles empty items", () => {
    const items = ref(makeItems(0))
    const pagination = useElyPagination(items, { t: mockT })

    expect(pagination.total.value).toBe(0)
    expect(pagination.totalPages.value).toBe(1)
    expect(pagination.paginatedItems.value).toHaveLength(0)
    expect(pagination.pageStart.value).toBe(0)
    expect(pagination.pageEnd.value).toBe(0)
  })

  it("formats pagination summary", () => {
    const items = ref(makeItems(25))
    const pagination = useElyPagination(items, { t: mockT, pageSize: 10 })

    expect(pagination.paginationSummary.value).toBe("1/3 (1-10/25)")

    pagination.goNextPage()
    expect(pagination.paginationSummary.value).toBe("2/3 (11-20/25)")
  })

  it("works with computed items", () => {
    const source = ref(makeItems(30))
    const items = computed(() => source.value.slice(0, 20))
    const pagination = useElyPagination(items, { t: mockT })

    expect(pagination.total.value).toBe(20)
    expect(pagination.paginatedItems.value).toHaveLength(20)
  })

  it("resets page when items shrink below current page", () => {
    const items = ref(makeItems(50))
    const pagination = useElyPagination(items, { t: mockT, pageSize: 10 })

    pagination.goNextPage()
    pagination.goNextPage()
    expect(pagination.currentPage.value).toBe(3)

    items.value = makeItems(15)
    expect(pagination.currentPage.value).toBe(2)
  })
})

describe("useElyPagination server mode", () => {
  it("passes items through without slicing", () => {
    const items = ref(makeItems(10))
    const pagination = useElyPagination(items, {
      t: mockT,
      mode: "server",
      serverTotal: 100,
    })

    // 10 items from server, but total is 100
    expect(pagination.paginatedItems.value).toHaveLength(10)
    expect(pagination.total.value).toBe(100)
    expect(pagination.totalPages.value).toBe(5)
  })

  it("uses serverTotal for page calculations", () => {
    const items = ref(makeItems(10))
    const pagination = useElyPagination(items, {
      t: mockT,
      mode: "server",
      serverTotal: 50,
      pageSize: 10,
    })

    expect(pagination.totalPages.value).toBe(5)
    expect(pagination.paginationSummary.value).toBe("1/5 (1-10/50)")

    pagination.goNextPage()
    expect(pagination.currentPage.value).toBe(2)
    // Items still pass through without slicing
    expect(pagination.paginatedItems.value).toHaveLength(10)
  })

  it("falls back to items length when serverTotal is not provided", () => {
    const items = ref(makeItems(10))
    const pagination = useElyPagination(items, {
      t: mockT,
      mode: "server",
    })

    expect(pagination.total.value).toBe(10)
    expect(pagination.paginatedItems.value).toHaveLength(10)
  })
})
