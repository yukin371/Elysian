import type { VueLocaleMessages } from "@elysian/frontend-vue"
import { zhCNDepartmentLocaleMessages } from "./modules/zh-CN.department"
import { zhCNDictionaryLocaleMessages } from "./modules/zh-CN.dictionary"
import { zhCNFileLocaleMessages } from "./modules/zh-CN.file"
import { zhCNMenuLocaleMessages } from "./modules/zh-CN.menu"
import { zhCNNotificationLocaleMessages } from "./modules/zh-CN.notification"
import { zhCNOnlineSessionLocaleMessages } from "./modules/zh-CN.online-session"
import { zhCNOperationLogLocaleMessages } from "./modules/zh-CN.operation-log"
import { zhCNPostLocaleMessages } from "./modules/zh-CN.post"
import { zhCNRoleLocaleMessages } from "./modules/zh-CN.role"
import { zhCNSettingLocaleMessages } from "./modules/zh-CN.setting"
import { zhCNTenantLocaleMessages } from "./modules/zh-CN.tenant"
import { zhCNUserLocaleMessages } from "./modules/zh-CN.user"

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
