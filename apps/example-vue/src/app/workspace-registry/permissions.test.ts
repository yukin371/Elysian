import { describe, expect, test } from "bun:test"

import { getWorkspacePermissions } from "./permissions"

describe("workspace registry permissions", () => {
  test("exposes action permissions for standard workspaces", () => {
    expect(getWorkspacePermissions("customer")).toMatchObject({
      list: "customer:customer:list",
      create: "customer:customer:create",
      update: "customer:customer:update",
      delete: "customer:customer:delete",
    })
    expect(getWorkspacePermissions("file")).toMatchObject({
      create: "system:file:upload",
      update: "system:file:download",
    })
  })

  test("keeps non-crud permissions explicit", () => {
    expect(getWorkspacePermissions("operation-log").export).toBe(
      "system:operation-log:export",
    )
    expect(getWorkspacePermissions("workflow-definitions").list).toBe(
      "workflow:definition:list",
    )
  })
})
