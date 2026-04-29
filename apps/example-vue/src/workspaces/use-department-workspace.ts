import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

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

export type DepartmentPanelMode = "detail" | "create" | "edit"
type DepartmentFormValues = Record<string, unknown>

type DepartmentPageColumn = {
  key: string
  label?: string
  width?: string
} & Record<string, unknown>

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
  const departmentItems = ref<DepartmentRecord[]>([])
  const departmentDetail = ref<DepartmentDetailRecord | null>(null)
  const departmentLoading = ref(false)
  const departmentDetailLoading = ref(false)
  const departmentErrorMessage = ref("")
  const departmentDetailErrorMessage = ref("")
  const selectedDepartmentId = ref<string | null>(null)
  const departmentPanelMode = ref<DepartmentPanelMode>("detail")
  const departmentQueryValues = ref<ElyQueryValues>({})
  const departmentCreateForm = ref(createDefaultDepartmentDraft())
  const departmentEditForm = ref(createDefaultDepartmentDraft())

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

  const selectedDepartmentListItem = computed(
    () =>
      departmentItems.value.find(
        (department: DepartmentRecord) =>
          department.id === selectedDepartmentId.value,
      ) ?? null,
  )

  const selectedDepartment = computed(
    () =>
      (departmentDetail.value &&
      departmentDetail.value.id === selectedDepartmentId.value
        ? departmentDetail.value
        : selectedDepartmentListItem.value) ?? null,
  )

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

  const resetPanelInputs = () => {
    departmentCreateForm.value = createDefaultDepartmentDraft()
    departmentEditForm.value = createDefaultDepartmentDraft()
  }

  const resetQuery = () => {
    departmentQueryValues.value = {}
  }

  const clearWorkspace = () => {
    departmentItems.value = []
    departmentDetail.value = null
    selectedDepartmentId.value = null
    departmentErrorMessage.value = ""
    departmentDetailErrorMessage.value = ""
    departmentPanelMode.value = "detail"
    resetPanelInputs()
  }

  const selectDepartment = async (department: DepartmentRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedDepartmentId.value = department.id
    departmentPanelMode.value = "detail"
    departmentDetail.value = null
    departmentDetailLoading.value = true
    departmentDetailErrorMessage.value = ""

    try {
      departmentDetail.value = await fetchDepartmentById(department.id)
    } catch (error) {
      options.onRecoverableAuthError(error)
      departmentDetailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadDepartmentDetail")
    } finally {
      departmentDetailLoading.value = false
    }
  }

  const reloadDepartments = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    departmentLoading.value = true
    departmentErrorMessage.value = ""

    try {
      const payload = await fetchDepartments()
      departmentItems.value = payload.items

      if (payload.items.length === 0) {
        selectedDepartmentId.value = null
        departmentDetail.value = null

        if (options.canCreate.value) {
          departmentPanelMode.value = "create"
        }

        return
      }

      selectedDepartmentId.value = resolveDepartmentSelection(
        payload.items,
        selectedDepartmentId.value,
      )

      if (departmentPanelMode.value !== "detail") {
        return
      }

      const nextDepartment = payload.items.find(
        (item) => item.id === selectedDepartmentId.value,
      )

      if (nextDepartment) {
        await selectDepartment(nextDepartment)
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkspace()
      departmentErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadDepartments")
    } finally {
      departmentLoading.value = false
    }
  }

  const handleSearch = (values: ElyQueryValues) => {
    departmentQueryValues.value = values
  }

  const handleReset = () => {
    resetQuery()
  }

  const openCreatePanel = () => {
    if (!options.canCreate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedDepartmentId.value = null
    departmentDetail.value = null
    departmentErrorMessage.value = ""
    departmentDetailErrorMessage.value = ""
    resetPanelInputs()
    departmentPanelMode.value = "create"
  }

  const startEdit = (department: DepartmentRecord | DepartmentDetailRecord) => {
    if (!options.canUpdate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedDepartmentId.value = department.id
    departmentErrorMessage.value = ""
    departmentDetailErrorMessage.value = ""
    departmentEditForm.value = {
      parentId: department.parentId ?? "",
      code: department.code,
      name: department.name,
      sort: department.sort,
      status: department.status,
    }
    departmentPanelMode.value = "edit"
  }

  const cancelPanel = () => {
    departmentErrorMessage.value = ""

    if (selectedDepartment.value) {
      departmentPanelMode.value = "detail"
      return
    }

    if (options.canCreate.value) {
      departmentPanelMode.value = "create"
      return
    }

    departmentPanelMode.value = "detail"
  }

  const submitForm = async (values: DepartmentFormValues) => {
    if (departmentLoading.value || departmentDetailLoading.value) {
      return
    }

    const payload = {
      parentId: normalizeOptionalDepartmentId(values.parentId) ?? null,
      code: normalizeDepartmentText(values.code),
      name: normalizeDepartmentText(values.name),
      sort: normalizeDepartmentSort(values.sort),
      status: normalizeDepartmentStatus(values.status),
    }

    if (payload.code.length === 0) {
      departmentErrorMessage.value = options.t(
        "app.error.departmentCodeRequired",
      )
      return
    }

    if (payload.name.length === 0) {
      departmentErrorMessage.value = options.t(
        "app.error.departmentNameRequired",
      )
      return
    }

    departmentLoading.value = true
    departmentErrorMessage.value = ""

    try {
      if (departmentPanelMode.value === "edit" && selectedDepartmentId.value) {
        const updated = await updateDepartment(
          selectedDepartmentId.value,
          payload,
        )
        selectedDepartmentId.value = updated.id
        departmentDetail.value = updated
        departmentPanelMode.value = "detail"
        await reloadDepartments()
        return
      }

      if (!options.canCreate.value) {
        return
      }

      const created = await createDepartment(payload)
      selectedDepartmentId.value = created.id
      departmentDetail.value = created
      departmentPanelMode.value = "detail"
      resetPanelInputs()
      await reloadDepartments()
    } catch (error) {
      departmentErrorMessage.value =
        error instanceof Error
          ? error.message
          : departmentPanelMode.value === "edit"
            ? options.t("app.error.updateDepartment")
            : options.t("app.error.createDepartment")
    } finally {
      departmentLoading.value = false
    }
  }

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
