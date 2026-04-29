import { describe, expect, test } from "bun:test"

import type {
  BindingSegment,
  CreateExampleShellBindingsOptionsInput,
  RoleWorkspaceBindingsOptions,
} from "./create-example-shell-bindings-options-types"
import type { UseExampleShellBindingsOptions } from "./use-example-shell-binding-types"

import { createExampleShellBindingsOptions } from "./create-example-shell-bindings-options"

type Assert<T extends true> = T
type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <
  Value,
>() => Value extends Right ? 1 : 2
  ? true
  : false

const bindingSegmentExportTypeCheck: Assert<
  Equal<
    BindingSegment<"isRoleWorkspace">,
    Pick<UseExampleShellBindingsOptions, "isRoleWorkspace">
  >
> = true

const roleWorkspaceAliasTypeCheck: Assert<
  Equal<
    RoleWorkspaceBindingsOptions["rolePanelTitle"],
    UseExampleShellBindingsOptions["rolePanelTitle"]
  >
> = true

void bindingSegmentExportTypeCheck
void roleWorkspaceAliasTypeCheck

const createDeepProxy = (
  overrides: Record<string, unknown>,
  path = "",
): Record<string, unknown> =>
  new Proxy(
    {},
    {
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
    },
  )

const createWorkspaceInput = (
  overrides: Record<string, unknown>,
): Record<string, unknown> => createDeepProxy(overrides)

describe("createExampleShellBindingsOptions", () => {
  test("keeps shell passthrough and workspace mapping stable", () => {
    const submitLogout = () => undefined
    const reloadRoles = () => Promise.resolve()
    const refreshGeneratorPreview = () => Promise.resolve()

    const input = {
      shell: {
        authStatusLabel: "Authenticated",
        submitLogout,
      },
      roleWorkspace: createWorkspaceInput({
        isRoleWorkspace: true,
        canUpdateRoles: true,
        "workspace.roleLoading": true,
        "workspace.panelTitle": "Role Details",
        "workspace.reloadRoles": reloadRoles,
      }),
      customerWorkspace: createWorkspaceInput({}),
      dictionaryWorkspace: createWorkspaceInput({}),
      departmentWorkspace: createWorkspaceInput({}),
      sessionWorkspace: createWorkspaceInput({}),
      postWorkspace: createWorkspaceInput({}),
      menuWorkspace: createWorkspaceInput({}),
      notificationWorkspace: createWorkspaceInput({}),
      operationLogWorkspace: createWorkspaceInput({}),
      userWorkspace: createWorkspaceInput({}),
      settingWorkspace: createWorkspaceInput({}),
      tenantWorkspace: createWorkspaceInput({}),
      fileWorkspace: createWorkspaceInput({}),
      workflowWorkspace: createWorkspaceInput({}),
      generatorPreviewWorkspace: {
        generatorPreviewLoading: true,
        refreshGeneratorPreview,
      },
    } as unknown as CreateExampleShellBindingsOptionsInput

    const result = createExampleShellBindingsOptions(
      input,
    ) as unknown as Record<string, unknown>

    expect(result.authStatusLabel).toBe("Authenticated")
    expect(result.submitLogout).toBe(submitLogout)
    expect(result.isRoleWorkspace).toBe(true)
    expect(result.roleLoading).toBe(true)
    expect(result.canUpdateRoles).toBe(true)
    expect(result.rolePanelTitle).toBe("Role Details")
    expect(result.reloadRoles).toBe(reloadRoles)
    expect(result.generatorPreviewLoading).toBe(true)
    expect(result.refreshGeneratorPreview).toBe(refreshGeneratorPreview)
  })
})
