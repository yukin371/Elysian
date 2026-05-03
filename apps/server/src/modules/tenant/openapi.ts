import { t } from "elysia"

const tenantStatusSchema = t.Union([
  t.Literal("active"),
  t.Literal("suspended"),
])

export const tenantRecordResponseSchema = t.Object({
  id: t.String(),
  code: t.String(),
  name: t.String(),
  status: tenantStatusSchema,
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const tenantListResponseSchema = t.Object({
  items: t.Array(tenantRecordResponseSchema),
})
