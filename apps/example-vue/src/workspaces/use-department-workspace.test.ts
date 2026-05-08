import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type {
  DepartmentDetailRecord,
  DepartmentRecord,
} from "../lib/platform-api/departments"
import { useDepartmentWorkspace } from "./use-department-workspace"

const originalFetch = globalThis.fetch

const createDepartmentRecord = (
  overrides?: Partial<DepartmentRecord>,
): DepartmentRecord => ({
  code: "root",
  createdAt: "2026-05-01T09:00:00.000Z",
  id: "department-1",
  name: "Head Office",
  parentId: null,
  sort: 10,
  status: "active",
  updatedAt: "2026-05-01T10:00:00.000Z",
  ...overrides,
})

const createDepartmentDetailRecord = (
  overrides?: Partial<DepartmentDetailRecord>,
): DepartmentDetailRecord => ({
  userIds: [],
  ...createDepartmentRecord(overrides),
  ...overrides,
})

const createWorkspace = () =>
  useDepartmentWorkspace({
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
  })

describe("useDepartmentWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
  })

  test("filters departments from local query state and clears the query on reset", async () => {
    const first = createDepartmentRecord()
    const second = createDepartmentRecord({
      code: "audit",
      id: "department-2",
      name: "Audit Office",
      parentId: "department-1",
      status: "disabled",
    })

    globalThis.fetch = (async (input, init) => {
      const url = String(input)

      if (
        url.endsWith("/system/departments/department-1") &&
        (init?.method ?? "GET") === "GET"
      ) {
        return new Response(
          JSON.stringify(createDepartmentDetailRecord({ ...first })),
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

    await workspace.reloadDepartments()
    workspace.handleSearch({
      code: " audit ",
      name: " audit office ",
      status: "disabled",
    })

    expect(
      workspace.filteredDepartmentItems.value.map((item) => item.id),
    ).toEqual(["department-2"])
    expect(workspace.departmentQueryValues.value).toEqual({
      code: " audit ",
      name: " audit office ",
      status: "disabled",
    })

    workspace.handleReset()

    expect(
      workspace.filteredDepartmentItems.value.map((item) => item.id),
    ).toEqual(["department-1", "department-2"])
    expect(workspace.departmentQueryValues.value).toEqual({})
  })

  test("normalizes create payload and keeps edit mode after creation", async () => {
    const existing = createDepartmentRecord()
    const created = createDepartmentDetailRecord({
      code: "audit",
      id: "department-2",
      name: "Audit Office",
      parentId: "department-1",
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

      if (url.endsWith("/system/departments") && method === "POST") {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/system/departments/department-2") &&
        method === "GET"
      ) {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/system/departments/department-1") &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(createDepartmentDetailRecord(existing)),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (url.endsWith("/system/departments") && method === "GET") {
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

    await workspace.reloadDepartments()
    workspace.openCreatePanel()

    await workspace.submitForm({
      code: "  audit  ",
      name: "  Audit Office  ",
      parentId: "department-1",
      sort: "20",
      status: "disabled",
    })

    const createRequest = requests.find(
      (request) =>
        request.method === "POST" &&
        request.url.endsWith("/system/departments"),
    )

    expect(createRequest).toBeDefined()
    expect(JSON.parse(createRequest?.body ?? "{}")).toEqual({
      code: "audit",
      name: "Audit Office",
      parentId: "department-1",
      sort: 20,
      status: "disabled",
    })
    expect(workspace.departmentPanelMode.value).toBe("edit")
    expect(workspace.selectedDepartment.value?.id).toBe("department-2")
    expect(workspace.departmentErrorMessage.value).toBe("")
  })
})
