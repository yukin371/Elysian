import type { VueLocaleMessages } from "@elysian/frontend-vue"
import { enUSCoreLocaleMessages } from "./en-US.core"
import { enUSModulesLocaleMessages } from "./en-US.modules"
import { enUSWorkflowLocaleMessages } from "./en-US.workflow"

export const enUSLocaleMessages: VueLocaleMessages = {
  ...enUSCoreLocaleMessages,
  ...enUSModulesLocaleMessages,
  ...enUSWorkflowLocaleMessages,
}
