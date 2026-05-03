import type { ModuleSchema } from "@elysian/schema"

import { renderDepartmentPanelTemplateOverride } from "./department"
import { renderDictionaryPanelTemplateOverride } from "./dictionary"
import { renderMenuPanelTemplateOverride } from "./menu"
import { renderNotificationPanelTemplateOverride } from "./notification"
import { renderRolePanelTemplateOverride } from "./role"
import { renderTenantPanelTemplateOverride } from "./tenant"
import { renderUserPanelTemplateOverride } from "./user"

export const renderVueEnterprisePanelTemplateOverride = (
  schema: ModuleSchema,
) => {
  switch (schema.name) {
    case "department":
      return renderDepartmentPanelTemplateOverride(schema)
    case "dictionary":
      return renderDictionaryPanelTemplateOverride(schema)
    case "menu":
      return renderMenuPanelTemplateOverride(schema)
    case "notification":
      return renderNotificationPanelTemplateOverride(schema)
    case "role":
      return renderRolePanelTemplateOverride(schema)
    case "tenant":
      return renderTenantPanelTemplateOverride(schema)
    case "user":
      return renderUserPanelTemplateOverride(schema)
    default:
      return null
  }
}
