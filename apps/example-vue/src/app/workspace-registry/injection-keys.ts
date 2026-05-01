import { WORKSPACE_STATE_KEY as SHARED_WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import type { ComputedRef, InjectionKey } from "vue"

import type { WorkspaceStateContext } from "./types"

export const WORKSPACE_STATE_KEY: InjectionKey<
  ComputedRef<WorkspaceStateContext | null>
> = SHARED_WORKSPACE_STATE_KEY as InjectionKey<
  ComputedRef<WorkspaceStateContext | null>
>
