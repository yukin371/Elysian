import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const customerStatus = pgEnum("customer_status", ["active", "inactive"])

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  status: customerStatus("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type CustomerRow = InferSelectModel<typeof customers>
export type NewCustomerRow = InferInsertModel<typeof customers>
