import type { GeneratorPreviewFileCard } from "../../../lib/generator-preview-workspace"

export type GeneratorPreviewTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

export interface GeneratorPreviewSchemaOption {
  label: string
  value: string
}

export type { GeneratorPreviewFileCard }
