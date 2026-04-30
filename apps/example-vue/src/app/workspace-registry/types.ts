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
  navigation?: WorkspaceNavigationRegistration
  path: string
  permissionPrefix: string
}

export interface WorkspaceNavigationGroupRegistration {
  code: string
  icon: string
  id: string
  nameKey: string
  sort: number
}

export interface WorkspaceNavigationRegistration {
  code: string
  component: string
  group?: WorkspaceNavigationGroupRegistration
  icon: string
  id: string
  nameKey: string
  parentCode: string | null
  parentId: string | null
  permissionCode: string | null
  sort: number
}
