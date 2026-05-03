import type { VueLocaleMessages } from "@elysian/frontend-vue"
import { zhCNDepartmentLocaleMessages } from "./modules/zh-CN.department"
import { zhCNPostLocaleMessages } from "./modules/zh-CN.post"
import { zhCNMenuLocaleMessages } from "./modules/zh-CN.menu"
import { zhCNRoleLocaleMessages } from "./modules/zh-CN.role"
import { zhCNSettingLocaleMessages } from "./modules/zh-CN.setting"
import { zhCNTenantLocaleMessages } from "./modules/zh-CN.tenant"
import { zhCNDictionaryLocaleMessages } from "./modules/zh-CN.dictionary"
import { zhCNOperationLogLocaleMessages } from "./modules/zh-CN.operation-log"
import { zhCNUserLocaleMessages } from "./modules/zh-CN.user"
import { zhCNOnlineSessionLocaleMessages } from "./modules/zh-CN.online-session"
import { zhCNNotificationLocaleMessages } from "./modules/zh-CN.notification"
import { zhCNFileLocaleMessages } from "./modules/zh-CN.file"

export const zhCNModulesLocaleMessages: VueLocaleMessages = {
  ...zhCNDepartmentLocaleMessages,
  ...zhCNPostLocaleMessages,
  ...zhCNMenuLocaleMessages,
  ...zhCNRoleLocaleMessages,
  ...zhCNSettingLocaleMessages,
  ...zhCNTenantLocaleMessages,
  ...zhCNDictionaryLocaleMessages,
  ...zhCNOperationLogLocaleMessages,
  ...zhCNUserLocaleMessages,
  ...zhCNOnlineSessionLocaleMessages,
  ...zhCNNotificationLocaleMessages,
  ...zhCNFileLocaleMessages,
}
