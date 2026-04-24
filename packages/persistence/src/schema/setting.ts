import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { tenants } from "./tenant"

export const settingStatus = pgEnum("setting_status", ["active", "disabled"])

export const systemSettings = pgTable(
  "system_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    key: text("key").notNull(),
    value: text("value").notNull(),
    description: text("description"),
    status: settingStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    systemSettingsTenantKeyUnique: unique(
      "system_settings_tenant_key_unique",
    ).on(table.tenantId, table.key),
  }),
)

export type SettingRow = InferSelectModel<typeof systemSettings>
export type NewSettingRow = InferInsertModel<typeof systemSettings>
