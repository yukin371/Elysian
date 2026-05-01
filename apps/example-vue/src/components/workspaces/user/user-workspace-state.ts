import type { ComputedRef } from "vue"
import { computed } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import type { UserRecord } from "../../../lib/platform-api"

export interface UserWorkspaceMainInjectedState {
  userErrorMessage: { value: string }
  userLoading: { value: boolean }
  tableItems: { value: UserRecord[] }
}

export interface UserWorkspacePanelInjectedState
  extends UserWorkspaceMainInjectedState {
  formFields: { value: unknown[] }
  formValues: { value: Record<string, unknown> }
  panelDescription: { value: string }
  panelTitle: { value: string }
  selectedUser: { value: UserRecord | null }
  userPanelMode: { value: "detail" | "create" | "edit" | "reset" }
}

const resolveUserWorkspaceState = <TState>(
  context: WorkspaceStateContext | null,
  enabled: boolean,
): TState | null => {
  if (!enabled || context?.kind !== "user") {
    return null
  }

  return context.state as TState
}

export const resolveUserWorkspaceMainState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) => resolveUserWorkspaceState<UserWorkspaceMainInjectedState>(context, enabled)

export const resolveUserWorkspacePanelState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveUserWorkspaceState<UserWorkspacePanelInjectedState>(context, enabled)

export const readInjectedValue = <TValue>(
  state: ComputedRef<{ value: TValue } | null>,
  fallback: TValue,
) => computed(() => state.value?.value ?? fallback)
