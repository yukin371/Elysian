import { describe, expect, test } from "bun:test"

import type { MenuRecord } from "./platform-api"

import {
  createDefaultMenuDraft,
  createMenuBlockedParentIds,
  createMenuParentLookup,
  createMenuParentOptions,
  createMenuTableItems,
  filterMenus,
  normalizeMenuBoolean,
  normalizeMenuSort,
  normalizeMenuStatus,
  normalizeMenuText,
  normalizeMenuType,
  normalizeOptionalMenuId,
  normalizeOptionalMenuText,
  resolveMenuSelection,
} from "./menu-workspace"

const createMenu = (
  overrides: Partial<MenuRecord> & Pick<MenuRecord, "id">,
): MenuRecord => ({
  id: overrides.id,
  parentId: overrides.parentId ?? null,
  type: overrides.type ?? "menu",
  code: overrides.code ?? overrides.id,
  name: overrides.name ?? `menu:${overrides.id}`,
  path: overrides.path ?? null,
  component: overrides.component ?? null,
  icon: overrides.icon ?? null,
  sort: overrides.sort ?? 10,
  isVisible: overrides.isVisible ?? true,
  status: overrides.status ?? "active",
  permissionCode: overrides.permissionCode ?? null,
  createdAt: overrides.createdAt ?? "2026-04-27T08:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-27T08:00:00.000Z",
})

describe("menu workspace helpers", () => {
  const menus = [
    createMenu({
      id: "menu_root_system",
      type: "directory",
      code: "system",
      name: "System",
      sort: 10,
      status: "active",
    }),
    createMenu({
      id: "menu_child_user",
      parentId: "menu_root_system",
      type: "menu",
      code: "system-user",
      name: "User Management",
      path: "/system/users",
      component: "system/users/index",
      icon: "user",
      sort: 20,
      isVisible: true,
      status: "disabled",
      permissionCode: "system:user:list",
    }),
    createMenu({
      id: "menu_button_export",
      parentId: "menu_child_user",
      type: "button",
      code: "system-user-export",
      name: "Export Users",
      sort: 30,
      isVisible: false,
      status: "active",
      permissionCode: "system:user:export",
    }),
  ]

  test("builds the default draft and normalizes form input", () => {
    expect(createDefaultMenuDraft()).toEqual({
      parentId: "",
      type: "menu",
      code: "",
      name: "",
      path: "",
      component: "",
      icon: "",
      sort: 10,
      isVisible: true,
      status: "active",
      permissionCode: "",
    })

    expect(normalizeMenuText("  system  ")).toBe("system")
    expect(normalizeOptionalMenuText("  /system/users  ")).toBe("/system/users")
    expect(normalizeOptionalMenuText("   ")).toBeUndefined()
    expect(normalizeOptionalMenuId("  menu_root_system  ")).toBe(
      "menu_root_system",
    )
    expect(normalizeMenuSort("25")).toBe(25)
    expect(normalizeMenuSort("bad")).toBe(10)
    expect(normalizeMenuStatus("disabled")).toBe("disabled")
    expect(normalizeMenuStatus("unknown")).toBe("active")
    expect(normalizeMenuBoolean(true)).toBe(true)
    expect(normalizeMenuBoolean("true")).toBe(false)
    expect(normalizeMenuType("directory")).toBe("directory")
    expect(normalizeMenuType("button")).toBe("button")
    expect(normalizeMenuType("anything")).toBe("menu")
  })

  test("filters menus across type, code, path, component, icon, permission, and status", () => {
    expect(
      filterMenus(menus, { type: "directory" }).map((menu) => menu.id),
    ).toEqual(["menu_root_system"])

    expect(filterMenus(menus, { code: "user" }).map((menu) => menu.id)).toEqual(
      ["menu_child_user", "menu_button_export"],
    )

    expect(
      filterMenus(menus, { path: "/system/users" }).map((menu) => menu.id),
    ).toEqual(["menu_child_user"])

    expect(
      filterMenus(menus, { permissionCode: "export" }).map((menu) => menu.id),
    ).toEqual(["menu_button_export"])

    expect(
      filterMenus(menus, { status: "active" }).map((menu) => menu.id),
    ).toEqual(["menu_root_system", "menu_button_export"])
  })

  test("keeps the current selection when the menu remains visible", () => {
    expect(resolveMenuSelection(menus, "menu_child_user")).toBe(
      "menu_child_user",
    )
  })

  test("falls back to the first visible menu when the previous selection disappears", () => {
    const activeMenus = menus.filter((menu) => menu.status === "active")

    expect(resolveMenuSelection(activeMenus, "menu_child_user")).toBe(
      "menu_root_system",
    )
  })

  test("blocks the current menu and descendants from parent options", () => {
    expect(
      Array.from(createMenuBlockedParentIds(menus, "menu_root_system")).sort(),
    ).toEqual(["menu_button_export", "menu_child_user", "menu_root_system"])

    expect(
      createMenuParentOptions(menus, "menu_root_system", "Root Menu"),
    ).toEqual([{ label: "Root Menu", value: "" }])
  })

  test("maps parent labels and localized fields for table display", () => {
    expect(
      createMenuTableItems(menus, {
        parentLookup: createMenuParentLookup(menus),
        rootLabel: "Root Menu",
        localizeType: (type) => `type:${type}`,
        localizeBoolean: (value) => `bool:${String(value)}`,
        localizeStatus: (status) => `status:${status}`,
        formatDateTime: (value) => `time:${value}`,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "menu_root_system",
        parentId: "Root Menu",
        type: "type:directory",
        isVisible: "bool:true",
        status: "status:active",
      }),
      expect.objectContaining({
        id: "menu_child_user",
        parentId: "System",
        type: "type:menu",
        isVisible: "bool:true",
        status: "status:disabled",
      }),
      expect.objectContaining({
        id: "menu_button_export",
        parentId: "User Management",
        type: "type:button",
        isVisible: "bool:false",
        status: "status:active",
      }),
    ])
  })
})
