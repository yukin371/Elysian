import type { ElyFormField, ElyQueryField } from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed } from "vue"

import {
  createDefaultDepartmentDraft,
  createDepartmentParentLookup,
  createDepartmentParentOptions,
  createDepartmentTableItems,
  filterDepartments,
  normalizeDepartmentSort,
  normalizeDepartmentStatus,
  normalizeDepartmentText,
  normalizeOptionalDepartmentId,
  resolveDepartmentSelection,
} from "../lib/department-workspace"
import {
  type DepartmentDetailRecord,
  type DepartmentRecord,
  createDepartment,
  fetchDepartmentById,
  fetchDepartments,
  updateDepartment,
} from "../lib/platform-api"
import { createCrudWorkspace } from "./create-crud-workspace"

export type DepartmentPanelMode = "detail" | "create" | "edit"
type DepartmentFormValues = Record<string, unknown>

type DepartmentPageColumn = {
  key: string
  label?: string
  width?: string
}

interface DepartmentPageContract {
  tableColumns: ComputedRef<DepartmentPageColumn[]>
  queryFields: ComputedRef<ElyQueryField[]>
  formFields: ComputedRef<ElyFormField[]>
}

interface UseDepartmentWorkspaceOptions {
  currentShellTabKey: Ref<string>
  page: DepartmentPageContract
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeFieldLabel: (fieldKey: string) => string
  localizeStatus: (status: string) => string
  canView: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

export const useDepartmentWorkspace = (
  options: UseDepartmentWorkspaceOptions,
) => {
  const departmentWorkspace = createCrudWorkspace<
    DepartmentRecord,
    ReturnType<typeof createDefaultDepartmentDraft>,
    Parameters<typeof createDepartment>[0],
    DepartmentDetailRecord
  >({
    canCreate: options.canCreate,
    canUpdate: options.canUpdate,
    canView: options.canView,
    createDefaultDraft: createDefaultDepartmentDraft,
    createRecord: createDepartment,
    currentShellTabKey: options.currentShellTabKey,
    fetchDetail: fetchDepartmentById,
    fetchList: fetchDepartments,
    getCreateErrorMessage: () => options.t("app.error.createDepartment"),
    getLoadDetailErrorMessage: () =>
      options.t("app.error.loadDepartmentDetail"),
    getLoadListErrorMessage: () => options.t("app.error.loadDepartments"),
    getUpdateErrorMessage: () => options.t("app.error.updateDepartment"),
    normalizePayload: (values) => {
      const payload = {
        parentId: normalizeOptionalDepartmentId(values.parentId) ?? null,
        code: normalizeDepartmentText(values.code),
        name: normalizeDepartmentText(values.name),
        sort: normalizeDepartmentSort(values.sort),
        status: normalizeDepartmentStatus(values.status),
      }

      if (payload.code.length === 0) {
        return {
          message: options.t("app.error.departmentCodeRequired"),
          status: "invalid" as const,
        }
      }

      if (payload.name.length === 0) {
        return {
          message: options.t("app.error.departmentNameRequired"),
          status: "invalid" as const,
        }
      }

      return {
        payload,
        status: "valid" as const,
      }
    },
    onRecoverableAuthError: options.onRecoverableAuthError,
    resolveSelection: resolveDepartmentSelection,
    toEditDraft: (department) => ({
      parentId: department.parentId ?? "",
      code: department.code,
      name: department.name,
      sort: department.sort,
      status: department.status,
    }),
    updateRecord: updateDepartment,
  })

  const departmentItems = departmentWorkspace.items
  const departmentDetail = departmentWorkspace.detail
  const departmentLoading = departmentWorkspace.loading
  const departmentDetailLoading = departmentWorkspace.detailLoading
  const departmentErrorMessage = departmentWorkspace.errorMessage
  const departmentDetailErrorMessage = departmentWorkspace.detailErrorMessage
  const selectedDepartmentId = departmentWorkspace.selectedId
  const departmentPanelMode = departmentWorkspace.panelMode
  const departmentQueryValues = departmentWorkspace.queryValues
  const departmentCreateForm = departmentWorkspace.createForm
  const departmentEditForm = departmentWorkspace.editForm

  const filteredDepartmentItems = computed(() =>
    filterDepartments(departmentItems.value, {
      code:
        typeof departmentQueryValues.value.code === "string"
          ? departmentQueryValues.value.code
          : undefined,
      name:
        typeof departmentQueryValues.value.name === "string"
          ? departmentQueryValues.value.name
          : undefined,
      status:
        departmentQueryValues.value.status === "active" ||
        departmentQueryValues.value.status === "disabled"
          ? departmentQueryValues.value.status
          : "",
    }),
  )

  const selectedDepartment = departmentWorkspace.selectedRecord

  const selectedDepartmentDetail = computed(() =>
    departmentDetail.value &&
    departmentDetail.value.id === selectedDepartmentId.value
      ? departmentDetail.value
      : null,
  )

  const parentLookup = computed(() =>
    createDepartmentParentLookup(departmentItems.value),
  )

  const parentOptions = computed(() =>
    createDepartmentParentOptions(
      departmentItems.value,
      selectedDepartmentId.value,
      options.t("app.department.parentRoot"),
    ),
  )

  const tableColumns = computed(() =>
    options.page.tableColumns.value.map((column) => ({
      ...column,
      label: options.localizeFieldLabel(column.key),
      width:
        column.key === "id"
          ? "240"
          : column.key === "parentId"
            ? "220"
            : column.key === "status"
              ? "120"
              : column.key === "sort"
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
          ? options.t("app.department.query.codePlaceholder")
          : field.key === "name"
            ? options.t("app.department.query.namePlaceholder")
            : field.key === "status"
              ? options.t("copy.query.statusPlaceholder")
              : field.placeholder,
    })),
  )

  const tableItems = computed(() =>
    createDepartmentTableItems(filteredDepartmentItems.value, {
      parentLookup: parentLookup.value,
      rootLabel: options.t("app.department.parentRoot"),
      localizeStatus: (status) =>
        options.localizeStatus(status as DepartmentRecord["status"]),
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
    }),
  )

  const countLabel = computed(() =>
    options.t("app.department.countLabel", {
      visible: filteredDepartmentItems.value.length,
      total: departmentItems.value.length,
    }),
  )

  const formFields = computed<ElyFormField[]>(() => {
    const baseFields = options.page.formFields.value.map((field) => ({
      ...field,
      label: options.localizeFieldLabel(field.key),
      input: field.key === "parentId" ? ("select" as const) : field.input,
      options:
        field.key === "parentId"
          ? parentOptions.value
          : field.key === "status"
            ? [
                {
                  label: options.t("app.department.status.active"),
                  value: "active",
                },
                {
                  label: options.t("app.department.status.disabled"),
                  value: "disabled",
                },
              ]
            : field.options,
      placeholder:
        field.key === "parentId"
          ? options.t("app.department.parentPlaceholder")
          : field.key === "code"
            ? options.t("app.department.query.codePlaceholder")
            : field.key === "name"
              ? options.t("app.department.query.namePlaceholder")
              : field.key === "status"
                ? options.t("copy.query.statusPlaceholder")
                : field.placeholder,
    }))

    if (departmentPanelMode.value !== "detail") {
      return baseFields
    }

    return [
      ...baseFields,
      {
        key: "createdAt",
        label: options.t("app.department.field.createdAt"),
        input: "datetime",
        disabled: true,
      },
      {
        key: "updatedAt",
        label: options.t("app.department.field.updatedAt"),
        input: "datetime",
        disabled: true,
      },
    ]
  })

  const formValues = computed<DepartmentFormValues>(() => {
    if (departmentPanelMode.value === "edit") {
      return {
        ...departmentEditForm.value,
        parentId: departmentEditForm.value.parentId ?? "",
      }
    }

    if (departmentPanelMode.value === "detail" && selectedDepartment.value) {
      return {
        parentId: selectedDepartment.value.parentId ?? "",
        code: selectedDepartment.value.code,
        name: selectedDepartment.value.name,
        sort: selectedDepartment.value.sort,
        status: selectedDepartment.value.status,
        createdAt: selectedDepartment.value.createdAt,
        updatedAt: selectedDepartment.value.updatedAt,
      }
    }

    return {
      ...departmentCreateForm.value,
      parentId: departmentCreateForm.value.parentId ?? "",
    }
  })

  const panelTitle = computed(() => {
    if (departmentPanelMode.value === "edit") {
      return options.t("app.department.panelTitle.edit")
    }

    if (departmentPanelMode.value === "create") {
      return options.t("app.department.panelTitle.create")
    }

    return (
      selectedDepartment.value?.name ??
      options.t("app.department.panelTitle.detailFallback")
    )
  })

  const panelDescription = computed(() => {
    if (departmentPanelMode.value === "edit") {
      return options.t("app.department.panelDesc.edit")
    }

    if (departmentPanelMode.value === "create") {
      return options.t("app.department.panelDesc.create")
    }

    return selectedDepartment.value
      ? options.t("app.department.panelDesc.detail")
      : options.t("app.department.detailEmptyDescription")
  })

  const cancelPanel = departmentWorkspace.cancelPanel
  const clearWorkspace = departmentWorkspace.clearWorkspace
  const handleReset = departmentWorkspace.handleReset
  const handleSearch = departmentWorkspace.handleSearch
  const openCreatePanel = departmentWorkspace.openCreatePanel
  const reloadDepartments = departmentWorkspace.reloadRecords
  const resetQuery = departmentWorkspace.resetQuery
  const selectDepartment = departmentWorkspace.selectRecord
  const startEdit = departmentWorkspace.startEdit
  const submitForm = departmentWorkspace.submitForm

  const handleRowClick = async (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const department = filteredDepartmentItems.value.find(
      (item) => item.id === rowId,
    )

    if (!department) {
      return
    }

    await selectDepartment(department)
  }

  return {
    cancelPanel,
    clearWorkspace,
    countLabel,
    departmentDetail,
    departmentDetailErrorMessage,
    departmentDetailLoading,
    departmentErrorMessage,
    departmentLoading,
    departmentPanelMode,
    departmentQueryValues,
    filteredDepartmentItems,
    formFields,
    formValues,
    handleReset,
    handleRowClick,
    handleSearch,
    openCreatePanel,
    panelDescription,
    panelTitle,
    parentLookup,
    queryFields,
    reloadDepartments,
    resetQuery,
    selectDepartment,
    selectedDepartment,
    selectedDepartmentDetail,
    selectedDepartmentId,
    startEdit,
    submitForm,
    tableColumns,
    tableItems,
  }
}
