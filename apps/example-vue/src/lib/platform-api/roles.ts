import { requestBlob, requestJson } from "./core"
import type {
  OpenApiCreateRoleInput,
  OpenApiRoleDetailRecord,
  OpenApiRoleRecord,
  OpenApiRolesResponse,
  OpenApiUpdateRoleInput,
} from "./generated-types"

export type RoleRecord = OpenApiRoleRecord
export type RoleDetailRecord = OpenApiRoleDetailRecord
export type RolesResponse = OpenApiRolesResponse

export interface RoleListQuery {
  page?: number
  pageSize?: number
}

export type CreateRoleRequest = OpenApiCreateRoleInput
export type UpdateRoleRequest = OpenApiUpdateRoleInput

export const fetchRoles = async (
  query: RoleListQuery = {},
): Promise<RolesResponse> => {
  const search = new URLSearchParams()

  if (typeof query.page === "number" && Number.isFinite(query.page)) {
    search.set("page", String(Math.trunc(query.page)))
  }

  if (typeof query.pageSize === "number" && Number.isFinite(query.pageSize)) {
    search.set("pageSize", String(Math.trunc(query.pageSize)))
  }

  return requestJson<RolesResponse>(
    `/system/roles${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const exportRolesCsv = async (): Promise<Blob> =>
  requestBlob("/system/roles/export", {
    auth: true,
  })

export const fetchRoleById = async (id: string): Promise<RoleDetailRecord> =>
  requestJson<RoleDetailRecord>(`/system/roles/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const createRole = async (
  input: CreateRoleRequest,
): Promise<RoleDetailRecord> =>
  requestJson<RoleDetailRecord>("/system/roles", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateRole = async (
  id: string,
  input: UpdateRoleRequest,
): Promise<RoleDetailRecord> =>
  requestJson<RoleDetailRecord>(`/system/roles/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })
