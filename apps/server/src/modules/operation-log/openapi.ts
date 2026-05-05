import { t } from "elysia"

const operationLogResultSchema = t.Union([
  t.Literal("success"),
  t.Literal("failure"),
])

const authEventTypeSchema = t.Union([
  t.Literal("login"),
  t.Literal("logout"),
  t.Literal("refresh"),
  t.Literal("session_revoke"),
])

export const operationLogRecordResponseSchema = t.Object({
  id: t.String(),
  category: t.String(),
  action: t.String(),
  actorUserId: t.Nullable(t.String()),
  targetType: t.Nullable(t.String()),
  targetId: t.Nullable(t.String()),
  result: operationLogResultSchema,
  requestId: t.Nullable(t.String()),
  ip: t.Nullable(t.String()),
  userAgent: t.Nullable(t.String()),
  details: t.Nullable(t.Record(t.String(), t.Unknown())),
  createdAt: t.String({
    format: "date-time",
  }),
  authEventType: t.Nullable(authEventTypeSchema),
  authFailureReason: t.Nullable(t.String()),
})

export const operationLogListResponseSchema = t.Object({
  items: t.Array(operationLogRecordResponseSchema),
  total: t.Number(),
  page: t.Number(),
  pageSize: t.Number(),
  totalPages: t.Number(),
})
