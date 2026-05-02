import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { createCrudWorkspace } from "./create-crud-workspace"

interface TestRecord {
  id: string
  name: string
}

const createWorkspace = (options?: {
  canCreate?: boolean
  canUpdate?: boolean
  canView?: boolean
  createError?: unknown
  initialItems?: TestRecord[]
  onRecoverableAuthError?: (error: unknown) => void
  updateError?: unknown
}) => {
  const currentShellTabKey = ref("runtime")
  const listItems = ref<TestRecord[]>(options?.initialItems ?? [])
  const createdRecords: TestRecord[] = []
  const updatedRecords: TestRecord[] = []

  const workspace = createCrudWorkspace<TestRecord, TestRecord, TestRecord>({
    canCreate: computed(() => options?.canCreate ?? true),
    canUpdate: computed(() => options?.canUpdate ?? true),
    canView: computed(() => options?.canView ?? true),
    createDefaultDraft: () => ({ id: "", name: "" }),
    createRecord: async (payload) => {
      if (options?.createError) {
        throw options.createError
      }

      const record = { ...payload, id: `created-${createdRecords.length + 1}` }
      createdRecords.push(record)
      listItems.value = [...listItems.value, record]
      return record
    },
    currentShellTabKey,
    fetchDetail: async (id) => {
      const record = listItems.value.find((item: TestRecord) => item.id === id)

      if (!record) {
        throw new Error("missing detail")
      }

      return record
    },
    fetchList: async () => ({ items: listItems.value }),
    getCreateErrorMessage: () => "create failed",
    getLoadDetailErrorMessage: () => "detail failed",
    getLoadListErrorMessage: () => "list failed",
    getUpdateErrorMessage: () => "update failed",
    normalizePayload: (values) =>
      typeof values.name === "string" && values.name.trim().length > 0
        ? {
            payload: {
              id: String(values.id ?? ""),
              name: values.name.trim(),
            },
            status: "valid",
          }
        : {
            message: "name required",
            status: "invalid",
          },
    onRecoverableAuthError: options?.onRecoverableAuthError ?? (() => {}),
    resolveSelection: (items, selectedId) =>
      items.some((item) => item.id === selectedId)
        ? selectedId
        : (items[0]?.id ?? null),
    toEditDraft: (record) => ({ ...record }),
    updateRecord: async (id, payload) => {
      if (options?.updateError) {
        throw options.updateError
      }

      const record = { ...payload, id }
      updatedRecords.push(record)
      listItems.value = listItems.value.map((item: TestRecord) =>
        item.id === id ? record : item,
      )
      return record
    },
  })

  return {
    createdRecords,
    currentShellTabKey,
    listItems,
    updatedRecords,
    workspace,
  }
}

describe("createCrudWorkspace", () => {
  test("clears workspace when view permission is unavailable", async () => {
    const { workspace } = createWorkspace({
      canView: false,
      initialItems: [{ id: "one", name: "One" }],
    })

    workspace.items.value = [{ id: "stale", name: "Stale" }]
    await workspace.reloadRecords()

    expect(workspace.items.value).toEqual([])
    expect(workspace.selectedId.value).toBeNull()
    expect(workspace.panelMode.value).toBe("detail")
  })

  test("enters create mode for an empty list when create is allowed", async () => {
    const { workspace } = createWorkspace({ initialItems: [] })

    await workspace.reloadRecords()

    expect(workspace.selectedId.value).toBeNull()
    expect(workspace.panelMode.value).toBe("create")
  })

  test("preserves or falls back selection during reload", async () => {
    const { listItems, workspace } = createWorkspace({
      initialItems: [
        { id: "one", name: "One" },
        { id: "two", name: "Two" },
      ],
    })

    workspace.selectedId.value = "two"
    await workspace.reloadRecords()
    expect(workspace.selectedId.value).toBe("two")

    listItems.value = [{ id: "one", name: "One" }]
    await workspace.reloadRecords()
    expect(workspace.selectedId.value).toBe("one")
  })

  test("selects a row and loads detail", async () => {
    const { currentShellTabKey, workspace } = createWorkspace({
      initialItems: [{ id: "one", name: "One" }],
    })

    await workspace.selectRecord({ id: "one", name: "One" })

    expect(currentShellTabKey.value).toBe("workspace")
    expect(workspace.detail.value).toEqual({ id: "one", name: "One" })
    expect(workspace.panelMode.value).toBe("detail")
  })

  test("validates, creates, updates, and returns to detail mode", async () => {
    const { createdRecords, updatedRecords, workspace } = createWorkspace()

    await workspace.submitForm({ name: "   " })
    expect(workspace.errorMessage.value).toBe("name required")

    await workspace.submitForm({ name: "Created" })
    expect(createdRecords).toEqual([{ id: "created-1", name: "Created" }])
    expect(workspace.selectedId.value).toBe("created-1")
    expect(workspace.panelMode.value).toBe("detail")

    workspace.startEdit({ id: "created-1", name: "Created" })
    await workspace.submitForm({ name: "Updated" })

    expect(updatedRecords).toEqual([{ id: "created-1", name: "Updated" }])
    expect(workspace.detail.value).toEqual({
      id: "created-1",
      name: "Updated",
    })
    expect(workspace.panelMode.value).toBe("detail")
  })

  test("reports recoverable auth errors when create or update submission fails", async () => {
    const createErrors: unknown[] = []
    const createError = new Error("create unauthorized")
    const createWorkspaceResult = createWorkspace({
      createError,
      onRecoverableAuthError: (error) => {
        createErrors.push(error)
      },
    })

    await createWorkspaceResult.workspace.submitForm({ name: "Created" })

    expect(createErrors).toEqual([createError])
    expect(createWorkspaceResult.workspace.errorMessage.value).toBe(
      "create unauthorized",
    )

    const updateErrors: unknown[] = []
    const updateError = new Error("update unauthorized")
    const updateWorkspaceResult = createWorkspace({
      initialItems: [{ id: "one", name: "One" }],
      onRecoverableAuthError: (error) => {
        updateErrors.push(error)
      },
      updateError,
    })

    updateWorkspaceResult.workspace.startEdit({ id: "one", name: "One" })
    await updateWorkspaceResult.workspace.submitForm({ name: "Updated" })

    expect(updateErrors).toEqual([updateError])
    expect(updateWorkspaceResult.workspace.errorMessage.value).toBe(
      "update unauthorized",
    )
  })
})
