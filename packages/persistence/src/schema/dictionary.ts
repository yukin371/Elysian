import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { tenants } from "./tenant"

export const dictionaryStatus = pgEnum("dictionary_status", [
  "active",
  "disabled",
])

export const dictionaryTypes = pgTable(
  "dictionary_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: dictionaryStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    dictionaryTypesTenantCodeUnique: unique(
      "dictionary_types_tenant_code_unique",
    ).on(table.tenantId, table.code),
  }),
)

export const dictionaryItems = pgTable(
  "dictionary_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    typeId: uuid("type_id")
      .notNull()
      .references(() => dictionaryTypes.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    label: text("label").notNull(),
    sort: integer("sort").notNull().default(0),
    isDefault: boolean("is_default").notNull().default(false),
    status: dictionaryStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    dictionaryItemTypeValueUnique: unique(
      "dictionary_items_type_value_unique",
    ).on(table.typeId, table.value),
  }),
)

export type DictionaryTypeRow = InferSelectModel<typeof dictionaryTypes>
export type NewDictionaryTypeRow = InferInsertModel<typeof dictionaryTypes>
export type DictionaryItemRow = InferSelectModel<typeof dictionaryItems>
export type NewDictionaryItemRow = InferInsertModel<typeof dictionaryItems>
