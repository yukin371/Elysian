import type { UseExampleShellBindingsOptions } from "./use-example-shell-binding-types"
import { useExampleShellHeaderBindings } from "./use-example-shell-header-bindings"
import { useExampleShellWorkspaceMainBindings } from "./use-example-shell-workspace-main-bindings"
import { useExampleShellWorkspaceSecondaryBindings } from "./use-example-shell-workspace-secondary-bindings"

export const useExampleShellBindings = (
  options: UseExampleShellBindingsOptions,
) => {
  const headerBindings = useExampleShellHeaderBindings(options)
  const workspaceMainBindings = useExampleShellWorkspaceMainBindings(options)
  const workspaceSecondaryBindings =
    useExampleShellWorkspaceSecondaryBindings(options)

  return {
    ...headerBindings,
    ...workspaceMainBindings,
    ...workspaceSecondaryBindings,
  }
}
