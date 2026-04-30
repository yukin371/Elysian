import {
  createVueLocaleRuntime,
  provideVueLocaleRuntime,
} from "@elysian/frontend-vue"
import enUs from "tdesign-vue-next/es/locale/en_US"
import zhCn from "tdesign-vue-next/es/locale/zh_CN"
import { computed } from "vue"

import { exampleLocaleMessages } from "../i18n"
import {
  type AppTranslate,
  createAppShellLocalization,
} from "./app-shell-helpers"

export const useExampleAppBootstrap = () => {
  const localeRuntime = provideVueLocaleRuntime(
    createVueLocaleRuntime({
      defaultLocale: "zh-CN",
      fallbackLocale: "en-US",
      messages: exampleLocaleMessages,
    }),
  )

  const { locale, t } = localeRuntime
  const translate: AppTranslate = (key, params) =>
    t(key, params as Record<string, string | number | boolean> | undefined)

  const tdesignGlobalConfig = computed(() =>
    locale.value === "zh-CN" ? zhCn : enUs,
  )

  return {
    locale,
    localizers: createAppShellLocalization(translate),
    t: translate,
    tdesignGlobalConfig,
  }
}
