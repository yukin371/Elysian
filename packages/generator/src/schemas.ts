import {
  type ModuleSchema,
  registeredModuleSchemas,
  sampleModuleSchema,
} from "@elysian/schema"

const generatorOnlySchemas = [
  // `sample` stays generator-visible for preview/demo flows, but it is not part
  // of the formal runtime registration contract exported by `packages/schema`.
  sampleModuleSchema,
] as const satisfies readonly ModuleSchema[]

const generatorRegisteredSchemas = [
  ...registeredModuleSchemas,
  ...generatorOnlySchemas,
] as const satisfies readonly ModuleSchema[]

export type RegisteredSchemaName =
  (typeof generatorRegisteredSchemas)[number]["name"]

const SCHEMAS = Object.fromEntries(
  generatorRegisteredSchemas.map((schema) => [schema.name, schema]),
) as Record<RegisteredSchemaName, ModuleSchema>

export const listRegisteredSchemas = (): readonly ModuleSchema[] =>
  generatorRegisteredSchemas

export const getRegisteredSchema = (name: string): ModuleSchema | null =>
  SCHEMAS[name as RegisteredSchemaName] ?? null

export const listRegisteredSchemaNames = (): string[] =>
  listRegisteredSchemas().map((schema) => schema.name)
