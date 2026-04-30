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
})
