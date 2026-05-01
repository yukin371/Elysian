import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { WorkspaceStateContext } from "../../../app/workspace-registry"
import {
  readInjectedValue,
  resolveNotificationWorkspaceMainState,
  resolveNotificationWorkspacePanelState,
} from "./notification-workspace-state"

describe("notification workspace state helpers", () => {
  test("resolves notification main state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "notification",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        notificationErrorMessage: ref(""),
        notificationLoading: ref(false),
        tableItems: ref([{ id: "notification-1", title: "Alert" }]),
      },
    }

    const resolved = resolveNotificationWorkspaceMainState(context, true)

    expect(resolved?.tableItems.value).toHaveLength(1)
    expect(resolved?.notificationLoading.value).toBe(false)
  })

  test("resolves notification panel state from the injected workspace context", () => {
    const context: WorkspaceStateContext = {
      kind: "notification",
      loading: ref(false),
      errorMessage: ref(""),
      state: {
        notificationErrorMessage: ref(""),
        notificationLoading: ref(false),
        tableItems: ref([]),
        notificationDetailErrorMessage: ref(""),
        notificationDetailLoading: ref(false),
        notificationPanelMode: ref<"detail" | "create">("detail"),
        formFields: ref([{ key: "title" }]),
        formValues: ref({ title: "Alert" }),
        panelDescription: ref("detail"),
        panelTitle: ref("Notification"),
        selectedNotification: ref({ id: "notification-1", title: "Alert" }),
      },
    }

    const resolved = resolveNotificationWorkspacePanelState(context, true)

    expect(resolved?.panelTitle.value).toBe("Notification")
    expect(resolved?.selectedNotification.value?.id).toBe("notification-1")
  })

  test("falls back when injection is disabled or mismatched", () => {
    const fallback = readInjectedValue(
      computed(() => null as { value: string } | null),
      "fallback",
    )

    expect(resolveNotificationWorkspacePanelState(null, true)).toBeNull()
    expect(resolveNotificationWorkspaceMainState(null, false)).toBeNull()
    expect(fallback.value).toBe("fallback")
  })
})
