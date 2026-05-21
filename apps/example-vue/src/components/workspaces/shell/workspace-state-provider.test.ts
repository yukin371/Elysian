import { describe, expect, test } from "bun:test"
import { ref } from "vue"

import { resolveProvidedWorkspaceState } from "./workspace-state-provider"

describe("resolveProvidedWorkspaceState", () => {
  test("provides the customer workspace state for the customer main surface", () => {
    const customerLoading = ref(false)
    const customerErrorMessage = ref("")
    const customerItems = ref([{ id: "customer-1" }])
    const tableItems = ref([
      { id: "customer-1", updatedAt: "2026/5/20 19:33:47" },
    ])

    const resolved = resolveProvidedWorkspaceState("customer", {
      customerErrorMessage,
      customerItems,
      customerLoading,
      tableItems,
    })

    expect(resolved?.kind).toBe("customer")
    expect(resolved?.loading).toBe(customerLoading)
    expect(resolved?.errorMessage).toBe(customerErrorMessage)
    expect(
      (resolved?.state as { customerItems: typeof customerItems })
        .customerItems,
    ).toBe(customerItems)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })

  test("does not provide workspace state for unrelated workspaces", () => {
    const resolved = resolveProvidedWorkspaceState("role", {
      customerErrorMessage: ref(""),
      customerItems: ref([]),
      customerLoading: ref(false),
      tableItems: ref([]),
    })

    expect(resolved).toBeNull()
  })

  test("provides the dictionary workspace state for the dictionary main surface", () => {
    const dictionaryLoading = ref(false)
    const dictionaryErrorMessage = ref("")
    const tableItems = ref([{ id: "dictionary-type-1" }])

    const resolved = resolveProvidedWorkspaceState("dictionary", null, {
      dictionaryDetailErrorMessage: ref(""),
      dictionaryDetailLoading: ref(false),
      dictionaryErrorMessage,
      dictionaryPanelMode: ref<"create" | "detail" | "edit">("detail"),
      formFields: ref([]),
      formValues: ref({}),
      panelDescription: ref("detail"),
      panelTitle: ref("Dictionary"),
      selectedDictionaryType: ref(null),
      selectedDictionaryTypeItems: ref([]),
      tableItems,
      dictionaryLoading,
    })

    expect(resolved?.kind).toBe("dictionary")
    expect(resolved?.loading).toBe(dictionaryLoading)
    expect(resolved?.errorMessage).toBe(dictionaryErrorMessage)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })

  test("provides the role workspace state for the role main surface", () => {
    const roleLoading = ref(false)
    const roleErrorMessage = ref("")
    const tableItems = ref([{ id: "role-1" }])

    const resolved = resolveProvidedWorkspaceState("role", null, null, {
      formFields: ref([]),
      formValues: ref({}),
      panelDescription: ref("detail"),
      panelTitle: ref("Role"),
      roleDetailErrorMessage: ref(""),
      roleDetailLoading: ref(false),
      roleErrorMessage,
      rolePanelMode: ref<"create" | "detail" | "edit">("detail"),
      selectedRole: ref(null),
      selectedRoleDetail: ref(null),
      tableItems,
      roleLoading,
    })

    expect(resolved?.kind).toBe("role")
    expect(resolved?.loading).toBe(roleLoading)
    expect(resolved?.errorMessage).toBe(roleErrorMessage)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })

  test("provides the post workspace state for the post surfaces", () => {
    const postLoading = ref(false)
    const postErrorMessage = ref("")
    const tableItems = ref([{ id: "post-1" }])

    const resolved = resolveProvidedWorkspaceState("post", null, null, null, {
      formFields: ref([]),
      formValues: ref({}),
      panelDescription: ref("detail"),
      panelTitle: ref("Post"),
      postDetailErrorMessage: ref(""),
      postDetailLoading: ref(false),
      postErrorMessage,
      postLoading,
      postPanelMode: ref<"create" | "detail" | "edit">("detail"),
      selectedPost: ref(null),
      tableItems,
    })

    expect(resolved?.kind).toBe("post")
    expect(resolved?.loading).toBe(postLoading)
    expect(resolved?.errorMessage).toBe(postErrorMessage)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })

  test("provides the menu workspace state for the menu surfaces", () => {
    const menuLoading = ref(false)
    const menuErrorMessage = ref("")
    const tableItems = ref([{ id: "menu-1" }])

    const resolved = resolveProvidedWorkspaceState(
      "menu",
      null,
      null,
      null,
      null,
      {
        formFields: ref([]),
        formValues: ref({}),
        menuDetailErrorMessage: ref(""),
        menuDetailLoading: ref(false),
        menuErrorMessage,
        menuLoading,
        menuPanelMode: ref<"create" | "detail" | "edit">("detail"),
        panelDescription: ref("detail"),
        panelTitle: ref("Menu"),
        parentLookup: ref(new Map()),
        selectedMenu: ref(null),
        selectedMenuDetail: ref(null),
        tableItems,
      },
    )

    expect(resolved?.kind).toBe("menu")
    expect(resolved?.loading).toBe(menuLoading)
    expect(resolved?.errorMessage).toBe(menuErrorMessage)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })

  test("provides the department workspace state for the department surfaces", () => {
    const departmentLoading = ref(false)
    const departmentErrorMessage = ref("")
    const tableItems = ref([{ id: "department-1" }])

    const resolved = resolveProvidedWorkspaceState(
      "department",
      null,
      null,
      null,
      null,
      null,
      {
        departmentDetailErrorMessage: ref(""),
        departmentDetailLoading: ref(false),
        departmentErrorMessage,
        departmentLoading,
        departmentPanelMode: ref<"create" | "detail" | "edit">("detail"),
        formFields: ref([]),
        formValues: ref({}),
        panelDescription: ref("detail"),
        panelTitle: ref("Department"),
        parentLookup: ref(new Map()),
        selectedDepartment: ref(null),
        selectedDepartmentDetail: ref(null),
        tableItems,
      },
    )

    expect(resolved?.kind).toBe("department")
    expect(resolved?.loading).toBe(departmentLoading)
    expect(resolved?.errorMessage).toBe(departmentErrorMessage)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })

  test("provides the notification workspace state for the notification surfaces", () => {
    const notificationLoading = ref(false)
    const notificationErrorMessage = ref("")
    const tableItems = ref([{ id: "notification-1" }])

    const resolved = resolveProvidedWorkspaceState(
      "notification",
      null,
      null,
      null,
      null,
      null,
      null,
      {
        formFields: ref([]),
        formValues: ref({}),
        notificationDetailErrorMessage: ref(""),
        notificationDetailLoading: ref(false),
        notificationErrorMessage,
        notificationLoading,
        notificationPanelMode: ref<"create" | "detail">("detail"),
        panelDescription: ref("detail"),
        panelTitle: ref("Notification"),
        selectedNotification: ref(null),
        tableItems,
      },
    )

    expect(resolved?.kind).toBe("notification")
    expect(resolved?.loading).toBe(notificationLoading)
    expect(resolved?.errorMessage).toBe(notificationErrorMessage)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })

  test("provides the setting workspace state for the setting surfaces", () => {
    const settingLoading = ref(false)
    const settingErrorMessage = ref("")
    const tableItems = ref([{ id: "setting-1" }])

    const resolved = resolveProvidedWorkspaceState(
      "setting",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      {
        formFields: ref([]),
        formValues: ref({}),
        panelDescription: ref("detail"),
        panelTitle: ref("Setting"),
        selectedSetting: ref(null),
        settingDetailErrorMessage: ref(""),
        settingDetailLoading: ref(false),
        settingErrorMessage,
        settingLoading,
        settingPanelMode: ref<"create" | "detail" | "edit">("detail"),
        tableItems,
      },
    )

    expect(resolved?.kind).toBe("setting")
    expect(resolved?.loading).toBe(settingLoading)
    expect(resolved?.errorMessage).toBe(settingErrorMessage)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })

  test("provides the tenant workspace state for the tenant surfaces", () => {
    const tenantLoading = ref(false)
    const tenantErrorMessage = ref("")
    const tableItems = ref([{ id: "tenant-1" }])

    const resolved = resolveProvidedWorkspaceState(
      "tenant",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      {
        formFields: ref([]),
        formValues: ref({}),
        panelDescription: ref("detail"),
        panelTitle: ref("Tenant"),
        selectedTenant: ref(null),
        tableItems,
        tenantDetailErrorMessage: ref(""),
        tenantDetailLoading: ref(false),
        tenantErrorMessage,
        tenantLoading,
        tenantPanelMode: ref<"create" | "detail" | "edit">("detail"),
      },
    )

    expect(resolved?.kind).toBe("tenant")
    expect(resolved?.loading).toBe(tenantLoading)
    expect(resolved?.errorMessage).toBe(tenantErrorMessage)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })

  test("provides the user workspace state for the user surfaces", () => {
    const userLoading = ref(false)
    const userErrorMessage = ref("")
    const tableItems = ref([{ id: "user-1" }])

    const resolved = resolveProvidedWorkspaceState(
      "user",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      {
        formFields: ref([]),
        formValues: ref({}),
        panelDescription: ref("detail"),
        panelTitle: ref("User"),
        selectedUser: ref(null),
        tableItems,
        userErrorMessage,
        userLoading,
        userPanelMode: ref<"create" | "detail" | "edit" | "reset">("detail"),
      },
    )

    expect(resolved?.kind).toBe("user")
    expect(resolved?.loading).toBe(userLoading)
    expect(resolved?.errorMessage).toBe(userErrorMessage)
    expect(
      (resolved?.state as { tableItems: typeof tableItems }).tableItems,
    ).toBe(tableItems)
  })
})
