import {
  DEFAULT_TENANT_ID,
  type DatabaseClient,
  resetTenantContext,
  setTenantContext,
} from "@elysian/persistence"
import type { AnyServerApp, ServerModule } from "../module"
import { base64UrlDecode } from "./tokens"

interface TenantClaims {
  tid?: string
}

const parseTenantFromToken = (authorization: string | null): string | null => {
  if (!authorization?.startsWith("Bearer ")) {
    return null
  }

  const token = authorization.slice("Bearer ".length)
  const parts = token.split(".")
  if (parts.length !== 3 || !parts[1]) {
    return null
  }

  try {
    const payload = JSON.parse(
      base64UrlDecode(parts[1]).toString("utf8"),
    ) as TenantClaims
    return payload.tid ?? null
  } catch {
    return null
  }
}

export const createTenantModule = (db: DatabaseClient): ServerModule => ({
  name: "tenant",
  register: (app: AnyServerApp) =>
    app
      .onBeforeHandle(({ request }) => {
        const tid = parseTenantFromToken(request.headers.get("authorization"))
        return setTenantContext(db, tid ?? DEFAULT_TENANT_ID)
      })
      .onAfterHandle(() => resetTenantContext(db))
      .onError(() => resetTenantContext(db)),
})
