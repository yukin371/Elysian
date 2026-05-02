import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type {
  DictionaryItemRecord,
  DictionaryTypeDetailRecord,
  DictionaryTypeRecord,
} from "../lib/platform-api/dictionaries"
import { useDictionaryWorkspace } from "./use-dictionary-workspace"

const originalFetch = globalThis.fetch

const createDictionaryTypeRecord = (
  overrides?: Partial<DictionaryTypeRecord>,
): DictionaryTypeRecord => ({
  code: "sys_user_status",
  createdAt: "2026-05-01T09:00:00.000Z",
  description: "User status",
  id: "dictionary-type-1",
  name: "User Status",
  status: "active",
  updatedAt: "2026-05-01T10:00:00.000Z",
  ...overrides,
})

const createDictionaryItemRecord = (
  overrides?: Partial<DictionaryItemRecord>,
): DictionaryItemRecord => ({
  createdAt: "2026-05-01T09:00:00.000Z",
  id: "dictionary-item-1",
  isDefault: true,
  label: "Enabled",
  sort: 1,
  status: "active",
  typeId: "dictionary-type-1",
  updatedAt: "2026-05-01T10:00:00.000Z",
  value: "enabled",
  ...overrides,
})

const createDictionaryTypeDetailRecord = (
  overrides?: Partial<DictionaryTypeDetailRecord>,
): DictionaryTypeDetailRecord => ({
  items: [createDictionaryItemRecord()],
  ...createDictionaryTypeRecord(overrides),
  ...overrides,
})

const createWorkspace = () =>
  useDictionaryWorkspace({
    canCreate: computed(() => true),
    canUpdate: computed(() => true),
    canView: computed(() => true),
    currentShellTabKey: ref("runtime"),
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
  })

describe("useDictionaryWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("filters dictionary types from local query state and clears the query on reset", async () => {
    const first = createDictionaryTypeRecord()
    const second = createDictionaryTypeRecord({
      code: "sys_notice_level",
      description: "Notice level",
      id: "dictionary-type-2",
      name: "Notice Level",
      status: "disabled",
    })

    globalThis.fetch = (async (input, init) => {
      const url = String(input)

      if (url.endsWith("/system/dictionaries/items")) {
        return new Response(
          JSON.stringify({
            items: [
              createDictionaryItemRecord(),
              createDictionaryItemRecord({
                id: "dictionary-item-2",
                isDefault: false,
                label: "Warning",
                typeId: "dictionary-type-2",
                value: "warning",
              }),
            ],
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith("/system/dictionaries/types/dictionary-type-1") &&
        (init?.method ?? "GET") === "GET"
      ) {
        return new Response(
          JSON.stringify(createDictionaryTypeDetailRecord(first)),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response(JSON.stringify({ items: [first, second] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadDictionaries()
    workspace.handleSearch({
      code: " notice ",
      description: " level ",
      name: " notice ",
      status: "disabled",
    })

    expect(
      workspace.filteredDictionaryTypes.value.map((item) => item.id),
    ).toEqual(["dictionary-type-2"])
    expect(workspace.dictionaryQueryValues.value).toEqual({
      code: " notice ",
      description: " level ",
      name: " notice ",
      status: "disabled",
    })

    workspace.handleReset()

    expect(
      workspace.filteredDictionaryTypes.value.map((item) => item.id),
    ).toEqual(["dictionary-type-1", "dictionary-type-2"])
    expect(workspace.dictionaryQueryValues.value).toEqual({})
  })

  test("normalizes create payload and returns to detail mode after creation", async () => {
    const existing = createDictionaryTypeRecord()
    const created = createDictionaryTypeDetailRecord({
      code: "sys_notice_level",
      description: undefined,
      id: "dictionary-type-2",
      items: [
        createDictionaryItemRecord({
          id: "dictionary-item-2",
          isDefault: false,
          label: "Warning",
          typeId: "dictionary-type-2",
          value: "warning",
        }),
      ],
      name: "Notice Level",
      status: "disabled",
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

      if (url.endsWith("/system/dictionaries/items")) {
        return new Response(
          JSON.stringify({ items: [createDictionaryItemRecord()] }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (url.endsWith("/system/dictionaries/types") && method === "POST") {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/system/dictionaries/types/dictionary-type-2") &&
        method === "GET"
      ) {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/system/dictionaries/types/dictionary-type-1") &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(createDictionaryTypeDetailRecord(existing)),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (url.endsWith("/system/dictionaries/types") && method === "GET") {
        return new Response(JSON.stringify({ items: [existing, created] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadDictionaries()
    workspace.openCreatePanel()

    await workspace.submitForm({
      code: "  sys_notice_level  ",
      description: "   ",
      name: "  Notice Level  ",
      status: "disabled",
    })

    const createRequest = requests.find(
      (request) =>
        request.method === "POST" &&
        request.url.endsWith("/system/dictionaries/types"),
    )

    expect(createRequest).toBeDefined()
    expect(JSON.parse(createRequest?.body ?? "{}")).toEqual({
      code: "sys_notice_level",
      name: "Notice Level",
      status: "disabled",
    })
    expect(workspace.dictionaryPanelMode.value).toBe("detail")
    expect(workspace.selectedDictionaryType.value?.id).toBe("dictionary-type-2")
    expect(workspace.dictionaryErrorMessage.value).toBe("")
  })

  test("falls back to cached dictionary items when detail loading fails", async () => {
    const first = createDictionaryTypeRecord()
    const second = createDictionaryTypeRecord({
      code: "sys_notice_level",
      id: "dictionary-type-2",
      name: "Notice Level",
    })
    const firstItems = [
      createDictionaryItemRecord(),
      createDictionaryItemRecord({
        id: "dictionary-item-2",
        isDefault: false,
        label: "Disabled",
        value: "disabled",
      }),
    ]

    globalThis.fetch = (async (input, init) => {
      const url = String(input)

      if (url.endsWith("/system/dictionaries/items")) {
        return new Response(
          JSON.stringify({
            items: [
              ...firstItems,
              createDictionaryItemRecord({
                id: "dictionary-item-3",
                label: "Warning",
                typeId: "dictionary-type-2",
                value: "warning",
              }),
            ],
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith("/system/dictionaries/types/dictionary-type-1") &&
        (init?.method ?? "GET") === "GET"
      ) {
        return new Response(
          JSON.stringify({
            error: { message: "detail failed" },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 500,
          },
        )
      }

      return new Response(JSON.stringify({ items: [first, second] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadDictionaries()

    expect(workspace.selectedDictionaryType.value?.id).toBe("dictionary-type-1")
    expect(workspace.selectedDictionaryTypeDetail.value).toBeNull()
    expect(
      workspace.selectedDictionaryTypeItems.value.map(
        (item: DictionaryItemRecord) => item.id,
      ),
    ).toEqual(["dictionary-item-1", "dictionary-item-2"])
    expect(workspace.dictionaryDetailErrorMessage.value).toBe("detail failed")
  })

  test("preserves cached dictionary items when item reload fails", async () => {
    const first = createDictionaryTypeRecord()
    const firstItems = [
      createDictionaryItemRecord(),
      createDictionaryItemRecord({
        id: "dictionary-item-2",
        isDefault: false,
        label: "Disabled",
        value: "disabled",
      }),
    ]
    let failItemReload = false

    globalThis.fetch = (async (input, init) => {
      const url = String(input)

      if (url.endsWith("/system/dictionaries/items")) {
        if (failItemReload) {
          return new Response(
            JSON.stringify({
              error: { message: "item reload failed" },
            }),
            {
              headers: { "content-type": "application/json" },
              status: 500,
            },
          )
        }

        return new Response(JSON.stringify({ items: firstItems }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/system/dictionaries/types/dictionary-type-1") &&
        (init?.method ?? "GET") === "GET"
      ) {
        return new Response(
          JSON.stringify({
            error: { message: "detail failed" },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 500,
          },
        )
      }

      return new Response(JSON.stringify({ items: [first] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadDictionaries()

    expect(
      workspace.selectedDictionaryTypeItems.value.map(
        (item: DictionaryItemRecord) => item.id,
      ),
    ).toEqual(["dictionary-item-1", "dictionary-item-2"])

    failItemReload = true

    await workspace.reloadDictionaries()

    expect(workspace.dictionaryErrorMessage.value).toBe("item reload failed")
    expect(workspace.selectedDictionaryType.value?.id).toBe("dictionary-type-1")
    expect(workspace.selectedDictionaryTypeDetail.value).toBeNull()
    expect(
      workspace.selectedDictionaryTypeItems.value.map(
        (item: DictionaryItemRecord) => item.id,
      ),
    ).toEqual(["dictionary-item-1", "dictionary-item-2"])
  })

  test("keeps cached dictionary items after opening the create panel", async () => {
    const first = createDictionaryTypeRecord()
    const firstItems = [
      createDictionaryItemRecord(),
      createDictionaryItemRecord({
        id: "dictionary-item-2",
        isDefault: false,
        label: "Disabled",
        value: "disabled",
      }),
    ]

    globalThis.fetch = (async (input, init) => {
      const url = String(input)

      if (url.endsWith("/system/dictionaries/items")) {
        return new Response(JSON.stringify({ items: firstItems }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/system/dictionaries/types/dictionary-type-1") &&
        (init?.method ?? "GET") === "GET"
      ) {
        return new Response(
          JSON.stringify({
            error: { message: "detail failed" },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 500,
          },
        )
      }

      return new Response(JSON.stringify({ items: [first] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadDictionaries()

    expect(
      workspace.selectedDictionaryTypeItems.value.map(
        (item: DictionaryItemRecord) => item.id,
      ),
    ).toEqual(["dictionary-item-1", "dictionary-item-2"])

    workspace.openCreatePanel()

    expect(workspace.selectedDictionaryTypeItems.value).toEqual([])

    await workspace.selectDictionaryType(first)

    expect(workspace.selectedDictionaryTypeDetail.value).toBeNull()
    expect(
      workspace.selectedDictionaryTypeItems.value.map(
        (item: DictionaryItemRecord) => item.id,
      ),
    ).toEqual(["dictionary-item-1", "dictionary-item-2"])
  })
})
