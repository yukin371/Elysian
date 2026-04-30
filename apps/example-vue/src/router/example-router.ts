import type { UiNavigationNode } from "@elysian/ui-core"
import type { ComputedRef } from "vue"
import { computed } from "vue"

import {
  resolveWorkspaceMenuKeyByPath,
  toWorkspaceRouteHash,
} from "../lib/navigation-workspace"

export type ExampleAppLayout = "auth" | "admin"

export const resolveExampleAppLayout = (
  isAuthenticated: boolean,
): ExampleAppLayout => (isAuthenticated ? "admin" : "auth")

export const useExampleAppLayout = ({
  isAuthenticated,
}: {
  isAuthenticated: ComputedRef<boolean>
}) =>
  computed<ExampleAppLayout>(() =>
    resolveExampleAppLayout(isAuthenticated.value),
  )

export const readCurrentWorkspaceRouteMenuKey = (items: UiNavigationNode[]) => {
  if (typeof window === "undefined") {
    return null
  }

  return resolveWorkspaceMenuKeyByPath(items, window.location.hash)
}

export const replaceCurrentWorkspaceRoute = (
  path: string | null | undefined,
) => {
  if (typeof window === "undefined") {
    return
  }

  const nextHash = toWorkspaceRouteHash(path)

  if (!nextHash || window.location.hash === nextHash) {
    return
  }

  window.history.replaceState(null, "", nextHash)
}

export const listenWorkspaceRouteChange = (listener: () => void) => {
  if (typeof window === "undefined") {
    return () => {}
  }

  window.addEventListener("hashchange", listener)

  return () => {
    window.removeEventListener("hashchange", listener)
  }
}
