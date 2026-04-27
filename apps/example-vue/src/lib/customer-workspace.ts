import type { ElyQueryValues } from "@elysian/ui-enterprise-vue"

import type { CustomerListQuery, CustomerRecord } from "./platform-api"

export type CustomerListSortValue =
  | "createdAt:desc"
  | "createdAt:asc"
  | "name:asc"
  | "name:desc"

export interface CustomerTableItem
  extends Omit<CustomerRecord, "status" | "createdAt" | "updatedAt"> {
  status: string
  createdAt: string
  updatedAt: string
}

export const createDefaultCustomerDraft = () => ({
  name: "",
  status: "active" as CustomerRecord["status"],
})

export const normalizeCustomerName = (value: unknown) =>
  String(value ?? "").trim()

export const normalizeCustomerStatus = (
  value: unknown,
): CustomerRecord["status"] => (value === "inactive" ? "inactive" : "active")

export const isCustomerListSortValue = (
  value: string,
): value is CustomerListSortValue =>
  value === "createdAt:desc" ||
  value === "createdAt:asc" ||
  value === "name:asc" ||
  value === "name:desc"

export const buildCustomerListQuery = (
  values: ElyQueryValues,
  options: {
    page: number
    pageSize: number
    sortValue: CustomerListSortValue
  },
): CustomerListQuery => {
  const query =
    typeof values.name === "string" && values.name.trim().length > 0
      ? values.name.trim()
      : undefined
  const status =
    values.status === "active" || values.status === "inactive"
      ? values.status
      : undefined

  return {
    q: query,
    status,
    page: options.page,
    pageSize: options.pageSize,
    sortBy: options.sortValue.startsWith("name") ? "name" : "createdAt",
    sortOrder: options.sortValue.endsWith(":asc") ? "asc" : "desc",
  }
}

export const resolveCustomerSelection = (
  customers: Array<Pick<CustomerRecord, "id">>,
  selectedCustomerId: string | null,
) => {
  if (customers.length === 0) {
    return null
  }

  if (
    selectedCustomerId &&
    customers.some((customer) => customer.id === selectedCustomerId)
  ) {
    return selectedCustomerId
  }

  return customers[0]?.id ?? null
}

export const createCustomerTableItems = (
  customers: CustomerRecord[],
  options: {
    localizeStatus: (status: CustomerRecord["status"]) => string
    formatDateTime: (value: string) => string
  },
): CustomerTableItem[] =>
  customers.map((customer) => ({
    ...customer,
    status: options.localizeStatus(customer.status),
    createdAt: options.formatDateTime(customer.createdAt),
    updatedAt: options.formatDateTime(customer.updatedAt),
  }))
