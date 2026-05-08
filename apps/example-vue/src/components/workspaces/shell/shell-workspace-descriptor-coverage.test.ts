import { describe, expect, test } from "bun:test"

import {
  generatedStandardCrudFrontendModuleArtifacts,
  generatedStandardCrudWorkspaceKinds,
} from "../../../app/workspace-registry/generated"
import {
  type ShellWorkspaceMainSwitchProps,
  resolveShellWorkspaceMainDescriptor,
  shellWorkspaceMainResolverKinds,
} from "./shell-workspace-main-descriptor"
import { shellWorkspaceSecondaryResolverKinds } from "./shell-workspace-secondary-descriptor"

const sortValues = (values: readonly string[]) => [...values].sort()

describe("shell workspace descriptor coverage", () => {
  test("keeps generated standard CRUD artifacts aligned with shell resolvers", () => {
    expect(
      generatedStandardCrudFrontendModuleArtifacts.every(
        (artifact) => artifact.surfaceKind === "standard-crud-enterprise",
      ),
    ).toBe(true)

    expect(sortValues(shellWorkspaceMainResolverKinds)).toEqual(
      sortValues([
        ...generatedStandardCrudWorkspaceKinds,
        "file",
        "generator-preview",
        "operation-log",
        "session",
        "workflow-definitions",
      ]),
    )

    expect(sortValues(shellWorkspaceSecondaryResolverKinds)).toEqual(
      sortValues([
        ...generatedStandardCrudWorkspaceKinds,
        "file",
        "generator-preview",
        "operation-log",
        "session",
        "workflow-definitions",
      ]),
    )
  })

  test("passes runtime readiness props into generated standard CRUD main workspaces", () => {
    const descriptor = resolveShellWorkspaceMainDescriptor(
      {
        t: (key: string) => key,
        currentWorkspaceKind: "user",
        authModuleReady: true,
        isAuthenticated: true,
        userModuleReady: true,
        canEnterUserWorkspace: true,
        canViewUsers: true,
        enterpriseUserQueryFields: [{ key: "username" }],
        enterpriseUserTableColumns: [{ colKey: "username" }],
        userCountLabel: "1 users",
        enterpriseCrudCopy: {},
      } as unknown as ShellWorkspaceMainSwitchProps,
      (() => undefined) as never,
    )

    expect(descriptor.props).toMatchObject({
      moduleReady: true,
      authModuleReady: true,
      isAuthenticated: true,
      canEnterWorkspace: true,
      canViewUsers: true,
      queryFields: [{ key: "username" }],
      tableColumns: [{ colKey: "username" }],
      itemCountLabel: "1 users",
      workspaceStateInjected: true,
    })
  })
})
