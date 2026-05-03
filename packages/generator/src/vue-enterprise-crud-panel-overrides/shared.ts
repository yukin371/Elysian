import type { ModuleSchema } from "@elysian/schema"
import { toPascalCase } from "../naming"
import {
  getCreatePermissionPropName,
  getUpdatePermissionPropName,
  getViewPermissionPropName,
} from "../vue-enterprise-crud-template-shared"
export const getPanelTemplatePermissionProps = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  return {
    createPermission: getCreatePermissionPropName(schema.name, pascalName),
    updatePermission: getUpdatePermissionPropName(schema.name, pascalName),
    viewPermission: getViewPermissionPropName(schema.name, pascalName),
  }
}
