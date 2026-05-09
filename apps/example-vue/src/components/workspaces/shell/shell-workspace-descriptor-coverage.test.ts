import { describe, expect, test } from "bun:test"

import {
  generatedStandardCrudFrontendModuleArtifacts,
  generatedStandardCrudWorkspaceKinds,
} from "../../../app/workspace-registry/generated"
import {
  generatedStandardCrudMainComponents,
  generatedStandardCrudPanelComponents,
} from "../../../modules/generated"
import ReadonlyListWorkspaceMain from "../shared/ReadonlyListWorkspaceMain.vue"
import {
  type ShellWorkspaceMainSwitchProps,
  resolveShellWorkspaceMainDescriptor,
  shellWorkspaceMainResolverKinds,
} from "./shell-workspace-main-descriptor"
import {
  type ShellWorkspaceSecondarySwitchProps,
  resolveShellWorkspaceSecondaryDescriptor,
  shellWorkspaceSecondaryResolverKinds,
} from "./shell-workspace-secondary-descriptor"

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

  test("routes department to generated standard CRUD main and panel components", () => {
    const mainDescriptor = resolveShellWorkspaceMainDescriptor(
      {
        t: (key: string) => key,
        currentWorkspaceKind: "department",
        authModuleReady: true,
        isAuthenticated: true,
        departmentModuleReady: true,
        canEnterDepartmentWorkspace: true,
        canViewDepartments: true,
        canCreateDepartments: true,
        canUpdateDepartments: true,
        enterpriseDepartmentQueryFields: [{ key: "name" }],
        enterpriseDepartmentTableColumns: [{ colKey: "name" }],
        departmentCountLabel: "1 departments",
        enterpriseCrudCopy: {},
      } as unknown as ShellWorkspaceMainSwitchProps,
      (() => undefined) as never,
    )

    const secondaryDescriptor = resolveShellWorkspaceSecondaryDescriptor(
      {
        t: (key: string) => key,
        locale: "zh-CN",
        currentWorkspaceKind: "department",
        authModuleReady: true,
        isAuthenticated: true,
        departmentModuleReady: true,
        canEnterDepartmentWorkspace: true,
        canViewDepartments: true,
        canCreateDepartments: true,
        canUpdateDepartments: true,
        enterpriseFormCopy: {},
      } as unknown as ShellWorkspaceSecondarySwitchProps,
      (() => undefined) as never,
    )

    expect(mainDescriptor.component).toBe(
      generatedStandardCrudMainComponents.department,
    )
    expect(mainDescriptor.listeners).toHaveProperty("reset")
    expect(secondaryDescriptor.component).toBe(
      generatedStandardCrudPanelComponents.department,
    )
    expect(secondaryDescriptor.listeners).toHaveProperty("cancel-panel")
  })

  test("routes session and operation log mains through readonly list template", () => {
    const sessionDescriptor = resolveShellWorkspaceMainDescriptor(
      {
        t: (key: string) => key,
        currentWorkspaceKind: "session",
        authModuleReady: true,
        isAuthenticated: true,
        canEnterSessionWorkspace: true,
        sessionLoading: false,
        enterpriseSessionQueryFields: [{ key: "username", kind: "text" }],
        enterpriseSessionTableColumns: [{ colKey: "username" }],
        enterpriseSessionTableItems: [],
        enterpriseCrudCopy: {},
      } as unknown as ShellWorkspaceMainSwitchProps,
      (() => undefined) as never,
    )

    const operationLogDescriptor = resolveShellWorkspaceMainDescriptor(
      {
        t: (key: string) => key,
        currentWorkspaceKind: "operation-log",
        authModuleReady: true,
        isAuthenticated: true,
        canEnterOperationLogWorkspace: true,
        canViewOperationLogs: true,
        operationLogLoading: false,
        enterpriseOperationLogQueryFields: [{ key: "action", kind: "text" }],
        enterpriseOperationLogTableColumns: [{ colKey: "action" }],
        enterpriseOperationLogTableItems: [],
        operationLogCountLabel: "0 logs",
        enterpriseCrudCopy: {},
      } as unknown as ShellWorkspaceMainSwitchProps,
      (() => undefined) as never,
    )

    expect(sessionDescriptor.component).toBe(ReadonlyListWorkspaceMain)
    expect(sessionDescriptor.props).toMatchObject({
      paginate: true,
      queryFields: [{ key: "username", kind: "text" }],
    })
    expect(sessionDescriptor.listeners).toHaveProperty("reset")

    expect(operationLogDescriptor.component).toBe(ReadonlyListWorkspaceMain)
    expect(operationLogDescriptor.props).toMatchObject({
      itemCountLabel: "0 logs",
      queryFields: [{ key: "action", kind: "text" }],
    })
    expect(operationLogDescriptor.listeners).toHaveProperty("reset")
  })
})
