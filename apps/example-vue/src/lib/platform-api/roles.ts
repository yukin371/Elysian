import { requestJson } from "./core"
import type {
  CreateRoleRequest,
  RoleDetailRecord,
  RolesResponse,
  UpdateRoleRequest,
} from "../platform-api"

export const fetchRoles = async (): Promise<RolesResponse> =>
  requestJson<RolesResponse>("/system/roles", {
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
