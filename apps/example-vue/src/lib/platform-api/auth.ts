import type { UiMenuItem } from "@elysian/ui-core"

import { clearAccessToken, requestJson, setAccessToken } from "./core"

export interface AuthIdentityResponse {
  user: {
    id: string
    username: string
    displayName: string
    isSuperAdmin: boolean
    tenantId: string
  }
  roles: string[]
  permissionCodes: string[]
  menus: UiMenuItem[]
}

export interface LoginResponse extends AuthIdentityResponse {
  accessToken: string
}

export interface AuthSessionSummary {
  id: string
  userAgent: string | null
  ip: string | null
  expiresAt: string
  lastUsedAt: string | null
  revokedAt: string | null
  replacedBySessionId: string | null
  createdAt: string
  updatedAt: string
  isCurrent: boolean
}

export interface AuthSessionsResponse {
  items: AuthSessionSummary[]
}

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

  const { accessToken: _ignored, ...identity } = payload
  return identity
}

export const refreshAuth = async (): Promise<AuthIdentityResponse> => {
  const payload = await requestJson<LoginResponse>("/auth/refresh", {
    method: "POST",
    credentials: "include",
  })

  setAccessToken(payload.accessToken)

  const { accessToken: _ignored, ...identity } = payload
  return identity
}

export const fetchMe = () =>
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

export const fetchAuthSessions = () =>
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
