import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import {
  readInjectedValue,
  resolveDictionaryWorkspaceMainState,
  resolveDictionaryWorkspacePanelState,
} from "./dictionary-workspace-state"

describe("dictionary workspace state helpers", () => {
  test("resolves dictionary main state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "dictionary",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        dictionaryErrorMessage: ref(""),
        dictionaryLoading: ref(false),
        tableItems: ref([{ id: "dictionary-type-1", name: "Status" }]),
      },
    }

    const resolved = resolveDictionaryWorkspaceMainState(context, true)

    expect(resolved?.tableItems.value).toHaveLength(1)
    expect(resolved?.dictionaryLoading.value).toBe(false)
  })

  test("resolves dictionary panel state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "dictionary",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        dictionaryErrorMessage: ref(""),
        dictionaryLoading: ref(false),
        tableItems: ref([]),
        dictionaryDetailErrorMessage: ref(""),
        dictionaryDetailLoading: ref(false),
        dictionaryPanelMode: ref<"create" | "detail" | "edit">("detail"),
        formFields: ref([{ key: "name" }]),
        formValues: ref({ name: "Status" }),
        panelDescription: ref("detail"),
        panelTitle: ref("Dictionary"),
        selectedDictionaryType: ref({
          id: "dictionary-type-1",
          name: "Status",
        }),
        selectedDictionaryTypeItems: ref([
          {
            id: "dictionary-item-1",
            label: "Enabled",
            value: "enabled",
            sort: 1,
            status: "enabled",
            isDefault: true,
          },
        ]),
      },
    }

    const resolved = resolveDictionaryWorkspacePanelState(context, true)

    expect(resolved?.panelTitle.value).toBe("Dictionary")
    expect(resolved?.selectedDictionaryType.value?.id).toBe("dictionary-type-1")
    expect(resolved?.selectedDictionaryTypeItems.value).toHaveLength(1)
  })

  test("falls back when injection is disabled or mismatched", () => {
    const fallback = readInjectedValue(
      computed(() => null as { value: string } | null),
      "fallback",
    )

    expect(resolveDictionaryWorkspacePanelState(null, true)).toBeNull()
    expect(resolveDictionaryWorkspaceMainState(null, false)).toBeNull()
    expect(fallback.value).toBe("fallback")
  })
})
