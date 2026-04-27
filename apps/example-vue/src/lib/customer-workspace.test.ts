import { describe, expect, test } from "bun:test"

import type { CustomerRecord } from "./platform-api"

import {
  buildCustomerListQuery,
  createCustomerTableItems,
  createDefaultCustomerDraft,
  isCustomerListSortValue,
  normalizeCustomerName,
  normalizeCustomerStatus,
  resolveCustomerSelection,
} from "./customer-workspace"

const createCustomer = (
  overrides: Partial<CustomerRecord> & Pick<CustomerRecord, "id">,
): CustomerRecord => ({
  id: overrides.id,
  name: overrides.name ?? `Customer ${overrides.id}`,
  status: overrides.status ?? "active",
  createdAt: overrides.createdAt ?? "2026-04-27T08:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-27T09:00:00.000Z",
})

describe("customer workspace helpers", () => {
  const customers = [
    createCustomer({
      id: "cust_alpha",
      name: "Alpha Retail",
      status: "active",
    }),
    createCustomer({
      id: "cust_beta",
      name: "Beta Logistics",
      status: "inactive",
    }),
  ]

  test("builds the default draft and normalizes form input", () => {
    expect(createDefaultCustomerDraft()).toEqual({
      name: "",
      status: "active",
    })

    expect(normalizeCustomerName("  Alpha Retail  ")).toBe("Alpha Retail")
    expect(normalizeCustomerStatus("inactive")).toBe("inactive")
    expect(normalizeCustomerStatus("unexpected")).toBe("active")
  })

  test("builds the list query with server-side pagination and sorting", () => {
    expect(
      buildCustomerListQuery(
        {
          name: "  Alpha ",
          status: "inactive",
        },
        {
          page: 3,
          pageSize: 20,
          sortValue: "name:asc",
        },
      ),
    ).toEqual({
      q: "Alpha",
      status: "inactive",
      page: 3,
      pageSize: 20,
      sortBy: "name",
      sortOrder: "asc",
    })
  })

  test("guards the supported customer sort values", () => {
    expect(isCustomerListSortValue("createdAt:desc")).toBeTrue()
    expect(isCustomerListSortValue("createdAt:asc")).toBeTrue()
    expect(isCustomerListSortValue("name:asc")).toBeTrue()
    expect(isCustomerListSortValue("name:desc")).toBeTrue()
    expect(isCustomerListSortValue("status:asc")).toBeFalse()
  })

  test("keeps the current selection when it is still visible", () => {
    expect(resolveCustomerSelection(customers, "cust_beta")).toBe("cust_beta")
  })

  test("falls back to the first visible customer when the selection disappears", () => {
    expect(resolveCustomerSelection(customers, "cust_missing")).toBe(
      "cust_alpha",
    )
  })

  test("returns null when the list is empty", () => {
    expect(resolveCustomerSelection([], null)).toBeNull()
  })

  test("maps customer fields for table display", () => {
    expect(
      createCustomerTableItems(customers, {
        localizeStatus: (status) => `status:${status}`,
        formatDateTime: (value) => `time:${value}`,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "cust_alpha",
        status: "status:active",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T09:00:00.000Z",
      }),
      expect.objectContaining({
        id: "cust_beta",
        status: "status:inactive",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T09:00:00.000Z",
      }),
    ])
  })
})
