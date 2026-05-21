import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type { PostRecord } from "../lib/platform-api/posts"
import { usePostWorkspace } from "./use-post-workspace"

const originalFetch = globalThis.fetch

const createPostRecord = (overrides?: Partial<PostRecord>): PostRecord => ({
  code: "ADMIN",
  createdAt: "2026-05-01T09:00:00.000Z",
  id: "post-1",
  name: "Administrator",
  remark: "Default remark",
  sort: 10,
  status: "active",
  updatedAt: "2026-05-01T10:00:00.000Z",
  ...overrides,
})

const createWorkspace = (
  overrides: Partial<Parameters<typeof usePostWorkspace>[0]> = {},
) =>
  usePostWorkspace({
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

describe("usePostWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("keeps post list columns focused on organization usage", () => {
    const workspace = createWorkspace({
      page: {
        formFields: computed(() => []),
        queryFields: computed(() => []),
        tableColumns: computed(() => [
          { key: "id" },
          { key: "createdAt" },
          { key: "code" },
          { key: "name" },
          { key: "sort" },
          { key: "status" },
          { key: "remark" },
          { key: "updatedAt" },
        ]),
      },
    })

    expect(workspace.tableColumns.value.map((column) => column.key)).toEqual([
      "name",
      "code",
      "sort",
      "status",
      "remark",
      "updatedAt",
    ])
  })

  test("filters posts from local query state and clears the query on reset", async () => {
    const first = createPostRecord()
    const second = createPostRecord({
      code: "OPS",
      id: "post-2",
      name: "Operations",
      remark: "Secondary remark",
      status: "disabled",
    })

    globalThis.fetch = (async (input, init) => {
      const url = String(input)

      if (
        url.endsWith("/system/posts/post-1") &&
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

    await workspace.reloadPosts()
    workspace.handleSearch({
      code: " ops ",
      name: " operations ",
      remark: " secondary ",
      status: "disabled",
    })

    expect(workspace.filteredPostItems.value.map((item) => item.id)).toEqual([
      "post-2",
    ])
    expect(workspace.postQueryValues.value).toEqual({
      code: " ops ",
      name: " operations ",
      remark: " secondary ",
      status: "disabled",
    })

    workspace.handleReset()

    expect(workspace.filteredPostItems.value.map((item) => item.id)).toEqual([
      "post-1",
      "post-2",
    ])
    expect(workspace.postQueryValues.value).toEqual({})
  })

  test("normalizes create payload and keeps edit mode after creation", async () => {
    const existing = createPostRecord()
    const created = createPostRecord({
      code: "AUDIT",
      id: "post-2",
      name: "Auditor",
      remark: undefined,
      sort: 20,
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

      if (url.endsWith("/system/posts") && method === "POST") {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/posts/post-2") && method === "GET") {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/posts/post-1") && method === "GET") {
        return new Response(JSON.stringify(existing), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/posts") && method === "GET") {
        return new Response(JSON.stringify({ items: [existing, created] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadPosts()
    workspace.openCreatePanel()

    await workspace.submitForm({
      code: "  AUDIT  ",
      name: "  Auditor  ",
      remark: "   ",
      sort: "20",
      status: "disabled",
    })

    const createRequest = requests.find(
      (request) =>
        request.method === "POST" && request.url.endsWith("/system/posts"),
    )

    expect(createRequest).toBeDefined()
    expect(JSON.parse(createRequest?.body ?? "{}")).toEqual({
      code: "AUDIT",
      name: "Auditor",
      sort: 20,
      status: "disabled",
    })
    expect(workspace.postPanelMode.value).toBe("edit")
    expect(workspace.selectedPost.value?.id).toBe("post-2")
    expect(workspace.postErrorMessage.value).toBe("")
  })
})
