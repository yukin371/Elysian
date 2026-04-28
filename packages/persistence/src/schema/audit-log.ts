import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { tenants } from "./tenant"
import { users } from "./auth"

export const auditResult = pgEnum("audit_result", ["success", "failure"])

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "restrict" }),
  category: text("category").notNull(),
  action: text("action").notNull(),
  actorUserId: uuid("actor_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  targetType: text("target_type"),
  targetId: text("target_id"),
  result: auditResult("result").notNull(),
  requestId: text("request_id"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  details: jsonb("details").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type AuditLogRow = InferSelectModel<typeof auditLogs>
export type NewAuditLogRow = InferInsertModel<typeof auditLogs>
