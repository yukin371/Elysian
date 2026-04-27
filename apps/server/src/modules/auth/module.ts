import {
  DEFAULT_TENANT_ID,
  type DatabaseClient,
  resetTenantContext,
  setTenantContext,
} from "@elysian/persistence"
import { t } from "elysia"

import { AppError } from "../../errors"
import type { ServerModule } from "../module"
import type { AuthRepository } from "./repository"
import type { AuthLoginResponse } from "./service"
import { createAuthService } from "./service"
import { extractTenantIdFromRefreshToken } from "./tokens"

const DEFAULT_REFRESH_COOKIE_NAME = "elysian_refresh_token"
const DEFAULT_REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

export interface AuthModuleOptions {
  accessTokenSecret?: string
  accessTokenTtlSeconds?: number
  refreshTokenTtlSeconds?: number
  refreshCookieName?: string
  secureCookies?: boolean
  tenantContextDb?: DatabaseClient
  resolveTenantIdByCode?: (tenantCode: string) => Promise<string | null>
}

export const createAuthModule = (
  repository: AuthRepository,
  options: AuthModuleOptions = {},
): ServerModule => ({
  name: "auth",
  register: (app, context) => {
    const refreshCookieName =
      options.refreshCookieName ?? DEFAULT_REFRESH_COOKIE_NAME
    const refreshTokenTtlSeconds =
      options.refreshTokenTtlSeconds ?? DEFAULT_REFRESH_TOKEN_TTL_SECONDS
    const accessTokenSecret =
      options.accessTokenSecret ?? throwMissingAccessTokenSecret()
    const service = createAuthService(repository, {
      accessTokenSecret,
      accessTokenTtlSeconds: options.accessTokenTtlSeconds,
      refreshTokenTtlSeconds,
    })

    context.logger.info("Registering auth module", {
      refreshCookieName,
    })

    return app
      .post(
        "/auth/login",
        async ({ body, request, set }) => {
          const requestContext = buildAuthRequestContext(
            request,
            refreshCookieName,
          )
          const tenantId = body.tenantCode
            ? await resolveTenantIdByCodeOrThrow(body.tenantCode, options)
            : options.tenantContextDb
              ? DEFAULT_TENANT_ID
              : null
          const result = tenantId
            ? await withTenantContext(
                options.tenantContextDb ?? throwMissingTenantContextDb(),
                tenantId,
                () =>
                  service.login(body.username, body.password, {
                    ...requestContext,
                    tenantId,
                  }),
              )
            : await service.login(body.username, body.password, requestContext)

          set.headers["set-cookie"] = serializeRefreshCookie(
            refreshCookieName,
            result.refreshToken,
            refreshTokenTtlSeconds,
            options.secureCookies ?? false,
          )

          const response: AuthLoginResponse = {
            accessToken: result.accessToken,
            user: result.user,
            roles: result.roles,
            permissionCodes: result.permissionCodes,
            menus: result.menus,
          }

          return response
        },
        {
          body: t.Object({
            username: t.String({ minLength: 1 }),
            password: t.String({ minLength: 1 }),
            tenantCode: t.Optional(t.String({ minLength: 1 })),
          }),
          detail: {
            tags: ["auth"],
            summary: "Login and issue tokens",
          },
        },
      )
      .get(
        "/auth/me",
        async ({ request }) =>
          service.me(extractBearerToken(request.headers.get("authorization"))),
        {
          detail: {
            tags: ["auth"],
            summary: "Get current auth context",
          },
        },
      )
      .get(
        "/auth/sessions",
        async ({ request }) =>
          service.listSessions(
            extractBearerToken(request.headers.get("authorization")),
          ),
        {
          detail: {
            tags: ["auth"],
            summary: "List current user refresh sessions",
          },
        },
      )
      .post(
        "/auth/refresh",
        async ({ request, set }) => {
          const safeRefreshToken =
            readCookie(request.headers.get("cookie"), refreshCookieName) ??
            throwAuthRefreshRequired()
          const result = await service.refresh(
            safeRefreshToken,
            buildAuthRequestContext(request, refreshCookieName),
          )

          set.headers["set-cookie"] = serializeRefreshCookie(
            refreshCookieName,
            result.refreshToken,
            refreshTokenTtlSeconds,
            options.secureCookies ?? false,
          )

          const response: AuthLoginResponse = {
            accessToken: result.accessToken,
            user: result.user,
            roles: result.roles,
            permissionCodes: result.permissionCodes,
            menus: result.menus,
          }

          return response
        },
        {
          detail: {
            tags: ["auth"],
            summary: "Refresh access token and rotate refresh session",
          },
        },
      )
      .delete(
        "/auth/sessions/:id",
        async ({ params, request, set }) => {
          const result = await service.revokeSession(
            extractBearerToken(request.headers.get("authorization")),
            params.id,
            buildAuthRequestContext(request, refreshCookieName),
          )

          set.status = 204
          if (result.currentSessionRevoked) {
            set.headers["set-cookie"] = clearRefreshCookie(
              refreshCookieName,
              options.secureCookies ?? false,
            )
          }
        },
        {
          params: t.Object({
            id: t.String({ minLength: 1 }),
          }),
          detail: {
            tags: ["auth"],
            summary: "Revoke current user refresh session",
          },
        },
      )
      .post(
        "/auth/logout",
        async ({ request, set }) => {
          await service.logout(
            readCookie(request.headers.get("cookie"), refreshCookieName),
            buildAuthRequestContext(request, refreshCookieName),
          )

          set.status = 204
          set.headers["set-cookie"] = clearRefreshCookie(
            refreshCookieName,
            options.secureCookies ?? false,
          )
        },
        {
          detail: {
            tags: ["auth"],
            summary: "Logout current refresh session",
          },
        },
      )
  },
})

const readCookie = (cookieHeader: string | null, name: string) =>
  (cookieHeader ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? null

const extractBearerToken = (header: string | null) => {
  if (!header?.startsWith("Bearer ")) {
    throw new AppError({
      code: "AUTH_ACCESS_TOKEN_REQUIRED",
      message: "Access token is required",
      status: 401,
      expose: true,
    })
  }

  return header.slice("Bearer ".length)
}

const serializeRefreshCookie = (
  name: string,
  token: string,
  maxAgeSeconds: number,
  secure: boolean,
) =>
  `${name}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure ? "; Secure" : ""}`

const clearRefreshCookie = (name: string, secure: boolean) =>
  `${name}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`

const buildAuthRequestContext = (
  request: Request,
  refreshCookieName: string,
) => ({
  requestId: request.headers.get("x-request-id"),
  userAgent: request.headers.get("user-agent"),
  ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  tenantId: extractTenantIdFromRefreshToken(
    readCookie(request.headers.get("cookie"), refreshCookieName),
  ),
})

const withTenantContext = async <T>(
  db: DatabaseClient,
  tenantId: string,
  action: () => Promise<T>,
) => {
  await setTenantContext(db, tenantId)

  try {
    return await action()
  } finally {
    await resetTenantContext(db)
  }
}

const resolveTenantIdByCodeOrThrow = async (
  tenantCode: string,
  options: AuthModuleOptions,
) => {
  const normalizedTenantCode = tenantCode.trim()
  if (!normalizedTenantCode) {
    throw new AppError({
      code: "AUTH_TENANT_REQUIRED",
      message: "Tenant code is required",
      status: 400,
      expose: true,
    })
  }

  const tenantId = await options.resolveTenantIdByCode?.(normalizedTenantCode)
  if (!tenantId) {
    throw new AppError({
      code: "AUTH_TENANT_INVALID",
      message: "Tenant is invalid",
      status: 401,
      expose: true,
      details: {
        tenantCode: normalizedTenantCode,
      },
    })
  }

  return tenantId
}

const throwAuthRefreshRequired = (): never => {
  throw new AppError({
    code: "AUTH_REFRESH_TOKEN_REQUIRED",
    message: "Refresh token is required",
    status: 401,
    expose: true,
  })
}

const throwMissingAccessTokenSecret = (): never => {
  throw new AppError({
    code: "CONFIG_INVALID",
    message: "Auth module requires an ACCESS_TOKEN_SECRET",
    status: 500,
    expose: true,
    details: { key: "ACCESS_TOKEN_SECRET" },
  })
}

const throwMissingTenantContextDb = (): never => {
  throw new AppError({
    code: "CONFIG_INVALID",
    message:
      "Auth module requires a tenant context database to resolve tenant login",
    status: 500,
    expose: true,
    details: { key: "tenantContextDb" },
  })
}
