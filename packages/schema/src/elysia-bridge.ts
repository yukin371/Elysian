import type { TSchema } from "@sinclair/typebox"
import { t } from "elysia"

import type { ModuleField, ModuleSchema } from "./index"

export type DeriveBodySchemaMode = "create" | "update"

export interface DeriveBodySchemaOptions {
  exclude?: string[]
  mode: DeriveBodySchemaMode
  overrides?: Record<string, TSchema>
}

const defaultExcludedFieldKeys = new Set(["createdAt", "id", "updatedAt"])

const buildStringSchema = (field: ModuleField): TSchema =>
  t.String({
    ...(field.validation?.maxLength !== undefined
      ? { maxLength: field.validation.maxLength }
      : {}),
    ...(field.validation?.minLength !== undefined
      ? { minLength: field.validation.minLength }
      : {}),
  })

const buildNumberSchema = (field: ModuleField): TSchema =>
  t.Number({
    ...(field.validation?.maximum !== undefined
      ? { maximum: field.validation.maximum }
      : {}),
    ...(field.validation?.minimum !== undefined
      ? { minimum: field.validation.minimum }
      : {}),
  })

const deriveFieldSchema = (field: ModuleField): TSchema | null => {
  switch (field.kind) {
    case "id":
    case "string":
      return buildStringSchema(field)
    case "number":
      return buildNumberSchema(field)
    case "boolean":
      return t.Boolean()
    case "enum":
      if (!field.options || field.options.length === 0) {
        return null
      }

      return t.Union(field.options.map((option) => t.Literal(option.value)))
    case "datetime":
      return null
    default:
      return null
  }
}

export const deriveBodySchema = (
  schema: ModuleSchema,
  options: DeriveBodySchemaOptions,
): TSchema => {
  const excludedKeys = new Set([
    ...defaultExcludedFieldKeys,
    ...(options.exclude ?? []),
  ])
  const overrides = options.overrides ?? {}
  const consumedOverrides = new Set<string>()
  const properties: Record<string, TSchema> = {}

  for (const field of schema.fields) {
    if (excludedKeys.has(field.key)) {
      continue
    }

    const override = overrides[field.key]

    if (override) {
      properties[field.key] = override
      consumedOverrides.add(field.key)
      continue
    }

    const fieldSchema = deriveFieldSchema(field)

    if (!fieldSchema) {
      continue
    }

    properties[field.key] =
      options.mode === "update" || field.required !== true
        ? t.Optional(fieldSchema)
        : fieldSchema
  }

  for (const [key, override] of Object.entries(overrides)) {
    if (excludedKeys.has(key) || consumedOverrides.has(key)) {
      continue
    }

    properties[key] = override
  }

  return t.Object(properties)
}
