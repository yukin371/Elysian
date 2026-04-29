import { buildVueNavigation } from "@elysian/frontend-vue"
import type { UiNavigationNode } from "@elysian/ui-core"
import { type Ref, computed, ref, watch } from "vue"

import type { AuthIdentityResponse } from "../lib/platform-api"
import {
  appendStudioNavigation,
  buildStudioNavigation,
} from "../lib/studio-navigation"
import {
  type AppTranslate,
  type ExampleShellTabKey,
  type ExampleWorkspaceKind,
  findFirstMenuItem,
  findNavigationItemById,
  flattenNavigation,
  resolveModuleCodeFromPath,
} from "./app-shell-helpers"

interface UseExampleNavigationOptions {
  authIdentity: Ref<AuthIdentityResponse | null>
  registeredModuleCodes: Ref<string[]>
  t: AppTranslate
  localizeNavigationItems: (items: UiNavigationNode[]) => UiNavigationNode[]
  buildFallbackNavigation: () => UiNavigationNode[]
}

const appendSessionNavigation = (
  items: UiNavigationNode[],
  t: AppTranslate,
) => {
  const hasSessionEntry = flattenNavigation(items).some(
    (item) => item.path === "/system/sessions",
  )

  if (hasSessionEntry) {
    return items
  }

  const sessionItem: UiNavigationNode = {
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
  }

  const systemIndex = items.findIndex((item) => item.code === "system-root")

  if (systemIndex < 0) {
    return [...items, sessionItem]
  }

  return items.map((item, index) =>
    index === systemIndex
      ? {
          ...item,
          children: [...item.children, sessionItem].sort(
            (left, right) => left.sort - right.sort,
          ),
        }
      : item,
  )
}

export const useExampleNavigation = ({
  authIdentity,
  registeredModuleCodes,
  t,
  localizeNavigationItems,
  buildFallbackNavigation,
}: UseExampleNavigationOptions) => {
  const currentMenuKey = ref<string | null>(null)
  const currentShellTabKey = ref<ExampleShellTabKey>("workspace")

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

  const enterpriseNavigation = computed(() =>
    appendStudioNavigation(
      appendSessionNavigation(
        navigationTree.value.length > 0
          ? navigationTree.value
          : fallbackNavigation.value,
        t,
      ),
      studioNavigation.value,
    ),
  )

  const navigationItemCount = computed(
    () => flattenNavigation(enterpriseNavigation.value).length,
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
        ? findNavigationItemById(
            enterpriseNavigation.value,
            currentMenuKey.value,
          )
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
  const isPostWorkspace = computed(
    () => selectedNavigationItem.value?.path === "/system/posts",
  )
  const isSessionWorkspace = computed(
    () => selectedNavigationItem.value?.path === "/system/sessions",
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
              : isPostWorkspace.value
                ? "post"
                : isSessionWorkspace.value
                  ? "session"
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
    () =>
      selectedNavigationItem.value?.path ?? t("app.placeholder.pathMissing"),
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
                            : isPostWorkspace.value
                              ? t("app.post.sectionTitle")
                              : isSessionWorkspace.value
                                ? t("app.onlineSession.sectionTitle")
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
                            : isPostWorkspace.value
                              ? t("app.post.sectionCopy")
                              : isSessionWorkspace.value
                                ? t("app.onlineSession.sectionCopy")
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
                            : isPostWorkspace.value
                              ? t("app.post.shellTitle")
                              : isSessionWorkspace.value
                                ? t("app.onlineSession.shellTitle")
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
                            : isPostWorkspace.value
                              ? t("app.post.shellDescription")
                              : isSessionWorkspace.value
                                ? t("app.onlineSession.shellDescription")
                                : isWorkflowDefinitionsWorkspace.value
                                  ? t("app.workflow.shellDescription")
                                  : currentModuleReady.value
                                    ? t(
                                        "app.shell.placeholderDescriptionReady",
                                        {
                                          name:
                                            selectedNavigationItem.value
                                              ?.name ?? "",
                                        },
                                      )
                                    : t(
                                        "app.shell.placeholderDescriptionOffline",
                                        {
                                          name:
                                            selectedNavigationItem.value
                                              ?.name ?? "",
                                        },
                                      ),
  )

  const enterpriseSelectedMenuKey = computed(
    () => selectedNavigationItem.value?.id ?? null,
  )
  const enterpriseSelectedTabKey = computed(() => currentShellTabKey.value)
  const isRuntimeShellTab = computed(
    () => enterpriseSelectedTabKey.value === "runtime",
  )

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

  return {
    currentMenuKey,
    currentModuleCode,
    currentModuleCodeLabel,
    currentModuleReady,
    currentModuleStatusLabel,
    currentNavigationPath,
    currentShellTabKey,
    currentWorkspaceDescription,
    currentWorkspaceKind,
    currentWorkspaceSectionCopy,
    currentWorkspaceSectionTitle,
    currentWorkspaceTitle,
    customerNavigationItem,
    enterpriseNavigation,
    enterpriseSelectedMenuKey,
    enterpriseSelectedTabKey,
    isCustomerWorkspace,
    isDepartmentWorkspace,
    isDictionaryWorkspace,
    isFileWorkspace,
    isGeneratorPreviewWorkspace,
    isMenuWorkspace,
    isNotificationWorkspace,
    isOperationLogWorkspace,
    isPostWorkspace,
    isRoleWorkspace,
    isSessionWorkspace,
    isRuntimeShellTab,
    isSettingWorkspace,
    isTenantWorkspace,
    isUserWorkspace,
    isWorkflowDefinitionsWorkspace,
    navigationItemCount,
    openCurrentWorkspaceTab,
    openCustomerWorkspace,
    placeholderWorkspaceCopy,
    selectedNavigationItem,
  }
}
