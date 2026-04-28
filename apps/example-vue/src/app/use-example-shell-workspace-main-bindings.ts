import type { UseExampleShellBindingsOptions } from "./use-example-shell-binding-types"

import { createExampleShellWorkspaceMainBindings } from "./use-example-shell-workspace-main-bindings-descriptor"

export const useExampleShellWorkspaceMainBindings = (
  options: UseExampleShellBindingsOptions,
) => createExampleShellWorkspaceMainBindings(options)
