import type { ElyFormField, ElyQueryField } from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  createDefaultDictionaryTypeDraft,
  createDictionaryTypeTableItems,
  filterDictionaryTypes,
  normalizeDictionaryStatus,
  normalizeDictionaryText,
  normalizeOptionalDictionaryText,
  resolveDictionaryTypeSelection,
} from "../lib/dictionary-workspace"
import {
  type DictionaryItemRecord,
  type DictionaryTypeDetailRecord,
  type DictionaryTypeRecord,
  createDictionaryType,
  fetchDictionaryItems,
  fetchDictionaryTypeById,
  fetchDictionaryTypes,
  updateDictionaryType,
} from "../lib/platform-api"
import { createCrudWorkspace } from "./create-crud-workspace"

export type DictionaryPanelMode = "detail" | "create" | "edit"
type DictionaryFormValues = Record<string, unknown>

type DictionaryPageColumn = {
  key: string
  label?: string
  width?: string
}

interface DictionaryPageContract {
  tableColumns: ComputedRef<DictionaryPageColumn[]>
  queryFields: ComputedRef<ElyQueryField[]>
  formFields: ComputedRef<ElyFormField[]>
}

interface UseDictionaryWorkspaceOptions {
  currentShellTabKey: Ref<string>
  page: DictionaryPageContract
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeFieldLabel: (fieldKey: string) => string
  localizeStatus: (status: DictionaryTypeRecord["status"]) => string
  canView: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

export const useDictionaryWorkspace = (
  options: UseDictionaryWorkspaceOptions,
) => {
  const dictionaryItems = ref<DictionaryItemRecord[]>([])

  const dictionaryWorkspace = createCrudWorkspace<
    DictionaryTypeRecord,
    ReturnType<typeof createDefaultDictionaryTypeDraft>,
    Parameters<typeof createDictionaryType>[0],
    DictionaryTypeDetailRecord
  >({
    canCreate: options.canCreate,
    canUpdate: options.canUpdate,
    canView: options.canView,
    createDefaultDraft: createDefaultDictionaryTypeDraft,
    createRecord: createDictionaryType,
    currentShellTabKey: options.currentShellTabKey,
    fetchDetail: fetchDictionaryTypeById,
    fetchList: fetchDictionaryTypes,
    getCreateErrorMessage: () => options.t("app.error.createDictionary"),
    getLoadDetailErrorMessage: () =>
      options.t("app.error.loadDictionaryDetail"),
    getLoadListErrorMessage: () => options.t("app.error.loadDictionaries"),
    getUpdateErrorMessage: () => options.t("app.error.updateDictionary"),
    normalizePayload: (values) => {
      const payload = {
        code: normalizeDictionaryText(values.code),
        name: normalizeDictionaryText(values.name),
        description: normalizeOptionalDictionaryText(values.description),
        status: normalizeDictionaryStatus(values.status),
      }

      if (payload.code.length === 0) {
        return {
          message: options.t("app.error.dictionaryCodeRequired"),
          status: "invalid" as const,
        }
      }

      if (payload.name.length === 0) {
        return {
          message: options.t("app.error.dictionaryNameRequired"),
          status: "invalid" as const,
        }
      }

      return {
        payload,
        status: "valid" as const,
      }
    },
    onRecoverableAuthError: options.onRecoverableAuthError,
    resolveSelection: resolveDictionaryTypeSelection,
    toEditDraft: (dictionaryType) => ({
      code: dictionaryType.code,
      name: dictionaryType.name,
      description: dictionaryType.description ?? "",
      status: dictionaryType.status,
    }),
    updateRecord: updateDictionaryType,
  })

  const dictionaryTypes = dictionaryWorkspace.items
  const dictionaryTypeDetail = dictionaryWorkspace.detail
  const dictionaryLoading = dictionaryWorkspace.loading
  const dictionaryDetailLoading = dictionaryWorkspace.detailLoading
  const dictionaryErrorMessage = dictionaryWorkspace.errorMessage
  const dictionaryDetailErrorMessage = dictionaryWorkspace.detailErrorMessage
  const selectedDictionaryTypeId = dictionaryWorkspace.selectedId
  const dictionaryPanelMode = dictionaryWorkspace.panelMode
  const dictionaryQueryValues = dictionaryWorkspace.queryValues
  const dictionaryCreateForm = dictionaryWorkspace.createForm
  const dictionaryEditForm = dictionaryWorkspace.editForm

  const filteredDictionaryTypes = computed(() =>
    filterDictionaryTypes(dictionaryTypes.value, {
      code:
        typeof dictionaryQueryValues.value.code === "string"
          ? dictionaryQueryValues.value.code
          : undefined,
      name:
        typeof dictionaryQueryValues.value.name === "string"
          ? dictionaryQueryValues.value.name
          : undefined,
      description:
        typeof dictionaryQueryValues.value.description === "string"
          ? dictionaryQueryValues.value.description
          : undefined,
      status:
        dictionaryQueryValues.value.status === "active" ||
        dictionaryQueryValues.value.status === "disabled"
          ? dictionaryQueryValues.value.status
          : "",
    }),
  )

  const selectedDictionaryType = dictionaryWorkspace.selectedRecord

  const selectedDictionaryTypeDetail = computed(() =>
    dictionaryTypeDetail.value &&
    dictionaryTypeDetail.value.id === selectedDictionaryTypeId.value
      ? dictionaryTypeDetail.value
      : null,
  )

  const selectedDictionaryTypeItems = computed(() => {
    if (selectedDictionaryTypeDetail.value) {
      return selectedDictionaryTypeDetail.value.items
    }

    if (!selectedDictionaryTypeId.value) {
      return []
    }

    return dictionaryItems.value.filter(
      (item: DictionaryItemRecord) =>
        item.typeId === selectedDictionaryTypeId.value,
    )
  })

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
              label: options.localizeStatus(
                option.value === "disabled" ? "disabled" : "active",
              ),
            }))
          : field.options,
      placeholder:
        field.key === "code"
          ? options.t("app.dictionary.query.codePlaceholder")
          : field.key === "name"
            ? options.t("app.dictionary.query.namePlaceholder")
            : field.key === "description"
              ? options.t("app.dictionary.query.descriptionPlaceholder")
              : field.key === "status"
                ? options.t("copy.query.statusPlaceholder")
                : field.placeholder,
    })),
  )

  const tableItems = computed(() =>
    createDictionaryTypeTableItems(filteredDictionaryTypes.value, {
      localizeStatus: options.localizeStatus,
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
    }),
  )

  const countLabel = computed(() =>
    options.t("app.dictionary.countLabel", {
      visible: filteredDictionaryTypes.value.length,
      total: dictionaryTypes.value.length,
    }),
  )

  const formFields = computed<ElyFormField[]>(() => {
    const baseFields = options.page.formFields.value.map((field) => ({
      ...field,
      label: options.localizeFieldLabel(field.key),
      input: field.key === "description" ? ("textarea" as const) : field.input,
      options:
        field.key === "status" && field.options
          ? field.options.map((option) => ({
              ...option,
              label: options.localizeStatus(
                option.value === "disabled" ? "disabled" : "active",
              ),
            }))
          : field.options,
      placeholder:
        field.key === "code"
          ? options.t("app.dictionary.query.codePlaceholder")
          : field.key === "name"
            ? options.t("app.dictionary.query.namePlaceholder")
            : field.key === "description"
              ? options.t("app.dictionary.query.descriptionPlaceholder")
              : field.key === "status"
                ? options.t("copy.query.statusPlaceholder")
                : field.placeholder,
    }))

    if (dictionaryPanelMode.value !== "detail") {
      return baseFields
    }

    return [
      ...baseFields,
      {
        key: "createdAt",
        label: options.t("app.dictionary.field.createdAt"),
        input: "datetime",
        disabled: true,
      },
      {
        key: "updatedAt",
        label: options.t("app.dictionary.field.updatedAt"),
        input: "datetime",
        disabled: true,
      },
    ]
  })

  const formValues = computed<DictionaryFormValues>(() => {
    if (dictionaryPanelMode.value === "edit") {
      return {
        ...dictionaryEditForm.value,
        description: dictionaryEditForm.value.description ?? "",
      }
    }

    if (
      dictionaryPanelMode.value === "detail" &&
      selectedDictionaryType.value
    ) {
      return {
        code: selectedDictionaryType.value.code,
        name: selectedDictionaryType.value.name,
        description: selectedDictionaryType.value.description ?? "",
        status: selectedDictionaryType.value.status,
        createdAt: selectedDictionaryType.value.createdAt,
        updatedAt: selectedDictionaryType.value.updatedAt,
      }
    }

    return {
      ...dictionaryCreateForm.value,
      description: dictionaryCreateForm.value.description ?? "",
    }
  })

  const panelTitle = computed(() => {
    if (dictionaryPanelMode.value === "edit") {
      return options.t("app.dictionary.panelTitle.edit")
    }

    if (dictionaryPanelMode.value === "create") {
      return options.t("app.dictionary.panelTitle.create")
    }

    return (
      selectedDictionaryType.value?.name ??
      options.t("app.dictionary.panelTitle.detailFallback")
    )
  })

  const panelDescription = computed(() => {
    if (dictionaryPanelMode.value === "edit") {
      return options.t("app.dictionary.panelDesc.edit")
    }

    if (dictionaryPanelMode.value === "create") {
      return options.t("app.dictionary.panelDesc.create")
    }

    return selectedDictionaryType.value
      ? options.t("app.dictionary.panelDesc.detail")
      : options.t("app.dictionary.detailEmptyDescription")
  })

  const clearWorkspace = () => {
    dictionaryItems.value = []
    dictionaryWorkspace.clearWorkspace()
  }

  const reloadDictionaries = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    const dictionaryItemsPromise = fetchDictionaryItems()
    await dictionaryWorkspace.reloadRecords()

    try {
      const itemPayload = await dictionaryItemsPromise

      if (dictionaryTypes.value.length === 0) {
        dictionaryItems.value = []
        return
      }

      dictionaryItems.value = itemPayload.items
    } catch (error) {
      options.onRecoverableAuthError(error)
      dictionaryErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadDictionaries")
    }
  }

  const cancelPanel = dictionaryWorkspace.cancelPanel
  const handleReset = dictionaryWorkspace.handleReset
  const handleSearch = dictionaryWorkspace.handleSearch
  const openCreatePanel = dictionaryWorkspace.openCreatePanel
  const resetQuery = dictionaryWorkspace.resetQuery
  const selectDictionaryType = dictionaryWorkspace.selectRecord
  const startEdit = dictionaryWorkspace.startEdit
  const submitForm = dictionaryWorkspace.submitForm

  const handleRowClick = async (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const dictionaryType = filteredDictionaryTypes.value.find(
      (item) => item.id === rowId,
    )

    if (!dictionaryType) {
      return
    }

    await selectDictionaryType(dictionaryType)
  }

  return {
    cancelPanel,
    clearWorkspace,
    countLabel,
    dictionaryDetailErrorMessage,
    dictionaryDetailLoading,
    dictionaryErrorMessage,
    dictionaryItems,
    dictionaryLoading,
    dictionaryPanelMode,
    dictionaryQueryValues,
    dictionaryTypes,
    filteredDictionaryTypes,
    formFields,
    formValues,
    handleReset,
    handleRowClick,
    handleSearch,
    openCreatePanel,
    panelDescription,
    panelTitle,
    queryFields,
    reloadDictionaries,
    resetQuery,
    selectDictionaryType,
    selectedDictionaryType,
    selectedDictionaryTypeDetail,
    selectedDictionaryTypeId,
    selectedDictionaryTypeItems,
    startEdit,
    submitForm,
    tableColumns,
    tableItems,
  }
}
