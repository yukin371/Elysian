import type { VueLocaleMessages } from "@elysian/frontend-vue"
import { enUSDepartmentLocaleMessages } from "./modules/en-US.department"
import { enUSDictionaryLocaleMessages } from "./modules/en-US.dictionary"
import { enUSFileLocaleMessages } from "./modules/en-US.file"
import { enUSMenuLocaleMessages } from "./modules/en-US.menu"
import { enUSNotificationLocaleMessages } from "./modules/en-US.notification"
import { enUSOnlineSessionLocaleMessages } from "./modules/en-US.online-session"
import { enUSOperationLogLocaleMessages } from "./modules/en-US.operation-log"
import { enUSPostLocaleMessages } from "./modules/en-US.post"
import { enUSRoleLocaleMessages } from "./modules/en-US.role"
import { enUSSettingLocaleMessages } from "./modules/en-US.setting"
import { enUSTenantLocaleMessages } from "./modules/en-US.tenant"
import { enUSUserLocaleMessages } from "./modules/en-US.user"

export const enUSModulesLocaleMessages: VueLocaleMessages = {
  ...enUSDepartmentLocaleMessages,
  ...enUSPostLocaleMessages,
  ...enUSMenuLocaleMessages,
  ...enUSRoleLocaleMessages,
  ...enUSSettingLocaleMessages,
  ...enUSTenantLocaleMessages,
  ...enUSDictionaryLocaleMessages,
  ...enUSOperationLogLocaleMessages,
  ...enUSUserLocaleMessages,
  ...enUSOnlineSessionLocaleMessages,
  ...enUSNotificationLocaleMessages,
  ...enUSFileLocaleMessages,
}
