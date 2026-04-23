import { AppError } from "../../errors"
import type { AuthRepository } from "./repository"
import {
  type AuthIdentity,
  type AuthServiceOptions,
  type AuthSessionContext,
  createAuthService,
} from "./service"

export interface AuthGuard {
  authorize: (
    headers: Headers,
    permissionCode?: string,
  ) => Promise<AuthIdentity>
}

export const createAuthGuard = (
  repository: AuthRepository,
  options: AuthServiceOptions,
): AuthGuard => {
  const service = createAuthService(repository, options)

  return {
    authorize: (headers, permissionCode) =>
      service.authorize(
        extractBearerToken(headers),
        permissionCode,
        buildAuthRequestContext(headers),
      ),
  }
}

const extractBearerToken = (headers: Headers) => {
  const authorization = headers.get("authorization")

  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError({
      code: "AUTH_ACCESS_TOKEN_REQUIRED",
      message: "Access token is required",
      status: 401,
      expose: true,
    })
  }

  return authorization.slice("Bearer ".length)
}

const buildAuthRequestContext = (headers: Headers): AuthSessionContext => ({
  requestId: headers.get("x-request-id"),
  userAgent: headers.get("user-agent"),
  ip: headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
})
