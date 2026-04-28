import {
  clearTenantContext,
  createDatabaseClient,
  getTenantByCode,
  resetTenantContext,
} from "@elysian/persistence"

import { createServerApp } from "./app"
import { loadServerConfig, resolveAccessTokenSecret } from "./config"
import { createServerLogger } from "./logging"
import {
  createAuthGuard,
  createAuthModule,
  createAuthRepository,
  createCustomerModule,
  createCustomerRepository,
  createDepartmentModule,
  createDepartmentRepository,
  createDictionaryModule,
  createDictionaryRepository,
  createFileModule,
  createFileRepository,
  createGeneratorSessionModule,
  createGeneratorSessionRepository,
  createLocalFileStorage,
  createMenuModule,
  createMenuRepository,
  createNotificationModule,
  createNotificationRepository,
  createOperationLogModule,
  createOperationLogRepository,
  createPostModule,
  createPostRepository,
  createRoleModule,
  createRoleRepository,
  createSettingModule,
  createSettingRepository,
  createTenantContextModule,
  createTenantModule,
  createTenantRepository,
  createUserModule,
  createUserRepository,
  createWorkflowDefinitionRepository,
  createWorkflowModule,
  systemModule,
} from "./modules"

const config = loadServerConfig()
const logger = createServerLogger(config.logLevel)
const modules = [systemModule]

if (process.env.DATABASE_URL) {
  const db = createDatabaseClient()
  const accessTokenSecret = resolveAccessTokenSecret(process.env)
  const authRepository = createAuthRepository(db)
  const customerRepository = createCustomerRepository(db)
  const dictionaryRepository = createDictionaryRepository(db)
  const departmentRepository = createDepartmentRepository(db)
  const fileRepository = createFileRepository(db)
  const fileStorage = createLocalFileStorage()
  const generatorSessionRepository = createGeneratorSessionRepository(db)
  const menuRepository = createMenuRepository(db)
  const notificationRepository = createNotificationRepository(db)
  const operationLogRepository = createOperationLogRepository(db)
  const postRepository = createPostRepository(db)
  const roleRepository = createRoleRepository(db)
  const settingRepository = createSettingRepository(db)
  const tenantRepository = createTenantRepository(db)
  const userRepository = createUserRepository(db)
  const workflowDefinitionRepository = createWorkflowDefinitionRepository(db)
  const authGuard = createAuthGuard(authRepository, {
    accessTokenSecret,
  })
  modules.push(
    createTenantContextModule(db, {
      accessTokenSecret,
    }),
  )
  modules.push(
    createAuthModule(authRepository, {
      accessTokenSecret,
      secureCookies: config.env === "production",
      tenantContextDb: db,
      resolveTenantIdByCode: (tenantCode) =>
        db.transaction(async (tx) => {
          const scopedDb = tx as unknown as typeof db

          await clearTenantContext(scopedDb)

          try {
            return (await getTenantByCode(scopedDb, tenantCode))?.id ?? null
          } finally {
            await resetTenantContext(scopedDb)
          }
        }),
    }),
  )
  modules.push(
    createTenantModule(tenantRepository, {
      authGuard,
    }),
  )
  modules.push(
    createCustomerModule(customerRepository, {
      authGuard,
    }),
  )
  modules.push(
    createFileModule(fileRepository, fileStorage, {
      authGuard,
    }),
  )
  modules.push(
    createGeneratorSessionModule(generatorSessionRepository, {
      authGuard,
      auditLogWriter: (event) =>
        authRepository.createAuditLog({
          category: "generator",
          ...event,
        }),
    }),
  )
  modules.push(
    createDictionaryModule(dictionaryRepository, {
      authGuard,
    }),
  )
  modules.push(
    createDepartmentModule(departmentRepository, {
      authGuard,
    }),
  )
  modules.push(
    createMenuModule(menuRepository, {
      authGuard,
    }),
  )
  modules.push(
    createNotificationModule(notificationRepository, {
      authGuard,
    }),
  )
  modules.push(
    createWorkflowModule(workflowDefinitionRepository, {
      authGuard,
      auditLogWriter: (event) =>
        authRepository.createAuditLog({
          category: "workflow",
          ...event,
        }),
    }),
  )
  modules.push(
    createPostModule(postRepository, {
      authGuard,
    }),
  )
  modules.push(
    createRoleModule(roleRepository, {
      authGuard,
    }),
  )
  modules.push(
    createOperationLogModule(operationLogRepository, {
      authGuard,
    }),
  )
  modules.push(
    createSettingModule(settingRepository, {
      authGuard,
    }),
  )
  modules.push(
    createUserModule(userRepository, {
      authGuard,
    }),
  )
} else {
  logger.warn(
    "DATABASE_URL is not configured; auth, tenant, customer, dictionary, department, file, menu, notification, operation-log, post, role, setting, user, and workflow modules are not registered",
  )
}

const app = createServerApp({
  config,
  logger,
  modules,
})

app.listen(config.port)

logger.info("Server listening", {
  port: config.port,
  openapiPath: "/openapi",
  env: config.env,
})
