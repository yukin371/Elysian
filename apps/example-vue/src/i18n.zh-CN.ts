import type { VueLocaleMessages } from "@elysian/frontend-vue"
import { zhCNCoreLocaleMessages } from "./i18n.zh-CN.core"
import { zhCNModulesLocaleMessages } from "./i18n.zh-CN.modules"
import { zhCNWorkflowLocaleMessages } from "./i18n.zh-CN.workflow"

export const zhCNLocaleMessages: VueLocaleMessages = {
  ...zhCNCoreLocaleMessages,
  ...zhCNModulesLocaleMessages,
  ...zhCNWorkflowLocaleMessages,
}
