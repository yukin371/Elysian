import { describe, expect, test } from "bun:test"

import {
  exampleWorkspaceRoutes,
  resolveExampleWorkspaceKind,
  resolveExampleWorkspaceModuleCode,
  resolveExampleWorkspaceRoute,
} from "./example-workspace-routes"

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
