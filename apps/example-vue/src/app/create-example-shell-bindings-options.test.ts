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

const createTypedDeepProxy = <Value extends object>(
  overrides: Record<string, unknown>,
): Value => createDeepProxy(overrides) as Value

const createWorkspaceInput = <
  WorkspaceInput extends
    CreateExampleShellBindingsOptionsInput[keyof CreateExampleShellBindingsOptionsInput],
>(
  overrides: Record<string, unknown>,
): WorkspaceInput => createTypedDeepProxy<WorkspaceInput>(overrides)

describe("createExampleShellBindingsOptions", () => {
  test("keeps shell passthrough and workspace mapping stable", () => {
    const submitLogout = () => undefined
    const reloadRoles = () => Promise.resolve()
    const handleExportRoles = () => Promise.resolve()
    const handleExportUsers = () => Promise.resolve()
    const handleExportDictionaryTypes = () => Promise.resolve()
    const handleExportDictionaryItems = () => Promise.resolve()
    const handleExportDepartments = () => Promise.resolve()
    const handleExportPosts = () => Promise.resolve()
    const handleExportMenus = () => Promise.resolve()
    const handleExportOperationLogs = () => Promise.resolve()
    const handleExportSettings = () => Promise.resolve()
    const handleExportTenants = () => Promise.resolve()
    const handleExportFiles = () => Promise.resolve()
    const handleExportNotifications = () => Promise.resolve()
    const markVisibleNotificationsAsRead = () => Promise.resolve()
    const refreshGeneratorPreview = () => Promise.resolve()
    const selectedRole = { id: "role-1", name: "Operator" }
    const selectedCustomer = { id: "customer-1", name: "Acme" }
    let editedRole: unknown = null
    let editedCustomer: unknown = null
    let deletedCustomer: unknown = null
    let dictionaryEditCalls = 0
    const startRoleEdit = (record: unknown) => {
      editedRole = record
    }
    const startCustomerEdit = (record: unknown) => {
      editedCustomer = record
    }
    const requestCustomerDelete = (record: unknown) => {
      deletedCustomer = record
    }

    const input: CreateExampleShellBindingsOptionsInput = {
      shell: createTypedDeepProxy<
        CreateExampleShellBindingsOptionsInput["shell"]
      >({
        authStatusLabel: "Authenticated",
        submitLogout,
      }),
      roleWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["roleWorkspace"]
      >({
        isRoleWorkspace: true,
        roleExportLoading: true,
        canUpdateRoles: true,
        handleExportRoles,
        "workspace.roleLoading": true,
        "workspace.panelTitle": "Role Details",
        "workspace.reloadRoles": reloadRoles,
        "workspace.selectedRole": { value: selectedRole },
        "workspace.startEdit": startRoleEdit,
      }),
      customerWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["customerWorkspace"]
      >({
        "workspace.selectedCustomer": { value: selectedCustomer },
        "workspace.startEdit": startCustomerEdit,
        "workspace.requestDelete": requestCustomerDelete,
      }),
      dictionaryWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["dictionaryWorkspace"]
      >({
        dictionaryTypeExportLoading: true,
        dictionaryItemsExportLoading: true,
        handleExportDictionaryTypes,
        handleExportDictionaryItems,
        "workspace.selectedDictionaryType": { value: null },
        "workspace.startEdit": () => {
          dictionaryEditCalls += 1
        },
      }),
      departmentWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["departmentWorkspace"]
      >({
        departmentExportLoading: true,
        handleExportDepartments,
      }),
      sessionWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["sessionWorkspace"]
      >({}),
      postWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["postWorkspace"]
      >({
        postExportLoading: true,
        handleExportPosts,
      }),
      menuWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["menuWorkspace"]
      >({
        menuExportLoading: true,
        handleExportMenus,
      }),
      notificationWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["notificationWorkspace"]
      >({
        notificationExportLoading: true,
        handleExportNotifications,
        visibleUnreadNotificationCount: 2,
        "workspace.markVisibleAsRead": markVisibleNotificationsAsRead,
      }),
      operationLogWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["operationLogWorkspace"]
      >({
        operationLogExportLoading: true,
        canExportOperationLogs: true,
        handleExportOperationLogs,
      }),
      userWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["userWorkspace"]
      >({
        userExportLoading: true,
        handleExportUsers,
      }),
      settingWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["settingWorkspace"]
      >({
        settingExportLoading: true,
        handleExportSettings,
      }),
      tenantWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["tenantWorkspace"]
      >({
        tenantExportLoading: true,
        handleExportTenants,
      }),
      fileWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["fileWorkspace"]
      >({
        fileExportLoading: true,
        handleExportFiles,
      }),
      workflowWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["workflowWorkspace"]
      >({}),
      generatorPreviewWorkspace: createWorkspaceInput<
        CreateExampleShellBindingsOptionsInput["generatorPreviewWorkspace"]
      >({
        generatorPreviewLoading: true,
        generatorPreviewReviewLoading: false,
        generatorPreviewApplyLoading: false,
        generatorPreviewErrorMessage: "",
        generatorPreviewSchemaOptions: [],
        generatorPreviewConflictStrategyOptions: [],
        generatorPreviewRecentSessionOptions: [],
        selectedGeneratorPreviewConflictStrategy: "",
        selectedGeneratorPreviewRecentSessionId: "",
        selectedGeneratorPreviewSchemaName: "",
        selectedGeneratorPreviewFrontendTarget: "vue",
        generatorPreviewQuery: "",
        generatorPreviewFiles: [],
        selectedGeneratorPreviewFilePath: null,
        canApproveGeneratorPreview: false,
        canRejectGeneratorPreview: false,
        canApplyGeneratorPreview: false,
        canConfirmGeneratorPreview: false,
        generatorPreviewDiffSummary: null,
        generatorPreviewSession: null,
        selectedGeneratorPreviewSchema: null,
        selectedGeneratorPreviewFile: null,
        generatorPreviewSqlPreview: null,
        generatorPreviewSqlProposal: null,
        generatorPreviewSqlProposalHandoff: null,
        refreshGeneratorPreview,
        restoreGeneratorPreviewSession: () => {},
        reviewGeneratorPreview: () => {},
        confirmGeneratorPreview: () => {},
        applyGeneratorPreview: () => {},
      }),
    }

    const result = createExampleShellBindingsOptions(input)
    const resultRecord = Object(result) as Record<string, unknown>

    expect(resultRecord.authStatusLabel).toBe("Authenticated")
    expect(resultRecord.submitLogout).toBe(submitLogout)
    expect(resultRecord.isRoleWorkspace).toBe(true)
    expect(resultRecord.roleLoading).toBe(true)
    expect(resultRecord.roleExportLoading).toBe(true)
    expect(resultRecord.canUpdateRoles).toBe(true)
    expect(resultRecord.rolePanelTitle).toBe("Role Details")
    expect(resultRecord.reloadRoles).toBe(reloadRoles)
    expect(resultRecord.handleExportRoles).toBe(handleExportRoles)
    expect(resultRecord.dictionaryTypeExportLoading).toBe(true)
    expect(resultRecord.handleExportDictionaryTypes).toBe(
      handleExportDictionaryTypes,
    )
    expect(resultRecord.dictionaryItemsExportLoading).toBe(true)
    expect(resultRecord.handleExportDictionaryItems).toBe(
      handleExportDictionaryItems,
    )
    expect(resultRecord.departmentExportLoading).toBe(true)
    expect(resultRecord.handleExportDepartments).toBe(handleExportDepartments)
    expect(resultRecord.postExportLoading).toBe(true)
    expect(resultRecord.handleExportPosts).toBe(handleExportPosts)
    expect(resultRecord.menuExportLoading).toBe(true)
    expect(resultRecord.handleExportMenus).toBe(handleExportMenus)
    expect(resultRecord.notificationExportLoading).toBe(true)
    expect(resultRecord.handleExportNotifications).toBe(
      handleExportNotifications,
    )
    expect(resultRecord.visibleUnreadNotificationCount).toBe(2)
    expect(resultRecord.markVisibleNotificationsAsRead).toBe(
      markVisibleNotificationsAsRead,
    )
    expect(resultRecord.operationLogExportLoading).toBe(true)
    expect(resultRecord.canExportOperationLogs).toBe(true)
    expect(resultRecord.handleExportOperationLogs).toBe(
      handleExportOperationLogs,
    )
    expect(resultRecord.userExportLoading).toBe(true)
    expect(resultRecord.handleExportUsers).toBe(handleExportUsers)
    expect(resultRecord.settingExportLoading).toBe(true)
    expect(resultRecord.handleExportSettings).toBe(handleExportSettings)
    expect(resultRecord.tenantExportLoading).toBe(true)
    expect(resultRecord.handleExportTenants).toBe(handleExportTenants)
    expect(resultRecord.fileExportLoading).toBe(true)
    expect(resultRecord.handleExportFiles).toBe(handleExportFiles)
    expect(resultRecord.generatorPreviewLoading).toBe(true)
    expect(resultRecord.canConfirmGeneratorPreview).toBe(false)
    expect(resultRecord.refreshGeneratorPreview).toBe(refreshGeneratorPreview)
    expect(resultRecord.confirmGeneratorPreview).toBeDefined()
    result.startRoleEdit()
    result.startEdit()
    result.requestDelete()
    result.startDictionaryEdit()

    expect(editedRole).toBe(selectedRole)
    expect(editedCustomer).toBe(selectedCustomer)
    expect(deletedCustomer).toBe(selectedCustomer)
    expect(dictionaryEditCalls).toBe(0)
  })
})
