import type { SupportedLocale, VueLocaleMessages } from "@elysian/frontend-vue"
import { enUSLocaleMessages } from "./i18n.en-US"
import { zhCNLocaleMessages } from "./i18n.zh-CN"

export const exampleLocaleMessages: Record<SupportedLocale, VueLocaleMessages> =
  {
    "zh-CN": zhCNLocaleMessages,
    "en-US": enUSLocaleMessages,
  }
