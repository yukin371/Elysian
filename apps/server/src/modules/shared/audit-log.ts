import type { AuditLogResult } from "@elysian/persistence"

export interface AuditLogEvent {
  category: string
  tenantId?: string | null
  action: string
  actorUserId?: string | null
  targetType?: string | null
  targetId?: string | null
  result: AuditLogResult
  requestId?: string | null
  ip?: string | null
  userAgent?: string | null
  details?: Record<string, unknown> | null
  createdAt?: string
}

export type AuditLogWriter = (event: AuditLogEvent) => Promise<unknown>
