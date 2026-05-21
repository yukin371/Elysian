import { readFile } from "node:fs/promises"

import { describe, expect, test } from "bun:test"

describe("workspace detail panels", () => {
  test("keep customer technical ids out of the identity header", async () => {
    const source = await readFile(
      new URL("./customer/CustomerWorkspacePanel.vue", import.meta.url),
      "utf8",
    )

    expect(source).toContain("resolvedSelectedCustomer.name")
    expect(source).not.toContain("resolvedSelectedCustomer.id")
  })

  test("keep customer panel copy user-facing", async () => {
    const zhSource = await readFile(
      new URL("../../i18n/zh-CN.core.ts", import.meta.url),
      "utf8",
    )
    const enSource = await readFile(
      new URL("../../i18n/en-US.core.ts", import.meta.url),
      "utf8",
    )

    expect(zhSource).toContain('"app.panelDesc.detail": "查看当前客户')
    expect(enSource).toContain('"app.panelDesc.detail":')
    expect(`${zhSource}\n${enSource}`).not.toContain("第二个 owner")
    expect(`${zhSource}\n${enSource}`).not.toContain(
      "standard detail-page template",
    )
    expect(`${zhSource}\n${enSource}`).not.toContain("schema-derived")
    expect(`${zhSource}\n${enSource}`).not.toContain("canonical customer API")
  })

  test("keep menu detail focused on parent label and relation count", async () => {
    const source = await readFile(
      new URL("./menu/MenuWorkspacePanel.vue", import.meta.url),
      "utf8",
    )

    expect(source).toContain("app.menu.parentUnknown")
    expect(source).toContain("resolvedSelectedMenuDetail.roleIds.length")
    expect(source).not.toContain(
      "??\n                resolvedSelectedMenu.parentId",
    )
    expect(source).not.toContain("roleIds.join")
  })

  test("keep role detail from exposing raw relationship ids", async () => {
    const source = await readFile(
      new URL("./role/RoleWorkspacePanel.vue", import.meta.url),
      "utf8",
    )

    expect(source).toContain(
      "resolvedSelectedRoleDetail.permissionCodes.length",
    )
    expect(source).toContain("resolvedSelectedRoleDetail.userIds.length")
    expect(source).toContain("resolvedSelectedRoleDetail.deptIds.length")
    expect(source).not.toContain("permissionCodes.join")
    expect(source).not.toContain("userIds.join")
    expect(source).not.toContain("deptIds.join")
  })

  test("keep edit form placeholders action-oriented instead of search-oriented", async () => {
    const workspaceFiles = [
      "../../workspaces/use-customer-workspace.ts",
      "../../workspaces/use-department-workspace.ts",
      "../../workspaces/use-dictionary-workspace.ts",
      "../../workspaces/use-menu-workspace.ts",
      "../../workspaces/use-notification-workspace.ts",
      "../../workspaces/use-post-workspace.ts",
      "../../workspaces/use-role-workspace.ts",
      "../../workspaces/use-setting-workspace.ts",
      "../../workspaces/use-tenant-workspace.ts",
      "../../workspaces/use-user-workspace.ts",
    ]

    for (const workspaceFile of workspaceFiles) {
      const source = await readFile(
        new URL(workspaceFile, import.meta.url),
        "utf8",
      )
      const formFieldsBlock = source.match(
        /const formFields = computed[\s\S]*?const formValues = computed/,
      )?.[0]

      expect(formFieldsBlock, workspaceFile).toBeDefined()
      expect(formFieldsBlock, workspaceFile).not.toMatch(
        /app\.[A-Za-z]+\.query\./,
      )
    }
  })
})
