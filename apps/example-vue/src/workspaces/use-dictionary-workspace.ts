import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
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

export type DictionaryPanelMode = "detail" | "create" | "edit"
type DictionaryFormValues = Record<string, unknown>

type DictionaryPageColumn = {
  key: string
  label?: string
  width?: string
} & Record<string, unknown>

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
  const dictionaryTypes = ref<DictionaryTypeRecord[]>([])
  const dictionaryItems = ref<DictionaryItemRecord[]>([])
  const dictionaryTypeDetail = ref<DictionaryTypeDetailRecord | null>(null)
  const dictionaryLoading = ref(false)
  const dictionaryDetailLoading = ref(false)
  const dictionaryErrorMessage = ref("")
  const dictionaryDetailErrorMessage = ref("")
  const selectedDictionaryTypeId = ref<string | null>(null)
  const dictionaryPanelMode = ref<DictionaryPanelMode>("detail")
  const dictionaryQueryValues = ref<ElyQueryValues>({})
  const dictionaryCreateForm = ref(createDefaultDictionaryTypeDraft())
  const dictionaryEditForm = ref(createDefaultDictionaryTypeDraft())

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

  const selectedDictionaryTypeListItem = computed(
    () =>
      dictionaryTypes.value.find(
        (type: DictionaryTypeRecord) =>
          type.id === selectedDictionaryTypeId.value,
      ) ?? null,
  )

  const selectedDictionaryType = computed<
    DictionaryTypeRecord | DictionaryTypeDetailRecord | null
  >(() => {
    if (
      dictionaryTypeDetail.value &&
      dictionaryTypeDetail.value.id === selectedDictionaryTypeId.value
    ) {
      return dictionaryTypeDetail.value
    }

    return selectedDictionaryTypeListItem.value
  })

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

  const resetPanelInputs = () => {
    dictionaryCreateForm.value = createDefaultDictionaryTypeDraft()
    dictionaryEditForm.value = createDefaultDictionaryTypeDraft()
  }

  const resetQuery = () => {
    dictionaryQueryValues.value = {}
  }

  const clearWorkspace = () => {
    dictionaryTypes.value = []
    dictionaryItems.value = []
    dictionaryTypeDetail.value = null
    selectedDictionaryTypeId.value = null
    dictionaryErrorMessage.value = ""
    dictionaryDetailErrorMessage.value = ""
    dictionaryPanelMode.value = "detail"
    resetPanelInputs()
  }

  const selectDictionaryType = async (type: DictionaryTypeRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedDictionaryTypeId.value = type.id
    dictionaryTypeDetail.value = null
    dictionaryDetailLoading.value = true
    dictionaryDetailErrorMessage.value = ""

    try {
      dictionaryTypeDetail.value = await fetchDictionaryTypeById(type.id)
    } catch (error) {
      options.onRecoverableAuthError(error)
      dictionaryDetailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadDictionaryDetail")
    } finally {
      dictionaryDetailLoading.value = false
    }
  }

  const reloadDictionaries = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    dictionaryLoading.value = true
    dictionaryErrorMessage.value = ""

    try {
      const [typePayload, itemPayload] = await Promise.all([
        fetchDictionaryTypes(),
        fetchDictionaryItems(),
      ])

      dictionaryTypes.value = typePayload.items
      dictionaryItems.value = itemPayload.items

      if (typePayload.items.length === 0) {
        dictionaryItems.value = []
        selectedDictionaryTypeId.value = null
        dictionaryTypeDetail.value = null

        if (options.canCreate.value) {
          dictionaryPanelMode.value = "create"
        }

        return
      }

      selectedDictionaryTypeId.value = resolveDictionaryTypeSelection(
        typePayload.items,
        selectedDictionaryTypeId.value,
      )

      if (dictionaryPanelMode.value !== "detail") {
        return
      }

      const nextType = typePayload.items.find(
        (type) => type.id === selectedDictionaryTypeId.value,
      )

      if (nextType) {
        await selectDictionaryType(nextType)
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkspace()
      dictionaryErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadDictionaries")
    } finally {
      dictionaryLoading.value = false
    }
  }

  const handleSearch = (values: ElyQueryValues) => {
    dictionaryQueryValues.value = values
  }

  const handleReset = () => {
    resetQuery()
  }

  const openCreatePanel = () => {
    if (!options.canCreate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedDictionaryTypeId.value = null
    dictionaryTypeDetail.value = null
    dictionaryErrorMessage.value = ""
    dictionaryDetailErrorMessage.value = ""
    resetPanelInputs()
    dictionaryPanelMode.value = "create"
  }

  const startEdit = (
    dictionaryType: DictionaryTypeRecord | DictionaryTypeDetailRecord,
  ) => {
    if (!options.canUpdate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedDictionaryTypeId.value = dictionaryType.id
    dictionaryErrorMessage.value = ""
    dictionaryDetailErrorMessage.value = ""
    dictionaryEditForm.value = {
      code: dictionaryType.code,
      name: dictionaryType.name,
      description: dictionaryType.description ?? "",
      status: dictionaryType.status,
    }
    dictionaryPanelMode.value = "edit"
  }

  const cancelPanel = () => {
    dictionaryErrorMessage.value = ""

    if (selectedDictionaryType.value) {
      dictionaryPanelMode.value = "detail"
      return
    }

    if (options.canCreate.value) {
      dictionaryPanelMode.value = "create"
      return
    }

    dictionaryPanelMode.value = "detail"
  }

  const submitForm = async (values: DictionaryFormValues) => {
    if (dictionaryLoading.value || dictionaryDetailLoading.value) {
      return
    }

    const payload = {
      code: normalizeDictionaryText(values.code),
      name: normalizeDictionaryText(values.name),
      description: normalizeOptionalDictionaryText(values.description),
      status: normalizeDictionaryStatus(values.status),
    }

    if (payload.code.length === 0) {
      dictionaryErrorMessage.value = options.t(
        "app.error.dictionaryCodeRequired",
      )
      return
    }

    if (payload.name.length === 0) {
      dictionaryErrorMessage.value = options.t(
        "app.error.dictionaryNameRequired",
      )
      return
    }

    dictionaryLoading.value = true
    dictionaryErrorMessage.value = ""

    try {
      if (
        dictionaryPanelMode.value === "edit" &&
        selectedDictionaryTypeId.value
      ) {
        const updated = await updateDictionaryType(
          selectedDictionaryTypeId.value,
          payload,
        )
        selectedDictionaryTypeId.value = updated.id
        dictionaryTypeDetail.value = updated
        dictionaryPanelMode.value = "detail"
        await reloadDictionaries()
        return
      }

      if (!options.canCreate.value) {
        return
      }

      const created = await createDictionaryType(payload)
      selectedDictionaryTypeId.value = created.id
      dictionaryTypeDetail.value = created
      dictionaryPanelMode.value = "detail"
      resetPanelInputs()
      await reloadDictionaries()
    } catch (error) {
      dictionaryErrorMessage.value =
        error instanceof Error
          ? error.message
          : dictionaryPanelMode.value === "edit"
            ? options.t("app.error.updateDictionary")
            : options.t("app.error.createDictionary")
    } finally {
      dictionaryLoading.value = false
    }
  }

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
