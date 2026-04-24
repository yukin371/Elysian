import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { departments, users } from "./auth"
import { tenants } from "./tenant"

export const notificationLevel = pgEnum("notification_level", [
  "info",
  "success",
  "warning",
  "error",
])

export const notificationStatus = pgEnum("notification_status", [
  "unread",
  "read",
])

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "restrict" }),
  recipientUserId: uuid("recipient_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  level: notificationLevel("level").notNull().default("info"),
  status: notificationStatus("status").notNull().default("unread"),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  deptId: uuid("dept_id").references(() => departments.id, {
    onDelete: "set null",
  }),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type NotificationRow = InferSelectModel<typeof notifications>
export type NewNotificationRow = InferInsertModel<typeof notifications>
