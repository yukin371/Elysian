import type { AuditLogWriter } from "../shared/audit-log"
import type { AuthRepository } from "./repository"

export const createAuthAuditLogWriter = (
  repository: Pick<AuthRepository, "createAuditLog">,
): AuditLogWriter => {
  return async (event) =>
    repository.createAuditLog({
      category: event.category,
      tenantId: event.tenantId ?? null,
      action: event.action,
      actorUserId: event.actorUserId ?? null,
      targetType: event.targetType ?? null,
      targetId: event.targetId ?? null,
      result: event.result,
      requestId: event.requestId ?? null,
      ip: event.ip ?? null,
      userAgent: event.userAgent ?? null,
      details: event.details ?? null,
      createdAt: event.createdAt,
    })
}
