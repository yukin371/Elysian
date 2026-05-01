import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import {
  readInjectedValue,
  resolveTenantWorkspaceMainState,
  resolveTenantWorkspacePanelState,
} from "./tenant-workspace-state"

describe("tenant workspace state helpers", () => {
  test("resolves tenant main state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "tenant",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        tenantErrorMessage: ref(""),
        tenantLoading: ref(false),
        tableItems: ref([{ id: "tenant-1", code: "alpha" }]),
      },
    }

    const resolved = resolveTenantWorkspaceMainState(context, true)

    expect(resolved?.tableItems.value).toHaveLength(1)
    expect(resolved?.tenantLoading.value).toBe(false)
  })

  test("resolves tenant panel state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "tenant",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        tenantErrorMessage: ref(""),
        tenantLoading: ref(false),
        tableItems: ref([]),
        tenantDetailErrorMessage: ref(""),
        tenantDetailLoading: ref(false),
        tenantPanelMode: ref<"detail" | "create" | "edit">("detail"),
        formFields: ref([{ key: "code" }]),
        formValues: ref({ code: "alpha" }),
        panelDescription: ref("detail"),
        panelTitle: ref("Tenant"),
        selectedTenant: ref({
          id: "tenant-1",
          code: "alpha",
          status: "active",
        }),
      },
    }

    const resolved = resolveTenantWorkspacePanelState(context, true)

    expect(resolved?.panelTitle.value).toBe("Tenant")
    expect(resolved?.selectedTenant.value?.id).toBe("tenant-1")
  })

  test("falls back when injection is disabled or mismatched", () => {
    const fallback = readInjectedValue(
      computed(() => null as { value: string } | null),
      "fallback",
    )

    expect(resolveTenantWorkspacePanelState(null, true)).toBeNull()
    expect(resolveTenantWorkspaceMainState(null, false)).toBeNull()
    expect(fallback.value).toBe("fallback")
  })
})
