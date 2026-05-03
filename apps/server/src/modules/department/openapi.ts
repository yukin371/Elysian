import { t } from "elysia"

const departmentStatusSchema = t.Union([
  t.Literal("active"),
  t.Literal("disabled"),
])

export const departmentRecordResponseSchema = t.Object({
  id: t.String(),
  parentId: t.Nullable(t.String()),
  code: t.String(),
  name: t.String(),
  sort: t.Number(),
  status: departmentStatusSchema,
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const departmentDetailResponseSchema = t.Object({
  ...departmentRecordResponseSchema.properties,
  userIds: t.Array(t.String()),
})

export const departmentListResponseSchema = t.Object({
  items: t.Array(departmentRecordResponseSchema),
})
