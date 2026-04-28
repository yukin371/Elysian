import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  boolean,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"
import { tenants } from "./tenant"

export const userStatus = pgEnum("user_status", ["active", "disabled"])
export const roleStatus = pgEnum("role_status", ["active", "disabled"])

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    passwordHash: text("password_hash").notNull(),
    status: userStatus("status").notNull().default("active"),
    isSuperAdmin: boolean("is_super_admin").notNull().default(false),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    usersTenantUsernameUnique: unique("users_tenant_username_unique").on(
      table.tenantId,
      table.username,
    ),
  }),
)

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: roleStatus("status").notNull().default("active"),
    isSystem: boolean("is_system").notNull().default(false),
    dataScope: smallint("data_scope").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    rolesTenantCodeUnique: unique("roles_tenant_code_unique").on(
      table.tenantId,
      table.code,
    ),
  }),
)

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

export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

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

export type UserRow = InferSelectModel<typeof users>
export type NewUserRow = InferInsertModel<typeof users>
export type RoleRow = InferSelectModel<typeof roles>
export type NewRoleRow = InferInsertModel<typeof roles>
export type PermissionRow = InferSelectModel<typeof permissions>
export type NewPermissionRow = InferInsertModel<typeof permissions>
export type UserRoleRow = InferSelectModel<typeof userRoles>
export type NewUserRoleRow = InferInsertModel<typeof userRoles>
export type RolePermissionRow = InferSelectModel<typeof rolePermissions>
export type NewRolePermissionRow = InferInsertModel<typeof rolePermissions>
export {
  auditLogs,
  auditResult,
  type AuditLogRow,
  type NewAuditLogRow,
} from "./audit-log"
export {
  type NewPostRow,
  type PostRow,
  posts,
  postStatus,
} from "./post"
