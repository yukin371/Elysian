import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { tenants } from "./tenant"

export const postStatus = pgEnum("post_status", ["active", "disabled"])

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    sort: integer("sort").notNull().default(0),
    status: postStatus("status").notNull().default("active"),
    remark: text("remark"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    postsTenantCodeUnique: unique("posts_tenant_code_unique").on(
      table.tenantId,
      table.code,
    ),
  }),
)

export type PostRow = InferSelectModel<typeof posts>
export type NewPostRow = InferInsertModel<typeof posts>
