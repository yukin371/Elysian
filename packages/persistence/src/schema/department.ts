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

import { roles, users } from "./auth"
import { tenants } from "./tenant"

export const departmentStatus = pgEnum("department_status", [
  "active",
  "disabled",
])

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

export type DepartmentRow = InferSelectModel<typeof departments>
export type NewDepartmentRow = InferInsertModel<typeof departments>
export type UserDepartmentRow = InferSelectModel<typeof userDepartments>
export type NewUserDepartmentRow = InferInsertModel<typeof userDepartments>
export type RoleDeptRow = InferSelectModel<typeof roleDepts>
export type NewRoleDeptRow = InferInsertModel<typeof roleDepts>
