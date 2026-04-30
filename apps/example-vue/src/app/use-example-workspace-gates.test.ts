import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { useExampleWorkspaceGates } from "./use-example-workspace-gates"
import { createWorkspaceModuleReadyMap } from "./workspace-registry"

const createGateOptions = (permissionCodes: string[]) => {
  const authModuleReady = ref(true)

  return {
    permissionCodes: computed(() => permissionCodes),
    authModuleReady,
    isAuthenticated: computed(() => true),
    authIdentity: ref(null),
    workspaceModuleReady: createWorkspaceModuleReadyMap({
      authModuleReady,
      customerModuleReady: ref(false),
      departmentModuleReady: ref(false),
      postModuleReady: ref(false),
      dictionaryModuleReady: ref(false),
      fileModuleReady: ref(false),
      menuModuleReady: ref(false),
      notificationModuleReady: ref(false),
      operationLogModuleReady: ref(true),
      roleModuleReady: ref(false),
      settingModuleReady: ref(false),
      tenantModuleReady: ref(false),
      userModuleReady: ref(false),
      workflowModuleReady: ref(false),
    }),
  }
}

describe("useExampleWorkspaceGates", () => {
  test("keeps operation-log export permission separate from list permission", () => {
    const listOnlyGates = useExampleWorkspaceGates(
      createGateOptions(["system:operation-log:list"]),
    )

    expect(listOnlyGates.canViewOperationLogs.value).toBe(true)
    expect(listOnlyGates.canExportOperationLogs.value).toBe(false)

    const exportOnlyGates = useExampleWorkspaceGates(
      createGateOptions(["system:operation-log:export"]),
    )

    expect(exportOnlyGates.canViewOperationLogs.value).toBe(false)
    expect(exportOnlyGates.canExportOperationLogs.value).toBe(true)
  })
})
