import type { TenantStatus } from "@elysian/schema"

import { requestJson } from "./core"
import type {
  CreateTenantRequest,
  TenantRecord,
  TenantsResponse,
  UpdateTenantRequest,
} from "../platform-api"

export const fetchTenants = async (): Promise<TenantsResponse> =>
  requestJson<TenantsResponse>("/system/tenants", {
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
  status: TenantStatus,
): Promise<TenantRecord> =>
  requestJson<TenantRecord>(`/system/tenants/${encodeURIComponent(id)}/status`, {
    method: "PUT",
    body: { status },
    auth: true,
  })
