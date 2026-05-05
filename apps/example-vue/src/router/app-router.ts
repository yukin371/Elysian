import { defineComponent } from "vue"
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
} from "vue-router"
import type { RouteRecordRaw } from "vue-router"

import { normalizeWorkspaceRoutePath } from "../lib/navigation-workspace"
import {
  defaultExampleWorkspacePath,
  exampleWorkspaceRoutes,
} from "./example-workspace-routes"

const ExampleWorkspaceRouteView = defineComponent({
  name: "ExampleWorkspaceRouteView",
  setup: () => () => null,
})

const registeredWorkspacePaths = new Set(
  exampleWorkspaceRoutes.map((route) => route.path),
)

const exampleWorkspaceRouteRecords: RouteRecordRaw[] =
  exampleWorkspaceRoutes.map((route) => ({
    path: route.path,
    name: route.kind,
    component: ExampleWorkspaceRouteView,
    meta: {
      moduleCode: route.moduleCode,
      workspaceKind: route.kind,
    },
  }))

const resolveFallbackWorkspacePath = (path: string) => {
  const normalizedPath = normalizeWorkspaceRoutePath(path)

  if (normalizedPath && registeredWorkspacePaths.has(normalizedPath)) {
    return normalizedPath
  }

  return defaultExampleWorkspacePath ?? "/"
}

const canUseBrowserHistory = () =>
  (globalThis as { location?: unknown }).location !== undefined

export const exampleAppRouter = createRouter({
  history: canUseBrowserHistory()
    ? createWebHashHistory()
    : createMemoryHistory(),
  routes: [
    {
      path: "/",
      redirect: defaultExampleWorkspacePath ?? "/",
    },
    ...exampleWorkspaceRouteRecords,
    {
      path: "/:pathMatch(.*)*",
      redirect: (to) => resolveFallbackWorkspacePath(to.path),
    },
  ],
})
