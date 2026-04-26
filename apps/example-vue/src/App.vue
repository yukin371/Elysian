<script setup lang="ts">
import {
  applyCrudDictionaryOptions,
  buildCrudDictionaryOptionCatalog,
  buildVueCustomCrudPage,
  buildVueNavigation,
  createVueLocaleRuntime,
  customerWorkspacePageDefinition,
  provideVueLocaleRuntime,
  usePermissions,
} from "@elysian/frontend-vue"
import type { WorkflowDefinitionRecord, WorkflowNode } from "@elysian/schema"
import type { UiNavigationNode } from "@elysian/ui-core"
import {
  type ElyFormField,
  type ElyFormValues,
  type ElyQueryField,
  type ElyQueryValues,
  ElyShell,
  type ElyShellStat,
  type ElyShellTab,
  type ElyShellUserSummary,
  useElyCrudPage,
  vueEnterprisePresetManifest,
} from "@elysian/ui-enterprise-vue"
import { Button as TButton } from "tdesign-vue-next/es/button"
import { ConfigProvider as TConfigProvider } from "tdesign-vue-next/es/config-provider"
import { Input as TInput } from "tdesign-vue-next/es/input"
import enUs from "tdesign-vue-next/es/locale/en_US"
import zhCn from "tdesign-vue-next/es/locale/zh_CN"
import { Select as TSelect } from "tdesign-vue-next/es/select"
import { computed, defineAsyncComponent, onMounted, ref, watch } from "vue"

import { departmentModuleSchema } from "../../../packages/schema/src/department"
import { dictionaryModuleSchema } from "../../../packages/schema/src/dictionary"
import { menuModuleSchema } from "../../../packages/schema/src/menu"
import { notificationModuleSchema } from "../../../packages/schema/src/notification"
import { operationLogModuleSchema } from "../../../packages/schema/src/operation-log"
import { roleModuleSchema } from "../../../packages/schema/src/role"
import { settingModuleSchema } from "../../../packages/schema/src/setting"
import { userModuleSchema } from "../../../packages/schema/src/user"
import { exampleLocaleMessages } from "./i18n"
import {
  filterNotifications,
  resolveNotificationSelection,
} from "./lib/notification-workspace"
import {
  type AuthIdentityResponse,
  type CustomerRecord,
  type DepartmentDetailRecord,
  type DepartmentRecord,
  type DictionaryTypeDetailRecord,
  type DictionaryTypeRecord,
  type MenuDetailRecord,
  type MenuRecord,
  type NotificationRecord,
  type OperationLogListQuery,
  type OperationLogRecord,
  type PlatformResponse,
  type RoleDetailRecord,
  type RoleRecord,
  type SettingRecord,
  type UserRecord,
  clearAccessToken,
  createCustomer,
  createDepartment,
  createDictionaryType,
  createMenu,
  createNotification,
  createRole,
  createSetting,
  createUser,
  deleteCustomer,
  fetchCustomers,
  fetchDepartmentById,
  fetchDepartments,
  fetchDictionaryItems,
  fetchDictionaryTypeById,
  fetchDictionaryTypes,
  fetchMenuById,
  fetchMenus,
  fetchNotificationById,
  fetchNotifications,
  fetchOperationLogById,
  fetchOperationLogs,
  fetchPlatform,
  fetchRoleById,
  fetchRoles,
  fetchSettingById,
  fetchSettings,
  fetchSystemModules,
  fetchUsers,
  fetchWorkflowDefinitionById,
  fetchWorkflowDefinitions,
  login,
  logout,
  markNotificationAsRead,
  refreshAuth,
  resetUserPassword,
  updateCustomer,
  updateDepartment,
  updateDictionaryType,
  updateMenu,
  updateRole,
  updateSetting,
  updateUser,
} from "./lib/platform-api"
import {
  type WorkflowStatusFilter,
  filterWorkflowDefinitions,
  listWorkflowDefinitionVersions,
  resolveWorkflowDefinitionSelection,
} from "./lib/workflow-workspace"

const ElyCrudWorkspace = defineAsyncComponent(
  () =>
    import(
      "../../../packages/ui-enterprise-vue/src/components/ElyCrudWorkspace.vue"
    ),
)

const ElyForm = defineAsyncComponent(
  () =>
    import("../../../packages/ui-enterprise-vue/src/components/ElyForm.vue"),
)

const customerPageDefinition = customerWorkspacePageDefinition
const dictionaryPageDefinition = buildVueCustomCrudPage(dictionaryModuleSchema)
const departmentPageDefinition = buildVueCustomCrudPage(departmentModuleSchema)
const menuPageDefinition = buildVueCustomCrudPage(menuModuleSchema)
const notificationPageDefinition = buildVueCustomCrudPage(
  notificationModuleSchema,
)
const operationLogPageDefinition = buildVueCustomCrudPage(
  operationLogModuleSchema,
)
const rolePageDefinition = buildVueCustomCrudPage(roleModuleSchema)
const settingPageDefinition = buildVueCustomCrudPage(settingModuleSchema)
const userPageDefinition = buildVueCustomCrudPage(userModuleSchema)

const localeRuntime = provideVueLocaleRuntime(
  createVueLocaleRuntime({
    defaultLocale: "zh-CN",
    fallbackLocale: "en-US",
    messages: exampleLocaleMessages,
  }),
)

const { locale, t } = localeRuntime

const tdesignGlobalConfig = computed(() =>
  locale.value === "zh-CN" ? zhCn : enUs,
)

const localeOptions = [
  { key: "zh-CN", labelKey: "app.locale.zhCN" },
  { key: "en-US", labelKey: "app.locale.enUS" },
] as const

const flattenNavigation = (items: UiNavigationNode[]): UiNavigationNode[] =>
  items.flatMap((item) => [item, ...flattenNavigation(item.children)])

const findNavigationItemById = (
  items: UiNavigationNode[],
  id: string,
): UiNavigationNode | null => {
  for (const item of items) {
    if (item.id === id) {
      return item
    }

    const nested = findNavigationItemById(item.children, id)

    if (nested) {
      return nested
    }
  }

  return null
}

const findFirstMenuItem = (
  items: UiNavigationNode[],
): UiNavigationNode | null => {
  for (const item of items) {
    if (item.type === "menu" && item.path) {
      return item
    }

    const nested = findFirstMenuItem(item.children)

    if (nested) {
      return nested
    }
  }

  return null
}

const createDefaultCustomerDraft = () => ({
  name: "",
  status: "active" as CustomerRecord["status"],
})

const createDefaultUserDraft = () => ({
  username: "",
  displayName: "",
  email: "",
  phone: "",
  status: "active" as UserRecord["status"],
  isSuperAdmin: false,
})

const createDefaultDictionaryTypeDraft = () => ({
  code: "",
  name: "",
  description: "",
  status: "active" as DictionaryTypeRecord["status"],
})

const createDefaultNotificationDraft = () => ({
  recipientUserId: "",
  title: "",
  content: "",
  level: "info" as NotificationRecord["level"],
})

const createDefaultDepartmentDraft = () => ({
  parentId: "",
  code: "",
  name: "",
  sort: 10,
  status: "active" as DepartmentRecord["status"],
})

const createDefaultMenuDraft = () => ({
  parentId: "",
  type: "menu" as MenuRecord["type"],
  code: "",
  name: "",
  path: "",
  component: "",
  icon: "",
  sort: 10,
  isVisible: true,
  status: "active" as MenuRecord["status"],
  permissionCode: "",
})

const createDefaultSettingDraft = () => ({
  key: "",
  value: "",
  description: "",
  status: "active" as SettingRecord["status"],
})

const createDefaultRoleDraft = () => ({
  code: "",
  name: "",
  description: "",
  status: "active" as RoleRecord["status"],
  isSystem: false,
  dataScope: 1 as RoleRecord["dataScope"],
})

type CustomerListSortValue =
  | "createdAt:desc"
  | "createdAt:asc"
  | "name:asc"
  | "name:desc"

const normalizeCustomerName = (value: unknown) => String(value ?? "").trim()
const normalizeCustomerStatus = (value: unknown): CustomerRecord["status"] =>
  value === "inactive" ? "inactive" : "active"
const normalizeUserText = (value: unknown) => String(value ?? "").trim()
const normalizeOptionalUserText = (value: unknown) => {
  const normalized = normalizeUserText(value)
  return normalized.length > 0 ? normalized : undefined
}
const normalizeUserStatus = (value: unknown): UserRecord["status"] =>
  value === "disabled" ? "disabled" : "active"
const normalizeUserBoolean = (value: unknown) => value === true
const normalizeDictionaryText = (value: unknown) => String(value ?? "").trim()
const normalizeOptionalDictionaryText = (value: unknown) => {
  const normalized = normalizeDictionaryText(value)
  return normalized.length > 0 ? normalized : undefined
}
const normalizeDictionaryStatus = (
  value: unknown,
): DictionaryTypeRecord["status"] =>
  value === "disabled" ? "disabled" : "active"
const normalizeNotificationText = (value: unknown) => String(value ?? "").trim()
const normalizeNotificationLevel = (
  value: unknown,
): NotificationRecord["level"] => {
  if (value === "success" || value === "warning" || value === "error") {
    return value
  }

  return "info"
}
const normalizeDepartmentText = (value: unknown) => String(value ?? "").trim()
const normalizeOptionalDepartmentId = (value: unknown) => {
  const normalized = normalizeDepartmentText(value)
  return normalized.length > 0 ? normalized : undefined
}
const normalizeDepartmentSort = (value: unknown) => {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)

  return Number.isFinite(parsed) ? parsed : 10
}
const normalizeDepartmentStatus = (
  value: unknown,
): DepartmentRecord["status"] => (value === "disabled" ? "disabled" : "active")
const normalizeMenuText = (value: unknown) => String(value ?? "").trim()
const normalizeOptionalMenuText = (value: unknown) => {
  const normalized = normalizeMenuText(value)
  return normalized.length > 0 ? normalized : undefined
}
const normalizeOptionalMenuId = (value: unknown) => {
  const normalized = normalizeMenuText(value)
  return normalized.length > 0 ? normalized : undefined
}
const normalizeMenuSort = (value: unknown) => {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)

  return Number.isFinite(parsed) ? parsed : 10
}
const normalizeMenuStatus = (value: unknown): MenuRecord["status"] =>
  value === "disabled" ? "disabled" : "active"
const normalizeMenuBoolean = (value: unknown) => value === true
const normalizeMenuType = (value: unknown): MenuRecord["type"] => {
  if (value === "directory" || value === "button") {
    return value
  }

  return "menu"
}
const normalizeSettingText = (value: unknown) => String(value ?? "").trim()
const normalizeOptionalSettingText = (value: unknown) => {
  const normalized = normalizeSettingText(value)
  return normalized.length > 0 ? normalized : undefined
}
const normalizeSettingStatus = (value: unknown): SettingRecord["status"] =>
  value === "disabled" ? "disabled" : "active"
const normalizeRoleText = (value: unknown) => String(value ?? "").trim()
const normalizeOptionalRoleText = (value: unknown) => {
  const normalized = normalizeRoleText(value)
  return normalized.length > 0 ? normalized : undefined
}
const normalizeRoleStatus = (value: unknown): RoleRecord["status"] =>
  value === "disabled" ? "disabled" : "active"
const normalizeRoleBoolean = (value: unknown) => value === true
const normalizeRoleDataScope = (value: unknown): RoleRecord["dataScope"] => {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)

  return parsed === 2 || parsed === 3 || parsed === 4 || parsed === 5
    ? parsed
    : 1
}
const buildCustomerListQuery = (values: ElyQueryValues, page: number) => {
  const query =
    typeof values.name === "string" && values.name.trim().length > 0
      ? values.name.trim()
      : undefined
  const status =
    values.status === "active" || values.status === "inactive"
      ? values.status
      : undefined

  return {
    q: query,
    status,
    page,
    pageSize: customerListPageSize.value,
    sortBy: customerListSortValue.value.startsWith("name")
      ? ("name" as const)
      : ("createdAt" as const),
    sortOrder: customerListSortValue.value.endsWith(":asc")
      ? ("asc" as const)
      : ("desc" as const),
  }
}

const localizeWorkflowStatus = (status: WorkflowDefinitionRecord["status"]) => {
  if (status === "active") {
    return t("app.workflow.status.active")
  }

  return t("app.workflow.status.disabled")
}

const localizeWorkflowNodeType = (type: WorkflowNode["type"]) => {
  switch (type) {
    case "start":
      return t("app.workflow.nodeType.start")
    case "approval":
      return t("app.workflow.nodeType.approval")
    case "condition":
      return t("app.workflow.nodeType.condition")
    case "end":
      return t("app.workflow.nodeType.end")
  }
}

const describeWorkflowNode = (node: WorkflowNode) => {
  if (node.type === "approval") {
    return `${t("app.workflow.node.assignee")}: ${node.assignee}`
  }

  if (node.type === "condition") {
    return t("app.workflow.node.conditions", {
      count: node.conditions.length,
    })
  }

  return ""
}

const localizeCustomerStatus = (status: string) => {
  if (status === "active") {
    return t("copy.query.statusActive")
  }

  if (status === "inactive") {
    return t("copy.query.statusInactive")
  }

  return status
}

const localizeUserStatus = (status: string) => {
  if (status === "active") {
    return t("app.user.status.active")
  }

  if (status === "disabled") {
    return t("app.user.status.disabled")
  }

  return status
}

const localizeDictionaryStatus = (status: string) => {
  if (status === "active") {
    return t("app.dictionary.status.active")
  }

  if (status === "disabled") {
    return t("app.dictionary.status.disabled")
  }

  return status
}

const localizeNotificationStatus = (status: string) => {
  if (status === "read") {
    return t("app.notification.status.read")
  }

  if (status === "unread") {
    return t("app.notification.status.unread")
  }

  return status
}

const localizeNotificationLevel = (level: string) => {
  switch (level) {
    case "success":
      return t("app.notification.level.success")
    case "warning":
      return t("app.notification.level.warning")
    case "error":
      return t("app.notification.level.error")
    default:
      return t("app.notification.level.info")
  }
}

const localizeDepartmentStatus = (status: string) => {
  if (status === "active") {
    return t("app.department.status.active")
  }

  if (status === "disabled") {
    return t("app.department.status.disabled")
  }

  return status
}

const localizeMenuStatus = (status: string) => {
  if (status === "active") {
    return t("app.menu.status.active")
  }

  if (status === "disabled") {
    return t("app.menu.status.disabled")
  }

  return status
}

const localizeMenuType = (type: string) => {
  switch (type) {
    case "directory":
      return t("app.menu.type.directory")
    case "button":
      return t("app.menu.type.button")
    default:
      return t("app.menu.type.menu")
  }
}

const localizeMenuBoolean = (value: boolean) =>
  value ? t("app.menu.boolean.true") : t("app.menu.boolean.false")

const localizeSettingStatus = (status: string) => {
  if (status === "active") {
    return t("app.setting.status.active")
  }

  if (status === "disabled") {
    return t("app.setting.status.disabled")
  }

  return status
}

const localizeOperationLogResult = (result: string) => {
  if (result === "success") {
    return t("app.operationLog.result.success")
  }

  if (result === "failure") {
    return t("app.operationLog.result.failure")
  }

  return result
}

const localizeRoleStatus = (status: string) => {
  if (status === "active") {
    return t("app.role.status.active")
  }

  if (status === "disabled") {
    return t("app.role.status.disabled")
  }

  return status
}

const localizeRoleDataScope = (scope: number) => {
  switch (scope) {
    case 2:
      return t("app.role.dataScope.2")
    case 3:
      return t("app.role.dataScope.3")
    case 4:
      return t("app.role.dataScope.4")
    case 5:
      return t("app.role.dataScope.5")
    default:
      return t("app.role.dataScope.1")
  }
}

const localizeFieldLabel = (fieldKey: string) => {
  switch (fieldKey) {
    case "id":
      return t("app.customer.field.id")
    case "name":
      return t("app.customer.field.name")
    case "status":
      return t("app.customer.field.status")
    case "createdAt":
      return t("app.customer.field.createdAt")
    case "updatedAt":
      return t("app.customer.field.updatedAt")
    default:
      return fieldKey
  }
}

const localizeUserFieldLabel = (fieldKey: string) => {
  switch (fieldKey) {
    case "id":
      return t("app.user.field.id")
    case "username":
      return t("app.user.field.username")
    case "displayName":
      return t("app.user.field.displayName")
    case "email":
      return t("app.user.field.email")
    case "phone":
      return t("app.user.field.phone")
    case "status":
      return t("app.user.field.status")
    case "isSuperAdmin":
      return t("app.user.field.isSuperAdmin")
    case "lastLoginAt":
      return t("app.user.field.lastLoginAt")
    case "createdAt":
      return t("app.user.field.createdAt")
    case "updatedAt":
      return t("app.user.field.updatedAt")
    default:
      return fieldKey
  }
}

const localizeDictionaryFieldLabel = (fieldKey: string) => {
  switch (fieldKey) {
    case "id":
      return t("app.dictionary.field.id")
    case "code":
      return t("app.dictionary.field.code")
    case "name":
      return t("app.dictionary.field.name")
    case "description":
      return t("app.dictionary.field.description")
    case "status":
      return t("app.dictionary.field.status")
    case "createdAt":
      return t("app.dictionary.field.createdAt")
    case "updatedAt":
      return t("app.dictionary.field.updatedAt")
    default:
      return fieldKey
  }
}

const localizeNotificationFieldLabel = (fieldKey: string) => {
  switch (fieldKey) {
    case "id":
      return t("app.notification.field.id")
    case "recipientUserId":
      return t("app.notification.field.recipientUserId")
    case "title":
      return t("app.notification.field.title")
    case "content":
      return t("app.notification.field.content")
    case "level":
      return t("app.notification.field.level")
    case "status":
      return t("app.notification.field.status")
    case "createdByUserId":
      return t("app.notification.field.createdByUserId")
    case "readAt":
      return t("app.notification.field.readAt")
    case "createdAt":
      return t("app.notification.field.createdAt")
    default:
      return fieldKey
  }
}

const localizeDepartmentFieldLabel = (fieldKey: string) => {
  switch (fieldKey) {
    case "id":
      return t("app.department.field.id")
    case "parentId":
      return t("app.department.field.parentId")
    case "code":
      return t("app.department.field.code")
    case "name":
      return t("app.department.field.name")
    case "sort":
      return t("app.department.field.sort")
    case "status":
      return t("app.department.field.status")
    case "createdAt":
      return t("app.department.field.createdAt")
    case "updatedAt":
      return t("app.department.field.updatedAt")
    default:
      return fieldKey
  }
}

const localizeMenuFieldLabel = (fieldKey: string) => {
  switch (fieldKey) {
    case "id":
      return t("app.menu.field.id")
    case "parentId":
      return t("app.menu.field.parentId")
    case "type":
      return t("app.menu.field.type")
    case "code":
      return t("app.menu.field.code")
    case "name":
      return t("app.menu.field.name")
    case "path":
      return t("app.menu.field.path")
    case "component":
      return t("app.menu.field.component")
    case "icon":
      return t("app.menu.field.icon")
    case "sort":
      return t("app.menu.field.sort")
    case "isVisible":
      return t("app.menu.field.isVisible")
    case "status":
      return t("app.menu.field.status")
    case "permissionCode":
      return t("app.menu.field.permissionCode")
    case "createdAt":
      return t("app.menu.field.createdAt")
    case "updatedAt":
      return t("app.menu.field.updatedAt")
    default:
      return fieldKey
  }
}

const localizeSettingFieldLabel = (fieldKey: string) => {
  switch (fieldKey) {
    case "id":
      return t("app.setting.field.id")
    case "key":
      return t("app.setting.field.key")
    case "value":
      return t("app.setting.field.value")
    case "description":
      return t("app.setting.field.description")
    case "status":
      return t("app.setting.field.status")
    case "createdAt":
      return t("app.setting.field.createdAt")
    case "updatedAt":
      return t("app.setting.field.updatedAt")
    default:
      return fieldKey
  }
}

const localizeOperationLogFieldLabel = (fieldKey: string) => {
  switch (fieldKey) {
    case "id":
      return t("app.operationLog.field.id")
    case "category":
      return t("app.operationLog.field.category")
    case "action":
      return t("app.operationLog.field.action")
    case "actorUserId":
      return t("app.operationLog.field.actorUserId")
    case "targetType":
      return t("app.operationLog.field.targetType")
    case "targetId":
      return t("app.operationLog.field.targetId")
    case "result":
      return t("app.operationLog.field.result")
    case "requestId":
      return t("app.operationLog.field.requestId")
    case "ip":
      return t("app.operationLog.field.ip")
    case "userAgent":
      return t("app.operationLog.field.userAgent")
    case "createdAt":
      return t("app.operationLog.field.createdAt")
    default:
      return fieldKey
  }
}

const localizeRoleFieldLabel = (fieldKey: string) => {
  switch (fieldKey) {
    case "id":
      return t("app.role.field.id")
    case "code":
      return t("app.role.field.code")
    case "name":
      return t("app.role.field.name")
    case "description":
      return t("app.role.field.description")
    case "status":
      return t("app.role.field.status")
    case "isSystem":
      return t("app.role.field.isSystem")
    case "dataScope":
      return t("app.role.field.dataScope")
    case "createdAt":
      return t("app.role.field.createdAt")
    case "updatedAt":
      return t("app.role.field.updatedAt")
    default:
      return fieldKey
  }
}

const localizeActionLabel = (actionKey: string, fallbackLabel: string) => {
  switch (actionKey) {
    case "create":
      return t("app.customer.action.create")
    case "update":
      return t("app.customer.action.update")
    case "delete":
      return t("app.customer.action.delete")
    default:
      return fallbackLabel
  }
}

const localizeNavigationName = (code: string, fallbackName: string) => {
  switch (code) {
    case "system-root":
      return t("app.fallback.system")
    case "system-users":
      return t("app.fallback.users")
    case "system-roles":
      return t("app.fallback.roles")
    case "system-menus":
      return t("app.fallback.menus")
    case "system-departments":
      return t("app.fallback.departments")
    case "system-dictionaries":
      return t("app.fallback.dictionaries")
    case "system-settings":
      return t("app.fallback.settings")
    case "system-operation-logs":
      return t("app.fallback.operationLogs")
    case "system-files":
      return t("app.fallback.files")
    case "system-notifications":
      return t("app.fallback.notifications")
    case "system-tenants":
      return t("app.fallback.tenants")
    case "customer-root":
      return t("app.fallback.customerRoot")
    case "customer-list":
      return t("app.fallback.customers")
    case "workflow-root":
      return t("app.fallback.workflow")
    case "workflow-definitions":
      return t("app.fallback.workflowDefinitions")
    case "workflow-instances":
      return t("app.fallback.workflowInstances")
    case "workflow-tasks-todo":
      return t("app.fallback.workflowTodo")
    case "workflow-tasks-done":
      return t("app.fallback.workflowDone")
    default:
      return fallbackName
  }
}

const localizePlatformStatus = (status: string | null | undefined) => {
  switch (status) {
    case "prototype":
      return t("app.platform.status.prototype")
    case "accepted":
      return t("app.platform.status.accepted")
    case "planned":
      return t("app.platform.status.planned")
    case "bootstrap":
    case "Bootstrap":
      return t("app.platform.status.bootstrap")
    default:
      return status ?? ""
  }
}

const localizeCapability = (capability: string) => {
  switch (capability) {
    case "schema-first code generation":
      return t("app.platform.capability.schemaFirstCodegen")
    case "AI-assisted module specification":
      return t("app.platform.capability.aiModuleSpec")
    case "pluggable frontend adapters":
      return t("app.platform.capability.pluggableFrontendAdapters")
    default:
      return capability
  }
}

const localizeNavigationItems = (
  items: UiNavigationNode[],
): UiNavigationNode[] =>
  items.map((item) => ({
    ...item,
    name: localizeNavigationName(item.code, item.name),
    children: localizeNavigationItems(item.children),
  }))

const buildFallbackNavigation = (): UiNavigationNode[] => [
  {
    id: "enterprise-system",
    parentId: null,
    type: "directory",
    code: "system-root",
    name: t("app.fallback.system"),
    path: null,
    component: null,
    icon: "settings",
    sort: 10,
    isVisible: true,
    status: "active",
    permissionCode: null,
    depth: 0,
    children: [
      {
        id: "enterprise-users",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-users",
        name: t("app.fallback.users"),
        path: "/system/users",
        component: "system/users/index",
        icon: "users",
        sort: 10,
        isVisible: true,
        status: "active",
        permissionCode: "system:user:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-roles",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-roles",
        name: t("app.fallback.roles"),
        path: "/system/roles",
        component: "system/roles/index",
        icon: "shield",
        sort: 20,
        isVisible: true,
        status: "active",
        permissionCode: "system:role:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-menus",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-menus",
        name: t("app.fallback.menus"),
        path: "/system/menus",
        component: "system/menus/index",
        icon: "menu",
        sort: 30,
        isVisible: true,
        status: "active",
        permissionCode: "system:menu:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-departments",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-departments",
        name: t("app.fallback.departments"),
        path: "/system/departments",
        component: "system/departments/index",
        icon: "apartment",
        sort: 40,
        isVisible: true,
        status: "active",
        permissionCode: "system:department:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-dictionaries",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-dictionaries",
        name: t("app.fallback.dictionaries"),
        path: "/system/dictionaries",
        component: "system/dictionaries/index",
        icon: "book",
        sort: 50,
        isVisible: true,
        status: "active",
        permissionCode: "system:dictionary:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-settings",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-settings",
        name: t("app.fallback.settings"),
        path: "/system/settings",
        component: "system/settings/index",
        icon: "tool",
        sort: 60,
        isVisible: true,
        status: "active",
        permissionCode: "system:setting:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-operation-logs",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-operation-logs",
        name: t("app.fallback.operationLogs"),
        path: "/system/operation-logs",
        component: "system/operation-logs/index",
        icon: "file",
        sort: 70,
        isVisible: true,
        status: "active",
        permissionCode: "system:operation-log:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-files",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-files",
        name: t("app.fallback.files"),
        path: "/system/files",
        component: "system/files/index",
        icon: "attachment",
        sort: 80,
        isVisible: true,
        status: "active",
        permissionCode: "system:file:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-notifications",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-notifications",
        name: t("app.fallback.notifications"),
        path: "/system/notifications",
        component: "system/notifications/index",
        icon: "notification",
        sort: 90,
        isVisible: true,
        status: "active",
        permissionCode: "system:notification:list",
        depth: 1,
        children: [],
      },
    ],
  },
  {
    id: "enterprise-customer",
    parentId: null,
    type: "menu",
    code: "customer-list",
    name: t("app.fallback.customers"),
    path: "/customers",
    component: "customer/index",
    icon: "storage",
    sort: 20,
    isVisible: true,
    status: "active",
    permissionCode: "customer:customer:list",
    depth: 0,
    children: [],
  },
]

type ExampleWorkspaceKind =
  | "customer"
  | "dictionary"
  | "department"
  | "menu"
  | "notification"
  | "operation-log"
  | "role"
  | "setting"
  | "user"
  | "workflow-definitions"
  | "placeholder"
type ExampleShellTabKey = "workspace" | "runtime"

const resolveModuleCodeFromPath = (path: string | null | undefined) => {
  if (!path) {
    return null
  }

  if (path.startsWith("/customers")) return "customer"
  if (path.startsWith("/system/users")) return "user"
  if (path.startsWith("/system/roles")) return "role"
  if (path.startsWith("/system/menus")) return "menu"
  if (path.startsWith("/system/departments")) return "department"
  if (path.startsWith("/system/dictionaries")) return "dictionary"
  if (path.startsWith("/system/settings")) return "setting"
  if (path.startsWith("/system/operation-logs")) return "operation-log"
  if (path.startsWith("/system/files")) return "file"
  if (path.startsWith("/system/notifications")) return "notification"
  if (path.startsWith("/system/tenants")) return "tenant"
  if (path.startsWith("/workflow/")) return "workflow"

  return null
}

const platform = ref<PlatformResponse | null>(null)
const authIdentity = ref<AuthIdentityResponse | null>(null)
const customerItems = ref<CustomerRecord[]>([])
const departmentItems = ref<DepartmentRecord[]>([])
const menuItems = ref<MenuRecord[]>([])
const notificationItems = ref<NotificationRecord[]>([])
const operationLogItems = ref<OperationLogRecord[]>([])
const roleItems = ref<RoleRecord[]>([])
const settingItems = ref<SettingRecord[]>([])
const userItems = ref<UserRecord[]>([])
const dictionaryTypeDetail = ref<DictionaryTypeDetailRecord | null>(null)
const departmentDetail = ref<DepartmentDetailRecord | null>(null)
const menuDetail = ref<MenuDetailRecord | null>(null)
const notificationDetail = ref<NotificationRecord | null>(null)
const operationLogDetail = ref<OperationLogRecord | null>(null)
const roleDetail = ref<RoleDetailRecord | null>(null)
const settingDetail = ref<SettingRecord | null>(null)
const workflowDefinitions = ref<WorkflowDefinitionRecord[]>([])
const registeredModuleCodes = ref<string[]>([])
const loading = ref(true)
const authLoading = ref(false)
const customerLoading = ref(false)
const dictionaryLoading = ref(false)
const departmentLoading = ref(false)
const menuLoading = ref(false)
const notificationLoading = ref(false)
const operationLogLoading = ref(false)
const roleLoading = ref(false)
const settingLoading = ref(false)
const userLoading = ref(false)
const workflowLoading = ref(false)
const dictionaryDetailLoading = ref(false)
const departmentDetailLoading = ref(false)
const menuDetailLoading = ref(false)
const notificationDetailLoading = ref(false)
const operationLogDetailLoading = ref(false)
const roleDetailLoading = ref(false)
const settingDetailLoading = ref(false)
const workflowDetailLoading = ref(false)
const errorMessage = ref("")
const authErrorMessage = ref("")
const customerErrorMessage = ref("")
const dictionaryErrorMessage = ref("")
const departmentErrorMessage = ref("")
const menuErrorMessage = ref("")
const notificationErrorMessage = ref("")
const operationLogErrorMessage = ref("")
const roleErrorMessage = ref("")
const settingErrorMessage = ref("")
const userErrorMessage = ref("")
const workflowErrorMessage = ref("")
const dictionaryDetailErrorMessage = ref("")
const departmentDetailErrorMessage = ref("")
const menuDetailErrorMessage = ref("")
const notificationDetailErrorMessage = ref("")
const operationLogDetailErrorMessage = ref("")
const roleDetailErrorMessage = ref("")
const settingDetailErrorMessage = ref("")
const workflowDetailErrorMessage = ref("")
const authModuleReady = ref(false)
const customerModuleReady = ref(false)
const departmentModuleReady = ref(false)
const menuModuleReady = ref(false)
const notificationModuleReady = ref(false)
const operationLogModuleReady = ref(false)
const roleModuleReady = ref(false)
const settingModuleReady = ref(false)
const userModuleReady = ref(false)
const dictionaryModuleReady = ref(false)
const workflowModuleReady = ref(false)
const envName = ref("unknown")
const demoAdminPassword = ["admin", "123"].join("")

const loginForm = ref({
  username: "admin",
  password: demoAdminPassword,
})

const customerForm = ref(createDefaultCustomerDraft())
const editForm = ref(createDefaultCustomerDraft())
const editingId = ref<string | null>(null)
const deleteConfirmId = ref<string | null>(null)
const selectedCustomerId = ref<string | null>(null)
const selectedDictionaryTypeId = ref<string | null>(null)
const selectedDepartmentId = ref<string | null>(null)
const selectedMenuId = ref<string | null>(null)
const selectedNotificationId = ref<string | null>(null)
const selectedOperationLogId = ref<string | null>(null)
const selectedRoleId = ref<string | null>(null)
const selectedSettingId = ref<string | null>(null)
const selectedUserId = ref<string | null>(null)
const selectedWorkflowDefinitionId = ref<string | null>(null)
const workflowDefinitionDetail = ref<WorkflowDefinitionRecord | null>(null)
const workflowQuery = ref("")
const workflowStatusFilter = ref<"all" | WorkflowDefinitionRecord["status"]>(
  "all",
)
const currentMenuKey = ref<string | null>(null)
const currentShellTabKey = ref<ExampleShellTabKey>("workspace")
const enterpriseFormMode = ref<"create" | "detail" | "edit">("create")
const dictionaryPanelMode = ref<"detail" | "create" | "edit">("detail")
const departmentPanelMode = ref<"detail" | "create" | "edit">("detail")
const menuPanelMode = ref<"detail" | "create" | "edit">("detail")
const notificationPanelMode = ref<"detail" | "create">("detail")
const rolePanelMode = ref<"detail" | "create" | "edit">("detail")
const settingPanelMode = ref<"detail" | "create" | "edit">("detail")
const userPanelMode = ref<"detail" | "create" | "edit" | "reset">("detail")
const enterpriseQueryValues = ref<ElyQueryValues>({})
const dictionaryQueryValues = ref<ElyQueryValues>({})
const departmentQueryValues = ref<ElyQueryValues>({})
const menuQueryValues = ref<ElyQueryValues>({})
const notificationQueryValues = ref<ElyQueryValues>({})
const operationLogQueryValues = ref<ElyQueryValues>({})
const roleQueryValues = ref<ElyQueryValues>({})
const settingQueryValues = ref<ElyQueryValues>({})
const userQueryValues = ref<ElyQueryValues>({})
const customerListPage = ref(1)
const customerListPageSize = ref(20)
const customerListSortValue = ref<CustomerListSortValue>("createdAt:desc")
const customerPageInputValue = ref("1")
const customerListTotal = ref(0)
const customerListTotalPages = ref(1)
const dictionaryTypes = ref<
  Awaited<ReturnType<typeof fetchDictionaryTypes>>["items"]
>([])
const dictionaryItems = ref<
  Awaited<ReturnType<typeof fetchDictionaryItems>>["items"]
>([])
const dictionaryCreateForm = ref(createDefaultDictionaryTypeDraft())
const dictionaryEditForm = ref(createDefaultDictionaryTypeDraft())
const notificationCreateForm = ref(createDefaultNotificationDraft())
const departmentCreateForm = ref(createDefaultDepartmentDraft())
const departmentEditForm = ref(createDefaultDepartmentDraft())
const menuCreateForm = ref(createDefaultMenuDraft())
const menuEditForm = ref(createDefaultMenuDraft())
const roleCreateForm = ref(createDefaultRoleDraft())
const roleEditForm = ref(createDefaultRoleDraft())
const settingCreateForm = ref(createDefaultSettingDraft())
const settingEditForm = ref(createDefaultSettingDraft())
const userCreateForm = ref(createDefaultUserDraft())
const userEditForm = ref(createDefaultUserDraft())
const userPasswordInput = ref("")

const isAuthenticated = computed(() => authIdentity.value !== null)
const permissionCodes = computed(
  () => authIdentity.value?.permissionCodes ?? [],
)
const navigationTree = computed(() =>
  authIdentity.value
    ? localizeNavigationItems(
        buildVueNavigation(
          authIdentity.value.menus,
          authIdentity.value.permissionCodes,
        ),
      )
    : [],
)

const fallbackNavigation = computed(() => buildFallbackNavigation())

const navigationItemCount = computed(
  () => flattenNavigation(enterpriseNavigation.value).length,
)

const enterpriseNavigation = computed(() =>
  navigationTree.value.length > 0
    ? navigationTree.value
    : fallbackNavigation.value,
)

const defaultNavigationItem = computed(
  () =>
    flattenNavigation(enterpriseNavigation.value).find(
      (item) => item.path === "/customers",
    ) ?? findFirstMenuItem(enterpriseNavigation.value),
)

const selectedNavigationItem = computed(
  () =>
    (currentMenuKey.value
      ? findNavigationItemById(enterpriseNavigation.value, currentMenuKey.value)
      : null) ?? defaultNavigationItem.value,
)

watch(
  enterpriseNavigation,
  (items) => {
    const fallbackItem =
      flattenNavigation(items).find((item) => item.path === "/customers") ??
      findFirstMenuItem(items)
    const currentItem = currentMenuKey.value
      ? findNavigationItemById(items, currentMenuKey.value)
      : null

    currentMenuKey.value = currentItem?.id ?? fallbackItem?.id ?? null
  },
  {
    immediate: true,
  },
)

watch(
  customerListPage,
  (page) => {
    customerPageInputValue.value = String(page)
  },
  {
    immediate: true,
  },
)

const isCustomerWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/customers",
)

const isDictionaryWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/system/dictionaries",
)

const isDepartmentWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/system/departments",
)

const isMenuWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/system/menus",
)

const isNotificationWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/system/notifications",
)

const isOperationLogWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/system/operation-logs",
)

const isRoleWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/system/roles",
)

const isSettingWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/system/settings",
)

const isUserWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/system/users",
)

const isWorkflowDefinitionsWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/workflow/definitions",
)

const currentWorkspaceKind = computed<ExampleWorkspaceKind>(() =>
  isCustomerWorkspace.value
    ? "customer"
    : isDictionaryWorkspace.value
      ? "dictionary"
      : isDepartmentWorkspace.value
        ? "department"
        : isMenuWorkspace.value
          ? "menu"
          : isNotificationWorkspace.value
            ? "notification"
            : isOperationLogWorkspace.value
              ? "operation-log"
              : isRoleWorkspace.value
                ? "role"
                : isSettingWorkspace.value
                  ? "setting"
                  : isUserWorkspace.value
                    ? "user"
                    : isWorkflowDefinitionsWorkspace.value
                      ? "workflow-definitions"
                      : "placeholder",
)

const customerNavigationItem = computed(
  () =>
    flattenNavigation(enterpriseNavigation.value).find(
      (item) => item.path === "/customers",
    ) ?? null,
)

const currentNavigationPath = computed(
  () => selectedNavigationItem.value?.path ?? t("app.placeholder.pathMissing"),
)

const currentModuleCode = computed(() =>
  resolveModuleCodeFromPath(selectedNavigationItem.value?.path),
)

const currentModuleCodeLabel = computed(
  () => currentModuleCode.value ?? t("app.placeholder.fallbackModule"),
)

const currentModuleReady = computed(
  () =>
    currentModuleCode.value !== null &&
    registeredModuleCodes.value.includes(currentModuleCode.value),
)

const currentModuleStatusLabel = computed(() =>
  currentModuleReady.value
    ? t("app.placeholder.ready")
    : t("app.placeholder.offline"),
)

const currentWorkspaceSectionTitle = computed(() =>
  isCustomerWorkspace.value
    ? t("app.section.workspaceTitle")
    : isDictionaryWorkspace.value
      ? t("app.dictionary.sectionTitle")
      : isDepartmentWorkspace.value
        ? t("app.department.sectionTitle")
        : isMenuWorkspace.value
          ? t("app.menu.sectionTitle")
          : isNotificationWorkspace.value
            ? t("app.notification.sectionTitle")
            : isOperationLogWorkspace.value
              ? t("app.operationLog.sectionTitle")
              : isRoleWorkspace.value
                ? t("app.role.sectionTitle")
                : isSettingWorkspace.value
                  ? t("app.setting.sectionTitle")
                  : isUserWorkspace.value
                    ? t("app.user.sectionTitle")
                    : isWorkflowDefinitionsWorkspace.value
                      ? t("app.workflow.sectionTitle")
                      : t("app.section.placeholderTitle", {
                          name:
                            selectedNavigationItem.value?.name ??
                            t("app.section.workspaceTitle"),
                        }),
)

const currentWorkspaceSectionCopy = computed(() =>
  isCustomerWorkspace.value
    ? t("app.section.workspaceCopy")
    : isDictionaryWorkspace.value
      ? t("app.dictionary.sectionCopy")
      : isDepartmentWorkspace.value
        ? t("app.department.sectionCopy")
        : isMenuWorkspace.value
          ? t("app.menu.sectionCopy")
          : isNotificationWorkspace.value
            ? t("app.notification.sectionCopy")
            : isOperationLogWorkspace.value
              ? t("app.operationLog.sectionCopy")
              : isRoleWorkspace.value
                ? t("app.role.sectionCopy")
                : isSettingWorkspace.value
                  ? t("app.setting.sectionCopy")
                  : isUserWorkspace.value
                    ? t("app.user.sectionCopy")
                    : isWorkflowDefinitionsWorkspace.value
                      ? t("app.workflow.sectionCopy")
                      : currentModuleReady.value
                        ? t("app.section.placeholderCopyReady", {
                            name:
                              selectedNavigationItem.value?.name ??
                              t("app.section.workspaceTitle"),
                          })
                        : t("app.section.placeholderCopyOffline", {
                            name:
                              selectedNavigationItem.value?.name ??
                              t("app.section.workspaceTitle"),
                          }),
)

const currentWorkspaceTitle = computed(() =>
  isCustomerWorkspace.value
    ? t("app.shell.workspaceTitle")
    : isDictionaryWorkspace.value
      ? t("app.dictionary.shellTitle")
      : isDepartmentWorkspace.value
        ? t("app.department.shellTitle")
        : isMenuWorkspace.value
          ? t("app.menu.shellTitle")
          : isNotificationWorkspace.value
            ? t("app.notification.shellTitle")
            : isOperationLogWorkspace.value
              ? t("app.operationLog.shellTitle")
              : isRoleWorkspace.value
                ? t("app.role.shellTitle")
                : isSettingWorkspace.value
                  ? t("app.setting.shellTitle")
                  : isUserWorkspace.value
                    ? t("app.user.shellTitle")
                    : (selectedNavigationItem.value?.name ??
                      t("app.shell.workspaceTitle")),
)

const placeholderWorkspaceCopy = computed(() =>
  currentModuleReady.value
    ? t("app.placeholder.descriptionReady", {
        name: selectedNavigationItem.value?.name ?? "",
      })
    : t("app.placeholder.descriptionOffline", {
        name: selectedNavigationItem.value?.name ?? "",
      }),
)

const currentWorkspaceDescription = computed(() =>
  isCustomerWorkspace.value
    ? t("app.shell.workspaceDescription")
    : isDictionaryWorkspace.value
      ? t("app.dictionary.shellDescription")
      : isDepartmentWorkspace.value
        ? t("app.department.shellDescription")
        : isMenuWorkspace.value
          ? t("app.menu.shellDescription")
          : isNotificationWorkspace.value
            ? t("app.notification.shellDescription")
            : isOperationLogWorkspace.value
              ? t("app.operationLog.shellDescription")
              : isRoleWorkspace.value
                ? t("app.role.shellDescription")
                : isSettingWorkspace.value
                  ? t("app.setting.shellDescription")
                  : isUserWorkspace.value
                    ? t("app.user.shellDescription")
                    : isWorkflowDefinitionsWorkspace.value
                      ? t("app.workflow.shellDescription")
                      : currentModuleReady.value
                        ? t("app.shell.placeholderDescriptionReady", {
                            name: selectedNavigationItem.value?.name ?? "",
                          })
                        : t("app.shell.placeholderDescriptionOffline", {
                            name: selectedNavigationItem.value?.name ?? "",
                          }),
)

const enterpriseSelectedMenuKey = computed(
  () => selectedNavigationItem.value?.id ?? null,
)

const customerPermissions = usePermissions(
  permissionCodes,
  {
    list: "customer:customer:list",
    create: "customer:customer:create",
    update: "customer:customer:update",
    delete: "customer:customer:delete",
  },
  authModuleReady,
)

const dictionaryPermissions = usePermissions(
  permissionCodes,
  {
    list: "system:dictionary:list",
    create: "system:dictionary:create",
    update: "system:dictionary:update",
  },
  authModuleReady,
)

const departmentPermissions = usePermissions(
  permissionCodes,
  {
    list: "system:department:list",
    create: "system:department:create",
    update: "system:department:update",
  },
  authModuleReady,
)

const menuPermissions = usePermissions(
  permissionCodes,
  {
    list: "system:menu:list",
    create: "system:menu:update",
    update: "system:menu:update",
  },
  authModuleReady,
)

const notificationPermissions = usePermissions(
  permissionCodes,
  {
    list: "system:notification:list",
    create: "system:notification:create",
    update: "system:notification:update",
  },
  authModuleReady,
)

const operationLogPermissions = usePermissions(
  permissionCodes,
  {
    list: "system:operation-log:list",
  },
  authModuleReady,
)

const rolePermissions = usePermissions(
  permissionCodes,
  {
    list: "system:role:list",
    create: "system:role:create",
    update: "system:role:update",
  },
  authModuleReady,
)

const settingPermissions = usePermissions(
  permissionCodes,
  {
    list: "system:setting:list",
    create: "system:setting:create",
    update: "system:setting:update",
  },
  authModuleReady,
)

const userPermissions = usePermissions(
  permissionCodes,
  {
    list: "system:user:list",
    create: "system:user:create",
    update: "system:user:update",
    delete: "system:user:reset-password",
  },
  authModuleReady,
)

const canEnterCustomerWorkspace = computed(
  () =>
    customerModuleReady.value &&
    (!authModuleReady.value || isAuthenticated.value),
)

const canViewCustomers = computed(
  () => canEnterCustomerWorkspace.value && customerPermissions.list.value,
)

const canEnterDepartmentWorkspace = computed(
  () =>
    departmentModuleReady.value &&
    (!authModuleReady.value || isAuthenticated.value),
)

const canViewDepartments = computed(
  () => canEnterDepartmentWorkspace.value && departmentPermissions.list.value,
)

const canCreateDepartments = computed(
  () => canEnterDepartmentWorkspace.value && departmentPermissions.create.value,
)

const canUpdateDepartments = computed(
  () => canEnterDepartmentWorkspace.value && departmentPermissions.update.value,
)

const canEnterMenuWorkspace = computed(
  () =>
    menuModuleReady.value && (!authModuleReady.value || isAuthenticated.value),
)

const canViewMenus = computed(
  () => canEnterMenuWorkspace.value && menuPermissions.list.value,
)

const canCreateMenus = computed(
  () => canEnterMenuWorkspace.value && menuPermissions.create.value,
)

const canUpdateMenus = computed(
  () => canEnterMenuWorkspace.value && menuPermissions.update.value,
)

const canEnterNotificationWorkspace = computed(
  () =>
    notificationModuleReady.value &&
    (!authModuleReady.value || isAuthenticated.value),
)

const canViewNotifications = computed(
  () =>
    canEnterNotificationWorkspace.value && notificationPermissions.list.value,
)

const canCreateNotifications = computed(
  () =>
    canEnterNotificationWorkspace.value && notificationPermissions.create.value,
)

const canUpdateNotifications = computed(
  () =>
    canEnterNotificationWorkspace.value && notificationPermissions.update.value,
)

const canEnterOperationLogWorkspace = computed(
  () =>
    operationLogModuleReady.value &&
    (!authModuleReady.value || isAuthenticated.value),
)

const canViewOperationLogs = computed(
  () =>
    canEnterOperationLogWorkspace.value && operationLogPermissions.list.value,
)

const canEnterRoleWorkspace = computed(
  () =>
    roleModuleReady.value && (!authModuleReady.value || isAuthenticated.value),
)

const canViewRoles = computed(
  () => canEnterRoleWorkspace.value && rolePermissions.list.value,
)

const canCreateRoles = computed(
  () => canEnterRoleWorkspace.value && rolePermissions.create.value,
)

const canUpdateRoles = computed(
  () => canEnterRoleWorkspace.value && rolePermissions.update.value,
)

const canEnterSettingWorkspace = computed(
  () =>
    settingModuleReady.value &&
    (!authModuleReady.value || isAuthenticated.value),
)

const canViewSettings = computed(
  () => canEnterSettingWorkspace.value && settingPermissions.list.value,
)

const canCreateSettings = computed(
  () => canEnterSettingWorkspace.value && settingPermissions.create.value,
)

const canUpdateSettings = computed(
  () => canEnterSettingWorkspace.value && settingPermissions.update.value,
)

const canEnterUserWorkspace = computed(
  () =>
    userModuleReady.value && (!authModuleReady.value || isAuthenticated.value),
)

const canViewUsers = computed(
  () => canEnterUserWorkspace.value && userPermissions.list.value,
)

const canCreateUsers = computed(
  () => canEnterUserWorkspace.value && userPermissions.create.value,
)

const canUpdateUsers = computed(
  () => canEnterUserWorkspace.value && userPermissions.update.value,
)

const canResetUserPasswords = computed(
  () => canEnterUserWorkspace.value && userPermissions.delete.value,
)

const canCreateCustomers = computed(
  () => canEnterCustomerWorkspace.value && customerPermissions.create.value,
)

const canUpdateCustomers = computed(
  () => canEnterCustomerWorkspace.value && customerPermissions.update.value,
)

const canDeleteCustomers = computed(
  () => canEnterCustomerWorkspace.value && customerPermissions.delete.value,
)

const canEnterDictionaryWorkspace = computed(
  () =>
    dictionaryModuleReady.value &&
    (!authModuleReady.value || isAuthenticated.value),
)

const canViewDictionaries = computed(
  () => canEnterDictionaryWorkspace.value && dictionaryPermissions.list.value,
)

const canCreateDictionaryTypes = computed(
  () => canEnterDictionaryWorkspace.value && dictionaryPermissions.create.value,
)

const canUpdateDictionaryTypes = computed(
  () => canEnterDictionaryWorkspace.value && dictionaryPermissions.update.value,
)

const canEnterWorkflowWorkspace = computed(
  () =>
    workflowModuleReady.value &&
    (!authModuleReady.value || isAuthenticated.value),
)

const canViewWorkflowDefinitions = computed(
  () =>
    canEnterWorkflowWorkspace.value &&
    (!authModuleReady.value ||
      permissionCodes.value.includes("workflow:definition:list")),
)

const dictionaryOptionCatalog = computed(() =>
  buildCrudDictionaryOptionCatalog(
    dictionaryTypes.value,
    dictionaryItems.value,
  ),
)

const resolvedCustomerPageDefinition = computed(() =>
  applyCrudDictionaryOptions(
    customerPageDefinition,
    dictionaryOptionCatalog.value,
  ),
)

const enterpriseCustomerPage = useElyCrudPage(
  resolvedCustomerPageDefinition,
  permissionCodes,
)

const enterpriseDictionaryPage = useElyCrudPage(
  dictionaryPageDefinition,
  permissionCodes,
)
const enterpriseDepartmentPage = useElyCrudPage(
  departmentPageDefinition,
  permissionCodes,
)
const enterpriseMenuPage = useElyCrudPage(menuPageDefinition, permissionCodes)
const enterpriseNotificationPage = useElyCrudPage(
  notificationPageDefinition,
  permissionCodes,
)
const enterpriseOperationLogPage = useElyCrudPage(
  operationLogPageDefinition,
  permissionCodes,
)
const enterpriseUserPage = useElyCrudPage(userPageDefinition, permissionCodes)
const enterpriseRolePage = useElyCrudPage(rolePageDefinition, permissionCodes)
const enterpriseSettingPage = useElyCrudPage(
  settingPageDefinition,
  permissionCodes,
)

const selectedCustomer = computed(
  () =>
    customerItems.value.find(
      (customer) => customer.id === selectedCustomerId.value,
    ) ?? null,
)

const selectedWorkflowListItem = computed(
  () =>
    workflowDefinitions.value.find(
      (definition) => definition.id === selectedWorkflowDefinitionId.value,
    ) ?? null,
)

const filteredDictionaryTypes = computed(() => {
  const code =
    typeof dictionaryQueryValues.value.code === "string"
      ? dictionaryQueryValues.value.code.trim().toLowerCase()
      : ""
  const name =
    typeof dictionaryQueryValues.value.name === "string"
      ? dictionaryQueryValues.value.name.trim().toLowerCase()
      : ""
  const description =
    typeof dictionaryQueryValues.value.description === "string"
      ? dictionaryQueryValues.value.description.trim().toLowerCase()
      : ""
  const status =
    dictionaryQueryValues.value.status === "active" ||
    dictionaryQueryValues.value.status === "disabled"
      ? dictionaryQueryValues.value.status
      : ""

  return dictionaryTypes.value.filter((type) => {
    if (code.length > 0 && !type.code.toLowerCase().includes(code)) {
      return false
    }

    if (name.length > 0 && !type.name.toLowerCase().includes(name)) {
      return false
    }

    if (
      description.length > 0 &&
      !(type.description ?? "").toLowerCase().includes(description)
    ) {
      return false
    }

    if (status && type.status !== status) {
      return false
    }

    return true
  })
})

const filteredDepartmentItems = computed(() => {
  const code =
    typeof departmentQueryValues.value.code === "string"
      ? departmentQueryValues.value.code.trim().toLowerCase()
      : ""
  const name =
    typeof departmentQueryValues.value.name === "string"
      ? departmentQueryValues.value.name.trim().toLowerCase()
      : ""
  const status =
    departmentQueryValues.value.status === "active" ||
    departmentQueryValues.value.status === "disabled"
      ? departmentQueryValues.value.status
      : ""

  return departmentItems.value.filter((department) => {
    if (code.length > 0 && !department.code.toLowerCase().includes(code)) {
      return false
    }

    if (name.length > 0 && !department.name.toLowerCase().includes(name)) {
      return false
    }

    if (status && department.status !== status) {
      return false
    }

    return true
  })
})

const filteredMenuItems = computed(() => {
  const type =
    menuQueryValues.value.type === "directory" ||
    menuQueryValues.value.type === "menu" ||
    menuQueryValues.value.type === "button"
      ? menuQueryValues.value.type
      : ""
  const code =
    typeof menuQueryValues.value.code === "string"
      ? menuQueryValues.value.code.trim().toLowerCase()
      : ""
  const name =
    typeof menuQueryValues.value.name === "string"
      ? menuQueryValues.value.name.trim().toLowerCase()
      : ""
  const path =
    typeof menuQueryValues.value.path === "string"
      ? menuQueryValues.value.path.trim().toLowerCase()
      : ""
  const component =
    typeof menuQueryValues.value.component === "string"
      ? menuQueryValues.value.component.trim().toLowerCase()
      : ""
  const icon =
    typeof menuQueryValues.value.icon === "string"
      ? menuQueryValues.value.icon.trim().toLowerCase()
      : ""
  const permissionCode =
    typeof menuQueryValues.value.permissionCode === "string"
      ? menuQueryValues.value.permissionCode.trim().toLowerCase()
      : ""
  const status =
    menuQueryValues.value.status === "active" ||
    menuQueryValues.value.status === "disabled"
      ? menuQueryValues.value.status
      : ""

  return menuItems.value.filter((menu) => {
    if (type && menu.type !== type) {
      return false
    }

    if (code.length > 0 && !menu.code.toLowerCase().includes(code)) {
      return false
    }

    if (name.length > 0 && !menu.name.toLowerCase().includes(name)) {
      return false
    }

    if (path.length > 0 && !(menu.path ?? "").toLowerCase().includes(path)) {
      return false
    }

    if (
      component.length > 0 &&
      !(menu.component ?? "").toLowerCase().includes(component)
    ) {
      return false
    }

    if (icon.length > 0 && !(menu.icon ?? "").toLowerCase().includes(icon)) {
      return false
    }

    if (
      permissionCode.length > 0 &&
      !(menu.permissionCode ?? "").toLowerCase().includes(permissionCode)
    ) {
      return false
    }

    if (status && menu.status !== status) {
      return false
    }

    return true
  })
})

const notificationListQuery = computed(() => {
  const query: {
    recipientUserId?: string
    status?: NotificationRecord["status"]
  } = {}

  if (
    typeof notificationQueryValues.value.recipientUserId === "string" &&
    notificationQueryValues.value.recipientUserId.trim()
  ) {
    query.recipientUserId = notificationQueryValues.value.recipientUserId.trim()
  }

  if (
    notificationQueryValues.value.status === "unread" ||
    notificationQueryValues.value.status === "read"
  ) {
    query.status = notificationQueryValues.value.status
  }

  return query
})

const filteredNotificationItems = computed(() =>
  filterNotifications(notificationItems.value, {
    recipientUserId:
      typeof notificationQueryValues.value.recipientUserId === "string"
        ? notificationQueryValues.value.recipientUserId
        : undefined,
    title:
      typeof notificationQueryValues.value.title === "string"
        ? notificationQueryValues.value.title
        : undefined,
    content:
      typeof notificationQueryValues.value.content === "string"
        ? notificationQueryValues.value.content
        : undefined,
    level:
      notificationQueryValues.value.level === "info" ||
      notificationQueryValues.value.level === "success" ||
      notificationQueryValues.value.level === "warning" ||
      notificationQueryValues.value.level === "error"
        ? notificationQueryValues.value.level
        : "",
    status:
      notificationQueryValues.value.status === "unread" ||
      notificationQueryValues.value.status === "read"
        ? notificationQueryValues.value.status
        : "",
  }),
)

const operationLogListQuery = computed<OperationLogListQuery>(() => {
  const query: OperationLogListQuery = {}

  if (
    typeof operationLogQueryValues.value.category === "string" &&
    operationLogQueryValues.value.category.trim()
  ) {
    query.category = operationLogQueryValues.value.category.trim()
  }

  if (
    typeof operationLogQueryValues.value.action === "string" &&
    operationLogQueryValues.value.action.trim()
  ) {
    query.action = operationLogQueryValues.value.action.trim()
  }

  if (
    typeof operationLogQueryValues.value.actorUserId === "string" &&
    operationLogQueryValues.value.actorUserId.trim()
  ) {
    query.actorUserId = operationLogQueryValues.value.actorUserId.trim()
  }

  if (
    operationLogQueryValues.value.result === "success" ||
    operationLogQueryValues.value.result === "failure"
  ) {
    query.result = operationLogQueryValues.value.result
  }

  return query
})

const filteredOperationLogItems = computed(() => {
  const category =
    typeof operationLogQueryValues.value.category === "string"
      ? operationLogQueryValues.value.category.trim().toLowerCase()
      : ""
  const action =
    typeof operationLogQueryValues.value.action === "string"
      ? operationLogQueryValues.value.action.trim().toLowerCase()
      : ""
  const actorUserId =
    typeof operationLogQueryValues.value.actorUserId === "string"
      ? operationLogQueryValues.value.actorUserId.trim().toLowerCase()
      : ""
  const result =
    operationLogQueryValues.value.result === "success" ||
    operationLogQueryValues.value.result === "failure"
      ? operationLogQueryValues.value.result
      : ""

  return operationLogItems.value.filter((item) => {
    if (
      category.length > 0 &&
      !item.category.toLowerCase().includes(category)
    ) {
      return false
    }
    if (action.length > 0 && !item.action.toLowerCase().includes(action)) {
      return false
    }
    if (
      actorUserId.length > 0 &&
      !(item.actorUserId ?? "").toLowerCase().includes(actorUserId)
    ) {
      return false
    }
    if (result && item.result !== result) {
      return false
    }

    return true
  })
})

const filteredUserItems = computed(() => {
  const query =
    typeof userQueryValues.value.username === "string"
      ? userQueryValues.value.username.trim().toLowerCase()
      : ""
  const displayName =
    typeof userQueryValues.value.displayName === "string"
      ? userQueryValues.value.displayName.trim().toLowerCase()
      : ""
  const email =
    typeof userQueryValues.value.email === "string"
      ? userQueryValues.value.email.trim().toLowerCase()
      : ""
  const phone =
    typeof userQueryValues.value.phone === "string"
      ? userQueryValues.value.phone.trim().toLowerCase()
      : ""
  const status =
    userQueryValues.value.status === "active" ||
    userQueryValues.value.status === "disabled"
      ? userQueryValues.value.status
      : ""

  return userItems.value.filter((user) => {
    if (query.length > 0 && !user.username.toLowerCase().includes(query)) {
      return false
    }

    if (
      displayName.length > 0 &&
      !user.displayName.toLowerCase().includes(displayName)
    ) {
      return false
    }

    if (email.length > 0 && !(user.email ?? "").toLowerCase().includes(email)) {
      return false
    }

    if (phone.length > 0 && !(user.phone ?? "").toLowerCase().includes(phone)) {
      return false
    }

    if (status && user.status !== status) {
      return false
    }

    return true
  })
})

const filteredRoleItems = computed(() => {
  const code =
    typeof roleQueryValues.value.code === "string"
      ? roleQueryValues.value.code.trim().toLowerCase()
      : ""
  const name =
    typeof roleQueryValues.value.name === "string"
      ? roleQueryValues.value.name.trim().toLowerCase()
      : ""
  const description =
    typeof roleQueryValues.value.description === "string"
      ? roleQueryValues.value.description.trim().toLowerCase()
      : ""
  const status =
    roleQueryValues.value.status === "active" ||
    roleQueryValues.value.status === "disabled"
      ? roleQueryValues.value.status
      : ""

  return roleItems.value.filter((role) => {
    if (code.length > 0 && !role.code.toLowerCase().includes(code)) {
      return false
    }

    if (name.length > 0 && !role.name.toLowerCase().includes(name)) {
      return false
    }

    if (
      description.length > 0 &&
      !(role.description ?? "").toLowerCase().includes(description)
    ) {
      return false
    }

    if (status && role.status !== status) {
      return false
    }

    return true
  })
})

const filteredSettingItems = computed(() => {
  const key =
    typeof settingQueryValues.value.key === "string"
      ? settingQueryValues.value.key.trim().toLowerCase()
      : ""
  const value =
    typeof settingQueryValues.value.value === "string"
      ? settingQueryValues.value.value.trim().toLowerCase()
      : ""
  const description =
    typeof settingQueryValues.value.description === "string"
      ? settingQueryValues.value.description.trim().toLowerCase()
      : ""
  const status =
    settingQueryValues.value.status === "active" ||
    settingQueryValues.value.status === "disabled"
      ? settingQueryValues.value.status
      : ""

  return settingItems.value.filter((setting) => {
    if (key.length > 0 && !setting.key.toLowerCase().includes(key)) {
      return false
    }

    if (value.length > 0 && !setting.value.toLowerCase().includes(value)) {
      return false
    }

    if (
      description.length > 0 &&
      !(setting.description ?? "").toLowerCase().includes(description)
    ) {
      return false
    }

    if (status && setting.status !== status) {
      return false
    }

    return true
  })
})

const selectedDepartmentListItem = computed(
  () =>
    departmentItems.value.find(
      (department) => department.id === selectedDepartmentId.value,
    ) ?? null,
)

const selectedDictionaryTypeListItem = computed(
  () =>
    dictionaryTypes.value.find(
      (type) => type.id === selectedDictionaryTypeId.value,
    ) ?? null,
)

const selectedDictionaryType = computed<
  DictionaryTypeRecord | DictionaryTypeDetailRecord | null
>(() => {
  if (
    dictionaryTypeDetail.value &&
    dictionaryTypeDetail.value.id === selectedDictionaryTypeId.value
  ) {
    return dictionaryTypeDetail.value
  }

  return selectedDictionaryTypeListItem.value
})

const selectedDictionaryTypeDetail = computed(() =>
  dictionaryTypeDetail.value &&
  dictionaryTypeDetail.value.id === selectedDictionaryTypeId.value
    ? dictionaryTypeDetail.value
    : null,
)

const selectedDictionaryTypeItems = computed(() => {
  if (selectedDictionaryTypeDetail.value) {
    return selectedDictionaryTypeDetail.value.items
  }

  if (!selectedDictionaryTypeId.value) {
    return []
  }

  return dictionaryItems.value.filter(
    (item) => item.typeId === selectedDictionaryTypeId.value,
  )
})

const selectedDepartment = computed<
  DepartmentRecord | DepartmentDetailRecord | null
>(() => {
  if (
    departmentDetail.value &&
    departmentDetail.value.id === selectedDepartmentId.value
  ) {
    return departmentDetail.value
  }

  return selectedDepartmentListItem.value
})

const selectedDepartmentDetail = computed(() =>
  departmentDetail.value &&
  departmentDetail.value.id === selectedDepartmentId.value
    ? departmentDetail.value
    : null,
)

const selectedMenuListItem = computed(
  () =>
    menuItems.value.find((menu) => menu.id === selectedMenuId.value) ?? null,
)

const selectedMenu = computed<MenuRecord | MenuDetailRecord | null>(() => {
  if (menuDetail.value && menuDetail.value.id === selectedMenuId.value) {
    return menuDetail.value
  }

  return selectedMenuListItem.value
})

const selectedMenuDetail = computed(() =>
  menuDetail.value && menuDetail.value.id === selectedMenuId.value
    ? menuDetail.value
    : null,
)

const selectedNotificationListItem = computed(
  () =>
    notificationItems.value.find(
      (notification) => notification.id === selectedNotificationId.value,
    ) ?? null,
)

const selectedNotification = computed(
  () =>
    (notificationDetail.value &&
    notificationDetail.value.id === selectedNotificationId.value
      ? notificationDetail.value
      : selectedNotificationListItem.value) ?? null,
)

const selectedOperationLogListItem = computed(
  () =>
    operationLogItems.value.find(
      (item) => item.id === selectedOperationLogId.value,
    ) ?? null,
)

const selectedOperationLog = computed(
  () =>
    (operationLogDetail.value &&
    operationLogDetail.value.id === selectedOperationLogId.value
      ? operationLogDetail.value
      : selectedOperationLogListItem.value) ?? null,
)

const selectedRoleListItem = computed(
  () =>
    roleItems.value.find((role) => role.id === selectedRoleId.value) ?? null,
)

const selectedRole = computed<RoleRecord | RoleDetailRecord | null>(() => {
  if (roleDetail.value && roleDetail.value.id === selectedRoleId.value) {
    return roleDetail.value
  }

  return selectedRoleListItem.value
})

const selectedRoleDetail = computed(() =>
  roleDetail.value && roleDetail.value.id === selectedRoleId.value
    ? roleDetail.value
    : null,
)

const selectedSettingListItem = computed(
  () =>
    settingItems.value.find(
      (setting) => setting.id === selectedSettingId.value,
    ) ?? null,
)

const selectedSetting = computed(
  () =>
    (settingDetail.value && settingDetail.value.id === selectedSettingId.value
      ? settingDetail.value
      : selectedSettingListItem.value) ?? null,
)

const selectedUser = computed(
  () =>
    userItems.value.find((user) => user.id === selectedUserId.value) ?? null,
)

const selectedWorkflowDefinition = computed(
  () => workflowDefinitionDetail.value ?? selectedWorkflowListItem.value,
)

const localizeSelectOptions = (
  options?: Array<{ label: string; value: string }>,
) =>
  options?.map((option) => ({
    ...option,
    label:
      option.value === "active" || option.value === "inactive"
        ? localizeCustomerStatus(option.value)
        : option.value === "disabled"
          ? localizeUserStatus(option.value)
          : option.label,
  }))

const enterpriseTableColumns = computed(() =>
  enterpriseCustomerPage.tableColumns.value.map((column) => ({
    ...column,
    label: localizeFieldLabel(column.key),
    width:
      column.key === "id"
        ? "240"
        : column.key === "status"
          ? "120"
          : column.key.endsWith("At")
            ? "200"
            : undefined,
  })),
)

const enterpriseQueryFields = computed(() =>
  enterpriseCustomerPage.queryFields.value.map((field) => ({
    ...field,
    label: localizeFieldLabel(field.key),
    options: localizeSelectOptions(field.options),
    placeholder:
      field.key === "name"
        ? t("app.customer.query.namePlaceholder")
        : field.key === "status"
          ? t("copy.query.statusPlaceholder")
          : field.placeholder,
  })),
)

const enterpriseTableActions = computed(() =>
  enterpriseCustomerPage.tableActions.value
    .filter((action) => action.key !== "create")
    .map((action) => ({
      ...action,
      label: localizeActionLabel(action.key, action.label),
    })),
)

const enterpriseTableItems = computed(() =>
  customerItems.value.map((customer) => ({
    ...customer,
    createdAt: new Date(customer.createdAt).toLocaleString(locale.value),
    updatedAt: new Date(customer.updatedAt).toLocaleString(locale.value),
  })),
)

const departmentParentLookup = computed(
  () =>
    new Map(
      departmentItems.value.map((department) => [department.id, department]),
    ),
)

const menuParentLookup = computed(
  () => new Map(menuItems.value.map((menu) => [menu.id, menu])),
)

const departmentBlockedParentIds = computed(() => {
  if (!selectedDepartmentId.value) {
    return new Set<string>()
  }

  const blocked = new Set<string>([selectedDepartmentId.value])
  const queue = [selectedDepartmentId.value]

  while (queue.length > 0) {
    const currentId = queue.shift()

    if (!currentId) {
      continue
    }

    for (const department of departmentItems.value) {
      if (department.parentId === currentId && !blocked.has(department.id)) {
        blocked.add(department.id)
        queue.push(department.id)
      }
    }
  }

  return blocked
})

const menuBlockedParentIds = computed(() => {
  if (!selectedMenuId.value) {
    return new Set<string>()
  }

  const blocked = new Set<string>([selectedMenuId.value])
  const queue = [selectedMenuId.value]

  while (queue.length > 0) {
    const currentId = queue.shift()

    if (!currentId) {
      continue
    }

    for (const menu of menuItems.value) {
      if (menu.parentId === currentId && !blocked.has(menu.id)) {
        blocked.add(menu.id)
        queue.push(menu.id)
      }
    }
  }

  return blocked
})

const departmentParentOptions = computed(() => [
  {
    label: t("app.department.parentRoot"),
    value: "",
  },
  ...departmentItems.value
    .filter(
      (department) => !departmentBlockedParentIds.value.has(department.id),
    )
    .map((department) => ({
      label: department.name,
      value: department.id,
    })),
])

const menuParentOptions = computed(() => [
  {
    label: t("app.menu.parentRoot"),
    value: "",
  },
  ...menuItems.value
    .filter((menu) => !menuBlockedParentIds.value.has(menu.id))
    .map((menu) => ({
      label: `${menu.name} (${menu.code})`,
      value: menu.id,
    })),
])

const enterpriseDepartmentTableColumns = computed(() =>
  enterpriseDepartmentPage.tableColumns.value.map((column) => ({
    ...column,
    label: localizeDepartmentFieldLabel(column.key),
    width:
      column.key === "id"
        ? "240"
        : column.key === "parentId"
          ? "220"
          : column.key === "status"
            ? "120"
            : column.key === "sort"
              ? "120"
              : column.key.endsWith("At")
                ? "200"
                : undefined,
  })),
)

const enterpriseDepartmentQueryFields = computed(() =>
  enterpriseDepartmentPage.queryFields.value.map((field) => ({
    ...field,
    label: localizeDepartmentFieldLabel(field.key),
    options:
      field.key === "status" && field.options
        ? field.options.map((option) => ({
            ...option,
            label: localizeDepartmentStatus(option.value),
          }))
        : field.options,
    placeholder:
      field.key === "code"
        ? t("app.department.query.codePlaceholder")
        : field.key === "name"
          ? t("app.department.query.namePlaceholder")
          : field.key === "status"
            ? t("copy.query.statusPlaceholder")
            : field.placeholder,
  })),
)

const enterpriseDepartmentTableItems = computed(() =>
  filteredDepartmentItems.value.map((department) => ({
    ...department,
    parentId: department.parentId
      ? (departmentParentLookup.value.get(department.parentId)?.name ??
        department.parentId)
      : t("app.department.parentRoot"),
    status: localizeDepartmentStatus(department.status),
    createdAt: new Date(department.createdAt).toLocaleString(locale.value),
    updatedAt: new Date(department.updatedAt).toLocaleString(locale.value),
  })),
)

const enterpriseMenuTableColumns = computed(() =>
  enterpriseMenuPage.tableColumns.value.map((column) => ({
    ...column,
    label: localizeMenuFieldLabel(column.key),
    width:
      column.key === "id"
        ? "240"
        : column.key === "parentId"
          ? "220"
          : column.key === "type"
            ? "140"
            : column.key === "sort"
              ? "120"
              : column.key === "isVisible"
                ? "140"
                : column.key === "status"
                  ? "120"
                  : column.key.endsWith("At")
                    ? "200"
                    : undefined,
  })),
)

const enterpriseMenuQueryFields = computed(() =>
  enterpriseMenuPage.queryFields.value.map((field) => ({
    ...field,
    label: localizeMenuFieldLabel(field.key),
    options:
      field.key === "type" && field.options
        ? field.options.map((option) => ({
            ...option,
            label: localizeMenuType(option.value),
          }))
        : field.key === "status" && field.options
          ? field.options.map((option) => ({
              ...option,
              label: localizeMenuStatus(option.value),
            }))
          : field.options,
    placeholder:
      field.key === "code"
        ? t("app.menu.query.codePlaceholder")
        : field.key === "name"
          ? t("app.menu.query.namePlaceholder")
          : field.key === "path"
            ? t("app.menu.query.pathPlaceholder")
            : field.key === "component"
              ? t("app.menu.query.componentPlaceholder")
              : field.key === "icon"
                ? t("app.menu.query.iconPlaceholder")
                : field.key === "permissionCode"
                  ? t("app.menu.query.permissionCodePlaceholder")
                  : field.key === "status"
                    ? t("copy.query.statusPlaceholder")
                    : field.placeholder,
  })),
)

const enterpriseMenuTableItems = computed(() =>
  filteredMenuItems.value.map((menu) => ({
    ...menu,
    parentId: menu.parentId
      ? (menuParentLookup.value.get(menu.parentId)?.name ?? menu.parentId)
      : t("app.menu.parentRoot"),
    type: localizeMenuType(menu.type),
    isVisible: localizeMenuBoolean(menu.isVisible),
    status: localizeMenuStatus(menu.status),
    createdAt: new Date(menu.createdAt).toLocaleString(locale.value),
    updatedAt: new Date(menu.updatedAt).toLocaleString(locale.value),
  })),
)

const enterpriseNotificationTableColumns = computed(() =>
  enterpriseNotificationPage.tableColumns.value.map((column) => ({
    ...column,
    label: localizeNotificationFieldLabel(column.key),
    width:
      column.key === "id"
        ? "240"
        : column.key === "recipientUserId" || column.key === "createdByUserId"
          ? "180"
          : column.key === "level" || column.key === "status"
            ? "120"
            : column.key.endsWith("At")
              ? "200"
              : undefined,
  })),
)

const enterpriseNotificationQueryFields = computed<ElyQueryField[]>(() => [
  {
    key: "recipientUserId",
    label: t("app.notification.field.recipientUserId"),
    kind: "text",
    placeholder: t("app.notification.query.recipientUserIdPlaceholder"),
  },
  ...enterpriseNotificationPage.queryFields.value.map((field) => ({
    ...field,
    label: localizeNotificationFieldLabel(field.key),
    options:
      field.key === "level" && field.options
        ? field.options.map((option) => ({
            ...option,
            label: localizeNotificationLevel(option.value),
          }))
        : field.key === "status" && field.options
          ? field.options.map((option) => ({
              ...option,
              label: localizeNotificationStatus(option.value),
            }))
          : field.options,
    placeholder:
      field.key === "title"
        ? t("app.notification.query.titlePlaceholder")
        : field.key === "content"
          ? t("app.notification.query.contentPlaceholder")
          : field.key === "level"
            ? t("app.notification.query.levelPlaceholder")
            : field.key === "status"
              ? t("app.notification.query.statusPlaceholder")
              : field.placeholder,
  })),
])

const enterpriseNotificationTableItems = computed(() =>
  filteredNotificationItems.value.map((notification) => ({
    ...notification,
    level: localizeNotificationLevel(notification.level),
    status: localizeNotificationStatus(notification.status),
    readAt: notification.readAt
      ? new Date(notification.readAt).toLocaleString(locale.value)
      : t("app.notification.readAtEmpty"),
    createdAt: new Date(notification.createdAt).toLocaleString(locale.value),
  })),
)

const enterpriseOperationLogTableColumns = computed(() =>
  enterpriseOperationLogPage.tableColumns.value.map((column) => ({
    ...column,
    label: localizeOperationLogFieldLabel(column.key),
    width:
      column.key === "id"
        ? "240"
        : column.key === "result"
          ? "120"
          : column.key === "createdAt"
            ? "200"
            : undefined,
  })),
)

const enterpriseOperationLogQueryFields = computed(() => {
  const supportedQueryKeys = new Set([
    "category",
    "action",
    "actorUserId",
    "result",
  ])

  return enterpriseOperationLogPage.queryFields.value
    .filter((field) => supportedQueryKeys.has(field.key))
    .map((field) => ({
      ...field,
      label: localizeOperationLogFieldLabel(field.key),
      options:
        field.key === "result" && field.options
          ? field.options.map((option) => ({
              ...option,
              label: localizeOperationLogResult(option.value),
            }))
          : field.options,
      placeholder:
        field.key === "category"
          ? t("app.operationLog.query.categoryPlaceholder")
          : field.key === "action"
            ? t("app.operationLog.query.actionPlaceholder")
            : field.key === "actorUserId"
              ? t("app.operationLog.query.actorUserIdPlaceholder")
              : field.key === "result"
                ? t("app.operationLog.query.resultPlaceholder")
                : field.placeholder,
    }))
})

const enterpriseOperationLogTableItems = computed(() =>
  filteredOperationLogItems.value.map((item) => ({
    ...item,
    result: localizeOperationLogResult(item.result),
    createdAt: new Date(item.createdAt).toLocaleString(locale.value),
  })),
)

const enterpriseUserTableColumns = computed(() =>
  enterpriseUserPage.tableColumns.value.map((column) => ({
    ...column,
    label: localizeUserFieldLabel(column.key),
    width:
      column.key === "id"
        ? "240"
        : column.key === "status"
          ? "120"
          : column.key === "isSuperAdmin"
            ? "140"
            : column.key.endsWith("At")
              ? "200"
              : undefined,
  })),
)

const enterpriseUserQueryFields = computed(() =>
  enterpriseUserPage.queryFields.value.map((field) => ({
    ...field,
    label: localizeUserFieldLabel(field.key),
    options: localizeSelectOptions(field.options),
    placeholder:
      field.key === "username"
        ? t("app.user.query.usernamePlaceholder")
        : field.key === "displayName"
          ? t("app.user.query.displayNamePlaceholder")
          : field.key === "email"
            ? t("app.user.query.emailPlaceholder")
            : field.key === "phone"
              ? t("app.user.query.phonePlaceholder")
              : field.key === "status"
                ? t("copy.query.statusPlaceholder")
                : field.placeholder,
  })),
)

const enterpriseUserTableItems = computed(() =>
  filteredUserItems.value.map((user) => ({
    ...user,
    status: localizeUserStatus(user.status),
    isSuperAdmin: user.isSuperAdmin
      ? t("app.user.boolean.true")
      : t("app.user.boolean.false"),
    lastLoginAt: user.lastLoginAt
      ? new Date(user.lastLoginAt).toLocaleString(locale.value)
      : t("app.user.lastLoginEmpty"),
    createdAt: new Date(user.createdAt).toLocaleString(locale.value),
    updatedAt: new Date(user.updatedAt).toLocaleString(locale.value),
  })),
)

const enterpriseRoleTableColumns = computed(() =>
  enterpriseRolePage.tableColumns.value.map((column) => ({
    ...column,
    label: localizeRoleFieldLabel(column.key),
    width:
      column.key === "id"
        ? "240"
        : column.key === "status"
          ? "120"
          : column.key === "isSystem"
            ? "140"
            : column.key === "dataScope"
              ? "160"
              : column.key.endsWith("At")
                ? "200"
                : undefined,
  })),
)

const enterpriseRoleQueryFields = computed(() =>
  enterpriseRolePage.queryFields.value.map((field) => ({
    ...field,
    label: localizeRoleFieldLabel(field.key),
    options:
      field.key === "status" && field.options
        ? field.options.map((option) => ({
            ...option,
            label: localizeRoleStatus(option.value),
          }))
        : field.options,
    placeholder:
      field.key === "code"
        ? t("app.role.query.codePlaceholder")
        : field.key === "name"
          ? t("app.role.query.namePlaceholder")
          : field.key === "description"
            ? t("app.role.query.descriptionPlaceholder")
            : field.key === "status"
              ? t("copy.query.statusPlaceholder")
              : field.placeholder,
  })),
)

const enterpriseRoleTableItems = computed(() =>
  filteredRoleItems.value.map((role) => ({
    ...role,
    status: localizeRoleStatus(role.status),
    isSystem: role.isSystem
      ? t("app.role.boolean.true")
      : t("app.role.boolean.false"),
    dataScope: localizeRoleDataScope(role.dataScope),
    createdAt: new Date(role.createdAt).toLocaleString(locale.value),
    updatedAt: new Date(role.updatedAt).toLocaleString(locale.value),
  })),
)

const enterpriseDictionaryTableColumns = computed(() =>
  enterpriseDictionaryPage.tableColumns.value.map((column) => ({
    ...column,
    label: localizeDictionaryFieldLabel(column.key),
    width:
      column.key === "id"
        ? "240"
        : column.key === "status"
          ? "120"
          : column.key.endsWith("At")
            ? "200"
            : undefined,
  })),
)

const enterpriseDictionaryQueryFields = computed(() =>
  enterpriseDictionaryPage.queryFields.value.map((field) => ({
    ...field,
    label: localizeDictionaryFieldLabel(field.key),
    options:
      field.key === "status" && field.options
        ? field.options.map((option) => ({
            ...option,
            label: localizeDictionaryStatus(option.value),
          }))
        : field.options,
    placeholder:
      field.key === "code"
        ? t("app.dictionary.query.codePlaceholder")
        : field.key === "name"
          ? t("app.dictionary.query.namePlaceholder")
          : field.key === "description"
            ? t("app.dictionary.query.descriptionPlaceholder")
            : field.key === "status"
              ? t("copy.query.statusPlaceholder")
              : field.placeholder,
  })),
)

const enterpriseDictionaryTableItems = computed(() =>
  filteredDictionaryTypes.value.map((type) => ({
    ...type,
    status: localizeDictionaryStatus(type.status),
    createdAt: new Date(type.createdAt).toLocaleString(locale.value),
    updatedAt: new Date(type.updatedAt).toLocaleString(locale.value),
  })),
)

const enterpriseSettingTableColumns = computed(() =>
  enterpriseSettingPage.tableColumns.value.map((column) => ({
    ...column,
    label: localizeSettingFieldLabel(column.key),
    width:
      column.key === "id"
        ? "240"
        : column.key === "status"
          ? "120"
          : column.key.endsWith("At")
            ? "200"
            : undefined,
  })),
)

const enterpriseSettingQueryFields = computed(() =>
  enterpriseSettingPage.queryFields.value.map((field) => ({
    ...field,
    label: localizeSettingFieldLabel(field.key),
    options:
      field.key === "status" && field.options
        ? field.options.map((option) => ({
            ...option,
            label: localizeSettingStatus(option.value),
          }))
        : field.options,
    placeholder:
      field.key === "key"
        ? t("app.setting.query.keyPlaceholder")
        : field.key === "value"
          ? t("app.setting.query.valuePlaceholder")
          : field.key === "description"
            ? t("app.setting.query.descriptionPlaceholder")
            : field.key === "status"
              ? t("copy.query.statusPlaceholder")
              : field.placeholder,
  })),
)

const enterpriseSettingTableItems = computed(() =>
  filteredSettingItems.value.map((setting) => ({
    ...setting,
    status: localizeSettingStatus(setting.status),
    createdAt: new Date(setting.createdAt).toLocaleString(locale.value),
    updatedAt: new Date(setting.updatedAt).toLocaleString(locale.value),
  })),
)

const userCountLabel = computed(() =>
  t("app.user.countLabel", {
    visible: filteredUserItems.value.length,
    total: userItems.value.length,
  }),
)

const dictionaryCountLabel = computed(() =>
  t("app.dictionary.countLabel", {
    visible: filteredDictionaryTypes.value.length,
    total: dictionaryTypes.value.length,
  }),
)

const departmentCountLabel = computed(() =>
  t("app.department.countLabel", {
    visible: filteredDepartmentItems.value.length,
    total: departmentItems.value.length,
  }),
)

const menuCountLabel = computed(() =>
  t("app.menu.countLabel", {
    visible: filteredMenuItems.value.length,
    total: menuItems.value.length,
  }),
)

const notificationCountLabel = computed(() =>
  t("app.notification.countLabel", {
    visible: filteredNotificationItems.value.length,
    total: notificationItems.value.length,
  }),
)

const operationLogCountLabel = computed(() =>
  t("app.operationLog.countLabel", {
    visible: filteredOperationLogItems.value.length,
    total: operationLogItems.value.length,
  }),
)

const roleDataScopeOptions = computed(() => [
  {
    label: t("app.role.dataScope.1"),
    value: "1",
  },
  {
    label: t("app.role.dataScope.2"),
    value: "2",
  },
  {
    label: t("app.role.dataScope.3"),
    value: "3",
  },
  {
    label: t("app.role.dataScope.4"),
    value: "4",
  },
  {
    label: t("app.role.dataScope.5"),
    value: "5",
  },
])

const roleCountLabel = computed(() =>
  t("app.role.countLabel", {
    visible: filteredRoleItems.value.length,
    total: roleItems.value.length,
  }),
)

const settingCountLabel = computed(() =>
  t("app.setting.countLabel", {
    visible: filteredSettingItems.value.length,
    total: settingItems.value.length,
  }),
)

const enterpriseNotificationFormFields = computed<ElyFormField[]>(() => {
  const allowedFieldKeys =
    notificationPanelMode.value === "create"
      ? new Set(["recipientUserId", "title", "content", "level"])
      : new Set([
          "recipientUserId",
          "title",
          "content",
          "level",
          "status",
          "createdByUserId",
          "readAt",
          "createdAt",
        ])

  return enterpriseNotificationPage.formFields.value
    .filter((field) => allowedFieldKeys.has(field.key))
    .map((field) => ({
      ...field,
      label: localizeNotificationFieldLabel(field.key),
      input: field.key === "content" ? ("textarea" as const) : field.input,
      disabled: notificationPanelMode.value === "detail" || field.disabled,
      options:
        field.key === "level" && field.options
          ? field.options.map((option) => ({
              ...option,
              label: localizeNotificationLevel(option.value),
            }))
          : field.key === "status" && field.options
            ? field.options.map((option) => ({
                ...option,
                label: localizeNotificationStatus(option.value),
              }))
            : field.options,
      placeholder:
        field.key === "recipientUserId"
          ? t("app.notification.query.recipientUserIdPlaceholder")
          : field.key === "title"
            ? t("app.notification.query.titlePlaceholder")
            : field.key === "content"
              ? t("app.notification.query.contentPlaceholder")
              : field.key === "level"
                ? t("app.notification.query.levelPlaceholder")
                : field.placeholder,
    }))
})

const enterpriseNotificationFormValues = computed<ElyFormValues>(() => {
  if (notificationPanelMode.value === "detail" && selectedNotification.value) {
    return {
      recipientUserId: selectedNotification.value.recipientUserId,
      title: selectedNotification.value.title,
      content: selectedNotification.value.content,
      level: selectedNotification.value.level,
      status: selectedNotification.value.status,
      createdByUserId: selectedNotification.value.createdByUserId ?? "",
      readAt: selectedNotification.value.readAt ?? "",
      createdAt: selectedNotification.value.createdAt,
    }
  }

  return {
    ...notificationCreateForm.value,
  }
})

const enterpriseDictionaryFormFields = computed<ElyFormField[]>(() => {
  const baseFields = enterpriseDictionaryPage.formFields.value.map((field) => ({
    ...field,
    label: localizeDictionaryFieldLabel(field.key),
    input: field.key === "description" ? ("textarea" as const) : field.input,
    options:
      field.key === "status"
        ? [
            {
              label: t("app.dictionary.status.active"),
              value: "active",
            },
            {
              label: t("app.dictionary.status.disabled"),
              value: "disabled",
            },
          ]
        : field.options,
    placeholder:
      field.key === "code"
        ? t("app.dictionary.query.codePlaceholder")
        : field.key === "name"
          ? t("app.dictionary.query.namePlaceholder")
          : field.key === "description"
            ? t("app.dictionary.query.descriptionPlaceholder")
            : field.key === "status"
              ? t("copy.query.statusPlaceholder")
              : field.placeholder,
  }))

  if (dictionaryPanelMode.value !== "detail") {
    return baseFields
  }

  return [
    ...baseFields,
    {
      key: "createdAt",
      label: t("app.dictionary.field.createdAt"),
      input: "datetime",
      disabled: true,
    },
    {
      key: "updatedAt",
      label: t("app.dictionary.field.updatedAt"),
      input: "datetime",
      disabled: true,
    },
  ]
})

const enterpriseDictionaryFormValues = computed<ElyFormValues>(() => {
  if (dictionaryPanelMode.value === "edit") {
    return {
      ...dictionaryEditForm.value,
      description: dictionaryEditForm.value.description ?? "",
    }
  }

  if (dictionaryPanelMode.value === "detail" && selectedDictionaryType.value) {
    return {
      code: selectedDictionaryType.value.code,
      name: selectedDictionaryType.value.name,
      description: selectedDictionaryType.value.description ?? "",
      status: selectedDictionaryType.value.status,
      createdAt: selectedDictionaryType.value.createdAt,
      updatedAt: selectedDictionaryType.value.updatedAt,
    }
  }

  return {
    ...dictionaryCreateForm.value,
    description: dictionaryCreateForm.value.description ?? "",
  }
})

const enterpriseFormFields = computed<ElyFormField[]>(() => {
  const baseFields = enterpriseCustomerPage.formFields.value.map((field) => ({
    ...field,
    label: localizeFieldLabel(field.key),
    options: localizeSelectOptions(field.options),
    placeholder:
      field.key === "status"
        ? t("copy.query.statusPlaceholder")
        : field.placeholder,
  }))

  if (enterpriseFormMode.value !== "detail") {
    return baseFields
  }

  return [
    ...baseFields,
    {
      key: "createdAt",
      label: t("app.customer.field.createdAt"),
      input: "datetime",
      disabled: true,
    },
    {
      key: "updatedAt",
      label: t("app.customer.field.updatedAt"),
      input: "datetime",
      disabled: true,
    },
  ]
})

const enterpriseFormValues = computed<ElyFormValues>(() => {
  if (enterpriseFormMode.value === "edit") {
    return { ...editForm.value }
  }

  if (enterpriseFormMode.value === "detail" && selectedCustomer.value) {
    return {
      name: selectedCustomer.value.name,
      status: selectedCustomer.value.status,
      createdAt: selectedCustomer.value.createdAt,
      updatedAt: selectedCustomer.value.updatedAt,
    }
  }

  return { ...customerForm.value }
})

const enterpriseDepartmentFormFields = computed<ElyFormField[]>(() => {
  const baseFields = enterpriseDepartmentPage.formFields.value.map((field) => ({
    ...field,
    label: localizeDepartmentFieldLabel(field.key),
    input: field.key === "parentId" ? ("select" as const) : field.input,
    options:
      field.key === "parentId"
        ? departmentParentOptions.value
        : field.key === "status"
          ? [
              {
                label: t("app.department.status.active"),
                value: "active",
              },
              {
                label: t("app.department.status.disabled"),
                value: "disabled",
              },
            ]
          : field.options,
    placeholder:
      field.key === "parentId"
        ? t("app.department.parentPlaceholder")
        : field.key === "code"
          ? t("app.department.query.codePlaceholder")
          : field.key === "name"
            ? t("app.department.query.namePlaceholder")
            : field.key === "status"
              ? t("copy.query.statusPlaceholder")
              : field.placeholder,
  }))

  if (departmentPanelMode.value !== "detail") {
    return baseFields
  }

  return [
    ...baseFields,
    {
      key: "createdAt",
      label: t("app.department.field.createdAt"),
      input: "datetime",
      disabled: true,
    },
    {
      key: "updatedAt",
      label: t("app.department.field.updatedAt"),
      input: "datetime",
      disabled: true,
    },
  ]
})

const enterpriseDepartmentFormValues = computed<ElyFormValues>(() => {
  if (departmentPanelMode.value === "edit") {
    return {
      ...departmentEditForm.value,
      parentId: departmentEditForm.value.parentId ?? "",
    }
  }

  if (departmentPanelMode.value === "detail" && selectedDepartment.value) {
    return {
      parentId: selectedDepartment.value.parentId ?? "",
      code: selectedDepartment.value.code,
      name: selectedDepartment.value.name,
      sort: selectedDepartment.value.sort,
      status: selectedDepartment.value.status,
      createdAt: selectedDepartment.value.createdAt,
      updatedAt: selectedDepartment.value.updatedAt,
    }
  }

  return {
    ...departmentCreateForm.value,
    parentId: departmentCreateForm.value.parentId ?? "",
  }
})

const enterpriseMenuFormFields = computed<ElyFormField[]>(() => {
  const baseFields = enterpriseMenuPage.formFields.value.map((field) => ({
    ...field,
    label: localizeMenuFieldLabel(field.key),
    input:
      field.key === "parentId"
        ? ("select" as const)
        : field.key === "type"
          ? ("select" as const)
          : field.key === "status"
            ? ("select" as const)
            : field.key === "isVisible"
              ? ("switch" as const)
              : field.input,
    options:
      field.key === "parentId"
        ? menuParentOptions.value
        : field.key === "type"
          ? [
              {
                label: t("app.menu.type.directory"),
                value: "directory",
              },
              {
                label: t("app.menu.type.menu"),
                value: "menu",
              },
              {
                label: t("app.menu.type.button"),
                value: "button",
              },
            ]
          : field.key === "status"
            ? [
                {
                  label: t("app.menu.status.active"),
                  value: "active",
                },
                {
                  label: t("app.menu.status.disabled"),
                  value: "disabled",
                },
              ]
            : field.options,
    placeholder:
      field.key === "parentId"
        ? t("app.menu.parentPlaceholder")
        : field.key === "code"
          ? t("app.menu.query.codePlaceholder")
          : field.key === "name"
            ? t("app.menu.query.namePlaceholder")
            : field.key === "path"
              ? t("app.menu.query.pathPlaceholder")
              : field.key === "component"
                ? t("app.menu.query.componentPlaceholder")
                : field.key === "icon"
                  ? t("app.menu.query.iconPlaceholder")
                  : field.key === "permissionCode"
                    ? t("app.menu.query.permissionCodePlaceholder")
                    : field.key === "status"
                      ? t("copy.query.statusPlaceholder")
                      : field.placeholder,
  }))

  if (menuPanelMode.value !== "detail") {
    return baseFields
  }

  return [
    ...baseFields,
    {
      key: "createdAt",
      label: t("app.menu.field.createdAt"),
      input: "datetime",
      disabled: true,
    },
    {
      key: "updatedAt",
      label: t("app.menu.field.updatedAt"),
      input: "datetime",
      disabled: true,
    },
  ]
})

const enterpriseMenuFormValues = computed<ElyFormValues>(() => {
  if (menuPanelMode.value === "edit") {
    return {
      ...menuEditForm.value,
      parentId: menuEditForm.value.parentId ?? "",
      path: menuEditForm.value.path ?? "",
      component: menuEditForm.value.component ?? "",
      icon: menuEditForm.value.icon ?? "",
      permissionCode: menuEditForm.value.permissionCode ?? "",
    }
  }

  if (menuPanelMode.value === "detail" && selectedMenu.value) {
    return {
      parentId: selectedMenu.value.parentId ?? "",
      type: selectedMenu.value.type,
      code: selectedMenu.value.code,
      name: selectedMenu.value.name,
      path: selectedMenu.value.path ?? "",
      component: selectedMenu.value.component ?? "",
      icon: selectedMenu.value.icon ?? "",
      sort: selectedMenu.value.sort,
      isVisible: selectedMenu.value.isVisible,
      status: selectedMenu.value.status,
      permissionCode: selectedMenu.value.permissionCode ?? "",
      createdAt: selectedMenu.value.createdAt,
      updatedAt: selectedMenu.value.updatedAt,
    }
  }

  return {
    ...menuCreateForm.value,
    parentId: menuCreateForm.value.parentId ?? "",
    path: menuCreateForm.value.path ?? "",
    component: menuCreateForm.value.component ?? "",
    icon: menuCreateForm.value.icon ?? "",
    permissionCode: menuCreateForm.value.permissionCode ?? "",
  }
})

const enterpriseUserFormFields = computed<ElyFormField[]>(() => {
  const baseFields = enterpriseUserPage.formFields.value
    .filter((field) =>
      userPanelMode.value === "detail" ? true : field.key !== "lastLoginAt",
    )
    .map((field) => ({
      ...field,
      label: localizeUserFieldLabel(field.key),
      options: localizeSelectOptions(field.options),
      placeholder:
        field.key === "username"
          ? t("app.user.query.usernamePlaceholder")
          : field.key === "displayName"
            ? t("app.user.query.displayNamePlaceholder")
            : field.key === "email"
              ? t("app.user.query.emailPlaceholder")
              : field.key === "phone"
                ? t("app.user.query.phonePlaceholder")
                : field.key === "status"
                  ? t("copy.query.statusPlaceholder")
                  : field.placeholder,
    }))

  if (userPanelMode.value !== "detail") {
    return baseFields
  }

  return [
    ...baseFields,
    {
      key: "createdAt",
      label: t("app.user.field.createdAt"),
      input: "datetime",
      disabled: true,
    },
    {
      key: "updatedAt",
      label: t("app.user.field.updatedAt"),
      input: "datetime",
      disabled: true,
    },
  ]
})

const enterpriseUserFormValues = computed<ElyFormValues>(() => {
  if (userPanelMode.value === "edit") {
    return { ...userEditForm.value }
  }

  if (userPanelMode.value === "detail" && selectedUser.value) {
    return {
      username: selectedUser.value.username,
      displayName: selectedUser.value.displayName,
      email: selectedUser.value.email ?? "",
      phone: selectedUser.value.phone ?? "",
      status: selectedUser.value.status,
      isSuperAdmin: selectedUser.value.isSuperAdmin,
      lastLoginAt: selectedUser.value.lastLoginAt ?? "",
      createdAt: selectedUser.value.createdAt,
      updatedAt: selectedUser.value.updatedAt,
    }
  }

  return { ...userCreateForm.value }
})

const enterpriseRoleFormFields = computed<ElyFormField[]>(() => {
  const baseFields = enterpriseRolePage.formFields.value.map((field) => ({
    ...field,
    label: localizeRoleFieldLabel(field.key),
    input:
      field.key === "description"
        ? ("textarea" as const)
        : field.key === "dataScope"
          ? ("select" as const)
          : field.input,
    options:
      field.key === "status"
        ? [
            {
              label: t("app.role.status.active"),
              value: "active",
            },
            {
              label: t("app.role.status.disabled"),
              value: "disabled",
            },
          ]
        : field.key === "dataScope"
          ? roleDataScopeOptions.value
          : field.options,
    placeholder:
      field.key === "code"
        ? t("app.role.query.codePlaceholder")
        : field.key === "name"
          ? t("app.role.query.namePlaceholder")
          : field.key === "description"
            ? t("app.role.query.descriptionPlaceholder")
            : field.key === "status"
              ? t("copy.query.statusPlaceholder")
              : field.placeholder,
  }))

  if (rolePanelMode.value !== "detail") {
    return baseFields
  }

  return [
    ...baseFields,
    {
      key: "createdAt",
      label: t("app.role.field.createdAt"),
      input: "datetime",
      disabled: true,
    },
    {
      key: "updatedAt",
      label: t("app.role.field.updatedAt"),
      input: "datetime",
      disabled: true,
    },
  ]
})

const enterpriseRoleFormValues = computed<ElyFormValues>(() => {
  if (rolePanelMode.value === "edit") {
    return {
      ...roleEditForm.value,
      description: roleEditForm.value.description ?? "",
      dataScope: String(roleEditForm.value.dataScope),
    }
  }

  if (rolePanelMode.value === "detail" && selectedRole.value) {
    return {
      code: selectedRole.value.code,
      name: selectedRole.value.name,
      description: selectedRole.value.description ?? "",
      status: selectedRole.value.status,
      isSystem: selectedRole.value.isSystem,
      dataScope: String(selectedRole.value.dataScope),
      createdAt: selectedRole.value.createdAt,
      updatedAt: selectedRole.value.updatedAt,
    }
  }

  return {
    ...roleCreateForm.value,
    description: roleCreateForm.value.description ?? "",
    dataScope: String(roleCreateForm.value.dataScope),
  }
})

const enterpriseSettingFormFields = computed<ElyFormField[]>(() => {
  const baseFields = enterpriseSettingPage.formFields.value.map((field) => ({
    ...field,
    label: localizeSettingFieldLabel(field.key),
    input: field.key === "description" ? ("textarea" as const) : field.input,
    options:
      field.key === "status"
        ? [
            {
              label: t("app.setting.status.active"),
              value: "active",
            },
            {
              label: t("app.setting.status.disabled"),
              value: "disabled",
            },
          ]
        : field.options,
    placeholder:
      field.key === "key"
        ? t("app.setting.query.keyPlaceholder")
        : field.key === "value"
          ? t("app.setting.query.valuePlaceholder")
          : field.key === "description"
            ? t("app.setting.query.descriptionPlaceholder")
            : field.key === "status"
              ? t("copy.query.statusPlaceholder")
              : field.placeholder,
  }))

  if (settingPanelMode.value !== "detail") {
    return baseFields
  }

  return [
    ...baseFields,
    {
      key: "createdAt",
      label: t("app.setting.field.createdAt"),
      input: "datetime",
      disabled: true,
    },
    {
      key: "updatedAt",
      label: t("app.setting.field.updatedAt"),
      input: "datetime",
      disabled: true,
    },
  ]
})

const enterpriseSettingFormValues = computed<ElyFormValues>(() => {
  if (settingPanelMode.value === "edit") {
    return {
      ...settingEditForm.value,
      description: settingEditForm.value.description ?? "",
    }
  }

  if (settingPanelMode.value === "detail" && selectedSetting.value) {
    return {
      key: selectedSetting.value.key,
      value: selectedSetting.value.value,
      description: selectedSetting.value.description ?? "",
      status: selectedSetting.value.status,
      createdAt: selectedSetting.value.createdAt,
      updatedAt: selectedSetting.value.updatedAt,
    }
  }

  return {
    ...settingCreateForm.value,
    description: settingCreateForm.value.description ?? "",
  }
})

const enterpriseOperationLogDetailFields = computed<ElyFormField[]>(() => [
  {
    key: "category",
    label: t("app.operationLog.field.category"),
    input: "text",
    disabled: true,
  },
  {
    key: "action",
    label: t("app.operationLog.field.action"),
    input: "text",
    disabled: true,
  },
  {
    key: "actorUserId",
    label: t("app.operationLog.field.actorUserId"),
    input: "text",
    disabled: true,
  },
  {
    key: "targetType",
    label: t("app.operationLog.field.targetType"),
    input: "text",
    disabled: true,
  },
  {
    key: "targetId",
    label: t("app.operationLog.field.targetId"),
    input: "text",
    disabled: true,
  },
  {
    key: "result",
    label: t("app.operationLog.field.result"),
    input: "text",
    disabled: true,
  },
  {
    key: "requestId",
    label: t("app.operationLog.field.requestId"),
    input: "text",
    disabled: true,
  },
  {
    key: "ip",
    label: t("app.operationLog.field.ip"),
    input: "text",
    disabled: true,
  },
  {
    key: "userAgent",
    label: t("app.operationLog.field.userAgent"),
    input: "text",
    disabled: true,
  },
  {
    key: "createdAt",
    label: t("app.operationLog.field.createdAt"),
    input: "datetime",
    disabled: true,
  },
])

const enterpriseOperationLogDetailValues = computed<ElyFormValues>(() => {
  if (!selectedOperationLog.value) {
    return {}
  }

  return {
    category: selectedOperationLog.value.category,
    action: selectedOperationLog.value.action,
    actorUserId: selectedOperationLog.value.actorUserId ?? "",
    targetType: selectedOperationLog.value.targetType ?? "",
    targetId: selectedOperationLog.value.targetId ?? "",
    result: localizeOperationLogResult(selectedOperationLog.value.result),
    requestId: selectedOperationLog.value.requestId ?? "",
    ip: selectedOperationLog.value.ip ?? "",
    userAgent: selectedOperationLog.value.userAgent ?? "",
    createdAt: selectedOperationLog.value.createdAt,
  }
})

const operationLogDetailsText = computed(() => {
  if (!selectedOperationLog.value?.details) {
    return t("app.operationLog.meta.empty")
  }

  return JSON.stringify(selectedOperationLog.value.details, null, 2)
})

const enterprisePanelTitle = computed(() => {
  if (deleteConfirmId.value && selectedCustomer.value) {
    return t("app.panelTitle.delete", { name: selectedCustomer.value.name })
  }

  if (enterpriseFormMode.value === "edit") {
    return t("app.panelTitle.edit")
  }

  if (enterpriseFormMode.value === "detail" && selectedCustomer.value) {
    return selectedCustomer.value.name
  }

  return t("app.panelTitle.create")
})

const dictionaryPanelTitle = computed(() => {
  if (dictionaryPanelMode.value === "edit") {
    return t("app.dictionary.panelTitle.edit")
  }

  if (dictionaryPanelMode.value === "create") {
    return t("app.dictionary.panelTitle.create")
  }

  return (
    selectedDictionaryType.value?.name ??
    t("app.dictionary.panelTitle.detailFallback")
  )
})

const dictionaryPanelDescription = computed(() => {
  if (dictionaryPanelMode.value === "edit") {
    return t("app.dictionary.panelDesc.edit")
  }

  if (dictionaryPanelMode.value === "create") {
    return t("app.dictionary.panelDesc.create")
  }

  return selectedDictionaryType.value
    ? t("app.dictionary.panelDesc.detail")
    : t("app.dictionary.detailEmptyDescription")
})

const departmentPanelTitle = computed(() => {
  if (departmentPanelMode.value === "edit") {
    return t("app.department.panelTitle.edit")
  }

  if (departmentPanelMode.value === "create") {
    return t("app.department.panelTitle.create")
  }

  return (
    selectedDepartment.value?.name ??
    t("app.department.panelTitle.detailFallback")
  )
})

const departmentPanelDescription = computed(() => {
  if (departmentPanelMode.value === "edit") {
    return t("app.department.panelDesc.edit")
  }

  if (departmentPanelMode.value === "create") {
    return t("app.department.panelDesc.create")
  }

  return selectedDepartment.value
    ? t("app.department.panelDesc.detail")
    : t("app.department.detailEmptyDescription")
})

const menuPanelTitle = computed(() => {
  if (menuPanelMode.value === "edit") {
    return t("app.menu.panelTitle.edit")
  }

  if (menuPanelMode.value === "create") {
    return t("app.menu.panelTitle.create")
  }

  return selectedMenu.value?.name ?? t("app.menu.panelTitle.detailFallback")
})

const menuPanelDescription = computed(() => {
  if (menuPanelMode.value === "edit") {
    return t("app.menu.panelDesc.edit")
  }

  if (menuPanelMode.value === "create") {
    return t("app.menu.panelDesc.create")
  }

  return selectedMenu.value
    ? t("app.menu.panelDesc.detail")
    : t("app.menu.detailEmptyDescription")
})

const notificationPanelTitle = computed(() => {
  if (notificationPanelMode.value === "create") {
    return t("app.notification.panelTitle.create")
  }

  return (
    selectedNotification.value?.title ??
    t("app.notification.panelTitle.detailFallback")
  )
})

const notificationPanelDescription = computed(() =>
  notificationPanelMode.value === "create"
    ? t("app.notification.panelDesc.create")
    : selectedNotification.value
      ? t("app.notification.panelDesc.detail")
      : t("app.notification.detailEmptyDescription"),
)

const operationLogPanelTitle = computed(() => {
  if (!selectedOperationLog.value) {
    return t("app.operationLog.panelTitle.detailFallback")
  }

  return `${selectedOperationLog.value.category} / ${selectedOperationLog.value.action}`
})

const operationLogPanelDescription = computed(() =>
  selectedOperationLog.value
    ? t("app.operationLog.panelDesc.detail")
    : t("app.operationLog.detailEmptyDescription"),
)

const rolePanelTitle = computed(() => {
  if (rolePanelMode.value === "edit") {
    return t("app.role.panelTitle.edit")
  }

  if (rolePanelMode.value === "create") {
    return t("app.role.panelTitle.create")
  }

  return selectedRole.value?.name ?? t("app.role.panelTitle.detailFallback")
})

const rolePanelDescription = computed(() => {
  if (rolePanelMode.value === "edit") {
    return t("app.role.panelDesc.edit")
  }

  if (rolePanelMode.value === "create") {
    return t("app.role.panelDesc.create")
  }

  return selectedRole.value
    ? t("app.role.panelDesc.detail")
    : t("app.role.detailEmptyDescription")
})

const settingPanelTitle = computed(() => {
  if (settingPanelMode.value === "edit") {
    return t("app.setting.panelTitle.edit")
  }

  if (settingPanelMode.value === "create") {
    return t("app.setting.panelTitle.create")
  }

  return (
    selectedSetting.value?.key ?? t("app.setting.panelTitle.detailFallback")
  )
})

const settingPanelDescription = computed(() => {
  if (settingPanelMode.value === "edit") {
    return t("app.setting.panelDesc.edit")
  }

  if (settingPanelMode.value === "create") {
    return t("app.setting.panelDesc.create")
  }

  return selectedSetting.value
    ? t("app.setting.panelDesc.detail")
    : t("app.setting.detailEmptyDescription")
})

const enterprisePanelDescription = computed(() => {
  if (deleteConfirmId.value && selectedCustomer.value) {
    return t("app.panelDesc.delete")
  }

  if (enterpriseFormMode.value === "edit") {
    return t("app.panelDesc.edit")
  }

  if (enterpriseFormMode.value === "detail" && selectedCustomer.value) {
    return t("app.panelDesc.detail")
  }

  return t("app.panelDesc.create")
})

const userPanelTitle = computed(() => {
  if (userPanelMode.value === "edit") {
    return t("app.user.panelTitle.edit")
  }

  if (userPanelMode.value === "create") {
    return t("app.user.panelTitle.create")
  }

  if (userPanelMode.value === "reset") {
    return selectedUser.value
      ? t("app.user.panelTitle.reset", {
          name: selectedUser.value.displayName || selectedUser.value.username,
        })
      : t("app.user.panelTitle.resetFallback")
  }

  return (
    selectedUser.value?.displayName ??
    selectedUser.value?.username ??
    t("app.user.panelTitle.detailFallback")
  )
})

const userPanelDescription = computed(() => {
  if (userPanelMode.value === "edit") {
    return t("app.user.panelDesc.edit")
  }

  if (userPanelMode.value === "create") {
    return t("app.user.panelDesc.create")
  }

  if (userPanelMode.value === "reset") {
    return t("app.user.panelDesc.reset")
  }

  return selectedUser.value
    ? t("app.user.panelDesc.detail")
    : t("app.user.detailEmptyDescription")
})

const authStatusState = computed(() => {
  if (!authModuleReady.value) return "offline"
  if (authLoading.value) return "checking"
  return isAuthenticated.value ? "authenticated" : "signin-required"
})

const authStatusLabel = computed(() => {
  if (authStatusState.value === "offline") {
    return t("app.stats.authOffline")
  }

  if (authStatusState.value === "checking") {
    return t("app.stats.authChecking")
  }

  if (authStatusState.value === "authenticated") {
    return t("app.stats.authSessionLive")
  }

  return t("app.stats.authSigninRequired")
})

const authStatusTone = computed(() => {
  if (authStatusState.value === "authenticated") {
    return "text-emerald-300"
  }

  if (authStatusState.value === "offline") {
    return "text-amber-300"
  }

  return "text-cyan-300"
})

const currentWorkspaceItemCount = computed(() => {
  if (isCustomerWorkspace.value) {
    return customerItems.value.length
  }

  if (isDictionaryWorkspace.value) {
    return filteredDictionaryTypes.value.length
  }

  if (isDepartmentWorkspace.value) {
    return filteredDepartmentItems.value.length
  }

  if (isMenuWorkspace.value) {
    return filteredMenuItems.value.length
  }

  if (isNotificationWorkspace.value) {
    return filteredNotificationItems.value.length
  }

  if (isOperationLogWorkspace.value) {
    return filteredOperationLogItems.value.length
  }

  if (isRoleWorkspace.value) {
    return filteredRoleItems.value.length
  }

  if (isSettingWorkspace.value) {
    return filteredSettingItems.value.length
  }

  if (isUserWorkspace.value) {
    return filteredUserItems.value.length
  }

  if (isWorkflowDefinitionsWorkspace.value) {
    return workflowDefinitionCards.value.length
  }

  return 0
})

const currentWorkspaceItemHint = computed(() => {
  if (isWorkflowDefinitionsWorkspace.value) {
    return t("app.workflow.statsHint")
  }

  if (isUserWorkspace.value) {
    return t("app.user.statsHint")
  }

  if (isDictionaryWorkspace.value) {
    return t("app.dictionary.statsHint")
  }

  if (isDepartmentWorkspace.value) {
    return t("app.department.statsHint")
  }

  if (isMenuWorkspace.value) {
    return t("app.menu.statsHint")
  }

  if (isNotificationWorkspace.value) {
    return t("app.notification.statsHint")
  }

  if (isOperationLogWorkspace.value) {
    return t("app.operationLog.statsHint")
  }

  if (isRoleWorkspace.value) {
    return t("app.role.statsHint")
  }

  if (isSettingWorkspace.value) {
    return t("app.setting.statsHint")
  }

  if (currentWorkspaceKind.value === "placeholder") {
    return t("app.placeholder.statsHint")
  }

  return t("app.stats.rowsHint")
})

const enterpriseShellStats = computed<ElyShellStat[]>(() => [
  {
    key: "runtime",
    label: t("app.badge.runtime"),
    value: platform.value?.manifest.runtime ?? "bun-first",
    hint: t("app.stats.runtimeHint"),
  },
  {
    key: "auth",
    label: t("app.badge.auth"),
    value: authStatusLabel.value,
    hint: t("app.stats.authHint"),
  },
  {
    key: "navigation",
    label: t("app.stats.navigation"),
    value: t("app.stats.navigationCount", {
      count: navigationItemCount.value,
    }),
    hint: t("app.stats.navigationHint"),
  },
  {
    key: "rows",
    label: t("app.badge.rows"),
    value: `${currentWorkspaceItemCount.value}`,
    hint: currentWorkspaceItemHint.value,
  },
])

const enterpriseShellTabs = computed<ElyShellTab[]>(() => [
  {
    key: "workspace",
    label: t("app.tabs.workspace"),
    hint: isCustomerWorkspace.value
      ? t("app.tabs.workspaceHint", {
          count: customerItems.value.length,
        })
      : isDictionaryWorkspace.value
        ? t("app.dictionary.tabsHint", {
            count: filteredDictionaryTypes.value.length,
          })
        : isDepartmentWorkspace.value
          ? t("app.department.tabsHint", {
              count: filteredDepartmentItems.value.length,
            })
          : isMenuWorkspace.value
            ? t("app.menu.tabsHint", {
                count: filteredMenuItems.value.length,
              })
            : isNotificationWorkspace.value
              ? t("app.notification.tabsHint", {
                  count: filteredNotificationItems.value.length,
                })
              : isOperationLogWorkspace.value
                ? t("app.operationLog.tabsHint", {
                    count: filteredOperationLogItems.value.length,
                  })
                : isRoleWorkspace.value
                  ? t("app.role.tabsHint", {
                      count: filteredRoleItems.value.length,
                    })
                  : isSettingWorkspace.value
                    ? t("app.setting.tabsHint", {
                        count: filteredSettingItems.value.length,
                      })
                    : isUserWorkspace.value
                      ? t("app.user.tabsHint", {
                          count: filteredUserItems.value.length,
                        })
                      : isWorkflowDefinitionsWorkspace.value
                        ? t("app.workflow.tabsHint", {
                            count: workflowDefinitionCards.value.length,
                          })
                        : currentNavigationPath.value,
  },
  {
    key: "runtime",
    label: t("app.tabs.runtime"),
    hint: currentModuleStatusLabel.value,
  },
])

const enterpriseSelectedTabKey = computed(() => currentShellTabKey.value)

const enterpriseShellUser = computed<ElyShellUserSummary | null>(() =>
  authIdentity.value
    ? {
        displayName: authIdentity.value.user.displayName,
        username: authIdentity.value.user.username,
        roles: authIdentity.value.roles,
      }
    : {
        displayName: t("app.previewUser.name"),
        username: t("app.previewUser.username"),
        roles: ["preset", "demo"],
      },
)

const enterpriseCrudCopy = computed(() => ({
  gridTitle: t("copy.crud.gridTitle"),
  liveContractLabel: t("copy.crud.liveContract"),
  rowsInScopeSuffix: t("copy.crud.rowsSuffix"),
  emptyTitle: t("copy.crud.emptyTitle"),
  emptyDescription: t("copy.crud.emptyDescription"),
  queryBarCopy: {
    searchPlaceholderPrefix: t("copy.query.searchPrefix"),
    statusPlaceholder: t("copy.query.statusPlaceholder"),
    statusActive: t("copy.query.statusActive"),
    statusInactive: t("copy.query.statusInactive"),
    searchButton: t("copy.query.searchButton"),
    resetButton: t("copy.query.resetButton"),
  },
  tableCopy: {
    actionsTitle: t("copy.table.actions"),
    statusActive: t("copy.query.statusActive"),
    statusInactive: t("copy.query.statusInactive"),
    statusUnknown: t("copy.table.statusUnknown"),
  },
}))

const enterpriseFormCopy = computed(() => ({
  submitButton: t("copy.form.submit"),
  cancelButton: t("copy.form.cancel"),
  switchEnabled: t("copy.form.enabled"),
  switchDisabled: t("copy.form.disabled"),
}))

const enterpriseShellCopy = computed(() => ({
  navigationLabel: t("copy.shell.navigation"),
  environmentLabel: t("copy.shell.environment"),
  presetEyebrow: t("copy.shell.presetEyebrow"),
  fallbackWorkspace: t("copy.crud.emptyDescription"),
}))

const customerCountLabel = computed(() =>
  t("app.workspace.countLabel", {
    visible: customerItems.value.length,
    total: customerListTotal.value,
    page: customerListPage.value,
    totalPages: customerListTotalPages.value,
  }),
)

const canGoToPreviousCustomerPage = computed(() => customerListPage.value > 1)
const canGoToNextCustomerPage = computed(
  () => customerListPage.value < customerListTotalPages.value,
)
const canJumpToCustomerPage = computed(() => {
  const nextPage = Number.parseInt(customerPageInputValue.value, 10)

  return (
    Number.isFinite(nextPage) &&
    nextPage >= 1 &&
    nextPage <= customerListTotalPages.value &&
    nextPage !== customerListPage.value
  )
})
const customerPaginationSummary = computed(() =>
  t("app.workspace.paginationSummary", {
    page: customerListPage.value,
    totalPages: customerListTotalPages.value,
    total: customerListTotal.value,
  }),
)
const customerPageSizeOptions = computed(() => [
  {
    label: t("app.workspace.paginationPageSize20"),
    value: 20,
  },
  {
    label: t("app.workspace.paginationPageSize50"),
    value: 50,
  },
  {
    label: t("app.workspace.paginationPageSize100"),
    value: 100,
  },
])
const customerSortOptions = computed(() => [
  {
    label: t("app.workspace.paginationSortCreatedDesc"),
    value: "createdAt:desc",
  },
  {
    label: t("app.workspace.paginationSortCreatedAsc"),
    value: "createdAt:asc",
  },
  {
    label: t("app.workspace.paginationSortNameAsc"),
    value: "name:asc",
  },
  {
    label: t("app.workspace.paginationSortNameDesc"),
    value: "name:desc",
  },
])

const currentQuerySummary = computed(() => {
  if (isDictionaryWorkspace.value) {
    const fragments: string[] = []

    if (
      typeof dictionaryQueryValues.value.code === "string" &&
      dictionaryQueryValues.value.code.trim()
    ) {
      fragments.push(
        `${t("app.dictionary.field.code")}: ${dictionaryQueryValues.value.code.trim()}`,
      )
    }

    if (
      typeof dictionaryQueryValues.value.name === "string" &&
      dictionaryQueryValues.value.name.trim()
    ) {
      fragments.push(
        `${t("app.dictionary.field.name")}: ${dictionaryQueryValues.value.name.trim()}`,
      )
    }

    if (
      typeof dictionaryQueryValues.value.description === "string" &&
      dictionaryQueryValues.value.description.trim()
    ) {
      fragments.push(
        `${t("app.dictionary.field.description")}: ${dictionaryQueryValues.value.description.trim()}`,
      )
    }

    if (
      typeof dictionaryQueryValues.value.status === "string" &&
      dictionaryQueryValues.value.status
    ) {
      fragments.push(
        `${t("app.dictionary.field.status")}: ${localizeDictionaryStatus(
          dictionaryQueryValues.value.status,
        )}`,
      )
    }

    return fragments.length > 0 ? fragments.join(" / ") : t("app.filter.none")
  }

  if (isDepartmentWorkspace.value) {
    const fragments: string[] = []

    if (
      typeof departmentQueryValues.value.code === "string" &&
      departmentQueryValues.value.code.trim()
    ) {
      fragments.push(
        `${t("app.department.field.code")}: ${departmentQueryValues.value.code.trim()}`,
      )
    }

    if (
      typeof departmentQueryValues.value.name === "string" &&
      departmentQueryValues.value.name.trim()
    ) {
      fragments.push(
        `${t("app.department.field.name")}: ${departmentQueryValues.value.name.trim()}`,
      )
    }

    if (
      typeof departmentQueryValues.value.status === "string" &&
      departmentQueryValues.value.status
    ) {
      fragments.push(
        `${t("app.department.field.status")}: ${localizeDepartmentStatus(
          departmentQueryValues.value.status,
        )}`,
      )
    }

    return fragments.length > 0 ? fragments.join(" / ") : t("app.filter.none")
  }

  if (isRoleWorkspace.value) {
    const fragments: string[] = []

    if (
      typeof roleQueryValues.value.code === "string" &&
      roleQueryValues.value.code.trim()
    ) {
      fragments.push(
        `${t("app.role.field.code")}: ${roleQueryValues.value.code.trim()}`,
      )
    }

    if (
      typeof roleQueryValues.value.name === "string" &&
      roleQueryValues.value.name.trim()
    ) {
      fragments.push(
        `${t("app.role.field.name")}: ${roleQueryValues.value.name.trim()}`,
      )
    }

    if (
      typeof roleQueryValues.value.description === "string" &&
      roleQueryValues.value.description.trim()
    ) {
      fragments.push(
        `${t("app.role.field.description")}: ${roleQueryValues.value.description.trim()}`,
      )
    }

    if (
      typeof roleQueryValues.value.status === "string" &&
      roleQueryValues.value.status
    ) {
      fragments.push(
        `${t("app.role.field.status")}: ${localizeRoleStatus(
          roleQueryValues.value.status,
        )}`,
      )
    }

    return fragments.length > 0 ? fragments.join(" / ") : t("app.filter.none")
  }

  if (isMenuWorkspace.value) {
    const fragments: string[] = []

    if (
      typeof menuQueryValues.value.type === "string" &&
      menuQueryValues.value.type
    ) {
      fragments.push(
        `${t("app.menu.field.type")}: ${localizeMenuType(menuQueryValues.value.type)}`,
      )
    }

    if (
      typeof menuQueryValues.value.code === "string" &&
      menuQueryValues.value.code.trim()
    ) {
      fragments.push(
        `${t("app.menu.field.code")}: ${menuQueryValues.value.code.trim()}`,
      )
    }

    if (
      typeof menuQueryValues.value.name === "string" &&
      menuQueryValues.value.name.trim()
    ) {
      fragments.push(
        `${t("app.menu.field.name")}: ${menuQueryValues.value.name.trim()}`,
      )
    }

    if (
      typeof menuQueryValues.value.path === "string" &&
      menuQueryValues.value.path.trim()
    ) {
      fragments.push(
        `${t("app.menu.field.path")}: ${menuQueryValues.value.path.trim()}`,
      )
    }

    if (
      typeof menuQueryValues.value.component === "string" &&
      menuQueryValues.value.component.trim()
    ) {
      fragments.push(
        `${t("app.menu.field.component")}: ${menuQueryValues.value.component.trim()}`,
      )
    }

    if (
      typeof menuQueryValues.value.icon === "string" &&
      menuQueryValues.value.icon.trim()
    ) {
      fragments.push(
        `${t("app.menu.field.icon")}: ${menuQueryValues.value.icon.trim()}`,
      )
    }

    if (
      typeof menuQueryValues.value.permissionCode === "string" &&
      menuQueryValues.value.permissionCode.trim()
    ) {
      fragments.push(
        `${t("app.menu.field.permissionCode")}: ${menuQueryValues.value.permissionCode.trim()}`,
      )
    }

    if (
      typeof menuQueryValues.value.status === "string" &&
      menuQueryValues.value.status
    ) {
      fragments.push(
        `${t("app.menu.field.status")}: ${localizeMenuStatus(
          menuQueryValues.value.status,
        )}`,
      )
    }

    return fragments.length > 0 ? fragments.join(" / ") : t("app.filter.none")
  }

  if (isNotificationWorkspace.value) {
    const fragments: string[] = []

    if (
      typeof notificationQueryValues.value.recipientUserId === "string" &&
      notificationQueryValues.value.recipientUserId.trim()
    ) {
      fragments.push(
        `${t("app.notification.field.recipientUserId")}: ${notificationQueryValues.value.recipientUserId.trim()}`,
      )
    }

    if (
      typeof notificationQueryValues.value.title === "string" &&
      notificationQueryValues.value.title.trim()
    ) {
      fragments.push(
        `${t("app.notification.field.title")}: ${notificationQueryValues.value.title.trim()}`,
      )
    }

    if (
      typeof notificationQueryValues.value.content === "string" &&
      notificationQueryValues.value.content.trim()
    ) {
      fragments.push(
        `${t("app.notification.field.content")}: ${notificationQueryValues.value.content.trim()}`,
      )
    }

    if (
      typeof notificationQueryValues.value.level === "string" &&
      notificationQueryValues.value.level
    ) {
      fragments.push(
        `${t("app.notification.field.level")}: ${localizeNotificationLevel(
          notificationQueryValues.value.level,
        )}`,
      )
    }

    if (
      typeof notificationQueryValues.value.status === "string" &&
      notificationQueryValues.value.status
    ) {
      fragments.push(
        `${t("app.notification.field.status")}: ${localizeNotificationStatus(
          notificationQueryValues.value.status,
        )}`,
      )
    }

    return fragments.length > 0 ? fragments.join(" / ") : t("app.filter.none")
  }

  if (isOperationLogWorkspace.value) {
    const fragments: string[] = []

    if (
      typeof operationLogQueryValues.value.category === "string" &&
      operationLogQueryValues.value.category.trim()
    ) {
      fragments.push(
        `${t("app.operationLog.field.category")}: ${operationLogQueryValues.value.category.trim()}`,
      )
    }

    if (
      typeof operationLogQueryValues.value.action === "string" &&
      operationLogQueryValues.value.action.trim()
    ) {
      fragments.push(
        `${t("app.operationLog.field.action")}: ${operationLogQueryValues.value.action.trim()}`,
      )
    }

    if (
      typeof operationLogQueryValues.value.actorUserId === "string" &&
      operationLogQueryValues.value.actorUserId.trim()
    ) {
      fragments.push(
        `${t("app.operationLog.field.actorUserId")}: ${operationLogQueryValues.value.actorUserId.trim()}`,
      )
    }

    if (
      typeof operationLogQueryValues.value.result === "string" &&
      operationLogQueryValues.value.result
    ) {
      fragments.push(
        `${t("app.operationLog.field.result")}: ${localizeOperationLogResult(
          operationLogQueryValues.value.result,
        )}`,
      )
    }

    return fragments.length > 0 ? fragments.join(" / ") : t("app.filter.none")
  }

  if (isUserWorkspace.value) {
    const fragments: string[] = []

    if (
      typeof userQueryValues.value.username === "string" &&
      userQueryValues.value.username.trim()
    ) {
      fragments.push(
        `${t("app.user.field.username")}: ${userQueryValues.value.username.trim()}`,
      )
    }

    if (
      typeof userQueryValues.value.displayName === "string" &&
      userQueryValues.value.displayName.trim()
    ) {
      fragments.push(
        `${t("app.user.field.displayName")}: ${userQueryValues.value.displayName.trim()}`,
      )
    }

    if (
      typeof userQueryValues.value.email === "string" &&
      userQueryValues.value.email.trim()
    ) {
      fragments.push(
        `${t("app.user.field.email")}: ${userQueryValues.value.email.trim()}`,
      )
    }

    if (
      typeof userQueryValues.value.phone === "string" &&
      userQueryValues.value.phone.trim()
    ) {
      fragments.push(
        `${t("app.user.field.phone")}: ${userQueryValues.value.phone.trim()}`,
      )
    }

    if (
      typeof userQueryValues.value.status === "string" &&
      userQueryValues.value.status
    ) {
      fragments.push(
        `${t("app.user.field.status")}: ${localizeUserStatus(
          userQueryValues.value.status,
        )}`,
      )
    }

    return fragments.length > 0 ? fragments.join(" / ") : t("app.filter.none")
  }

  if (isSettingWorkspace.value) {
    const fragments: string[] = []

    if (
      typeof settingQueryValues.value.key === "string" &&
      settingQueryValues.value.key.trim()
    ) {
      fragments.push(
        `${t("app.setting.field.key")}: ${settingQueryValues.value.key.trim()}`,
      )
    }

    if (
      typeof settingQueryValues.value.value === "string" &&
      settingQueryValues.value.value.trim()
    ) {
      fragments.push(
        `${t("app.setting.field.value")}: ${settingQueryValues.value.value.trim()}`,
      )
    }

    if (
      typeof settingQueryValues.value.description === "string" &&
      settingQueryValues.value.description.trim()
    ) {
      fragments.push(
        `${t("app.setting.field.description")}: ${settingQueryValues.value.description.trim()}`,
      )
    }

    if (
      typeof settingQueryValues.value.status === "string" &&
      settingQueryValues.value.status
    ) {
      fragments.push(
        `${t("app.setting.field.status")}: ${localizeSettingStatus(
          settingQueryValues.value.status,
        )}`,
      )
    }

    return fragments.length > 0 ? fragments.join(" / ") : t("app.filter.none")
  }

  const fragments: string[] = []

  if (
    typeof enterpriseQueryValues.value.name === "string" &&
    enterpriseQueryValues.value.name.trim()
  ) {
    fragments.push(
      `${t("app.filter.name")}: ${enterpriseQueryValues.value.name.trim()}`,
    )
  }

  if (
    typeof enterpriseQueryValues.value.status === "string" &&
    enterpriseQueryValues.value.status
  ) {
    fragments.push(
      `${t("app.filter.status")}: ${localizeCustomerStatus(
        enterpriseQueryValues.value.status,
      )}`,
    )
  }

  fragments.push(
    `${t("app.filter.pageSize")}: ${customerListPageSize.value}`,
    `${t("app.filter.sort")}: ${customerSortOptions.value.find((option) => option.value === customerListSortValue.value)?.label ?? customerListSortValue.value}`,
  )

  return fragments.length > 0 ? fragments.join(" / ") : t("app.filter.none")
})

const filteredWorkflowDefinitions = computed(() => {
  return filterWorkflowDefinitions(
    workflowDefinitions.value,
    workflowQuery.value,
    workflowStatusFilter.value,
  )
})

const workflowDefinitionCards = computed(() =>
  filteredWorkflowDefinitions.value.map((definition) => ({
    ...definition,
    updatedAtLabel: new Date(definition.updatedAt).toLocaleString(locale.value),
    statusLabel: localizeWorkflowStatus(definition.status),
    nodeCount: definition.definition.nodes.length,
    edgeCount: definition.definition.edges.length,
  })),
)

const workflowDefinitionDetailCards = computed(
  () =>
    selectedWorkflowDefinition.value?.definition.nodes.map((node) => ({
      id: node.id,
      name: node.name,
      typeLabel: localizeWorkflowNodeType(node.type),
      description: describeWorkflowNode(node),
    })) ?? [],
)

const workflowVersionHistoryCards = computed(() => {
  return listWorkflowDefinitionVersions(
    workflowDefinitions.value,
    selectedWorkflowDefinition.value?.key,
  ).map((definition) => ({
    ...definition,
    updatedAtLabel: new Date(definition.updatedAt).toLocaleString(locale.value),
    statusLabel: localizeWorkflowStatus(definition.status),
    nodeCount: definition.definition.nodes.length,
    edgeCount: definition.definition.edges.length,
  }))
})

const workflowFilterSummary = computed(() => {
  const fragments: string[] = []

  if (workflowQuery.value.trim().length > 0) {
    fragments.push(
      t("app.workflow.filter.querySummary", {
        value: workflowQuery.value.trim(),
      }),
    )
  }

  if (workflowStatusFilter.value !== "all") {
    fragments.push(
      t("app.workflow.filter.statusSummary", {
        value: localizeWorkflowStatus(workflowStatusFilter.value),
      }),
    )
  }

  return fragments.length > 0
    ? fragments.join(" / ")
    : t("app.workflow.filter.none")
})

const openCustomerWorkspace = () => {
  if (!customerNavigationItem.value) {
    return
  }

  currentMenuKey.value = customerNavigationItem.value.id
  currentShellTabKey.value = "workspace"
}

const localizedPlatformCapabilities = computed(() =>
  (platform.value?.capabilities ?? []).map((capability) =>
    localizeCapability(capability),
  ),
)

watch(
  customerItems,
  (items) => {
    if (
      enterpriseFormMode.value === "create" ||
      enterpriseFormMode.value === "edit"
    ) {
      return
    }

    if (items.length === 0) {
      selectedCustomerId.value = null
      if (canCreateCustomers.value) {
        enterpriseFormMode.value = "create"
      }
      return
    }

    if (
      !selectedCustomerId.value ||
      !items.some((item) => item.id === selectedCustomerId.value)
    ) {
      selectedCustomerId.value = items[0].id
    }
  },
  {
    immediate: true,
  },
)

watch(
  filteredDictionaryTypes,
  async (items) => {
    if (
      !isDictionaryWorkspace.value ||
      dictionaryLoading.value ||
      dictionaryPanelMode.value !== "detail"
    ) {
      return
    }

    if (items.length === 0) {
      selectedDictionaryTypeId.value = null
      dictionaryTypeDetail.value = null

      if (canCreateDictionaryTypes.value) {
        dictionaryPanelMode.value = "create"
      }

      return
    }

    if (
      !selectedDictionaryTypeId.value ||
      !items.some((item) => item.id === selectedDictionaryTypeId.value)
    ) {
      await selectDictionaryType(items[0])
    }
  },
  {
    immediate: true,
  },
)

watch(
  filteredNotificationItems,
  async (items) => {
    if (
      !isNotificationWorkspace.value ||
      notificationLoading.value ||
      notificationPanelMode.value !== "detail"
    ) {
      return
    }

    const nextNotificationId = resolveNotificationSelection(
      items,
      selectedNotificationId.value,
    )

    if (!nextNotificationId) {
      selectedNotificationId.value = null
      notificationDetail.value = null

      if (canCreateNotifications.value) {
        notificationPanelMode.value = "create"
      }

      return
    }

    const nextNotification = items.find(
      (notification) => notification.id === nextNotificationId,
    )

    if (!nextNotification) {
      selectedNotificationId.value = null
      notificationDetail.value = null
      return
    }

    if (nextNotificationId === selectedNotificationId.value) {
      if (
        !notificationDetail.value ||
        notificationDetail.value.id !== nextNotificationId
      ) {
        notificationDetail.value = nextNotification
      }
      return
    }

    await selectNotification(nextNotification)
  },
  {
    immediate: true,
  },
)

watch(
  filteredDepartmentItems,
  async (items) => {
    if (
      !isDepartmentWorkspace.value ||
      departmentLoading.value ||
      departmentPanelMode.value !== "detail"
    ) {
      return
    }

    if (items.length === 0) {
      selectedDepartmentId.value = null
      departmentDetail.value = null

      if (canCreateDepartments.value) {
        departmentPanelMode.value = "create"
      }

      return
    }

    if (
      !selectedDepartmentId.value ||
      !items.some((item) => item.id === selectedDepartmentId.value)
    ) {
      await selectDepartment(items[0])
    }
  },
  {
    immediate: true,
  },
)

watch(
  filteredMenuItems,
  async (items) => {
    if (
      !isMenuWorkspace.value ||
      menuLoading.value ||
      menuPanelMode.value !== "detail"
    ) {
      return
    }

    if (items.length === 0) {
      selectedMenuId.value = null
      menuDetail.value = null

      if (canCreateMenus.value) {
        menuPanelMode.value = "create"
      }

      return
    }

    if (
      !selectedMenuId.value ||
      !items.some((item) => item.id === selectedMenuId.value)
    ) {
      await selectMenu(items[0])
    }
  },
  {
    immediate: true,
  },
)

watch(
  filteredOperationLogItems,
  async (items) => {
    if (
      !isOperationLogWorkspace.value ||
      operationLogLoading.value ||
      operationLogDetailLoading.value
    ) {
      return
    }

    if (items.length === 0) {
      selectedOperationLogId.value = null
      operationLogDetail.value = null
      return
    }

    if (
      !selectedOperationLogId.value ||
      !items.some((item) => item.id === selectedOperationLogId.value)
    ) {
      await selectOperationLog(items[0])
    }
  },
  {
    immediate: true,
  },
)

watch(
  filteredRoleItems,
  async (items) => {
    if (
      !isRoleWorkspace.value ||
      roleLoading.value ||
      rolePanelMode.value !== "detail"
    ) {
      return
    }

    if (items.length === 0) {
      selectedRoleId.value = null
      roleDetail.value = null

      if (canCreateRoles.value) {
        rolePanelMode.value = "create"
      }

      return
    }

    if (
      !selectedRoleId.value ||
      !items.some((item) => item.id === selectedRoleId.value)
    ) {
      await selectRole(items[0])
    }
  },
  {
    immediate: true,
  },
)

watch(
  filteredSettingItems,
  async (items) => {
    if (
      !isSettingWorkspace.value ||
      settingLoading.value ||
      settingPanelMode.value !== "detail"
    ) {
      return
    }

    if (items.length === 0) {
      selectedSettingId.value = null
      settingDetail.value = null

      if (canCreateSettings.value) {
        settingPanelMode.value = "create"
      }

      return
    }

    if (
      !selectedSettingId.value ||
      !items.some((item) => item.id === selectedSettingId.value)
    ) {
      await selectSetting(items[0])
    }
  },
  {
    immediate: true,
  },
)

watch(
  filteredUserItems,
  (items) => {
    if (items.length === 0) {
      selectedUserId.value = null
      if (userPanelMode.value === "detail" && canCreateUsers.value) {
        userPanelMode.value = "create"
      }
      return
    }

    if (
      !selectedUserId.value ||
      !items.some((item) => item.id === selectedUserId.value)
    ) {
      selectedUserId.value = items[0]?.id ?? null
      if (userPanelMode.value === "detail") {
        userPanelMode.value = "detail"
      }
    }
  },
  {
    immediate: true,
  },
)

watch(
  workflowDefinitionCards,
  async (items) => {
    if (!isWorkflowDefinitionsWorkspace.value || workflowLoading.value) {
      return
    }

    const nextDefinitionId = resolveWorkflowDefinitionSelection(
      items,
      selectedWorkflowDefinitionId.value,
    )

    if (!nextDefinitionId) {
      selectedWorkflowDefinitionId.value = null
      workflowDefinitionDetail.value = null
      return
    }

    const nextDefinition = items.find(
      (definition) => definition.id === nextDefinitionId,
    )

    if (!nextDefinition) {
      selectedWorkflowDefinitionId.value = null
      workflowDefinitionDetail.value = null
      return
    }

    if (nextDefinitionId === selectedWorkflowDefinitionId.value) {
      workflowDefinitionDetail.value = nextDefinition
      return
    }

    await selectWorkflowDefinition(nextDefinition)
  },
  {
    immediate: true,
  },
)

const isRecoverableAuthError = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes("[AUTH_REFRESH_TOKEN_REQUIRED]") ||
    error.message.includes("[AUTH_REFRESH_TOKEN_INVALID]") ||
    error.message.includes("[AUTH_REFRESH_TOKEN_EXPIRED]") ||
    error.message.includes("[AUTH_ACCESS_TOKEN_REQUIRED]") ||
    error.message.includes("[AUTH_ACCESS_TOKEN_INVALID]"))

const resetCustomerActions = () => {
  editingId.value = null
  deleteConfirmId.value = null
}

const clearDictionaryOptions = () => {
  dictionaryTypes.value = []
  dictionaryItems.value = []
  dictionaryTypeDetail.value = null
  selectedDictionaryTypeId.value = null
  dictionaryErrorMessage.value = ""
  dictionaryDetailErrorMessage.value = ""
  dictionaryPanelMode.value = "detail"
  resetDictionaryPanelInputs()
}

const clearNotificationWorkspace = () => {
  notificationItems.value = []
  notificationDetail.value = null
  selectedNotificationId.value = null
  notificationErrorMessage.value = ""
  notificationDetailErrorMessage.value = ""
  notificationPanelMode.value = "detail"
  resetNotificationPanelInputs()
}

const clearWorkflowDefinitions = () => {
  workflowDefinitions.value = []
  selectedWorkflowDefinitionId.value = null
  workflowDefinitionDetail.value = null
  workflowDetailErrorMessage.value = ""
}

const resetUserPanelInputs = () => {
  userCreateForm.value = createDefaultUserDraft()
  userEditForm.value = createDefaultUserDraft()
  userPasswordInput.value = ""
}

const resetDictionaryPanelInputs = () => {
  dictionaryCreateForm.value = createDefaultDictionaryTypeDraft()
  dictionaryEditForm.value = createDefaultDictionaryTypeDraft()
}

const resetNotificationPanelInputs = () => {
  notificationCreateForm.value = createDefaultNotificationDraft()
}

const resetDepartmentPanelInputs = () => {
  departmentCreateForm.value = createDefaultDepartmentDraft()
  departmentEditForm.value = createDefaultDepartmentDraft()
}

const resetMenuPanelInputs = () => {
  menuCreateForm.value = createDefaultMenuDraft()
  menuEditForm.value = createDefaultMenuDraft()
}

const resetRolePanelInputs = () => {
  roleCreateForm.value = createDefaultRoleDraft()
  roleEditForm.value = createDefaultRoleDraft()
}

const resetSettingPanelInputs = () => {
  settingCreateForm.value = createDefaultSettingDraft()
  settingEditForm.value = createDefaultSettingDraft()
}

const clearDepartmentWorkspace = () => {
  departmentItems.value = []
  departmentDetail.value = null
  selectedDepartmentId.value = null
  departmentErrorMessage.value = ""
  departmentDetailErrorMessage.value = ""
  departmentPanelMode.value = "detail"
  resetDepartmentPanelInputs()
}

const clearMenuWorkspace = () => {
  menuItems.value = []
  menuDetail.value = null
  selectedMenuId.value = null
  menuErrorMessage.value = ""
  menuDetailErrorMessage.value = ""
  menuPanelMode.value = "detail"
  resetMenuPanelInputs()
}

const clearOperationLogWorkspace = () => {
  operationLogItems.value = []
  operationLogDetail.value = null
  selectedOperationLogId.value = null
  operationLogErrorMessage.value = ""
  operationLogDetailErrorMessage.value = ""
}

const clearRoleWorkspace = () => {
  roleItems.value = []
  roleDetail.value = null
  selectedRoleId.value = null
  roleErrorMessage.value = ""
  roleDetailErrorMessage.value = ""
  rolePanelMode.value = "detail"
  resetRolePanelInputs()
}

const clearSettingWorkspace = () => {
  settingItems.value = []
  settingDetail.value = null
  selectedSettingId.value = null
  settingErrorMessage.value = ""
  settingDetailErrorMessage.value = ""
  settingPanelMode.value = "detail"
  resetSettingPanelInputs()
}

const clearUserWorkspace = () => {
  userItems.value = []
  selectedUserId.value = null
  userErrorMessage.value = ""
  userPanelMode.value = "detail"
  resetUserPanelInputs()
}

const selectWorkflowDefinition = async (
  definition: WorkflowDefinitionRecord,
) => {
  currentShellTabKey.value = "workspace"
  selectedWorkflowDefinitionId.value = definition.id
  workflowDefinitionDetail.value = definition
  workflowDetailLoading.value = true
  workflowDetailErrorMessage.value = ""

  try {
    workflowDefinitionDetail.value = await fetchWorkflowDefinitionById(
      definition.id,
    )
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    workflowDetailErrorMessage.value =
      error instanceof Error
        ? error.message
        : t("app.error.loadWorkflowDefinitions")
  } finally {
    workflowDetailLoading.value = false
  }
}

const reloadWorkflowDefinitions = async () => {
  if (!canViewWorkflowDefinitions.value) {
    clearWorkflowDefinitions()
    return
  }

  workflowLoading.value = true
  workflowErrorMessage.value = ""
  workflowDetailErrorMessage.value = ""

  try {
    const payload = await fetchWorkflowDefinitions()
    workflowDefinitions.value = payload.items

    if (payload.items.length === 0) {
      selectedWorkflowDefinitionId.value = null
      workflowDefinitionDetail.value = null
      return
    }

    const nextDefinition =
      payload.items.find(
        (definition) => definition.id === selectedWorkflowDefinitionId.value,
      ) ?? payload.items[0]

    if (nextDefinition) {
      await selectWorkflowDefinition(nextDefinition)
    }
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    clearWorkflowDefinitions()
    workflowErrorMessage.value =
      error instanceof Error
        ? error.message
        : t("app.error.loadWorkflowDefinitions")
  } finally {
    workflowLoading.value = false
  }
}

const selectNotification = async (notification: NotificationRecord) => {
  currentShellTabKey.value = "workspace"
  selectedNotificationId.value = notification.id
  notificationDetail.value = notification
  notificationDetailLoading.value = true
  notificationDetailErrorMessage.value = ""

  try {
    notificationDetail.value = await fetchNotificationById(notification.id)
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    notificationDetailErrorMessage.value =
      error instanceof Error
        ? error.message
        : t("app.error.loadNotificationDetail")
  } finally {
    notificationDetailLoading.value = false
  }
}

const reloadNotifications = async () => {
  if (!canViewNotifications.value) {
    clearNotificationWorkspace()
    return
  }

  notificationLoading.value = true
  notificationErrorMessage.value = ""
  notificationDetailErrorMessage.value = ""

  try {
    const payload = await fetchNotifications(notificationListQuery.value)
    notificationItems.value = payload.items

    if (payload.items.length === 0) {
      selectedNotificationId.value = null
      notificationDetail.value = null

      if (canCreateNotifications.value) {
        notificationPanelMode.value = "create"
      }

      return
    }

    if (
      selectedNotificationId.value &&
      !payload.items.some((item) => item.id === selectedNotificationId.value)
    ) {
      selectedNotificationId.value = payload.items[0]?.id ?? null
    }

    if (notificationPanelMode.value !== "create") {
      const nextNotification =
        payload.items.find(
          (item) => item.id === selectedNotificationId.value,
        ) ?? payload.items[0]

      if (nextNotification) {
        await selectNotification(nextNotification)
      }
    }
  } catch (error) {
    clearNotificationWorkspace()

    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    notificationErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadNotifications")
  } finally {
    notificationLoading.value = false
  }
}

const openCreatePanel = () => {
  if (!canCreateCustomers.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  resetCustomerActions()
  customerForm.value = createDefaultCustomerDraft()
  selectedCustomerId.value = null
  enterpriseFormMode.value = "create"
}

const focusCustomer = (customer: CustomerRecord) => {
  currentShellTabKey.value = "workspace"
  selectedCustomerId.value = customer.id
  resetCustomerActions()
  enterpriseFormMode.value = "detail"
}

const reloadDictionaries = async () => {
  if (!canViewDictionaries.value) {
    clearDictionaryOptions()
    return
  }

  dictionaryLoading.value = true
  dictionaryErrorMessage.value = ""

  try {
    const [typePayload, itemPayload] = await Promise.all([
      fetchDictionaryTypes(),
      fetchDictionaryItems(),
    ])

    dictionaryTypes.value = typePayload.items
    dictionaryItems.value = itemPayload.items

    if (typePayload.items.length === 0) {
      dictionaryItems.value = []
      selectedDictionaryTypeId.value = null
      dictionaryTypeDetail.value = null

      if (canCreateDictionaryTypes.value) {
        dictionaryPanelMode.value = "create"
      }

      return
    }

    if (
      selectedDictionaryTypeId.value &&
      !typePayload.items.some(
        (type) => type.id === selectedDictionaryTypeId.value,
      )
    ) {
      selectedDictionaryTypeId.value = typePayload.items[0]?.id ?? null
    }

    if (dictionaryPanelMode.value !== "create") {
      const nextType =
        typePayload.items.find(
          (type) => type.id === selectedDictionaryTypeId.value,
        ) ?? typePayload.items[0]

      if (nextType) {
        await selectDictionaryType(nextType)
      }
    }
  } catch (error) {
    clearDictionaryOptions()

    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
    dictionaryErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadDictionaries")
  } finally {
    dictionaryLoading.value = false
  }
}

const selectDictionaryType = async (type: DictionaryTypeRecord) => {
  currentShellTabKey.value = "workspace"
  selectedDictionaryTypeId.value = type.id
  dictionaryTypeDetail.value = null
  dictionaryDetailLoading.value = true
  dictionaryDetailErrorMessage.value = ""

  try {
    dictionaryTypeDetail.value = await fetchDictionaryTypeById(type.id)
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    dictionaryDetailErrorMessage.value =
      error instanceof Error
        ? error.message
        : t("app.error.loadDictionaryDetail")
  } finally {
    dictionaryDetailLoading.value = false
  }
}

const restoreSession = async () => {
  if (!authModuleReady.value) {
    authIdentity.value = null
    authErrorMessage.value = ""
    return
  }

  authLoading.value = true
  authErrorMessage.value = ""

  try {
    authIdentity.value = await refreshAuth()
  } catch (error) {
    clearAccessToken()
    authIdentity.value = null

    if (!isRecoverableAuthError(error)) {
      authErrorMessage.value =
        error instanceof Error ? error.message : t("app.error.restoreSession")
    }
  } finally {
    authLoading.value = false
  }
}

const reloadCustomers = async () => {
  if (!canViewCustomers.value) {
    customerItems.value = []
    customerListPage.value = 1
    customerListTotal.value = 0
    customerListTotalPages.value = 1
    selectedCustomerId.value = null
    resetCustomerActions()

    if (canCreateCustomers.value) {
      enterpriseFormMode.value = "create"
    }

    return
  }

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    const payload = await fetchCustomers(
      buildCustomerListQuery(
        enterpriseQueryValues.value,
        customerListPage.value,
      ),
    )
    customerItems.value = payload.items
    customerListPage.value = payload.page
    customerListTotal.value = payload.total
    customerListTotalPages.value = payload.totalPages

    if (
      selectedCustomerId.value &&
      !payload.items.some((item) => item.id === selectedCustomerId.value)
    ) {
      selectedCustomerId.value = payload.items[0]?.id ?? null
    }

    if (payload.items.length === 0 && enterpriseFormMode.value !== "create") {
      resetCustomerActions()
      selectedCustomerId.value = null
    }

    if (enterpriseFormMode.value === "create" && !canCreateCustomers.value) {
      enterpriseFormMode.value = "detail"
    }
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    customerErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadCustomers")
  } finally {
    customerLoading.value = false
  }
}

const selectDepartment = async (department: DepartmentRecord) => {
  currentShellTabKey.value = "workspace"
  selectedDepartmentId.value = department.id
  departmentPanelMode.value = "detail"
  departmentDetail.value = null
  departmentDetailLoading.value = true
  departmentDetailErrorMessage.value = ""

  try {
    departmentDetail.value = await fetchDepartmentById(department.id)
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    departmentDetailErrorMessage.value =
      error instanceof Error
        ? error.message
        : t("app.error.loadDepartmentDetail")
  } finally {
    departmentDetailLoading.value = false
  }
}

const selectMenu = async (menu: MenuRecord) => {
  currentShellTabKey.value = "workspace"
  selectedMenuId.value = menu.id
  menuPanelMode.value = "detail"
  menuDetail.value = null
  menuDetailLoading.value = true
  menuDetailErrorMessage.value = ""

  try {
    menuDetail.value = await fetchMenuById(menu.id)
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    menuDetailErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadMenuDetail")
  } finally {
    menuDetailLoading.value = false
  }
}

const selectOperationLog = async (item: OperationLogRecord) => {
  currentShellTabKey.value = "workspace"
  selectedOperationLogId.value = item.id
  operationLogDetail.value = null
  operationLogDetailLoading.value = true
  operationLogDetailErrorMessage.value = ""

  try {
    operationLogDetail.value = await fetchOperationLogById(item.id)
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    operationLogDetailErrorMessage.value =
      error instanceof Error
        ? error.message
        : t("app.error.loadOperationLogDetail")
  } finally {
    operationLogDetailLoading.value = false
  }
}

const reloadDepartments = async () => {
  if (!canViewDepartments.value) {
    clearDepartmentWorkspace()
    return
  }

  departmentLoading.value = true
  departmentErrorMessage.value = ""

  try {
    const payload = await fetchDepartments()
    departmentItems.value = payload.items

    if (payload.items.length === 0) {
      selectedDepartmentId.value = null
      departmentDetail.value = null

      if (canCreateDepartments.value) {
        departmentPanelMode.value = "create"
      }

      return
    }

    if (departmentPanelMode.value !== "detail") {
      if (
        selectedDepartmentId.value &&
        !payload.items.some((item) => item.id === selectedDepartmentId.value)
      ) {
        selectedDepartmentId.value = payload.items[0]?.id ?? null
      }

      return
    }

    const nextDepartment =
      payload.items.find((item) => item.id === selectedDepartmentId.value) ??
      payload.items[0]

    if (nextDepartment) {
      await selectDepartment(nextDepartment)
    }
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    clearDepartmentWorkspace()
    departmentErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadDepartments")
  } finally {
    departmentLoading.value = false
  }
}

const reloadMenus = async () => {
  if (!canViewMenus.value) {
    clearMenuWorkspace()
    return
  }

  menuLoading.value = true
  menuErrorMessage.value = ""

  try {
    const payload = await fetchMenus()
    menuItems.value = payload.items

    if (payload.items.length === 0) {
      selectedMenuId.value = null
      menuDetail.value = null

      if (canCreateMenus.value) {
        menuPanelMode.value = "create"
      }

      return
    }

    if (menuPanelMode.value !== "detail") {
      if (
        selectedMenuId.value &&
        !payload.items.some((item) => item.id === selectedMenuId.value)
      ) {
        selectedMenuId.value = payload.items[0]?.id ?? null
      }

      return
    }

    const nextMenu =
      payload.items.find((item) => item.id === selectedMenuId.value) ??
      payload.items[0]

    if (nextMenu) {
      await selectMenu(nextMenu)
    }
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    clearMenuWorkspace()
    menuErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadMenus")
  } finally {
    menuLoading.value = false
  }
}

const reloadOperationLogs = async () => {
  if (!canViewOperationLogs.value) {
    clearOperationLogWorkspace()
    return
  }

  operationLogLoading.value = true
  operationLogErrorMessage.value = ""

  try {
    const payload = await fetchOperationLogs(operationLogListQuery.value)
    operationLogItems.value = payload.items

    if (payload.items.length === 0) {
      selectedOperationLogId.value = null
      operationLogDetail.value = null
      return
    }

    const nextItem =
      payload.items.find((item) => item.id === selectedOperationLogId.value) ??
      payload.items[0]

    if (nextItem) {
      await selectOperationLog(nextItem)
    }
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    clearOperationLogWorkspace()
    operationLogErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadOperationLogs")
  } finally {
    operationLogLoading.value = false
  }
}

const selectSetting = async (setting: SettingRecord) => {
  currentShellTabKey.value = "workspace"
  selectedSettingId.value = setting.id
  settingPanelMode.value = "detail"
  settingDetail.value = null
  settingDetailLoading.value = true
  settingDetailErrorMessage.value = ""

  try {
    settingDetail.value = await fetchSettingById(setting.id)
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    settingDetailErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadSettingDetail")
  } finally {
    settingDetailLoading.value = false
  }
}

const reloadSettings = async () => {
  if (!canViewSettings.value) {
    clearSettingWorkspace()
    return
  }

  settingLoading.value = true
  settingErrorMessage.value = ""

  try {
    const payload = await fetchSettings()
    settingItems.value = payload.items

    if (payload.items.length === 0) {
      selectedSettingId.value = null
      settingDetail.value = null

      if (canCreateSettings.value) {
        settingPanelMode.value = "create"
      }

      return
    }

    if (settingPanelMode.value !== "detail") {
      if (
        selectedSettingId.value &&
        !payload.items.some((item) => item.id === selectedSettingId.value)
      ) {
        selectedSettingId.value = payload.items[0]?.id ?? null
      }

      return
    }

    const nextSetting =
      payload.items.find((item) => item.id === selectedSettingId.value) ??
      payload.items[0]

    if (nextSetting) {
      await selectSetting(nextSetting)
    }
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    clearSettingWorkspace()
    settingErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadSettings")
  } finally {
    settingLoading.value = false
  }
}

const reloadUsers = async () => {
  if (!canViewUsers.value) {
    clearUserWorkspace()
    return
  }

  userLoading.value = true
  userErrorMessage.value = ""

  try {
    const payload = await fetchUsers()
    userItems.value = payload.items

    if (
      selectedUserId.value &&
      !payload.items.some((item) => item.id === selectedUserId.value)
    ) {
      selectedUserId.value = payload.items[0]?.id ?? null
    }
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    clearUserWorkspace()
    userErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadUsers")
  } finally {
    userLoading.value = false
  }
}

const selectRole = async (role: RoleRecord) => {
  currentShellTabKey.value = "workspace"
  selectedRoleId.value = role.id
  rolePanelMode.value = "detail"
  roleDetail.value = null
  roleDetailLoading.value = true
  roleDetailErrorMessage.value = ""

  try {
    roleDetail.value = await fetchRoleById(role.id)
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    roleDetailErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadRoleDetail")
  } finally {
    roleDetailLoading.value = false
  }
}

const reloadRoles = async () => {
  if (!canViewRoles.value) {
    clearRoleWorkspace()
    return
  }

  roleLoading.value = true
  roleErrorMessage.value = ""

  try {
    const payload = await fetchRoles()
    roleItems.value = payload.items

    if (payload.items.length === 0) {
      selectedRoleId.value = null
      roleDetail.value = null

      if (canCreateRoles.value) {
        rolePanelMode.value = "create"
      }

      return
    }

    if (rolePanelMode.value !== "detail") {
      if (
        selectedRoleId.value &&
        !payload.items.some((item) => item.id === selectedRoleId.value)
      ) {
        selectedRoleId.value = payload.items[0]?.id ?? null
      }

      return
    }

    const nextRole =
      payload.items.find((item) => item.id === selectedRoleId.value) ??
      payload.items[0]

    if (nextRole) {
      await selectRole(nextRole)
    }
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    clearRoleWorkspace()
    roleErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadRoles")
  } finally {
    roleLoading.value = false
  }
}

const submitLogin = async () => {
  if (!authModuleReady.value || authLoading.value) {
    return
  }

  authLoading.value = true
  authErrorMessage.value = ""

  try {
    authIdentity.value = await login(loginForm.value)
    await reloadNotifications()
    await reloadDictionaries()
    await reloadCustomers()
    await reloadDepartments()
    await reloadMenus()
    await reloadOperationLogs()
    await reloadRoles()
    await reloadSettings()
    await reloadUsers()
    await reloadWorkflowDefinitions()
  } catch (error) {
    authIdentity.value = null
    authErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.signIn")
  } finally {
    authLoading.value = false
  }
}

const submitLogout = async () => {
  if (!authModuleReady.value || authLoading.value) {
    return
  }

  authLoading.value = true
  authErrorMessage.value = ""

  try {
    await logout()
  } catch (error) {
    authErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.signOut")
  } finally {
    authIdentity.value = null
    clearAccessToken()
    clearDictionaryOptions()
    clearNotificationWorkspace()
    customerItems.value = []
    clearDepartmentWorkspace()
    clearMenuWorkspace()
    clearOperationLogWorkspace()
    clearRoleWorkspace()
    clearSettingWorkspace()
    clearUserWorkspace()
    clearWorkflowDefinitions()
    selectedCustomerId.value = null
    enterpriseFormMode.value = "create"
    departmentQueryValues.value = {}
    menuQueryValues.value = {}
    operationLogQueryValues.value = {}
    roleQueryValues.value = {}
    settingQueryValues.value = {}
    userQueryValues.value = {}
    notificationQueryValues.value = {}
    resetCustomerActions()
    authLoading.value = false
  }
}

const submitCustomerForm = async (values: ElyFormValues) => {
  if (!canCreateCustomers.value || customerLoading.value) {
    return
  }

  const payload = {
    name: normalizeCustomerName(values.name),
    status: normalizeCustomerStatus(values.status),
  }

  if (payload.name.length === 0) {
    customerErrorMessage.value = t("app.error.customerNameRequired")
    return
  }

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    const created = await createCustomer(payload)
    customerForm.value = createDefaultCustomerDraft()
    customerListPage.value = 1
    selectedCustomerId.value = created.id
    enterpriseFormMode.value = "detail"
    await reloadCustomers()
  } catch (error) {
    customerErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.createCustomer")
  } finally {
    customerLoading.value = false
  }
}

const startEdit = (customer: CustomerRecord) => {
  if (!canUpdateCustomers.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedCustomerId.value = customer.id
  deleteConfirmId.value = null
  editingId.value = customer.id
  editForm.value = {
    name: customer.name,
    status: customer.status,
  }
  enterpriseFormMode.value = "edit"
}

const cancelEdit = () => {
  editingId.value = null
  if (selectedCustomer.value) {
    enterpriseFormMode.value = "detail"
  }
}

const submitEditForm = async (values: ElyFormValues) => {
  if (!editingId.value || customerLoading.value || !canUpdateCustomers.value) {
    return
  }

  const payload = {
    name: normalizeCustomerName(values.name),
    status: normalizeCustomerStatus(values.status),
  }

  if (payload.name.length === 0) {
    customerErrorMessage.value = t("app.error.customerNameRequired")
    return
  }

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    const updated = await updateCustomer(editingId.value, payload)
    editingId.value = null
    selectedCustomerId.value = updated.id
    enterpriseFormMode.value = "detail"
    await reloadCustomers()
  } catch (error) {
    customerErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.updateCustomer")
  } finally {
    customerLoading.value = false
  }
}

const requestDelete = (customer: CustomerRecord) => {
  if (!canDeleteCustomers.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedCustomerId.value = customer.id
  editingId.value = null
  deleteConfirmId.value = customer.id
  enterpriseFormMode.value = "detail"
}

const cancelDelete = () => {
  deleteConfirmId.value = null
}

const confirmDelete = async () => {
  if (
    !deleteConfirmId.value ||
    customerLoading.value ||
    !canDeleteCustomers.value
  ) {
    return
  }

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    await deleteCustomer(deleteConfirmId.value)
    if (selectedCustomerId.value === deleteConfirmId.value) {
      selectedCustomerId.value = null
    }
    deleteConfirmId.value = null
    await reloadCustomers()
  } catch (error) {
    customerErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.deleteCustomer")
  } finally {
    customerLoading.value = false
  }
}

const handleEnterpriseSearch = async (values: ElyQueryValues) => {
  enterpriseQueryValues.value = values
  customerListPage.value = 1
  await reloadCustomers()
}

const handleEnterpriseReset = async () => {
  enterpriseQueryValues.value = {}
  customerListPage.value = 1
  await reloadCustomers()
}

const handleNotificationSearch = async (values: ElyQueryValues) => {
  notificationQueryValues.value = values
  await reloadNotifications()
}

const handleNotificationReset = async () => {
  notificationQueryValues.value = {}
  await reloadNotifications()
}

const handleDictionarySearch = (values: ElyQueryValues) => {
  dictionaryQueryValues.value = values
}

const handleDictionaryReset = () => {
  dictionaryQueryValues.value = {}
}

const handleDepartmentSearch = (values: ElyQueryValues) => {
  departmentQueryValues.value = values
}

const handleDepartmentReset = () => {
  departmentQueryValues.value = {}
}

const handleMenuSearch = (values: ElyQueryValues) => {
  menuQueryValues.value = values
}

const handleMenuReset = () => {
  menuQueryValues.value = {}
}

const handleOperationLogSearch = async (values: ElyQueryValues) => {
  operationLogQueryValues.value = values
  await reloadOperationLogs()
}

const handleOperationLogReset = async () => {
  operationLogQueryValues.value = {}
  await reloadOperationLogs()
}

const openNotificationCreatePanel = () => {
  if (!canCreateNotifications.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedNotificationId.value = null
  notificationDetail.value = null
  notificationErrorMessage.value = ""
  notificationDetailErrorMessage.value = ""
  resetNotificationPanelInputs()
  notificationPanelMode.value = "create"
}

const openDictionaryCreatePanel = () => {
  if (!canCreateDictionaryTypes.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedDictionaryTypeId.value = null
  dictionaryTypeDetail.value = null
  dictionaryErrorMessage.value = ""
  dictionaryDetailErrorMessage.value = ""
  resetDictionaryPanelInputs()
  dictionaryPanelMode.value = "create"
}

const openDepartmentCreatePanel = () => {
  if (!canCreateDepartments.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedDepartmentId.value = null
  departmentDetail.value = null
  departmentErrorMessage.value = ""
  departmentDetailErrorMessage.value = ""
  resetDepartmentPanelInputs()
  departmentPanelMode.value = "create"
}

const openMenuCreatePanel = () => {
  if (!canCreateMenus.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedMenuId.value = null
  menuDetail.value = null
  menuErrorMessage.value = ""
  menuDetailErrorMessage.value = ""
  resetMenuPanelInputs()
  menuPanelMode.value = "create"
}

const startDepartmentEdit = (
  department: DepartmentRecord | DepartmentDetailRecord,
) => {
  if (!canUpdateDepartments.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedDepartmentId.value = department.id
  departmentErrorMessage.value = ""
  departmentDetailErrorMessage.value = ""
  departmentEditForm.value = {
    parentId: department.parentId ?? "",
    code: department.code,
    name: department.name,
    sort: department.sort,
    status: department.status,
  }
  departmentPanelMode.value = "edit"
}

const startDictionaryEdit = (
  dictionaryType: DictionaryTypeRecord | DictionaryTypeDetailRecord,
) => {
  if (!canUpdateDictionaryTypes.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedDictionaryTypeId.value = dictionaryType.id
  dictionaryErrorMessage.value = ""
  dictionaryDetailErrorMessage.value = ""
  dictionaryEditForm.value = {
    code: dictionaryType.code,
    name: dictionaryType.name,
    description: dictionaryType.description ?? "",
    status: dictionaryType.status,
  }
  dictionaryPanelMode.value = "edit"
}

const startMenuEdit = (menu: MenuRecord | MenuDetailRecord) => {
  if (!canUpdateMenus.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedMenuId.value = menu.id
  menuErrorMessage.value = ""
  menuDetailErrorMessage.value = ""
  menuEditForm.value = {
    parentId: menu.parentId ?? "",
    type: menu.type,
    code: menu.code,
    name: menu.name,
    path: menu.path ?? "",
    component: menu.component ?? "",
    icon: menu.icon ?? "",
    sort: menu.sort,
    isVisible: menu.isVisible,
    status: menu.status,
    permissionCode: menu.permissionCode ?? "",
  }
  menuPanelMode.value = "edit"
}

const cancelDepartmentPanel = () => {
  departmentErrorMessage.value = ""

  if (selectedDepartment.value) {
    departmentPanelMode.value = "detail"
    return
  }

  if (canCreateDepartments.value) {
    departmentPanelMode.value = "create"
    return
  }

  departmentPanelMode.value = "detail"
}

const cancelNotificationPanel = () => {
  notificationErrorMessage.value = ""

  if (selectedNotification.value) {
    notificationPanelMode.value = "detail"
    return
  }

  if (canCreateNotifications.value) {
    notificationPanelMode.value = "create"
    return
  }

  notificationPanelMode.value = "detail"
}

const cancelDictionaryPanel = () => {
  dictionaryErrorMessage.value = ""

  if (selectedDictionaryType.value) {
    dictionaryPanelMode.value = "detail"
    return
  }

  if (canCreateDictionaryTypes.value) {
    dictionaryPanelMode.value = "create"
    return
  }

  dictionaryPanelMode.value = "detail"
}

const cancelMenuPanel = () => {
  menuErrorMessage.value = ""

  if (selectedMenu.value) {
    menuPanelMode.value = "detail"
    return
  }

  if (canCreateMenus.value) {
    menuPanelMode.value = "create"
    return
  }

  menuPanelMode.value = "detail"
}

const submitNotificationForm = async (values: ElyFormValues) => {
  if (notificationLoading.value || notificationDetailLoading.value) {
    return
  }

  const payload = {
    recipientUserId: normalizeNotificationText(values.recipientUserId),
    title: normalizeNotificationText(values.title),
    content: normalizeNotificationText(values.content),
    level: normalizeNotificationLevel(values.level),
  }

  if (payload.recipientUserId.length === 0) {
    notificationErrorMessage.value = t(
      "app.error.notificationRecipientRequired",
    )
    return
  }

  if (payload.title.length === 0) {
    notificationErrorMessage.value = t("app.error.notificationTitleRequired")
    return
  }

  if (payload.content.length === 0) {
    notificationErrorMessage.value = t("app.error.notificationContentRequired")
    return
  }

  notificationLoading.value = true
  notificationErrorMessage.value = ""

  try {
    const created = await createNotification(payload)
    selectedNotificationId.value = created.id
    notificationDetail.value = created
    notificationPanelMode.value = "detail"
    resetNotificationPanelInputs()
    await reloadNotifications()
  } catch (error) {
    notificationErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.createNotification")
  } finally {
    notificationLoading.value = false
  }
}

const submitDictionaryForm = async (values: ElyFormValues) => {
  if (dictionaryLoading.value || dictionaryDetailLoading.value) {
    return
  }

  const payload = {
    code: normalizeDictionaryText(values.code),
    name: normalizeDictionaryText(values.name),
    description: normalizeOptionalDictionaryText(values.description),
    status: normalizeDictionaryStatus(values.status),
  }

  if (payload.code.length === 0) {
    dictionaryErrorMessage.value = t("app.error.dictionaryCodeRequired")
    return
  }

  if (payload.name.length === 0) {
    dictionaryErrorMessage.value = t("app.error.dictionaryNameRequired")
    return
  }

  dictionaryLoading.value = true
  dictionaryErrorMessage.value = ""

  try {
    if (
      dictionaryPanelMode.value === "edit" &&
      selectedDictionaryTypeId.value
    ) {
      const updated = await updateDictionaryType(
        selectedDictionaryTypeId.value,
        payload,
      )
      selectedDictionaryTypeId.value = updated.id
      dictionaryTypeDetail.value = updated
      dictionaryPanelMode.value = "detail"
      await reloadDictionaries()
      return
    }

    if (!canCreateDictionaryTypes.value) {
      return
    }

    const created = await createDictionaryType(payload)
    selectedDictionaryTypeId.value = created.id
    dictionaryTypeDetail.value = created
    dictionaryPanelMode.value = "detail"
    resetDictionaryPanelInputs()
    await reloadDictionaries()
  } catch (error) {
    dictionaryErrorMessage.value =
      error instanceof Error
        ? error.message
        : dictionaryPanelMode.value === "edit"
          ? t("app.error.updateDictionary")
          : t("app.error.createDictionary")
  } finally {
    dictionaryLoading.value = false
  }
}

const submitDepartmentForm = async (values: ElyFormValues) => {
  if (departmentLoading.value || departmentDetailLoading.value) {
    return
  }

  const payload = {
    parentId: normalizeOptionalDepartmentId(values.parentId) ?? null,
    code: normalizeDepartmentText(values.code),
    name: normalizeDepartmentText(values.name),
    sort: normalizeDepartmentSort(values.sort),
    status: normalizeDepartmentStatus(values.status),
  }

  if (payload.code.length === 0) {
    departmentErrorMessage.value = t("app.error.departmentCodeRequired")
    return
  }

  if (payload.name.length === 0) {
    departmentErrorMessage.value = t("app.error.departmentNameRequired")
    return
  }

  departmentLoading.value = true
  departmentErrorMessage.value = ""

  try {
    if (departmentPanelMode.value === "edit" && selectedDepartmentId.value) {
      const updated = await updateDepartment(
        selectedDepartmentId.value,
        payload,
      )
      selectedDepartmentId.value = updated.id
      departmentDetail.value = updated
      departmentPanelMode.value = "detail"
      await reloadDepartments()
      return
    }

    if (!canCreateDepartments.value) {
      return
    }

    const created = await createDepartment(payload)
    selectedDepartmentId.value = created.id
    departmentDetail.value = created
    departmentPanelMode.value = "detail"
    resetDepartmentPanelInputs()
    await reloadDepartments()
  } catch (error) {
    departmentErrorMessage.value =
      error instanceof Error
        ? error.message
        : departmentPanelMode.value === "edit"
          ? t("app.error.updateDepartment")
          : t("app.error.createDepartment")
  } finally {
    departmentLoading.value = false
  }
}

const submitMenuForm = async (values: ElyFormValues) => {
  if (menuLoading.value || menuDetailLoading.value) {
    return
  }

  const payload = {
    parentId: normalizeOptionalMenuId(values.parentId) ?? null,
    type: normalizeMenuType(values.type),
    code: normalizeMenuText(values.code),
    name: normalizeMenuText(values.name),
    path: normalizeOptionalMenuText(values.path),
    component: normalizeOptionalMenuText(values.component),
    icon: normalizeOptionalMenuText(values.icon),
    sort: normalizeMenuSort(values.sort),
    isVisible: normalizeMenuBoolean(values.isVisible),
    status: normalizeMenuStatus(values.status),
    permissionCode: normalizeOptionalMenuText(values.permissionCode),
  }

  if (payload.code.length === 0) {
    menuErrorMessage.value = t("app.error.menuCodeRequired")
    return
  }

  if (payload.name.length === 0) {
    menuErrorMessage.value = t("app.error.menuNameRequired")
    return
  }

  menuLoading.value = true
  menuErrorMessage.value = ""

  try {
    if (menuPanelMode.value === "edit" && selectedMenuId.value) {
      const updated = await updateMenu(selectedMenuId.value, payload)
      selectedMenuId.value = updated.id
      menuDetail.value = updated
      menuPanelMode.value = "detail"
      await reloadMenus()
      return
    }

    if (!canCreateMenus.value) {
      return
    }

    const created = await createMenu(payload)
    selectedMenuId.value = created.id
    menuDetail.value = created
    menuPanelMode.value = "detail"
    resetMenuPanelInputs()
    await reloadMenus()
  } catch (error) {
    menuErrorMessage.value =
      error instanceof Error
        ? error.message
        : menuPanelMode.value === "edit"
          ? t("app.error.updateMenu")
          : t("app.error.createMenu")
  } finally {
    menuLoading.value = false
  }
}

const markSelectedNotificationAsRead = async () => {
  if (
    notificationLoading.value ||
    notificationDetailLoading.value ||
    !selectedNotification.value ||
    selectedNotification.value.status === "read" ||
    !canUpdateNotifications.value
  ) {
    return
  }

  notificationLoading.value = true
  notificationErrorMessage.value = ""

  try {
    const updated = await markNotificationAsRead(selectedNotification.value.id)
    notificationItems.value = notificationItems.value.map((notification) =>
      notification.id === updated.id ? updated : notification,
    )
    notificationDetail.value = updated
    await reloadNotifications()
  } catch (error) {
    notificationErrorMessage.value =
      error instanceof Error
        ? error.message
        : t("app.error.markNotificationRead")
  } finally {
    notificationLoading.value = false
  }
}

const handleNotificationRowClick = async (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const notification = filteredNotificationItems.value.find(
    (item) => item.id === rowId,
  )

  if (!notification) {
    return
  }

  await selectNotification(notification)
}

const handleDictionaryRowClick = async (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const dictionaryType = filteredDictionaryTypes.value.find(
    (item) => item.id === rowId,
  )

  if (!dictionaryType) {
    return
  }

  await selectDictionaryType(dictionaryType)
}

const handleDepartmentRowClick = async (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const department = filteredDepartmentItems.value.find(
    (item) => item.id === rowId,
  )

  if (!department) {
    return
  }

  await selectDepartment(department)
}

const handleMenuRowClick = async (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const menu = filteredMenuItems.value.find((item) => item.id === rowId)

  if (!menu) {
    return
  }

  await selectMenu(menu)
}

const handleOperationLogRowClick = async (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const operationLog = filteredOperationLogItems.value.find(
    (item) => item.id === rowId,
  )

  if (!operationLog) {
    return
  }

  await selectOperationLog(operationLog)
}

const handleUserSearch = (values: ElyQueryValues) => {
  userQueryValues.value = values
}

const handleUserReset = () => {
  userQueryValues.value = {}
}

const openRoleCreatePanel = () => {
  if (!canCreateRoles.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedRoleId.value = null
  roleDetail.value = null
  roleErrorMessage.value = ""
  roleDetailErrorMessage.value = ""
  resetRolePanelInputs()
  rolePanelMode.value = "create"
}

const startRoleEdit = (role: RoleRecord | RoleDetailRecord) => {
  if (!canUpdateRoles.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedRoleId.value = role.id
  roleErrorMessage.value = ""
  roleDetailErrorMessage.value = ""
  roleEditForm.value = {
    code: role.code,
    name: role.name,
    description: role.description ?? "",
    status: role.status,
    isSystem: role.isSystem,
    dataScope: role.dataScope,
  }
  rolePanelMode.value = "edit"
}

const cancelRolePanel = () => {
  roleErrorMessage.value = ""

  if (selectedRole.value) {
    rolePanelMode.value = "detail"
    return
  }

  if (canCreateRoles.value) {
    rolePanelMode.value = "create"
    return
  }

  rolePanelMode.value = "detail"
}

const submitRoleForm = async (values: ElyFormValues) => {
  if (roleLoading.value || roleDetailLoading.value) {
    return
  }

  const payload = {
    code: normalizeRoleText(values.code),
    name: normalizeRoleText(values.name),
    description: normalizeOptionalRoleText(values.description),
    status: normalizeRoleStatus(values.status),
    isSystem: normalizeRoleBoolean(values.isSystem),
    dataScope: normalizeRoleDataScope(values.dataScope),
  }

  if (payload.code.length === 0) {
    roleErrorMessage.value = t("app.error.roleCodeRequired")
    return
  }

  if (payload.name.length === 0) {
    roleErrorMessage.value = t("app.error.roleNameRequired")
    return
  }

  roleLoading.value = true
  roleErrorMessage.value = ""

  try {
    if (rolePanelMode.value === "edit" && selectedRoleId.value) {
      const updated = await updateRole(selectedRoleId.value, payload)
      selectedRoleId.value = updated.id
      roleDetail.value = updated
      rolePanelMode.value = "detail"
      await reloadRoles()
      return
    }

    if (!canCreateRoles.value) {
      return
    }

    const created = await createRole(payload)
    selectedRoleId.value = created.id
    roleDetail.value = created
    rolePanelMode.value = "detail"
    resetRolePanelInputs()
    await reloadRoles()
  } catch (error) {
    roleErrorMessage.value =
      error instanceof Error
        ? error.message
        : rolePanelMode.value === "edit"
          ? t("app.error.updateRole")
          : t("app.error.createRole")
  } finally {
    roleLoading.value = false
  }
}

const handleRoleSearch = (values: ElyQueryValues) => {
  roleQueryValues.value = values
}

const handleRoleReset = () => {
  roleQueryValues.value = {}
}

const handleSettingSearch = (values: ElyQueryValues) => {
  settingQueryValues.value = values
}

const handleSettingReset = () => {
  settingQueryValues.value = {}
}

const handleRoleRowClick = async (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const role = filteredRoleItems.value.find((item) => item.id === rowId)

  if (!role) {
    return
  }

  await selectRole(role)
}

const openSettingCreatePanel = () => {
  if (!canCreateSettings.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedSettingId.value = null
  settingDetail.value = null
  settingErrorMessage.value = ""
  settingDetailErrorMessage.value = ""
  resetSettingPanelInputs()
  settingPanelMode.value = "create"
}

const startSettingEdit = (setting: SettingRecord) => {
  if (!canUpdateSettings.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedSettingId.value = setting.id
  settingErrorMessage.value = ""
  settingDetailErrorMessage.value = ""
  settingEditForm.value = {
    key: setting.key,
    value: setting.value,
    description: setting.description ?? "",
    status: setting.status,
  }
  settingPanelMode.value = "edit"
}

const cancelSettingPanel = () => {
  settingErrorMessage.value = ""

  if (selectedSetting.value) {
    settingPanelMode.value = "detail"
    return
  }

  if (canCreateSettings.value) {
    settingPanelMode.value = "create"
    return
  }

  settingPanelMode.value = "detail"
}

const submitSettingForm = async (values: ElyFormValues) => {
  if (settingLoading.value || settingDetailLoading.value) {
    return
  }

  const payload = {
    key: normalizeSettingText(values.key),
    value: normalizeSettingText(values.value),
    description: normalizeOptionalSettingText(values.description),
    status: normalizeSettingStatus(values.status),
  }

  if (payload.key.length === 0) {
    settingErrorMessage.value = t("app.error.settingKeyRequired")
    return
  }

  if (payload.value.length === 0) {
    settingErrorMessage.value = t("app.error.settingValueRequired")
    return
  }

  settingLoading.value = true
  settingErrorMessage.value = ""

  try {
    if (settingPanelMode.value === "edit" && selectedSettingId.value) {
      const updated = await updateSetting(selectedSettingId.value, payload)
      selectedSettingId.value = updated.id
      settingDetail.value = updated
      settingPanelMode.value = "detail"
      await reloadSettings()
      return
    }

    if (!canCreateSettings.value) {
      return
    }

    const created = await createSetting(payload)
    selectedSettingId.value = created.id
    settingDetail.value = created
    settingPanelMode.value = "detail"
    resetSettingPanelInputs()
    await reloadSettings()
  } catch (error) {
    settingErrorMessage.value =
      error instanceof Error
        ? error.message
        : settingPanelMode.value === "edit"
          ? t("app.error.updateSetting")
          : t("app.error.createSetting")
  } finally {
    settingLoading.value = false
  }
}

const handleSettingRowClick = async (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const setting = filteredSettingItems.value.find((item) => item.id === rowId)

  if (!setting) {
    return
  }

  await selectSetting(setting)
}

const openUserCreatePanel = () => {
  if (!canCreateUsers.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedUserId.value = null
  userErrorMessage.value = ""
  resetUserPanelInputs()
  userPanelMode.value = "create"
}

const startUserEdit = (user: UserRecord) => {
  if (!canUpdateUsers.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedUserId.value = user.id
  userErrorMessage.value = ""
  userEditForm.value = {
    username: user.username,
    displayName: user.displayName,
    email: user.email ?? "",
    phone: user.phone ?? "",
    status: user.status,
    isSuperAdmin: user.isSuperAdmin,
  }
  userPasswordInput.value = ""
  userPanelMode.value = "edit"
}

const startUserPasswordReset = (user: UserRecord) => {
  if (!canResetUserPasswords.value) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedUserId.value = user.id
  userErrorMessage.value = ""
  userPasswordInput.value = ""
  userPanelMode.value = "reset"
}

const cancelUserPanel = () => {
  userErrorMessage.value = ""
  userPasswordInput.value = ""

  if (selectedUser.value) {
    userPanelMode.value = "detail"
    return
  }

  if (canCreateUsers.value) {
    userPanelMode.value = "create"
    return
  }

  userPanelMode.value = "detail"
}

const submitUserForm = async (values: ElyFormValues) => {
  if (userLoading.value) {
    return
  }

  const payload = {
    username: normalizeUserText(values.username),
    displayName: normalizeUserText(values.displayName),
    email: normalizeOptionalUserText(values.email),
    phone: normalizeOptionalUserText(values.phone),
    status: normalizeUserStatus(values.status),
    isSuperAdmin: normalizeUserBoolean(values.isSuperAdmin),
  }

  if (payload.username.length === 0) {
    userErrorMessage.value = t("app.error.userUsernameRequired")
    return
  }

  if (payload.displayName.length === 0) {
    userErrorMessage.value = t("app.error.userDisplayNameRequired")
    return
  }

  userLoading.value = true
  userErrorMessage.value = ""

  try {
    if (userPanelMode.value === "edit" && selectedUser.value) {
      const updated = await updateUser(selectedUser.value.id, payload)
      selectedUserId.value = updated.id
      userPanelMode.value = "detail"
      await reloadUsers()
      return
    }

    if (!canCreateUsers.value) {
      return
    }

    const password = normalizeUserText(userPasswordInput.value)

    if (password.length === 0) {
      userErrorMessage.value = t("app.error.userPasswordRequired")
      return
    }

    const created = await createUser({
      ...payload,
      password,
    })
    selectedUserId.value = created.id
    userPanelMode.value = "detail"
    resetUserPanelInputs()
    await reloadUsers()
  } catch (error) {
    userErrorMessage.value =
      error instanceof Error
        ? error.message
        : userPanelMode.value === "edit"
          ? t("app.error.updateUser")
          : t("app.error.createUser")
  } finally {
    userLoading.value = false
  }
}

const submitUserPasswordReset = async () => {
  if (
    !selectedUser.value ||
    userLoading.value ||
    !canResetUserPasswords.value
  ) {
    return
  }

  const password = normalizeUserText(userPasswordInput.value)

  if (password.length === 0) {
    userErrorMessage.value = t("app.error.userPasswordRequired")
    return
  }

  userLoading.value = true
  userErrorMessage.value = ""

  try {
    await resetUserPassword(selectedUser.value.id, password)
    userPasswordInput.value = ""
    userPanelMode.value = "detail"
    await reloadUsers()
  } catch (error) {
    userErrorMessage.value =
      error instanceof Error ? error.message : t("app.error.resetUserPassword")
  } finally {
    userLoading.value = false
  }
}

const handleCustomerPageSizeChange = async (value: number | string) => {
  const nextPageSize =
    typeof value === "number" ? value : Number.parseInt(value, 10)

  if (
    !Number.isFinite(nextPageSize) ||
    nextPageSize === customerListPageSize.value
  ) {
    return
  }

  customerListPageSize.value = nextPageSize
  customerListPage.value = 1
  await reloadCustomers()
}

const handleCustomerSortChange = async (value: string) => {
  if (
    value !== "createdAt:desc" &&
    value !== "createdAt:asc" &&
    value !== "name:asc" &&
    value !== "name:desc"
  ) {
    return
  }

  if (value === customerListSortValue.value) {
    return
  }

  customerListSortValue.value = value
  customerListPage.value = 1
  await reloadCustomers()
}

const handleEnterpriseAction = (key: string, row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const customer = customerItems.value.find((item) => item.id === rowId)

  if (!customer) {
    return
  }

  if (key === "update") {
    startEdit(customer)
    return
  }

  if (key === "delete") {
    requestDelete(customer)
  }
}

const handleEnterpriseRowClick = (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const customer = customerItems.value.find((item) => item.id === rowId)

  if (customer) {
    focusCustomer(customer)
  }
}

const handleUserRowClick = (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const user = filteredUserItems.value.find((item) => item.id === rowId)

  if (!user) {
    return
  }

  currentShellTabKey.value = "workspace"
  selectedUserId.value = user.id
  userErrorMessage.value = ""
  userPanelMode.value = "detail"
}

const handleWorkflowDefinitionSelect = async (definitionId: string) => {
  const definition = workflowDefinitions.value.find(
    (item) => item.id === definitionId,
  )

  if (!definition || workflowDetailLoading.value) {
    return
  }

  await selectWorkflowDefinition(definition)
}

const setWorkflowStatusFilter = (filter: WorkflowStatusFilter) => {
  workflowStatusFilter.value = filter
}

const resetWorkflowFilters = () => {
  workflowQuery.value = ""
  workflowStatusFilter.value = "all"
}

const handleShellMenuSelect = (menuKey: string) => {
  const currentItem = findNavigationItemById(
    enterpriseNavigation.value,
    menuKey,
  )

  if (!currentItem) {
    return
  }

  currentMenuKey.value =
    findFirstMenuItem(currentItem.children)?.id ?? currentItem.id
  currentShellTabKey.value = "workspace"
}

const handleShellTabSelect = (tabKey: string) => {
  if (tabKey !== "workspace" && tabKey !== "runtime") {
    return
  }

  currentShellTabKey.value = tabKey
}

const goToPreviousCustomerPage = async () => {
  if (!canGoToPreviousCustomerPage.value || customerLoading.value) {
    return
  }

  customerListPage.value -= 1
  await reloadCustomers()
}

const goToNextCustomerPage = async () => {
  if (!canGoToNextCustomerPage.value || customerLoading.value) {
    return
  }

  customerListPage.value += 1
  await reloadCustomers()
}

const goToFirstCustomerPage = async () => {
  if (!canGoToPreviousCustomerPage.value || customerLoading.value) {
    return
  }

  customerListPage.value = 1
  await reloadCustomers()
}

const goToLastCustomerPage = async () => {
  if (!canGoToNextCustomerPage.value || customerLoading.value) {
    return
  }

  customerListPage.value = customerListTotalPages.value
  await reloadCustomers()
}

const submitCustomerPageJump = async () => {
  if (!canJumpToCustomerPage.value || customerLoading.value) {
    customerPageInputValue.value = String(customerListPage.value)
    return
  }

  customerListPage.value = Number.parseInt(customerPageInputValue.value, 10)
  await reloadCustomers()
}

const handleEnterpriseFormSubmit = async (values: ElyFormValues) => {
  if (enterpriseFormMode.value === "edit") {
    await submitEditForm(values)
    return
  }

  await submitCustomerForm(values)
}

const handleEnterpriseFormCancel = () => {
  if (enterpriseFormMode.value === "edit") {
    cancelEdit()
    return
  }

  customerForm.value = createDefaultCustomerDraft()
}

onMounted(async () => {
  try {
    const [platformPayload, modulePayload] = await Promise.all([
      fetchPlatform(),
      fetchSystemModules(),
    ])

    platform.value = platformPayload
    envName.value = modulePayload.env
    registeredModuleCodes.value = modulePayload.modules
    authModuleReady.value = modulePayload.modules.includes("auth")
    customerModuleReady.value = modulePayload.modules.includes("customer")
    departmentModuleReady.value = modulePayload.modules.includes("department")
    menuModuleReady.value = modulePayload.modules.includes("menu")
    notificationModuleReady.value =
      modulePayload.modules.includes("notification")
    operationLogModuleReady.value =
      modulePayload.modules.includes("operation-log")
    roleModuleReady.value = modulePayload.modules.includes("role")
    settingModuleReady.value = modulePayload.modules.includes("setting")
    userModuleReady.value = modulePayload.modules.includes("user")
    dictionaryModuleReady.value = modulePayload.modules.includes("dictionary")
    workflowModuleReady.value = modulePayload.modules.includes("workflow")

    await restoreSession()
    await reloadNotifications()
    await reloadDictionaries()

    if (customerModuleReady.value) {
      if (authModuleReady.value) {
        enterpriseFormMode.value = "detail"
      } else {
        enterpriseFormMode.value = "create"
      }
    }

    await reloadCustomers()
    await reloadDepartments()
    await reloadMenus()
    await reloadOperationLogs()
    await reloadRoles()
    await reloadSettings()
    await reloadUsers()
    await reloadWorkflowDefinitions()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : t("app.error.loadPlatform")
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <TConfigProvider :global-config="tdesignGlobalConfig">
    <main class="app-shell min-h-screen px-5 py-6 text-stone-100 sm:px-8 lg:px-10">
      <div class="mx-auto flex max-w-7xl flex-col gap-6">
        <section class="hero-panel overflow-hidden px-6 py-8 lg:px-10">
          <div class="hero-grid grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="eyebrow text-cyan-300">{{ t("app.hero.eyebrow") }}</p>
                <div class="flex items-center gap-2">
                  <span class="text-xs uppercase tracking-[0.24em] text-stone-400">
                    {{ t("app.locale.label") }}
                  </span>
                  <button
                    v-for="option in localeOptions"
                    :key="option.key"
                    type="button"
                    class="token-pill token-pill-toggle"
                    :class="locale === option.key ? 'token-pill-active' : ''"
                    @click="localeRuntime.setLocale(option.key)"
                  >
                    {{ t(option.labelKey) }}
                  </button>
                </div>
              </div>
              <h1 class="hero-title mt-4 max-w-3xl text-4xl leading-tight lg:text-6xl">
                {{ t("app.hero.title") }}
              </h1>
              <p class="hero-copy mt-5 max-w-2xl text-base leading-8 text-stone-300">
                {{ t("app.hero.copy") }}
              </p>

              <div class="mt-6 flex flex-wrap gap-3">
                <span class="token-pill">{{ t("app.badge.custom") }}</span>
                <span class="token-pill token-pill-active">
                  {{ t("app.badge.enterprise") }}
                </span>
                <span class="token-pill">{{ t("app.shell.presetLabel") }}</span>
              </div>
            </div>

            <div class="hero-stats grid gap-4 sm:grid-cols-2">
              <article class="stat-card p-5">
                <p class="stat-label">{{ t("app.badge.runtime") }}</p>
                <p class="stat-value">
                  {{ platform?.manifest.runtime ?? t("app.loading.short") }}
                </p>
              </article>
              <article class="stat-card p-5">
                <p class="stat-label">{{ t("app.badge.enterprise") }}</p>
                <p class="stat-value">
                  {{ localizePlatformStatus(vueEnterprisePresetManifest.status) }}
                </p>
              </article>
              <article class="stat-card p-5">
                <p class="stat-label">{{ t("app.badge.auth") }}</p>
                <p class="stat-value" :class="authStatusTone">
                  {{ authStatusLabel }}
                </p>
              </article>
              <article class="stat-card p-5">
                <p class="stat-label">{{ t("app.badge.rows") }}</p>
                <p class="stat-value">{{ currentWorkspaceItemCount }}</p>
              </article>
            </div>
          </div>
        </section>

        <p v-if="loading" class="text-sm uppercase tracking-[0.28em] text-stone-400">
          {{ t("app.loading.workspace") }}
        </p>
        <p
          v-else-if="errorMessage"
          class="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-5 text-rose-200"
        >
          {{ errorMessage }}
        </p>

        <template v-else>
          <section class="content-panel p-3 lg:p-4">
              <div class="px-3 py-4 lg:px-4">
                <p class="eyebrow text-amber-300">{{ t("app.section.workspace") }}</p>
                <div class="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 class="text-3xl text-white">{{ currentWorkspaceSectionTitle }}</h2>
                    <p class="mt-3 max-w-3xl text-sm leading-7 text-stone-300">
                      {{ currentWorkspaceSectionCopy }}
                    </p>
                  </div>
                  <div
                    class="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.28em] text-stone-300"
                  >
                    {{ t("app.shell.presetLabel") }}
                  </div>
                </div>
              </div>

              <ElyShell
                :key="locale"
                :title="t('app.shell.title')"
                :subtitle="t('app.shell.subtitle')"
                :workspace-title="currentWorkspaceTitle"
                :workspace-description="currentWorkspaceDescription"
                :preset-label="t('app.shell.presetLabel')"
                :environment="envName"
                :status="
                  authModuleReady
                    ? t('app.shell.status.sessionAware')
                    : t('app.shell.status.preview')
                "
                :copy="enterpriseShellCopy"
                :navigation="enterpriseNavigation"
                :stats="enterpriseShellStats"
                :selected-menu-key="enterpriseSelectedMenuKey"
                :tabs="enterpriseShellTabs"
                :selected-tab-key="enterpriseSelectedTabKey"
                :user="enterpriseShellUser"
                @menu-select="handleShellMenuSelect"
                @tab-select="handleShellTabSelect"
              >
                <template #header-actions>
                  <TButton
                    v-if="isRoleWorkspace"
                    size="small"
                    theme="primary"
                    variant="outline"
                    :disabled="!canCreateRoles"
                    @click="openRoleCreatePanel"
                  >
                    {{ t("app.action.newRole") }}
                  </TButton>
                  <TButton
                    v-if="isRoleWorkspace"
                    size="small"
                    theme="default"
                    variant="outline"
                    :disabled="roleLoading || !canViewRoles"
                    @click="reloadRoles"
                  >
                    {{ t("app.action.refresh") }}
                  </TButton>
                  <TButton
                    v-if="isCustomerWorkspace"
                    size="small"
                    theme="primary"
                    variant="outline"
                    :disabled="!canCreateCustomers"
                    @click="openCreatePanel"
                  >
                    {{ t("app.action.newCustomer") }}
                  </TButton>
                  <TButton
                    v-if="isCustomerWorkspace"
                    size="small"
                    theme="default"
                    variant="outline"
                    :disabled="customerLoading || !canViewCustomers"
                    @click="reloadCustomers"
                  >
                    {{ t("app.action.refresh") }}
                  </TButton>
                  <TButton
                    v-if="isDictionaryWorkspace"
                    size="small"
                    theme="primary"
                    variant="outline"
                    :disabled="!canCreateDictionaryTypes"
                    @click="openDictionaryCreatePanel"
                  >
                    {{ t("app.action.newDictionaryType") }}
                  </TButton>
                  <TButton
                    v-if="isDictionaryWorkspace"
                    size="small"
                    theme="default"
                    variant="outline"
                    :disabled="dictionaryLoading || !canViewDictionaries"
                    @click="reloadDictionaries"
                  >
                    {{ t("app.action.refresh") }}
                  </TButton>
                  <TButton
                    v-if="isDepartmentWorkspace"
                    size="small"
                    theme="primary"
                    variant="outline"
                    :disabled="!canCreateDepartments"
                    @click="openDepartmentCreatePanel"
                  >
                    {{ t("app.action.newDepartment") }}
                  </TButton>
                  <TButton
                    v-if="isDepartmentWorkspace"
                    size="small"
                    theme="default"
                    variant="outline"
                    :disabled="departmentLoading || !canViewDepartments"
                    @click="reloadDepartments"
                  >
                    {{ t("app.action.refresh") }}
                  </TButton>
                  <TButton
                    v-if="isMenuWorkspace"
                    size="small"
                    theme="primary"
                    variant="outline"
                    :disabled="!canCreateMenus"
                    @click="openMenuCreatePanel"
                  >
                    {{ t("app.action.newMenu") }}
                  </TButton>
                  <TButton
                    v-if="isMenuWorkspace"
                    size="small"
                    theme="default"
                    variant="outline"
                    :disabled="menuLoading || !canViewMenus"
                    @click="reloadMenus"
                  >
                    {{ t("app.action.refresh") }}
                  </TButton>
                  <TButton
                    v-if="isNotificationWorkspace"
                    size="small"
                    theme="primary"
                    variant="outline"
                    :disabled="!canCreateNotifications"
                    @click="openNotificationCreatePanel"
                  >
                    {{ t("app.action.newNotification") }}
                  </TButton>
                  <TButton
                    v-if="isNotificationWorkspace"
                    size="small"
                    theme="default"
                    variant="outline"
                    :disabled="notificationLoading || !canViewNotifications"
                    @click="reloadNotifications"
                  >
                    {{ t("app.action.refresh") }}
                  </TButton>
                  <TButton
                    v-if="isOperationLogWorkspace"
                    size="small"
                    theme="default"
                    variant="outline"
                    :disabled="operationLogLoading || !canViewOperationLogs"
                    @click="reloadOperationLogs"
                  >
                    {{ t("app.action.refresh") }}
                  </TButton>
                  <TButton
                    v-if="isUserWorkspace"
                    size="small"
                    theme="primary"
                    variant="outline"
                    :disabled="!canCreateUsers"
                    @click="openUserCreatePanel"
                  >
                    {{ t("app.action.newUser") }}
                  </TButton>
                  <TButton
                    v-if="isSettingWorkspace"
                    size="small"
                    theme="primary"
                    variant="outline"
                    :disabled="!canCreateSettings"
                    @click="openSettingCreatePanel"
                  >
                    {{ t("app.action.newSetting") }}
                  </TButton>
                  <TButton
                    v-if="isSettingWorkspace"
                    size="small"
                    theme="default"
                    variant="outline"
                    :disabled="settingLoading || !canViewSettings"
                    @click="reloadSettings"
                  >
                    {{ t("app.action.refresh") }}
                  </TButton>
                  <TButton
                    v-if="isUserWorkspace"
                    size="small"
                    theme="default"
                    variant="outline"
                    :disabled="userLoading || !canViewUsers"
                    @click="reloadUsers"
                  >
                    {{ t("app.action.refresh") }}
                  </TButton>
                  <TButton
                    v-if="isWorkflowDefinitionsWorkspace"
                    size="small"
                    theme="default"
                    variant="outline"
                    :loading="workflowLoading"
                    :disabled="workflowLoading || !canViewWorkflowDefinitions"
                    @click="reloadWorkflowDefinitions"
                  >
                    {{ t("app.action.refresh") }}
                  </TButton>
                  <TButton
                    v-if="isAuthenticated"
                    size="small"
                    theme="default"
                    variant="text"
                    :disabled="authLoading"
                    @click="submitLogout"
                  >
                    {{ t("app.action.signOut") }}
                  </TButton>
                </template>

                <template #workspace>
                  <section
                    v-if="enterpriseSelectedTabKey === 'runtime'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <p class="enterprise-eyebrow">{{ t("app.runtime.eyebrow") }}</p>
                    <h3 class="enterprise-heading">{{ t("app.runtime.title") }}</h3>
                    <p class="enterprise-copy">
                      {{ t("app.runtime.copy") }}
                    </p>

                    <div class="enterprise-metadata mt-5">
                      <div>
                        <span>{{ t("app.runtime.currentPage") }}</span>
                        <strong>{{ selectedNavigationItem?.name }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.runtime.currentPath") }}</span>
                        <strong>{{ currentNavigationPath }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.runtime.moduleStatus") }}</span>
                        <strong>{{ currentModuleStatusLabel }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.runtime.permissions") }}</span>
                        <strong>{{ permissionCodes.length }}</strong>
                      </div>
                    </div>

                    <div class="mt-5">
                      <p class="enterprise-subheading">{{ t("app.runtime.nextStep") }}</p>
                      <ul class="enterprise-list">
                        <li>{{ t("app.runtime.step.navigation") }}</li>
                        <li>{{ t("app.runtime.step.workspace") }}</li>
                        <li>{{ t("app.runtime.step.owner") }}</li>
                      </ul>
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'workflow-definitions'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <p class="enterprise-eyebrow">{{ t("app.workflow.listEyebrow") }}</p>
                    <h3 class="enterprise-heading">{{ t("app.workflow.listTitle") }}</h3>
                    <p class="enterprise-copy">
                      {{ t("app.workflow.listDescription") }}
                    </p>

                    <div
                      v-if="!workflowModuleReady"
                      class="enterprise-message enterprise-message-warning mt-5"
                    >
                      {{ t("app.message.workflowModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-message enterprise-message-info mt-5"
                    >
                      {{ t("app.message.workflowSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterWorkflowWorkspace && !canViewWorkflowDefinitions"
                      class="enterprise-message enterprise-message-warning mt-5"
                    >
                      {{ t("app.message.workflowNoListPermission") }}
                    </div>

                    <div
                      v-else-if="workflowErrorMessage"
                      class="enterprise-message enterprise-message-danger mt-5"
                    >
                      {{ workflowErrorMessage }}
                    </div>

                    <div
                      v-else-if="workflowLoading"
                      class="enterprise-message enterprise-message-info mt-5"
                    >
                      {{ t("app.workflow.loading") }}
                    </div>

                    <div v-else class="mt-5 space-y-5">
                      <div class="workflow-filter-bar">
                        <label class="enterprise-field workflow-filter-search">
                          <span>{{ t("app.workflow.filter.searchLabel") }}</span>
                          <TInput
                            v-model="workflowQuery"
                            :placeholder="t('app.workflow.filter.searchPlaceholder')"
                            clearable
                          />
                        </label>

                        <div class="workflow-filter-panel">
                          <p class="enterprise-subheading">
                            {{ t("app.workflow.filter.statusTitle") }}
                          </p>
                          <div class="workflow-filter-pills">
                            <button
                              type="button"
                              class="workflow-filter-pill"
                              :class="
                                workflowStatusFilter === 'all'
                                  ? 'workflow-filter-pill-active'
                                  : ''
                              "
                              @click="setWorkflowStatusFilter('all')"
                            >
                              {{ t("app.workflow.filter.all") }}
                            </button>
                            <button
                              type="button"
                              class="workflow-filter-pill"
                              :class="
                                workflowStatusFilter === 'active'
                                  ? 'workflow-filter-pill-active'
                                  : ''
                              "
                              @click="setWorkflowStatusFilter('active')"
                            >
                              {{ t("app.workflow.filter.active") }}
                            </button>
                            <button
                              type="button"
                              class="workflow-filter-pill"
                              :class="
                                workflowStatusFilter === 'disabled'
                                  ? 'workflow-filter-pill-active'
                                  : ''
                              "
                              @click="setWorkflowStatusFilter('disabled')"
                            >
                              {{ t("app.workflow.filter.disabled") }}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div class="workflow-filter-summary">
                        <span class="enterprise-toolbar-pill">
                          {{ workflowFilterSummary }}
                        </span>
                        <button
                          v-if="
                            workflowQuery.trim().length > 0 ||
                            workflowStatusFilter !== 'all'
                          "
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          @click="resetWorkflowFilters"
                        >
                          {{ t("app.workflow.filter.reset") }}
                        </button>
                      </div>

                      <div
                        v-if="workflowDefinitionCards.length === 0"
                        class="enterprise-message enterprise-message-info"
                      >
                        {{
                          workflowDefinitions.length === 0
                            ? t("app.workflow.empty")
                            : t("app.workflow.emptyFiltered")
                        }}
                      </div>

                      <div v-else class="workflow-definition-list">
                        <button
                          v-for="definition in workflowDefinitionCards"
                          :key="definition.id"
                          type="button"
                          class="workflow-definition-card"
                          :class="
                            selectedWorkflowDefinitionId === definition.id
                              ? 'workflow-definition-card-active'
                              : ''
                          "
                          @click="handleWorkflowDefinitionSelect(definition.id)"
                        >
                          <div class="workflow-definition-card-header">
                            <div>
                              <strong>{{ definition.name }}</strong>
                              <p>{{ definition.key }}</p>
                            </div>
                            <span class="workflow-status-pill">
                              {{ definition.statusLabel }}
                            </span>
                          </div>

                          <div class="workflow-definition-card-meta">
                            <span>v{{ definition.version }}</span>
                            <span>
                              {{ definition.nodeCount }}
                              {{ t("app.workflow.meta.nodes") }}
                            </span>
                            <span>
                              {{ definition.edgeCount }}
                              {{ t("app.workflow.meta.edges") }}
                            </span>
                            <span>{{ definition.updatedAtLabel }}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'dictionary'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <div
                      v-if="!dictionaryModuleReady"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.dictionaryModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-message enterprise-message-info"
                    >
                      {{ t("app.message.dictionarySignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterDictionaryWorkspace && !canViewDictionaries"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.dictionaryNoListPermission") }}
                    </div>

                    <div
                      v-else-if="dictionaryErrorMessage"
                      class="enterprise-message enterprise-message-danger"
                    >
                      {{ dictionaryErrorMessage }}
                    </div>

                    <ElyCrudWorkspace
                      v-else
                      :eyebrow="t('app.dictionary.workspaceEyebrow')"
                      :title="t('app.dictionary.workspaceTitle')"
                      :description="t('app.dictionary.workspaceDescription')"
                      :query-fields="enterpriseDictionaryQueryFields"
                      :query-loading="dictionaryLoading"
                      :table-columns="enterpriseDictionaryTableColumns"
                      :items="enterpriseDictionaryTableItems"
                      :table-loading="dictionaryLoading"
                      :table-actions="[]"
                      :item-count-label="dictionaryCountLabel"
                      :empty-title="t('app.dictionary.emptyTitle')"
                      :empty-description="t('app.dictionary.emptyDescription')"
                      :copy="enterpriseCrudCopy"
                      @search="handleDictionarySearch"
                      @reset="handleDictionaryReset"
                      @row-click="handleDictionaryRowClick"
                    >
                      <template #toolbar>
                        <span class="enterprise-toolbar-pill">
                          {{ currentQuerySummary }}
                        </span>
                      </template>
                    </ElyCrudWorkspace>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'department'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <div
                      v-if="!departmentModuleReady"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.departmentModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-message enterprise-message-info"
                    >
                      {{ t("app.message.departmentSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterDepartmentWorkspace && !canViewDepartments"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.departmentNoListPermission") }}
                    </div>

                    <div
                      v-else-if="departmentErrorMessage"
                      class="enterprise-message enterprise-message-danger"
                    >
                      {{ departmentErrorMessage }}
                    </div>

                    <ElyCrudWorkspace
                      v-else
                      :eyebrow="t('app.department.workspaceEyebrow')"
                      :title="t('app.department.workspaceTitle')"
                      :description="t('app.department.workspaceDescription')"
                      :query-fields="enterpriseDepartmentQueryFields"
                      :query-loading="departmentLoading"
                      :table-columns="enterpriseDepartmentTableColumns"
                      :items="enterpriseDepartmentTableItems"
                      :table-loading="departmentLoading"
                      :table-actions="[]"
                      :item-count-label="departmentCountLabel"
                      :empty-title="t('app.department.emptyTitle')"
                      :empty-description="t('app.department.emptyDescription')"
                      :copy="enterpriseCrudCopy"
                      @search="handleDepartmentSearch"
                      @reset="handleDepartmentReset"
                      @row-click="handleDepartmentRowClick"
                    >
                      <template #toolbar>
                        <span class="enterprise-toolbar-pill">
                          {{ currentQuerySummary }}
                        </span>
                      </template>
                    </ElyCrudWorkspace>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'menu'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <div
                      v-if="!menuModuleReady"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.menuModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-message enterprise-message-info"
                    >
                      {{ t("app.message.menuSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterMenuWorkspace && !canViewMenus"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.menuNoListPermission") }}
                    </div>

                    <div
                      v-else-if="menuErrorMessage"
                      class="enterprise-message enterprise-message-danger"
                    >
                      {{ menuErrorMessage }}
                    </div>

                    <ElyCrudWorkspace
                      v-else
                      :eyebrow="t('app.menu.workspaceEyebrow')"
                      :title="t('app.menu.workspaceTitle')"
                      :description="t('app.menu.workspaceDescription')"
                      :query-fields="enterpriseMenuQueryFields"
                      :query-loading="menuLoading"
                      :table-columns="enterpriseMenuTableColumns"
                      :items="enterpriseMenuTableItems"
                      :table-loading="menuLoading"
                      :table-actions="[]"
                      :item-count-label="menuCountLabel"
                      :empty-title="t('app.menu.emptyTitle')"
                      :empty-description="t('app.menu.emptyDescription')"
                      :copy="enterpriseCrudCopy"
                      @search="handleMenuSearch"
                      @reset="handleMenuReset"
                      @row-click="handleMenuRowClick"
                    >
                      <template #toolbar>
                        <span class="enterprise-toolbar-pill">
                          {{ currentQuerySummary }}
                        </span>
                      </template>
                    </ElyCrudWorkspace>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'notification'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <div
                      v-if="!notificationModuleReady"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.notificationModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-message enterprise-message-info"
                    >
                      {{ t("app.message.notificationSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="
                        canEnterNotificationWorkspace && !canViewNotifications
                      "
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.notificationNoListPermission") }}
                    </div>

                    <div
                      v-else-if="notificationErrorMessage"
                      class="enterprise-message enterprise-message-danger"
                    >
                      {{ notificationErrorMessage }}
                    </div>

                    <ElyCrudWorkspace
                      v-else
                      :eyebrow="t('app.notification.workspaceEyebrow')"
                      :title="t('app.notification.workspaceTitle')"
                      :description="t('app.notification.workspaceDescription')"
                      :query-fields="enterpriseNotificationQueryFields"
                      :query-loading="notificationLoading"
                      :table-columns="enterpriseNotificationTableColumns"
                      :items="enterpriseNotificationTableItems"
                      :table-loading="notificationLoading"
                      :table-actions="[]"
                      :item-count-label="notificationCountLabel"
                      :empty-title="t('app.notification.emptyTitle')"
                      :empty-description="t('app.notification.emptyDescription')"
                      :copy="enterpriseCrudCopy"
                      @search="handleNotificationSearch"
                      @reset="handleNotificationReset"
                      @row-click="handleNotificationRowClick"
                    >
                      <template #toolbar>
                        <span class="enterprise-toolbar-pill">
                          {{ currentQuerySummary }}
                        </span>
                      </template>
                    </ElyCrudWorkspace>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'operation-log'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <div
                      v-if="!operationLogModuleReady"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.operationLogModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-message enterprise-message-info"
                    >
                      {{ t("app.message.operationLogSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="
                        canEnterOperationLogWorkspace && !canViewOperationLogs
                      "
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.operationLogNoListPermission") }}
                    </div>

                    <div
                      v-else-if="operationLogErrorMessage"
                      class="enterprise-message enterprise-message-danger"
                    >
                      {{ operationLogErrorMessage }}
                    </div>

                    <ElyCrudWorkspace
                      v-else
                      :eyebrow="t('app.operationLog.workspaceEyebrow')"
                      :title="t('app.operationLog.workspaceTitle')"
                      :description="t('app.operationLog.workspaceDescription')"
                      :query-fields="enterpriseOperationLogQueryFields"
                      :query-loading="operationLogLoading"
                      :table-columns="enterpriseOperationLogTableColumns"
                      :items="enterpriseOperationLogTableItems"
                      :table-loading="operationLogLoading"
                      :table-actions="[]"
                      :item-count-label="operationLogCountLabel"
                      :empty-title="t('app.operationLog.emptyTitle')"
                      :empty-description="t('app.operationLog.emptyDescription')"
                      :copy="enterpriseCrudCopy"
                      @search="handleOperationLogSearch"
                      @reset="handleOperationLogReset"
                      @row-click="handleOperationLogRowClick"
                    >
                      <template #toolbar>
                        <span class="enterprise-toolbar-pill">
                          {{ currentQuerySummary }}
                        </span>
                      </template>
                    </ElyCrudWorkspace>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'role'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <div
                      v-if="!roleModuleReady"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.roleModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-message enterprise-message-info"
                    >
                      {{ t("app.message.roleSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterRoleWorkspace && !canViewRoles"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.roleNoListPermission") }}
                    </div>

                    <div
                      v-else-if="roleErrorMessage"
                      class="enterprise-message enterprise-message-danger"
                    >
                      {{ roleErrorMessage }}
                    </div>

                    <ElyCrudWorkspace
                      v-else
                      :eyebrow="t('app.role.workspaceEyebrow')"
                      :title="t('app.role.workspaceTitle')"
                      :description="t('app.role.workspaceDescription')"
                      :query-fields="enterpriseRoleQueryFields"
                      :query-loading="roleLoading"
                      :table-columns="enterpriseRoleTableColumns"
                      :items="enterpriseRoleTableItems"
                      :table-loading="roleLoading"
                      :table-actions="[]"
                      :item-count-label="roleCountLabel"
                      :empty-title="t('app.role.emptyTitle')"
                      :empty-description="t('app.role.emptyDescription')"
                      :copy="enterpriseCrudCopy"
                      @search="handleRoleSearch"
                      @reset="handleRoleReset"
                      @row-click="handleRoleRowClick"
                    >
                      <template #toolbar>
                        <span class="enterprise-toolbar-pill">
                          {{ currentQuerySummary }}
                        </span>
                      </template>
                    </ElyCrudWorkspace>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'setting'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <div
                      v-if="!settingModuleReady"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.settingModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-message enterprise-message-info"
                    >
                      {{ t("app.message.settingSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterSettingWorkspace && !canViewSettings"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.settingNoListPermission") }}
                    </div>

                    <div
                      v-else-if="settingErrorMessage"
                      class="enterprise-message enterprise-message-danger"
                    >
                      {{ settingErrorMessage }}
                    </div>

                    <ElyCrudWorkspace
                      v-else
                      :eyebrow="t('app.setting.workspaceEyebrow')"
                      :title="t('app.setting.workspaceTitle')"
                      :description="t('app.setting.workspaceDescription')"
                      :query-fields="enterpriseSettingQueryFields"
                      :query-loading="settingLoading"
                      :table-columns="enterpriseSettingTableColumns"
                      :items="enterpriseSettingTableItems"
                      :table-loading="settingLoading"
                      :table-actions="[]"
                      :item-count-label="settingCountLabel"
                      :empty-title="t('app.setting.emptyTitle')"
                      :empty-description="t('app.setting.emptyDescription')"
                      :copy="enterpriseCrudCopy"
                      @search="handleSettingSearch"
                      @reset="handleSettingReset"
                      @row-click="handleSettingRowClick"
                    >
                      <template #toolbar>
                        <span class="enterprise-toolbar-pill">
                          {{ currentQuerySummary }}
                        </span>
                      </template>
                    </ElyCrudWorkspace>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'user'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <div
                      v-if="!userModuleReady"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.userModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-message enterprise-message-info"
                    >
                      {{ t("app.message.userSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterUserWorkspace && !canViewUsers"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.userNoListPermission") }}
                    </div>

                    <div
                      v-else-if="userErrorMessage"
                      class="enterprise-message enterprise-message-danger"
                    >
                      {{ userErrorMessage }}
                    </div>

                    <ElyCrudWorkspace
                      v-else
                      :eyebrow="t('app.user.workspaceEyebrow')"
                      :title="t('app.user.workspaceTitle')"
                      :description="t('app.user.workspaceDescription')"
                      :query-fields="enterpriseUserQueryFields"
                      :query-loading="userLoading"
                      :table-columns="enterpriseUserTableColumns"
                      :items="enterpriseUserTableItems"
                      :table-loading="userLoading"
                      :table-actions="[]"
                      :item-count-label="userCountLabel"
                      :empty-title="t('app.user.emptyTitle')"
                      :empty-description="t('app.user.emptyDescription')"
                      :copy="enterpriseCrudCopy"
                      @search="handleUserSearch"
                      @reset="handleUserReset"
                      @row-click="handleUserRowClick"
                    >
                      <template #toolbar>
                        <span class="enterprise-toolbar-pill">
                          {{ currentQuerySummary }}
                        </span>
                      </template>
                    </ElyCrudWorkspace>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'placeholder'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <p class="enterprise-eyebrow">{{ t("app.placeholder.eyebrow") }}</p>
                    <h3 class="enterprise-heading">{{ selectedNavigationItem?.name }}</h3>
                    <p class="enterprise-copy">
                      {{ placeholderWorkspaceCopy }}
                    </p>

                    <div class="enterprise-metadata mt-5">
                      <div>
                        <span>{{ t("app.placeholder.route") }}</span>
                        <strong>{{ currentNavigationPath }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.placeholder.moduleCode") }}</span>
                        <strong>{{ currentModuleCodeLabel }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.placeholder.moduleStatus") }}</span>
                        <strong>{{ currentModuleStatusLabel }}</strong>
                      </div>
                    </div>

                    <div class="mt-5">
                      <p class="enterprise-subheading">{{ t("app.placeholder.nextStep") }}</p>
                      <ul class="enterprise-list">
                        <li>{{ t("app.placeholder.step.navigation") }}</li>
                        <li>{{ t("app.placeholder.step.workspace") }}</li>
                        <li>{{ t("app.placeholder.step.owner") }}</li>
                      </ul>
                    </div>

                    <div class="enterprise-button-row">
                      <button
                        v-if="customerNavigationItem"
                        type="button"
                        class="enterprise-button enterprise-button-ghost"
                        @click="openCustomerWorkspace"
                      >
                        {{ t("app.placeholder.backToCustomer") }}
                      </button>
                    </div>
                  </section>

                  <template v-else>
                    <div
                      v-if="!customerModuleReady"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.customerModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-message enterprise-message-info"
                    >
                      {{ t("app.message.signInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterCustomerWorkspace && !canViewCustomers"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.workspaceNoListPermission") }}
                    </div>

                    <div
                      v-else-if="customerErrorMessage"
                      class="enterprise-message enterprise-message-danger"
                    >
                      {{ customerErrorMessage }}
                    </div>

                    <ElyCrudWorkspace
                      v-else
                      :eyebrow="t('app.workspace.eyebrow')"
                      :title="t('app.workspace.title')"
                      :description="t('app.workspace.description')"
                      :query-fields="enterpriseQueryFields"
                      :query-loading="customerLoading"
                      :table-columns="enterpriseTableColumns"
                      :items="enterpriseTableItems"
                      :table-loading="customerLoading"
                      :table-actions="enterpriseTableActions"
                      :item-count-label="customerCountLabel"
                      :empty-title="t('app.workspace.emptyTitle')"
                      :empty-description="t('app.workspace.emptyDescription')"
                      :copy="enterpriseCrudCopy"
                      @search="handleEnterpriseSearch"
                      @reset="handleEnterpriseReset"
                      @action="handleEnterpriseAction"
                      @row-click="handleEnterpriseRowClick"
                    >
                      <template #toolbar>
                        <span class="enterprise-toolbar-pill">
                          {{ currentQuerySummary }}
                        </span>
                      </template>

                      <template #footer>
                        <div class="enterprise-footer-grid">
                          <div class="enterprise-footer-note">
                            <span>{{ t("app.workspace.footerStatus") }}</span>
                            <strong>{{
                              localizePlatformStatus(vueEnterprisePresetManifest.status)
                            }}</strong>
                            <p>
                              {{ t("app.workspace.footerCopy") }}
                            </p>
                          </div>

                          <div class="enterprise-footer-note enterprise-footer-pagination">
                            <span>{{ t("app.workspace.paginationLabel") }}</span>
                            <strong>{{ customerPaginationSummary }}</strong>

                            <div class="enterprise-footer-controls">
                              <label class="enterprise-footer-control">
                                <small>{{ t("app.workspace.paginationPageSizeLabel") }}</small>
                                <TSelect
                                  :model-value="customerListPageSize"
                                  :options="customerPageSizeOptions"
                                  size="small"
                                  @update:model-value="handleCustomerPageSizeChange"
                                />
                              </label>

                              <label class="enterprise-footer-control">
                                <small>{{ t("app.workspace.paginationSortLabel") }}</small>
                                <TSelect
                                  :model-value="customerListSortValue"
                                  :options="customerSortOptions"
                                  size="small"
                                  @update:model-value="handleCustomerSortChange"
                                />
                              </label>
                            </div>

                            <div class="enterprise-footer-actions">
                              <TButton
                                variant="outline"
                                size="small"
                                :disabled="
                                  customerLoading || !canGoToPreviousCustomerPage
                                "
                                @click="goToFirstCustomerPage"
                              >
                                {{ t("app.workspace.paginationFirst") }}
                              </TButton>
                              <TButton
                                variant="outline"
                                size="small"
                                :disabled="
                                  customerLoading || !canGoToPreviousCustomerPage
                                "
                                @click="goToPreviousCustomerPage"
                              >
                                {{ t("app.workspace.paginationPrev") }}
                              </TButton>
                              <TButton
                                variant="outline"
                                size="small"
                                :disabled="customerLoading || !canGoToNextCustomerPage"
                                @click="goToNextCustomerPage"
                              >
                                {{ t("app.workspace.paginationNext") }}
                              </TButton>
                              <TButton
                                variant="outline"
                                size="small"
                                :disabled="customerLoading || !canGoToNextCustomerPage"
                                @click="goToLastCustomerPage"
                              >
                                {{ t("app.workspace.paginationLast") }}
                              </TButton>
                            </div>

                            <div class="enterprise-footer-jump">
                              <label class="enterprise-footer-control">
                                <small>{{ t("app.workspace.paginationJumpLabel") }}</small>
                                <div class="enterprise-footer-jump-row">
                                  <TInput
                                    :model-value="customerPageInputValue"
                                    size="small"
                                    :placeholder="t('app.workspace.paginationJumpPlaceholder')"
                                    @update:model-value="
                                      customerPageInputValue = String($event ?? '')
                                    "
                                    @enter="submitCustomerPageJump"
                                  />
                                  <TButton
                                    size="small"
                                    theme="primary"
                                    :disabled="
                                      customerLoading || !canJumpToCustomerPage
                                    "
                                    @click="submitCustomerPageJump"
                                  >
                                    {{ t("app.workspace.paginationJumpSubmit") }}
                                  </TButton>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </template>
                    </ElyCrudWorkspace>
                  </template>
                </template>

                <template #secondary>
                  <section v-if="currentWorkspaceKind === 'placeholder'" class="enterprise-card">
                    <p class="enterprise-eyebrow">{{ t("app.placeholder.sideEyebrow") }}</p>
                    <h3 class="enterprise-heading">{{ t("app.placeholder.sideTitle") }}</h3>
                    <p class="enterprise-copy">{{ t("app.placeholder.sideDescription") }}</p>

                    <div class="enterprise-metadata mt-5">
                      <div>
                        <span>{{ t("app.placeholder.sideOwnerLabel") }}</span>
                        <strong>{{ t("app.placeholder.sideOwnerValue") }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.placeholder.sideSharedLabel") }}</span>
                        <strong>{{ t("app.placeholder.sideSharedValue") }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.placeholder.sideCurrentModuleLabel") }}</span>
                        <strong>{{ currentModuleCodeLabel }}</strong>
                      </div>
                    </div>

                    <div class="mt-5">
                      <p class="enterprise-subheading">
                        {{ t("app.placeholder.sideDecisionTitle") }}
                      </p>
                      <ul class="enterprise-list">
                        <li>{{ t("app.placeholder.sideDecisionOwner") }}</li>
                        <li>{{ t("app.placeholder.sideDecisionContract") }}</li>
                        <li>{{ t("app.placeholder.sideDecisionEscalation") }}</li>
                      </ul>
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'dictionary'"
                    class="enterprise-card"
                  >
                    <p class="enterprise-eyebrow">
                      {{ t("app.dictionary.detailEyebrow") }}
                    </p>
                    <h3 class="enterprise-heading">{{ dictionaryPanelTitle }}</h3>
                    <p class="enterprise-copy">{{ dictionaryPanelDescription }}</p>

                    <div
                      v-if="!dictionaryModuleReady"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.dictionaryModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.dictionarySignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterDictionaryWorkspace && !canViewDictionaries"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.dictionaryNoListPermission") }}
                    </div>

                    <div
                      v-else-if="dictionaryErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ dictionaryErrorMessage }}
                    </div>

                    <div
                      v-else-if="dictionaryDetailLoading && selectedDictionaryType"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.dictionary.detailLoading") }}
                    </div>

                    <div
                      v-else-if="dictionaryDetailErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ dictionaryDetailErrorMessage }}
                    </div>

                    <template
                      v-else-if="
                        dictionaryPanelMode === 'detail' && selectedDictionaryType
                      "
                    >
                      <div class="enterprise-button-row">
                        <button
                          v-if="canUpdateDictionaryTypes"
                          type="button"
                          class="enterprise-button"
                          :disabled="dictionaryLoading || dictionaryDetailLoading"
                          @click="startDictionaryEdit(selectedDictionaryType)"
                        >
                          {{ t("app.dictionary.action.edit") }}
                        </button>
                        <button
                          v-if="canCreateDictionaryTypes"
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          @click="openDictionaryCreatePanel"
                        >
                          {{ t("app.dictionary.action.create") }}
                        </button>
                      </div>

                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseDictionaryFormFields"
                        :values="enterpriseDictionaryFormValues"
                        readonly
                        :loading="dictionaryLoading || dictionaryDetailLoading"
                        :copy="enterpriseFormCopy"
                      />

                      <div class="enterprise-metadata mt-5">
                        <div>
                          <span>{{ t("app.dictionary.meta.itemCount") }}</span>
                          <strong>{{ selectedDictionaryTypeItems.length }}</strong>
                        </div>
                        <div>
                          <span>{{ t("app.dictionary.meta.defaultCount") }}</span>
                          <strong>{{
                            selectedDictionaryTypeItems.filter((item) => item.isDefault).length
                          }}</strong>
                        </div>
                      </div>

                      <div class="mt-5">
                        <p class="enterprise-subheading">
                          {{ t("app.dictionary.meta.items") }}
                        </p>
                        <div
                          v-if="selectedDictionaryTypeItems.length === 0"
                          class="enterprise-inline-warning mt-3"
                        >
                          {{ t("app.dictionary.meta.empty") }}
                        </div>
                        <div v-else class="mt-3 space-y-3">
                          <div
                            v-for="item in selectedDictionaryTypeItems"
                            :key="item.id"
                            class="enterprise-metadata"
                          >
                            <div>
                              <span>{{ item.value }}</span>
                              <strong>{{ item.label }}</strong>
                            </div>
                            <div>
                              <span>{{ t("app.dictionary.meta.itemStatus") }}</span>
                              <strong>{{
                                localizeDictionaryStatus(item.status)
                              }}</strong>
                            </div>
                            <div>
                              <span>{{ t("app.dictionary.meta.itemSort") }}</span>
                              <strong>{{ item.sort }}</strong>
                            </div>
                            <div>
                              <span>{{ t("app.dictionary.meta.itemDefault") }}</span>
                              <strong>{{
                                item.isDefault
                                  ? t("app.dictionary.boolean.true")
                                  : t("app.dictionary.boolean.false")
                              }}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>

                    <template
                      v-else-if="
                        dictionaryPanelMode === 'create' ||
                        dictionaryPanelMode === 'edit'
                      "
                    >
                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseDictionaryFormFields"
                        :values="enterpriseDictionaryFormValues"
                        :loading="dictionaryLoading || dictionaryDetailLoading"
                        :copy="enterpriseFormCopy"
                        @submit="submitDictionaryForm"
                        @cancel="cancelDictionaryPanel"
                      />
                    </template>

                    <div
                      v-else
                      class="enterprise-inline-warning mt-5"
                    >
                      {{ t("app.dictionary.detailEmptyDescription") }}
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'department'"
                    class="enterprise-card"
                  >
                    <p class="enterprise-eyebrow">
                      {{ t("app.department.detailEyebrow") }}
                    </p>
                    <h3 class="enterprise-heading">{{ departmentPanelTitle }}</h3>
                    <p class="enterprise-copy">{{ departmentPanelDescription }}</p>

                    <div
                      v-if="!departmentModuleReady"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.departmentModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.departmentSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="
                        canEnterDepartmentWorkspace && !canViewDepartments
                      "
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.departmentNoListPermission") }}
                    </div>

                    <div
                      v-else-if="departmentErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ departmentErrorMessage }}
                    </div>

                    <div
                      v-else-if="departmentDetailLoading && selectedDepartment"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.department.detailLoading") }}
                    </div>

                    <div
                      v-else-if="departmentDetailErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ departmentDetailErrorMessage }}
                    </div>

                    <template
                      v-else-if="
                        departmentPanelMode === 'detail' && selectedDepartment
                      "
                    >
                      <div class="enterprise-button-row">
                        <button
                          v-if="canUpdateDepartments"
                          type="button"
                          class="enterprise-button"
                          :disabled="departmentLoading || departmentDetailLoading"
                          @click="startDepartmentEdit(selectedDepartment)"
                        >
                          {{ t("app.department.action.edit") }}
                        </button>
                        <button
                          v-if="canCreateDepartments"
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          @click="openDepartmentCreatePanel"
                        >
                          {{ t("app.department.action.create") }}
                        </button>
                      </div>

                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseDepartmentFormFields"
                        :values="enterpriseDepartmentFormValues"
                        readonly
                        :loading="departmentLoading || departmentDetailLoading"
                        :copy="enterpriseFormCopy"
                      />

                      <div class="enterprise-metadata mt-5">
                        <div>
                          <span>{{ t("app.department.meta.parent") }}</span>
                          <strong>{{
                            selectedDepartment.parentId
                              ? (departmentParentLookup.get(
                                  selectedDepartment.parentId,
                                )?.name ?? selectedDepartment.parentId)
                              : t("app.department.parentRoot")
                          }}</strong>
                        </div>
                        <div v-if="selectedDepartmentDetail">
                          <span>{{ t("app.department.meta.userCount") }}</span>
                          <strong>{{ selectedDepartmentDetail.userIds.length }}</strong>
                        </div>
                      </div>

                      <div
                        v-if="selectedDepartmentDetail"
                        class="mt-5 space-y-4"
                      >
                        <div>
                          <p class="enterprise-subheading">
                            {{ t("app.department.meta.userIds") }}
                          </p>
                          <p class="enterprise-copy">
                            {{
                              selectedDepartmentDetail.userIds.length > 0
                                ? selectedDepartmentDetail.userIds.join(", ")
                                : t("app.department.meta.empty")
                            }}
                          </p>
                        </div>
                      </div>
                    </template>

                    <template
                      v-else-if="
                        departmentPanelMode === 'create' ||
                        departmentPanelMode === 'edit'
                      "
                    >
                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseDepartmentFormFields"
                        :values="enterpriseDepartmentFormValues"
                        :loading="departmentLoading || departmentDetailLoading"
                        :copy="enterpriseFormCopy"
                        @submit="submitDepartmentForm"
                        @cancel="cancelDepartmentPanel"
                      />
                    </template>

                    <div
                      v-else
                      class="enterprise-inline-warning mt-5"
                    >
                      {{ t("app.department.detailEmptyDescription") }}
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'menu'"
                    class="enterprise-card"
                  >
                    <p class="enterprise-eyebrow">{{ t("app.menu.detailEyebrow") }}</p>
                    <h3 class="enterprise-heading">{{ menuPanelTitle }}</h3>
                    <p class="enterprise-copy">{{ menuPanelDescription }}</p>

                    <div
                      v-if="!menuModuleReady"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.menuModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.menuSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterMenuWorkspace && !canViewMenus"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.menuNoListPermission") }}
                    </div>

                    <div v-else-if="menuErrorMessage" class="enterprise-inline-warning">
                      {{ menuErrorMessage }}
                    </div>

                    <div
                      v-else-if="menuDetailLoading && selectedMenu"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.menu.detailLoading") }}
                    </div>

                    <div
                      v-else-if="menuDetailErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ menuDetailErrorMessage }}
                    </div>

                    <template v-else-if="menuPanelMode === 'detail' && selectedMenu">
                      <div class="enterprise-button-row">
                        <button
                          v-if="canUpdateMenus"
                          type="button"
                          class="enterprise-button"
                          :disabled="menuLoading || menuDetailLoading"
                          @click="startMenuEdit(selectedMenu)"
                        >
                          {{ t("app.menu.action.edit") }}
                        </button>
                        <button
                          v-if="canCreateMenus"
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          @click="openMenuCreatePanel"
                        >
                          {{ t("app.menu.action.create") }}
                        </button>
                      </div>

                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseMenuFormFields"
                        :values="enterpriseMenuFormValues"
                        readonly
                        :loading="menuLoading || menuDetailLoading"
                        :copy="enterpriseFormCopy"
                      />

                      <div class="enterprise-metadata mt-5">
                        <div>
                          <span>{{ t("app.menu.meta.parent") }}</span>
                          <strong>{{
                            selectedMenu.parentId
                              ? (menuParentLookup.get(selectedMenu.parentId)?.name ??
                                selectedMenu.parentId)
                              : t("app.menu.parentRoot")
                          }}</strong>
                        </div>
                        <div v-if="selectedMenuDetail">
                          <span>{{ t("app.menu.meta.roleCount") }}</span>
                          <strong>{{ selectedMenuDetail.roleIds.length }}</strong>
                        </div>
                      </div>

                      <div v-if="selectedMenuDetail" class="mt-5 space-y-4">
                        <div>
                          <p class="enterprise-subheading">
                            {{ t("app.menu.meta.roleIds") }}
                          </p>
                          <p class="enterprise-copy">
                            {{
                              selectedMenuDetail.roleIds.length > 0
                                ? selectedMenuDetail.roleIds.join(", ")
                                : t("app.menu.meta.empty")
                            }}
                          </p>
                        </div>
                      </div>
                    </template>

                    <template
                      v-else-if="menuPanelMode === 'create' || menuPanelMode === 'edit'"
                    >
                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseMenuFormFields"
                        :values="enterpriseMenuFormValues"
                        :loading="menuLoading || menuDetailLoading"
                        :copy="enterpriseFormCopy"
                        @submit="submitMenuForm"
                        @cancel="cancelMenuPanel"
                      />
                    </template>

                    <div
                      v-else
                      class="enterprise-inline-warning mt-5"
                    >
                      {{ t("app.menu.detailEmptyDescription") }}
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'notification'"
                    class="enterprise-card"
                  >
                    <p class="enterprise-eyebrow">
                      {{ t("app.notification.detailEyebrow") }}
                    </p>
                    <h3 class="enterprise-heading">{{ notificationPanelTitle }}</h3>
                    <p class="enterprise-copy">{{ notificationPanelDescription }}</p>

                    <div
                      v-if="!notificationModuleReady"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.notificationModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.notificationSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="
                        canEnterNotificationWorkspace && !canViewNotifications
                      "
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.notificationNoListPermission") }}
                    </div>

                    <div
                      v-else-if="notificationErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ notificationErrorMessage }}
                    </div>

                    <div
                      v-else-if="
                        notificationDetailLoading && selectedNotification
                      "
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.notification.detailLoading") }}
                    </div>

                    <div
                      v-else-if="notificationDetailErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ notificationDetailErrorMessage }}
                    </div>

                    <template
                      v-else-if="
                        notificationPanelMode === 'detail' && selectedNotification
                      "
                    >
                      <div class="enterprise-button-row">
                        <button
                          v-if="
                            canUpdateNotifications &&
                            selectedNotification.status === 'unread'
                          "
                          type="button"
                          class="enterprise-button"
                          :disabled="
                            notificationLoading || notificationDetailLoading
                          "
                          @click="markSelectedNotificationAsRead"
                        >
                          {{ t("app.notification.action.markRead") }}
                        </button>
                        <button
                          v-if="canCreateNotifications"
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          @click="openNotificationCreatePanel"
                        >
                          {{ t("app.notification.action.create") }}
                        </button>
                      </div>

                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseNotificationFormFields"
                        :values="enterpriseNotificationFormValues"
                        readonly
                        :loading="
                          notificationLoading || notificationDetailLoading
                        "
                        :copy="enterpriseFormCopy"
                      />

                      <div class="enterprise-metadata mt-5">
                        <div>
                          <span>{{ t("app.notification.meta.status") }}</span>
                          <strong>{{
                            localizeNotificationStatus(selectedNotification.status)
                          }}</strong>
                        </div>
                        <div>
                          <span>{{ t("app.notification.meta.level") }}</span>
                          <strong>{{
                            localizeNotificationLevel(selectedNotification.level)
                          }}</strong>
                        </div>
                        <div>
                          <span>{{ t("app.notification.meta.readAt") }}</span>
                          <strong>{{
                            selectedNotification.readAt
                              ? new Date(selectedNotification.readAt).toLocaleString(locale)
                              : t("app.notification.readAtEmpty")
                          }}</strong>
                        </div>
                      </div>
                    </template>

                    <template v-else-if="notificationPanelMode === 'create'">
                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseNotificationFormFields"
                        :values="enterpriseNotificationFormValues"
                        :loading="
                          notificationLoading || notificationDetailLoading
                        "
                        :copy="enterpriseFormCopy"
                        @submit="submitNotificationForm"
                        @cancel="cancelNotificationPanel"
                      />
                    </template>

                    <div
                      v-else
                      class="enterprise-inline-warning mt-5"
                    >
                      {{ t("app.notification.detailEmptyDescription") }}
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'operation-log'"
                    class="enterprise-card"
                  >
                    <p class="enterprise-eyebrow">
                      {{ t("app.operationLog.detailEyebrow") }}
                    </p>
                    <h3 class="enterprise-heading">{{ operationLogPanelTitle }}</h3>
                    <p class="enterprise-copy">{{ operationLogPanelDescription }}</p>

                    <div
                      v-if="!operationLogModuleReady"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.operationLogModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.operationLogSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="
                        canEnterOperationLogWorkspace && !canViewOperationLogs
                      "
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.operationLogNoListPermission") }}
                    </div>

                    <div
                      v-else-if="operationLogErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ operationLogErrorMessage }}
                    </div>

                    <div
                      v-else-if="
                        operationLogDetailLoading && selectedOperationLog
                      "
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.operationLog.detailLoading") }}
                    </div>

                    <div
                      v-else-if="operationLogDetailErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ operationLogDetailErrorMessage }}
                    </div>

                    <template v-else-if="selectedOperationLog">
                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseOperationLogDetailFields"
                        :values="enterpriseOperationLogDetailValues"
                        readonly
                        :loading="
                          operationLogLoading || operationLogDetailLoading
                        "
                        :copy="enterpriseFormCopy"
                      />

                      <div class="mt-5">
                        <p class="enterprise-subheading">
                          {{ t("app.operationLog.meta.details") }}
                        </p>
                        <pre class="enterprise-copy whitespace-pre-wrap">{{
                          operationLogDetailsText
                        }}</pre>
                      </div>
                    </template>

                    <div
                      v-else
                      class="enterprise-inline-warning mt-5"
                    >
                      {{ t("app.operationLog.detailEmptyDescription") }}
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'role'"
                    class="enterprise-card"
                  >
                    <p class="enterprise-eyebrow">{{ t("app.role.detailEyebrow") }}</p>
                    <h3 class="enterprise-heading">{{ rolePanelTitle }}</h3>
                    <p class="enterprise-copy">{{ rolePanelDescription }}</p>

                    <div
                      v-if="!roleModuleReady"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.roleModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.roleSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterRoleWorkspace && !canViewRoles"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.roleNoListPermission") }}
                    </div>

                    <div v-else-if="roleErrorMessage" class="enterprise-inline-warning">
                      {{ roleErrorMessage }}
                    </div>

                    <div
                      v-else-if="roleDetailLoading && selectedRole"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.role.detailLoading") }}
                    </div>

                    <div
                      v-else-if="roleDetailErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ roleDetailErrorMessage }}
                    </div>

                    <template v-else-if="rolePanelMode === 'detail' && selectedRole">
                      <div class="enterprise-button-row">
                        <button
                          v-if="canUpdateRoles"
                          type="button"
                          class="enterprise-button"
                          :disabled="roleLoading || roleDetailLoading"
                          @click="startRoleEdit(selectedRole)"
                        >
                          {{ t("app.role.action.edit") }}
                        </button>
                        <button
                          v-if="canCreateRoles"
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          @click="openRoleCreatePanel"
                        >
                          {{ t("app.role.action.create") }}
                        </button>
                      </div>

                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseRoleFormFields"
                        :values="enterpriseRoleFormValues"
                        readonly
                        :loading="roleLoading || roleDetailLoading"
                        :copy="enterpriseFormCopy"
                      />

                      <div v-if="selectedRoleDetail" class="enterprise-metadata mt-5">
                        <div>
                          <span>{{ t("app.role.meta.permissionCount") }}</span>
                          <strong>{{ selectedRoleDetail.permissionCodes.length }}</strong>
                        </div>
                        <div>
                          <span>{{ t("app.role.meta.userCount") }}</span>
                          <strong>{{ selectedRoleDetail.userIds.length }}</strong>
                        </div>
                        <div>
                          <span>{{ t("app.role.meta.deptCount") }}</span>
                          <strong>{{ selectedRoleDetail.deptIds.length }}</strong>
                        </div>
                      </div>

                      <div v-if="selectedRoleDetail" class="mt-5 space-y-4">
                        <div>
                          <p class="enterprise-subheading">
                            {{ t("app.role.meta.permissionCodes") }}
                          </p>
                          <p class="enterprise-copy">
                            {{
                              selectedRoleDetail.permissionCodes.length > 0
                                ? selectedRoleDetail.permissionCodes.join(", ")
                                : t("app.role.meta.empty")
                            }}
                          </p>
                        </div>
                        <div>
                          <p class="enterprise-subheading">
                            {{ t("app.role.meta.userIds") }}
                          </p>
                          <p class="enterprise-copy">
                            {{
                              selectedRoleDetail.userIds.length > 0
                                ? selectedRoleDetail.userIds.join(", ")
                                : t("app.role.meta.empty")
                            }}
                          </p>
                        </div>
                        <div>
                          <p class="enterprise-subheading">
                            {{ t("app.role.meta.deptIds") }}
                          </p>
                          <p class="enterprise-copy">
                            {{
                              selectedRoleDetail.deptIds.length > 0
                                ? selectedRoleDetail.deptIds.join(", ")
                                : t("app.role.meta.empty")
                            }}
                          </p>
                        </div>
                      </div>
                    </template>

                    <template v-else-if="rolePanelMode === 'create' || rolePanelMode === 'edit'">
                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseRoleFormFields"
                        :values="enterpriseRoleFormValues"
                        :loading="roleLoading || roleDetailLoading"
                        :copy="enterpriseFormCopy"
                        @submit="submitRoleForm"
                        @cancel="cancelRolePanel"
                      />
                    </template>

                    <div
                      v-else
                      class="enterprise-inline-warning mt-5"
                    >
                      {{ t("app.role.detailEmptyDescription") }}
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'setting'"
                    class="enterprise-card"
                  >
                    <p class="enterprise-eyebrow">{{ t("app.setting.detailEyebrow") }}</p>
                    <h3 class="enterprise-heading">{{ settingPanelTitle }}</h3>
                    <p class="enterprise-copy">{{ settingPanelDescription }}</p>

                    <div
                      v-if="!settingModuleReady"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.settingModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.settingSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterSettingWorkspace && !canViewSettings"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.settingNoListPermission") }}
                    </div>

                    <div
                      v-else-if="settingErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ settingErrorMessage }}
                    </div>

                    <div
                      v-else-if="settingDetailLoading && selectedSetting"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.setting.detailLoading") }}
                    </div>

                    <div
                      v-else-if="settingDetailErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ settingDetailErrorMessage }}
                    </div>

                    <template
                      v-else-if="settingPanelMode === 'detail' && selectedSetting"
                    >
                      <div class="enterprise-button-row">
                        <button
                          v-if="canUpdateSettings"
                          type="button"
                          class="enterprise-button"
                          :disabled="settingLoading || settingDetailLoading"
                          @click="startSettingEdit(selectedSetting)"
                        >
                          {{ t("app.setting.action.edit") }}
                        </button>
                        <button
                          v-if="canCreateSettings"
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          @click="openSettingCreatePanel"
                        >
                          {{ t("app.setting.action.create") }}
                        </button>
                      </div>

                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseSettingFormFields"
                        :values="enterpriseSettingFormValues"
                        readonly
                        :loading="settingLoading || settingDetailLoading"
                        :copy="enterpriseFormCopy"
                      />
                    </template>

                    <template
                      v-else-if="
                        settingPanelMode === 'create' ||
                        settingPanelMode === 'edit'
                      "
                    >
                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseSettingFormFields"
                        :values="enterpriseSettingFormValues"
                        :loading="settingLoading || settingDetailLoading"
                        :copy="enterpriseFormCopy"
                        @submit="submitSettingForm"
                        @cancel="cancelSettingPanel"
                      />
                    </template>

                    <div
                      v-else
                      class="enterprise-inline-warning mt-5"
                    >
                      {{ t("app.setting.detailEmptyDescription") }}
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'user'"
                    class="enterprise-card"
                  >
                    <p class="enterprise-eyebrow">{{ t("app.user.detailEyebrow") }}</p>
                    <h3 class="enterprise-heading">{{ userPanelTitle }}</h3>
                    <p class="enterprise-copy">{{ userPanelDescription }}</p>

                    <div
                      v-if="!userModuleReady"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.userModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.userSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="canEnterUserWorkspace && !canViewUsers"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.userNoListPermission") }}
                    </div>

                    <div v-else-if="userErrorMessage" class="enterprise-inline-warning">
                      {{ userErrorMessage }}
                    </div>

                    <template v-else-if="userPanelMode === 'detail' && selectedUser">
                      <div class="enterprise-button-row">
                        <button
                          v-if="canUpdateUsers"
                          type="button"
                          class="enterprise-button"
                          :disabled="userLoading"
                          @click="startUserEdit(selectedUser)"
                        >
                          {{ t("app.user.action.edit") }}
                        </button>
                        <button
                          v-if="canResetUserPasswords"
                          type="button"
                          class="enterprise-button enterprise-button-danger"
                          :disabled="userLoading"
                          @click="startUserPasswordReset(selectedUser)"
                        >
                          {{ t("app.user.action.resetPassword") }}
                        </button>
                        <button
                          v-if="canCreateUsers"
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          @click="openUserCreatePanel"
                        >
                          {{ t("app.user.action.create") }}
                        </button>
                      </div>

                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseUserFormFields"
                        :values="enterpriseUserFormValues"
                        readonly
                        :loading="userLoading"
                        :copy="enterpriseFormCopy"
                      />
                    </template>

                    <template v-else-if="userPanelMode === 'create' || userPanelMode === 'edit'">
                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseUserFormFields"
                        :values="enterpriseUserFormValues"
                        :loading="userLoading"
                        :copy="enterpriseFormCopy"
                        @submit="submitUserForm"
                        @cancel="cancelUserPanel"
                      />

                      <label
                        v-if="userPanelMode === 'create'"
                        class="enterprise-field mt-2"
                      >
                        <span>{{ t("app.user.field.password") }}</span>
                        <TInput
                          v-model="userPasswordInput"
                          type="password"
                          :disabled="userLoading"
                          :placeholder="t('app.user.passwordPlaceholder')"
                        />
                      </label>
                    </template>

                    <template v-else-if="userPanelMode === 'reset' && selectedUser">
                      <div class="enterprise-metadata mt-5">
                        <div>
                          <span>{{ t("app.user.field.username") }}</span>
                          <strong>{{ selectedUser.username }}</strong>
                        </div>
                        <div>
                          <span>{{ t("app.user.field.displayName") }}</span>
                          <strong>{{ selectedUser.displayName }}</strong>
                        </div>
                      </div>

                      <label class="enterprise-field mt-5">
                        <span>{{ t("app.user.field.password") }}</span>
                        <TInput
                          v-model="userPasswordInput"
                          type="password"
                          :disabled="userLoading"
                          :placeholder="t('app.user.passwordPlaceholder')"
                        />
                      </label>

                      <div class="enterprise-button-row">
                        <button
                          type="button"
                          class="enterprise-button enterprise-button-danger"
                          :disabled="userLoading"
                          @click="submitUserPasswordReset"
                        >
                          {{ t("app.user.action.confirmResetPassword") }}
                        </button>
                        <button
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          @click="cancelUserPanel"
                        >
                          {{ t("app.panel.cancel") }}
                        </button>
                      </div>
                    </template>

                    <div
                      v-else
                      class="enterprise-inline-warning mt-5"
                    >
                      {{ t("app.user.detailEmptyDescription") }}
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'workflow-definitions'"
                    class="enterprise-card"
                  >
                    <p class="enterprise-eyebrow">{{ t("app.workflow.detailEyebrow") }}</p>
                    <h3 class="enterprise-heading">
                      {{
                        selectedWorkflowDefinition?.name ??
                        t("app.workflow.detailEmptyTitle")
                      }}
                    </h3>
                    <p class="enterprise-copy">
                      {{
                        selectedWorkflowDefinition
                          ? t("app.workflow.detailDescription")
                          : t("app.workflow.detailEmpty")
                      }}
                    </p>

                    <div
                      v-if="workflowDetailLoading && selectedWorkflowDefinition"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.workflow.detailLoading") }}
                    </div>

                    <div
                      v-if="workflowDetailErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ workflowDetailErrorMessage }}
                    </div>

                    <div
                      v-if="selectedWorkflowDefinition"
                      class="enterprise-metadata mt-5"
                    >
                      <div>
                        <span>{{ t("app.workflow.meta.status") }}</span>
                        <strong>{{
                          localizeWorkflowStatus(selectedWorkflowDefinition.status)
                        }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.workflow.meta.key") }}</span>
                        <strong>{{ selectedWorkflowDefinition.key }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.workflow.meta.version") }}</span>
                        <strong>v{{ selectedWorkflowDefinition.version }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.workflow.meta.structure") }}</span>
                        <strong>
                          {{ selectedWorkflowDefinition.definition.nodes.length }}
                          {{ t("app.workflow.meta.nodes") }}
                          / {{ selectedWorkflowDefinition.definition.edges.length }}
                          {{ t("app.workflow.meta.edges") }}
                        </strong>
                      </div>
                      <div>
                        <span>{{ t("app.workflow.meta.updatedAt") }}</span>
                        <strong>{{
                          new Date(selectedWorkflowDefinition.updatedAt).toLocaleString(locale)
                        }}</strong>
                      </div>
                    </div>

                    <div v-if="selectedWorkflowDefinition" class="mt-5">
                      <p class="enterprise-subheading">
                        {{ t("app.workflow.versionHistoryTitle") }}
                      </p>
                      <div
                        v-if="workflowVersionHistoryCards.length > 0"
                        class="workflow-version-history"
                      >
                        <button
                          v-for="definition in workflowVersionHistoryCards"
                          :key="definition.id"
                          type="button"
                          class="workflow-version-card"
                          :class="
                            selectedWorkflowDefinitionId === definition.id
                              ? 'workflow-version-card-active'
                              : ''
                          "
                          @click="handleWorkflowDefinitionSelect(definition.id)"
                        >
                          <strong>v{{ definition.version }}</strong>
                          <span>{{ definition.statusLabel }}</span>
                          <small>{{ definition.updatedAtLabel }}</small>
                        </button>
                      </div>

                      <p class="enterprise-subheading mt-5">
                        {{ t("app.workflow.nodeFlowTitle") }}
                      </p>
                      <ul class="workflow-node-list">
                        <li
                          v-for="node in workflowDefinitionDetailCards"
                          :key="node.id"
                          class="workflow-node-item"
                        >
                          <div class="workflow-node-item-header">
                            <strong>{{ node.name }}</strong>
                            <span>{{ node.typeLabel }}</span>
                          </div>
                          <p v-if="node.description" class="workflow-node-copy">
                            {{ node.description }}
                          </p>
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section v-else class="enterprise-card">
                    <p class="enterprise-eyebrow">{{ t("app.panel.formDetail") }}</p>
                    <h3 class="enterprise-heading">{{ enterprisePanelTitle }}</h3>
                    <p class="enterprise-copy">{{ enterprisePanelDescription }}</p>

                    <div
                      v-if="!customerModuleReady"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.panel.customerModulePreview") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.panel.signInToUnlock") }}
                    </div>

                    <div
                      v-else-if="deleteConfirmId && selectedCustomer"
                      class="enterprise-danger-zone"
                    >
                      <p>
                        {{
                          t("app.panel.deletePrompt", {
                            name: selectedCustomer.name,
                          })
                        }}
                      </p>
                      <div class="enterprise-button-row">
                        <button
                          type="button"
                          class="enterprise-button enterprise-button-danger"
                          :disabled="customerLoading"
                          @click="confirmDelete"
                        >
                          {{ t("app.panel.deleteConfirm") }}
                        </button>
                        <button
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          @click="cancelDelete"
                        >
                          {{ t("app.panel.cancel") }}
                        </button>
                      </div>
                    </div>

                    <div
                      v-else-if="enterpriseFormMode === 'detail' && selectedCustomer"
                      class="enterprise-button-row"
                    >
                      <button
                        v-if="canUpdateCustomers"
                        type="button"
                        class="enterprise-button"
                        :disabled="customerLoading"
                        @click="startEdit(selectedCustomer)"
                      >
                        {{ t("app.panel.editCustomer") }}
                      </button>
                      <button
                        v-if="canDeleteCustomers"
                        type="button"
                        class="enterprise-button enterprise-button-danger"
                        :disabled="customerLoading"
                        @click="requestDelete(selectedCustomer)"
                      >
                        {{ t("app.panel.deleteCustomer") }}
                      </button>
                      <button
                        v-if="canCreateCustomers"
                        type="button"
                        class="enterprise-button enterprise-button-ghost"
                        @click="openCreatePanel"
                      >
                        {{ t("app.panel.newCustomer") }}
                      </button>
                    </div>

                    <div
                      v-else-if="enterpriseFormMode === 'create' && !canCreateCustomers"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.panel.noCreatePermission") }}
                    </div>

                    <div
                      v-if="
                        customerModuleReady &&
                        (!authModuleReady || isAuthenticated) &&
                        !(enterpriseFormMode === 'detail' && !selectedCustomer)
                      "
                    >
                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseFormFields"
                        :values="enterpriseFormValues"
                        :readonly="enterpriseFormMode === 'detail'"
                        :loading="customerLoading"
                        :copy="enterpriseFormCopy"
                        @submit="handleEnterpriseFormSubmit"
                        @cancel="handleEnterpriseFormCancel"
                      />
                    </div>

                    <div
                      v-else-if="
                        customerModuleReady &&
                        (!authModuleReady || isAuthenticated) &&
                        enterpriseFormMode === 'detail' &&
                        !selectedCustomer
                      "
                      class="enterprise-inline-warning mt-5"
                    >
                      {{ t("app.panel.selectRowHint") }}
                    </div>
                  </section>

                  <section class="enterprise-card">
                    <p class="enterprise-eyebrow">{{ t("app.session.title.online") }}</p>
                    <h3 class="enterprise-heading">
                      {{
                        authModuleReady
                          ? t("app.session.title.online")
                          : t("app.session.title.offline")
                      }}
                    </h3>

                    <p v-if="!authModuleReady" class="enterprise-copy">
                      {{ t("app.session.offlineCopy") }}
                    </p>

                    <template v-else-if="isAuthenticated">
                      <p class="enterprise-copy">
                        {{
                          t("app.session.signedInAs", {
                            displayName: authIdentity?.user.displayName ?? "",
                            username: authIdentity?.user.username ?? "",
                          })
                        }}
                      </p>

                      <div class="enterprise-kpi-grid">
                        <article>
                          <span>{{ t("app.session.roles") }}</span>
                          <strong>{{ authIdentity?.roles.join(", ") }}</strong>
                        </article>
                        <article>
                          <span>{{ t("app.session.permissions") }}</span>
                          <strong>{{ permissionCodes.length }}</strong>
                        </article>
                      </div>

                      <TButton
                        theme="primary"
                        variant="outline"
                        class="mt-5"
                        :loading="authLoading"
                        @click="submitLogout"
                      >
                        {{
                          authLoading
                            ? t("app.session.working")
                            : t("app.session.signOut")
                        }}
                      </TButton>
                    </template>

                    <form v-else class="mt-5 space-y-4" @submit.prevent="submitLogin">
                      <label class="enterprise-field">
                        <span>{{ t("app.session.username") }}</span>
                        <TInput
                          v-model="loginForm.username"
                          :disabled="authLoading"
                          placeholder="admin"
                          clearable
                        />
                      </label>

                      <label class="enterprise-field">
                        <span>{{ t("app.session.password") }}</span>
                        <TInput
                          v-model="loginForm.password"
                          :disabled="authLoading"
                          type="password"
                          placeholder="admin123"
                        />
                      </label>

                      <TButton
                        type="submit"
                        theme="primary"
                        style="width: 100%"
                        :loading="authLoading"
                        :disabled="
                          loginForm.username.trim().length === 0 ||
                          loginForm.password.trim().length === 0
                        "
                      >
                        {{
                          authLoading
                            ? t("app.session.signingIn")
                            : t("app.session.signIn")
                        }}
                      </TButton>
                    </form>

                    <p
                      v-if="authErrorMessage"
                      class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                    >
                      {{ authErrorMessage }}
                    </p>
                  </section>

                  <section class="enterprise-card">
                    <p class="enterprise-eyebrow">{{ t("app.platform.title") }}</p>
                    <h3 class="enterprise-heading">
                      {{ platform?.manifest.displayName }}
                    </h3>

                    <div class="enterprise-metadata">
                      <div>
                        <span>{{ t("app.platform.version") }}</span>
                        <strong>{{ platform?.manifest.version }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.platform.status") }}</span>
                        <strong class="capitalize">{{
                          localizePlatformStatus(platform?.manifest.status)
                        }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.platform.environment") }}</span>
                        <strong>{{ envName }}</strong>
                      </div>
                    </div>

                    <div class="mt-5">
                      <p class="enterprise-subheading">{{ t("app.platform.capabilities") }}</p>
                      <ul class="enterprise-list">
                        <li
                          v-for="capability in localizedPlatformCapabilities"
                          :key="capability"
                        >
                          {{ capability }}
                        </li>
                      </ul>
                    </div>
                  </section>
                </template>
              </ElyShell>
          </section>
        </template>
      </div>
    </main>
  </TConfigProvider>
</template>

<style scoped>
.enterprise-card {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.9);
  padding: 1.2rem;
  color: #0f172a;
}

.enterprise-eyebrow,
.enterprise-subheading,
.enterprise-kpi-grid span,
.enterprise-metadata span {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-heading {
  margin: 0.7rem 0 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-copy {
  margin: 0.75rem 0 0;
  line-height: 1.75;
  color: #475569;
}

.enterprise-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.enterprise-button {
  border: 1px solid rgba(36, 87, 214, 0.18);
  border-radius: 12px;
  background: linear-gradient(135deg, #2457d6, #173ea6);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.65rem 1rem;
}

.enterprise-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.enterprise-button-ghost {
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
}

.enterprise-button-danger {
  background: linear-gradient(135deg, #dc2626, #7f1d1d);
}

.enterprise-field {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  color: #334155;
}

.token-pill-toggle {
  cursor: pointer;
  appearance: none;
}

.enterprise-kpi-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 1rem;
}

.enterprise-kpi-grid article,
.enterprise-metadata div {
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.92);
  padding: 0.85rem 0.95rem;
}

.enterprise-kpi-grid strong,
.enterprise-metadata strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
}

.enterprise-metadata {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.enterprise-list {
  margin: 0.8rem 0 0;
  padding-left: 1rem;
  color: #475569;
}

.enterprise-list li + li {
  margin-top: 0.45rem;
}

.enterprise-message {
  border-radius: 14px;
  padding: 1rem 1.1rem;
  line-height: 1.75;
}

.enterprise-message-info {
  border: 1px solid rgba(14, 165, 233, 0.18);
  background: rgba(14, 165, 233, 0.08);
  color: #0c4a6e;
}

.enterprise-message-warning {
  border: 1px solid rgba(245, 158, 11, 0.18);
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.enterprise-message-danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.08);
  color: #991b1b;
}

.enterprise-toolbar-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  padding: 0.45rem 0.85rem;
  font-size: 0.78rem;
  color: #475569;
}

.enterprise-footer-note {
  margin-top: 0.25rem;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.88);
  padding: 0.9rem 1rem;
}

.enterprise-footer-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.enterprise-footer-pagination {
  display: flex;
  flex-direction: column;
}

.enterprise-footer-note span {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-footer-note strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
}

.enterprise-footer-note p {
  margin: 0.6rem 0 0;
  color: #475569;
  line-height: 1.65;
}

.enterprise-footer-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.85rem;
  flex-wrap: wrap;
}

.enterprise-footer-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.enterprise-footer-control {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.enterprise-footer-control small {
  color: #64748b;
  font-size: 0.72rem;
}

.enterprise-footer-jump {
  margin-top: 0.85rem;
}

.enterprise-footer-jump-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
}

.workflow-filter-bar {
  display: grid;
  gap: 1rem;
}

.workflow-filter-search {
  margin: 0;
}

.workflow-filter-panel,
.workflow-filter-summary,
.workflow-version-history {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.workflow-filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.workflow-filter-pill,
.workflow-version-card {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.45rem 0.8rem;
}

.workflow-filter-pill-active,
.workflow-version-card-active {
  border-color: rgba(36, 87, 214, 0.3);
  background: rgba(36, 87, 214, 0.1);
  color: #173ea6;
}

.workflow-definition-list,
.workflow-node-list {
  display: grid;
  gap: 0.85rem;
  margin-top: 1.25rem;
}

.workflow-definition-card,
.workflow-node-item {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.96);
  padding: 1rem;
  text-align: left;
  color: #0f172a;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 140ms ease;
}

.workflow-definition-card:hover {
  transform: translateY(-1px);
  border-color: rgba(36, 87, 214, 0.24);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.08);
}

.workflow-definition-card-active {
  border-color: rgba(36, 87, 214, 0.45);
  box-shadow: 0 18px 32px rgba(36, 87, 214, 0.12);
}

.workflow-definition-card-header,
.workflow-node-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
}

.workflow-definition-card-header strong,
.workflow-node-item-header strong {
  display: block;
  font-size: 1rem;
}

.workflow-definition-card-header p {
  margin: 0.35rem 0 0;
  color: #64748b;
}

.workflow-definition-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 0.85rem;
  margin-top: 0.9rem;
  font-size: 0.8rem;
  color: #475569;
}

.workflow-status-pill,
.workflow-node-item-header span {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(36, 87, 214, 0.1);
  color: #173ea6;
  padding: 0.28rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.workflow-node-copy {
  margin: 0.7rem 0 0;
  color: #475569;
  line-height: 1.65;
}

.workflow-version-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  border-radius: 14px;
  padding: 0.7rem 0.85rem;
}

.workflow-version-card small {
  color: #64748b;
}

.enterprise-danger-zone {
  margin-top: 1rem;
  border-radius: 14px;
  border: 1px solid rgba(239, 68, 68, 0.16);
  background: rgba(254, 242, 242, 0.96);
  padding: 0.95rem 1rem;
  color: #991b1b;
}

.enterprise-inline-warning {
  margin-top: 1rem;
  border-radius: 14px;
  border: 1px solid rgba(245, 158, 11, 0.16);
  background: rgba(255, 251, 235, 0.96);
  padding: 0.85rem 0.95rem;
  color: #92400e;
}

@media (max-width: 960px) {
  .enterprise-kpi-grid {
    grid-template-columns: 1fr;
  }

  .enterprise-footer-grid {
    grid-template-columns: 1fr;
  }

  .enterprise-footer-controls {
    grid-template-columns: 1fr;
  }

  .enterprise-footer-jump-row {
    grid-template-columns: 1fr;
  }
}
</style>
