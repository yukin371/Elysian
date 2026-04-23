import {
  type ModuleSchema,
  customerModuleSchema,
  productModuleSchema,
  sampleModuleSchema,
} from "@elysian/schema"

const SCHEMAS = {
  customer: customerModuleSchema,
  product: productModuleSchema,
  sample: sampleModuleSchema,
} as const satisfies Record<string, ModuleSchema>

export type RegisteredSchemaName = keyof typeof SCHEMAS

export const getRegisteredSchema = (name: string): ModuleSchema | null =>
  SCHEMAS[name as RegisteredSchemaName] ?? null

export const listRegisteredSchemaNames = (): string[] => Object.keys(SCHEMAS)
