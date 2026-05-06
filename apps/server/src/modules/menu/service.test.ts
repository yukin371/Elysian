import { describe, expect, test } from "bun:test"

import type { MenuRecord } from "@elysian/schema"

import type { MenuRepository } from "./repository"
import { createMenuService } from "./service"

const createMenuRecord = (overrides: Partial<MenuRecord>): MenuRecord => ({
  code: "system-root",
  component: null,
  createdAt: "2026-05-01T00:00:00.000Z",
  icon: null,
  id: "menu-1",
  isVisible: true,
  name: "System",
  parentId: null,
  path: "/system",
  permissionCode: null,
  sort: 10,
  status: "active",
  type: "directory",
  updatedAt: "2026-05-01T00:00:00.000Z",
  ...overrides,
})

const createRepository = (items: MenuRecord[]): MenuRepository => ({
  list: async () => items,
  getById: async () => null,
  getByCode: async () => null,
  create: async () => {
    throw new Error("not implemented")
  },
  update: async () => null,
  listExistingPermissionCodes: async () => [],
  listExistingRoleIds: async () => [],
})

describe("createMenuService", () => {
  test("deduplicates menu list and export rows by menu code", async () => {
    const service = createMenuService(
      createRepository([
        createMenuRecord({ id: "menu-1" }),
        createMenuRecord({ id: "menu-2" }),
        createMenuRecord({
          code: "system-users",
          id: "menu-3",
          name: "Users",
          path: "/system/users",
          type: "menu",
        }),
      ]),
    )

    await expect(service.list()).resolves.toEqual([
      createMenuRecord({ id: "menu-1" }),
      createMenuRecord({
        code: "system-users",
        id: "menu-3",
        name: "Users",
        path: "/system/users",
        type: "menu",
      }),
    ])

    const csv = await service.exportCsv()
    expect(csv.match(/system-root/g)?.length).toBe(1)
    expect(csv.match(/system-users/g)?.length).toBe(1)
  })
})
