import { t } from "elysia"

const postStatusSchema = t.Union([
  t.Literal("active"),
  t.Literal("disabled"),
])

export const postRecordResponseSchema = t.Object({
  id: t.String(),
  code: t.String(),
  name: t.String(),
  sort: t.Number(),
  status: postStatusSchema,
  remark: t.Nullable(t.String()),
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const postListResponseSchema = t.Object({
  items: t.Array(postRecordResponseSchema),
})
