import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  buildOperationLogListQuery,
  createOperationLogDetailValues,
  createOperationLogTableItems,
  filterOperationLogs,
  formatOperationLogDetailsText,
} from "../lib/operation-log-workspace"
import {
  type OperationLogRecord,
  fetchOperationLogById,
  fetchOperationLogs,
} from "../lib/platform-api"

type OperationLogPageColumn = {
  key: string
  label?: string
  width?: string
} & Record<string, unknown>
type OperationLogDetailValues = Record<string, unknown>

interface OperationLogPageContract {
  tableColumns: ComputedRef<OperationLogPageColumn[]>
  queryFields: ComputedRef<ElyQueryField[]>
}

interface UseOperationLogWorkspaceOptions {
  currentShellTabKey: Ref<string>
  page: OperationLogPageContract
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeFieldLabel: (fieldKey: string) => string
  localizeResult: (result: string) => string
  canView: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

export const useOperationLogWorkspace = (
  options: UseOperationLogWorkspaceOptions,
) => {
  const operationLogItems = ref<OperationLogRecord[]>([])
  const operationLogDetail = ref<OperationLogRecord | null>(null)
  const operationLogLoading = ref(false)
  const operationLogDetailLoading = ref(false)
  const operationLogErrorMessage = ref("")
  const operationLogDetailErrorMessage = ref("")
  const selectedOperationLogId = ref<string | null>(null)
  const operationLogQueryValues = ref<ElyQueryValues>({})

  const filteredOperationLogItems = computed(() =>
    filterOperationLogs(operationLogItems.value, {
      category:
        typeof operationLogQueryValues.value.category === "string"
          ? operationLogQueryValues.value.category
          : undefined,
      action:
        typeof operationLogQueryValues.value.action === "string"
          ? operationLogQueryValues.value.action
          : undefined,
      actorUserId:
        typeof operationLogQueryValues.value.actorUserId === "string"
          ? operationLogQueryValues.value.actorUserId
          : undefined,
      result:
        operationLogQueryValues.value.result === "success" ||
        operationLogQueryValues.value.result === "failure"
          ? operationLogQueryValues.value.result
          : "",
    }),
  )

  const selectedOperationLogListItem = computed(
    () =>
      operationLogItems.value.find(
        (item) => item.id === selectedOperationLogId.value,
      ) ?? null,
  )

  const selectedOperationLog = computed(
    () =>
      (operationLogDetail.value &&
      operationLogDetail.value.id === selectedOperationLogId.value
        ? operationLogDetail.value
        : selectedOperationLogListItem.value) ?? null,
  )

  const tableColumns = computed(() =>
    options.page.tableColumns.value.map((column) => ({
      ...column,
      label: options.localizeFieldLabel(column.key),
      width:
        column.key === "id"
          ? "240"
          : column.key === "result"
            ? "120"
            : column.key === "createdAt"
              ? "200"
              : undefined,
    })),
  )

  const queryFields = computed(() => {
    const supportedQueryKeys = new Set([
      "category",
      "action",
      "actorUserId",
      "result",
    ])

    return options.page.queryFields.value
      .filter((field) => supportedQueryKeys.has(field.key))
      .map((field) => ({
        ...field,
        label: options.localizeFieldLabel(field.key),
        options:
          field.key === "result" && field.options
            ? field.options.map((option) => ({
                ...option,
                label: options.localizeResult(option.value),
              }))
            : field.options,
        placeholder:
          field.key === "category"
            ? options.t("app.operationLog.query.categoryPlaceholder")
            : field.key === "action"
              ? options.t("app.operationLog.query.actionPlaceholder")
              : field.key === "actorUserId"
                ? options.t("app.operationLog.query.actorUserIdPlaceholder")
                : field.key === "result"
                  ? options.t("app.operationLog.query.resultPlaceholder")
                  : field.placeholder,
      }))
  })

  const tableItems = computed(() =>
    createOperationLogTableItems(filteredOperationLogItems.value, {
      localizeResult: (result) =>
        options.localizeResult(result as OperationLogRecord["result"]),
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
    }),
  )

  const countLabel = computed(() =>
    options.t("app.operationLog.countLabel", {
      visible: filteredOperationLogItems.value.length,
      total: operationLogItems.value.length,
    }),
  )

  const detailFields = computed<ElyFormField[]>(() => [
    {
      key: "category",
      label: options.t("app.operationLog.field.category"),
      input: "text",
      disabled: true,
    },
    {
      key: "action",
      label: options.t("app.operationLog.field.action"),
      input: "text",
      disabled: true,
    },
    {
      key: "actorUserId",
      label: options.t("app.operationLog.field.actorUserId"),
      input: "text",
      disabled: true,
    },
    {
      key: "targetType",
      label: options.t("app.operationLog.field.targetType"),
      input: "text",
      disabled: true,
    },
    {
      key: "targetId",
      label: options.t("app.operationLog.field.targetId"),
      input: "text",
      disabled: true,
    },
    {
      key: "result",
      label: options.t("app.operationLog.field.result"),
      input: "text",
      disabled: true,
    },
    {
      key: "requestId",
      label: options.t("app.operationLog.field.requestId"),
      input: "text",
      disabled: true,
    },
    {
      key: "ip",
      label: options.t("app.operationLog.field.ip"),
      input: "text",
      disabled: true,
    },
    {
      key: "userAgent",
      label: options.t("app.operationLog.field.userAgent"),
      input: "text",
      disabled: true,
    },
    {
      key: "createdAt",
      label: options.t("app.operationLog.field.createdAt"),
      input: "datetime",
      disabled: true,
    },
  ])

  const detailValues = computed<OperationLogDetailValues>(() =>
    createOperationLogDetailValues(selectedOperationLog.value, {
      localizeResult: (result) =>
        options.localizeResult(result as OperationLogRecord["result"]),
    }),
  )

  const detailsText = computed(() =>
    formatOperationLogDetailsText(
      selectedOperationLog.value,
      options.t("app.operationLog.meta.empty"),
    ),
  )

  const panelTitle = computed(() => {
    if (!selectedOperationLog.value) {
      return options.t("app.operationLog.panelTitle.detailFallback")
    }

    return `${selectedOperationLog.value.category} / ${selectedOperationLog.value.action}`
  })

  const panelDescription = computed(() =>
    selectedOperationLog.value
      ? options.t("app.operationLog.panelDesc.detail")
      : options.t("app.operationLog.detailEmptyDescription"),
  )

  const clearWorkspace = () => {
    operationLogItems.value = []
    operationLogDetail.value = null
    selectedOperationLogId.value = null
    operationLogErrorMessage.value = ""
    operationLogDetailErrorMessage.value = ""
  }

  const resetQuery = () => {
    operationLogQueryValues.value = {}
  }

  const selectOperationLog = async (item: OperationLogRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedOperationLogId.value = item.id
    operationLogDetail.value = null
    operationLogDetailLoading.value = true
    operationLogDetailErrorMessage.value = ""

    try {
      operationLogDetail.value = await fetchOperationLogById(item.id)
    } catch (error) {
      options.onRecoverableAuthError(error)
      operationLogDetailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadOperationLogDetail")
    } finally {
      operationLogDetailLoading.value = false
    }
  }

  const reloadOperationLogs = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    operationLogLoading.value = true
    operationLogErrorMessage.value = ""

    try {
      const payload = await fetchOperationLogs(
        buildOperationLogListQuery(operationLogQueryValues.value),
      )
      operationLogItems.value = payload.items

      if (payload.items.length === 0) {
        selectedOperationLogId.value = null
        operationLogDetail.value = null
        return
      }

      const nextItem =
        payload.items.find(
          (item) => item.id === selectedOperationLogId.value,
        ) ?? payload.items[0]

      if (nextItem) {
        await selectOperationLog(nextItem)
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkspace()
      operationLogErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadOperationLogs")
    } finally {
      operationLogLoading.value = false
    }
  }

  const handleSearch = async (values: ElyQueryValues) => {
    operationLogQueryValues.value = values
    await reloadOperationLogs()
  }

  const handleReset = async () => {
    resetQuery()
    await reloadOperationLogs()
  }

  const handleRowClick = async (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const operationLog = filteredOperationLogItems.value.find(
      (item) => item.id === rowId,
    )

    if (!operationLog) {
      return
    }

    await selectOperationLog(operationLog)
  }

  return {
    clearWorkspace,
    countLabel,
    detailFields,
    detailValues,
    detailsText,
    filteredOperationLogItems,
    handleReset,
    handleRowClick,
    handleSearch,
    operationLogDetail,
    operationLogDetailErrorMessage,
    operationLogDetailLoading,
    operationLogErrorMessage,
    operationLogLoading,
    operationLogQueryValues,
    panelDescription,
    panelTitle,
    queryFields,
    reloadOperationLogs,
    resetQuery,
    selectedOperationLog,
    selectedOperationLogId,
    selectOperationLog,
    tableColumns,
    tableItems,
  }
}
