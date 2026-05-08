import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type { RoleDetailRecord, RoleRecord } from "../lib/platform-api/roles"
import { useRoleWorkspace } from "./use-role-workspace"

const originalFetch = globalThis.fetch

const createRoleRecord = (overrides?: Partial<RoleRecord>): RoleRecord => ({
  code: "admin",
  createdAt: "2026-05-01T09:00:00.000Z",
  dataScope: 1,
  description: "Default description",
  id: "role-1",
  isSystem: true,
  name: "Administrator",
  status: "active",
  updatedAt: "2026-05-01T10:00:00.000Z",
  ...overrides,
})

const createRoleDetailRecord = (
  overrides?: Partial<RoleDetailRecord>,
): RoleDetailRecord => ({
  deptIds: [],
  permissionCodes: [],
  userIds: [],
  ...createRoleRecord(overrides),
  ...overrides,
})

const createWorkspace = () =>
  useRoleWorkspace({
    canCreate: computed(() => true),
    canUpdate: computed(() => true),
    canView: computed(() => true),
    currentShellTabKey: ref("workspace"),
    locale: ref("zh-CN"),
    localizeBoolean: (value) => (value ? "yes" : "no"),
    localizeDataScope: (value) => String(value),
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

describe("useRoleWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("filters roles from local query state and clears the query on reset", async () => {
    const first = createRoleRecord()
    const second = createRoleRecord({
      code: "auditor",
      dataScope: 4,
      description: "Secondary remark",
      id: "role-2",
      isSystem: false,
      name: "Auditor",
      status: "disabled",
    })

    globalThis.fetch = (async (input, init) => {
      const url = String(input)

      if (
        url.endsWith("/system/roles/role-1") &&
        (init?.method ?? "GET") === "GET"
      ) {
        return new Response(
          JSON.stringify(createRoleDetailRecord({ ...first })),
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

    await workspace.reloadRoles()
    workspace.handleSearch({
      code: " auditor ",
      description: " secondary ",
      name: " auditor ",
      status: "disabled",
    })

    expect(workspace.filteredRoleItems.value.map((item) => item.id)).toEqual([
      "role-2",
    ])
    expect(workspace.roleQueryValues.value).toEqual({
      code: " auditor ",
      description: " secondary ",
      name: " auditor ",
      status: "disabled",
    })

    workspace.handleReset()

    expect(workspace.filteredRoleItems.value.map((item) => item.id)).toEqual([
      "role-1",
      "role-2",
    ])
    expect(workspace.roleQueryValues.value).toEqual({})
  })

  test("normalizes create payload and returns to detail mode after creation", async () => {
    const existing = createRoleRecord()
    const created = createRoleDetailRecord({
      code: "auditor",
      dataScope: 4,
      description: undefined,
      id: "role-2",
      isSystem: false,
      name: "Auditor",
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

      if (url.endsWith("/system/roles") && method === "POST") {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/roles/role-2") && method === "GET") {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/roles/role-1") && method === "GET") {
        return new Response(JSON.stringify(createRoleDetailRecord(existing)), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.endsWith("/system/roles") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [existing, created],
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const workspace = createWorkspace()

    await workspace.reloadRoles()
    workspace.openCreatePanel()

    await workspace.submitForm({
      code: "  auditor  ",
      dataScope: "4",
      description: "   ",
      isSystem: false,
      name: "  Auditor  ",
      status: "disabled",
    })

    const createRequest = requests.find(
      (request) =>
        request.method === "POST" && request.url.endsWith("/system/roles"),
    )

    expect(createRequest).toBeDefined()
    expect(JSON.parse(createRequest?.body ?? "{}")).toEqual({
      code: "auditor",
      dataScope: 4,
      isSystem: false,
      name: "Auditor",
      status: "disabled",
    })
    expect(workspace.rolePanelMode.value).toBe("detail")
    expect(workspace.selectedRole.value?.id).toBe("role-2")
    expect(workspace.roleErrorMessage.value).toBe("")
  })
})
