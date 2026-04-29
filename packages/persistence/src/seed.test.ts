import { describe, expect, it } from "bun:test"

import {
  createDefaultAuthSeedConfig,
  createDefaultAuthSeedSpec,
  createDefaultWorkflowDefinitionSeedSpec,
  createTenantBootstrapSeedSpec,
  normalizeTenantInitOptions,
  parseDefaultSeedCliArgs,
} from "./seed"

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
      "system:post:list",
      "system:post:create",
      "system:post:update",
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
      "workflow:definition:list",
      "workflow:definition:create",
      "workflow:definition:update",
      "workflow:instance:list",
      "workflow:instance:start",
      "workflow:instance:cancel",
      "workflow:task:list",
      "workflow:task:claim",
      "workflow:task:complete",
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
      "system-posts",
      "system-dictionaries",
      "system-settings",
      "system-operation-logs",
      "system-files",
      "system-notifications",
      "system-tenants",
      "workflow-root",
      "workflow-definitions",
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

describe("createDefaultWorkflowDefinitionSeedSpec", () => {
  it("includes default workflow samples for version history and condition branching", () => {
    const spec = createDefaultWorkflowDefinitionSeedSpec()

    expect(
      spec.map((definition) => ({
        key: definition.key,
        version: definition.version,
      })),
    ).toEqual([
      { key: "expense-approval", version: 1 },
      { key: "expense-approval", version: 2 },
      { key: "expense-approval-condition", version: 1 },
    ])
    expect(
      spec.find((definition) => definition.key === "expense-approval")
        ?.definition,
    ).toMatchObject({
      nodes: [
        { id: "start", type: "start" },
        { id: "manager-review", type: "approval" },
        { id: "approved", type: "end" },
      ],
    })
    expect(
      spec.find((definition) => definition.version === 2)?.definition,
    ).toMatchObject({
      nodes: [
        { id: "start", type: "start" },
        { id: "manager-review", type: "approval" },
        { id: "finance-review", type: "approval" },
        { id: "approved", type: "end" },
      ],
      edges: [
        { from: "start", to: "manager-review" },
        { from: "manager-review", to: "finance-review" },
        { from: "finance-review", to: "approved" },
      ],
    })
    expect(
      spec.find((definition) => definition.key === "expense-approval-condition")
        ?.definition,
    ).toEqual(
      expect.objectContaining({
        nodes: expect.arrayContaining([
          expect.objectContaining({ id: "amount-check", type: "condition" }),
          expect.objectContaining({
            id: "finance-review",
            type: "approval",
          }),
        ]),
        edges: expect.arrayContaining([
          expect.objectContaining({
            from: "amount-check",
            to: "finance-review",
          }),
        ]),
      }),
    )
  })
})

describe("createTenantBootstrapSeedSpec", () => {
  it("drops tenant-management permission and menu exposure for tenant admins", () => {
    const spec = createTenantBootstrapSeedSpec()

    expect(spec.permissions.map((permission) => permission.code)).not.toContain(
      "system:tenant:list",
    )
    expect(spec.permissions.map((permission) => permission.code)).not.toContain(
      "system:tenant:create",
    )
    expect(spec.permissions.map((permission) => permission.code)).not.toContain(
      "system:tenant:update",
    )
    expect(spec.menus.map((menu) => menu.code)).not.toContain("system-tenants")
    expect(spec.adminUser.isSuperAdmin).toBe(false)
    expect(spec.menus.find((menu) => menu.code === "system-users")).toEqual(
      expect.objectContaining({
        parentCode: "system-root",
        permissionCode: "system:user:list",
      }),
    )
    expect(spec.userRoles).toEqual([
      {
        username: "admin",
        roleCode: "admin",
      },
    ])
    expect(
      spec.roleMenus.some(
        (assignment) => assignment.menuCode === "system-tenants",
      ),
    ).toBe(false)
  })
})

describe("normalizeTenantInitOptions", () => {
  it("trims values and applies tenant admin defaults", () => {
    expect(
      normalizeTenantInitOptions({
        tenantCode: " tenant-alpha ",
        tenantName: " Tenant Alpha ",
        adminPassword: " secret-pass ",
      }),
    ).toEqual({
      tenantCode: "tenant-alpha",
      tenantName: "Tenant Alpha",
      tenantStatus: "active",
      adminUsername: "admin",
      adminPassword: "secret-pass",
      adminDisplayName: "Tenant Administrator",
    })
  })

  it("rejects missing required fields", () => {
    expect(() =>
      normalizeTenantInitOptions({
        tenantCode: " ",
        tenantName: "Tenant Alpha",
        adminPassword: "secret-pass",
      }),
    ).toThrow("tenantCode is required")
    expect(() =>
      normalizeTenantInitOptions({
        tenantCode: "tenant-alpha",
        tenantName: " ",
        adminPassword: "secret-pass",
      }),
    ).toThrow("tenantName is required")
    expect(() =>
      normalizeTenantInitOptions({
        tenantCode: "tenant-alpha",
        tenantName: "Tenant Alpha",
        adminPassword: " ",
      }),
    ).toThrow("adminPassword is required")
  })
})

describe("parseDefaultSeedCliArgs", () => {
  it("defaults to conservative seed behavior", () => {
    expect(parseDefaultSeedCliArgs([])).toEqual({
      reconcileAdminPassword: false,
    })
  })

  it("enables admin password reconciliation when explicitly requested", () => {
    expect(parseDefaultSeedCliArgs(["--reconcile-admin-password"])).toEqual({
      reconcileAdminPassword: true,
    })
  })
})
