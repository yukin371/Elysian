import type { Ref } from "vue"

import type { ExampleWorkspaceKind } from "../app-shell-helpers"

export type WorkspaceRegistryDomain = "auth" | "business" | "system"

export type RegisteredWorkspaceKind = Exclude<
  ExampleWorkspaceKind,
  "placeholder"
>

export interface WorkspaceState {
  errorMessage: Ref<string>
  kind: RegisteredWorkspaceKind
  loading: Ref<boolean>
}

export interface WorkspaceRegistration {
  domain: WorkspaceRegistryDomain
  i18nKeys: {
    sectionCopy: string
    sectionTitle: string
    shellDescription: string
    shellTitle: string
  }
  kind: RegisteredWorkspaceKind
  moduleCode: string
  path: string
  permissionPrefix: string
}
