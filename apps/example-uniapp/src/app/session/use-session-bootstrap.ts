import { fetchCurrentIdentity } from "../../lib/auth/login"
import {
  clearSessionSnapshot,
  getSessionSnapshot,
  setSessionSnapshot,
} from "../../lib/auth/session"
import { requestJson } from "../../lib/api/client"

interface LoginResponse {
  accessToken: string
  user: {
    id: string
    username: string
    displayName: string
    isSuperAdmin: boolean
    tenantId: string
  }
  roles: string[]
  permissionCodes: string[]
  menus: unknown[]
}

export const bootstrapSession = async () => {
  try {
    const payload = await requestJson<LoginResponse>("/auth/refresh", {
      method: "POST",
      skipAuthRefresh: true,
    })

    setSessionSnapshot(
      {
        user: payload.user,
        roles: payload.roles,
        permissionCodes: payload.permissionCodes,
      },
      payload.accessToken,
    )

    return fetchCurrentIdentity()
  } catch {
    const snapshot = getSessionSnapshot()

    if (snapshot?.user) {
      clearSessionSnapshot()
    }

    return null
  }
}
