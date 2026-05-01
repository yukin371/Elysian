import { createDatabaseClient } from "@elysian/persistence"

import { createServerApp } from "./app"
import { loadServerConfig } from "./config"
import { createServerLogger } from "./logging"
import {
  composeAuthModules,
  composeBusinessModules,
  composeSystemModules,
  systemModule,
} from "./modules"

const config = loadServerConfig()
const logger = createServerLogger(config.logLevel)
const modules = [systemModule]

if (process.env.DATABASE_URL) {
  const db = createDatabaseClient()
  const authModules = composeAuthModules(db, config)
  modules.push(...authModules.modules)
  modules.push(
    ...composeBusinessModules(
      db,
      authModules.authGuard,
      authModules.auditLogWriter,
    ),
  )
  modules.push(...composeSystemModules(db, authModules.authGuard))
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
