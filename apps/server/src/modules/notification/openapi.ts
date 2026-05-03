import { t } from "elysia"

const notificationLevelSchema = t.Union([
  t.Literal("info"),
  t.Literal("success"),
  t.Literal("warning"),
  t.Literal("error"),
])

const notificationStatusSchema = t.Union([
  t.Literal("unread"),
  t.Literal("read"),
])

export const notificationRecordResponseSchema = t.Object({
  id: t.String(),
  recipientUserId: t.String(),
  title: t.String(),
  content: t.String(),
  level: notificationLevelSchema,
  status: notificationStatusSchema,
  createdByUserId: t.Optional(t.String()),
  readAt: t.Optional(
    t.String({
      format: "date-time",
    }),
  ),
  createdAt: t.String({
    format: "date-time",
  }),
})

export const notificationListResponseSchema = t.Object({
  items: t.Array(notificationRecordResponseSchema),
  total: t.Number(),
  page: t.Number(),
  pageSize: t.Number(),
  totalPages: t.Number(),
})

export const notificationBulkReadResponseSchema = t.Object({
  items: t.Array(notificationRecordResponseSchema),
})
