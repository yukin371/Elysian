import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type { SettingRecord } from "../lib/platform-api/settings"
import { useSettingWorkspace } from "./use-setting-workspace"

const originalFetch = globalThis.fetch

const createSettingRecord = (
  overrides?: Partial<SettingRecord>,
): SettingRecord => ({
  createdAt: "2026-05-01T09:00:00.000Z",
  description: "Default description",
  id: "setting-1",
  key: "system.title",
  status: "active",
  updatedAt: "2026-05-01T10:00:00.000Z",
  value: "Elysian",
  ...overrides,
})

const createWorkspace = (
  overrides: Partial<Parameters<typeof useSettingWorkspace>[0]> = {},
) =>
  useSettingWorkspace({
    canCreate: computed(() => true),
    canUpdate: computed(() => true),
    canView: computed(() => true),
    currentShellTabKey: ref("workspace"),
    locale: ref("zh-CN"),
    localizeFieldLabel: (fieldKey) => fieldKey,
    localizeStatus: (status) => status,
    onRecoverableAuthError: () => {},
    page: {
      formFields: computed(() => []),
      queryFields: computed(() => []),
      tableColumns: computed(() => []),
    },
    t: (key) => key,
    ...overrides,
  })

describe("useSettingWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("keeps setting list columns focused on editable configuration", () => {
    const workspace = createWorkspace({
      page: {
        formFields: computed(() => []),
        queryFields: computed(() => []),
        tableColumns: computed(() => [
          { key: "id" },
          { key: "createdAt" },
          { key: "key" },
          { key: "value" },
          { key: "description" },
          { key: "status" },
          { key: "updatedAt" },
        ]),
      },
    })

    expect(workspace.tableColumns.value.map((column) => column.key)).toEqual([
      "key",
      "value",
      "description",
      "status",
      "updatedAt",
    ])
  })

  test("filters settings from local query state and clears the query on reset", async () => {
    const first = createSettingRecord()
    const second = createSettingRecord({
      description: "Secondary remark",
      id: "setting-2",
      key: "system.footer",
      status: "disabled",
      value: "Footer",
    })

    globalThis.fetch = (async (input, init) => {
      const url = String(input)

      if (
        url.endsWith("/system/settings/setting-1") &&
        (init?.method ?? "GET") === "GET"
      ) {
        return new Response(JSON.stringify(first), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response(JSON.stringify({ items: [first, second] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadSettings()
    workspace.handleSearch({
      description: "  secondary  ",
      key: " footer ",
      status: "disabled",
      value: "  foot  ",
    })

    expect(workspace.filteredSettingItems.value.map((item) => item.id)).toEqual(
      ["setting-2"],
    )
    expect(workspace.settingQueryValues.value).toEqual({
      description: "  secondary  ",
      key: " footer ",
      status: "disabled",
      value: "  foot  ",
    })

    workspace.handleReset()

    expect(workspace.filteredSettingItems.value.map((item) => item.id)).toEqual(
      ["setting-1", "setting-2"],
    )
    expect(workspace.settingQueryValues.value).toEqual({})
  })

  test("normalizes create payload and keeps edit mode after creation", async () => {
    const existing = createSettingRecord()
    const created = createSettingRecord({
      description: undefined,
      id: "setting-2",
      key: "system.subtitle",
      value: "Console",
    })
    const requests: Array<{ method: string; url: string; body?: string }> = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"
      const body =
        typeof init?.body === "string"
          ? init.body
          : init?.body instanceof Uint8Array
            ? Buffer.from(init.body).toString("utf8")
            : undefined

      requests.push({ body, method, url })

      if (url.endsWith("/system/settings") && method === "POST") {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/settings/setting-2") && method === "GET") {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/settings/setting-1") && method === "GET") {
        return new Response(JSON.stringify(existing), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/settings") && method === "GET") {
        return new Response(JSON.stringify({ items: [existing, created] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadSettings()
    workspace.openCreatePanel()

    await workspace.submitForm({
      description: "   ",
      key: "  system.subtitle  ",
      status: "disabled",
      value: "  Console  ",
    })

    const createRequest = requests.find(
      (request) =>
        request.method === "POST" && request.url.endsWith("/system/settings"),
    )

    expect(createRequest).toBeDefined()
    expect(JSON.parse(createRequest?.body ?? "{}")).toEqual({
      key: "system.subtitle",
      status: "disabled",
      value: "Console",
    })
    expect(workspace.settingPanelMode.value).toBe("edit")
    expect(workspace.selectedSetting.value?.id).toBe("setting-2")
    expect(workspace.settingErrorMessage.value).toBe("")
  })
})
