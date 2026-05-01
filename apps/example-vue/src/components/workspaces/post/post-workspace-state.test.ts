import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import {
  readInjectedValue,
  resolvePostWorkspaceMainState,
  resolvePostWorkspacePanelState,
} from "./post-workspace-state"

describe("post workspace state helpers", () => {
  test("resolves post main state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "post",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        postErrorMessage: ref(""),
        postLoading: ref(false),
        tableItems: ref([{ id: "post-1", name: "Manager" }]),
      },
    }

    const resolved = resolvePostWorkspaceMainState(context, true)

    expect(resolved?.tableItems.value).toHaveLength(1)
    expect(resolved?.postLoading.value).toBe(false)
  })

  test("resolves post panel state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "post",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        postErrorMessage: ref(""),
        postLoading: ref(false),
        tableItems: ref([]),
        formFields: ref([{ key: "name" }]),
        formValues: ref({ name: "Manager" }),
        panelDescription: ref("detail"),
        panelTitle: ref("Manager"),
        postDetailErrorMessage: ref(""),
        postDetailLoading: ref(false),
        postPanelMode: ref<"create" | "detail" | "edit">("detail"),
        selectedPost: ref({ id: "post-1", name: "Manager" }),
      },
    }

    const resolved = resolvePostWorkspacePanelState(context, true)

    expect(resolved?.panelTitle.value).toBe("Manager")
    expect(resolved?.selectedPost.value?.id).toBe("post-1")
  })

  test("falls back when injection is disabled or mismatched", () => {
    const fallback = readInjectedValue(
      computed(() => null as { value: string } | null),
      "fallback",
    )

    expect(resolvePostWorkspacePanelState(null, true)).toBeNull()
    expect(resolvePostWorkspaceMainState(null, false)).toBeNull()
    expect(fallback.value).toBe("fallback")
  })
})
