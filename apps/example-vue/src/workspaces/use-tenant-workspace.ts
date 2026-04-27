import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  type TenantRecord,
  createTenant,
  fetchTenantById,
  fetchTenants,
  updateTenant,
  updateTenantStatus,
} from "../lib/platform-api"
import {
  createDefaultTenantDraft,
  createTenantTableItems,
  filterTenants,
  normalizeTenantStatus,
  normalizeTenantText,
  resolveTenantSelection,
} from "../lib/tenant-workspace"

export type TenantPanelMode = "detail" | "create" | "edit"
type TenantFormValues = Record<string, unknown>

type TenantPageColumn = {
  key: string
  label?: string
  width?: string
} & Record<string, unknown>

interface TenantPageContract {
  tableColumns: ComputedRef<TenantPageColumn[]>
  queryFields: ComputedRef<ElyQueryField[]>
  formFields: ComputedRef<ElyFormField[]>
}

interface UseTenantWorkspaceOptions {
  currentShellTabKey: Ref<string>
  page: TenantPageContract
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeFieldLabel: (fieldKey: string) => string
  localizeStatus: (status: string) => string
  canView: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

export const useTenantWorkspace = (options: UseTenantWorkspaceOptions) => {
  const tenantItems = ref<TenantRecord[]>([])
  const tenantDetail = ref<TenantRecord | null>(null)
  const tenantLoading = ref(false)
  const tenantDetailLoading = ref(false)
  const tenantErrorMessage = ref("")
  const tenantDetailErrorMessage = ref("")
  const selectedTenantId = ref<string | null>(null)
  const tenantPanelMode = ref<TenantPanelMode>("detail")
  const tenantQueryValues = ref<ElyQueryValues>({})
  const tenantCreateForm = ref(createDefaultTenantDraft())
  const tenantEditForm = ref(createDefaultTenantDraft())

  const filteredTenantItems = computed(() =>
    filterTenants(tenantItems.value, {
      code:
        typeof tenantQueryValues.value.code === "string"
          ? tenantQueryValues.value.code
          : undefined,
      name:
        typeof tenantQueryValues.value.name === "string"
          ? tenantQueryValues.value.name
          : undefined,
      status:
        tenantQueryValues.value.status === "active" ||
        tenantQueryValues.value.status === "suspended"
          ? tenantQueryValues.value.status
          : "",
    }),
  )

  const selectedTenantListItem = computed(
    () =>
      tenantItems.value.find(
        (tenant) => tenant.id === selectedTenantId.value,
      ) ?? null,
  )

  const selectedTenant = computed(
    () =>
      (tenantDetail.value && tenantDetail.value.id === selectedTenantId.value
        ? tenantDetail.value
        : selectedTenantListItem.value) ?? null,
  )

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
      options:
        field.key === "status" && field.options
          ? field.options.map((option) => ({
              ...option,
              label: options.localizeStatus(option.value),
            }))
          : field.options,
      placeholder:
        field.key === "code"
          ? options.t("app.tenant.query.codePlaceholder")
          : field.key === "name"
            ? options.t("app.tenant.query.namePlaceholder")
            : field.key === "status"
              ? options.t("copy.query.statusPlaceholder")
              : field.placeholder,
    })),
  )

  const tableItems = computed(() =>
    createTenantTableItems(filteredTenantItems.value, {
      localizeStatus: options.localizeStatus,
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
    }),
  )

  const countLabel = computed(() =>
    options.t("app.tenant.countLabel", {
      visible: filteredTenantItems.value.length,
      total: tenantItems.value.length,
    }),
  )

  const formFields = computed<ElyFormField[]>(() => {
    const baseFields = options.page.formFields.value.map((field) => ({
      ...field,
      label: options.localizeFieldLabel(field.key),
      options:
        field.key === "status" && field.options
          ? field.options.map((option) => ({
              ...option,
              label: options.localizeStatus(option.value),
            }))
          : field.options,
      placeholder:
        field.key === "code"
          ? options.t("app.tenant.query.codePlaceholder")
          : field.key === "name"
            ? options.t("app.tenant.query.namePlaceholder")
            : field.key === "status"
              ? options.t("copy.query.statusPlaceholder")
              : field.placeholder,
    }))

    if (tenantPanelMode.value !== "detail") {
      return baseFields
    }

    return [
      ...baseFields,
      {
        key: "createdAt",
        label: options.t("app.tenant.field.createdAt"),
        input: "datetime",
        disabled: true,
      },
      {
        key: "updatedAt",
        label: options.t("app.tenant.field.updatedAt"),
        input: "datetime",
        disabled: true,
      },
    ]
  })

  const formValues = computed<TenantFormValues>(() => {
    if (tenantPanelMode.value === "edit") {
      return {
        ...tenantEditForm.value,
      }
    }

    if (tenantPanelMode.value === "detail" && selectedTenant.value) {
      return {
        code: selectedTenant.value.code,
        name: selectedTenant.value.name,
        status: selectedTenant.value.status,
        createdAt: selectedTenant.value.createdAt,
        updatedAt: selectedTenant.value.updatedAt,
      }
    }

    return {
      ...tenantCreateForm.value,
    }
  })

  const panelTitle = computed(() => {
    if (tenantPanelMode.value === "edit") {
      return options.t("app.tenant.panelTitle.edit")
    }

    if (tenantPanelMode.value === "create") {
      return options.t("app.tenant.panelTitle.create")
    }

    return (
      selectedTenant.value?.name ??
      options.t("app.tenant.panelTitle.detailFallback")
    )
  })

  const panelDescription = computed(() => {
    if (tenantPanelMode.value === "edit") {
      return options.t("app.tenant.panelDesc.edit")
    }

    if (tenantPanelMode.value === "create") {
      return options.t("app.tenant.panelDesc.create")
    }

    return selectedTenant.value
      ? options.t("app.tenant.panelDesc.detail")
      : options.t("app.tenant.detailEmptyDescription")
  })

  const resetPanelInputs = () => {
    tenantCreateForm.value = createDefaultTenantDraft()
    tenantEditForm.value = createDefaultTenantDraft()
  }

  const resetQuery = () => {
    tenantQueryValues.value = {}
  }

  const clearWorkspace = () => {
    tenantItems.value = []
    tenantDetail.value = null
    selectedTenantId.value = null
    tenantErrorMessage.value = ""
    tenantDetailErrorMessage.value = ""
    tenantPanelMode.value = "detail"
    resetPanelInputs()
  }

  const selectTenant = async (tenant: TenantRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedTenantId.value = tenant.id
    tenantPanelMode.value = "detail"
    tenantDetail.value = null
    tenantDetailLoading.value = true
    tenantDetailErrorMessage.value = ""

    try {
      tenantDetail.value = await fetchTenantById(tenant.id)
    } catch (error) {
      options.onRecoverableAuthError(error)
      tenantDetailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadTenantDetail")
    } finally {
      tenantDetailLoading.value = false
    }
  }

  const reloadTenants = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    tenantLoading.value = true
    tenantErrorMessage.value = ""

    try {
      const payload = await fetchTenants()
      tenantItems.value = payload.items
      selectedTenantId.value = resolveTenantSelection(
        payload.items,
        selectedTenantId.value,
      )

      if (payload.items.length === 0) {
        tenantDetail.value = null

        if (options.canCreate.value) {
          tenantPanelMode.value = "create"
        }

        return
      }

      if (tenantPanelMode.value !== "detail") {
        return
      }

      const nextTenant = payload.items.find(
        (item) => item.id === selectedTenantId.value,
      )

      if (nextTenant) {
        await selectTenant(nextTenant)
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkspace()
      tenantErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadTenants")
    } finally {
      tenantLoading.value = false
    }
  }

  const handleSearch = (values: ElyQueryValues) => {
    tenantQueryValues.value = values
  }

  const handleReset = () => {
    resetQuery()
  }

  const openCreatePanel = () => {
    if (!options.canCreate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedTenantId.value = null
    tenantDetail.value = null
    tenantErrorMessage.value = ""
    tenantDetailErrorMessage.value = ""
    resetPanelInputs()
    tenantPanelMode.value = "create"
  }

  const startEdit = (tenant: TenantRecord) => {
    if (!options.canUpdate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedTenantId.value = tenant.id
    tenantErrorMessage.value = ""
    tenantDetailErrorMessage.value = ""
    tenantEditForm.value = {
      code: tenant.code,
      name: tenant.name,
      status: tenant.status,
    }
    tenantPanelMode.value = "edit"
  }

  const cancelPanel = () => {
    tenantErrorMessage.value = ""

    if (selectedTenant.value) {
      tenantPanelMode.value = "detail"
      return
    }

    if (options.canCreate.value) {
      tenantPanelMode.value = "create"
      return
    }

    tenantPanelMode.value = "detail"
  }

  const submitForm = async (values: TenantFormValues) => {
    if (tenantLoading.value || tenantDetailLoading.value) {
      return
    }

    const payload = {
      code: normalizeTenantText(values.code),
      name: normalizeTenantText(values.name),
      status: normalizeTenantStatus(values.status),
    }

    if (payload.code.length === 0) {
      tenantErrorMessage.value = options.t("app.error.tenantCodeRequired")
      return
    }

    if (payload.name.length === 0) {
      tenantErrorMessage.value = options.t("app.error.tenantNameRequired")
      return
    }

    tenantLoading.value = true
    tenantErrorMessage.value = ""

    try {
      if (tenantPanelMode.value === "edit" && selectedTenantId.value) {
        const updated = await updateTenant(selectedTenantId.value, payload)
        selectedTenantId.value = updated.id
        tenantDetail.value = updated
        tenantPanelMode.value = "detail"
        await reloadTenants()
        return
      }

      if (!options.canCreate.value) {
        return
      }

      const created = await createTenant(payload)
      selectedTenantId.value = created.id
      tenantDetail.value = created
      tenantPanelMode.value = "detail"
      resetPanelInputs()
      await reloadTenants()
    } catch (error) {
      tenantErrorMessage.value =
        error instanceof Error
          ? error.message
          : tenantPanelMode.value === "edit"
            ? options.t("app.error.updateTenant")
            : options.t("app.error.createTenant")
    } finally {
      tenantLoading.value = false
    }
  }

  const toggleSelectedStatus = async () => {
    if (
      tenantLoading.value ||
      tenantDetailLoading.value ||
      !selectedTenant.value ||
      !options.canUpdate.value
    ) {
      return
    }

    tenantLoading.value = true
    tenantErrorMessage.value = ""

    try {
      const nextStatus =
        selectedTenant.value.status === "active" ? "suspended" : "active"
      const updated = await updateTenantStatus(
        selectedTenant.value.id,
        nextStatus,
      )
      tenantItems.value = tenantItems.value.map((tenant) =>
        tenant.id === updated.id ? updated : tenant,
      )
      tenantDetail.value = updated
      await reloadTenants()
    } catch (error) {
      tenantErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.updateTenantStatus")
    } finally {
      tenantLoading.value = false
    }
  }

  const handleRowClick = async (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const tenant = filteredTenantItems.value.find((item) => item.id === rowId)

    if (!tenant) {
      return
    }

    await selectTenant(tenant)
  }

  return {
    tenantItems,
    tenantDetail,
    tenantLoading,
    tenantDetailLoading,
    tenantErrorMessage,
    tenantDetailErrorMessage,
    selectedTenantId,
    selectedTenant,
    tenantPanelMode,
    tenantQueryValues,
    filteredTenantItems,
    tableColumns,
    queryFields,
    tableItems,
    countLabel,
    formFields,
    formValues,
    panelTitle,
    panelDescription,
    clearWorkspace,
    reloadTenants,
    selectTenant,
    resetQuery,
    handleSearch,
    handleReset,
    openCreatePanel,
    startEdit,
    cancelPanel,
    submitForm,
    toggleSelectedStatus,
    handleRowClick,
  }
}
