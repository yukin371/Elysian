import { describe, expect, test } from "bun:test"
import { ref } from "vue"

import { resolveProvidedWorkspaceState } from "./workspace-state-provider"

describe("resolveProvidedWorkspaceState", () => {
  test("provides the customer workspace state for the customer main surface", () => {
    const customerLoading = ref(false)
    const customerErrorMessage = ref("")
    const customerItems = ref([{ id: "customer-1" }])

    const resolved = resolveProvidedWorkspaceState("customer", {
      customerErrorMessage,
      customerItems,
      customerLoading,
    })

    expect(resolved?.kind).toBe("customer")
    expect(resolved?.loading).toBe(customerLoading)
    expect(resolved?.errorMessage).toBe(customerErrorMessage)
    expect(
      (resolved?.state as { customerItems: typeof customerItems })
        .customerItems,
    ).toBe(customerItems)
  })

  test("does not provide workspace state for unrelated workspaces", () => {
    const resolved = resolveProvidedWorkspaceState("role", {
      customerErrorMessage: ref(""),
      customerItems: ref([]),
      customerLoading: ref(false),
    })

    expect(resolved).toBeNull()
  })

  test("provides the dictionary workspace state for the dictionary main surface", () => {
    const dictionaryLoading = ref(false)
    const dictionaryErrorMessage = ref("")
    const tableItems = ref([{ id: "dictionary-type-1" }])

    const resolved = resolveProvidedWorkspaceState("dictionary", null, {
      dictionaryErrorMessage,
      tableItems,
      dictionaryLoading,
    })

    expect(resolved?.kind).toBe("dictionary")
    expect(resolved?.loading).toBe(dictionaryLoading)
    expect(resolved?.errorMessage).toBe(dictionaryErrorMessage)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })

  test("provides the role workspace state for the role main surface", () => {
    const roleLoading = ref(false)
    const roleErrorMessage = ref("")
    const tableItems = ref([{ id: "role-1" }])

    const resolved = resolveProvidedWorkspaceState("role", null, null, {
      roleErrorMessage,
      tableItems,
      roleLoading,
    })

    expect(resolved?.kind).toBe("role")
    expect(resolved?.loading).toBe(roleLoading)
    expect(resolved?.errorMessage).toBe(roleErrorMessage)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })
})
