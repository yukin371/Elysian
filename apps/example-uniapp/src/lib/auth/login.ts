import { buildApiUrl } from "../api/client"
import { requestJson } from "../api/client"
import {
  type SessionUserSummary,
  clearSessionSnapshot,
  getAccessToken,
  getSessionSnapshot,
  setAuthenticatedSession,
  setSessionSnapshot,
} from "./session"

export interface LoginRequest {
  username: string
  password: string
  tenantCode?: string
}

export interface AuthIdentityResponse {
  user: SessionUserSummary
  roles: string[]
  permissionCodes: string[]
  menus: unknown[]
}

interface LoginResponse extends AuthIdentityResponse {
  accessToken: string
}

export const loginEndpoint = () => buildApiUrl("/auth/login")

export const login = async (
  input: LoginRequest,
): Promise<AuthIdentityResponse> => {
  const payload = await requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: input.tenantCode?.trim()
      ? {
          username: input.username.trim(),
          password: input.password,
          tenantCode: input.tenantCode.trim(),
        }
      : {
          username: input.username.trim(),
          password: input.password,
        },
  })

  setAuthenticatedSession(payload)

  const { accessToken: _ignored, ...identity } = payload
  return identity
}

export const fetchCurrentIdentity = async (): Promise<AuthIdentityResponse> => {
  const identity = await requestJson<AuthIdentityResponse>("/auth/me", {
    auth: true,
  })

  setSessionSnapshot(
    {
      user: identity.user,
      roles: identity.roles,
      permissionCodes: identity.permissionCodes,
    },
    getAccessToken(),
  )

  return identity
}

export const logout = async () => {
  try {
    await requestJson<void>("/auth/logout", {
      method: "POST",
      skipAuthRefresh: true,
    })
  } finally {
    clearSessionSnapshot()
  }
}

export const hydrateCurrentIdentity =
  async (): Promise<AuthIdentityResponse | null> => {
    const snapshot = getSessionSnapshot()

    if (!snapshot?.user) {
      return null
    }

    const identity = await fetchCurrentIdentity()

    return identity
  }
