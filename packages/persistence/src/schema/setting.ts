import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const settingStatus = pgEnum("setting_status", ["active", "disabled"])

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  status: settingStatus("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type SettingRow = InferSelectModel<typeof systemSettings>
export type NewSettingRow = InferInsertModel<typeof systemSettings>
