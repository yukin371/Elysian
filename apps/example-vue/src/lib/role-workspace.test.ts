import { describe, expect, test } from "bun:test"

import type { RoleRecord } from "./platform-api"

import {
  createDefaultRoleDraft,
  createRoleTableItems,
  filterRoles,
  normalizeOptionalRoleText,
  normalizeRoleBoolean,
  normalizeRoleDataScope,
  normalizeRoleStatus,
  normalizeRoleText,
  resolveRoleSelection,
} from "./role-workspace"

const createRole = (
  overrides: Partial<RoleRecord> & Pick<RoleRecord, "id">,
): RoleRecord => ({
  id: overrides.id,
  code: overrides.code ?? overrides.id,
  name: overrides.name ?? `role:${overrides.id}`,
  description: overrides.description,
  status: overrides.status ?? "active",
  isSystem: overrides.isSystem ?? false,
  dataScope: overrides.dataScope ?? 1,
  createdAt: overrides.createdAt ?? "2026-04-27T08:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-27T08:00:00.000Z",
})

describe("role workspace helpers", () => {
  const roles = [
    createRole({
      id: "role_admin",
      code: "admin",
      name: "Platform Admin",
      description: "Owns global governance",
      status: "active",
      isSystem: true,
      dataScope: 1,
    }),
    createRole({
      id: "role_ops",
      code: "ops",
      name: "Operations",
      description: "Handles on-call rotation",
      status: "disabled",
      isSystem: false,
      dataScope: 3,
    }),
    createRole({
      id: "role_audit",
      code: "audit",
      name: "Audit Viewer",
      description: "Reads compliance evidence",
      status: "active",
      isSystem: false,
      dataScope: 2,
    }),
  ]

  test("builds the default draft and normalizes form input", () => {
    expect(createDefaultRoleDraft()).toEqual({
      code: "",
      name: "",
      description: "",
      status: "active",
      isSystem: false,
      dataScope: 1,
    })

    expect(normalizeRoleText("  admin  ")).toBe("admin")
    expect(normalizeOptionalRoleText("  keep me  ")).toBe("keep me")
    expect(normalizeOptionalRoleText("   ")).toBeUndefined()
    expect(normalizeRoleStatus("disabled")).toBe("disabled")
    expect(normalizeRoleStatus("unknown")).toBe("active")
    expect(normalizeRoleBoolean(true)).toBe(true)
    expect(normalizeRoleBoolean("true")).toBe(false)
    expect(normalizeRoleDataScope("5")).toBe(5)
    expect(normalizeRoleDataScope("invalid")).toBe(1)
  })

  test("filters roles across code, name, description, and status", () => {
    expect(filterRoles(roles, { code: "ops" }).map((role) => role.id)).toEqual([
      "role_ops",
    ])

    expect(
      filterRoles(roles, { name: "audit" }).map((role) => role.id),
    ).toEqual(["role_audit"])

    expect(
      filterRoles(roles, {
        description: "global governance",
      }).map((role) => role.id),
    ).toEqual(["role_admin"])

    expect(
      filterRoles(roles, {
        status: "active",
      }).map((role) => role.id),
    ).toEqual(["role_admin", "role_audit"])
  })

  test("keeps the current selection when the role remains visible", () => {
    expect(resolveRoleSelection(roles, "role_ops")).toBe("role_ops")
  })

  test("falls back to the first visible role when the previous selection disappears", () => {
    const activeRoles = roles.filter((role) => role.status === "active")

    expect(resolveRoleSelection(activeRoles, "role_ops")).toBe("role_admin")
  })

  test("returns null when there are no visible roles", () => {
    expect(resolveRoleSelection([], null)).toBeNull()
  })

  test("maps role fields for table display", () => {
    expect(
      createRoleTableItems(roles, {
        localizeStatus: (status) => `status:${status}`,
        localizeBoolean: (value) => `bool:${String(value)}`,
        localizeDataScope: (value) => `scope:${value}`,
        formatDateTime: (value) => `time:${value}`,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "role_admin",
        status: "status:active",
        isSystem: "bool:true",
        dataScope: "scope:1",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "role_ops",
        status: "status:disabled",
        isSystem: "bool:false",
        dataScope: "scope:3",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "role_audit",
        status: "status:active",
        isSystem: "bool:false",
        dataScope: "scope:2",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
    ])
  })
})
