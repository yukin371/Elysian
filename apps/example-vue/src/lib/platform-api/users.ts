import { requestJson } from "./core"

export interface UserRecord {
  id: string
  username: string
  displayName: string
  email?: string
  phone?: string
  status: "active" | "disabled"
  isSuperAdmin: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UsersResponse {
  items: UserRecord[]
}

export interface CreateUserRequest {
  username: string
  displayName: string
  email?: string
  phone?: string
  password: string
  status?: UserRecord["status"]
  isSuperAdmin?: boolean
}

export interface UpdateUserRequest {
  username?: string
  displayName?: string
  email?: string
  phone?: string
  status?: UserRecord["status"]
  isSuperAdmin?: boolean
}

export const fetchUsers = async (): Promise<UsersResponse> =>
  requestJson<UsersResponse>("/system/users", {
    auth: true,
  })

export const createUser = async (
  input: CreateUserRequest,
): Promise<UserRecord> =>
  requestJson<UserRecord>("/system/users", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateUser = async (
  id: string,
  input: UpdateUserRequest,
): Promise<UserRecord> =>
  requestJson<UserRecord>(`/system/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })

export const resetUserPassword = async (
  id: string,
  password: string,
): Promise<void> =>
  requestJson<void>(`/system/users/${encodeURIComponent(id)}/reset-password`, {
    method: "POST",
    body: { password },
    auth: true,
  })
