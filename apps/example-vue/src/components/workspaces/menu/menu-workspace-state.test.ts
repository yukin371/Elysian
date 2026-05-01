import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import {
  readInjectedValue,
  resolveMenuWorkspaceMainState,
  resolveMenuWorkspacePanelState,
} from "./menu-workspace-state"

describe("menu workspace state helpers", () => {
  test("resolves menu main state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "menu",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        menuErrorMessage: ref(""),
        menuLoading: ref(false),
        tableItems: ref([{ id: "menu-1", name: "Dashboard" }]),
      },
    }

    const resolved = resolveMenuWorkspaceMainState(context, true)

    expect(resolved?.tableItems.value).toHaveLength(1)
    expect(resolved?.menuLoading.value).toBe(false)
  })

  test("resolves menu panel state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "menu",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        formFields: ref([{ key: "name" }]),
        formValues: ref({ name: "Dashboard" }),
        menuDetailErrorMessage: ref(""),
        menuDetailLoading: ref(false),
        menuErrorMessage: ref(""),
        menuLoading: ref(false),
        menuPanelMode: ref<"create" | "detail" | "edit">("detail"),
        panelDescription: ref("detail"),
        panelTitle: ref("Dashboard"),
        parentLookup: ref(new Map()),
        selectedMenu: ref({ id: "menu-1", name: "Dashboard" }),
        selectedMenuDetail: ref({ roleIds: ["role-1"] }),
        tableItems: ref([]),
      },
    }

    const resolved = resolveMenuWorkspacePanelState(context, true)

    expect(resolved?.panelTitle.value).toBe("Dashboard")
    expect(resolved?.selectedMenu.value?.id).toBe("menu-1")
    expect(resolved?.selectedMenuDetail.value?.roleIds).toHaveLength(1)
  })

  test("falls back when injection is disabled or mismatched", () => {
    const fallback = readInjectedValue(
      computed(() => null as { value: string } | null),
      "fallback",
    )

    expect(resolveMenuWorkspacePanelState(null, true)).toBeNull()
    expect(resolveMenuWorkspaceMainState(null, false)).toBeNull()
    expect(fallback.value).toBe("fallback")
  })
})
