import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import {
  boolean,
  foreignKey,
  integer,
  jsonb,
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
export const menuStatus = pgEnum("menu_status", ["active", "disabled"])
export const menuType = pgEnum("menu_type", ["directory", "menu", "button"])
export const departmentStatus = pgEnum("department_status", [
  "active",
  "disabled",
])
export const auditResult = pgEnum("audit_result", ["success", "failure"])

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

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    parentId: uuid("parent_id"),
    code: text("code").notNull(),
    name: text("name").notNull(),
    ancestors: text("ancestors").notNull().default(""),
    sort: integer("sort").notNull().default(0),
    status: departmentStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    departmentsTenantCodeUnique: unique("departments_tenant_code_unique").on(
      table.tenantId,
      table.code,
    ),
  }),
)

export const userDepartments = pgTable("user_departments", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const roleDepts = pgTable("role_depts", {
  roleId: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  deptId: uuid("dept_id")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const refreshSessions = pgTable("refresh_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "restrict" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  replacedBySessionId: uuid("replaced_by_session_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "restrict" }),
  category: text("category").notNull(),
  action: text("action").notNull(),
  actorUserId: uuid("actor_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  targetType: text("target_type"),
  targetId: text("target_id"),
  result: auditResult("result").notNull(),
  requestId: text("request_id"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  details: jsonb("details").$type<Record<string, unknown> | null>(),
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
export type MenuRow = InferSelectModel<typeof menus>
export type NewMenuRow = InferInsertModel<typeof menus>
export type RoleMenuRow = InferSelectModel<typeof roleMenus>
export type NewRoleMenuRow = InferInsertModel<typeof roleMenus>
export type DepartmentRow = InferSelectModel<typeof departments>
export type NewDepartmentRow = InferInsertModel<typeof departments>
export type UserDepartmentRow = InferSelectModel<typeof userDepartments>
export type NewUserDepartmentRow = InferInsertModel<typeof userDepartments>
export type RoleDeptRow = InferSelectModel<typeof roleDepts>
export type NewRoleDeptRow = InferInsertModel<typeof roleDepts>
export type RefreshSessionRow = InferSelectModel<typeof refreshSessions>
export type NewRefreshSessionRow = InferInsertModel<typeof refreshSessions>
export type AuditLogRow = InferSelectModel<typeof auditLogs>
export type NewAuditLogRow = InferInsertModel<typeof auditLogs>

export {
  type NewPostRow,
  type PostRow,
  posts,
  postStatus,
} from "./post"
