import type {
  AppTranslate,
  ExampleWorkspaceKind,
} from "../app/app-shell-helpers"
import { normalizeWorkspaceRoutePath } from "../lib/navigation-workspace"

type RegisteredWorkspaceKind = Exclude<ExampleWorkspaceKind, "placeholder">

export interface ExampleWorkspaceRouteDefinition {
  path: string
  kind: RegisteredWorkspaceKind
  moduleCode: string
  sectionTitleKey: string
  sectionCopyKey: string
  shellTitleKey: string
  shellDescriptionKey: string
}

export const exampleWorkspaceRoutes = [
  {
    path: "/customers",
    kind: "customer",
    moduleCode: "customer",
    sectionTitleKey: "app.section.workspaceTitle",
    sectionCopyKey: "app.section.workspaceCopy",
    shellTitleKey: "app.shell.workspaceTitle",
    shellDescriptionKey: "app.shell.workspaceDescription",
  },
  {
    path: "/system/dictionaries",
    kind: "dictionary",
    moduleCode: "dictionary",
    sectionTitleKey: "app.dictionary.sectionTitle",
    sectionCopyKey: "app.dictionary.sectionCopy",
    shellTitleKey: "app.dictionary.shellTitle",
    shellDescriptionKey: "app.dictionary.shellDescription",
  },
  {
    path: "/system/files",
    kind: "file",
    moduleCode: "file",
    sectionTitleKey: "app.file.sectionTitle",
    sectionCopyKey: "app.file.sectionCopy",
    shellTitleKey: "app.file.shellTitle",
    shellDescriptionKey: "app.file.shellDescription",
  },
  {
    path: "/studio/generator-preview",
    kind: "generator-preview",
    moduleCode: "generator-preview",
    sectionTitleKey: "app.generatorPreview.sectionTitle",
    sectionCopyKey: "app.generatorPreview.sectionCopy",
    shellTitleKey: "app.generatorPreview.shellTitle",
    shellDescriptionKey: "app.generatorPreview.shellDescription",
  },
  {
    path: "/system/departments",
    kind: "department",
    moduleCode: "department",
    sectionTitleKey: "app.department.sectionTitle",
    sectionCopyKey: "app.department.sectionCopy",
    shellTitleKey: "app.department.shellTitle",
    shellDescriptionKey: "app.department.shellDescription",
  },
  {
    path: "/system/posts",
    kind: "post",
    moduleCode: "post",
    sectionTitleKey: "app.post.sectionTitle",
    sectionCopyKey: "app.post.sectionCopy",
    shellTitleKey: "app.post.shellTitle",
    shellDescriptionKey: "app.post.shellDescription",
  },
  {
    path: "/system/sessions",
    kind: "session",
    moduleCode: "auth",
    sectionTitleKey: "app.onlineSession.sectionTitle",
    sectionCopyKey: "app.onlineSession.sectionCopy",
    shellTitleKey: "app.onlineSession.shellTitle",
    shellDescriptionKey: "app.onlineSession.shellDescription",
  },
  {
    path: "/system/menus",
    kind: "menu",
    moduleCode: "menu",
    sectionTitleKey: "app.menu.sectionTitle",
    sectionCopyKey: "app.menu.sectionCopy",
    shellTitleKey: "app.menu.shellTitle",
    shellDescriptionKey: "app.menu.shellDescription",
  },
  {
    path: "/system/notifications",
    kind: "notification",
    moduleCode: "notification",
    sectionTitleKey: "app.notification.sectionTitle",
    sectionCopyKey: "app.notification.sectionCopy",
    shellTitleKey: "app.notification.shellTitle",
    shellDescriptionKey: "app.notification.shellDescription",
  },
  {
    path: "/system/operation-logs",
    kind: "operation-log",
    moduleCode: "operation-log",
    sectionTitleKey: "app.operationLog.sectionTitle",
    sectionCopyKey: "app.operationLog.sectionCopy",
    shellTitleKey: "app.operationLog.shellTitle",
    shellDescriptionKey: "app.operationLog.shellDescription",
  },
  {
    path: "/system/roles",
    kind: "role",
    moduleCode: "role",
    sectionTitleKey: "app.role.sectionTitle",
    sectionCopyKey: "app.role.sectionCopy",
    shellTitleKey: "app.role.shellTitle",
    shellDescriptionKey: "app.role.shellDescription",
  },
  {
    path: "/system/settings",
    kind: "setting",
    moduleCode: "setting",
    sectionTitleKey: "app.setting.sectionTitle",
    sectionCopyKey: "app.setting.sectionCopy",
    shellTitleKey: "app.setting.shellTitle",
    shellDescriptionKey: "app.setting.shellDescription",
  },
  {
    path: "/system/tenants",
    kind: "tenant",
    moduleCode: "tenant",
    sectionTitleKey: "app.tenant.sectionTitle",
    sectionCopyKey: "app.tenant.sectionCopy",
    shellTitleKey: "app.tenant.shellTitle",
    shellDescriptionKey: "app.tenant.shellDescription",
  },
  {
    path: "/system/users",
    kind: "user",
    moduleCode: "user",
    sectionTitleKey: "app.user.sectionTitle",
    sectionCopyKey: "app.user.sectionCopy",
    shellTitleKey: "app.user.shellTitle",
    shellDescriptionKey: "app.user.shellDescription",
  },
  {
    path: "/workflow/definitions",
    kind: "workflow-definitions",
    moduleCode: "workflow",
    sectionTitleKey: "app.workflow.sectionTitle",
    sectionCopyKey: "app.workflow.sectionCopy",
    shellTitleKey: "app.workflow.shellTitle",
    shellDescriptionKey: "app.workflow.shellDescription",
  },
] as const satisfies ExampleWorkspaceRouteDefinition[]

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
