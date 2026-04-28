import type { UseExampleShellBindingsOptions } from "./use-example-shell-binding-types"

import { createExampleShellWorkspaceSecondaryBindings } from "./use-example-shell-workspace-secondary-bindings-descriptor"

export const useExampleShellWorkspaceSecondaryBindings = (
  options: UseExampleShellBindingsOptions,
) => createExampleShellWorkspaceSecondaryBindings(options)
