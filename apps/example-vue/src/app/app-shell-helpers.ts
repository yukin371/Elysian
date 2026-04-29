import type { WorkflowDefinitionRecord, WorkflowNode } from "@elysian/schema"
import type { UiNavigationNode } from "@elysian/ui-core"

export type AppTranslate = (
  key: string,
  params?: Record<string, unknown>,
) => string

export type ExampleWorkspaceKind =
  | "customer"
  | "dictionary"
  | "department"
  | "file"
  | "generator-preview"
  | "menu"
  | "notification"
  | "operation-log"
  | "post"
  | "role"
  | "session"
  | "setting"
  | "tenant"
  | "user"
  | "workflow-definitions"
  | "placeholder"

export type ExampleShellTabKey = "workspace" | "runtime"

export const flattenNavigation = (
  items: UiNavigationNode[],
): UiNavigationNode[] =>
  items.flatMap((item) => [item, ...flattenNavigation(item.children)])

export const findNavigationItemById = (
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

export const findFirstMenuItem = (
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

export const resolveModuleCodeFromPath = (path: string | null | undefined) => {
  if (!path) {
    return null
  }

  if (path.startsWith("/customers")) return "customer"
  if (path.startsWith("/system/users")) return "user"
  if (path.startsWith("/system/roles")) return "role"
  if (path.startsWith("/system/menus")) return "menu"
  if (path.startsWith("/system/departments")) return "department"
  if (path.startsWith("/system/posts")) return "post"
  if (path.startsWith("/system/sessions")) return "auth"
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

export const createAppShellLocalization = (t: AppTranslate) => {
  const localizeWorkflowStatus = (
    status: WorkflowDefinitionRecord["status"],
  ) => {
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

  const localizePostStatus = (status: string) => {
    if (status === "active") {
      return t("app.post.status.active")
    }

    if (status === "disabled") {
      return t("app.post.status.disabled")
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

  const localizeRoleBoolean = (value: boolean) =>
    value ? t("app.role.boolean.true") : t("app.role.boolean.false")

  const localizeUserBoolean = (value: boolean) =>
    value ? t("app.user.boolean.true") : t("app.user.boolean.false")

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

  const localizePostFieldLabel = (fieldKey: string) => {
    switch (fieldKey) {
      case "id":
        return t("app.post.field.id")
      case "code":
        return t("app.post.field.code")
      case "name":
        return t("app.post.field.name")
      case "sort":
        return t("app.post.field.sort")
      case "status":
        return t("app.post.field.status")
      case "remark":
        return t("app.post.field.remark")
      case "createdAt":
        return t("app.post.field.createdAt")
      case "updatedAt":
        return t("app.post.field.updatedAt")
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
      case "system-posts":
        return t("app.fallback.posts")
      case "system-sessions":
        return t("app.fallback.onlineSessions")
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
          id: "enterprise-posts",
          parentId: "enterprise-system",
          type: "menu",
          code: "system-posts",
          name: t("app.fallback.posts"),
          path: "/system/posts",
          component: "system/posts/index",
          icon: "idcard",
          sort: 45,
          isVisible: true,
          status: "active",
          permissionCode: "system:post:list",
          depth: 1,
          children: [],
        },
        {
          id: "enterprise-sessions",
          parentId: "enterprise-system",
          type: "menu",
          code: "system-sessions",
          name: t("app.fallback.onlineSessions"),
          path: "/system/sessions",
          component: "system/sessions/index",
          icon: "time",
          sort: 47,
          isVisible: true,
          status: "active",
          permissionCode: null,
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

  return {
    buildFallbackNavigation,
    describeWorkflowNode,
    localizeActionLabel,
    localizeCustomerStatus,
    localizeDepartmentFieldLabel,
    localizeDepartmentStatus,
    localizePostFieldLabel,
    localizePostStatus,
    localizeDictionaryFieldLabel,
    localizeDictionaryStatus,
    localizeFieldLabel,
    localizeMenuBoolean,
    localizeMenuFieldLabel,
    localizeMenuStatus,
    localizeMenuType,
    localizeNavigationItems,
    localizeNotificationFieldLabel,
    localizeNotificationLevel,
    localizeNotificationStatus,
    localizeOperationLogFieldLabel,
    localizeOperationLogResult,
    localizePlatformStatus,
    localizeRoleBoolean,
    localizeRoleDataScope,
    localizeRoleFieldLabel,
    localizeRoleStatus,
    localizeSettingFieldLabel,
    localizeSettingStatus,
    localizeTenantFieldLabel,
    localizeTenantStatus,
    localizeUserBoolean,
    localizeUserFieldLabel,
    localizeUserStatus,
    localizeWorkflowNodeType,
    localizeWorkflowStatus,
  }
}
