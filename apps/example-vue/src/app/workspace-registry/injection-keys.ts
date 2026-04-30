import type { InjectionKey } from "vue"

import type { WorkspaceState } from "./types"

export const WORKSPACE_STATE_KEY: InjectionKey<WorkspaceState> = Symbol(
  "example-workspace-state",
)
