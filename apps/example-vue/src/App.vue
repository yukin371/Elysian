<script setup lang="ts">
import {
  applyCrudDictionaryOptions,
  buildCrudDictionaryOptionCatalog,
  buildVueNavigation,
  customerWorkspacePageDefinition,
  getCrudPageDictionaryTypeCodes,
  usePermissions,
  vueCustomPresetManifest,
} from "@elysian/frontend-vue"
import type { UiNavigationNode } from "@elysian/ui-core"
import {
  ElyCrudWorkspace,
  ElyForm,
  type ElyFormField,
  type ElyFormValues,
  type ElyQueryValues,
  ElyShell,
  type ElyShellStat,
  type ElyShellTab,
  type ElyShellUserSummary,
  useElyCrudPage,
  vueEnterprisePresetFoundation,
  vueEnterprisePresetManifest,
} from "@elysian/ui-enterprise-vue"
import { computed, onMounted, ref, watch } from "vue"

import {
  type AuthIdentityResponse,
  type CustomerRecord,
  type PlatformResponse,
  clearAccessToken,
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  fetchDictionaryItems,
  fetchDictionaryTypes,
  fetchPlatform,
  fetchSystemModules,
  login,
  logout,
  refreshAuth,
  updateCustomer,
} from "./lib/platform-api"

const customerPageDefinition = customerWorkspacePageDefinition

const enterpriseFallbackNavigation: UiNavigationNode[] = [
  {
    id: "enterprise-system",
    parentId: null,
    type: "directory",
    code: "system-root",
    name: "System",
    path: null,
    component: null,
    icon: "settings",
    sort: 10,
    isVisible: true,
    status: "active",
    permissionCode: null,
    depth: 0,
    children: [
      {
        id: "enterprise-users",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-users",
        name: "Users",
        path: "/system/users",
        component: "system/users/index",
        icon: "users",
        sort: 10,
        isVisible: true,
        status: "active",
        permissionCode: "system:user:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-roles",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-roles",
        name: "Roles",
        path: "/system/roles",
        component: "system/roles/index",
        icon: "shield",
        sort: 20,
        isVisible: true,
        status: "active",
        permissionCode: "system:role:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-menus",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-menus",
        name: "Menus",
        path: "/system/menus",
        component: "system/menus/index",
        icon: "menu",
        sort: 30,
        isVisible: true,
        status: "active",
        permissionCode: "system:menu:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-departments",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-departments",
        name: "Departments",
        path: "/system/departments",
        component: "system/departments/index",
        icon: "apartment",
        sort: 40,
        isVisible: true,
        status: "active",
        permissionCode: "system:department:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-dictionaries",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-dictionaries",
        name: "Dictionaries",
        path: "/system/dictionaries",
        component: "system/dictionaries/index",
        icon: "book",
        sort: 50,
        isVisible: true,
        status: "active",
        permissionCode: "system:dictionary:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-settings",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-settings",
        name: "Settings",
        path: "/system/settings",
        component: "system/settings/index",
        icon: "tool",
        sort: 60,
        isVisible: true,
        status: "active",
        permissionCode: "system:setting:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-operation-logs",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-operation-logs",
        name: "Operation Logs",
        path: "/system/operation-logs",
        component: "system/operation-logs/index",
        icon: "file",
        sort: 70,
        isVisible: true,
        status: "active",
        permissionCode: "system:operation-log:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-files",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-files",
        name: "Files",
        path: "/system/files",
        component: "system/files/index",
        icon: "attachment",
        sort: 80,
        isVisible: true,
        status: "active",
        permissionCode: "system:file:list",
        depth: 1,
        children: [],
      },
      {
        id: "enterprise-notifications",
        parentId: "enterprise-system",
        type: "menu",
        code: "system-notifications",
        name: "Notifications",
        path: "/system/notifications",
        component: "system/notifications/index",
        icon: "notification",
        sort: 90,
        isVisible: true,
        status: "active",
        permissionCode: "system:notification:list",
        depth: 1,
        children: [],
      },
    ],
  },
  {
    id: "enterprise-customer",
    parentId: null,
    type: "menu",
    code: "customer-list",
    name: "Customers",
    path: "/customers",
    component: "customer/index",
    icon: "storage",
    sort: 20,
    isVisible: true,
    status: "active",
    permissionCode: "customer:customer:list",
    depth: 0,
    children: [],
  },
]

const flattenNavigation = (items: UiNavigationNode[]): UiNavigationNode[] =>
  items.flatMap((item) => [item, ...flattenNavigation(item.children)])

const createDefaultCustomerDraft = () => ({
  name: "",
  status: "active" as CustomerRecord["status"],
})

const normalizeCustomerName = (value: unknown) => String(value ?? "").trim()
const normalizeCustomerStatus = (value: unknown): CustomerRecord["status"] =>
  value === "inactive" ? "inactive" : "active"

const platform = ref<PlatformResponse | null>(null)
const authIdentity = ref<AuthIdentityResponse | null>(null)
const customerItems = ref<CustomerRecord[]>([])
const loading = ref(true)
const authLoading = ref(false)
const customerLoading = ref(false)
const errorMessage = ref("")
const authErrorMessage = ref("")
const customerErrorMessage = ref("")
const authModuleReady = ref(false)
const customerModuleReady = ref(false)
const dictionaryModuleReady = ref(false)
const envName = ref("unknown")
const demoAdminPassword = ["admin", "123"].join("")

const loginForm = ref({
  username: "admin",
  password: demoAdminPassword,
})

const customerForm = ref(createDefaultCustomerDraft())
const editForm = ref(createDefaultCustomerDraft())
const editingId = ref<string | null>(null)
const deleteConfirmId = ref<string | null>(null)
const selectedCustomerId = ref<string | null>(null)
const enterpriseFormMode = ref<"create" | "detail" | "edit">("create")
const enterpriseQueryValues = ref<ElyQueryValues>({})
const dictionaryTypes = ref<
  Awaited<ReturnType<typeof fetchDictionaryTypes>>["items"]
>([])
const dictionaryItems = ref<
  Awaited<ReturnType<typeof fetchDictionaryItems>>["items"]
>([])

const isAuthenticated = computed(() => authIdentity.value !== null)
const permissionCodes = computed(
  () => authIdentity.value?.permissionCodes ?? [],
)
const visiblePermissionCodes = computed(() =>
  permissionCodes.value.slice(0, 10),
)
const hiddenPermissionCount = computed(() =>
  Math.max(
    permissionCodes.value.length - visiblePermissionCodes.value.length,
    0,
  ),
)

const navigationTree = computed(() =>
  authIdentity.value
    ? buildVueNavigation(
        authIdentity.value.menus,
        authIdentity.value.permissionCodes,
      )
    : [],
)

const navigationItemCount = computed(
  () => flattenNavigation(navigationTree.value).length,
)

const enterpriseNavigation = computed(() =>
  navigationTree.value.length > 0
    ? navigationTree.value
    : enterpriseFallbackNavigation,
)

const enterpriseSelectedMenuKey = computed(
  () =>
    flattenNavigation(enterpriseNavigation.value).find(
      (item) => item.path === "/customers",
    )?.id ??
    enterpriseNavigation.value[0]?.id ??
    null,
)

const customerPermissions = usePermissions(
  permissionCodes,
  {
    list: "customer:customer:list",
    create: "customer:customer:create",
    update: "customer:customer:update",
    delete: "customer:customer:delete",
  },
  authModuleReady,
)

const canEnterCustomerWorkspace = computed(
  () =>
    customerModuleReady.value &&
    (!authModuleReady.value || isAuthenticated.value),
)

const canViewCustomers = computed(
  () => canEnterCustomerWorkspace.value && customerPermissions.list.value,
)

const canCreateCustomers = computed(
  () => canEnterCustomerWorkspace.value && customerPermissions.create.value,
)

const canUpdateCustomers = computed(
  () => canEnterCustomerWorkspace.value && customerPermissions.update.value,
)

const canDeleteCustomers = computed(
  () => canEnterCustomerWorkspace.value && customerPermissions.delete.value,
)

const canViewDictionaries = computed(
  () =>
    dictionaryModuleReady.value &&
    (!authModuleReady.value ||
      permissionCodes.value.includes("system:dictionary:list")),
)

const dictionaryOptionCatalog = computed(() =>
  buildCrudDictionaryOptionCatalog(
    dictionaryTypes.value,
    dictionaryItems.value,
  ),
)

const resolvedCustomerPageDefinition = computed(() =>
  applyCrudDictionaryOptions(
    customerPageDefinition,
    dictionaryOptionCatalog.value,
  ),
)

const customerDictionaryTypeCodes = getCrudPageDictionaryTypeCodes(
  customerPageDefinition,
)

const enterpriseCustomerPage = useElyCrudPage(
  resolvedCustomerPageDefinition,
  permissionCodes,
)

const filteredCustomerItems = computed(() => {
  const nameQuery =
    typeof enterpriseQueryValues.value.name === "string"
      ? enterpriseQueryValues.value.name.trim().toLowerCase()
      : ""
  const statusQuery =
    typeof enterpriseQueryValues.value.status === "string"
      ? enterpriseQueryValues.value.status
      : ""

  return customerItems.value.filter((customer) => {
    const matchesName =
      nameQuery.length === 0 ||
      customer.name.toLowerCase().includes(nameQuery) ||
      customer.id.toLowerCase().includes(nameQuery)
    const matchesStatus =
      statusQuery.length === 0 || customer.status === statusQuery

    return matchesName && matchesStatus
  })
})

const selectedCustomer = computed(
  () =>
    customerItems.value.find(
      (customer) => customer.id === selectedCustomerId.value,
    ) ?? null,
)

const enterpriseTableColumns = computed(() =>
  enterpriseCustomerPage.tableColumns.value.map((column) => ({
    ...column,
    width:
      column.key === "id"
        ? "240"
        : column.key === "status"
          ? "120"
          : column.key.endsWith("At")
            ? "200"
            : undefined,
  })),
)

const enterpriseQueryFields = computed(() =>
  enterpriseCustomerPage.queryFields.value.map((field) => ({
    ...field,
    placeholder:
      field.key === "name" ? "Search by name or id" : field.placeholder,
  })),
)

const enterpriseTableActions = computed(() =>
  enterpriseCustomerPage.tableActions.value.filter(
    (action) => action.key !== "create",
  ),
)

const enterpriseTableItems = computed(() =>
  filteredCustomerItems.value.map((customer) => ({
    ...customer,
    createdAt: new Date(customer.createdAt).toLocaleString(),
    updatedAt: new Date(customer.updatedAt).toLocaleString(),
  })),
)

const enterpriseFormFields = computed<ElyFormField[]>(() => {
  const baseFields = enterpriseCustomerPage.formFields.value

  if (enterpriseFormMode.value !== "detail") {
    return baseFields
  }

  return [
    ...baseFields,
    {
      key: "createdAt",
      label: "Created At",
      input: "datetime",
      disabled: true,
    },
    {
      key: "updatedAt",
      label: "Updated At",
      input: "datetime",
      disabled: true,
    },
  ]
})

const enterpriseFormValues = computed<ElyFormValues>(() => {
  if (enterpriseFormMode.value === "edit") {
    return { ...editForm.value }
  }

  if (enterpriseFormMode.value === "detail" && selectedCustomer.value) {
    return {
      name: selectedCustomer.value.name,
      status: selectedCustomer.value.status,
      createdAt: selectedCustomer.value.createdAt,
      updatedAt: selectedCustomer.value.updatedAt,
    }
  }

  return { ...customerForm.value }
})

const enterprisePanelTitle = computed(() => {
  if (deleteConfirmId.value && selectedCustomer.value) {
    return `Delete ${selectedCustomer.value.name}`
  }

  if (enterpriseFormMode.value === "edit") {
    return "Edit customer"
  }

  if (enterpriseFormMode.value === "detail" && selectedCustomer.value) {
    return selectedCustomer.value.name
  }

  return "Create customer"
})

const enterprisePanelDescription = computed(() => {
  if (deleteConfirmId.value && selectedCustomer.value) {
    return "Deletion still goes through the canonical customer API. The preset only owns the view state."
  }

  if (enterpriseFormMode.value === "edit") {
    return "The edit form reuses the same schema-derived contract as the list page."
  }

  if (enterpriseFormMode.value === "detail" && selectedCustomer.value) {
    return "Readonly detail view proves the standard detail-page template without adding a second owner."
  }

  return "Create mode uses the same preset form wrapper that future generator output can target."
})

const enterpriseShellStats = computed<ElyShellStat[]>(() => [
  {
    key: "runtime",
    label: "Runtime",
    value: platform.value?.manifest.runtime ?? "bun-first",
    hint: "Shared platform runtime",
  },
  {
    key: "auth",
    label: "Auth",
    value: authModuleReady.value
      ? isAuthenticated.value
        ? "session live"
        : "signin required"
      : "offline",
    hint: "RBAC gate source",
  },
  {
    key: "navigation",
    label: "Navigation",
    value: `${navigationItemCount.value.toString().padStart(2, "0")} nodes`,
    hint: "Server-driven menu tree",
  },
  {
    key: "rows",
    label: "Rows",
    value: `${filteredCustomerItems.value.length}`,
    hint: "Current customer rows in scope",
  },
])

const enterpriseShellTabs = computed<ElyShellTab[]>(() => [
  {
    key: "workspace",
    label: "Workspace",
    hint: `${filteredCustomerItems.value.length} rows visible`,
  },
  {
    key: "form",
    label:
      enterpriseFormMode.value === "detail"
        ? "Detail"
        : enterpriseFormMode.value === "edit"
          ? "Edit"
          : "Create",
    hint:
      enterpriseFormMode.value === "detail"
        ? (selectedCustomer.value?.status ?? "selection")
        : "schema-driven form",
  },
  {
    key: "runtime",
    label: "Runtime",
    hint: authModuleReady.value ? "session-aware" : "preview mode",
  },
])

const enterpriseSelectedTabKey = computed(() =>
  enterpriseFormMode.value === "edit" ||
  (enterpriseFormMode.value === "create" && canCreateCustomers.value)
    ? "form"
    : "workspace",
)

const enterpriseShellUser = computed<ElyShellUserSummary | null>(() =>
  authIdentity.value
    ? {
        displayName: authIdentity.value.user.displayName,
        username: authIdentity.value.user.username,
        roles: authIdentity.value.roles,
      }
    : {
        displayName: "Preview Operator",
        username: "preview@elysian",
        roles: ["preset", "demo"],
      },
)

const customerCountLabel = computed(
  () => `${filteredCustomerItems.value.length} rows in scope`,
)

const authStatusLabel = computed(() => {
  if (!authModuleReady.value) return "offline"
  if (authLoading.value) return "checking"
  return isAuthenticated.value ? "authenticated" : "signin required"
})

const currentQuerySummary = computed(() => {
  const fragments: string[] = []

  if (
    typeof enterpriseQueryValues.value.name === "string" &&
    enterpriseQueryValues.value.name.trim()
  ) {
    fragments.push(`name: ${enterpriseQueryValues.value.name.trim()}`)
  }

  if (
    typeof enterpriseQueryValues.value.status === "string" &&
    enterpriseQueryValues.value.status
  ) {
    fragments.push(`status: ${enterpriseQueryValues.value.status}`)
  }

  return fragments.length > 0 ? fragments.join(" / ") : "No active filters"
})

watch(
  filteredCustomerItems,
  (items) => {
    if (
      enterpriseFormMode.value === "create" ||
      enterpriseFormMode.value === "edit"
    ) {
      return
    }

    if (items.length === 0) {
      selectedCustomerId.value = null
      if (canCreateCustomers.value) {
        enterpriseFormMode.value = "create"
      }
      return
    }

    if (
      !selectedCustomerId.value ||
      !items.some((item) => item.id === selectedCustomerId.value)
    ) {
      selectedCustomerId.value = items[0].id
    }
  },
  {
    immediate: true,
  },
)

const isRecoverableAuthError = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes("[AUTH_REFRESH_TOKEN_REQUIRED]") ||
    error.message.includes("[AUTH_REFRESH_TOKEN_INVALID]") ||
    error.message.includes("[AUTH_REFRESH_TOKEN_EXPIRED]") ||
    error.message.includes("[AUTH_ACCESS_TOKEN_REQUIRED]") ||
    error.message.includes("[AUTH_ACCESS_TOKEN_INVALID]"))

const resetCustomerActions = () => {
  editingId.value = null
  deleteConfirmId.value = null
}

const clearDictionaryOptions = () => {
  dictionaryTypes.value = []
  dictionaryItems.value = []
}

const openCreatePanel = () => {
  if (!canCreateCustomers.value) {
    return
  }

  resetCustomerActions()
  customerForm.value = createDefaultCustomerDraft()
  selectedCustomerId.value = null
  enterpriseFormMode.value = "create"
}

const focusCustomer = (customer: CustomerRecord) => {
  selectedCustomerId.value = customer.id
  resetCustomerActions()
  enterpriseFormMode.value = "detail"
}

const reloadDictionaryOptions = async () => {
  if (!canViewDictionaries.value || customerDictionaryTypeCodes.length === 0) {
    clearDictionaryOptions()
    return
  }

  try {
    const typePayload = await fetchDictionaryTypes()
    const relevantTypes = typePayload.items.filter((type) =>
      customerDictionaryTypeCodes.includes(type.code),
    )

    dictionaryTypes.value = relevantTypes

    if (relevantTypes.length === 0) {
      dictionaryItems.value = []
      return
    }

    const itemPayloads = await Promise.all(
      relevantTypes.map((type) => fetchDictionaryItems(type.id)),
    )

    dictionaryItems.value = itemPayloads.flatMap((payload) => payload.items)
  } catch (error) {
    clearDictionaryOptions()

    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }
  }
}

const restoreSession = async () => {
  if (!authModuleReady.value) {
    authIdentity.value = null
    authErrorMessage.value = ""
    return
  }

  authLoading.value = true
  authErrorMessage.value = ""

  try {
    authIdentity.value = await refreshAuth()
  } catch (error) {
    clearAccessToken()
    authIdentity.value = null

    if (!isRecoverableAuthError(error)) {
      authErrorMessage.value =
        error instanceof Error ? error.message : "Failed to restore session"
    }
  } finally {
    authLoading.value = false
  }
}

const reloadCustomers = async () => {
  if (!canViewCustomers.value) {
    customerItems.value = []
    selectedCustomerId.value = null
    resetCustomerActions()

    if (canCreateCustomers.value) {
      enterpriseFormMode.value = "create"
    }

    return
  }

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    const payload = await fetchCustomers()
    customerItems.value = payload.items

    if (enterpriseFormMode.value === "create" && !canCreateCustomers.value) {
      enterpriseFormMode.value = "detail"
    }
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      authIdentity.value = null
    }

    customerErrorMessage.value =
      error instanceof Error ? error.message : "Failed to load customers"
  } finally {
    customerLoading.value = false
  }
}

const submitLogin = async () => {
  if (!authModuleReady.value || authLoading.value) {
    return
  }

  authLoading.value = true
  authErrorMessage.value = ""

  try {
    authIdentity.value = await login(loginForm.value)
    await reloadDictionaryOptions()
    await reloadCustomers()
  } catch (error) {
    authIdentity.value = null
    authErrorMessage.value =
      error instanceof Error ? error.message : "Failed to sign in"
  } finally {
    authLoading.value = false
  }
}

const submitLogout = async () => {
  if (!authModuleReady.value || authLoading.value) {
    return
  }

  authLoading.value = true
  authErrorMessage.value = ""

  try {
    await logout()
  } catch (error) {
    authErrorMessage.value =
      error instanceof Error ? error.message : "Failed to sign out"
  } finally {
    authIdentity.value = null
    clearAccessToken()
    clearDictionaryOptions()
    customerItems.value = []
    selectedCustomerId.value = null
    enterpriseFormMode.value = "create"
    resetCustomerActions()
    authLoading.value = false
  }
}

const submitCustomerForm = async (values: ElyFormValues) => {
  if (!canCreateCustomers.value || customerLoading.value) {
    return
  }

  const payload = {
    name: normalizeCustomerName(values.name),
    status: normalizeCustomerStatus(values.status),
  }

  if (payload.name.length === 0) {
    customerErrorMessage.value = "Customer name is required"
    return
  }

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    const created = await createCustomer(payload)
    customerForm.value = createDefaultCustomerDraft()
    selectedCustomerId.value = created.id
    enterpriseFormMode.value = "detail"
    await reloadCustomers()
  } catch (error) {
    customerErrorMessage.value =
      error instanceof Error ? error.message : "Failed to create customer"
  } finally {
    customerLoading.value = false
  }
}

const startEdit = (customer: CustomerRecord) => {
  if (!canUpdateCustomers.value) {
    return
  }

  selectedCustomerId.value = customer.id
  deleteConfirmId.value = null
  editingId.value = customer.id
  editForm.value = {
    name: customer.name,
    status: customer.status,
  }
  enterpriseFormMode.value = "edit"
}

const cancelEdit = () => {
  editingId.value = null
  if (selectedCustomer.value) {
    enterpriseFormMode.value = "detail"
  }
}

const submitEditForm = async (values: ElyFormValues) => {
  if (!editingId.value || customerLoading.value || !canUpdateCustomers.value) {
    return
  }

  const payload = {
    name: normalizeCustomerName(values.name),
    status: normalizeCustomerStatus(values.status),
  }

  if (payload.name.length === 0) {
    customerErrorMessage.value = "Customer name is required"
    return
  }

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    const updated = await updateCustomer(editingId.value, payload)
    editingId.value = null
    selectedCustomerId.value = updated.id
    enterpriseFormMode.value = "detail"
    await reloadCustomers()
  } catch (error) {
    customerErrorMessage.value =
      error instanceof Error ? error.message : "Failed to update customer"
  } finally {
    customerLoading.value = false
  }
}

const requestDelete = (customer: CustomerRecord) => {
  if (!canDeleteCustomers.value) {
    return
  }

  selectedCustomerId.value = customer.id
  editingId.value = null
  deleteConfirmId.value = customer.id
  enterpriseFormMode.value = "detail"
}

const cancelDelete = () => {
  deleteConfirmId.value = null
}

const confirmDelete = async () => {
  if (
    !deleteConfirmId.value ||
    customerLoading.value ||
    !canDeleteCustomers.value
  ) {
    return
  }

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    await deleteCustomer(deleteConfirmId.value)
    if (selectedCustomerId.value === deleteConfirmId.value) {
      selectedCustomerId.value = null
    }
    deleteConfirmId.value = null
    await reloadCustomers()
  } catch (error) {
    customerErrorMessage.value =
      error instanceof Error ? error.message : "Failed to delete customer"
  } finally {
    customerLoading.value = false
  }
}

const handleEnterpriseSearch = (values: ElyQueryValues) => {
  enterpriseQueryValues.value = values
}

const handleEnterpriseReset = () => {
  enterpriseQueryValues.value = {}
}

const handleEnterpriseAction = (key: string, row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const customer = customerItems.value.find((item) => item.id === rowId)

  if (!customer) {
    return
  }

  if (key === "update") {
    startEdit(customer)
    return
  }

  if (key === "delete") {
    requestDelete(customer)
  }
}

const handleEnterpriseRowClick = (row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const customer = customerItems.value.find((item) => item.id === rowId)

  if (customer) {
    focusCustomer(customer)
  }
}

const handleEnterpriseFormSubmit = async (values: ElyFormValues) => {
  if (enterpriseFormMode.value === "edit") {
    await submitEditForm(values)
    return
  }

  await submitCustomerForm(values)
}

const handleEnterpriseFormCancel = () => {
  if (enterpriseFormMode.value === "edit") {
    cancelEdit()
    return
  }

  customerForm.value = createDefaultCustomerDraft()
}

onMounted(async () => {
  try {
    const [platformPayload, modulePayload] = await Promise.all([
      fetchPlatform(),
      fetchSystemModules(),
    ])

    platform.value = platformPayload
    envName.value = modulePayload.env
    authModuleReady.value = modulePayload.modules.includes("auth")
    customerModuleReady.value = modulePayload.modules.includes("customer")
    dictionaryModuleReady.value = modulePayload.modules.includes("dictionary")

    await restoreSession()
    await reloadDictionaryOptions()

    if (customerModuleReady.value) {
      if (authModuleReady.value) {
        enterpriseFormMode.value = "detail"
      } else {
        enterpriseFormMode.value = "create"
      }
    }

    await reloadCustomers()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to load platform view"
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="app-shell min-h-screen px-5 py-6 text-stone-100 sm:px-8 lg:px-10">
    <div class="mx-auto flex max-w-7xl flex-col gap-6">
      <section class="hero-panel overflow-hidden rounded-[2rem] px-6 py-8 lg:px-10">
        <div class="hero-grid grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p class="eyebrow text-cyan-300">Phase 3 Enterprise Finish</p>
            <h1 class="hero-title mt-4 max-w-3xl text-4xl leading-tight lg:text-6xl">
              One CRUD contract, now proven across custom and enterprise Vue surfaces.
            </h1>
            <p class="hero-copy mt-5 max-w-2xl text-base leading-8 text-stone-300">
              The example app keeps the original custom preset reference, but the
              working customer workspace below now runs through the official
              `ui-enterprise-vue` shell, query bar, table, and form wrappers.
            </p>

            <div class="mt-6 flex flex-wrap gap-3">
              <span class="token-pill">{{ vueCustomPresetManifest.displayName }}</span>
              <span class="token-pill token-pill-active">
                {{ vueEnterprisePresetManifest.displayName }}
              </span>
              <span class="token-pill">
                {{ vueEnterprisePresetFoundation.designSystem }}
              </span>
            </div>
          </div>

          <div class="hero-stats grid gap-4 sm:grid-cols-2">
            <article class="stat-card rounded-[1.75rem] p-5">
              <p class="stat-label">Runtime</p>
              <p class="stat-value">
                {{ platform?.manifest.runtime ?? "loading..." }}
              </p>
            </article>
            <article class="stat-card rounded-[1.75rem] p-5">
              <p class="stat-label">Enterprise Preset</p>
              <p class="stat-value">{{ vueEnterprisePresetManifest.status }}</p>
            </article>
            <article class="stat-card rounded-[1.75rem] p-5">
              <p class="stat-label">Auth</p>
              <p
                class="stat-value"
                :class="
                  authStatusLabel === 'authenticated'
                    ? 'text-emerald-300'
                    : authStatusLabel === 'offline'
                      ? 'text-amber-300'
                      : 'text-cyan-300'
                "
              >
                {{ authStatusLabel }}
              </p>
            </article>
            <article class="stat-card rounded-[1.75rem] p-5">
              <p class="stat-label">Visible Rows</p>
              <p class="stat-value">{{ filteredCustomerItems.length }}</p>
            </article>
          </div>
        </div>
      </section>

      <p v-if="loading" class="text-sm uppercase tracking-[0.28em] text-stone-400">
        Loading enterprise workspace...
      </p>
      <p
        v-else-if="errorMessage"
        class="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-5 text-rose-200"
      >
        {{ errorMessage }}
      </p>

      <template v-else>
        <section class="grid gap-6 xl:grid-cols-[0.82fr_1.48fr]">
          <aside class="flex flex-col gap-6">
            <section class="content-panel rounded-[2rem] p-6 lg:p-7">
              <div class="flex items-end justify-between gap-4">
                <div>
                  <p class="eyebrow text-emerald-300">Workspace Map</p>
                  <h2 class="mt-3 text-2xl text-white">Navigation shell</h2>
                </div>
                <div class="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-stone-300">
                  {{ navigationItemCount.toString().padStart(2, "0") }}
                </div>
              </div>

              <div
                v-if="!isAuthenticated"
                class="mt-6 rounded-[1.5rem] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-stone-300"
              >
                Sign in to receive the RBAC-driven menu tree. Until then, the
                enterprise shell falls back to a stable preview navigation.
              </div>

              <div v-else class="mt-6 space-y-3">
                <article
                  v-for="item in navigationTree"
                  :key="item.id"
                  class="nav-card rounded-[1.5rem] p-4"
                >
                  <div
                    class="nav-item"
                    :class="item.path === '/customers' ? 'nav-item-active' : ''"
                  >
                    <div>
                      <p class="text-sm font-semibold text-white">{{ item.name }}</p>
                      <p class="mt-1 text-xs uppercase tracking-[0.24em] text-stone-400">
                        {{ item.code }}
                      </p>
                    </div>
                    <span
                      class="rounded-full border border-white/10 px-2 py-1 text-[0.62rem] uppercase tracking-[0.2em] text-stone-300"
                    >
                      {{ item.type }}
                    </span>
                  </div>

                  <div
                    v-if="item.children.length > 0"
                    class="mt-3 space-y-2 border-l border-white/8 pl-3"
                  >
                    <div
                      v-for="child in item.children"
                      :key="child.id"
                      class="nav-item"
                      :class="child.path === '/customers' ? 'nav-item-active' : ''"
                    >
                      <div>
                        <p class="text-sm font-semibold text-white">{{ child.name }}</p>
                        <p class="mt-1 text-xs uppercase tracking-[0.24em] text-stone-400">
                          {{ child.path ?? child.code }}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <section class="content-panel rounded-[2rem] p-6 lg:p-7">
              <p class="eyebrow text-cyan-300">Schema Contract</p>
              <h2 class="mt-3 text-2xl text-white">{{ customerPageDefinition.title }}</h2>
              <p class="mt-3 text-sm leading-7 text-stone-300">
                The enterprise preset consumes the same `ui-core` page definition as
                the custom preset. This panel stays here to show the shared protocol
                rather than a duplicated page implementation.
              </p>

              <div class="mt-6">
                <p class="field-label">Columns</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="column in customerPageDefinition.columns"
                    :key="column.key"
                    class="token-pill"
                  >
                    {{ column.label }}
                  </span>
                </div>
              </div>

              <div class="mt-6">
                <p class="field-label">Actions</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="action in customerPageDefinition.actions"
                    :key="action.key"
                    class="token-pill"
                  >
                    {{ action.label }}
                  </span>
                </div>
              </div>
            </section>

            <section class="content-panel rounded-[2rem] p-6 lg:p-7">
              <p class="eyebrow text-fuchsia-300">Permission Snapshot</p>
              <h2 class="mt-3 text-2xl text-white">Action gates</h2>

              <div class="mt-6 flex flex-wrap gap-2">
                <span class="token-pill" :class="canViewCustomers ? 'token-pill-active' : ''">
                  list
                </span>
                <span class="token-pill" :class="canCreateCustomers ? 'token-pill-active' : ''">
                  create
                </span>
                <span class="token-pill" :class="canUpdateCustomers ? 'token-pill-active' : ''">
                  update
                </span>
                <span class="token-pill" :class="canDeleteCustomers ? 'token-pill-active' : ''">
                  delete
                </span>
              </div>

              <div class="mt-6">
                <p class="field-label">Granted codes</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="code in visiblePermissionCodes"
                    :key="code"
                    class="token-pill"
                  >
                    {{ code }}
                  </span>
                  <span v-if="hiddenPermissionCount > 0" class="token-pill">
                    +{{ hiddenPermissionCount }} more
                  </span>
                </div>
              </div>
            </section>
          </aside>

          <section class="content-panel rounded-[2rem] p-3 lg:p-4">
            <div class="px-3 py-4 lg:px-4">
              <p class="eyebrow text-amber-300">Enterprise Preset Workspace</p>
              <div class="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 class="text-3xl text-white">Arco-backed customer operations</h2>
                  <p class="mt-3 max-w-3xl text-sm leading-7 text-stone-300">
                    This is the first working `ui-enterprise-vue` workspace. The shell,
                    tabs, query bar, list template, form template, and readonly detail
                    panel all run from the same schema-driven contract path.
                  </p>
                </div>
                <div
                  class="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.28em] text-stone-300"
                >
                  {{ vueEnterprisePresetFoundation.designSystem }}
                </div>
              </div>
            </div>

            <ElyShell
              title="Elysian Enterprise"
              subtitle="Official Vue preset"
              workspace-title="Customer operations"
              workspace-description="A session-aware admin shell with schema-mapped CRUD templates and a reusable enterprise workspace contract."
              preset-label="Arco Design Vue"
              :environment="envName"
              :status="authModuleReady ? 'session-aware' : 'preview mode'"
              :navigation="enterpriseNavigation"
              :stats="enterpriseShellStats"
              :selected-menu-key="enterpriseSelectedMenuKey"
              :tabs="enterpriseShellTabs"
              :selected-tab-key="enterpriseSelectedTabKey"
              :user="enterpriseShellUser"
            >
              <template #header-actions>
                <button
                  type="button"
                  class="action-button-sm"
                  :disabled="!canCreateCustomers"
                  @click="openCreatePanel"
                >
                  New customer
                </button>
                <button
                  type="button"
                  class="action-button-sm"
                  :disabled="customerLoading || !canViewCustomers"
                  @click="reloadCustomers"
                >
                  Refresh
                </button>
                <button
                  v-if="isAuthenticated"
                  type="button"
                  class="action-button-sm action-button-ghost"
                  :disabled="authLoading"
                  @click="submitLogout"
                >
                  Sign out
                </button>
              </template>

              <template #workspace>
                <div
                  v-if="!customerModuleReady"
                  class="enterprise-message enterprise-message-warning"
                >
                  `customer` module is not registered yet. Add `DATABASE_URL`, run
                  migrations and seed, then restart the server.
                </div>

                <div
                  v-else-if="authModuleReady && !isAuthenticated"
                  class="enterprise-message enterprise-message-info"
                >
                  Sign in from the side panel to load protected customer data.
                </div>

                <div
                  v-else-if="canEnterCustomerWorkspace && !canViewCustomers"
                  class="enterprise-message enterprise-message-warning"
                >
                  This identity can enter the workspace but does not have
                  `customer:customer:list`.
                </div>

                <div
                  v-else-if="customerErrorMessage"
                  class="enterprise-message enterprise-message-danger"
                >
                  {{ customerErrorMessage }}
                </div>

                <ElyCrudWorkspace
                  v-else
                  eyebrow="Standard List Page"
                  title="Customer Register"
                  description="The table, actions, and query inputs are derived from the shared customer page definition and rendered through the enterprise wrapper."
                  :query-fields="enterpriseQueryFields"
                  :query-loading="customerLoading"
                  :table-columns="enterpriseTableColumns"
                  :items="enterpriseTableItems"
                  :table-loading="customerLoading"
                  :table-actions="enterpriseTableActions"
                  :item-count-label="customerCountLabel"
                  empty-title="No customers in scope"
                  empty-description="Adjust the filters or create a new customer from the side panel."
                  @search="handleEnterpriseSearch"
                  @reset="handleEnterpriseReset"
                  @action="handleEnterpriseAction"
                  @row-click="handleEnterpriseRowClick"
                >
                  <template #toolbar>
                    <span class="enterprise-toolbar-pill">
                      {{ currentQuerySummary }}
                    </span>
                  </template>

                  <template #footer>
                    <div class="enterprise-footer-note">
                      <span>Preset status</span>
                      <strong>{{ vueEnterprisePresetManifest.status }}</strong>
                      <p>
                        List, form, and detail modes are now wired through the same
                        preset owner instead of a preview skeleton.
                      </p>
                    </div>
                  </template>
                </ElyCrudWorkspace>
              </template>

              <template #secondary>
                <section class="enterprise-card">
                  <p class="enterprise-eyebrow">Standard Form / Detail</p>
                  <h3 class="enterprise-heading">{{ enterprisePanelTitle }}</h3>
                  <p class="enterprise-copy">{{ enterprisePanelDescription }}</p>

                  <div
                    v-if="!customerModuleReady"
                    class="enterprise-inline-warning"
                  >
                    Customer module is offline, so the standard form panel stays in
                    preview mode.
                  </div>

                  <div
                    v-else-if="authModuleReady && !isAuthenticated"
                    class="enterprise-inline-warning"
                  >
                    Sign in first to unlock the protected customer detail and edit
                    flows.
                  </div>

                  <div
                    v-else-if="deleteConfirmId && selectedCustomer"
                    class="enterprise-danger-zone"
                  >
                    <p>
                      Delete <strong>{{ selectedCustomer.name }}</strong> from the
                      customer registry?
                    </p>
                    <div class="enterprise-button-row">
                      <button
                        type="button"
                        class="enterprise-button enterprise-button-danger"
                        :disabled="customerLoading"
                        @click="confirmDelete"
                      >
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        class="enterprise-button enterprise-button-ghost"
                        @click="cancelDelete"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div
                    v-else-if="enterpriseFormMode === 'detail' && selectedCustomer"
                    class="enterprise-button-row"
                  >
                    <button
                      v-if="canUpdateCustomers"
                      type="button"
                      class="enterprise-button"
                      :disabled="customerLoading"
                      @click="startEdit(selectedCustomer)"
                    >
                      Edit customer
                    </button>
                    <button
                      v-if="canDeleteCustomers"
                      type="button"
                      class="enterprise-button enterprise-button-danger"
                      :disabled="customerLoading"
                      @click="requestDelete(selectedCustomer)"
                    >
                      Delete customer
                    </button>
                    <button
                      v-if="canCreateCustomers"
                      type="button"
                      class="enterprise-button enterprise-button-ghost"
                      @click="openCreatePanel"
                    >
                      New customer
                    </button>
                  </div>

                  <div
                    v-else-if="enterpriseFormMode === 'create' && !canCreateCustomers"
                    class="enterprise-inline-warning"
                  >
                    This role cannot create customers.
                  </div>

                  <div
                    v-if="
                      customerModuleReady &&
                      (!authModuleReady || isAuthenticated) &&
                      !(enterpriseFormMode === 'detail' && !selectedCustomer)
                    "
                  >
                    <ElyForm
                      class="mt-5"
                      :fields="enterpriseFormFields"
                      :values="enterpriseFormValues"
                      :readonly="enterpriseFormMode === 'detail'"
                      :loading="customerLoading"
                      @submit="handleEnterpriseFormSubmit"
                      @cancel="handleEnterpriseFormCancel"
                    />
                  </div>

                  <div
                    v-else-if="
                      customerModuleReady &&
                      (!authModuleReady || isAuthenticated) &&
                      enterpriseFormMode === 'detail' &&
                      !selectedCustomer
                    "
                    class="enterprise-inline-warning mt-5"
                  >
                    Select a customer row to inspect details, or create a new record
                    if the role allows it.
                  </div>
                </section>

                <section class="enterprise-card">
                  <p class="enterprise-eyebrow">Session Control</p>
                  <h3 class="enterprise-heading">
                    {{ authModuleReady ? "Access desk" : "Auth offline" }}
                  </h3>

                  <p v-if="!authModuleReady" class="enterprise-copy">
                    Auth is not registered on this server yet. Add `DATABASE_URL`, run
                    `bun run db:migrate` and seed, then restart the server.
                  </p>

                  <template v-else-if="isAuthenticated">
                    <p class="enterprise-copy">
                      Signed in as {{ authIdentity?.user.displayName }} /
                      {{ authIdentity?.user.username }}
                    </p>

                    <div class="enterprise-kpi-grid">
                      <article>
                        <span>Roles</span>
                        <strong>{{ authIdentity?.roles.join(", ") }}</strong>
                      </article>
                      <article>
                        <span>Permissions</span>
                        <strong>{{ permissionCodes.length }}</strong>
                      </article>
                    </div>

                    <button
                      type="button"
                      class="enterprise-button mt-5"
                      :disabled="authLoading"
                      @click="submitLogout"
                    >
                      {{ authLoading ? "Working..." : "Sign out" }}
                    </button>
                  </template>

                  <form v-else class="mt-5 space-y-4" @submit.prevent="submitLogin">
                    <label class="enterprise-field">
                      <span>Username</span>
                      <input
                        v-model="loginForm.username"
                        class="enterprise-input"
                        :disabled="authLoading"
                        placeholder="admin"
                      />
                    </label>

                    <label class="enterprise-field">
                      <span>Password</span>
                      <input
                        v-model="loginForm.password"
                        class="enterprise-input"
                        :disabled="authLoading"
                        type="password"
                        placeholder="admin123"
                      />
                    </label>

                    <button
                      type="submit"
                      class="enterprise-button"
                      :disabled="
                        authLoading ||
                        loginForm.username.trim().length === 0 ||
                        loginForm.password.trim().length === 0
                      "
                    >
                      {{ authLoading ? "Signing in..." : "Sign in" }}
                    </button>
                  </form>

                  <p
                    v-if="authErrorMessage"
                    class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                  >
                    {{ authErrorMessage }}
                  </p>
                </section>

                <section class="enterprise-card">
                  <p class="enterprise-eyebrow">Platform Capsule</p>
                  <h3 class="enterprise-heading">
                    {{ platform?.manifest.displayName }}
                  </h3>

                  <div class="enterprise-metadata">
                    <div>
                      <span>Version</span>
                      <strong>{{ platform?.manifest.version }}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong class="capitalize">{{ platform?.manifest.status }}</strong>
                    </div>
                    <div>
                      <span>Environment</span>
                      <strong>{{ envName }}</strong>
                    </div>
                  </div>

                  <div class="mt-5">
                    <p class="enterprise-subheading">Capabilities</p>
                    <ul class="enterprise-list">
                      <li
                        v-for="capability in platform?.capabilities ?? []"
                        :key="capability"
                      >
                        {{ capability }}
                      </li>
                    </ul>
                  </div>
                </section>
              </template>
            </ElyShell>
          </section>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.enterprise-card {
  border-radius: 22px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.82);
  padding: 1.2rem;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  color: #0f172a;
}

.enterprise-eyebrow,
.enterprise-subheading,
.enterprise-kpi-grid span,
.enterprise-metadata span {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-heading {
  margin: 0.7rem 0 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-copy {
  margin: 0.75rem 0 0;
  line-height: 1.75;
  color: #475569;
}

.enterprise-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.enterprise-button {
  border: 1px solid rgba(29, 78, 216, 0.14);
  border-radius: 999px;
  background: linear-gradient(135deg, #1d4ed8, #0f172a);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 0.65rem 1rem;
  text-transform: uppercase;
}

.enterprise-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.enterprise-button-ghost {
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
}

.enterprise-button-danger {
  background: linear-gradient(135deg, #dc2626, #7f1d1d);
}

.enterprise-field {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  color: #334155;
}

.enterprise-input {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: white;
  padding: 0.9rem 1rem;
  color: #0f172a;
  outline: none;
}

.enterprise-input:focus {
  border-color: rgba(29, 78, 216, 0.42);
}

.enterprise-kpi-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 1rem;
}

.enterprise-kpi-grid article,
.enterprise-metadata div {
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.92);
  padding: 0.85rem 0.95rem;
}

.enterprise-kpi-grid strong,
.enterprise-metadata strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
}

.enterprise-metadata {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.enterprise-list {
  margin: 0.8rem 0 0;
  padding-left: 1rem;
  color: #475569;
}

.enterprise-list li + li {
  margin-top: 0.45rem;
}

.enterprise-message {
  border-radius: 22px;
  padding: 1rem 1.1rem;
  line-height: 1.75;
}

.enterprise-message-info {
  border: 1px solid rgba(14, 165, 233, 0.18);
  background: rgba(14, 165, 233, 0.08);
  color: #0c4a6e;
}

.enterprise-message-warning {
  border: 1px solid rgba(245, 158, 11, 0.18);
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.enterprise-message-danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.08);
  color: #991b1b;
}

.enterprise-toolbar-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  padding: 0.45rem 0.85rem;
  font-size: 0.78rem;
  color: #475569;
}

.enterprise-footer-note {
  margin-top: 0.25rem;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.88);
  padding: 0.9rem 1rem;
}

.enterprise-footer-note span {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-footer-note strong {
  display: block;
  margin-top: 0.45rem;
  color: #0f172a;
}

.enterprise-footer-note p {
  margin: 0.6rem 0 0;
  color: #475569;
  line-height: 1.65;
}

.enterprise-danger-zone {
  margin-top: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(239, 68, 68, 0.16);
  background: rgba(254, 242, 242, 0.96);
  padding: 0.95rem 1rem;
  color: #991b1b;
}

.enterprise-inline-warning {
  margin-top: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(245, 158, 11, 0.16);
  background: rgba(255, 251, 235, 0.96);
  padding: 0.85rem 0.95rem;
  color: #92400e;
}

@media (max-width: 960px) {
  .enterprise-kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
