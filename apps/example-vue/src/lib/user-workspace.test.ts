import { describe, expect, test } from "bun:test"

import type { UserRecord } from "./platform-api"

import {
  createDefaultUserDraft,
  createUserTableItems,
  filterUsers,
  normalizeOptionalUserText,
  normalizeUserBoolean,
  normalizeUserStatus,
  normalizeUserText,
  resolveUserSelection,
} from "./user-workspace"

const createUser = (
  overrides: Partial<UserRecord> & Pick<UserRecord, "id">,
): UserRecord => ({
  id: overrides.id,
  username: overrides.username ?? overrides.id,
  displayName: overrides.displayName ?? `user:${overrides.id}`,
  email: overrides.email,
  phone: overrides.phone,
  status: overrides.status ?? "active",
  isSuperAdmin: overrides.isSuperAdmin ?? false,
  lastLoginAt: overrides.lastLoginAt ?? null,
  createdAt: overrides.createdAt ?? "2026-04-27T08:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-27T08:00:00.000Z",
})

describe("user workspace helpers", () => {
  const users = [
    createUser({
      id: "user_admin",
      username: "admin",
      displayName: "Platform Admin",
      email: "admin@example.com",
      phone: "13800138000",
      status: "active",
      isSuperAdmin: true,
      lastLoginAt: "2026-04-27T09:30:00.000Z",
    }),
    createUser({
      id: "user_analyst",
      username: "analyst",
      displayName: "Security Analyst",
      email: "analyst@example.com",
      phone: "13900139000",
      status: "disabled",
      isSuperAdmin: false,
      lastLoginAt: null,
    }),
    createUser({
      id: "user_ops",
      username: "ops",
      displayName: "Operations Lead",
      email: "ops@example.com",
      phone: "13700137000",
      status: "active",
      isSuperAdmin: false,
      lastLoginAt: "2026-04-26T07:45:00.000Z",
    }),
  ]

  test("builds the default draft and normalizes form input", () => {
    expect(createDefaultUserDraft()).toEqual({
      username: "",
      displayName: "",
      email: "",
      phone: "",
      status: "active",
      isSuperAdmin: false,
    })

    expect(normalizeUserText("  admin  ")).toBe("admin")
    expect(normalizeOptionalUserText("  ops@example.com  ")).toBe(
      "ops@example.com",
    )
    expect(normalizeOptionalUserText("   ")).toBeUndefined()
    expect(normalizeUserStatus("disabled")).toBe("disabled")
    expect(normalizeUserStatus("unknown")).toBe("active")
    expect(normalizeUserBoolean(true)).toBe(true)
    expect(normalizeUserBoolean("true")).toBe(false)
  })

  test("filters users across username, display name, email, phone, and status", () => {
    expect(
      filterUsers(users, { username: "analyst" }).map((user) => user.id),
    ).toEqual(["user_analyst"])

    expect(
      filterUsers(users, { displayName: "operations" }).map((user) => user.id),
    ).toEqual(["user_ops"])

    expect(
      filterUsers(users, { email: "admin@" }).map((user) => user.id),
    ).toEqual(["user_admin"])

    expect(
      filterUsers(users, { phone: "1390" }).map((user) => user.id),
    ).toEqual(["user_analyst"])

    expect(
      filterUsers(users, { status: "active" }).map((user) => user.id),
    ).toEqual(["user_admin", "user_ops"])
  })

  test("keeps the current selection when the user remains visible", () => {
    expect(resolveUserSelection(users, "user_analyst")).toBe("user_analyst")
  })

  test("falls back to the first visible user when the previous selection disappears", () => {
    const activeUsers = users.filter((user) => user.status === "active")

    expect(resolveUserSelection(activeUsers, "user_analyst")).toBe("user_admin")
  })

  test("returns null when there are no visible users", () => {
    expect(resolveUserSelection([], null)).toBeNull()
  })

  test("maps user fields for table display", () => {
    expect(
      createUserTableItems(users, {
        localizeStatus: (status) => `status:${status}`,
        localizeBoolean: (value) => `bool:${String(value)}`,
        lastLoginEmptyLabel: "Never signed in",
        formatDateTime: (value) => `time:${value}`,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "user_admin",
        status: "status:active",
        isSuperAdmin: "bool:true",
        lastLoginAt: "time:2026-04-27T09:30:00.000Z",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "user_analyst",
        status: "status:disabled",
        isSuperAdmin: "bool:false",
        lastLoginAt: "Never signed in",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "user_ops",
        status: "status:active",
        isSuperAdmin: "bool:false",
        lastLoginAt: "time:2026-04-26T07:45:00.000Z",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
    ])
  })
})
