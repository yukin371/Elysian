import type { VueLocaleMessages } from "@elysian/frontend-vue"
import { enUSCoreLocaleMessages } from "./i18n.en-US.core"
import { enUSModulesLocaleMessages } from "./i18n.en-US.modules"
import { enUSWorkflowLocaleMessages } from "./i18n.en-US.workflow"

export const enUSLocaleMessages: VueLocaleMessages = {
  ...enUSCoreLocaleMessages,
  ...enUSModulesLocaleMessages,
  ...enUSWorkflowLocaleMessages,
}
