import {
  type DatabaseClient,
  clearTenantContext,
  getTenantByCode,
  resetTenantContext,
} from "@elysian/persistence"

import { type ServerConfig, resolveAccessTokenSecret } from "../config"
import { createAuthAuditLogWriter } from "./auth"
import { createAuthGuard } from "./auth/guard"
import { createAuthModule } from "./auth/module"
import { createAuthRepository } from "./auth/repository"
import { createTenantContextModule } from "./auth/tenant"
import type { ServerModule } from "./module"
import { createPostModule } from "./post/module"
import { createPostRepository } from "./post/repository"
import { createRoleModule } from "./role/module"
import { createRoleRepository } from "./role/repository"
import type { AuditLogWriter } from "./shared/audit-log"
import { createUserModule } from "./user/module"
import { createUserRepository } from "./user/repository"

export interface ComposeAuthModulesResult {
  modules: ServerModule[]
  authGuard: ReturnType<typeof createAuthGuard>
  auditLogWriter: AuditLogWriter
}

export const composeAuthModules = (
  db: DatabaseClient,
  config: ServerConfig,
): ComposeAuthModulesResult => {
  const accessTokenSecret = resolveAccessTokenSecret(process.env)
  const authRepository = createAuthRepository(db)
  const postRepository = createPostRepository(db)
  const roleRepository = createRoleRepository(db)
  const userRepository = createUserRepository(db)
  const authGuard = createAuthGuard(authRepository, {
    accessTokenSecret,
  })
  const auditLogWriter = createAuthAuditLogWriter(authRepository)

  return {
    authGuard,
    auditLogWriter,
    modules: [
      createTenantContextModule(db, {
        accessTokenSecret,
      }),
      createAuthModule(authRepository, {
        accessTokenSecret,
        secureCookies: config.env === "production",
        tenantContextDb: db,
        resolveTenantIdByCode: (tenantCode) =>
          db.transaction(async (tx) => {
            await clearTenantContext(tx)

            try {
              return (await getTenantByCode(tx, tenantCode))?.id ?? null
            } finally {
              await resetTenantContext(tx)
            }
          }),
      }),
      createPostModule(postRepository, {
        authGuard,
      }),
      createRoleModule(roleRepository, {
        authGuard,
      }),
      createUserModule(userRepository, {
        authGuard,
      }),
    ],
  }
}
