import { requestJson } from "./core"

export interface RoleRecord {
  id: string
  code: string
  name: string
  description?: string
  status: "active" | "disabled"
  isSystem: boolean
  dataScope: 1 | 2 | 3 | 4 | 5
  createdAt: string
  updatedAt: string
}

export interface RoleDetailRecord extends RoleRecord {
  permissionCodes: string[]
  userIds: string[]
  deptIds: string[]
}

export interface RolesResponse {
  items: RoleRecord[]
}

export interface CreateRoleRequest {
  code: string
  name: string
  description?: string
  status?: RoleRecord["status"]
  isSystem?: boolean
  dataScope?: RoleRecord["dataScope"]
}

export interface UpdateRoleRequest {
  code?: string
  name?: string
  description?: string
  status?: RoleRecord["status"]
  isSystem?: boolean
  dataScope?: RoleRecord["dataScope"]
}

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
