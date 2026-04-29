import type { VueLocaleMessages } from "@elysian/frontend-vue"
import { zhCNCoreLocaleMessages } from "./zh-CN.core"
import { zhCNModulesLocaleMessages } from "./zh-CN.modules"
import { zhCNWorkflowLocaleMessages } from "./zh-CN.workflow"

export const zhCNLocaleMessages: VueLocaleMessages = {
  ...zhCNCoreLocaleMessages,
  ...zhCNModulesLocaleMessages,
  ...zhCNWorkflowLocaleMessages,
}
