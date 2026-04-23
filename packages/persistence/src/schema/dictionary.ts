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

export const dictionaryStatus = pgEnum("dictionary_status", [
  "active",
  "disabled",
])

export const dictionaryTypes = pgTable("dictionary_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  status: dictionaryStatus("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const dictionaryItems = pgTable(
  "dictionary_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
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
