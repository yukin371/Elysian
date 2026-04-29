import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref, watch } from "vue"

import {
  type CustomerListSortValue,
  buildCustomerListQuery,
  createCustomerTableItems,
  createDefaultCustomerDraft,
  isCustomerListSortValue,
  normalizeCustomerName,
  normalizeCustomerStatus,
  resolveCustomerSelection,
} from "../lib/customer-workspace"
import {
  type CustomerRecord,
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
} from "../lib/platform-api"

type CustomerPageColumn = {
  key: string
  label?: string
  width?: string
} & Record<string, unknown>

type CustomerPageAction = {
  key: string
  label: string
} & Record<string, unknown>

interface CustomerPageContract {
  tableColumns: ComputedRef<CustomerPageColumn[]>
  tableActions: ComputedRef<CustomerPageAction[]>
  queryFields: ComputedRef<ElyQueryField[]>
  formFields: ComputedRef<ElyFormField[]>
}

interface UseCustomerWorkspaceOptions {
  currentShellTabKey: Ref<string>
  page: CustomerPageContract
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeFieldLabel: (fieldKey: string) => string
  localizeStatus: (status: CustomerRecord["status"]) => string
  localizeActionLabel: (actionKey: string, fallback: string) => string
  canView: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  canDelete: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

type CustomerFormValues = Record<string, unknown>

export const useCustomerWorkspace = (options: UseCustomerWorkspaceOptions) => {
  const customerItems = ref<CustomerRecord[]>([])
  const customerLoading = ref(false)
  const customerErrorMessage = ref("")
  const customerCreateForm = ref(createDefaultCustomerDraft())
  const customerEditForm = ref(createDefaultCustomerDraft())
  const editingCustomerId = ref<string | null>(null)
  const deleteConfirmId = ref<string | null>(null)
  const selectedCustomerId = ref<string | null>(null)
  const customerFormMode = ref<"create" | "detail" | "edit">("create")
  const customerQueryValues = ref<ElyQueryValues>({})
  const customerListPage = ref(1)
  const customerListPageSize = ref(20)
  const customerListSortValue = ref<CustomerListSortValue>("createdAt:desc")
  const customerPageInputValue = ref("1")
  const customerListTotal = ref(0)
  const customerListTotalPages = ref(1)

  watch(
    customerListPage,
    (page) => {
      customerPageInputValue.value = String(page)
    },
    {
      immediate: true,
    },
  )

  const selectedCustomer = computed(
    () =>
      customerItems.value.find(
        (customer: CustomerRecord) => customer.id === selectedCustomerId.value,
      ) ?? null,
  )

  const localizeSelectOptions = (
    fieldOptions?: Array<{ label: string; value: string }>,
  ) =>
    fieldOptions?.map((option) => ({
      ...option,
      label:
        option.value === "active" || option.value === "inactive"
          ? options.localizeStatus(option.value)
          : option.label,
    }))

  const tableColumns = computed(() =>
    options.page.tableColumns.value.map((column) => ({
      ...column,
      label: options.localizeFieldLabel(column.key),
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

  const queryFields = computed(() =>
    options.page.queryFields.value.map((field) => ({
      ...field,
      label: options.localizeFieldLabel(field.key),
      options: localizeSelectOptions(field.options),
      placeholder:
        field.key === "name"
          ? options.t("app.customer.query.namePlaceholder")
          : field.key === "status"
            ? options.t("copy.query.statusPlaceholder")
            : field.placeholder,
    })),
  )

  const tableActions = computed(() =>
    options.page.tableActions.value
      .filter((action) => action.key !== "create")
      .map((action) => ({
        ...action,
        label: options.localizeActionLabel(action.key, action.label),
      })),
  )

  const tableItems = computed(() =>
    createCustomerTableItems(customerItems.value, {
      localizeStatus: options.localizeStatus,
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
    }),
  )

  const formFields = computed<ElyFormField[]>(() => {
    const baseFields = options.page.formFields.value.map((field) => ({
      ...field,
      label: options.localizeFieldLabel(field.key),
      options: localizeSelectOptions(field.options),
      placeholder:
        field.key === "status"
          ? options.t("copy.query.statusPlaceholder")
          : field.placeholder,
    }))

    if (customerFormMode.value !== "detail") {
      return baseFields
    }

    return [
      ...baseFields,
      {
        key: "createdAt",
        label: options.t("app.customer.field.createdAt"),
        input: "datetime",
        disabled: true,
      },
      {
        key: "updatedAt",
        label: options.t("app.customer.field.updatedAt"),
        input: "datetime",
        disabled: true,
      },
    ]
  })

  const formValues = computed<CustomerFormValues>(() => {
    if (customerFormMode.value === "edit") {
      return { ...customerEditForm.value }
    }

    if (customerFormMode.value === "detail" && selectedCustomer.value) {
      return {
        name: selectedCustomer.value.name,
        status: selectedCustomer.value.status,
        createdAt: selectedCustomer.value.createdAt,
        updatedAt: selectedCustomer.value.updatedAt,
      }
    }

    return { ...customerCreateForm.value }
  })

  const panelTitle = computed(() => {
    if (deleteConfirmId.value && selectedCustomer.value) {
      return options.t("app.panelTitle.delete", {
        name: selectedCustomer.value.name,
      })
    }

    if (customerFormMode.value === "edit") {
      return options.t("app.panelTitle.edit")
    }

    if (customerFormMode.value === "detail" && selectedCustomer.value) {
      return selectedCustomer.value.name
    }

    return options.t("app.panelTitle.create")
  })

  const panelDescription = computed(() => {
    if (deleteConfirmId.value && selectedCustomer.value) {
      return options.t("app.panelDesc.delete")
    }

    if (customerFormMode.value === "edit") {
      return options.t("app.panelDesc.edit")
    }

    if (customerFormMode.value === "detail" && selectedCustomer.value) {
      return options.t("app.panelDesc.detail")
    }

    return options.t("app.panelDesc.create")
  })

  const customerCountLabel = computed(() =>
    options.t("app.workspace.countLabel", {
      visible: customerItems.value.length,
      total: customerListTotal.value,
      page: customerListPage.value,
      totalPages: customerListTotalPages.value,
    }),
  )

  const canGoToPreviousCustomerPage = computed(() => customerListPage.value > 1)
  const canGoToNextCustomerPage = computed(
    () => customerListPage.value < customerListTotalPages.value,
  )
  const canJumpToCustomerPage = computed(() => {
    const nextPage = Number.parseInt(customerPageInputValue.value, 10)

    return (
      Number.isFinite(nextPage) &&
      nextPage >= 1 &&
      nextPage <= customerListTotalPages.value &&
      nextPage !== customerListPage.value
    )
  })

  const customerPaginationSummary = computed(() =>
    options.t("app.workspace.paginationSummary", {
      page: customerListPage.value,
      totalPages: customerListTotalPages.value,
      total: customerListTotal.value,
    }),
  )

  const customerPageSizeOptions = computed(() => [
    {
      label: options.t("app.workspace.paginationPageSize20"),
      value: 20,
    },
    {
      label: options.t("app.workspace.paginationPageSize50"),
      value: 50,
    },
    {
      label: options.t("app.workspace.paginationPageSize100"),
      value: 100,
    },
  ])

  const customerSortOptions = computed(() => [
    {
      label: options.t("app.workspace.paginationSortCreatedDesc"),
      value: "createdAt:desc",
    },
    {
      label: options.t("app.workspace.paginationSortCreatedAsc"),
      value: "createdAt:asc",
    },
    {
      label: options.t("app.workspace.paginationSortNameAsc"),
      value: "name:asc",
    },
    {
      label: options.t("app.workspace.paginationSortNameDesc"),
      value: "name:desc",
    },
  ])

  const customerQuerySummary = computed(() => {
    const fragments: string[] = []

    if (
      typeof customerQueryValues.value.name === "string" &&
      customerQueryValues.value.name.trim()
    ) {
      fragments.push(
        `${options.t("app.filter.name")}: ${customerQueryValues.value.name.trim()}`,
      )
    }

    if (
      typeof customerQueryValues.value.status === "string" &&
      customerQueryValues.value.status
    ) {
      fragments.push(
        `${options.t("app.filter.status")}: ${options.localizeStatus(
          customerQueryValues.value.status === "inactive"
            ? "inactive"
            : "active",
        )}`,
      )
    }

    fragments.push(
      `${options.t("app.filter.pageSize")}: ${customerListPageSize.value}`,
      `${options.t("app.filter.sort")}: ${customerSortOptions.value.find((option) => option.value === customerListSortValue.value)?.label ?? customerListSortValue.value}`,
    )

    return fragments.length > 0
      ? fragments.join(" / ")
      : options.t("app.filter.none")
  })

  const resetCustomerActions = () => {
    editingCustomerId.value = null
    deleteConfirmId.value = null
  }

  const resetCustomerForms = () => {
    customerCreateForm.value = createDefaultCustomerDraft()
    customerEditForm.value = createDefaultCustomerDraft()
  }

  const clearWorkspace = () => {
    customerItems.value = []
    customerErrorMessage.value = ""
    selectedCustomerId.value = null
    customerListPage.value = 1
    customerListTotal.value = 0
    customerListTotalPages.value = 1
    resetCustomerActions()
    resetCustomerForms()
    customerFormMode.value = "detail"
  }

  const openCreatePanel = () => {
    if (!options.canCreate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    resetCustomerActions()
    customerCreateForm.value = createDefaultCustomerDraft()
    selectedCustomerId.value = null
    customerFormMode.value = "create"
  }

  const focusCustomer = (customer: CustomerRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedCustomerId.value = customer.id
    resetCustomerActions()
    customerFormMode.value = "detail"
  }

  const reloadCustomers = async () => {
    if (!options.canView.value) {
      customerItems.value = []
      customerListPage.value = 1
      customerListTotal.value = 0
      customerListTotalPages.value = 1
      selectedCustomerId.value = null
      resetCustomerActions()

      customerFormMode.value = options.canCreate.value ? "create" : "detail"
      return
    }

    customerLoading.value = true
    customerErrorMessage.value = ""

    try {
      const payload = await fetchCustomers(
        buildCustomerListQuery(customerQueryValues.value, {
          page: customerListPage.value,
          pageSize: customerListPageSize.value,
          sortValue: customerListSortValue.value,
        }),
      )
      customerItems.value = payload.items
      customerListPage.value = payload.page
      customerListTotal.value = payload.total
      customerListTotalPages.value = payload.totalPages
      selectedCustomerId.value = resolveCustomerSelection(
        payload.items,
        selectedCustomerId.value,
      )

      if (payload.items.length === 0 && customerFormMode.value !== "create") {
        resetCustomerActions()
        selectedCustomerId.value = null
      }

      if (customerFormMode.value === "create" && !options.canCreate.value) {
        customerFormMode.value = "detail"
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      customerErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadCustomers")
    } finally {
      customerLoading.value = false
    }
  }

  const submitCreateForm = async (values: CustomerFormValues) => {
    if (customerLoading.value || !options.canCreate.value) {
      return
    }

    const payload = {
      name: normalizeCustomerName(values.name),
      status: normalizeCustomerStatus(values.status),
    }

    if (payload.name.length === 0) {
      customerErrorMessage.value = options.t("app.error.customerNameRequired")
      return
    }

    customerLoading.value = true
    customerErrorMessage.value = ""

    try {
      const created = await createCustomer(payload)
      customerCreateForm.value = createDefaultCustomerDraft()
      customerListPage.value = 1
      selectedCustomerId.value = created.id
      customerFormMode.value = "detail"
      await reloadCustomers()
    } catch (error) {
      customerErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.createCustomer")
    } finally {
      customerLoading.value = false
    }
  }

  const startEdit = (customer: CustomerRecord) => {
    if (!options.canUpdate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedCustomerId.value = customer.id
    deleteConfirmId.value = null
    editingCustomerId.value = customer.id
    customerEditForm.value = {
      name: customer.name,
      status: customer.status,
    }
    customerFormMode.value = "edit"
  }

  const cancelEdit = () => {
    editingCustomerId.value = null

    if (selectedCustomer.value) {
      customerFormMode.value = "detail"
    }
  }

  const submitEditForm = async (values: CustomerFormValues) => {
    if (
      !editingCustomerId.value ||
      customerLoading.value ||
      !options.canUpdate.value
    ) {
      return
    }

    const payload = {
      name: normalizeCustomerName(values.name),
      status: normalizeCustomerStatus(values.status),
    }

    if (payload.name.length === 0) {
      customerErrorMessage.value = options.t("app.error.customerNameRequired")
      return
    }

    customerLoading.value = true
    customerErrorMessage.value = ""

    try {
      const updated = await updateCustomer(editingCustomerId.value, payload)
      editingCustomerId.value = null
      selectedCustomerId.value = updated.id
      customerFormMode.value = "detail"
      await reloadCustomers()
    } catch (error) {
      customerErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.updateCustomer")
    } finally {
      customerLoading.value = false
    }
  }

  const requestDelete = (customer: CustomerRecord) => {
    if (!options.canDelete.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedCustomerId.value = customer.id
    editingCustomerId.value = null
    deleteConfirmId.value = customer.id
    customerFormMode.value = "detail"
  }

  const cancelDelete = () => {
    deleteConfirmId.value = null
  }

  const confirmDelete = async () => {
    if (
      !deleteConfirmId.value ||
      customerLoading.value ||
      !options.canDelete.value
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
        error instanceof Error
          ? error.message
          : options.t("app.error.deleteCustomer")
    } finally {
      customerLoading.value = false
    }
  }

  const handleSearch = async (values: ElyQueryValues) => {
    customerQueryValues.value = values
    customerListPage.value = 1
    await reloadCustomers()
  }

  const handleReset = async () => {
    customerQueryValues.value = {}
    customerListPage.value = 1
    await reloadCustomers()
  }

  const handlePageSizeChange = async (value: number | string) => {
    const nextPageSize =
      typeof value === "number" ? value : Number.parseInt(value, 10)

    if (
      !Number.isFinite(nextPageSize) ||
      nextPageSize === customerListPageSize.value
    ) {
      return
    }

    customerListPageSize.value = nextPageSize
    customerListPage.value = 1
    await reloadCustomers()
  }

  const handleSortChange = async (value: string) => {
    if (!isCustomerListSortValue(value)) {
      return
    }

    if (value === customerListSortValue.value) {
      return
    }

    customerListSortValue.value = value
    customerListPage.value = 1
    await reloadCustomers()
  }

  const handleAction = (key: string, row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const customer = customerItems.value.find(
      (item: CustomerRecord) => item.id === rowId,
    )

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

  const handleRowClick = (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const customer = customerItems.value.find(
      (item: CustomerRecord) => item.id === rowId,
    )

    if (customer) {
      focusCustomer(customer)
    }
  }

  const goToPreviousCustomerPage = async () => {
    if (!canGoToPreviousCustomerPage.value || customerLoading.value) {
      return
    }

    customerListPage.value -= 1
    await reloadCustomers()
  }

  const goToNextCustomerPage = async () => {
    if (!canGoToNextCustomerPage.value || customerLoading.value) {
      return
    }

    customerListPage.value += 1
    await reloadCustomers()
  }

  const goToFirstCustomerPage = async () => {
    if (!canGoToPreviousCustomerPage.value || customerLoading.value) {
      return
    }

    customerListPage.value = 1
    await reloadCustomers()
  }

  const goToLastCustomerPage = async () => {
    if (!canGoToNextCustomerPage.value || customerLoading.value) {
      return
    }

    customerListPage.value = customerListTotalPages.value
    await reloadCustomers()
  }

  const submitCustomerPageJump = async () => {
    if (!canJumpToCustomerPage.value || customerLoading.value) {
      customerPageInputValue.value = String(customerListPage.value)
      return
    }

    customerListPage.value = Number.parseInt(customerPageInputValue.value, 10)
    await reloadCustomers()
  }

  const updateCustomerPageInput = (value: unknown) => {
    customerPageInputValue.value = String(value ?? "")
  }

  const handleFormSubmit = async (values: CustomerFormValues) => {
    if (customerFormMode.value === "edit") {
      await submitEditForm(values)
      return
    }

    await submitCreateForm(values)
  }

  const handleFormCancel = () => {
    if (customerFormMode.value === "edit") {
      cancelEdit()
      return
    }

    customerCreateForm.value = createDefaultCustomerDraft()
  }

  return {
    canGoToNextCustomerPage,
    canGoToPreviousCustomerPage,
    canJumpToCustomerPage,
    cancelDelete,
    clearWorkspace,
    confirmDelete,
    customerCountLabel,
    customerErrorMessage,
    customerFormMode,
    customerItems,
    customerListPage,
    customerListPageSize,
    customerListSortValue,
    customerListTotal,
    customerListTotalPages,
    customerLoading,
    customerPageInputValue,
    customerPageSizeOptions,
    customerPaginationSummary,
    customerQuerySummary,
    customerQueryValues,
    customerSortOptions,
    deleteConfirmId,
    formFields,
    formValues,
    goToFirstCustomerPage,
    goToLastCustomerPage,
    goToNextCustomerPage,
    goToPreviousCustomerPage,
    handleAction,
    handleFormCancel,
    handleFormSubmit,
    handlePageSizeChange,
    handleReset,
    handleRowClick,
    handleSearch,
    handleSortChange,
    openCreatePanel,
    panelDescription,
    panelTitle,
    queryFields,
    reloadCustomers,
    requestDelete,
    selectedCustomer,
    selectedCustomerId,
    startEdit,
    submitCustomerPageJump,
    tableActions,
    tableColumns,
    tableItems,
    updateCustomerPageInput,
  }
}
