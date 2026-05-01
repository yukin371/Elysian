import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import {
  readInjectedValue,
  resolveSettingWorkspaceMainState,
  resolveSettingWorkspacePanelState,
} from "./setting-workspace-state"

describe("setting workspace state helpers", () => {
  test("resolves setting main state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "setting",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        settingErrorMessage: ref(""),
        settingLoading: ref(false),
        tableItems: ref([{ id: "setting-1", key: "site.title" }]),
      },
    }

    const resolved = resolveSettingWorkspaceMainState(context, true)

    expect(resolved?.tableItems.value).toHaveLength(1)
    expect(resolved?.settingLoading.value).toBe(false)
  })

  test("resolves setting panel state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "setting",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        settingErrorMessage: ref(""),
        settingLoading: ref(false),
        tableItems: ref([]),
        settingDetailErrorMessage: ref(""),
        settingDetailLoading: ref(false),
        settingPanelMode: ref<"detail" | "create" | "edit">("detail"),
        formFields: ref([{ key: "key" }]),
        formValues: ref({ key: "site.title" }),
        panelDescription: ref("detail"),
        panelTitle: ref("Setting"),
        selectedSetting: ref({ id: "setting-1", key: "site.title" }),
      },
    }

    const resolved = resolveSettingWorkspacePanelState(context, true)

    expect(resolved?.panelTitle.value).toBe("Setting")
    expect(resolved?.selectedSetting.value?.id).toBe("setting-1")
  })

  test("falls back when injection is disabled or mismatched", () => {
    const fallback = readInjectedValue(
      computed(() => null as { value: string } | null),
      "fallback",
    )

    expect(resolveSettingWorkspacePanelState(null, true)).toBeNull()
    expect(resolveSettingWorkspaceMainState(null, false)).toBeNull()
    expect(fallback.value).toBe("fallback")
  })
})
