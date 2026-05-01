import type { ComputedRef } from "vue"
import { computed } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import type { NotificationRecord } from "../../../lib/platform-api"

export interface NotificationWorkspaceMainInjectedState {
  notificationErrorMessage: { value: string }
  notificationLoading: { value: boolean }
  tableItems: { value: NotificationRecord[] }
}

export interface NotificationWorkspacePanelInjectedState
  extends NotificationWorkspaceMainInjectedState {
  notificationDetailErrorMessage: { value: string }
  notificationDetailLoading: { value: boolean }
  notificationPanelMode: { value: "detail" | "create" }
  formFields: { value: unknown[] }
  formValues: { value: Record<string, unknown> }
  panelDescription: { value: string }
  panelTitle: { value: string }
  selectedNotification: { value: NotificationRecord | null }
}

const resolveNotificationWorkspaceState = <TState>(
  context: WorkspaceStateContext | null,
  enabled: boolean,
): TState | null => {
  if (!enabled || context?.kind !== "notification") {
    return null
  }

  return context.state as TState
}

export const resolveNotificationWorkspaceMainState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveNotificationWorkspaceState<NotificationWorkspaceMainInjectedState>(
    context,
    enabled,
  )

export const resolveNotificationWorkspacePanelState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolveNotificationWorkspaceState<NotificationWorkspacePanelInjectedState>(
    context,
    enabled,
  )

export const readInjectedValue = <TValue>(
  state: ComputedRef<{ value: TValue } | null>,
  fallback: TValue,
) => computed(() => state.value?.value ?? fallback)
