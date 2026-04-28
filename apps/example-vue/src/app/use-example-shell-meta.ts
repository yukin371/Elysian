import type {
  ElyShellStat,
  ElyShellTab,
  ElyShellUserSummary,
} from "@elysian/ui-enterprise-vue"
import { computed, type ComputedRef, type Ref } from "vue"

import type {
  AppTranslate,
  ExampleWorkspaceKind,
} from "./app-shell-helpers"
import type {
  AuthIdentityResponse,
  PlatformResponse,
} from "../lib/platform-api"

type ItemCollection = Ref<unknown[]> | ComputedRef<unknown[]>

interface UseExampleShellMetaOptions {
  t: AppTranslate
  platform: Ref<PlatformResponse | null>
  authIdentity: Ref<AuthIdentityResponse | null>
  authModuleReady: Ref<boolean>
  authLoading: Ref<boolean>
  isAuthenticated: ComputedRef<boolean>
  isCustomerWorkspace: ComputedRef<boolean>
  isDictionaryWorkspace: ComputedRef<boolean>
  isDepartmentWorkspace: ComputedRef<boolean>
  isSessionWorkspace: ComputedRef<boolean>
  isMenuWorkspace: ComputedRef<boolean>
  isNotificationWorkspace: ComputedRef<boolean>
  isOperationLogWorkspace: ComputedRef<boolean>
  isRoleWorkspace: ComputedRef<boolean>
  isSettingWorkspace: ComputedRef<boolean>
  isTenantWorkspace: ComputedRef<boolean>
  isUserWorkspace: ComputedRef<boolean>
  isWorkflowDefinitionsWorkspace: ComputedRef<boolean>
  isFileWorkspace: ComputedRef<boolean>
  isGeneratorPreviewWorkspace: ComputedRef<boolean>
  isRuntimeShellTab: ComputedRef<boolean>
  currentWorkspaceKind: ComputedRef<ExampleWorkspaceKind>
  currentWorkspaceTitle: ComputedRef<string>
  currentWorkspaceDescription: ComputedRef<string>
  currentNavigationPath: ComputedRef<string>
  navigationItemCount: ComputedRef<number>
  customerItems: ItemCollection
  dictionaryItems: ItemCollection
  departmentItems: ItemCollection
  sessionItems: ItemCollection
  menuItems: ItemCollection
  notificationItems: ItemCollection
  operationLogItems: ItemCollection
  roleItems: ItemCollection
  settingItems: ItemCollection
  tenantItems: ItemCollection
  userItems: ItemCollection
  workflowDefinitions: ItemCollection
  fileItems: ItemCollection
  generatorPreviewFiles: ItemCollection
}

export const useExampleShellMeta = ({
  t,
  platform,
  authIdentity,
  authModuleReady,
  authLoading,
  isAuthenticated,
  isCustomerWorkspace,
  isDictionaryWorkspace,
  isDepartmentWorkspace,
  isSessionWorkspace,
  isMenuWorkspace,
  isNotificationWorkspace,
  isOperationLogWorkspace,
  isRoleWorkspace,
  isSettingWorkspace,
  isTenantWorkspace,
  isUserWorkspace,
  isWorkflowDefinitionsWorkspace,
  isFileWorkspace,
  isGeneratorPreviewWorkspace,
  isRuntimeShellTab,
  currentWorkspaceKind,
  currentWorkspaceTitle,
  currentWorkspaceDescription,
  currentNavigationPath,
  navigationItemCount,
  customerItems,
  dictionaryItems,
  departmentItems,
  sessionItems,
  menuItems,
  notificationItems,
  operationLogItems,
  roleItems,
  settingItems,
  tenantItems,
  userItems,
  workflowDefinitions,
  fileItems,
  generatorPreviewFiles,
}: UseExampleShellMetaOptions) => {
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
      return dictionaryItems.value.length
    }

    if (isDepartmentWorkspace.value) {
      return departmentItems.value.length
    }

    if (isSessionWorkspace.value) {
      return sessionItems.value.length
    }

    if (isMenuWorkspace.value) {
      return menuItems.value.length
    }

    if (isNotificationWorkspace.value) {
      return notificationItems.value.length
    }

    if (isOperationLogWorkspace.value) {
      return operationLogItems.value.length
    }

    if (isRoleWorkspace.value) {
      return roleItems.value.length
    }

    if (isSettingWorkspace.value) {
      return settingItems.value.length
    }

    if (isTenantWorkspace.value) {
      return tenantItems.value.length
    }

    if (isUserWorkspace.value) {
      return userItems.value.length
    }

    if (isWorkflowDefinitionsWorkspace.value) {
      return workflowDefinitions.value.length
    }

    if (isFileWorkspace.value) {
      return fileItems.value.length
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

    if (isSessionWorkspace.value) {
      return t("app.onlineSession.statsHint")
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
              count: dictionaryItems.value.length,
            })
          : isFileWorkspace.value
            ? t("app.file.tabsHint", {
                count: fileItems.value.length,
              })
            : isDepartmentWorkspace.value
              ? t("app.department.tabsHint", {
                  count: departmentItems.value.length,
                })
              : isSessionWorkspace.value
                ? t("app.onlineSession.tabsHint", {
                    count: sessionItems.value.length,
                  })
              : isMenuWorkspace.value
                ? t("app.menu.tabsHint", {
                    count: menuItems.value.length,
                  })
                : isNotificationWorkspace.value
                  ? t("app.notification.tabsHint", {
                      count: notificationItems.value.length,
                    })
                  : isOperationLogWorkspace.value
                    ? t("app.operationLog.tabsHint", {
                        count: operationLogItems.value.length,
                      })
                    : isRoleWorkspace.value
                      ? t("app.role.tabsHint", {
                          count: roleItems.value.length,
                        })
                      : isSettingWorkspace.value
                        ? t("app.setting.tabsHint", {
                            count: settingItems.value.length,
                          })
                        : isTenantWorkspace.value
                          ? t("app.tenant.tabsHint", {
                              count: tenantItems.value.length,
                            })
                          : isUserWorkspace.value
                            ? t("app.user.tabsHint", {
                                count: userItems.value.length,
                              })
                            : isGeneratorPreviewWorkspace.value
                              ? t("app.generatorPreview.tabsHint", {
                                  count: generatorPreviewFiles.value.length,
                                })
                              : isWorkflowDefinitionsWorkspace.value
                                ? t("app.workflow.tabsHint", {
                                    count: workflowDefinitions.value.length,
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

  const shellWorkspaceTitle = computed(() =>
    isRuntimeShellTab.value ? t("app.runtime.title") : currentWorkspaceTitle.value,
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

  return {
    authStatusLabel,
    authStatusState,
    authStatusTone,
    currentWorkspaceItemCount,
    currentWorkspaceItemHint,
    enterpriseCrudCopy,
    enterpriseFormCopy,
    enterpriseShellCopy,
    enterpriseShellStats,
    enterpriseShellTabs,
    enterpriseShellUser,
    shellWorkspaceDescription,
    shellWorkspaceTitle,
  }
}
