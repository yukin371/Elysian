import type { ModuleSchema } from "@elysian/schema"

const EXCLUDED_STANDARD_CRUD_SCHEMAS = new Set([
  "customer",
  "operation-log",
  "workflow",
  "workflow-definition",
  "file",
  "auth-session",
  "generator-preview",
])

export const isStandardCrudSchema = (schema: ModuleSchema): boolean => {
  const hasFrontendRoute =
    typeof schema.frontend?.routePath === "string" &&
    schema.frontend.routePath.length > 0

  return hasFrontendRoute && !EXCLUDED_STANDARD_CRUD_SCHEMAS.has(schema.name)
}
