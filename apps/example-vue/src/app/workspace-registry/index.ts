import { authWorkspaceRegistrations } from "./auth-registry"
import { businessWorkspaceRegistrations } from "./business-registry"
import { systemWorkspaceRegistrations } from "./system-registry"
import type { WorkspaceRegistration } from "./types"

export const workspaceRegistry = [
  ...businessWorkspaceRegistrations,
  ...systemWorkspaceRegistrations,
  ...authWorkspaceRegistrations,
] as const satisfies readonly WorkspaceRegistration[]

export { WORKSPACE_STATE_KEY } from "./injection-keys"
export { getWorkspacePermissions } from "./permissions"
export { createWorkspaceModuleReadyMap } from "./readiness"
export type { WorkspaceModuleReadyMap } from "./readiness"
export type {
  RegisteredWorkspaceKind,
  WorkspaceNavigationGroupRegistration,
  WorkspaceNavigationRegistration,
  WorkspacePermissionRegistration,
  WorkspaceRegistration,
  WorkspaceRegistryDomain,
  WorkspaceState,
} from "./types"
