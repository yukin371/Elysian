import type { ComputedRef } from "vue"
import { computed } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import type { MenuDetailRecord, MenuRecord } from "../../../lib/platform-api"

export interface MenuWorkspaceMainInjectedState {
  menuErrorMessage: { value: string }
  menuLoading: { value: boolean }
  tableItems: { value: MenuRecord[] }
}

export interface MenuWorkspacePanelInjectedState
  extends MenuWorkspaceMainInjectedState {
  formFields: { value: unknown[] }
  formValues: { value: Record<string, unknown> }
  menuDetailErrorMessage: { value: string }
  menuDetailLoading: { value: boolean }
  menuPanelMode: { value: "detail" | "create" | "edit" }
  panelDescription: { value: string }
  panelTitle: { value: string }
  parentLookup: { value: Map<string, MenuRecord> }
  selectedMenu: { value: MenuRecord | null }
  selectedMenuDetail: { value: MenuDetailRecord | null }
}

const resolveMenuWorkspaceState = <TState>(
  context: WorkspaceStateContext | null,
  enabled: boolean,
): TState | null => {
  if (!enabled || context?.kind !== "menu") {
    return null
  }

  return context.state as TState
}

export const resolveMenuWorkspaceMainState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) => resolveMenuWorkspaceState<MenuWorkspaceMainInjectedState>(context, enabled)

export const resolveMenuWorkspacePanelState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveMenuWorkspaceState<MenuWorkspacePanelInjectedState>(context, enabled)

export const readInjectedValue = <TValue>(
  state: ComputedRef<{ value: TValue } | null>,
  fallback: TValue,
) => computed(() => state.value?.value ?? fallback)
