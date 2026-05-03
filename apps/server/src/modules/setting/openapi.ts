import { t } from "elysia"

const settingStatusSchema = t.Union([
  t.Literal("active"),
  t.Literal("disabled"),
])

export const settingRecordResponseSchema = t.Object({
  id: t.String(),
  key: t.String(),
  value: t.String(),
  description: t.Nullable(t.String()),
  status: settingStatusSchema,
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const settingListResponseSchema = t.Object({
  items: t.Array(settingRecordResponseSchema),
  total: t.Number(),
  page: t.Number(),
  pageSize: t.Number(),
  totalPages: t.Number(),
})
