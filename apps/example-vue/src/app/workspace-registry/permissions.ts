import { authWorkspaceRegistrations } from "./auth-registry"
import { businessWorkspaceRegistrations } from "./business-registry"
import { systemWorkspaceRegistrations } from "./system-registry"
import type {
  RegisteredWorkspaceKind,
  WorkspacePermissionRegistration,
} from "./types"

const permissionRegistrations = [
  ...authWorkspaceRegistrations,
  ...businessWorkspaceRegistrations,
  ...systemWorkspaceRegistrations,
]

const workspacePermissionsByKind = new Map(
  permissionRegistrations.map((workspace) => [
    workspace.kind,
    workspace.permissions ?? {},
  ]),
) as ReadonlyMap<RegisteredWorkspaceKind, WorkspacePermissionRegistration>

export const getWorkspacePermissions = (
  kind: RegisteredWorkspaceKind,
): WorkspacePermissionRegistration => workspacePermissionsByKind.get(kind) ?? {}
