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

interface DictionaryWorkspaceProviderState {
  dictionaryErrorMessage: Ref<string>
  tableItems: Ref<unknown[]>
  dictionaryLoading: Ref<boolean>
}

export const resolveProvidedWorkspaceState = (
  kind: string,
  customerWorkspaceState: CustomerWorkspaceProviderState | null,
  dictionaryWorkspaceState: DictionaryWorkspaceProviderState | null = null,
): WorkspaceStateContext | null => {
  if (kind === "customer" && customerWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: customerWorkspaceState.customerLoading,
      errorMessage: customerWorkspaceState.customerErrorMessage,
      state: customerWorkspaceState,
    }
  }

  if (kind === "dictionary" && dictionaryWorkspaceState) {
    return {
      kind: kind as RegisteredWorkspaceKind,
      loading: dictionaryWorkspaceState.dictionaryLoading,
      errorMessage: dictionaryWorkspaceState.dictionaryErrorMessage,
      state: dictionaryWorkspaceState,
    }
  }

  return null
}
