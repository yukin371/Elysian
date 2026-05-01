import type { ElyFormField, ElyQueryField } from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed } from "vue"

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
import { createCrudWorkspace } from "./create-crud-workspace"

export type TenantPanelMode = "detail" | "create" | "edit"
type TenantFormValues = Record<string, unknown>

type TenantPageColumn = {
  key: string
  label?: string
  width?: string
}

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
  const tenantWorkspace = createCrudWorkspace<
    TenantRecord,
    ReturnType<typeof createDefaultTenantDraft>,
    Parameters<typeof createTenant>[0]
  >({
    canCreate: options.canCreate,
    canUpdate: options.canUpdate,
    canView: options.canView,
    createDefaultDraft: createDefaultTenantDraft,
    createRecord: createTenant,
    currentShellTabKey: options.currentShellTabKey,
    fetchDetail: fetchTenantById,
    fetchList: fetchTenants,
    getCreateErrorMessage: () => options.t("app.error.createTenant"),
    getLoadDetailErrorMessage: () => options.t("app.error.loadTenantDetail"),
    getLoadListErrorMessage: () => options.t("app.error.loadTenants"),
    getUpdateErrorMessage: () => options.t("app.error.updateTenant"),
    normalizePayload: (values) => {
      const payload = {
        code: normalizeTenantText(values.code),
        name: normalizeTenantText(values.name),
        status: normalizeTenantStatus(values.status),
      }

      if (payload.code.length === 0) {
        return {
          message: options.t("app.error.tenantCodeRequired"),
          status: "invalid" as const,
        }
      }

      if (payload.name.length === 0) {
        return {
          message: options.t("app.error.tenantNameRequired"),
          status: "invalid" as const,
        }
      }

      return {
        payload,
        status: "valid" as const,
      }
    },
    onRecoverableAuthError: options.onRecoverableAuthError,
    resolveSelection: resolveTenantSelection,
    toEditDraft: (tenant) => ({
      code: tenant.code,
      name: tenant.name,
      status: tenant.status,
    }),
    updateRecord: updateTenant,
  })

  const tenantItems = tenantWorkspace.items
  const tenantDetail = tenantWorkspace.detail
  const tenantLoading = tenantWorkspace.loading
  const tenantDetailLoading = tenantWorkspace.detailLoading
  const tenantErrorMessage = tenantWorkspace.errorMessage
  const tenantDetailErrorMessage = tenantWorkspace.detailErrorMessage
  const selectedTenantId = tenantWorkspace.selectedId
  const tenantPanelMode = tenantWorkspace.panelMode
  const tenantQueryValues = tenantWorkspace.queryValues
  const tenantCreateForm = tenantWorkspace.createForm
  const tenantEditForm = tenantWorkspace.editForm

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

  const selectedTenant = tenantWorkspace.selectedRecord

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

  const cancelPanel = tenantWorkspace.cancelPanel
  const clearWorkspace = tenantWorkspace.clearWorkspace
  const handleReset = tenantWorkspace.handleReset
  const handleSearch = tenantWorkspace.handleSearch
  const openCreatePanel = tenantWorkspace.openCreatePanel
  const reloadTenants = tenantWorkspace.reloadRecords
  const resetQuery = tenantWorkspace.resetQuery
  const selectTenant = tenantWorkspace.selectRecord
  const startEdit = tenantWorkspace.startEdit
  const submitForm = tenantWorkspace.submitForm

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
      tenantItems.value = tenantItems.value.map((tenant: TenantRecord) =>
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
