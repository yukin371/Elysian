import type { Ref } from "vue"

import type {
  RegisteredWorkspaceKind,
  WorkspaceStateContext,
} from "../../../app/workspace-registry"

interface CustomerWorkspaceProviderState {
  customerErrorMessage: Ref<string>
  customerItems: Ref<unknown[]>
  customerLoading: Ref<boolean>
}

export const resolveProvidedWorkspaceState = (
  kind: string,
  customerWorkspaceState: CustomerWorkspaceProviderState | null,
): WorkspaceStateContext | null => {
  if (kind !== "customer" || !customerWorkspaceState) {
    return null
  }

  return {
    kind: kind as RegisteredWorkspaceKind,
    loading: customerWorkspaceState.customerLoading,
    errorMessage: customerWorkspaceState.customerErrorMessage,
    state: customerWorkspaceState,
  }
}
