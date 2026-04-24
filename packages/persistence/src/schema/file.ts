import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { departments, users } from "./auth"
import { tenants } from "./tenant"

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "restrict" }),
  originalName: text("original_name").notNull(),
  storageKey: text("storage_key").notNull().unique(),
  mimeType: text("mime_type"),
  size: integer("size").notNull(),
  uploaderUserId: uuid("uploader_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  deptId: uuid("dept_id").references(() => departments.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type FileRow = InferSelectModel<typeof files>
export type NewFileRow = InferInsertModel<typeof files>
