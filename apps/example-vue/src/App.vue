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
import { tenantModuleSchema } from "../../../packages/schema/src/tenant"
import { userModuleSchema } from "../../../packages/schema/src/user"
import FileWorkspaceMain from "./components/workspaces/file/FileWorkspaceMain.vue"
import FileWorkspacePanel from "./components/workspaces/file/FileWorkspacePanel.vue"
import GeneratorPreviewWorkspaceMain from "./components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue"
import GeneratorPreviewWorkspacePanel from "./components/workspaces/generator/GeneratorPreviewWorkspacePanel.vue"
import WorkflowWorkspaceMain from "./components/workspaces/workflow/WorkflowWorkspaceMain.vue"
import WorkflowWorkspacePanel from "./components/workspaces/workflow/WorkflowWorkspacePanel.vue"
import { exampleLocaleMessages } from "./i18n"
import { resolveWorkspaceMenuKey } from "./lib/navigation-workspace"
import { resolveOperationLogSelection } from "./lib/operation-log-workspace"
import {
  type AuthIdentityResponse,
  type PlatformResponse,
  clearAccessToken,
  fetchPlatform,
  fetchSystemModules,
  login,
  logout,
  refreshAuth,
} from "./lib/platform-api"
import { resolveSettingSelection } from "./lib/setting-workspace"
import {
  appendStudioNavigation,
  buildStudioNavigation,
} from "./lib/studio-navigation"
import { resolveWorkflowDefinitionSelection } from "./lib/workflow-workspace"
import { useCustomerWorkspace } from "./workspaces/use-customer-workspace"
import { useDepartmentWorkspace } from "./workspaces/use-department-workspace"
import { useDictionaryWorkspace } from "./workspaces/use-dictionary-workspace"
import { useFileWorkspace } from "./workspaces/use-file-workspace"
import { useGeneratorPreviewWorkspace } from "./workspaces/use-generator-preview-workspace"
import { useMenuWorkspace } from "./workspaces/use-menu-workspace"
import { useNotificationWorkspace } from "./workspaces/use-notification-workspace"
import { useOperationLogWorkspace } from "./workspaces/use-operation-log-workspace"
import { useRoleWorkspace } from "./workspaces/use-role-workspace"
import { useSettingWorkspace } from "./workspaces/use-setting-workspace"
import { useTenantWorkspace } from "./workspaces/use-tenant-workspace"
import { useUserWorkspace } from "./workspaces/use-user-workspace"
import { useWorkflowWorkspace } from "./workspaces/use-workflow-workspace"

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
const tenantPageDefinition = buildVueCustomCrudPage(tenantModuleSchema)
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

const localizeTenantStatus = (status: string) => {
  if (status === "active") {
    return t("app.tenant.status.active")
  }

  if (status === "suspended") {
    return t("app.tenant.status.suspended")
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

const localizeTenantFieldLabel = (fieldKey: string) => {
  switch (fieldKey) {
    case "id":
      return t("app.tenant.field.id")
    case "code":
      return t("app.tenant.field.code")
    case "name":
      return t("app.tenant.field.name")
    case "status":
      return t("app.tenant.field.status")
    case "createdAt":
      return t("app.tenant.field.createdAt")
    case "updatedAt":
      return t("app.tenant.field.updatedAt")
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
    case "studio-root":
      return t("app.fallback.studio")
    case "studio-generator-preview":
      return t("app.fallback.generatorPreview")
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
      {
        id: "enterprise-tenants",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-tenants",
        name: t("app.fallback.tenants"),
        path: "/system/tenants",
        component: "system/tenants/index",
        icon: "city-10",
        sort: 100,
        isVisible: true,
        status: "active",
        permissionCode: "system:tenant:list",
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
  | "file"
  | "generator-preview"
  | "menu"
  | "notification"
  | "operation-log"
  | "role"
  | "setting"
  | "tenant"
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
  if (path.startsWith("/studio/generator-preview")) return "generator-preview"

  return null
}

const platform = ref<PlatformResponse | null>(null)
const authIdentity = ref<AuthIdentityResponse | null>(null)
const registeredModuleCodes = ref<string[]>([])
const loading = ref(true)
const authLoading = ref(false)
const errorMessage = ref("")
const authErrorMessage = ref("")
const authModuleReady = ref(false)
const customerModuleReady = ref(false)
const departmentModuleReady = ref(false)
const fileModuleReady = ref(false)
const menuModuleReady = ref(false)
const notificationModuleReady = ref(false)
const operationLogModuleReady = ref(false)
const roleModuleReady = ref(false)
const settingModuleReady = ref(false)
const tenantModuleReady = ref(false)
const userModuleReady = ref(false)
const dictionaryModuleReady = ref(false)
const workflowModuleReady = ref(false)
const envName = ref("unknown")
const demoAdminPassword = ["admin", "123"].join("")

const loginForm = ref({
  username: "admin",
  password: demoAdminPassword,
})

const currentMenuKey = ref<string | null>(null)
const currentShellTabKey = ref<ExampleShellTabKey>("workspace")

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
const studioNavigation = computed(() => buildStudioNavigation(t))

const navigationItemCount = computed(
  () => flattenNavigation(enterpriseNavigation.value).length,
)

const enterpriseNavigation = computed(() =>
  appendStudioNavigation(
    navigationTree.value.length > 0
      ? navigationTree.value
      : fallbackNavigation.value,
    studioNavigation.value,
  ),
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

const isTenantWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/system/tenants",
)

const isUserWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/system/users",
)

const isWorkflowDefinitionsWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/workflow/definitions",
)

const isFileWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/system/files",
)

const isGeneratorPreviewWorkspace = computed(
  () => selectedNavigationItem.value?.path === "/studio/generator-preview",
)

const currentWorkspaceKind = computed<ExampleWorkspaceKind>(() =>
  isCustomerWorkspace.value
    ? "customer"
    : isDictionaryWorkspace.value
      ? "dictionary"
      : isFileWorkspace.value
        ? "file"
        : isGeneratorPreviewWorkspace.value
          ? "generator-preview"
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
                      : isTenantWorkspace.value
                        ? "tenant"
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
    currentModuleCode.value === "generator-preview" ||
    (currentModuleCode.value !== null &&
      registeredModuleCodes.value.includes(currentModuleCode.value)),
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
      : isFileWorkspace.value
        ? t("app.file.sectionTitle")
        : isGeneratorPreviewWorkspace.value
          ? t("app.generatorPreview.sectionTitle")
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
                      : isTenantWorkspace.value
                        ? t("app.tenant.sectionTitle")
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
      : isFileWorkspace.value
        ? t("app.file.sectionCopy")
        : isGeneratorPreviewWorkspace.value
          ? t("app.generatorPreview.sectionCopy")
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
                      : isTenantWorkspace.value
                        ? t("app.tenant.sectionCopy")
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
      : isFileWorkspace.value
        ? t("app.file.shellTitle")
        : isGeneratorPreviewWorkspace.value
          ? t("app.generatorPreview.shellTitle")
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
                      : isTenantWorkspace.value
                        ? t("app.tenant.shellTitle")
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
      : isFileWorkspace.value
        ? t("app.file.shellDescription")
        : isGeneratorPreviewWorkspace.value
          ? t("app.generatorPreview.shellDescription")
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
                      : isTenantWorkspace.value
                        ? t("app.tenant.shellDescription")
                        : isUserWorkspace.value
                          ? t("app.user.shellDescription")
                          : isWorkflowDefinitionsWorkspace.value
                            ? t("app.workflow.shellDescription")
                            : currentModuleReady.value
                              ? t("app.shell.placeholderDescriptionReady", {
                                  name:
                                    selectedNavigationItem.value?.name ?? "",
                                })
                              : t("app.shell.placeholderDescriptionOffline", {
                                  name:
                                    selectedNavigationItem.value?.name ?? "",
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

const filePermissions = usePermissions(
  permissionCodes,
  {
    list: "system:file:list",
    create: "system:file:upload",
    update: "system:file:download",
    delete: "system:file:delete",
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

const tenantPermissions = usePermissions(
  permissionCodes,
  {
    list: "system:tenant:list",
    create: "system:tenant:create",
    update: "system:tenant:update",
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

const canEnterFileWorkspace = computed(
  () =>
    fileModuleReady.value && (!authModuleReady.value || isAuthenticated.value),
)

const canViewFiles = computed(
  () => canEnterFileWorkspace.value && filePermissions.list.value,
)

const canUploadFiles = computed(
  () => canEnterFileWorkspace.value && filePermissions.create.value,
)

const canDownloadFiles = computed(
  () => canEnterFileWorkspace.value && filePermissions.update.value,
)

const canDeleteFiles = computed(
  () => canEnterFileWorkspace.value && filePermissions.delete.value,
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

const canEnterTenantWorkspace = computed(
  () =>
    tenantModuleReady.value &&
    (!authModuleReady.value || isAuthenticated.value),
)

const canManageTenantsAsSuperAdmin = computed(
  () =>
    canEnterTenantWorkspace.value &&
    authIdentity.value?.user.isSuperAdmin === true,
)

const canViewTenants = computed(
  () => canManageTenantsAsSuperAdmin.value && tenantPermissions.list.value,
)

const canCreateTenants = computed(
  () => canManageTenantsAsSuperAdmin.value && tenantPermissions.create.value,
)

const canUpdateTenants = computed(
  () => canManageTenantsAsSuperAdmin.value && tenantPermissions.update.value,
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

const {
  filterSummary: generatorPreviewFilterSummary,
  filteredPreviewFiles: generatorPreviewFiles,
  previewQuery: generatorPreviewQuery,
  resetFilters: resetGeneratorPreviewFilters,
  schemaOptions: generatorPreviewSchemaOptions,
  selectedFilePath: selectedGeneratorPreviewFilePath,
  selectedFrontendTarget: selectedGeneratorPreviewFrontendTarget,
  selectedPreviewFile: selectedGeneratorPreviewFile,
  selectedSchema: selectedGeneratorPreviewSchema,
  selectedSchemaName: selectedGeneratorPreviewSchemaName,
  sqlPreview: generatorPreviewSqlPreview,
} = useGeneratorPreviewWorkspace(t)

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

const {
  canGoToNextCustomerPage,
  canGoToPreviousCustomerPage,
  canJumpToCustomerPage,
  cancelDelete,
  clearWorkspace: clearCustomerWorkspace,
  confirmDelete,
  customerCountLabel,
  customerErrorMessage,
  customerFormMode: enterpriseFormMode,
  customerItems,
  customerListPage,
  customerListPageSize,
  customerListSortValue,
  customerListTotal,
  customerListTotalPages,
  customerLoading,
  customerPageInputValue,
  customerPageSizeOptions,
  customerPaginationSummary,
  customerQuerySummary,
  customerQueryValues: enterpriseQueryValues,
  customerSortOptions,
  deleteConfirmId,
  formFields: enterpriseFormFields,
  formValues: enterpriseFormValues,
  goToFirstCustomerPage,
  goToLastCustomerPage,
  goToNextCustomerPage,
  goToPreviousCustomerPage,
  handleAction: handleEnterpriseAction,
  handleFormCancel: handleEnterpriseFormCancel,
  handleFormSubmit: handleEnterpriseFormSubmit,
  handlePageSizeChange: handleCustomerPageSizeChange,
  handleReset: handleEnterpriseReset,
  handleRowClick: handleEnterpriseRowClick,
  handleSearch: handleEnterpriseSearch,
  handleSortChange: handleCustomerSortChange,
  openCreatePanel,
  panelDescription: enterprisePanelDescription,
  panelTitle: enterprisePanelTitle,
  queryFields: enterpriseQueryFields,
  reloadCustomers,
  requestDelete,
  selectedCustomer,
  selectedCustomerId,
  startEdit,
  submitCustomerPageJump,
  tableActions: enterpriseTableActions,
  tableColumns: enterpriseTableColumns,
  tableItems: enterpriseTableItems,
  updateCustomerPageInput,
} = useCustomerWorkspace({
  currentShellTabKey,
  page: enterpriseCustomerPage,
  locale,
  t,
  localizeFieldLabel,
  localizeStatus: (status) => localizeCustomerStatus(status),
  localizeActionLabel,
  canView: canViewCustomers,
  canCreate: canCreateCustomers,
  canUpdate: canUpdateCustomers,
  canDelete: canDeleteCustomers,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelFilePanel,
  clearWorkspace: clearFileWorkspace,
  confirmDelete: confirmFileDelete,
  countLabel: fileCountLabel,
  downloadSelectedFile,
  fileActionLoading,
  fileDetailErrorMessage,
  fileDetailLoading,
  fileErrorMessage,
  fileItems,
  fileLoading,
  filePanelMode,
  fileQuery,
  filterSummary: fileFilterSummary,
  filteredFileItems,
  openDeletePanel: openFileDeletePanel,
  openUploadPanel: openFileUploadPanel,
  pendingUploadFile,
  reloadFiles,
  resetQuery: resetFileQuery,
  selectFile,
  selectedFile,
  selectedFileId,
  setPendingUploadFile,
  submitUpload: submitFileUpload,
  tableItems: fileTableItems,
  updateQuery: updateFileQuery,
} = useFileWorkspace({
  currentShellTabKey,
  isWorkspaceActive: isFileWorkspace,
  locale,
  t,
  canView: canViewFiles,
  canUpload: canUploadFiles,
  canDownload: canDownloadFiles,
  canDelete: canDeleteFiles,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

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
const enterpriseTenantPage = useElyCrudPage(
  tenantPageDefinition,
  permissionCodes,
)

const {
  cancelPanel: cancelNotificationPanel,
  clearWorkspace: clearNotificationWorkspace,
  countLabel: notificationCountLabel,
  filteredNotificationItems,
  formFields: enterpriseNotificationFormFields,
  formValues: enterpriseNotificationFormValues,
  handleReset: handleNotificationReset,
  handleRowClick: handleNotificationRowClick,
  handleSearch: handleNotificationSearch,
  markSelectedAsRead: markSelectedNotificationAsRead,
  notificationDetail,
  notificationDetailErrorMessage,
  notificationDetailLoading,
  notificationErrorMessage,
  notificationItems,
  notificationLoading,
  notificationPanelMode,
  notificationQueryValues,
  openCreatePanel: openNotificationCreatePanel,
  panelDescription: notificationPanelDescription,
  panelTitle: notificationPanelTitle,
  queryFields: enterpriseNotificationQueryFields,
  reloadNotifications,
  selectedNotification,
  selectedNotificationId,
  selectNotification,
  submitForm: submitNotificationForm,
  tableColumns: enterpriseNotificationTableColumns,
  tableItems: enterpriseNotificationTableItems,
} = useNotificationWorkspace({
  currentShellTabKey,
  page: enterpriseNotificationPage,
  locale,
  t,
  localizeFieldLabel: localizeNotificationFieldLabel,
  localizeLevel: localizeNotificationLevel,
  localizeStatus: localizeNotificationStatus,
  canView: canViewNotifications,
  canCreate: canCreateNotifications,
  canUpdate: canUpdateNotifications,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  clearWorkspace: clearOperationLogWorkspace,
  countLabel: operationLogCountLabel,
  detailFields: enterpriseOperationLogDetailFields,
  detailValues: enterpriseOperationLogDetailValues,
  detailsText: operationLogDetailsText,
  filteredOperationLogItems,
  handleReset: handleOperationLogReset,
  handleRowClick: handleOperationLogRowClick,
  handleSearch: handleOperationLogSearch,
  operationLogDetail,
  operationLogDetailErrorMessage,
  operationLogDetailLoading,
  operationLogErrorMessage,
  operationLogLoading,
  operationLogQueryValues,
  panelDescription: operationLogPanelDescription,
  panelTitle: operationLogPanelTitle,
  queryFields: enterpriseOperationLogQueryFields,
  reloadOperationLogs,
  resetQuery: resetOperationLogQuery,
  selectedOperationLog,
  selectedOperationLogId,
  selectOperationLog,
  tableColumns: enterpriseOperationLogTableColumns,
  tableItems: enterpriseOperationLogTableItems,
} = useOperationLogWorkspace({
  currentShellTabKey,
  page: enterpriseOperationLogPage,
  locale,
  t,
  localizeFieldLabel: localizeOperationLogFieldLabel,
  localizeResult: localizeOperationLogResult,
  canView: canViewOperationLogs,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelDictionaryPanel,
  clearWorkspace: clearDictionaryOptions,
  countLabel: dictionaryCountLabel,
  dictionaryDetailErrorMessage,
  dictionaryDetailLoading,
  dictionaryErrorMessage,
  dictionaryItems,
  dictionaryLoading,
  dictionaryPanelMode,
  dictionaryQueryValues,
  dictionaryTypes,
  filteredDictionaryTypes,
  formFields: enterpriseDictionaryFormFields,
  formValues: enterpriseDictionaryFormValues,
  handleReset: handleDictionaryReset,
  handleRowClick: handleDictionaryRowClick,
  handleSearch: handleDictionarySearch,
  openCreatePanel: openDictionaryCreatePanel,
  panelDescription: dictionaryPanelDescription,
  panelTitle: dictionaryPanelTitle,
  queryFields: enterpriseDictionaryQueryFields,
  reloadDictionaries,
  resetQuery: resetDictionaryQuery,
  selectDictionaryType,
  selectedDictionaryType,
  selectedDictionaryTypeDetail,
  selectedDictionaryTypeId,
  selectedDictionaryTypeItems,
  startEdit: startDictionaryEdit,
  submitForm: submitDictionaryForm,
  tableColumns: enterpriseDictionaryTableColumns,
  tableItems: enterpriseDictionaryTableItems,
} = useDictionaryWorkspace({
  currentShellTabKey,
  page: enterpriseDictionaryPage,
  locale,
  t,
  localizeFieldLabel: localizeDictionaryFieldLabel,
  localizeStatus: localizeDictionaryStatus,
  canView: canViewDictionaries,
  canCreate: canCreateDictionaryTypes,
  canUpdate: canUpdateDictionaryTypes,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelDepartmentPanel,
  clearWorkspace: clearDepartmentWorkspace,
  countLabel: departmentCountLabel,
  departmentDetail,
  departmentDetailErrorMessage,
  departmentDetailLoading,
  departmentErrorMessage,
  departmentLoading,
  departmentPanelMode,
  departmentQueryValues,
  filteredDepartmentItems,
  formFields: enterpriseDepartmentFormFields,
  formValues: enterpriseDepartmentFormValues,
  handleReset: handleDepartmentReset,
  handleRowClick: handleDepartmentRowClick,
  handleSearch: handleDepartmentSearch,
  openCreatePanel: openDepartmentCreatePanel,
  panelDescription: departmentPanelDescription,
  panelTitle: departmentPanelTitle,
  parentLookup: departmentParentLookup,
  queryFields: enterpriseDepartmentQueryFields,
  reloadDepartments,
  resetQuery: resetDepartmentQuery,
  selectDepartment,
  selectedDepartment,
  selectedDepartmentDetail,
  selectedDepartmentId,
  startEdit: startDepartmentEdit,
  submitForm: submitDepartmentForm,
  tableColumns: enterpriseDepartmentTableColumns,
  tableItems: enterpriseDepartmentTableItems,
} = useDepartmentWorkspace({
  currentShellTabKey,
  page: enterpriseDepartmentPage,
  locale,
  t,
  localizeFieldLabel: localizeDepartmentFieldLabel,
  localizeStatus: localizeDepartmentStatus,
  canView: canViewDepartments,
  canCreate: canCreateDepartments,
  canUpdate: canUpdateDepartments,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelMenuPanel,
  clearWorkspace: clearMenuWorkspace,
  countLabel: menuCountLabel,
  filteredMenuItems,
  formFields: enterpriseMenuFormFields,
  formValues: enterpriseMenuFormValues,
  handleReset: handleMenuReset,
  handleRowClick: handleMenuRowClick,
  handleSearch: handleMenuSearch,
  menuDetail,
  menuDetailErrorMessage,
  menuDetailLoading,
  menuErrorMessage,
  menuLoading,
  menuPanelMode,
  menuQueryValues,
  openCreatePanel: openMenuCreatePanel,
  panelDescription: menuPanelDescription,
  panelTitle: menuPanelTitle,
  parentLookup: menuParentLookup,
  queryFields: enterpriseMenuQueryFields,
  reloadMenus,
  resetQuery: resetMenuQuery,
  selectMenu,
  selectedMenu,
  selectedMenuDetail,
  selectedMenuId,
  startEdit: startMenuEdit,
  submitForm: submitMenuForm,
  tableColumns: enterpriseMenuTableColumns,
  tableItems: enterpriseMenuTableItems,
} = useMenuWorkspace({
  currentShellTabKey,
  page: enterpriseMenuPage,
  locale,
  t,
  localizeFieldLabel: localizeMenuFieldLabel,
  localizeType: localizeMenuType,
  localizeBoolean: localizeMenuBoolean,
  localizeStatus: localizeMenuStatus,
  canView: canViewMenus,
  canCreate: canCreateMenus,
  canUpdate: canUpdateMenus,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelRolePanel,
  clearWorkspace: clearRoleWorkspace,
  countLabel: roleCountLabel,
  filteredRoleItems,
  formFields: enterpriseRoleFormFields,
  formValues: enterpriseRoleFormValues,
  handleReset: handleRoleReset,
  handleRowClick: handleRoleRowClick,
  handleSearch: handleRoleSearch,
  openCreatePanel: openRoleCreatePanel,
  panelDescription: rolePanelDescription,
  panelTitle: rolePanelTitle,
  queryFields: enterpriseRoleQueryFields,
  reloadRoles,
  resetQuery: resetRoleQuery,
  roleDetail,
  roleDetailErrorMessage,
  roleDetailLoading,
  roleErrorMessage,
  roleLoading,
  rolePanelMode,
  roleQueryValues,
  selectRole,
  selectedRole,
  selectedRoleDetail,
  selectedRoleId,
  startEdit: startRoleEdit,
  submitForm: submitRoleForm,
  tableColumns: enterpriseRoleTableColumns,
  tableItems: enterpriseRoleTableItems,
} = useRoleWorkspace({
  currentShellTabKey,
  page: enterpriseRolePage,
  locale,
  t,
  localizeFieldLabel: localizeRoleFieldLabel,
  localizeStatus: localizeRoleStatus,
  localizeBoolean: (value) =>
    value ? t("app.role.boolean.true") : t("app.role.boolean.false"),
  localizeDataScope: localizeRoleDataScope,
  canView: canViewRoles,
  canCreate: canCreateRoles,
  canUpdate: canUpdateRoles,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelTenantPanel,
  clearWorkspace: clearTenantWorkspace,
  countLabel: tenantCountLabel,
  filteredTenantItems,
  formFields: enterpriseTenantFormFields,
  formValues: enterpriseTenantFormValues,
  handleReset: handleTenantReset,
  handleRowClick: handleTenantRowClick,
  handleSearch: handleTenantSearch,
  openCreatePanel: openTenantCreatePanel,
  panelDescription: tenantPanelDescription,
  panelTitle: tenantPanelTitle,
  queryFields: enterpriseTenantQueryFields,
  reloadTenants,
  resetQuery: resetTenantQuery,
  selectTenant,
  selectedTenant,
  selectedTenantId,
  startEdit: startTenantEdit,
  submitForm: submitTenantForm,
  tableColumns: enterpriseTenantTableColumns,
  tableItems: enterpriseTenantTableItems,
  tenantDetail,
  tenantDetailErrorMessage,
  tenantDetailLoading,
  tenantErrorMessage,
  tenantLoading,
  tenantPanelMode,
  tenantQueryValues,
  toggleSelectedStatus: toggleSelectedTenantStatus,
} = useTenantWorkspace({
  currentShellTabKey,
  page: enterpriseTenantPage,
  locale,
  t,
  localizeFieldLabel: localizeTenantFieldLabel,
  localizeStatus: localizeTenantStatus,
  canView: canViewTenants,
  canCreate: canCreateTenants,
  canUpdate: canUpdateTenants,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelUserPanel,
  clearWorkspace: clearUserWorkspace,
  countLabel: userCountLabel,
  filteredUserItems,
  formFields: enterpriseUserFormFields,
  formValues: enterpriseUserFormValues,
  handleReset: handleUserReset,
  handleRowClick: handleUserRowClick,
  handleSearch: handleUserSearch,
  openCreatePanel: openUserCreatePanel,
  panelDescription: userPanelDescription,
  panelTitle: userPanelTitle,
  queryFields: enterpriseUserQueryFields,
  reloadUsers,
  selectedUser,
  selectedUserId,
  startEdit: startUserEdit,
  startPasswordReset: startUserPasswordReset,
  submitForm: submitUserForm,
  submitPasswordReset: submitUserPasswordReset,
  tableColumns: enterpriseUserTableColumns,
  tableItems: enterpriseUserTableItems,
  userErrorMessage,
  userLoading,
  userPanelMode,
  userPasswordInput,
  userQueryValues,
} = useUserWorkspace({
  currentShellTabKey,
  page: enterpriseUserPage,
  locale,
  t,
  localizeFieldLabel: localizeUserFieldLabel,
  localizeStatus: localizeUserStatus,
  localizeBoolean: (value) =>
    value ? t("app.user.boolean.true") : t("app.user.boolean.false"),
  canView: canViewUsers,
  canCreate: canCreateUsers,
  canUpdate: canUpdateUsers,
  canResetPassword: canResetUserPasswords,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  clearWorkflowDefinitions,
  handleWorkflowDefinitionSelect,
  reloadWorkflowDefinitions,
  resetWorkflowFilters,
  selectWorkflowDefinition,
  selectedWorkflowDefinition,
  selectedWorkflowDefinitionId,
  setWorkflowStatusFilter,
  workflowDefinitionCards,
  workflowDefinitionDetailCards,
  workflowDefinitions,
  workflowDetailErrorMessage,
  workflowDetailLoading,
  workflowErrorMessage,
  workflowFilterSummary,
  workflowLoading,
  workflowQuery,
  workflowStatusFilter,
  workflowVersionHistoryCards,
} = useWorkflowWorkspace({
  currentShellTabKey,
  locale,
  t,
  localizeStatus: localizeWorkflowStatus,
  localizeNodeType: localizeWorkflowNodeType,
  describeNode: describeWorkflowNode,
  canView: canViewWorkflowDefinitions,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
})

const {
  cancelPanel: cancelSettingPanel,
  clearWorkspace: clearSettingWorkspace,
  countLabel: settingCountLabel,
  filteredSettingItems,
  formFields: enterpriseSettingFormFields,
  formValues: enterpriseSettingFormValues,
  handleReset: handleSettingReset,
  handleRowClick: handleSettingRowClick,
  handleSearch: handleSettingSearch,
  openCreatePanel: openSettingCreatePanel,
  panelDescription: settingPanelDescription,
  panelTitle: settingPanelTitle,
  queryFields: enterpriseSettingQueryFields,
  reloadSettings,
  resetQuery: resetSettingQuery,
  selectedSetting,
  selectedSettingId,
  selectSetting,
  settingDetail,
  settingDetailErrorMessage,
  settingDetailLoading,
  settingErrorMessage,
  settingLoading,
  settingPanelMode,
  settingQueryValues,
  startEdit: startSettingEdit,
  submitForm: submitSettingForm,
  tableColumns: enterpriseSettingTableColumns,
  tableItems: enterpriseSettingTableItems,
} = useSettingWorkspace({
  currentShellTabKey,
  page: enterpriseSettingPage,
  locale,
  t,
  localizeFieldLabel: localizeSettingFieldLabel,
  localizeStatus: localizeSettingStatus,
  canView: canViewSettings,
  canCreate: canCreateSettings,
  canUpdate: canUpdateSettings,
  onRecoverableAuthError: (error) => {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  },
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

  if (isTenantWorkspace.value) {
    return filteredTenantItems.value.length
  }

  if (isUserWorkspace.value) {
    return filteredUserItems.value.length
  }

  if (isWorkflowDefinitionsWorkspace.value) {
    return workflowDefinitionCards.value.length
  }

  if (isFileWorkspace.value) {
    return filteredFileItems.value.length
  }

  if (isGeneratorPreviewWorkspace.value) {
    return generatorPreviewFiles.value.length
  }

  return 0
})

const currentWorkspaceItemHint = computed(() => {
  if (isGeneratorPreviewWorkspace.value) {
    return t("app.generatorPreview.statsHint")
  }

  if (isWorkflowDefinitionsWorkspace.value) {
    return t("app.workflow.statsHint")
  }

  if (isFileWorkspace.value) {
    return t("app.file.statsHint")
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

  if (isTenantWorkspace.value) {
    return t("app.tenant.statsHint")
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
        : isFileWorkspace.value
          ? t("app.file.tabsHint", {
              count: filteredFileItems.value.length,
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
                      : isTenantWorkspace.value
                        ? t("app.tenant.tabsHint", {
                            count: filteredTenantItems.value.length,
                          })
                        : isUserWorkspace.value
                          ? t("app.user.tabsHint", {
                              count: filteredUserItems.value.length,
                            })
                          : isGeneratorPreviewWorkspace.value
                            ? t("app.generatorPreview.tabsHint", {
                                count: generatorPreviewFiles.value.length,
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
    hint:
      authStatusState.value === "offline"
        ? t("app.tabs.runtimePreview")
        : t("app.tabs.runtimeSessionAware"),
  },
])

const enterpriseSelectedTabKey = computed(() => currentShellTabKey.value)
const isRuntimeShellTab = computed(
  () => enterpriseSelectedTabKey.value === "runtime",
)

const shellWorkspaceTitle = computed(() =>
  isRuntimeShellTab.value
    ? t("app.runtime.title")
    : currentWorkspaceTitle.value,
)

const shellWorkspaceDescription = computed(() =>
  isRuntimeShellTab.value
    ? t("app.runtime.copy")
    : currentWorkspaceDescription.value,
)

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

  if (isTenantWorkspace.value) {
    const fragments: string[] = []

    if (
      typeof tenantQueryValues.value.code === "string" &&
      tenantQueryValues.value.code.trim()
    ) {
      fragments.push(
        `${t("app.tenant.field.code")}: ${tenantQueryValues.value.code.trim()}`,
      )
    }

    if (
      typeof tenantQueryValues.value.name === "string" &&
      tenantQueryValues.value.name.trim()
    ) {
      fragments.push(
        `${t("app.tenant.field.name")}: ${tenantQueryValues.value.name.trim()}`,
      )
    }

    if (
      typeof tenantQueryValues.value.status === "string" &&
      tenantQueryValues.value.status
    ) {
      fragments.push(
        `${t("app.tenant.field.status")}: ${localizeTenantStatus(
          tenantQueryValues.value.status,
        )}`,
      )
    }

    return fragments.length > 0 ? fragments.join(" / ") : t("app.filter.none")
  }

  return customerQuerySummary.value
})

const openCustomerWorkspace = () => {
  if (!customerNavigationItem.value) {
    return
  }

  currentMenuKey.value = customerNavigationItem.value.id
  currentShellTabKey.value = "workspace"
}

const openCurrentWorkspaceTab = () => {
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

    const nextOperationLogId = resolveOperationLogSelection(
      items,
      selectedOperationLogId.value,
    )
    const nextOperationLog = items.find(
      (item) => item.id === nextOperationLogId,
    )

    if (
      nextOperationLog &&
      nextOperationLogId !== selectedOperationLogId.value
    ) {
      await selectOperationLog(nextOperationLog)
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

    const nextSettingId = resolveSettingSelection(
      items,
      selectedSettingId.value,
    )
    const nextSetting = items.find((item) => item.id === nextSettingId)

    if (nextSetting && nextSettingId !== selectedSettingId.value) {
      await selectSetting(nextSetting)
    }
  },
  {
    immediate: true,
  },
)

watch(
  filteredTenantItems,
  async (items) => {
    if (
      !isTenantWorkspace.value ||
      tenantLoading.value ||
      tenantPanelMode.value !== "detail"
    ) {
      return
    }

    if (items.length === 0) {
      selectedTenantId.value = null
      tenantDetail.value = null

      if (canCreateTenants.value) {
        tenantPanelMode.value = "create"
      }

      return
    }

    if (
      !selectedTenantId.value ||
      !items.some((item) => item.id === selectedTenantId.value)
    ) {
      await selectTenant(items[0])
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

const submitLogin = async () => {
  if (!authModuleReady.value || authLoading.value) {
    return
  }

  authLoading.value = true
  authErrorMessage.value = ""

  try {
    authIdentity.value = await login(loginForm.value)
    await reloadFiles()
    await reloadNotifications()
    await reloadDictionaries()
    await reloadCustomers()
    await reloadDepartments()
    await reloadMenus()
    await reloadOperationLogs()
    await reloadRoles()
    await reloadSettings()
    await reloadTenants()
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
    clearCustomerWorkspace()
    clearDictionaryOptions()
    clearFileWorkspace()
    clearNotificationWorkspace()
    clearDepartmentWorkspace()
    clearMenuWorkspace()
    clearOperationLogWorkspace()
    clearRoleWorkspace()
    clearSettingWorkspace()
    clearTenantWorkspace()
    clearUserWorkspace()
    clearWorkflowDefinitions()
    enterpriseFormMode.value = "create"
    resetDepartmentQuery()
    resetMenuQuery()
    resetOperationLogQuery()
    resetRoleQuery()
    resetSettingQuery()
    resetTenantQuery()
    handleUserReset()
    notificationQueryValues.value = {}
    authLoading.value = false
  }
}

const handleShellMenuSelect = (menuKey: string) => {
  const nextMenuKey = resolveWorkspaceMenuKey(
    enterpriseNavigation.value,
    menuKey,
  )

  if (!nextMenuKey) {
    return
  }

  currentMenuKey.value = nextMenuKey
  currentShellTabKey.value = "workspace"
}

const handleShellTabSelect = (tabKey: string) => {
  if (tabKey !== "workspace" && tabKey !== "runtime") {
    return
  }

  currentShellTabKey.value = tabKey
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
    fileModuleReady.value = modulePayload.modules.includes("file")
    menuModuleReady.value = modulePayload.modules.includes("menu")
    notificationModuleReady.value =
      modulePayload.modules.includes("notification")
    operationLogModuleReady.value =
      modulePayload.modules.includes("operation-log")
    roleModuleReady.value = modulePayload.modules.includes("role")
    settingModuleReady.value = modulePayload.modules.includes("setting")
    tenantModuleReady.value = modulePayload.modules.includes("tenant")
    userModuleReady.value = modulePayload.modules.includes("user")
    dictionaryModuleReady.value = modulePayload.modules.includes("dictionary")
    workflowModuleReady.value = modulePayload.modules.includes("workflow")

    await restoreSession()
    await reloadFiles()
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
    await reloadTenants()
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
                :workspace-title="shellWorkspaceTitle"
                :workspace-description="shellWorkspaceDescription"
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
                  <template v-if="!isRuntimeShellTab">
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
                      v-if="isTenantWorkspace"
                      size="small"
                      theme="primary"
                      variant="outline"
                      :disabled="!canCreateTenants"
                      @click="openTenantCreatePanel"
                    >
                      {{ t("app.action.newTenant") }}
                    </TButton>
                    <TButton
                      v-if="isTenantWorkspace"
                      size="small"
                      theme="default"
                      variant="outline"
                      :disabled="tenantLoading || !canViewTenants"
                      @click="reloadTenants"
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
                      v-if="isFileWorkspace"
                      size="small"
                      theme="default"
                      variant="outline"
                      :loading="fileLoading"
                      :disabled="fileLoading || (!canViewFiles && !canUploadFiles)"
                      @click="reloadFiles"
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
                  </template>
                  <TButton
                    v-if="isRuntimeShellTab"
                    size="small"
                    theme="default"
                    variant="outline"
                    @click="openCurrentWorkspaceTab"
                  >
                    {{ t("app.runtime.backToWorkspace") }}
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

                  <WorkflowWorkspaceMain
                    v-else-if="currentWorkspaceKind === 'workflow-definitions'"
                    :t="t"
                    :module-ready="workflowModuleReady"
                    :auth-module-ready="authModuleReady"
                    :is-authenticated="isAuthenticated"
                    :can-enter-workspace="canEnterWorkflowWorkspace"
                    :can-view-definitions="canViewWorkflowDefinitions"
                    :error-message="workflowErrorMessage"
                    :loading="workflowLoading"
                    :query="workflowQuery"
                    :status-filter="workflowStatusFilter"
                    :filter-summary="workflowFilterSummary"
                    :definition-cards="workflowDefinitionCards"
                    :definition-count="workflowDefinitions.length"
                    :selected-definition-id="selectedWorkflowDefinitionId"
                    @update:query="workflowQuery = $event"
                    @select-definition="handleWorkflowDefinitionSelect"
                    @select-status-filter="setWorkflowStatusFilter"
                    @reset-filters="resetWorkflowFilters"
                  />

                  <FileWorkspaceMain
                    v-else-if="currentWorkspaceKind === 'file'"
                    :t="t"
                    :module-ready="fileModuleReady"
                    :auth-module-ready="authModuleReady"
                    :is-authenticated="isAuthenticated"
                    :can-enter-workspace="canEnterFileWorkspace"
                    :can-view-files="canViewFiles"
                    :can-upload-files="canUploadFiles"
                    :error-message="fileErrorMessage"
                    :loading="fileLoading"
                    :query="fileQuery"
                    :filter-summary="fileFilterSummary"
                    :count-label="fileCountLabel"
                    :table-items="fileTableItems"
                    :selected-file-id="selectedFileId"
                    @update:query="updateFileQuery"
                    @reset-filters="resetFileQuery"
                    @select-file="
                      (fileId) => {
                        const nextFile = fileItems.find((item) => item.id === fileId)

                        if (nextFile) {
                          void selectFile(nextFile)
                        }
                      }
                    "
                    @open-upload="openFileUploadPanel"
                  />

                  <GeneratorPreviewWorkspaceMain
                    v-else-if="currentWorkspaceKind === 'generator-preview'"
                    :t="t"
                    :schema-options="generatorPreviewSchemaOptions"
                    :selected-schema-name="selectedGeneratorPreviewSchemaName"
                    :selected-frontend-target="selectedGeneratorPreviewFrontendTarget"
                    :query="generatorPreviewQuery"
                    :filter-summary="generatorPreviewFilterSummary"
                    :files="generatorPreviewFiles"
                    :selected-file-path="selectedGeneratorPreviewFilePath"
                    @update:selected-schema-name="selectedGeneratorPreviewSchemaName = $event"
                    @update:selected-frontend-target="selectedGeneratorPreviewFrontendTarget = $event"
                    @update:query="generatorPreviewQuery = $event"
                    @select-file="selectedGeneratorPreviewFilePath = $event"
                    @reset-filters="resetGeneratorPreviewFilters"
                  />

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
                    v-else-if="currentWorkspaceKind === 'tenant'"
                    class="enterprise-card enterprise-main-card"
                  >
                    <div
                      v-if="!tenantModuleReady"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.tenantModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-message enterprise-message-info"
                    >
                      {{ t("app.message.tenantSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="
                        authModuleReady &&
                        isAuthenticated &&
                        !authIdentity?.user.isSuperAdmin
                      "
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.tenantSuperAdminRequired") }}
                    </div>

                    <div
                      v-else-if="canEnterTenantWorkspace && !canViewTenants"
                      class="enterprise-message enterprise-message-warning"
                    >
                      {{ t("app.message.tenantNoListPermission") }}
                    </div>

                    <div
                      v-else-if="tenantErrorMessage"
                      class="enterprise-message enterprise-message-danger"
                    >
                      {{ tenantErrorMessage }}
                    </div>

                    <ElyCrudWorkspace
                      v-else
                      :eyebrow="t('app.tenant.workspaceEyebrow')"
                      :title="t('app.tenant.workspaceTitle')"
                      :description="t('app.tenant.workspaceDescription')"
                      :query-fields="enterpriseTenantQueryFields"
                      :query-loading="tenantLoading"
                      :table-columns="enterpriseTenantTableColumns"
                      :items="enterpriseTenantTableItems"
                      :table-loading="tenantLoading"
                      :table-actions="[]"
                      :item-count-label="tenantCountLabel"
                      :empty-title="t('app.tenant.emptyTitle')"
                      :empty-description="t('app.tenant.emptyDescription')"
                      :copy="enterpriseCrudCopy"
                      @search="handleTenantSearch"
                      @reset="handleTenantReset"
                      @row-click="handleTenantRowClick"
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
                                    @update:model-value="updateCustomerPageInput"
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
                  <section v-if="isRuntimeShellTab" class="enterprise-card">
                    <p class="enterprise-eyebrow">{{ t("app.runtime.sideEyebrow") }}</p>
                    <h3 class="enterprise-heading">{{ t("app.runtime.sideTitle") }}</h3>
                    <p class="enterprise-copy">{{ t("app.runtime.sideDescription") }}</p>

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
                        <span>{{ t("app.runtime.sideAuthLabel") }}</span>
                        <strong>{{ authStatusLabel }}</strong>
                      </div>
                      <div>
                        <span>{{ t("app.runtime.sideModuleCodeLabel") }}</span>
                        <strong>{{ currentModuleCodeLabel }}</strong>
                      </div>
                    </div>

                    <div class="mt-5">
                      <p class="enterprise-subheading">
                        {{ t("app.runtime.sideDecisionTitle") }}
                      </p>
                      <ul class="enterprise-list">
                        <li>{{ t("app.runtime.sideDecisionTab") }}</li>
                        <li>{{ t("app.runtime.sideDecisionOwner") }}</li>
                        <li>{{ t("app.runtime.sideDecisionFallback") }}</li>
                      </ul>
                    </div>
                  </section>

                  <section
                    v-else-if="currentWorkspaceKind === 'placeholder'"
                    class="enterprise-card"
                  >
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
                    v-else-if="currentWorkspaceKind === 'tenant'"
                    class="enterprise-card"
                  >
                    <p class="enterprise-eyebrow">{{ t("app.tenant.detailEyebrow") }}</p>
                    <h3 class="enterprise-heading">{{ tenantPanelTitle }}</h3>
                    <p class="enterprise-copy">{{ tenantPanelDescription }}</p>

                    <div
                      v-if="!tenantModuleReady"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.tenantModuleOffline") }}
                    </div>

                    <div
                      v-else-if="authModuleReady && !isAuthenticated"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.tenantSignInToLoad") }}
                    </div>

                    <div
                      v-else-if="
                        authModuleReady &&
                        isAuthenticated &&
                        !authIdentity?.user.isSuperAdmin
                      "
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.tenantSuperAdminRequired") }}
                    </div>

                    <div
                      v-else-if="canEnterTenantWorkspace && !canViewTenants"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.message.tenantNoListPermission") }}
                    </div>

                    <div
                      v-else-if="tenantErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ tenantErrorMessage }}
                    </div>

                    <div
                      v-else-if="tenantDetailLoading && selectedTenant"
                      class="enterprise-inline-warning"
                    >
                      {{ t("app.tenant.detailLoading") }}
                    </div>

                    <div
                      v-else-if="tenantDetailErrorMessage"
                      class="enterprise-inline-warning"
                    >
                      {{ tenantDetailErrorMessage }}
                    </div>

                    <template v-else-if="tenantPanelMode === 'detail' && selectedTenant">
                      <div class="enterprise-button-row">
                        <button
                          v-if="canUpdateTenants"
                          type="button"
                          class="enterprise-button"
                          :disabled="tenantLoading || tenantDetailLoading"
                          @click="startTenantEdit(selectedTenant)"
                        >
                          {{ t("app.tenant.action.edit") }}
                        </button>
                        <button
                          v-if="canUpdateTenants"
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          :disabled="tenantLoading || tenantDetailLoading"
                          @click="toggleSelectedTenantStatus"
                        >
                          {{
                            selectedTenant.status === "active"
                              ? t("app.tenant.action.suspend")
                              : t("app.tenant.action.activate")
                          }}
                        </button>
                        <button
                          v-if="canCreateTenants"
                          type="button"
                          class="enterprise-button enterprise-button-ghost"
                          @click="openTenantCreatePanel"
                        >
                          {{ t("app.tenant.action.create") }}
                        </button>
                      </div>

                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseTenantFormFields"
                        :values="enterpriseTenantFormValues"
                        readonly
                        :loading="tenantLoading || tenantDetailLoading"
                        :copy="enterpriseFormCopy"
                      />
                    </template>

                    <template
                      v-else-if="
                        tenantPanelMode === 'create' || tenantPanelMode === 'edit'
                      "
                    >
                      <ElyForm
                        class="mt-5"
                        :fields="enterpriseTenantFormFields"
                        :values="enterpriseTenantFormValues"
                        :loading="tenantLoading || tenantDetailLoading"
                        :copy="enterpriseFormCopy"
                        @submit="submitTenantForm"
                        @cancel="cancelTenantPanel"
                      />
                    </template>

                    <div
                      v-else
                      class="enterprise-inline-warning mt-5"
                    >
                      {{ t("app.tenant.detailEmptyDescription") }}
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

                  <WorkflowWorkspacePanel
                    v-else-if="currentWorkspaceKind === 'workflow-definitions'"
                    :t="t"
                    :locale="locale"
                    :detail-loading="workflowDetailLoading"
                    :detail-error-message="workflowDetailErrorMessage"
                    :selected-definition="selectedWorkflowDefinition"
                    :selected-definition-id="selectedWorkflowDefinitionId"
                    :version-history-cards="workflowVersionHistoryCards"
                    :detail-cards="workflowDefinitionDetailCards"
                    :localize-status="localizeWorkflowStatus"
                    @select-definition="handleWorkflowDefinitionSelect"
                  />

                  <FileWorkspacePanel
                    v-else-if="currentWorkspaceKind === 'file'"
                    :t="t"
                    :locale="locale"
                    :module-ready="fileModuleReady"
                    :auth-module-ready="authModuleReady"
                    :is-authenticated="isAuthenticated"
                    :can-view-files="canViewFiles"
                    :can-upload-files="canUploadFiles"
                    :can-download-files="canDownloadFiles"
                    :can-delete-files="canDeleteFiles"
                    :loading="fileLoading"
                    :detail-loading="fileDetailLoading"
                    :action-loading="fileActionLoading"
                    :error-message="fileErrorMessage"
                    :detail-error-message="fileDetailErrorMessage"
                    :panel-mode="filePanelMode"
                    :selected-file="selectedFile"
                    :pending-upload-file="pendingUploadFile"
                    @set-upload-file="setPendingUploadFile"
                    @submit-upload="submitFileUpload"
                    @download-selected="downloadSelectedFile"
                    @open-delete="openFileDeletePanel"
                    @confirm-delete="confirmFileDelete"
                    @cancel-panel="cancelFilePanel"
                  />

                  <GeneratorPreviewWorkspacePanel
                    v-else-if="currentWorkspaceKind === 'generator-preview'"
                    :t="t"
                    :selected-schema-name="
                      selectedGeneratorPreviewSchema?.name ??
                      selectedGeneratorPreviewSchemaName
                    "
                    :selected-frontend-target="
                      selectedGeneratorPreviewFrontendTarget
                    "
                    :selected-file="selectedGeneratorPreviewFile"
                    :sql-preview="generatorPreviewSqlPreview"
                  />

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
