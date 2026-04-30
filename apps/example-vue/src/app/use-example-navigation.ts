import { buildVueNavigation } from "@elysian/frontend-vue"
import type { UiNavigationNode } from "@elysian/ui-core"
import { type Ref, computed, onBeforeUnmount, onMounted, ref, watch } from "vue"

import { resolveWorkspaceMenuKey } from "../lib/navigation-workspace"
import type { AuthIdentityResponse } from "../lib/platform-api"
import {
  listenWorkspaceRouteChange,
  readCurrentWorkspaceRouteMenuKey,
  replaceCurrentWorkspaceRoute,
} from "../router/example-router"
import {
  resolveExampleWorkspaceModuleCode,
  resolveExampleWorkspaceRoute,
  translateWorkspaceRouteText,
} from "../router/example-workspace-routes"
import {
  type AppTranslate,
  type ExampleShellTabKey,
  findFirstMenuItem,
  findNavigationItemById,
  flattenNavigation,
} from "./app-shell-helpers"
import { appendWorkspaceRegistryNavigation } from "./workspace-registry/navigation"

interface UseExampleNavigationOptions {
  authIdentity: Ref<AuthIdentityResponse | null>
  registeredModuleCodes: Ref<string[]>
  t: AppTranslate
  localizeNavigationItems: (items: UiNavigationNode[]) => UiNavigationNode[]
}

export const useExampleNavigation = ({
  authIdentity,
  registeredModuleCodes,
  t,
  localizeNavigationItems,
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

  const enterpriseNavigation = computed(() =>
    authIdentity.value
      ? appendWorkspaceRegistryNavigation(navigationTree.value, t)
      : [],
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

  const readRouteMenuKey = (items: UiNavigationNode[]) => {
    return readCurrentWorkspaceRouteMenuKey(items)
  }

  const syncMenuKeyFromRoute = () => {
    const routeMenuKey = readRouteMenuKey(enterpriseNavigation.value)

    if (!routeMenuKey) {
      return
    }

    currentMenuKey.value = routeMenuKey
    currentShellTabKey.value = "workspace"
  }

  watch(
    enterpriseNavigation,
    (items) => {
      const routeMenuKey = readRouteMenuKey(items)
      const fallbackItem =
        flattenNavigation(items).find((item) => item.path === "/customers") ??
        findFirstMenuItem(items)
      const currentItem = currentMenuKey.value
        ? findNavigationItemById(items, currentMenuKey.value)
        : null

      currentMenuKey.value =
        routeMenuKey ?? currentItem?.id ?? fallbackItem?.id ?? null
    },
    {
      immediate: true,
    },
  )

  watch(
    selectedNavigationItem,
    (item) => {
      replaceCurrentWorkspaceRoute(item?.path)
    },
    {
      immediate: true,
    },
  )

  let cleanupWorkspaceRouteListener = () => {}

  onMounted(() => {
    syncMenuKeyFromRoute()
    cleanupWorkspaceRouteListener =
      listenWorkspaceRouteChange(syncMenuKeyFromRoute)
  })

  onBeforeUnmount(() => {
    cleanupWorkspaceRouteListener()
  })

  const selectedWorkspaceRoute = computed(() =>
    resolveExampleWorkspaceRoute(selectedNavigationItem.value?.path),
  )
  const currentWorkspaceKind = computed(
    () => selectedWorkspaceRoute.value?.kind ?? "placeholder",
  )
  const isCustomerWorkspace = computed(
    () => currentWorkspaceKind.value === "customer",
  )
  const isDictionaryWorkspace = computed(
    () => currentWorkspaceKind.value === "dictionary",
  )
  const isDepartmentWorkspace = computed(
    () => currentWorkspaceKind.value === "department",
  )
  const isPostWorkspace = computed(() => currentWorkspaceKind.value === "post")
  const isSessionWorkspace = computed(
    () => currentWorkspaceKind.value === "session",
  )
  const isMenuWorkspace = computed(() => currentWorkspaceKind.value === "menu")
  const isNotificationWorkspace = computed(
    () => currentWorkspaceKind.value === "notification",
  )
  const isOperationLogWorkspace = computed(
    () => currentWorkspaceKind.value === "operation-log",
  )
  const isRoleWorkspace = computed(() => currentWorkspaceKind.value === "role")
  const isSettingWorkspace = computed(
    () => currentWorkspaceKind.value === "setting",
  )
  const isTenantWorkspace = computed(
    () => currentWorkspaceKind.value === "tenant",
  )
  const isUserWorkspace = computed(() => currentWorkspaceKind.value === "user")
  const isWorkflowDefinitionsWorkspace = computed(
    () => currentWorkspaceKind.value === "workflow-definitions",
  )
  const isFileWorkspace = computed(() => currentWorkspaceKind.value === "file")
  const isGeneratorPreviewWorkspace = computed(
    () => currentWorkspaceKind.value === "generator-preview",
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
    resolveExampleWorkspaceModuleCode(selectedNavigationItem.value?.path),
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
    selectedWorkspaceRoute.value
      ? translateWorkspaceRouteText(
          selectedWorkspaceRoute.value,
          "sectionTitleKey",
          t,
        )
      : t("app.section.placeholderTitle", {
          name:
            selectedNavigationItem.value?.name ??
            t("app.section.workspaceTitle"),
        }),
  )

  const currentWorkspaceSectionCopy = computed(() =>
    selectedWorkspaceRoute.value
      ? translateWorkspaceRouteText(
          selectedWorkspaceRoute.value,
          "sectionCopyKey",
          t,
        )
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
    !authIdentity.value
      ? t("app.session.title.online")
      : selectedWorkspaceRoute.value
        ? translateWorkspaceRouteText(
            selectedWorkspaceRoute.value,
            "shellTitleKey",
            t,
          )
        : (selectedNavigationItem.value?.name ?? t("app.runtime.title")),
  )

  const placeholderWorkspaceCopy = computed(() =>
    currentModuleReady.value
      ? t("app.placeholder.descriptionReady", {
          name:
            selectedNavigationItem.value?.name ??
            t("app.placeholder.fallbackModule"),
        })
      : t("app.placeholder.descriptionOffline", {
          name:
            selectedNavigationItem.value?.name ??
            t("app.placeholder.fallbackModule"),
        }),
  )

  const currentWorkspaceDescription = computed(() =>
    !authIdentity.value
      ? t("app.session.loginRequiredCopy")
      : selectedWorkspaceRoute.value
        ? translateWorkspaceRouteText(
            selectedWorkspaceRoute.value,
            "shellDescriptionKey",
            t,
          )
        : currentModuleReady.value
          ? t("app.shell.placeholderDescriptionReady", {
              name:
                selectedNavigationItem.value?.name ??
                t("app.placeholder.fallbackModule"),
            })
          : t("app.shell.placeholderDescriptionOffline", {
              name:
                selectedNavigationItem.value?.name ??
                t("app.placeholder.fallbackModule"),
            }),
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

  const selectShellMenu = (menuKey: string) => {
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

  const selectShellTab = (tabKey: string) => {
    if (tabKey !== "workspace" && tabKey !== "runtime") {
      return
    }

    currentShellTabKey.value = tabKey
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
    selectShellMenu,
    selectShellTab,
    selectedNavigationItem,
  }
}
