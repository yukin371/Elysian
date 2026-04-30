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

export const exampleWorkspaceRoutes = workspaceRegistry.map((workspace) => ({
  path: workspace.path,
  kind: workspace.kind,
  moduleCode: workspace.moduleCode,
  sectionTitleKey: workspace.i18nKeys.sectionTitle,
  sectionCopyKey: workspace.i18nKeys.sectionCopy,
  shellTitleKey: workspace.i18nKeys.shellTitle,
  shellDescriptionKey: workspace.i18nKeys.shellDescription,
})) satisfies ExampleWorkspaceRouteDefinition[]

export const resolveExampleWorkspaceRoute = (
  path: string | null | undefined,
) => {
  const normalizedPath = normalizeWorkspaceRoutePath(path)

  if (!normalizedPath) {
    return null
  }

  return (
    exampleWorkspaceRoutes.find((route) => route.path === normalizedPath) ??
    null
  )
}

export const resolveExampleWorkspaceKind = (
  path: string | null | undefined,
): ExampleWorkspaceKind =>
  resolveExampleWorkspaceRoute(path)?.kind ?? "placeholder"

export const resolveExampleWorkspaceModuleCode = (
  path: string | null | undefined,
) => resolveExampleWorkspaceRoute(path)?.moduleCode ?? null

export const translateWorkspaceRouteText = (
  route: ExampleWorkspaceRouteDefinition,
  field:
    | "sectionTitleKey"
    | "sectionCopyKey"
    | "shellTitleKey"
    | "shellDescriptionKey",
  t: AppTranslate,
) => t(route[field])
