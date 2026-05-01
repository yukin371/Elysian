import type { ComputedRef } from "vue"
import { computed } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import type { TenantRecord } from "../../../lib/platform-api"

export interface TenantWorkspaceMainInjectedState {
  tenantErrorMessage: { value: string }
  tenantLoading: { value: boolean }
  tableItems: { value: TenantRecord[] }
}

export interface TenantWorkspacePanelInjectedState
  extends TenantWorkspaceMainInjectedState {
  tenantDetailErrorMessage: { value: string }
  tenantDetailLoading: { value: boolean }
  tenantPanelMode: { value: "detail" | "create" | "edit" }
  formFields: { value: unknown[] }
  formValues: { value: Record<string, unknown> }
  panelDescription: { value: string }
  panelTitle: { value: string }
  selectedTenant: { value: TenantRecord | null }
}

const resolveTenantWorkspaceState = <TState>(
  context: WorkspaceStateContext | null,
  enabled: boolean,
): TState | null => {
  if (!enabled || context?.kind !== "tenant") {
    return null
  }

  return context.state as TState
}

export const resolveTenantWorkspaceMainState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveTenantWorkspaceState<TenantWorkspaceMainInjectedState>(
    context,
    enabled,
  )

export const resolveTenantWorkspacePanelState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveTenantWorkspaceState<TenantWorkspacePanelInjectedState>(
    context,
    enabled,
  )

export const readInjectedValue = <TValue>(
  state: ComputedRef<{ value: TValue } | null>,
  fallback: TValue,
) => computed(() => state.value?.value ?? fallback)
