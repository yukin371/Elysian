import type { UiMenuItem } from "@elysian/ui-core"

import { clearAccessToken, requestJson, setAccessToken } from "./core"
import type {
  OpenApiAuthMeResponse,
  OpenApiAuthSessionSummary,
  OpenApiAuthSessionsResponse,
} from "./generated-types"

export interface AuthIdentityResponse
  extends Omit<OpenApiAuthMeResponse, "menus"> {
  menus: UiMenuItem[]
}

export type LoginResponse = AuthIdentityResponse & {
  accessToken: string
}

export type AuthSessionSummary = OpenApiAuthSessionSummary
export type AuthSessionsResponse = OpenApiAuthSessionsResponse

const toAuthIdentityResponse = (
  payload: LoginResponse,
): AuthIdentityResponse => ({
  user: payload.user,
  deptIds: payload.deptIds,
  dataScopes: payload.dataScopes,
  dataAccess: payload.dataAccess,
  roles: payload.roles,
  permissionCodes: payload.permissionCodes,
  menus: payload.menus,
})

export const login = async (input: {
  username: string
  password: string
  tenantCode?: string
}): Promise<AuthIdentityResponse> => {
  const payload = await requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: input,
    credentials: "include",
  })

  setAccessToken(payload.accessToken)

  return toAuthIdentityResponse(payload)
}

export const refreshAuth = async (): Promise<AuthIdentityResponse> => {
  const payload = await requestJson<LoginResponse>("/auth/refresh", {
    method: "POST",
    credentials: "include",
  })

  setAccessToken(payload.accessToken)

  return toAuthIdentityResponse(payload)
}

export const fetchMe = (): Promise<AuthIdentityResponse> =>
  requestJson<AuthIdentityResponse>("/auth/me", {
    auth: true,
  })

export const logout = async (): Promise<void> => {
  await requestJson<void>("/auth/logout", {
    method: "POST",
    credentials: "include",
  })
  clearAccessToken()
}

export const fetchAuthSessions = (): Promise<AuthSessionsResponse> =>
  requestJson<AuthSessionsResponse>("/auth/sessions", {
    auth: true,
  })

export const revokeAuthSession = async (sessionId: string): Promise<void> => {
  await requestJson<void>(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
    auth: true,
    credentials: "include",
  })
}
