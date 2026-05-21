import { describe, expect, test } from "bun:test"
import { computed, nextTick, ref } from "vue"

import { useExampleWorkspaceSync } from "./use-example-workspace-sync"

type ItemWithId = {
  id: string
}

type ExampleWorkspaceSyncOptions = Parameters<typeof useExampleWorkspaceSync>[0]

const createWorkspaceSyncOptions = (overrides: Record<string, unknown>) => {
  const target = overrides as Partial<ExampleWorkspaceSyncOptions>

  return new Proxy(target, {
    get(target, property) {
      if (typeof property !== "string") {
        return undefined
      }

      if (Object.prototype.hasOwnProperty.call(target, property)) {
        return (target as Record<string, unknown>)[property]
      }

      if (
        property.startsWith("select") ||
        property.startsWith("handle") ||
        property.startsWith("set") ||
        property.startsWith("reset") ||
        property.startsWith("go") ||
        property.startsWith("update") ||
        property.startsWith("submit") ||
        property.startsWith("open") ||
        property.startsWith("revoke")
      ) {
        return async () => {}
      }

      if (property.startsWith("can") || property.startsWith("is")) {
        return computed(() => false)
      }

      if (property.endsWith("Items") || property.endsWith("Cards")) {
        return computed(() => [])
      }

      if (property.endsWith("Loading")) {
        return ref(false)
      }

      if (property.endsWith("Id")) {
        return ref<string | null>(null)
      }

      if (property.endsWith("Detail")) {
        return ref<ItemWithId | null>(null)
      }

      if (property.endsWith("Mode")) {
        return ref("detail")
      }

      return ref(null)
    },
  }) as ExampleWorkspaceSyncOptions
}

describe("useExampleWorkspaceSync", () => {
  test("exits tenant edit mode when sync reselects another visible tenant", async () => {
    const filteredTenantItems = ref<ItemWithId[]>([
      { id: "tenant-1" },
      { id: "tenant-2" },
    ])
    const selectedTenantId = ref<string | null>("tenant-1")
    const tenantPanelMode = ref("edit")
    const tenantDetail = ref<ItemWithId | null>({ id: "tenant-1" })

    useExampleWorkspaceSync(
      createWorkspaceSyncOptions({
        customerItems: ref<ItemWithId[]>([]),
        enterpriseFormMode: ref("detail"),
        selectedCustomerId: ref<string | null>(null),
        canCreateCustomers: computed(() => false),
        isTenantWorkspace: computed(() => true),
        filteredTenantItems: computed(() => filteredTenantItems.value),
        selectedTenantId,
        tenantDetail,
        tenantPanelMode,
        canCreateTenants: computed(() => true),
        selectTenant: async (tenant: ItemWithId) => {
          selectedTenantId.value = tenant.id
          tenantDetail.value = tenant
          tenantPanelMode.value = "detail"
        },
      }),
    )

    filteredTenantItems.value = [{ id: "tenant-2" }]
    await nextTick()

    expect(selectedTenantId.value).toBe("tenant-2")
    expect(tenantDetail.value?.id).toBe("tenant-2")
    expect(tenantPanelMode.value).toBe("detail")
  })

  test("exits tenant edit mode when sync clears the visible tenant list", async () => {
    const filteredTenantItems = ref<ItemWithId[]>([{ id: "tenant-1" }])
    const selectedTenantId = ref<string | null>("tenant-1")
    const tenantPanelMode = ref("edit")
    const tenantDetail = ref<ItemWithId | null>({ id: "tenant-1" })

    useExampleWorkspaceSync(
      createWorkspaceSyncOptions({
        customerItems: ref<ItemWithId[]>([]),
        enterpriseFormMode: ref("detail"),
        selectedCustomerId: ref<string | null>(null),
        canCreateCustomers: computed(() => false),
        isTenantWorkspace: computed(() => true),
        filteredTenantItems: computed(() => filteredTenantItems.value),
        selectedTenantId,
        tenantDetail,
        tenantPanelMode,
        canCreateTenants: computed(() => true),
      }),
    )

    filteredTenantItems.value = []
    await nextTick()

    expect(selectedTenantId.value).toBeNull()
    expect(tenantDetail.value).toBeNull()
    expect(tenantPanelMode.value).toBe("create")
  })

  test("exits user reset mode when sync reselects another visible user", async () => {
    const filteredUserItems = ref<ItemWithId[]>([
      { id: "user-1" },
      { id: "user-2" },
    ])
    const selectedUserId = ref<string | null>("user-1")
    const userPanelMode = ref("reset")

    useExampleWorkspaceSync(
      createWorkspaceSyncOptions({
        customerItems: ref<ItemWithId[]>([]),
        enterpriseFormMode: ref("detail"),
        selectedCustomerId: ref<string | null>(null),
        canCreateCustomers: computed(() => false),
        filteredUserItems: computed(() => filteredUserItems.value),
        selectedUserId,
        userPanelMode,
        canCreateUsers: computed(() => true),
      }),
    )

    filteredUserItems.value = [{ id: "user-2" }]
    await nextTick()

    expect(selectedUserId.value).toBe("user-2")
    expect(userPanelMode.value).toBe("detail")
  })

  test("exits user reset mode when sync clears the visible user list", async () => {
    const filteredUserItems = ref<ItemWithId[]>([{ id: "user-1" }])
    const selectedUserId = ref<string | null>("user-1")
    const userPanelMode = ref("reset")

    useExampleWorkspaceSync(
      createWorkspaceSyncOptions({
        customerItems: ref<ItemWithId[]>([]),
        enterpriseFormMode: ref("detail"),
        selectedCustomerId: ref<string | null>(null),
        canCreateCustomers: computed(() => false),
        filteredUserItems: computed(() => filteredUserItems.value),
        selectedUserId,
        userPanelMode,
        canCreateUsers: computed(() => true),
      }),
    )

    filteredUserItems.value = []
    await nextTick()

    expect(selectedUserId.value).toBeNull()
    expect(userPanelMode.value).toBe("create")
  })

  test("opens the notification create panel through workspace action when list is empty", async () => {
    const filteredNotificationItems = ref<ItemWithId[]>([{ id: "notice-1" }])
    const selectedNotificationId = ref<string | null>("notice-1")
    const notificationDetail = ref<ItemWithId | null>({ id: "notice-1" })
    const openedPanels: string[] = []

    useExampleWorkspaceSync(
      createWorkspaceSyncOptions({
        customerItems: ref<ItemWithId[]>([]),
        enterpriseFormMode: ref("detail"),
        selectedCustomerId: ref<string | null>(null),
        canCreateCustomers: computed(() => false),
        isNotificationWorkspace: computed(() => true),
        filteredNotificationItems: computed(
          () => filteredNotificationItems.value,
        ),
        selectedNotificationId,
        notificationDetail,
        notificationPanelMode: computed(() => "detail"),
        canCreateNotifications: computed(() => true),
        openNotificationCreatePanel: () => {
          openedPanels.push("notification")
        },
      }),
    )

    filteredNotificationItems.value = []
    await nextTick()

    expect(selectedNotificationId.value).toBeNull()
    expect(notificationDetail.value).toBeNull()
    expect(openedPanels).toEqual(["notification"])
  })
})
