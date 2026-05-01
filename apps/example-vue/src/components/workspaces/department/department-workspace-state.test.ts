import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import {
  readInjectedValue,
  resolveDepartmentWorkspaceMainState,
  resolveDepartmentWorkspacePanelState,
} from "./department-workspace-state"

describe("department workspace state helpers", () => {
  test("resolves department main state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "department",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        departmentErrorMessage: ref(""),
        departmentLoading: ref(false),
        tableItems: ref([{ id: "department-1", name: "Ops" }]),
      },
    }

    const resolved = resolveDepartmentWorkspaceMainState(context, true)

    expect(resolved?.tableItems.value).toHaveLength(1)
    expect(resolved?.departmentLoading.value).toBe(false)
  })

  test("resolves department panel state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "department",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        departmentErrorMessage: ref(""),
        departmentLoading: ref(false),
        tableItems: ref([]),
        departmentDetailErrorMessage: ref(""),
        departmentDetailLoading: ref(false),
        departmentPanelMode: ref<"create" | "detail" | "edit">("detail"),
        formFields: ref([{ key: "name" }]),
        formValues: ref({ name: "Ops" }),
        panelDescription: ref("detail"),
        panelTitle: ref("Operations"),
        parentLookup: ref(new Map()),
        selectedDepartment: ref({ id: "department-1", name: "Ops" }),
        selectedDepartmentDetail: ref({
          userIds: ["user-1"],
        }),
      },
    }

    const resolved = resolveDepartmentWorkspacePanelState(context, true)

    expect(resolved?.panelTitle.value).toBe("Operations")
    expect(resolved?.selectedDepartment.value?.id).toBe("department-1")
  })

  test("falls back when injection is disabled or mismatched", () => {
    const fallback = readInjectedValue(
      computed(() => null as { value: string } | null),
      "fallback",
    )

    expect(resolveDepartmentWorkspacePanelState(null, true)).toBeNull()
    expect(resolveDepartmentWorkspaceMainState(null, false)).toBeNull()
    expect(fallback.value).toBe("fallback")
  })
})
