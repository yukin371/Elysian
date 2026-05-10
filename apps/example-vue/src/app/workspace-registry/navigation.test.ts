import { describe, expect, test } from "bun:test"
import type { UiNavigationNode } from "@elysian/ui-core"

import { appendWorkspaceRegistryNavigation } from "./navigation"

const t = (key: string) => key

const systemRoot = (): UiNavigationNode => ({
  id: "enterprise-system",
  parentId: null,
  type: "directory",
  code: "system-root",
  name: "system",
  path: null,
  component: null,
  icon: "settings",
  sort: 10,
  isVisible: true,
  status: "active",
  permissionCode: null,
  depth: 0,
  children: [],
})

describe("workspace registry navigation", () => {
  test("appends local workspace entries from the registry", () => {
    const navigation = appendWorkspaceRegistryNavigation([systemRoot()], t)
    const system = navigation.find((item) => item.code === "system-root")
    const studio = navigation.find((item) => item.code === "studio-root")

    expect(system?.children.map((item) => item.path)).toContain(
      "/system/sessions",
    )
    expect(studio?.children.map((item) => item.path)).toEqual([
      "/studio/demo-hub",
      "/studio/generator-preview",
    ])
  })

  test("does not duplicate entries already provided by backend menus", () => {
    const navigation = appendWorkspaceRegistryNavigation(
      [
        {
          ...systemRoot(),
          children: [
            {
              id: "backend-sessions",
              parentId: "enterprise-system",
              type: "menu",
              code: "system-sessions",
              name: "sessions",
              path: "/system/sessions",
              component: "system/sessions/index",
              icon: "time",
              sort: 47,
              isVisible: true,
              status: "active",
              permissionCode: null,
              depth: 1,
              children: [],
            },
          ],
        },
      ],
      t,
    )

    const sessionEntries =
      navigation
        .find((item) => item.code === "system-root")
        ?.children.filter((item) => item.path === "/system/sessions") ?? []

    expect(sessionEntries).toHaveLength(1)
  })
})
