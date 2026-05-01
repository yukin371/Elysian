import type { ComputedRef } from "vue"
import { computed } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import type { PostRecord } from "../../../lib/platform-api"

export interface PostWorkspaceMainInjectedState {
  postErrorMessage: { value: string }
  postLoading: { value: boolean }
  tableItems: { value: PostRecord[] }
}

export interface PostWorkspacePanelInjectedState
  extends PostWorkspaceMainInjectedState {
  formFields: { value: unknown[] }
  formValues: { value: Record<string, unknown> }
  panelDescription: { value: string }
  panelTitle: { value: string }
  postDetailErrorMessage: { value: string }
  postDetailLoading: { value: boolean }
  postPanelMode: { value: "detail" | "create" | "edit" }
  selectedPost: { value: PostRecord | null }
}

const resolvePostWorkspaceState = <TState>(
  context: WorkspaceStateContext | null,
  enabled: boolean,
): TState | null => {
  if (!enabled || context?.kind !== "post") {
    return null
  }

  return context.state as TState
}

export const resolvePostWorkspaceMainState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) => resolvePostWorkspaceState<PostWorkspaceMainInjectedState>(context, enabled)

export const resolvePostWorkspacePanelState = (
  context: WorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolvePostWorkspaceState<PostWorkspacePanelInjectedState>(context, enabled)

export const readInjectedValue = <TValue>(
  state: ComputedRef<{ value: TValue } | null>,
  fallback: TValue,
) => computed(() => state.value?.value ?? fallback)
