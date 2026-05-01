import type { DatabaseClient } from "@elysian/persistence"

import type { AuthGuard } from "./auth"
import { createCustomerModule } from "./customer/module"
import { createCustomerRepository } from "./customer/repository"
import { createFileModule } from "./file/module"
import { createFileRepository } from "./file/repository"
import { createLocalFileStorage } from "./file/storage"
import { createGeneratorSessionModule } from "./generator-session/module"
import { createGeneratorSessionRepository } from "./generator-session/repository"
import type { ServerModule } from "./module"
import { createNotificationModule } from "./notification/module"
import { createNotificationRepository } from "./notification/repository"
import { createOperationLogModule } from "./operation-log/module"
import { createOperationLogRepository } from "./operation-log/repository"
import type { AuditLogWriter } from "./shared/audit-log"
import { createTenantModule } from "./tenant/module"
import { createTenantRepository } from "./tenant/repository"
import { createWorkflowModule } from "./workflow/module"
import { createWorkflowDefinitionRepository } from "./workflow/repository"

export const composeBusinessModules = (
  db: DatabaseClient,
  authGuard: AuthGuard,
  auditLogWriter: AuditLogWriter,
): ServerModule[] => {
  const customerRepository = createCustomerRepository(db)
  const fileRepository = createFileRepository(db)
  const fileStorage = createLocalFileStorage()
  const generatorSessionRepository = createGeneratorSessionRepository(db)
  const notificationRepository = createNotificationRepository(db)
  const operationLogRepository = createOperationLogRepository(db)
  const tenantRepository = createTenantRepository(db)
  const workflowDefinitionRepository = createWorkflowDefinitionRepository(db)

  return [
    createTenantModule(tenantRepository, {
      authGuard,
    }),
    createCustomerModule(customerRepository, {
      authGuard,
    }),
    createFileModule(fileRepository, fileStorage, {
      authGuard,
    }),
    createGeneratorSessionModule(generatorSessionRepository, {
      authGuard,
      auditLogWriter,
    }),
    createNotificationModule(notificationRepository, {
      authGuard,
    }),
    createWorkflowModule(workflowDefinitionRepository, {
      authGuard,
      auditLogWriter,
    }),
    createOperationLogModule(operationLogRepository, {
      authGuard,
    }),
  ]
}
