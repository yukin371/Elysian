import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import {
  readInjectedValue,
  resolveCustomerWorkspaceMainState,
  resolveCustomerWorkspacePanelState,
} from "./customer-workspace-state"

describe("customer workspace state helpers", () => {
  test("resolves customer main state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "customer",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        customerErrorMessage: ref(""),
        customerItems: ref([{ id: "customer-1", name: "A" }]),
        customerLoading: ref(false),
      },
    }

    const resolved = resolveCustomerWorkspaceMainState(context, true)

    expect(resolved?.customerItems.value).toHaveLength(1)
    expect(resolved?.customerLoading.value).toBe(false)
  })

  test("resolves customer panel state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "customer",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        customerErrorMessage: ref(""),
        customerItems: ref([]),
        customerLoading: ref(false),
        customerFormMode: ref<"create" | "detail" | "edit">("detail"),
        deleteConfirmId: ref("customer-1"),
        formFields: ref([{ key: "name" }]),
        formValues: ref({ name: "A" }),
        panelDescription: ref("detail"),
        panelTitle: ref("Customer A"),
        selectedCustomer: ref({ id: "customer-1", name: "A" }),
      },
    }

    const resolved = resolveCustomerWorkspacePanelState(context, true)

    expect(resolved?.panelTitle.value).toBe("Customer A")
    expect(resolved?.selectedCustomer.value?.id).toBe("customer-1")
  })

  test("falls back when injection is disabled or mismatched", () => {
    const fallback = readInjectedValue(
      computed(() => null as { value: string } | null),
      "fallback",
    )

    expect(resolveCustomerWorkspacePanelState(null, true)).toBeNull()
    expect(resolveCustomerWorkspaceMainState(null, false)).toBeNull()
    expect(fallback.value).toBe("fallback")
  })
})
