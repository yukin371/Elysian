import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { users } from "./auth"
import { departments } from "./department"
import { tenants } from "./tenant"

export const customerStatus = pgEnum("customer_status", ["active", "inactive"])

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  status: customerStatus("status").notNull().default("active"),
  deptId: uuid("dept_id").references(() => departments.id, {
    onDelete: "set null",
  }),
  creatorId: uuid("creator_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type CustomerRow = InferSelectModel<typeof customers>
export type NewCustomerRow = InferInsertModel<typeof customers>
