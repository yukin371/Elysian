import { describe, expect, test } from "bun:test"

import type { SettingRecord } from "./platform-api"

import {
  createDefaultSettingDraft,
  createSettingTableItems,
  filterSettings,
  normalizeOptionalSettingText,
  normalizeSettingStatus,
  normalizeSettingText,
  resolveSettingSelection,
} from "./setting-workspace"

const createSetting = (
  overrides: Partial<SettingRecord> & Pick<SettingRecord, "id">,
): SettingRecord => ({
  id: overrides.id,
  key: overrides.key ?? overrides.id,
  value: overrides.value ?? `value:${overrides.id}`,
  description: overrides.description,
  status: overrides.status ?? "active",
  createdAt: overrides.createdAt ?? "2026-04-27T08:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-27T08:00:00.000Z",
})

describe("setting workspace helpers", () => {
  const settings = [
    createSetting({
      id: "setting_api_base",
      key: "api.base-url",
      value: "https://api.example.com",
      description: "Primary platform API endpoint",
      status: "active",
    }),
    createSetting({
      id: "setting_notice_banner",
      key: "notice.banner",
      value: "nightly-maintenance",
      description: "Visible maintenance banner",
      status: "disabled",
    }),
    createSetting({
      id: "setting_support_mailbox",
      key: "support.mailbox",
      value: "ops@example.com",
      description: "Support contact mailbox",
      status: "active",
    }),
  ]

  test("builds the default draft and normalizes form input", () => {
    expect(createDefaultSettingDraft()).toEqual({
      key: "",
      value: "",
      description: "",
      status: "active",
    })

    expect(normalizeSettingText("  portal.title  ")).toBe("portal.title")
    expect(normalizeOptionalSettingText("  keep me  ")).toBe("keep me")
    expect(normalizeOptionalSettingText("   ")).toBeUndefined()
    expect(normalizeSettingStatus("disabled")).toBe("disabled")
    expect(normalizeSettingStatus("unknown")).toBe("active")
  })

  test("filters settings across key, value, description, and status", () => {
    expect(
      filterSettings(settings, { key: "notice" }).map((setting) => setting.id),
    ).toEqual(["setting_notice_banner"])

    expect(
      filterSettings(settings, {
        value: "ops@example.com",
      }).map((setting) => setting.id),
    ).toEqual(["setting_support_mailbox"])

    expect(
      filterSettings(settings, {
        description: "platform api",
      }).map((setting) => setting.id),
    ).toEqual(["setting_api_base"])

    expect(
      filterSettings(settings, {
        status: "active",
      }).map((setting) => setting.id),
    ).toEqual(["setting_api_base", "setting_support_mailbox"])
  })

  test("keeps the current selection when the setting remains visible", () => {
    expect(resolveSettingSelection(settings, "setting_notice_banner")).toBe(
      "setting_notice_banner",
    )
  })

  test("falls back to the first visible setting when the previous selection disappears", () => {
    const activeSettings = settings.filter(
      (setting) => setting.status === "active",
    )

    expect(
      resolveSettingSelection(activeSettings, "setting_notice_banner"),
    ).toBe("setting_api_base")
  })

  test("returns null when there are no visible settings", () => {
    expect(resolveSettingSelection([], null)).toBeNull()
  })

  test("maps setting status and timestamps for table display", () => {
    expect(
      createSettingTableItems(settings, {
        localizeStatus: (status) => `status:${status}`,
        formatDateTime: (value) => `time:${value}`,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "setting_api_base",
        status: "status:active",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "setting_notice_banner",
        status: "status:disabled",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "setting_support_mailbox",
        status: "status:active",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
    ])
  })
})
