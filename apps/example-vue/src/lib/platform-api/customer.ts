import { requestJson } from "./core"

export interface CustomerRecord {
  id: string
  name: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface CustomersResponse {
  items: CustomerRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CustomerListQuery {
  q?: string
  status?: CustomerRecord["status"]
  page?: number
  pageSize?: number
  sortBy?: "createdAt" | "name"
  sortOrder?: "asc" | "desc"
}

export const fetchCustomers = async (
  query: CustomerListQuery = {},
): Promise<CustomersResponse> => {
  const search = new URLSearchParams()

  if (query.q?.trim()) {
    search.set("q", query.q.trim())
  }

  if (query.status) {
    search.set("status", query.status)
  }

  if (typeof query.page === "number") {
    search.set("page", String(query.page))
  }

  if (typeof query.pageSize === "number") {
    search.set("pageSize", String(query.pageSize))
  }

  if (query.sortBy) {
    search.set("sortBy", query.sortBy)
  }

  if (query.sortOrder) {
    search.set("sortOrder", query.sortOrder)
  }

  return requestJson<CustomersResponse>(
    `/customers${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const createCustomer = (input: {
  name: string
  status: "active" | "inactive"
}): Promise<CustomerRecord> =>
  requestJson<CustomerRecord>("/customers", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateCustomer = (
  id: string,
  input: { name?: string; status?: "active" | "inactive" },
): Promise<CustomerRecord> =>
  requestJson<CustomerRecord>(`/customers/${id}`, {
    method: "PUT",
    body: input,
    auth: true,
  })

export const deleteCustomer = (id: string): Promise<void> =>
  requestJson<void>(`/customers/${id}`, {
    method: "DELETE",
    auth: true,
  })
