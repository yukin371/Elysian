import { describe, expect, test } from "bun:test"

import type { DictionaryTypeRecord } from "./platform-api"

import {
  createDefaultDictionaryTypeDraft,
  createDictionaryTypeTableItems,
  filterDictionaryTypes,
  normalizeDictionaryStatus,
  normalizeDictionaryText,
  normalizeOptionalDictionaryText,
  resolveDictionaryTypeSelection,
} from "./dictionary-workspace"

const createDictionaryType = (
  overrides: Partial<DictionaryTypeRecord> & Pick<DictionaryTypeRecord, "id">,
): DictionaryTypeRecord => ({
  id: overrides.id,
  code: overrides.code ?? overrides.id,
  name: overrides.name ?? `dict:${overrides.id}`,
  description: overrides.description,
  status: overrides.status ?? "active",
  createdAt: overrides.createdAt ?? "2026-04-27T08:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-27T08:00:00.000Z",
})

describe("dictionary workspace helpers", () => {
  const dictionaryTypes = [
    createDictionaryType({
      id: "dict_user_status",
      code: "user_status",
      name: "User Status",
      description: "Controls user lifecycle",
      status: "active",
    }),
    createDictionaryType({
      id: "dict_audit_result",
      code: "audit_result",
      name: "Audit Result",
      description: "Stores audit verdicts",
      status: "disabled",
    }),
    createDictionaryType({
      id: "dict_notify_level",
      code: "notify_level",
      name: "Notification Level",
      description: "Defines notice severity",
      status: "active",
    }),
  ]

  test("builds the default draft and normalizes form input", () => {
    expect(createDefaultDictionaryTypeDraft()).toEqual({
      code: "",
      name: "",
      description: "",
      status: "active",
    })

    expect(normalizeDictionaryText("  user_status  ")).toBe("user_status")
    expect(normalizeOptionalDictionaryText("  severity  ")).toBe("severity")
    expect(normalizeOptionalDictionaryText("   ")).toBeUndefined()
    expect(normalizeDictionaryStatus("disabled")).toBe("disabled")
    expect(normalizeDictionaryStatus("unknown")).toBe("active")
  })

  test("filters dictionary types across code, name, description, and status", () => {
    expect(
      filterDictionaryTypes(dictionaryTypes, { code: "notify" }).map(
        (type) => type.id,
      ),
    ).toEqual(["dict_notify_level"])

    expect(
      filterDictionaryTypes(dictionaryTypes, { name: "audit" }).map(
        (type) => type.id,
      ),
    ).toEqual(["dict_audit_result"])

    expect(
      filterDictionaryTypes(dictionaryTypes, {
        description: "user lifecycle",
      }).map((type) => type.id),
    ).toEqual(["dict_user_status"])

    expect(
      filterDictionaryTypes(dictionaryTypes, { status: "active" }).map(
        (type) => type.id,
      ),
    ).toEqual(["dict_user_status", "dict_notify_level"])
  })

  test("keeps the current selection when the dictionary type remains visible", () => {
    expect(
      resolveDictionaryTypeSelection(dictionaryTypes, "dict_audit_result"),
    ).toBe("dict_audit_result")
  })

  test("falls back to the first visible dictionary type when the previous selection disappears", () => {
    const activeTypes = dictionaryTypes.filter(
      (type) => type.status === "active",
    )

    expect(
      resolveDictionaryTypeSelection(activeTypes, "dict_audit_result"),
    ).toBe("dict_user_status")
  })

  test("returns null when there are no visible dictionary types", () => {
    expect(resolveDictionaryTypeSelection([], null)).toBeNull()
  })

  test("maps dictionary type fields for table display", () => {
    expect(
      createDictionaryTypeTableItems(dictionaryTypes, {
        localizeStatus: (status) => `status:${status}`,
        formatDateTime: (value) => `time:${value}`,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "dict_user_status",
        status: "status:active",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "dict_audit_result",
        status: "status:disabled",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "dict_notify_level",
        status: "status:active",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
    ])
  })
})
