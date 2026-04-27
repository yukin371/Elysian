import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  type SettingRecord,
  createSetting,
  fetchSettingById,
  fetchSettings,
  updateSetting,
} from "../lib/platform-api"
import {
  createDefaultSettingDraft,
  createSettingTableItems,
  filterSettings,
  normalizeOptionalSettingText,
  normalizeSettingStatus,
  normalizeSettingText,
  resolveSettingSelection,
} from "../lib/setting-workspace"

export type SettingPanelMode = "detail" | "create" | "edit"
type SettingFormValues = Record<string, unknown>

type SettingPageColumn = {
  key: string
  label?: string
  width?: string
} & Record<string, unknown>

interface SettingPageContract {
  tableColumns: ComputedRef<SettingPageColumn[]>
  queryFields: ComputedRef<ElyQueryField[]>
  formFields: ComputedRef<ElyFormField[]>
}

interface UseSettingWorkspaceOptions {
  currentShellTabKey: Ref<string>
  page: SettingPageContract
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeFieldLabel: (fieldKey: string) => string
  localizeStatus: (status: string) => string
  canView: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

export const useSettingWorkspace = (options: UseSettingWorkspaceOptions) => {
  const settingItems = ref<SettingRecord[]>([])
  const settingDetail = ref<SettingRecord | null>(null)
  const settingLoading = ref(false)
  const settingDetailLoading = ref(false)
  const settingErrorMessage = ref("")
  const settingDetailErrorMessage = ref("")
  const selectedSettingId = ref<string | null>(null)
  const settingPanelMode = ref<SettingPanelMode>("detail")
  const settingQueryValues = ref<ElyQueryValues>({})
  const settingCreateForm = ref(createDefaultSettingDraft())
  const settingEditForm = ref(createDefaultSettingDraft())

  const filteredSettingItems = computed(() =>
    filterSettings(settingItems.value, {
      key:
        typeof settingQueryValues.value.key === "string"
          ? settingQueryValues.value.key
          : undefined,
      value:
        typeof settingQueryValues.value.value === "string"
          ? settingQueryValues.value.value
          : undefined,
      description:
        typeof settingQueryValues.value.description === "string"
          ? settingQueryValues.value.description
          : undefined,
      status:
        settingQueryValues.value.status === "active" ||
        settingQueryValues.value.status === "disabled"
          ? settingQueryValues.value.status
          : "",
    }),
  )

  const selectedSettingListItem = computed(
    () =>
      settingItems.value.find(
        (setting) => setting.id === selectedSettingId.value,
      ) ?? null,
  )

  const selectedSetting = computed(
    () =>
      (settingDetail.value && settingDetail.value.id === selectedSettingId.value
        ? settingDetail.value
        : selectedSettingListItem.value) ?? null,
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
        field.key === "key"
          ? options.t("app.setting.query.keyPlaceholder")
          : field.key === "value"
            ? options.t("app.setting.query.valuePlaceholder")
            : field.key === "description"
              ? options.t("app.setting.query.descriptionPlaceholder")
              : field.key === "status"
                ? options.t("copy.query.statusPlaceholder")
                : field.placeholder,
    })),
  )

  const tableItems = computed(() =>
    createSettingTableItems(filteredSettingItems.value, {
      localizeStatus: options.localizeStatus,
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
    }),
  )

  const countLabel = computed(() =>
    options.t("app.setting.countLabel", {
      visible: filteredSettingItems.value.length,
      total: settingItems.value.length,
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
              label: options.localizeStatus(option.value),
            }))
          : field.options,
      placeholder:
        field.key === "key"
          ? options.t("app.setting.query.keyPlaceholder")
          : field.key === "value"
            ? options.t("app.setting.query.valuePlaceholder")
            : field.key === "description"
              ? options.t("app.setting.query.descriptionPlaceholder")
              : field.key === "status"
                ? options.t("copy.query.statusPlaceholder")
                : field.placeholder,
    }))

    if (settingPanelMode.value !== "detail") {
      return baseFields
    }

    return [
      ...baseFields,
      {
        key: "createdAt",
        label: options.t("app.setting.field.createdAt"),
        input: "datetime",
        disabled: true,
      },
      {
        key: "updatedAt",
        label: options.t("app.setting.field.updatedAt"),
        input: "datetime",
        disabled: true,
      },
    ]
  })

  const formValues = computed<SettingFormValues>(() => {
    if (settingPanelMode.value === "edit") {
      return {
        ...settingEditForm.value,
        description: settingEditForm.value.description ?? "",
      }
    }

    if (settingPanelMode.value === "detail" && selectedSetting.value) {
      return {
        key: selectedSetting.value.key,
        value: selectedSetting.value.value,
        description: selectedSetting.value.description ?? "",
        status: selectedSetting.value.status,
        createdAt: selectedSetting.value.createdAt,
        updatedAt: selectedSetting.value.updatedAt,
      }
    }

    return {
      ...settingCreateForm.value,
      description: settingCreateForm.value.description ?? "",
    }
  })

  const panelTitle = computed(() => {
    if (settingPanelMode.value === "edit") {
      return options.t("app.setting.panelTitle.edit")
    }

    if (settingPanelMode.value === "create") {
      return options.t("app.setting.panelTitle.create")
    }

    return (
      selectedSetting.value?.key ??
      options.t("app.setting.panelTitle.detailFallback")
    )
  })

  const panelDescription = computed(() => {
    if (settingPanelMode.value === "edit") {
      return options.t("app.setting.panelDesc.edit")
    }

    if (settingPanelMode.value === "create") {
      return options.t("app.setting.panelDesc.create")
    }

    return selectedSetting.value
      ? options.t("app.setting.panelDesc.detail")
      : options.t("app.setting.detailEmptyDescription")
  })

  const resetPanelInputs = () => {
    settingCreateForm.value = createDefaultSettingDraft()
    settingEditForm.value = createDefaultSettingDraft()
  }

  const resetQuery = () => {
    settingQueryValues.value = {}
  }

  const clearWorkspace = () => {
    settingItems.value = []
    settingDetail.value = null
    selectedSettingId.value = null
    settingErrorMessage.value = ""
    settingDetailErrorMessage.value = ""
    settingPanelMode.value = "detail"
    resetPanelInputs()
  }

  const selectSetting = async (setting: SettingRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedSettingId.value = setting.id
    settingPanelMode.value = "detail"
    settingDetail.value = null
    settingDetailLoading.value = true
    settingDetailErrorMessage.value = ""

    try {
      settingDetail.value = await fetchSettingById(setting.id)
    } catch (error) {
      options.onRecoverableAuthError(error)
      settingDetailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadSettingDetail")
    } finally {
      settingDetailLoading.value = false
    }
  }

  const reloadSettings = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    settingLoading.value = true
    settingErrorMessage.value = ""

    try {
      const payload = await fetchSettings()
      settingItems.value = payload.items

      if (payload.items.length === 0) {
        selectedSettingId.value = null
        settingDetail.value = null

        if (options.canCreate.value) {
          settingPanelMode.value = "create"
        }

        return
      }

      selectedSettingId.value = resolveSettingSelection(
        payload.items,
        selectedSettingId.value,
      )

      if (settingPanelMode.value !== "detail") {
        return
      }

      const nextSetting = payload.items.find(
        (item) => item.id === selectedSettingId.value,
      )

      if (nextSetting) {
        await selectSetting(nextSetting)
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkspace()
      settingErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadSettings")
    } finally {
      settingLoading.value = false
    }
  }

  const handleSearch = (values: ElyQueryValues) => {
    settingQueryValues.value = values
  }

  const handleReset = () => {
    resetQuery()
  }

  const openCreatePanel = () => {
    if (!options.canCreate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedSettingId.value = null
    settingDetail.value = null
    settingErrorMessage.value = ""
    settingDetailErrorMessage.value = ""
    resetPanelInputs()
    settingPanelMode.value = "create"
  }

  const startEdit = (setting: SettingRecord) => {
    if (!options.canUpdate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedSettingId.value = setting.id
    settingErrorMessage.value = ""
    settingDetailErrorMessage.value = ""
    settingEditForm.value = {
      key: setting.key,
      value: setting.value,
      description: setting.description ?? "",
      status: setting.status,
    }
    settingPanelMode.value = "edit"
  }

  const cancelPanel = () => {
    settingErrorMessage.value = ""

    if (selectedSetting.value) {
      settingPanelMode.value = "detail"
      return
    }

    if (options.canCreate.value) {
      settingPanelMode.value = "create"
      return
    }

    settingPanelMode.value = "detail"
  }

  const submitForm = async (values: SettingFormValues) => {
    if (settingLoading.value || settingDetailLoading.value) {
      return
    }

    const payload = {
      key: normalizeSettingText(values.key),
      value: normalizeSettingText(values.value),
      description: normalizeOptionalSettingText(values.description),
      status: normalizeSettingStatus(values.status),
    }

    if (payload.key.length === 0) {
      settingErrorMessage.value = options.t("app.error.settingKeyRequired")
      return
    }

    if (payload.value.length === 0) {
      settingErrorMessage.value = options.t("app.error.settingValueRequired")
      return
    }

    settingLoading.value = true
    settingErrorMessage.value = ""

    try {
      if (settingPanelMode.value === "edit" && selectedSettingId.value) {
        const updated = await updateSetting(selectedSettingId.value, payload)
        selectedSettingId.value = updated.id
        settingDetail.value = updated
        settingPanelMode.value = "detail"
        await reloadSettings()
        return
      }

      if (!options.canCreate.value) {
        return
      }

      const created = await createSetting(payload)
      selectedSettingId.value = created.id
      settingDetail.value = created
      settingPanelMode.value = "detail"
      resetPanelInputs()
      await reloadSettings()
    } catch (error) {
      settingErrorMessage.value =
        error instanceof Error
          ? error.message
          : settingPanelMode.value === "edit"
            ? options.t("app.error.updateSetting")
            : options.t("app.error.createSetting")
    } finally {
      settingLoading.value = false
    }
  }

  const handleRowClick = async (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const setting = filteredSettingItems.value.find((item) => item.id === rowId)

    if (!setting) {
      return
    }

    await selectSetting(setting)
  }

  return {
    cancelPanel,
    clearWorkspace,
    countLabel,
    filteredSettingItems,
    formFields,
    formValues,
    handleReset,
    handleRowClick,
    handleSearch,
    openCreatePanel,
    panelDescription,
    panelTitle,
    queryFields,
    reloadSettings,
    resetQuery,
    selectedSetting,
    selectedSettingId,
    selectSetting,
    settingDetail,
    settingDetailErrorMessage,
    settingDetailLoading,
    settingErrorMessage,
    settingLoading,
    settingPanelMode,
    settingQueryValues,
    startEdit,
    submitForm,
    tableColumns,
    tableItems,
  }
}
