import { describe, expect, test } from "bun:test"

import type { TenantRecord } from "./platform-api"

import {
  createDefaultTenantDraft,
  createTenantTableItems,
  filterTenants,
  resolveTenantSelection,
} from "./tenant-workspace"

const createTenant = (
  overrides: Partial<TenantRecord> & Pick<TenantRecord, "id">,
): TenantRecord => ({
  id: overrides.id,
  code: overrides.code ?? overrides.id,
  name: overrides.name ?? overrides.id,
  status: overrides.status ?? "active",
  createdAt: overrides.createdAt ?? "2026-04-27T08:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-27T08:00:00.000Z",
})

describe("tenant workspace helpers", () => {
  const tenants = [
    createTenant({
      id: "tenant_northwind",
      code: "northwind",
      name: "Northwind Supply",
      status: "active",
    }),
    createTenant({
      id: "tenant_blueocean",
      code: "blue-ocean",
      name: "Blue Ocean Retail",
      status: "suspended",
    }),
    createTenant({
      id: "tenant_finops",
      code: "finops",
      name: "FinOps Lab",
      status: "active",
    }),
  ]

  test("creates the default tenant draft in active status", () => {
    expect(createDefaultTenantDraft()).toEqual({
      code: "",
      name: "",
      status: "active",
    })
  })

  test("filters tenants across code, name, and status", () => {
    expect(
      filterTenants(tenants, { code: "blue" }).map((tenant) => tenant.id),
    ).toEqual(["tenant_blueocean"])

    expect(
      filterTenants(tenants, { name: "lab" }).map((tenant) => tenant.id),
    ).toEqual(["tenant_finops"])

    expect(
      filterTenants(tenants, {
        status: "active",
      }).map((tenant) => tenant.id),
    ).toEqual(["tenant_northwind", "tenant_finops"])
  })

  test("keeps the current selection when the tenant remains visible", () => {
    expect(resolveTenantSelection(tenants, "tenant_blueocean")).toBe(
      "tenant_blueocean",
    )
  })

  test("falls back to the first visible tenant when the previous selection disappears", () => {
    const activeTenants = tenants.filter((tenant) => tenant.status === "active")

    expect(resolveTenantSelection(activeTenants, "tenant_blueocean")).toBe(
      "tenant_northwind",
    )
  })

  test("returns null when there are no visible tenants", () => {
    expect(resolveTenantSelection([], null)).toBeNull()
  })

  test("maps tenant status and timestamps for table display", () => {
    expect(
      createTenantTableItems(tenants, {
        localizeStatus: (status) => `status:${status}`,
        formatDateTime: (value) => `time:${value}`,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "tenant_northwind",
        status: "status:active",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "tenant_blueocean",
        status: "status:suspended",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "tenant_finops",
        status: "status:active",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
    ])
  })
})
