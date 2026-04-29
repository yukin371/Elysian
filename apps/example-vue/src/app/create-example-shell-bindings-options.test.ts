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

    const input = {
      shell: {
        authStatusLabel: "Authenticated",
        submitLogout,
      },
      roleWorkspace: createWorkspaceInput({
        isRoleWorkspace: true,
        roleExportLoading: true,
        canUpdateRoles: true,
        handleExportRoles,
        "workspace.roleLoading": true,
        "workspace.panelTitle": "Role Details",
        "workspace.reloadRoles": reloadRoles,
      }),
      customerWorkspace: createWorkspaceInput({}),
      dictionaryWorkspace: createWorkspaceInput({
        dictionaryTypeExportLoading: true,
        dictionaryItemsExportLoading: true,
        handleExportDictionaryTypes,
        handleExportDictionaryItems,
      }),
      departmentWorkspace: createWorkspaceInput({
        departmentExportLoading: true,
        handleExportDepartments,
      }),
      sessionWorkspace: createWorkspaceInput({}),
      postWorkspace: createWorkspaceInput({
        postExportLoading: true,
        handleExportPosts,
      }),
      menuWorkspace: createWorkspaceInput({
        menuExportLoading: true,
        handleExportMenus,
      }),
      notificationWorkspace: createWorkspaceInput({
        notificationExportLoading: true,
        handleExportNotifications,
        visibleUnreadNotificationCount: 2,
        "workspace.markVisibleAsRead": markVisibleNotificationsAsRead,
      }),
      operationLogWorkspace: createWorkspaceInput({
        operationLogExportLoading: true,
        canExportOperationLogs: true,
        handleExportOperationLogs,
      }),
      userWorkspace: createWorkspaceInput({
        userExportLoading: true,
        handleExportUsers,
      }),
      settingWorkspace: createWorkspaceInput({
        settingExportLoading: true,
        handleExportSettings,
      }),
      tenantWorkspace: createWorkspaceInput({
        tenantExportLoading: true,
        handleExportTenants,
      }),
      fileWorkspace: createWorkspaceInput({
        fileExportLoading: true,
        handleExportFiles,
      }),
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
    expect(result.roleExportLoading).toBe(true)
    expect(result.canUpdateRoles).toBe(true)
    expect(result.rolePanelTitle).toBe("Role Details")
    expect(result.reloadRoles).toBe(reloadRoles)
    expect(result.handleExportRoles).toBe(handleExportRoles)
    expect(result.dictionaryTypeExportLoading).toBe(true)
    expect(result.handleExportDictionaryTypes).toBe(handleExportDictionaryTypes)
    expect(result.dictionaryItemsExportLoading).toBe(true)
    expect(result.handleExportDictionaryItems).toBe(handleExportDictionaryItems)
    expect(result.departmentExportLoading).toBe(true)
    expect(result.handleExportDepartments).toBe(handleExportDepartments)
    expect(result.postExportLoading).toBe(true)
    expect(result.handleExportPosts).toBe(handleExportPosts)
    expect(result.menuExportLoading).toBe(true)
    expect(result.handleExportMenus).toBe(handleExportMenus)
    expect(result.notificationExportLoading).toBe(true)
    expect(result.handleExportNotifications).toBe(handleExportNotifications)
    expect(result.visibleUnreadNotificationCount).toBe(2)
    expect(result.markVisibleNotificationsAsRead).toBe(
      markVisibleNotificationsAsRead,
    )
    expect(result.operationLogExportLoading).toBe(true)
    expect(result.canExportOperationLogs).toBe(true)
    expect(result.handleExportOperationLogs).toBe(handleExportOperationLogs)
    expect(result.userExportLoading).toBe(true)
    expect(result.handleExportUsers).toBe(handleExportUsers)
    expect(result.settingExportLoading).toBe(true)
    expect(result.handleExportSettings).toBe(handleExportSettings)
    expect(result.tenantExportLoading).toBe(true)
    expect(result.handleExportTenants).toBe(handleExportTenants)
    expect(result.fileExportLoading).toBe(true)
    expect(result.handleExportFiles).toBe(handleExportFiles)
    expect(result.generatorPreviewLoading).toBe(true)
    expect(result.refreshGeneratorPreview).toBe(refreshGeneratorPreview)
  })
})
