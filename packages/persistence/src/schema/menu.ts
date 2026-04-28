import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  boolean,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { roles } from "./auth"
import { permissions } from "./permission"
import { tenants } from "./tenant"

export const menuStatus = pgEnum("menu_status", ["active", "disabled"])
export const menuType = pgEnum("menu_type", ["directory", "menu", "button"])

export const menus = pgTable(
  "menus",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    parentId: uuid("parent_id"),
    type: menuType("type").notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    path: text("path"),
    component: text("component"),
    icon: text("icon"),
    sort: integer("sort").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    status: menuStatus("status").notNull().default("active"),
    permissionCode: text("permission_code"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    menusTenantCodeUnique: unique("menus_tenant_code_unique").on(
      table.tenantId,
      table.code,
    ),
    menusTenantPermissionCodeFk: foreignKey({
      columns: [table.tenantId, table.permissionCode],
      foreignColumns: [permissions.tenantId, permissions.code],
      name: "menus_tenant_id_permission_code_permissions_tenant_code_fk",
    }),
  }),
)

export const roleMenus = pgTable("role_menus", {
  roleId: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  menuId: uuid("menu_id")
    .notNull()
    .references(() => menus.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type MenuRow = InferSelectModel<typeof menus>
export type NewMenuRow = InferInsertModel<typeof menus>
export type RoleMenuRow = InferSelectModel<typeof roleMenus>
export type NewRoleMenuRow = InferInsertModel<typeof roleMenus>
