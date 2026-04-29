import { buildVueCustomCrudPage } from "@elysian/frontend-vue"
import {
  customerModuleSchema,
  departmentModuleSchema,
  dictionaryModuleSchema,
  menuModuleSchema,
  notificationModuleSchema,
  operationLogModuleSchema,
  postModuleSchema,
  roleModuleSchema,
  settingModuleSchema,
  tenantModuleSchema,
  userModuleSchema,
} from "@elysian/schema"

export const customerPageDefinition =
  buildVueCustomCrudPage(customerModuleSchema)

export const dictionaryPageDefinition = buildVueCustomCrudPage(
  dictionaryModuleSchema,
)

export const departmentPageDefinition = buildVueCustomCrudPage(
  departmentModuleSchema,
)

export const menuPageDefinition = buildVueCustomCrudPage(menuModuleSchema)

export const notificationPageDefinition = buildVueCustomCrudPage(
  notificationModuleSchema,
)

export const operationLogPageDefinition = buildVueCustomCrudPage(
  operationLogModuleSchema,
)

export const postPageDefinition = buildVueCustomCrudPage(postModuleSchema)

export const rolePageDefinition = buildVueCustomCrudPage(roleModuleSchema)

export const settingPageDefinition = buildVueCustomCrudPage(settingModuleSchema)

export const tenantPageDefinition = buildVueCustomCrudPage(tenantModuleSchema)

export const userPageDefinition = buildVueCustomCrudPage(userModuleSchema)
