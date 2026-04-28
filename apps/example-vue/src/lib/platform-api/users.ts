import { requestJson } from "./core"
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserRecord,
  UsersResponse,
} from "../platform-api"

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
