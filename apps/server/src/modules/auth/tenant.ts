import {
  DEFAULT_TENANT_ID,
  type DatabaseClient,
  resetTenantContext,
  setTenantContext,
} from "@elysian/persistence"
import type { AnyServerApp, ServerModule } from "../module"
import { extractTenantIdFromRefreshToken, verifyAccessToken } from "./tokens"

const DEFAULT_REFRESH_COOKIE_NAME = "elysian_refresh_token"

export interface TenantModuleOptions {
  accessTokenSecret: string
  refreshCookieName?: string
}

const readCookie = (cookieHeader: string | null, name: string) =>
  (cookieHeader ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? null

const verifyTenantIdFromAuthorization = async (
  authorization: string | null,
  secret: string,
) => {
  if (!authorization?.startsWith("Bearer ")) {
    return null
  }

  try {
    const payload = await verifyAccessToken(
      authorization.slice("Bearer ".length),
      secret,
    )
    return payload.tid
  } catch {
    return null
  }
}

const resolveTenantIdForRequest = async (
  request: Request,
  options: TenantModuleOptions,
) => {
  const authorizationTenantId = await verifyTenantIdFromAuthorization(
    request.headers.get("authorization"),
    options.accessTokenSecret,
  )

  if (authorizationTenantId) {
    return authorizationTenantId
  }

  const refreshToken = readCookie(
    request.headers.get("cookie"),
    options.refreshCookieName ?? DEFAULT_REFRESH_COOKIE_NAME,
  )
  return extractTenantIdFromRefreshToken(refreshToken)
}

export const createTenantModule = (
  db: DatabaseClient,
  options: TenantModuleOptions,
): ServerModule => ({
  name: "tenant",
  register: (app: AnyServerApp) =>
    app
      .onBeforeHandle(async ({ request }) => {
        const tid = await resolveTenantIdForRequest(request, options)
        return setTenantContext(db, tid ?? DEFAULT_TENANT_ID)
      })
      .onAfterHandle(() => resetTenantContext(db))
      .onError(() => resetTenantContext(db)),
})
