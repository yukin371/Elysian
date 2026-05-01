export interface PaginationQuery {
  page?: number
  pageSize?: number
}

export interface NormalizedPagination {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const normalizePagination = (
  query: PaginationQuery | undefined,
  defaultPageSize: number,
  maxPageSize = 100,
): NormalizedPagination => {
  const page =
    typeof query?.page === "number" && Number.isFinite(query.page)
      ? Math.max(1, Math.trunc(query.page))
      : 1
  const pageSize =
    typeof query?.pageSize === "number" && Number.isFinite(query.pageSize)
      ? Math.min(maxPageSize, Math.max(1, Math.trunc(query.pageSize)))
      : defaultPageSize

  return {
    page,
    pageSize,
  }
}

export const buildPaginatedResult = <T>(
  items: T[],
  total: number,
  pagination: NormalizedPagination,
): PaginatedResult<T> => {
  const totalPages =
    total === 0 ? 1 : Math.max(1, Math.ceil(total / pagination.pageSize))
  const page = Math.min(pagination.page, totalPages)

  return {
    items,
    total,
    page,
    pageSize: pagination.pageSize,
    totalPages,
  }
}
