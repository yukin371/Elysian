import { type ComputedRef, computed } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import type { CustomerRecord } from "../../../lib/platform-api"

export interface CustomerWorkspaceMainInjectedState {
  customerErrorMessage: { value: string }
  customerItems: { value: CustomerRecord[] }
  customerLoading: { value: boolean }
}

export type CustomerPanelMode = "create" | "detail" | "edit" | "delete-confirm"

export interface CustomerWorkspacePanelInjectedState
  extends CustomerWorkspaceMainInjectedState {
  customerFormMode: { value: "create" | "detail" | "edit" }
  deleteConfirmId: { value: string | null }
  formFields: { value: unknown[] }
  formValues: { value: Record<string, unknown> }
  panelDescription: { value: string }
  panelMode: { value: CustomerPanelMode }
  panelTitle: { value: string }
  selectedCustomer: { value: CustomerRecord | null }
  selectedRow: { value: Record<string, unknown> | null }
}

const resolveCustomerWorkspaceState = <TState>(
  context: WorkspaceStateContext | null,
  enabled: boolean,
): TState | null => {
  if (!enabled || context?.kind !== "customer") {
    return null
  }

  return context.state as TState
}

export const resolveCustomerWorkspaceMainState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveCustomerWorkspaceState<CustomerWorkspaceMainInjectedState>(
    context,
    enabled,
  )

export const resolveCustomerWorkspacePanelState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveCustomerWorkspaceState<CustomerWorkspacePanelInjectedState>(
    context,
    enabled,
  )

export const readInjectedValue = <TValue>(
  state: ComputedRef<{ value: TValue } | null>,
  fallback: TValue,
) => computed(() => state.value?.value ?? fallback)
