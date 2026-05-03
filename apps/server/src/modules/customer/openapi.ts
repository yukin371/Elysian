import { t } from "elysia"

const customerStatusSchema = t.Union([
  t.Literal("active"),
  t.Literal("inactive"),
])

export const customerRecordResponseSchema = t.Object({
  id: t.String(),
  name: t.String(),
  status: customerStatusSchema,
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const customerListResponseSchema = t.Object({
  items: t.Array(customerRecordResponseSchema),
  total: t.Number(),
  page: t.Number(),
  pageSize: t.Number(),
  totalPages: t.Number(),
})
