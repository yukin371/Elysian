import { describe, expect, it } from "bun:test"

import {
  type UiMenuItem,
  buildNavigationTree,
  filterAccessibleMenus,
  hasPermission,
} from "./index"

const menus: UiMenuItem[] = [
  {
    id: "directory-system",
    parentId: null,
    type: "directory",
    code: "system-root",
    name: "System",
    path: null,
    component: null,
    icon: "settings",
    sort: 20,
    isVisible: true,
    status: "active",
    permissionCode: null,
  },
  {
    id: "menu-users",
    parentId: "directory-system",
    type: "menu",
    code: "system-users",
    name: "Users",
    path: "/system/users",
    component: "system/users/index",
    icon: "users",
    sort: 10,
    isVisible: true,
    status: "active",
    permissionCode: "system:user:list",
  },
  {
    id: "menu-customer",
    parentId: null,
    type: "menu",
    code: "customer-list",
    name: "Customers",
    path: "/customers",
    component: "customer/index",
    icon: "briefcase",
    sort: 10,
    isVisible: true,
    status: "active",
    permissionCode: "customer:customer:list",
  },
  {
    id: "hidden-menu",
    parentId: null,
    type: "menu",
    code: "hidden",
    name: "Hidden",
    path: "/hidden",
    component: "hidden/index",
    icon: null,
    sort: 5,
    isVisible: false,
    status: "active",
    permissionCode: null,
  },
]

describe("ui-core navigation helpers", () => {
  it("builds a sorted navigation tree", () => {
    const tree = buildNavigationTree(menus)

    expect(tree).toHaveLength(2)
    expect(tree[0]?.code).toBe("customer-list")
    expect(tree[1]?.code).toBe("system-root")
    expect(tree[1]?.children.map((item) => item.code)).toEqual(["system-users"])
    expect(tree[1]?.children[0]?.depth).toBe(1)
  })

  it("checks permission membership", () => {
    expect(hasPermission(["customer:customer:list"], null)).toBe(true)
    expect(
      hasPermission(["customer:customer:list"], "customer:customer:list"),
    ).toBe(true)
    expect(
      hasPermission(["customer:customer:list"], "customer:customer:create"),
    ).toBe(false)
  })

  it("filters menus by permission codes", () => {
    const items = filterAccessibleMenus(menus, ["customer:customer:list"])

    expect(items.map((item) => item.code)).toEqual([
      "system-root",
      "customer-list",
      "hidden",
    ])
  })
})
