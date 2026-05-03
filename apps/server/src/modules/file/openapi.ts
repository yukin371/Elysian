import { t } from "elysia"

export const fileRecordResponseSchema = t.Object({
  id: t.String(),
  originalName: t.String(),
  mimeType: t.Optional(t.String()),
  size: t.Number(),
  uploaderUserId: t.Optional(t.String()),
  createdAt: t.String({
    format: "date-time",
  }),
})

export const fileListResponseSchema = t.Object({
  items: t.Array(fileRecordResponseSchema),
  total: t.Number(),
  page: t.Number(),
  pageSize: t.Number(),
  totalPages: t.Number(),
})

export const fileBulkDeleteResponseSchema = t.Object({
  items: t.Array(fileRecordResponseSchema),
})
