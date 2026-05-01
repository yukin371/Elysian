import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import {
  readInjectedValue,
  resolveUserWorkspaceMainState,
  resolveUserWorkspacePanelState,
} from "./user-workspace-state"

describe("user workspace state helpers", () => {
  test("resolves user main state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "user",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        userErrorMessage: ref(""),
        userLoading: ref(false),
        tableItems: ref([{ id: "user-1", username: "admin" }]),
      },
    }

    const resolved = resolveUserWorkspaceMainState(context, true)

    expect(resolved?.tableItems.value).toHaveLength(1)
    expect(resolved?.userLoading.value).toBe(false)
  })

  test("resolves user panel state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "user",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        userErrorMessage: ref(""),
        userLoading: ref(false),
        tableItems: ref([]),
        formFields: ref([{ key: "username" }]),
        formValues: ref({ username: "admin" }),
        panelDescription: ref("detail"),
        panelTitle: ref("User"),
        selectedUser: ref({ id: "user-1", username: "admin" }),
        userPanelMode: ref<"detail" | "create" | "edit" | "reset">("detail"),
      },
    }

    const resolved = resolveUserWorkspacePanelState(context, true)

    expect(resolved?.panelTitle.value).toBe("User")
    expect(resolved?.selectedUser.value?.id).toBe("user-1")
  })

  test("falls back when injection is disabled or mismatched", () => {
    const fallback = readInjectedValue(
      computed(() => null as { value: string } | null),
      "fallback",
    )

    expect(resolveUserWorkspacePanelState(null, true)).toBeNull()
    expect(resolveUserWorkspaceMainState(null, false)).toBeNull()
    expect(fallback.value).toBe("fallback")
  })
})
