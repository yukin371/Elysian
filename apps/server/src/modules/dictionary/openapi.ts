import { t } from "elysia"

const dictionaryStatusSchema = t.Union([
  t.Literal("active"),
  t.Literal("disabled"),
])

export const dictionaryItemRecordResponseSchema = t.Object({
  id: t.String(),
  typeId: t.String(),
  value: t.String(),
  label: t.String(),
  sort: t.Number(),
  isDefault: t.Boolean(),
  status: dictionaryStatusSchema,
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const dictionaryTypeRecordResponseSchema = t.Object({
  id: t.String(),
  code: t.String(),
  name: t.String(),
  description: t.Nullable(t.String()),
  status: dictionaryStatusSchema,
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
})

export const dictionaryTypeDetailResponseSchema = t.Object({
  ...dictionaryTypeRecordResponseSchema.properties,
  items: t.Array(dictionaryItemRecordResponseSchema),
})

export const dictionaryTypeListResponseSchema = t.Object({
  items: t.Array(dictionaryTypeRecordResponseSchema),
})

export const dictionaryItemListResponseSchema = t.Object({
  items: t.Array(dictionaryItemRecordResponseSchema),
})
