import type { UiNavigationNode } from "@elysian/ui-core"

export const buildStudioNavigation = (
  t: (key: string, params?: Record<string, unknown>) => string,
): UiNavigationNode[] => [
  {
    id: "enterprise-studio",
    parentId: null,
    type: "directory",
    code: "studio-root",
    name: t("app.fallback.studio"),
    path: null,
    component: null,
    icon: "code",
    sort: 200,
    isVisible: true,
    status: "active",
    permissionCode: null,
    depth: 0,
    children: [
      {
        id: "enterprise-studio-generator-preview",
        parentId: "enterprise-studio",
        type: "menu",
        code: "studio-generator-preview",
        name: t("app.fallback.generatorPreview"),
        path: "/studio/generator-preview",
        component: "studio/generator-preview/index",
        icon: "terminal",
        sort: 10,
        isVisible: true,
        status: "active",
        permissionCode: null,
        depth: 1,
        children: [],
      },
    ],
  },
]

export const appendStudioNavigation = (
  baseItems: UiNavigationNode[],
  studioItems: UiNavigationNode[],
) => [...baseItems, ...studioItems]
