import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"

import { roles } from "./auth"
import { tenants } from "./tenant"

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    code: text("code").notNull(),
    module: text("module").notNull(),
    resource: text("resource").notNull(),
    action: text("action").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    permissionsTenantCodeUnique: unique("permissions_tenant_code_unique").on(
      table.tenantId,
      table.code,
    ),
  }),
)

export const rolePermissions = pgTable("role_permissions", {
  roleId: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid("permission_id")
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type PermissionRow = InferSelectModel<typeof permissions>
export type NewPermissionRow = InferInsertModel<typeof permissions>
export type RolePermissionRow = InferSelectModel<typeof rolePermissions>
export type NewRolePermissionRow = InferInsertModel<typeof rolePermissions>
