import { requestBlob, requestJson } from "./core"
import type {
  OpenApiCreateUserInput,
  OpenApiResetUserPasswordInput,
  OpenApiUpdateUserInput,
  OpenApiUserRecord,
  OpenApiUsersResponse,
} from "./generated-types"

export type UserRecord = OpenApiUserRecord
export type UsersResponse = OpenApiUsersResponse

export interface UserListQuery {
  page?: number
  pageSize?: number
}

export type CreateUserRequest = OpenApiCreateUserInput
export type UpdateUserRequest = OpenApiUpdateUserInput

export const fetchUsers = async (
  query: UserListQuery = {},
): Promise<UsersResponse> => {
  const search = new URLSearchParams()

  if (typeof query.page === "number" && Number.isFinite(query.page)) {
    search.set("page", String(Math.trunc(query.page)))
  }

  if (typeof query.pageSize === "number" && Number.isFinite(query.pageSize)) {
    search.set("pageSize", String(Math.trunc(query.pageSize)))
  }

  return requestJson<UsersResponse>(
    `/system/users${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const fetchUserById = async (id: string): Promise<UserRecord> =>
  requestJson<UserRecord>(`/system/users/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const exportUsersCsv = async (): Promise<Blob> =>
  requestBlob("/system/users/export", {
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
  password: OpenApiResetUserPasswordInput["password"],
): Promise<void> =>
  requestJson<void>(`/system/users/${encodeURIComponent(id)}/reset-password`, {
    method: "POST",
    body: { password },
    auth: true,
  })
