import { buildVueCustomCrudPage } from "@elysian/frontend-vue"
import { registeredModuleSchemas } from "@elysian/schema"

const frontendPageDefinitionsBySchemaName = Object.fromEntries(
  registeredModuleSchemas
    .filter((schema) => schema.frontend !== undefined)
    .map((schema) => [schema.name, buildVueCustomCrudPage(schema)]),
)

const requirePageDefinition = (schemaName: string) => {
  const definition = frontendPageDefinitionsBySchemaName[schemaName]

  if (!definition) {
    throw new Error(
      `Missing frontend page definition for registered schema "${schemaName}"`,
    )
  }

  return definition
}

export const customerPageDefinition = requirePageDefinition("customer")

export const dictionaryPageDefinition = requirePageDefinition("dictionary")

export const departmentPageDefinition = requirePageDefinition("department")

export const menuPageDefinition = requirePageDefinition("menu")

export const notificationPageDefinition = requirePageDefinition("notification")

export const operationLogPageDefinition = requirePageDefinition("operation-log")

export const postPageDefinition = requirePageDefinition("post")

export const rolePageDefinition = requirePageDefinition("role")

export const settingPageDefinition = requirePageDefinition("setting")

export const tenantPageDefinition = requirePageDefinition("tenant")

export const userPageDefinition = requirePageDefinition("user")
