import type { UiNavigationNode } from "@elysian/ui-core"
import type { ComputedRef } from "vue"
import { computed } from "vue"

import {
  resolveWorkspaceMenuKeyByPath,
  toWorkspaceRouteHash,
} from "../lib/navigation-workspace"

export type ExampleAppLayout = "auth" | "admin"

interface ExampleBrowserWindow {
  addEventListener: (type: "hashchange", listener: () => void) => void
  history: {
    replaceState: (data: unknown, unused: string, url?: string | URL) => void
  }
  location: {
    hash: string
  }
  removeEventListener: (type: "hashchange", listener: () => void) => void
}

const getBrowserWindow = () =>
  (globalThis as { window?: ExampleBrowserWindow }).window ?? null

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
  const browserWindow = getBrowserWindow()

  if (!browserWindow) {
    return null
  }

  return resolveWorkspaceMenuKeyByPath(items, browserWindow.location.hash)
}

export const replaceCurrentWorkspaceRoute = (
  path: string | null | undefined,
) => {
  const browserWindow = getBrowserWindow()

  if (!browserWindow) {
    return
  }

  const nextHash = toWorkspaceRouteHash(path)

  if (!nextHash || browserWindow.location.hash === nextHash) {
    return
  }

  browserWindow.history.replaceState(null, "", nextHash)
}

export const listenWorkspaceRouteChange = (listener: () => void) => {
  const browserWindow = getBrowserWindow()

  if (!browserWindow) {
    return () => {}
  }

  browserWindow.addEventListener("hashchange", listener)

  return () => {
    browserWindow.removeEventListener("hashchange", listener)
  }
}
