import { describe, expect, it } from "bun:test"

import { parseTenantInitCliArgs } from "./tenant-init"

describe("parseTenantInitCliArgs", () => {
  it("parses the required tenant init arguments", () => {
    expect(
      parseTenantInitCliArgs([
        "--code",
        "tenant-alpha",
        "--name",
        "Tenant Alpha",
        "--admin-password",
        "secret-pass",
      ]),
    ).toEqual({
      tenantCode: "tenant-alpha",
      tenantName: "Tenant Alpha",
      adminPassword: "secret-pass",
    })
  })

  it("parses optional tenant status and admin fields", () => {
    expect(
      parseTenantInitCliArgs([
        "--code",
        "tenant-beta",
        "--name",
        "Tenant Beta",
        "--status",
        "suspended",
        "--admin-username",
        "tenant-admin",
        "--admin-password",
        "secret-pass",
        "--admin-display-name",
        "Tenant Beta Admin",
      ]),
    ).toEqual({
      tenantCode: "tenant-beta",
      tenantName: "Tenant Beta",
      tenantStatus: "suspended",
      adminUsername: "tenant-admin",
      adminPassword: "secret-pass",
      adminDisplayName: "Tenant Beta Admin",
    })
  })

  it("returns null when required arguments are missing or invalid", () => {
    expect(
      parseTenantInitCliArgs([
        "--code",
        "tenant-gamma",
        "--name",
        "Tenant Gamma",
      ]),
    ).toBeNull()
    expect(
      parseTenantInitCliArgs([
        "--code",
        "tenant-gamma",
        "--name",
        "Tenant Gamma",
        "--status",
        "disabled",
        "--admin-password",
        "secret-pass",
      ]),
    ).toBeNull()
    expect(
      parseTenantInitCliArgs([
        "--code",
        "tenant-gamma",
        "--name",
        "Tenant Gamma",
        "--admin-password",
        "secret-pass",
        "--unknown",
        "value",
      ]),
    ).toBeNull()
  })
})
