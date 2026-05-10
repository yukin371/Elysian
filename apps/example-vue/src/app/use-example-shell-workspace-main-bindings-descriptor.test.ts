import { describe, expect, test } from "bun:test"

import type { UseExampleShellBindingsOptions } from "./use-example-shell-binding-types"

import { createExampleShellWorkspaceMainBindings } from "./use-example-shell-workspace-main-bindings-descriptor"

const createDeepProxy = (
  overrides: Record<string, unknown>,
  path = "",
): Record<string, unknown> => {
  const target = Object.fromEntries(
    Object.entries(overrides).filter(([key]) => !key.includes(".")),
  )

  return new Proxy(target, {
    get(_target, property) {
      if (typeof property !== "string") {
        return undefined
      }

      const nextPath = path ? `${path}.${property}` : property
      if (Object.prototype.hasOwnProperty.call(overrides, nextPath)) {
        return overrides[nextPath]
      }

      return createDeepProxy(overrides, nextPath)
    },
  })
}

const createOptions = (
  overrides: Record<string, unknown>,
): UseExampleShellBindingsOptions =>
  createDeepProxy({
    t: (key: string) => key,
    "permissionCodes.value": [],
    "authModuleReady.value": true,
    "authIdentity.value": null,
    "workflowQuery.value": "",
    "fileQuery.value": {},
    "fileItems.value": [],
    "selectedGeneratorPreviewConflictStrategy.value": "fail",
    "selectedGeneratorPreviewRecentSessionId.value": "",
    "selectedGeneratorPreviewSchemaName.value": "customer",
    "selectedGeneratorPreviewFrontendTarget.value": "vue",
    "generatorPreviewQuery.value": "",
    "selectedGeneratorPreviewFilePath.value": null,
    localizePlatformStatus: (status: string | null | undefined) => status ?? "",
    vueEnterprisePresetStatus: "ready",
    ...overrides,
  }) as unknown as UseExampleShellBindingsOptions

describe("createExampleShellWorkspaceMainBindings", () => {
  test("passes generator confirmation state and action into shell main bindings", () => {
    let confirmCalls = 0
    const options = createOptions({
      canConfirmGeneratorPreview: true,
      confirmGeneratorPreview: () => {
        confirmCalls += 1
      },
    })

    const { shellWorkspaceMainProps, shellWorkspaceMainListeners } =
      createExampleShellWorkspaceMainBindings(options)

    expect(shellWorkspaceMainProps.value.canConfirmGeneratorPreview).toBe(true)
    shellWorkspaceMainListeners["confirm-generator-preview"]()
    expect(confirmCalls).toBe(1)
  })

  test("routes standard CRUD main actions back into workspace handlers", () => {
    const actionCalls: Array<[string, Record<string, unknown>]> = []
    const options = createOptions({
      handleRoleAction: (key: string, row: Record<string, unknown>) => {
        actionCalls.push([key, row])
      },
    })

    const { shellWorkspaceMainListeners } =
      createExampleShellWorkspaceMainBindings(options)

    shellWorkspaceMainListeners["role-action"]({
      key: "edit",
      row: { id: "role-1" },
    })

    expect(actionCalls).toEqual([["edit", { id: "role-1" }]])
  })

  test("restores the current generator result by resetting local state first", () => {
    const calls: string[] = []
    const options = createOptions({
      generatorPreviewSession: { id: "session-9" },
      resetGeneratorPreviewState: () => {
        calls.push("reset")
      },
      restoreGeneratorPreviewSession: (sessionId: string) => {
        calls.push(`restore:${sessionId}`)
      },
    })

    const { shellWorkspaceMainListeners } =
      createExampleShellWorkspaceMainBindings(options)

    shellWorkspaceMainListeners["restore-current-generator-session"]()

    expect(calls).toEqual(["reset", "restore:session-9"])
  })
})
