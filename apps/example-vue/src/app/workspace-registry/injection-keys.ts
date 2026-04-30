import type { ComputedRef, InjectionKey } from "vue"

import type { WorkspaceStateContext } from "./types"

export const WORKSPACE_STATE_KEY: InjectionKey<
  ComputedRef<WorkspaceStateContext | null>
> = Symbol("example-workspace-state")
