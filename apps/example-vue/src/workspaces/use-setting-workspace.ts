import type { ElyFormField, ElyQueryField } from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed } from "vue"

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
import { createCrudWorkspace } from "./create-crud-workspace"

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
  const settingWorkspace = createCrudWorkspace({
    canCreate: options.canCreate,
    canUpdate: options.canUpdate,
    canView: options.canView,
    createDefaultDraft: createDefaultSettingDraft,
    createRecord: createSetting,
    currentShellTabKey: options.currentShellTabKey,
    fetchDetail: fetchSettingById,
    fetchList: fetchSettings,
    getCreateErrorMessage: () => options.t("app.error.createSetting"),
    getLoadDetailErrorMessage: () => options.t("app.error.loadSettingDetail"),
    getLoadListErrorMessage: () => options.t("app.error.loadSettings"),
    getUpdateErrorMessage: () => options.t("app.error.updateSetting"),
    normalizePayload: (values) => {
      const payload = {
        key: normalizeSettingText(values.key),
        value: normalizeSettingText(values.value),
        description: normalizeOptionalSettingText(values.description),
        status: normalizeSettingStatus(values.status),
      }

      if (payload.key.length === 0) {
        return {
          message: options.t("app.error.settingKeyRequired"),
          status: "invalid" as const,
        }
      }

      if (payload.value.length === 0) {
        return {
          message: options.t("app.error.settingValueRequired"),
          status: "invalid" as const,
        }
      }

      return {
        payload,
        status: "valid" as const,
      }
    },
    onRecoverableAuthError: options.onRecoverableAuthError,
    resolveSelection: resolveSettingSelection,
    toEditDraft: (setting) => ({
      key: setting.key,
      value: setting.value,
      description: setting.description ?? "",
      status: setting.status,
    }),
    updateRecord: updateSetting,
  })

  const settingItems = settingWorkspace.items
  const settingDetail = settingWorkspace.detail
  const settingLoading = settingWorkspace.loading
  const settingDetailLoading = settingWorkspace.detailLoading
  const settingErrorMessage = settingWorkspace.errorMessage
  const settingDetailErrorMessage = settingWorkspace.detailErrorMessage
  const selectedSettingId = settingWorkspace.selectedId
  const settingPanelMode = settingWorkspace.panelMode
  const settingQueryValues = settingWorkspace.queryValues
  const settingCreateForm = settingWorkspace.createForm
  const settingEditForm = settingWorkspace.editForm

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

  const selectedSetting = settingWorkspace.selectedRecord

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

  const cancelPanel = settingWorkspace.cancelPanel
  const clearWorkspace = settingWorkspace.clearWorkspace
  const handleReset = settingWorkspace.handleReset
  const handleSearch = settingWorkspace.handleSearch
  const openCreatePanel = settingWorkspace.openCreatePanel
  const reloadSettings = settingWorkspace.reloadRecords
  const resetQuery = settingWorkspace.resetQuery
  const selectSetting = settingWorkspace.selectRecord
  const startEdit = settingWorkspace.startEdit
  const submitForm = settingWorkspace.submitForm

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
