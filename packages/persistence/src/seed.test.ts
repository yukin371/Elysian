import { describe, expect, it } from "bun:test"

import { createDefaultAuthSeedConfig, createDefaultAuthSeedSpec } from "./seed"

const defaultAdminPassword = ["admin", "123"].join("")

describe("createDefaultAuthSeedConfig", () => {
  it("uses defaults when env overrides are absent", () => {
    expect(createDefaultAuthSeedConfig({})).toEqual({
      adminUsername: "admin",
      adminPassword: defaultAdminPassword,
      adminDisplayName: "Administrator",
    })
  })

  it("reads admin overrides from environment variables", () => {
    expect(
      createDefaultAuthSeedConfig({
        ELYSIAN_ADMIN_USERNAME: "root",
        ELYSIAN_ADMIN_PASSWORD: "root-pass",
        ELYSIAN_ADMIN_DISPLAY_NAME: "Root User",
      }),
    ).toEqual({
      adminUsername: "root",
      adminPassword: ["root", "pass"].join("-"),
      adminDisplayName: "Root User",
    })
  })

  it("rejects the default admin password in production", () => {
    expect(() =>
      createDefaultAuthSeedConfig({
        APP_ENV: "production",
      }),
    ).toThrow(
      "ELYSIAN_ADMIN_PASSWORD must be explicitly set in production before running the default auth seed",
    )
  })
})

describe("createDefaultAuthSeedSpec", () => {
  it("includes baseline admin role, customer permissions, and menus", () => {
    const spec = createDefaultAuthSeedSpec()

    expect(spec.roles.map((role) => role.code)).toEqual(["admin", "operator"])
    expect(spec.permissions.map((permission) => permission.code)).toEqual([
      "system:user:list",
      "system:user:create",
      "system:user:update",
      "system:user:reset-password",
      "system:role:list",
      "system:role:create",
      "system:role:update",
      "system:menu:list",
      "system:menu:update",
      "system:department:list",
      "system:department:create",
      "system:department:update",
      "system:dictionary:list",
      "system:dictionary:create",
      "system:dictionary:update",
      "system:setting:list",
      "system:setting:create",
      "system:setting:update",
      "system:operation-log:list",
      "system:operation-log:export",
      "system:file:list",
      "system:file:upload",
      "system:file:download",
      "system:file:delete",
      "system:notification:list",
      "system:notification:create",
      "system:notification:update",
      "system:tenant:list",
      "system:tenant:create",
      "system:tenant:update",
      "customer:customer:list",
      "customer:customer:create",
      "customer:customer:update",
      "customer:customer:delete",
    ])
    expect(spec.menus.map((menu) => menu.code)).toEqual([
      "system-root",
      "system-users",
      "system-roles",
      "system-menus",
      "system-departments",
      "system-dictionaries",
      "system-settings",
      "system-operation-logs",
      "system-files",
      "system-notifications",
      "system-tenants",
      "customer-root",
      "customer-list",
    ])
    expect(spec.dictionaryTypes).toEqual([
      {
        id: "00000000-0000-0000-0000-000000000501",
        code: "customer_status",
        name: "Customer Status",
        description: "Status options for customer records",
        status: "active",
      },
    ])
    expect(spec.dictionaryItems).toEqual([
      {
        id: "00000000-0000-0000-0000-000000000601",
        typeId: "00000000-0000-0000-0000-000000000501",
        value: "active",
        label: "active",
        sort: 10,
        isDefault: true,
        status: "active",
      },
      {
        id: "00000000-0000-0000-0000-000000000602",
        typeId: "00000000-0000-0000-0000-000000000501",
        value: "inactive",
        label: "inactive",
        sort: 20,
        isDefault: false,
        status: "active",
      },
    ])
    expect(spec.adminUser).toEqual({
      id: "00000000-0000-0000-0000-000000000401",
      username: "admin",
      displayName: "Administrator",
      password: defaultAdminPassword,
      status: "active",
      isSuperAdmin: true,
    })
  })

  it("allows overriding the default admin credentials", () => {
    const spec = createDefaultAuthSeedSpec({
      adminUsername: "ops-admin",
      adminPassword: ["ops", "secret"].join("-"),
      adminDisplayName: "Ops Admin",
    })

    expect(spec.adminUser.username).toBe("ops-admin")
    expect(spec.adminUser.password).toBe(["ops", "secret"].join("-"))
    expect(spec.adminUser.displayName).toBe("Ops Admin")
  })
})
