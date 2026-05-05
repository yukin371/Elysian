import { t } from "elysia"

const menuTypeSchema = t.Union([
  t.Literal("directory"),
  t.Literal("menu"),
  t.Literal("button"),
])

const menuStatusSchema = t.Union([t.Literal("active"), t.Literal("disabled")])

export const menuRecordResponseSchema = t.Object({
  id: t.String(),
  parentId: t.Nullable(t.String()),
  type: menuTypeSchema,
  code: t.String(),
  name: t.String(),
  path: t.Nullable(t.String()),
  component: t.Nullable(t.String()),
  icon: t.Nullable(t.String()),
  sort: t.Number(),
  isVisible: t.Boolean(),
  status: menuStatusSchema,
  permissionCode: t.Nullable(t.String()),
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const menuDetailResponseSchema = t.Object({
  ...menuRecordResponseSchema.properties,
  roleIds: t.Array(t.String()),
})

export const menuListResponseSchema = t.Object({
  items: t.Array(menuRecordResponseSchema),
})
