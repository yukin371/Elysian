import type { ComputedRef } from "vue"
import { computed } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import type {
  DepartmentDetailRecord,
  DepartmentRecord,
} from "../../../lib/platform-api"

export interface DepartmentWorkspaceMainInjectedState {
  departmentErrorMessage: { value: string }
  departmentLoading: { value: boolean }
  tableItems: { value: DepartmentRecord[] }
}

export interface DepartmentWorkspacePanelInjectedState
  extends DepartmentWorkspaceMainInjectedState {
  departmentDetailErrorMessage: { value: string }
  departmentDetailLoading: { value: boolean }
  departmentPanelMode: { value: "detail" | "create" | "edit" }
  formFields: { value: unknown[] }
  formValues: { value: Record<string, unknown> }
  panelDescription: { value: string }
  panelTitle: { value: string }
  parentLookup: { value: Map<string, DepartmentRecord> }
  selectedDepartment: { value: DepartmentRecord | null }
  selectedDepartmentDetail: { value: DepartmentDetailRecord | null }
}

const resolveDepartmentWorkspaceState = <TState>(
  context: WorkspaceStateContext | null,
  enabled: boolean,
): TState | null => {
  if (!enabled || context?.kind !== "department") {
    return null
  }

  return context.state as TState
}

export const resolveDepartmentWorkspaceMainState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveDepartmentWorkspaceState<DepartmentWorkspaceMainInjectedState>(
    context,
    enabled,
  )

export const resolveDepartmentWorkspacePanelState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveDepartmentWorkspaceState<DepartmentWorkspacePanelInjectedState>(
    context,
    enabled,
  )

export const readInjectedValue = <TValue>(
  state: ComputedRef<{ value: TValue } | null>,
  fallback: TValue,
) => computed(() => state.value?.value ?? fallback)
