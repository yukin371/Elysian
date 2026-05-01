import type { ComputedRef } from "vue"
import { computed } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import type { SettingRecord } from "../../../lib/platform-api"

export interface SettingWorkspaceMainInjectedState {
  settingErrorMessage: { value: string }
  settingLoading: { value: boolean }
  tableItems: { value: SettingRecord[] }
}

export interface SettingWorkspacePanelInjectedState
  extends SettingWorkspaceMainInjectedState {
  settingDetailErrorMessage: { value: string }
  settingDetailLoading: { value: boolean }
  settingPanelMode: { value: "detail" | "create" | "edit" }
  formFields: { value: unknown[] }
  formValues: { value: Record<string, unknown> }
  panelDescription: { value: string }
  panelTitle: { value: string }
  selectedSetting: { value: SettingRecord | null }
}

const resolveSettingWorkspaceState = <TState>(
  context: WorkspaceStateContext | null,
  enabled: boolean,
): TState | null => {
  if (!enabled || context?.kind !== "setting") {
    return null
  }

  return context.state as TState
}

export const resolveSettingWorkspaceMainState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveSettingWorkspaceState<SettingWorkspaceMainInjectedState>(
    context,
    enabled,
  )

export const resolveSettingWorkspacePanelState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveSettingWorkspaceState<SettingWorkspacePanelInjectedState>(
    context,
    enabled,
  )

export const readInjectedValue = <TValue>(
  state: ComputedRef<{ value: TValue } | null>,
  fallback: TValue,
) => computed(() => state.value?.value ?? fallback)
