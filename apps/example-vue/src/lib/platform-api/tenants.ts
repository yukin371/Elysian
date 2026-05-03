import { requestBlob, requestJson } from "./core"
import type {
  OpenApiCreateTenantInput,
  OpenApiTenantRecord,
  OpenApiTenantsResponse,
  OpenApiUpdateTenantInput,
  OpenApiUpdateTenantStatusInput,
} from "./generated-types"

export type TenantRecord = OpenApiTenantRecord
export type TenantsResponse = OpenApiTenantsResponse
export type CreateTenantRequest = OpenApiCreateTenantInput
export type UpdateTenantRequest = OpenApiUpdateTenantInput

export const fetchTenants = async (): Promise<TenantsResponse> =>
  requestJson<TenantsResponse>("/system/tenants", {
    auth: true,
  })

export const exportTenantsCsv = async (): Promise<Blob> =>
  requestBlob("/system/tenants/export", {
    auth: true,
  })

export const fetchTenantById = async (id: string): Promise<TenantRecord> =>
  requestJson<TenantRecord>(`/system/tenants/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const createTenant = async (
  input: CreateTenantRequest,
): Promise<TenantRecord> =>
  requestJson<TenantRecord>("/system/tenants", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateTenant = async (
  id: string,
  input: UpdateTenantRequest,
): Promise<TenantRecord> =>
  requestJson<TenantRecord>(`/system/tenants/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })

export const updateTenantStatus = async (
  id: string,
  status: OpenApiUpdateTenantStatusInput["status"],
): Promise<TenantRecord> =>
  requestJson<TenantRecord>(
    `/system/tenants/${encodeURIComponent(id)}/status`,
    {
      method: "PUT",
      body: { status },
      auth: true,
    },
  )
