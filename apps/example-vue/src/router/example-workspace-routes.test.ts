import { describe, expect, test } from "bun:test"

import {
  createExampleWorkspaceKindState,
  defaultExampleWorkspacePath,
  defaultExampleWorkspaceRoute,
  exampleWorkspaceRoutes,
  resolveExampleWorkspaceDisplayText,
  resolveExampleWorkspaceKind,
  resolveExampleWorkspaceKindState,
  resolveExampleWorkspaceModuleCode,
  resolveExampleWorkspaceModuleStatus,
  resolveExampleWorkspacePathByKind,
  resolveExampleWorkspaceRoute,
  resolveExampleWorkspaceRouteByKind,
  resolveExampleWorkspaceRouteState,
} from "./example-workspace-routes"

const t = (key: string, params?: Record<string, unknown>) =>
  params ? `${key}:${JSON.stringify(params)}` : key

describe("example workspace routes", () => {
  test("derives route metadata from the workspace registry", () => {
    expect(exampleWorkspaceRoutes).toHaveLength(15)
    expect(exampleWorkspaceRoutes.map((route) => route.kind).sort()).toEqual([
      "customer",
      "department",
      "dictionary",
      "file",
      "generator-preview",
      "menu",
      "notification",
      "operation-log",
      "post",
      "role",
      "session",
      "setting",
      "tenant",
      "user",
      "workflow-definitions",
    ])
  })

  test("resolves known workspace paths to registered route metadata", () => {
    expect(resolveExampleWorkspaceKind("/system/files")).toBe("file")
    expect(resolveExampleWorkspaceModuleCode("/system/files")).toBe("file")
  })

  test("exposes the default workspace route from the registry", () => {
    expect(defaultExampleWorkspaceRoute?.kind).toBe("customer")
    expect(defaultExampleWorkspacePath).toBe("/customers")
  })

  test("resolves workspace metadata by registered kind", () => {
    expect(resolveExampleWorkspaceRouteByKind("customer")?.path).toBe(
      "/customers",
    )
    expect(resolveExampleWorkspacePathByKind("workflow-definitions")).toBe(
      "/workflow/definitions",
    )
    expect(resolveExampleWorkspaceRouteByKind(null)).toBeNull()
  })

  test("builds workspace kind flags from route state", () => {
    expect(
      createExampleWorkspaceKindState("customer").isCustomerWorkspace,
    ).toBe(true)
    expect(
      resolveExampleWorkspaceKindState("#/workflow/tasks/todo")
        .isWorkflowDefinitionsWorkspace,
    ).toBe(true)
    expect(
      resolveExampleWorkspaceKindState("/system/missing").currentWorkspaceKind,
    ).toBe("placeholder")
  })

  test("resolves the aggregated route state for a path", () => {
    expect(resolveExampleWorkspaceRouteState("/system/files").moduleCode).toBe(
      "file",
    )
    expect(
      resolveExampleWorkspaceRouteState("#/workflow/tasks/todo").kindState
        .isWorkflowDefinitionsWorkspace,
    ).toBe(true)
    expect(
      resolveExampleWorkspaceRouteState("/system/missing").route,
    ).toBeNull()
  })

  test("resolves display text from route state and runtime flags", () => {
    expect(
      resolveExampleWorkspaceDisplayText({
        routeState: resolveExampleWorkspaceRouteState("/system/files"),
        selectedNavigationItemName: "Files",
        isAuthenticated: true,
        isModuleReady: true,
        t,
      }).workspaceTitle,
    ).toBe("app.file.shellTitle")

    expect(
      resolveExampleWorkspaceDisplayText({
        routeState: resolveExampleWorkspaceRouteState("/system/missing"),
        selectedNavigationItemName: "Missing",
        isAuthenticated: true,
        isModuleReady: false,
        t,
      }).workspaceDescription,
    ).toBe('app.shell.placeholderDescriptionOffline:{"name":"Missing"}')

    expect(
      resolveExampleWorkspaceDisplayText({
        routeState: resolveExampleWorkspaceRouteState("/customers"),
        selectedNavigationItemName: "Customers",
        isAuthenticated: false,
        isModuleReady: true,
        t,
      }).workspaceDescription,
    ).toBe("app.session.loginRequiredCopy")
  })

  test("resolves workspace module status from route state and registry state", () => {
    expect(
      resolveExampleWorkspaceModuleStatus({
        routeState: resolveExampleWorkspaceRouteState("/system/files"),
        registeredModuleCodes: ["file"],
        selectedNavigationPath: "/system/files",
        t,
      }),
    ).toEqual({
      currentNavigationPath: "/system/files",
      currentModuleCodeLabel: "file",
      currentModuleReady: true,
      currentModuleStatusLabel: "app.placeholder.ready",
    })

    expect(
      resolveExampleWorkspaceModuleStatus({
        routeState: resolveExampleWorkspaceRouteState(
          "/studio/generator-preview",
        ),
        registeredModuleCodes: [],
        selectedNavigationPath: null,
        t,
      }),
    ).toEqual({
      currentNavigationPath: "app.placeholder.pathMissing",
      currentModuleCodeLabel: "generator-preview",
      currentModuleReady: true,
      currentModuleStatusLabel: "app.placeholder.ready",
    })

    expect(
      resolveExampleWorkspaceModuleStatus({
        routeState: resolveExampleWorkspaceRouteState("/system/missing"),
        registeredModuleCodes: [],
        selectedNavigationPath: null,
        t,
      }),
    ).toEqual({
      currentNavigationPath: "app.placeholder.pathMissing",
      currentModuleCodeLabel: "app.placeholder.fallbackModule",
      currentModuleReady: false,
      currentModuleStatusLabel: "app.placeholder.offline",
    })
  })

  test("normalizes workflow aliases through the shared navigation rules", () => {
    expect(resolveExampleWorkspaceKind("#/workflow/tasks/todo")).toBe(
      "workflow-definitions",
    )
    expect(resolveExampleWorkspaceModuleCode("/workflow/instances")).toBe(
      "workflow",
    )
  })

  test("falls back for unregistered workspace paths", () => {
    expect(resolveExampleWorkspaceRoute("/system/missing")).toBeNull()
    expect(resolveExampleWorkspaceKind("/system/missing")).toBe("placeholder")
    expect(resolveExampleWorkspaceModuleCode("/system/missing")).toBeNull()
  })
})
