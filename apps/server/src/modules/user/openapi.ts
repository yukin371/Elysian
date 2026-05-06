import { t } from "elysia"

const userStatusSchema = t.Union([t.Literal("active"), t.Literal("disabled")])

export const userRecordResponseSchema = t.Object({
  id: t.String(),
  username: t.String(),
  displayName: t.String(),
  email: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  status: userStatusSchema,
  isSuperAdmin: t.Boolean(),
  lastLoginAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const userListResponseSchema = t.Object({
  items: t.Array(userRecordResponseSchema),
  total: t.Number(),
  page: t.Number(),
  pageSize: t.Number(),
  totalPages: t.Number(),
})
