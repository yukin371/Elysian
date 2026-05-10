import type { Ref } from "vue"

import type { RegisteredWorkspaceKind } from "./types"

export type WorkspaceModuleReadyMap = ReadonlyMap<
  RegisteredWorkspaceKind,
  Ref<boolean>
>

interface CreateWorkspaceModuleReadyMapOptions {
  authModuleReady: Ref<boolean>
  customerModuleReady: Ref<boolean>
  departmentModuleReady: Ref<boolean>
  dictionaryModuleReady: Ref<boolean>
  fileModuleReady: Ref<boolean>
  menuModuleReady: Ref<boolean>
  notificationModuleReady: Ref<boolean>
  operationLogModuleReady: Ref<boolean>
  postModuleReady: Ref<boolean>
  roleModuleReady: Ref<boolean>
  settingModuleReady: Ref<boolean>
  tenantModuleReady: Ref<boolean>
  userModuleReady: Ref<boolean>
  workflowModuleReady: Ref<boolean>
}

export const createWorkspaceModuleReadyMap = ({
  authModuleReady,
  customerModuleReady,
  departmentModuleReady,
  dictionaryModuleReady,
  fileModuleReady,
  menuModuleReady,
  notificationModuleReady,
  operationLogModuleReady,
  postModuleReady,
  roleModuleReady,
  settingModuleReady,
  tenantModuleReady,
  userModuleReady,
  workflowModuleReady,
}: CreateWorkspaceModuleReadyMapOptions): WorkspaceModuleReadyMap =>
  new Map<RegisteredWorkspaceKind, Ref<boolean>>([
    ["customer", customerModuleReady],
    ["demohub", authModuleReady],
    ["department", departmentModuleReady],
    ["dictionary", dictionaryModuleReady],
    ["file", fileModuleReady],
    ["generator-preview", authModuleReady],
    ["menu", menuModuleReady],
    ["notification", notificationModuleReady],
    ["operation-log", operationLogModuleReady],
    ["post", postModuleReady],
    ["role", roleModuleReady],
    ["session", authModuleReady],
    ["setting", settingModuleReady],
    ["tenant", tenantModuleReady],
    ["user", userModuleReady],
    ["workflow-definitions", workflowModuleReady],
  ])
