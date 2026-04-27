import type { TenantRecord } from "./platform-api"

export interface TenantWorkspaceQuery {
  code?: string
  name?: string
  status?: TenantRecord["status"] | ""
}

export interface TenantTableItem
  extends Omit<TenantRecord, "status" | "createdAt" | "updatedAt"> {
  status: string
  createdAt: string
  updatedAt: string
}

const normalizeTenantQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const createDefaultTenantDraft = () => ({
  code: "",
  name: "",
  status: "active" as TenantRecord["status"],
})

export const normalizeTenantText = (value: unknown) =>
  String(value ?? "").trim()

export const normalizeTenantStatus = (
  value: unknown,
): TenantRecord["status"] => (value === "suspended" ? "suspended" : "active")

export const filterTenants = (
  tenants: TenantRecord[],
  query: TenantWorkspaceQuery,
) => {
  const code = normalizeTenantQueryValue(query.code)
  const name = normalizeTenantQueryValue(query.name)
  const status = query.status ?? ""

  return tenants.filter((tenant) => {
    if (code.length > 0 && !tenant.code.toLowerCase().includes(code)) {
      return false
    }

    if (name.length > 0 && !tenant.name.toLowerCase().includes(name)) {
      return false
    }

    if (status && tenant.status !== status) {
      return false
    }

    return true
  })
}

export const resolveTenantSelection = (
  tenants: Array<Pick<TenantRecord, "id">>,
  selectedTenantId: string | null,
) => {
  if (tenants.length === 0) {
    return null
  }

  if (
    selectedTenantId &&
    tenants.some((tenant) => tenant.id === selectedTenantId)
  ) {
    return selectedTenantId
  }

  return tenants[0]?.id ?? null
}

export const createTenantTableItems = (
  tenants: TenantRecord[],
  options: {
    localizeStatus: (status: TenantRecord["status"]) => string
    formatDateTime: (value: string) => string
  },
): TenantTableItem[] =>
  tenants.map((tenant) => ({
    ...tenant,
    status: options.localizeStatus(tenant.status),
    createdAt: options.formatDateTime(tenant.createdAt),
    updatedAt: options.formatDateTime(tenant.updatedAt),
  }))
