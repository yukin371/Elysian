import type {
  AppTranslate,
  ExampleWorkspaceKind,
} from "../app/app-shell-helpers"
import { workspaceRegistry } from "../app/workspace-registry"
import type { RegisteredWorkspaceKind } from "../app/workspace-registry"
import { normalizeWorkspaceRoutePath } from "../lib/navigation-workspace"

export interface ExampleWorkspaceRouteDefinition {
  path: string
  kind: RegisteredWorkspaceKind
  moduleCode: string
  sectionTitleKey: string
  sectionCopyKey: string
  shellTitleKey: string
  shellDescriptionKey: string
}

export interface ExampleWorkspaceKindState {
  currentWorkspaceKind: ExampleWorkspaceKind
  isCustomerWorkspace: boolean
  isDepartmentWorkspace: boolean
  isDictionaryWorkspace: boolean
  isFileWorkspace: boolean
  isGeneratorPreviewWorkspace: boolean
  isMenuWorkspace: boolean
  isNotificationWorkspace: boolean
  isOperationLogWorkspace: boolean
  isPostWorkspace: boolean
  isRoleWorkspace: boolean
  isSessionWorkspace: boolean
  isSettingWorkspace: boolean
  isTenantWorkspace: boolean
  isUserWorkspace: boolean
  isWorkflowDefinitionsWorkspace: boolean
}

export interface ExampleWorkspaceRouteState {
  kindState: ExampleWorkspaceKindState
  moduleCode: string | null
  route: ExampleWorkspaceRouteDefinition | null
}

export interface ExampleWorkspaceDisplayText {
  placeholderWorkspaceCopy: string
  workspaceDescription: string
  workspaceSectionCopy: string
  workspaceSectionTitle: string
  workspaceTitle: string
}

export interface ExampleWorkspaceModuleStatus {
  currentModuleCodeLabel: string
  currentModuleReady: boolean
  currentModuleStatusLabel: string
  currentNavigationPath: string
}

export const exampleWorkspaceRoutes = workspaceRegistry.map((workspace) => ({
  path: workspace.path,
  kind: workspace.kind,
  moduleCode: workspace.moduleCode,
  sectionTitleKey: workspace.i18nKeys.sectionTitle,
  sectionCopyKey: workspace.i18nKeys.sectionCopy,
  shellTitleKey: workspace.i18nKeys.shellTitle,
  shellDescriptionKey: workspace.i18nKeys.shellDescription,
})) satisfies ExampleWorkspaceRouteDefinition[]

const exampleWorkspaceRouteMap = new Map(
  exampleWorkspaceRoutes.map((route) => [route.path, route] as const),
)
const exampleWorkspaceRouteKindMap = new Map(
  exampleWorkspaceRoutes.map((route) => [route.kind, route] as const),
)

export const defaultExampleWorkspaceRoute =
  exampleWorkspaceRoutes.find((route) => route.kind === "customer") ??
  exampleWorkspaceRoutes[0] ??
  null

export const defaultExampleWorkspacePath =
  defaultExampleWorkspaceRoute?.path ?? null

export const resolveExampleWorkspaceRouteByKind = (
  kind: RegisteredWorkspaceKind | null | undefined,
) => {
  if (!kind) {
    return null
  }

  return exampleWorkspaceRouteKindMap.get(kind) ?? null
}

export const resolveExampleWorkspacePathByKind = (
  kind: RegisteredWorkspaceKind | null | undefined,
) => resolveExampleWorkspaceRouteByKind(kind)?.path ?? null

export const resolveExampleWorkspaceRoute = (
  path: string | null | undefined,
) => {
  const normalizedPath = normalizeWorkspaceRoutePath(path)

  if (!normalizedPath) {
    return null
  }

  return exampleWorkspaceRouteMap.get(normalizedPath) ?? null
}

export const resolveExampleWorkspaceKind = (
  path: string | null | undefined,
): ExampleWorkspaceKind =>
  resolveExampleWorkspaceRoute(path)?.kind ?? "placeholder"

export const createExampleWorkspaceKindState = (
  kind: ExampleWorkspaceKind,
): ExampleWorkspaceKindState => ({
  currentWorkspaceKind: kind,
  isCustomerWorkspace: kind === "customer",
  isDepartmentWorkspace: kind === "department",
  isDictionaryWorkspace: kind === "dictionary",
  isFileWorkspace: kind === "file",
  isGeneratorPreviewWorkspace: kind === "generator-preview",
  isMenuWorkspace: kind === "menu",
  isNotificationWorkspace: kind === "notification",
  isOperationLogWorkspace: kind === "operation-log",
  isPostWorkspace: kind === "post",
  isRoleWorkspace: kind === "role",
  isSessionWorkspace: kind === "session",
  isSettingWorkspace: kind === "setting",
  isTenantWorkspace: kind === "tenant",
  isUserWorkspace: kind === "user",
  isWorkflowDefinitionsWorkspace: kind === "workflow-definitions",
})

export const resolveExampleWorkspaceKindState = (
  path: string | null | undefined,
) => createExampleWorkspaceKindState(resolveExampleWorkspaceKind(path))

export const resolveExampleWorkspaceRouteState = (
  path: string | null | undefined,
): ExampleWorkspaceRouteState => {
  const route = resolveExampleWorkspaceRoute(path)

  return {
    route,
    moduleCode: route?.moduleCode ?? null,
    kindState: createExampleWorkspaceKindState(route?.kind ?? "placeholder"),
  }
}

export const resolveExampleWorkspaceModuleCode = (
  path: string | null | undefined,
) => resolveExampleWorkspaceRoute(path)?.moduleCode ?? null

export const resolveExampleWorkspaceModuleStatus = ({
  routeState,
  registeredModuleCodes,
  selectedNavigationPath,
  t,
}: {
  routeState: ExampleWorkspaceRouteState
  registeredModuleCodes: string[]
  selectedNavigationPath: string | null | undefined
  t: AppTranslate
}): ExampleWorkspaceModuleStatus => {
  const currentNavigationPath =
    selectedNavigationPath ?? t("app.placeholder.pathMissing")
  const currentModuleReady =
    routeState.moduleCode === "generator-preview" ||
    (routeState.moduleCode !== null &&
      registeredModuleCodes.includes(routeState.moduleCode))

  return {
    currentNavigationPath,
    currentModuleReady,
    currentModuleCodeLabel:
      routeState.moduleCode ?? t("app.placeholder.fallbackModule"),
    currentModuleStatusLabel: currentModuleReady
      ? t("app.placeholder.ready")
      : t("app.placeholder.offline"),
  }
}

export const translateWorkspaceRouteText = (
  route: ExampleWorkspaceRouteDefinition,
  field:
    | "sectionTitleKey"
    | "sectionCopyKey"
    | "shellTitleKey"
    | "shellDescriptionKey",
  t: AppTranslate,
) => t(route[field])

export const resolveExampleWorkspaceDisplayText = ({
  routeState,
  selectedNavigationItemName,
  isAuthenticated,
  isModuleReady,
  t,
}: {
  routeState: ExampleWorkspaceRouteState
  selectedNavigationItemName: string | null | undefined
  isAuthenticated: boolean
  isModuleReady: boolean
  t: AppTranslate
}): ExampleWorkspaceDisplayText => {
  const selectedName =
    selectedNavigationItemName ?? t("app.placeholder.fallbackModule")
  const sectionName =
    selectedNavigationItemName ?? t("app.section.workspaceTitle")

  const placeholderWorkspaceCopy = isModuleReady
    ? t("app.placeholder.descriptionReady", {
        name: selectedName,
      })
    : t("app.placeholder.descriptionOffline", {
        name: selectedName,
      })

  if (!isAuthenticated) {
    return {
      workspaceSectionTitle: routeState.route
        ? translateWorkspaceRouteText(routeState.route, "sectionTitleKey", t)
        : t("app.section.placeholderTitle", {
            name: sectionName,
          }),
      workspaceSectionCopy: routeState.route
        ? translateWorkspaceRouteText(routeState.route, "sectionCopyKey", t)
        : isModuleReady
          ? t("app.section.placeholderCopyReady", {
              name: sectionName,
            })
          : t("app.section.placeholderCopyOffline", {
              name: sectionName,
            }),
      workspaceTitle: t("app.session.title.online"),
      placeholderWorkspaceCopy,
      workspaceDescription: t("app.session.loginRequiredCopy"),
    }
  }

  return {
    workspaceSectionTitle: routeState.route
      ? translateWorkspaceRouteText(routeState.route, "sectionTitleKey", t)
      : t("app.section.placeholderTitle", {
          name: sectionName,
        }),
    workspaceSectionCopy: routeState.route
      ? translateWorkspaceRouteText(routeState.route, "sectionCopyKey", t)
      : isModuleReady
        ? t("app.section.placeholderCopyReady", {
            name: sectionName,
          })
        : t("app.section.placeholderCopyOffline", {
            name: sectionName,
          }),
    workspaceTitle: routeState.route
      ? translateWorkspaceRouteText(routeState.route, "shellTitleKey", t)
      : (selectedNavigationItemName ?? t("app.tabs.workspace")),
    placeholderWorkspaceCopy,
    workspaceDescription: routeState.route
      ? translateWorkspaceRouteText(routeState.route, "shellDescriptionKey", t)
      : isModuleReady
        ? t("app.shell.placeholderDescriptionReady", {
            name: selectedName,
          })
        : t("app.shell.placeholderDescriptionOffline", {
            name: selectedName,
          }),
  }
}
