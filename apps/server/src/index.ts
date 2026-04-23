import { createDatabaseClient } from "@elysian/persistence"

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
  createLocalFileStorage,
  createMenuModule,
  createMenuRepository,
  createNotificationModule,
  createNotificationRepository,
  createOperationLogModule,
  createOperationLogRepository,
  createRoleModule,
  createRoleRepository,
  createSettingModule,
  createSettingRepository,
  createUserModule,
  createUserRepository,
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
  const menuRepository = createMenuRepository(db)
  const notificationRepository = createNotificationRepository(db)
  const operationLogRepository = createOperationLogRepository(db)
  const roleRepository = createRoleRepository(db)
  const settingRepository = createSettingRepository(db)
  const userRepository = createUserRepository(db)
  const authGuard = createAuthGuard(authRepository, {
    accessTokenSecret,
  })
  modules.push(
    createAuthModule(authRepository, {
      accessTokenSecret,
      secureCookies: config.env === "production",
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
    "DATABASE_URL is not configured; auth, customer, dictionary, department, file, menu, notification, operation-log, role, setting, and user modules are not registered",
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
