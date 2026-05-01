import { buildVueNavigation } from "@elysian/frontend-vue"
import type { UiNavigationNode } from "@elysian/ui-core"
import { type Ref, computed, onBeforeUnmount, onMounted, ref, watch } from "vue"

import type { AuthIdentityResponse } from "../lib/platform-api"
import {
  listenWorkspaceRouteChange,
  replaceCurrentWorkspaceRoute,
  resolveExampleNavigationMenuKey,
  resolveExampleNavigationSelectionState,
  resolveExampleShellTabKey,
  resolveExampleWorkspaceMenuSelection,
  resolveExampleWorkspaceSelectionIntent,
  resolveWorkspaceNavigationItemByKind,
} from "../router/example-router"
import {
  resolveExampleWorkspaceDisplayText,
  resolveExampleWorkspaceModuleStatus,
  resolveExampleWorkspaceRouteState,
} from "../router/example-workspace-routes"
import {
  type AppTranslate,
  type ExampleShellTabKey,
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

  const currentNavigationSelectionState = computed(() =>
    resolveExampleNavigationSelectionState(
      enterpriseNavigation.value,
      currentMenuKey.value,
    ),
  )

  const selectedNavigationItem = computed(
    () => currentNavigationSelectionState.value.selectedNavigationItem,
  )

  const syncMenuKeyFromRoute = () => {
    const routeMenuKey = currentNavigationSelectionState.value.selectedMenuKey

    if (!routeMenuKey) {
      return
    }

    currentMenuKey.value = routeMenuKey
    currentShellTabKey.value = "workspace"
  }

  watch(
    enterpriseNavigation,
    (items) => {
      currentMenuKey.value = resolveExampleNavigationSelectionState(
        items,
        currentMenuKey.value,
      ).selectedMenuKey
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

  const currentWorkspaceRouteState = computed(() =>
    resolveExampleWorkspaceRouteState(selectedNavigationItem.value?.path),
  )
  const currentWorkspaceKind = computed(
    () => currentWorkspaceRouteState.value.kindState.currentWorkspaceKind,
  )
  const isCustomerWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isCustomerWorkspace,
  )
  const isDictionaryWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isDictionaryWorkspace,
  )
  const isDepartmentWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isDepartmentWorkspace,
  )
  const isPostWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isPostWorkspace,
  )
  const isSessionWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isSessionWorkspace,
  )
  const isMenuWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isMenuWorkspace,
  )
  const isNotificationWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isNotificationWorkspace,
  )
  const isOperationLogWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isOperationLogWorkspace,
  )
  const isRoleWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isRoleWorkspace,
  )
  const isSettingWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isSettingWorkspace,
  )
  const isTenantWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isTenantWorkspace,
  )
  const isUserWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isUserWorkspace,
  )
  const isWorkflowDefinitionsWorkspace = computed(
    () =>
      currentWorkspaceRouteState.value.kindState.isWorkflowDefinitionsWorkspace,
  )
  const isFileWorkspace = computed(
    () => currentWorkspaceRouteState.value.kindState.isFileWorkspace,
  )
  const isGeneratorPreviewWorkspace = computed(
    () =>
      currentWorkspaceRouteState.value.kindState.isGeneratorPreviewWorkspace,
  )

  const customerNavigationItem = computed(() =>
    resolveWorkspaceNavigationItemByKind(
      enterpriseNavigation.value,
      "customer",
    ),
  )

  const currentWorkspaceModuleStatus = computed(() =>
    resolveExampleWorkspaceModuleStatus({
      routeState: currentWorkspaceRouteState.value,
      registeredModuleCodes: registeredModuleCodes.value,
      selectedNavigationPath: selectedNavigationItem.value?.path,
      t,
    }),
  )

  const currentNavigationPath = computed(
    () => currentWorkspaceModuleStatus.value.currentNavigationPath,
  )

  const currentModuleCode = computed(
    () => currentWorkspaceRouteState.value.moduleCode,
  )

  const currentModuleCodeLabel = computed(
    () => currentWorkspaceModuleStatus.value.currentModuleCodeLabel,
  )

  const currentModuleReady = computed(
    () => currentWorkspaceModuleStatus.value.currentModuleReady,
  )

  const currentModuleStatusLabel = computed(
    () => currentWorkspaceModuleStatus.value.currentModuleStatusLabel,
  )

  const currentWorkspaceDisplayText = computed(() =>
    resolveExampleWorkspaceDisplayText({
      routeState: currentWorkspaceRouteState.value,
      selectedNavigationItemName: selectedNavigationItem.value?.name,
      isAuthenticated: Boolean(authIdentity.value),
      isModuleReady: currentModuleReady.value,
      t,
    }),
  )

  const currentWorkspaceSectionTitle = computed(
    () => currentWorkspaceDisplayText.value.workspaceSectionTitle,
  )

  const currentWorkspaceSectionCopy = computed(
    () => currentWorkspaceDisplayText.value.workspaceSectionCopy,
  )

  const currentWorkspaceTitle = computed(
    () => currentWorkspaceDisplayText.value.workspaceTitle,
  )

  const placeholderWorkspaceCopy = computed(
    () => currentWorkspaceDisplayText.value.placeholderWorkspaceCopy,
  )

  const currentWorkspaceDescription = computed(
    () => currentWorkspaceDisplayText.value.workspaceDescription,
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

    const selectionIntent = resolveExampleWorkspaceSelectionIntent(
      enterpriseNavigation.value,
      customerNavigationItem.value.id,
    )

    if (!selectionIntent) {
      return
    }

    currentMenuKey.value = selectionIntent.selectedMenuKey
    currentShellTabKey.value = selectionIntent.selectedTabKey
  }

  const openCurrentWorkspaceTab = () => {
    currentShellTabKey.value = "workspace"
  }

  const selectShellMenu = (menuKey: string) => {
    const selectionIntent = resolveExampleWorkspaceSelectionIntent(
      enterpriseNavigation.value,
      menuKey,
    )

    if (!selectionIntent) {
      return
    }

    currentMenuKey.value = selectionIntent.selectedMenuKey
    currentShellTabKey.value = selectionIntent.selectedTabKey
  }

  const selectShellTab = (tabKey: string) => {
    const nextTabKey = resolveExampleShellTabKey(tabKey)

    if (!nextTabKey) {
      return
    }

    currentShellTabKey.value = nextTabKey
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
