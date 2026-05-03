import { t } from "elysia"

const roleStatusSchema = t.Union([
  t.Literal("active"),
  t.Literal("disabled"),
])

const roleDataScopeSchema = t.Union([
  t.Literal(1),
  t.Literal(2),
  t.Literal(3),
  t.Literal(4),
  t.Literal(5),
])

export const roleRecordResponseSchema = t.Object({
  id: t.String(),
  code: t.String(),
  name: t.String(),
  description: t.Nullable(t.String()),
  status: roleStatusSchema,
  isSystem: t.Boolean(),
  dataScope: roleDataScopeSchema,
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const roleDetailResponseSchema = t.Object({
  ...roleRecordResponseSchema.properties,
  permissionCodes: t.Array(t.String()),
  userIds: t.Array(t.String()),
  deptIds: t.Array(t.String()),
})

export const roleListResponseSchema = t.Object({
  items: t.Array(roleRecordResponseSchema),
  total: t.Number(),
  page: t.Number(),
  pageSize: t.Number(),
  totalPages: t.Number(),
})
