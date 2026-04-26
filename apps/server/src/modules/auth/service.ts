import { AppError } from "../../errors"
import { verifyPasswordHash } from "./password"
import type {
  AuthDataScopeProfile,
  AuthMenuRecord,
  AuthRepository,
  AuthUserRecord,
  CreateAuthAuditLogInput,
} from "./repository"
import {
  createRefreshToken,
  hashToken,
  signAccessToken,
  verifyAccessToken,
} from "./tokens"

export interface AuthServiceOptions {
  accessTokenSecret: string
  accessTokenTtlSeconds?: number
  refreshTokenTtlSeconds?: number
}

export interface AuthSessionContext {
  requestId?: string | null
  userAgent?: string | null
  ip?: string | null
  tenantId?: string | null
}

/**
 * Canonical identity shape consumed by /auth/me, /auth/login, and /auth/refresh.
 * All three routes return the same user/roles/permissionCodes/menus structure;
 * only /auth/login and /auth/refresh additionally embed an accessToken.
 */
export interface AuthIdentity {
  user: {
    id: string
    username: string
    displayName: string
    isSuperAdmin: boolean
    tenantId: string
  }
  deptIds: string[]
  dataScopes: AuthDataScopeProfile["dataScopes"]
  dataAccess: AuthDataScopeProfile["dataAccess"]
  roles: string[]
  permissionCodes: string[]
  menus: AuthMenuRecord[]
}

/** Response shape for /auth/login and /auth/refresh. */
export interface AuthLoginResponse {
  accessToken: string
  user: AuthIdentity["user"]
  roles: string[]
  permissionCodes: string[]
  menus: AuthMenuRecord[]
}

/**
 * Internal full response used by the service layer before token separation.
 * refreshToken is used by the module layer to set the HttpOnly cookie;
 * it is never serialised into the JSON body.
 */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthIdentity["user"]
  roles: string[]
  permissionCodes: string[]
  menus: AuthMenuRecord[]
}

const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 15 * 60
const DEFAULT_REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

export const createAuthService = (
  repository: AuthRepository,
  options: AuthServiceOptions,
) => {
  const accessTokenTtlSeconds =
    options.accessTokenTtlSeconds ?? DEFAULT_ACCESS_TOKEN_TTL_SECONDS
  const refreshTokenTtlSeconds =
    options.refreshTokenTtlSeconds ?? DEFAULT_REFRESH_TOKEN_TTL_SECONDS

  const buildIdentity = async (user: AuthUserRecord): Promise<AuthIdentity> => {
    const roles = await repository.listRoleCodesForUser(user.id)
    const permissionCodes = await repository.listPermissionCodesForUser(user.id)
    const menus = await repository.listMenusForUser(user.id)
    const dataScopeProfile = await repository.getDataScopeProfileForUser(
      user.id,
    )

    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        isSuperAdmin: user.isSuperAdmin,
        tenantId: user.tenantId,
      },
      deptIds: dataScopeProfile.deptIds,
      dataScopes: dataScopeProfile.dataScopes,
      dataAccess: dataScopeProfile.dataAccess,
      roles,
      permissionCodes,
      menus,
    }
  }

  const buildAuthResponse = async (
    user: AuthUserRecord,
    sessionId: string,
    refreshToken: string,
  ): Promise<AuthResponse> => {
    const identity = await buildIdentity(user)
    const accessToken = await signAccessToken(
      {
        sub: user.id,
        sid: sessionId,
        tid: user.tenantId,
        roles: identity.roles,
      },
      options.accessTokenSecret,
      accessTokenTtlSeconds,
    )

    return {
      accessToken,
      refreshToken,
      ...identity,
    }
  }

  const recordAudit = async (
    input: Omit<CreateAuthAuditLogInput, "category">,
  ) =>
    repository.createAuditLog({
      category: "auth",
      ...input,
    })

  const requireActiveUser = (user: AuthUserRecord | null, details?: object) => {
    if (!user) {
      throw new AppError({
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid username or password",
        status: 401,
        expose: true,
        details: details as Record<string, unknown> | undefined,
      })
    }

    if (user.status !== "active") {
      throw new AppError({
        code: "AUTH_USER_DISABLED",
        message: "User is disabled",
        status: 403,
        expose: true,
        details: details as Record<string, unknown> | undefined,
      })
    }

    return user
  }

  return {
    async login(
      username: string,
      password: string,
      context: AuthSessionContext = {},
    ) {
      const user = await repository.findUserByUsername(
        username,
        context.tenantId ?? undefined,
      )

      if (!user) {
        await recordAudit({
          tenantId: context.tenantId ?? null,
          action: "login",
          result: "failure",
          requestId: context.requestId ?? null,
          ip: context.ip ?? null,
          userAgent: context.userAgent ?? null,
          details: {
            username,
            reason: "user_not_found",
          },
        })
        throw new AppError({
          code: "AUTH_INVALID_CREDENTIALS",
          message: "Invalid username or password",
          status: 401,
          expose: true,
          details: { username },
        })
      }

      if (user.status !== "active") {
        await recordAudit({
          tenantId: user.tenantId,
          action: "login",
          actorUserId: user.id,
          result: "failure",
          requestId: context.requestId ?? null,
          ip: context.ip ?? null,
          userAgent: context.userAgent ?? null,
          details: {
            username,
            reason: "user_disabled",
          },
        })
        throw new AppError({
          code: "AUTH_USER_DISABLED",
          message: "User is disabled",
          status: 403,
          expose: true,
          details: { username },
        })
      }

      const isPasswordValid = await verifyPasswordHash(
        password,
        user.passwordHash,
      )

      if (!isPasswordValid) {
        await recordAudit({
          tenantId: user.tenantId,
          action: "login",
          actorUserId: user.id,
          result: "failure",
          requestId: context.requestId ?? null,
          ip: context.ip ?? null,
          userAgent: context.userAgent ?? null,
          details: {
            username,
            reason: "invalid_password",
          },
        })
        throw new AppError({
          code: "AUTH_INVALID_CREDENTIALS",
          message: "Invalid username or password",
          status: 401,
          expose: true,
          details: { username },
        })
      }

      const refreshToken = createRefreshToken(user.tenantId)
      const refreshTokenHash = await hashToken(refreshToken)
      const expiresAt = new Date(
        Date.now() + refreshTokenTtlSeconds * 1000,
      ).toISOString()
      const session = await repository.createRefreshSession({
        tenantId: user.tenantId,
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
        userAgent: context.userAgent ?? null,
        ip: context.ip ?? null,
      })
      const now = new Date().toISOString()

      await repository.updateLastLoginAt(user.id, now)
      await recordAudit({
        tenantId: user.tenantId,
        action: "login",
        actorUserId: user.id,
        targetType: "session",
        targetId: session.id,
        result: "success",
        requestId: context.requestId ?? null,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
      })

      return buildAuthResponse(user, session.id, refreshToken)
    },
    async me(accessToken: string) {
      return this.authorize(accessToken)
    },
    async authorize(
      accessToken: string,
      permissionCode?: string,
      context: AuthSessionContext = {},
    ) {
      const payload = await verifyOrThrow(
        accessToken,
        options.accessTokenSecret,
      )
      const user = requireActiveUser(
        await repository.getUserById(payload.sub),
        {
          userId: payload.sub,
        },
      )
      const identity = await buildIdentity(user)

      if (
        permissionCode &&
        !identity.user.isSuperAdmin &&
        !identity.permissionCodes.includes(permissionCode)
      ) {
        await recordAudit({
          tenantId: identity.user.tenantId,
          action: "authorize",
          actorUserId: identity.user.id,
          targetType: "permission",
          targetId: permissionCode,
          result: "failure",
          requestId: context.requestId ?? null,
          ip: context.ip ?? null,
          userAgent: context.userAgent ?? null,
          details: {
            reason: "permission_denied",
          },
        })
        throw new AppError({
          code: "AUTH_PERMISSION_DENIED",
          message: "Permission denied",
          status: 403,
          expose: true,
          details: {
            permissionCode,
          },
        })
      }

      return identity
    },
    async refresh(
      refreshToken: string,
      context: AuthSessionContext = {},
    ): Promise<AuthResponse> {
      const refreshTokenHash = await hashToken(refreshToken)
      const session =
        await repository.getRefreshSessionByTokenHash(refreshTokenHash)

      if (!session) {
        await recordAudit({
          tenantId: context.tenantId ?? null,
          action: "refresh",
          result: "failure",
          requestId: context.requestId ?? null,
          ip: context.ip ?? null,
          userAgent: context.userAgent ?? null,
          details: {
            reason: "session_not_found",
          },
        })
        throw new AppError({
          code: "AUTH_REFRESH_TOKEN_INVALID",
          message: "Refresh token is invalid",
          status: 401,
          expose: true,
        })
      }

      if (
        session.revokedAt !== null ||
        new Date(session.expiresAt) <= new Date()
      ) {
        await recordAudit({
          tenantId: session.tenantId,
          action: "refresh",
          actorUserId: session.userId,
          targetType: "session",
          targetId: session.id,
          result: "failure",
          requestId: context.requestId ?? null,
          ip: context.ip ?? null,
          userAgent: context.userAgent ?? null,
          details: {
            reason:
              session.revokedAt !== null
                ? "session_revoked"
                : "session_expired",
          },
        })
        throw new AppError({
          code: "AUTH_REFRESH_TOKEN_EXPIRED",
          message: "Refresh token is expired or revoked",
          status: 401,
          expose: true,
          details: { sessionId: session.id },
        })
      }

      const user = requireActiveUser(
        await repository.getUserById(session.userId),
        {
          sessionId: session.id,
        },
      )
      const newRefreshToken = createRefreshToken(user.tenantId)
      const newRefreshTokenHash = await hashToken(newRefreshToken)
      const nextSession = await repository.createRefreshSession({
        tenantId: user.tenantId,
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt: new Date(
          Date.now() + refreshTokenTtlSeconds * 1000,
        ).toISOString(),
        userAgent: context.userAgent ?? session.userAgent,
        ip: context.ip ?? session.ip,
      })
      const now = new Date().toISOString()

      await repository.touchRefreshSession(session.id, now)
      await repository.revokeRefreshSession(session.id, nextSession.id)
      await recordAudit({
        tenantId: user.tenantId,
        action: "refresh",
        actorUserId: user.id,
        targetType: "session",
        targetId: nextSession.id,
        result: "success",
        requestId: context.requestId ?? null,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
        details: {
          previousSessionId: session.id,
        },
      })

      return buildAuthResponse(user, nextSession.id, newRefreshToken)
    },
    async logout(
      refreshToken: string | null,
      context: AuthSessionContext = {},
    ) {
      if (!refreshToken) {
        return
      }

      const session = await repository.getRefreshSessionByTokenHash(
        await hashToken(refreshToken),
      )

      if (!session) {
        return
      }

      await repository.revokeRefreshSession(session.id)
      await recordAudit({
        tenantId: session.tenantId,
        action: "logout",
        actorUserId: session.userId,
        targetType: "session",
        targetId: session.id,
        result: "success",
        requestId: context.requestId ?? null,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
      })
    },
  }
}

const verifyOrThrow = async (accessToken: string, secret: string) => {
  try {
    return await verifyAccessToken(accessToken, secret)
  } catch (error) {
    throw new AppError({
      code: "AUTH_ACCESS_TOKEN_INVALID",
      message: "Access token is invalid or expired",
      status: 401,
      expose: true,
      details:
        error instanceof Error
          ? {
              reason: error.message,
            }
          : undefined,
    })
  }
}

export type AuthService = ReturnType<typeof createAuthService>
