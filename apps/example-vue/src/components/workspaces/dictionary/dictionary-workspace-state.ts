import type { ComputedRef } from "vue"
import { computed } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import type {
  DictionaryItemRecord,
  DictionaryTypeRecord,
} from "../../../lib/platform-api"

export interface DictionaryWorkspaceMainInjectedState {
  dictionaryErrorMessage: { value: string }
  dictionaryLoading: { value: boolean }
  tableItems: { value: DictionaryTypeRecord[] }
}

export interface DictionaryWorkspacePanelInjectedState
  extends DictionaryWorkspaceMainInjectedState {
  dictionaryDetailErrorMessage: { value: string }
  dictionaryDetailLoading: { value: boolean }
  dictionaryPanelMode: { value: "detail" | "create" | "edit" }
  formFields: { value: unknown[] }
  formValues: { value: Record<string, unknown> }
  panelDescription: { value: string }
  panelTitle: { value: string }
  selectedDictionaryType: { value: DictionaryTypeRecord | null }
  selectedDictionaryTypeItems: { value: DictionaryItemRecord[] }
}

const resolveDictionaryWorkspaceState = <TState>(
  context: WorkspaceStateContext | null,
  enabled: boolean,
): TState | null => {
  if (!enabled || context?.kind !== "dictionary") {
    return null
  }

  return context.state as TState
}

export const resolveDictionaryWorkspaceMainState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveDictionaryWorkspaceState<DictionaryWorkspaceMainInjectedState>(
    context,
    enabled,
  )

export const resolveDictionaryWorkspacePanelState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveDictionaryWorkspaceState<DictionaryWorkspacePanelInjectedState>(
    context,
    enabled,
  )

export const readInjectedValue = <TValue>(
  state: ComputedRef<{ value: TValue } | null>,
  fallback: TValue,
) => computed(() => state.value?.value ?? fallback)
