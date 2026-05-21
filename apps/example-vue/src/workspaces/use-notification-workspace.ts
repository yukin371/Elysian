import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed } from "vue"

import {
  createDefaultNotificationDraft,
  createNotificationTableItems,
  filterNotifications,
  normalizeNotificationLevel,
  normalizeNotificationText,
  resolveNotificationSelection,
  resolveUnreadNotificationIds,
} from "../lib/notification-workspace"
import {
  type NotificationListQuery,
  type NotificationRecord,
  createNotification,
  fetchNotificationById,
  fetchNotifications,
  markNotificationAsRead,
  markNotificationsAsRead,
} from "../lib/platform-api"
import { createCrudWorkspace } from "./create-crud-workspace"

type NotificationFormValues = Record<string, unknown>
export type NotificationPanelMode = "detail" | "create"

type NotificationPageColumn = {
  key: string
  label?: string
  width?: string
}

interface NotificationPageContract {
  tableColumns: ComputedRef<NotificationPageColumn[]>
  queryFields: ComputedRef<ElyQueryField[]>
  formFields: ComputedRef<ElyFormField[]>
}

interface UseNotificationWorkspaceOptions {
  currentShellTabKey: Ref<string>
  page: NotificationPageContract
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeFieldLabel: (fieldKey: string) => string
  localizeLevel: (level: string) => string
  localizeStatus: (status: string) => string
  canView: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

const notificationListColumnOrder = new Map(
  ["title", "level", "status", "readAt", "createdAt"].map((key, index) => [
    key,
    index,
  ]),
)

export const useNotificationWorkspace = (
  options: UseNotificationWorkspaceOptions,
) => {
  const notificationWorkspace = createCrudWorkspace<
    NotificationRecord,
    ReturnType<typeof createDefaultNotificationDraft>,
    Parameters<typeof createNotification>[0]
  >({
    canCreate: options.canCreate,
    canUpdate: options.canUpdate,
    canView: options.canView,
    createDefaultDraft: createDefaultNotificationDraft,
    createRecord: createNotification,
    currentShellTabKey: options.currentShellTabKey,
    fetchDetail: fetchNotificationById,
    fetchList: () => fetchNotifications(listQuery.value),
    getCreateErrorMessage: () => options.t("app.error.createNotification"),
    getLoadDetailErrorMessage: () =>
      options.t("app.error.loadNotificationDetail"),
    getLoadListErrorMessage: () => options.t("app.error.loadNotifications"),
    getUpdateErrorMessage: () => options.t("app.error.createNotification"),
    normalizePayload: (values) => {
      const payload = {
        recipientUserId: normalizeNotificationText(values.recipientUserId),
        title: normalizeNotificationText(values.title),
        content: normalizeNotificationText(values.content),
        level: normalizeNotificationLevel(values.level),
      }

      if (payload.recipientUserId.length === 0) {
        return {
          message: options.t("app.error.notificationRecipientRequired"),
          status: "invalid" as const,
        }
      }

      if (payload.title.length === 0) {
        return {
          message: options.t("app.error.notificationTitleRequired"),
          status: "invalid" as const,
        }
      }

      if (payload.content.length === 0) {
        return {
          message: options.t("app.error.notificationContentRequired"),
          status: "invalid" as const,
        }
      }

      return {
        payload,
        status: "valid" as const,
      }
    },
    onRecoverableAuthError: options.onRecoverableAuthError,
    resolveSelection: resolveNotificationSelection,
    toEditDraft: () => createDefaultNotificationDraft(),
    updateRecord: async (id) => fetchNotificationById(id),
  })

  const notificationItems = notificationWorkspace.items
  const notificationDetail = notificationWorkspace.detail
  const notificationLoading = notificationWorkspace.loading
  const notificationDetailLoading = notificationWorkspace.detailLoading
  const notificationErrorMessage = notificationWorkspace.errorMessage
  const notificationDetailErrorMessage =
    notificationWorkspace.detailErrorMessage
  const selectedNotificationId = notificationWorkspace.selectedId
  const notificationQueryValues = notificationWorkspace.queryValues
  const notificationCreateForm = notificationWorkspace.createForm

  const listQuery = computed<NotificationListQuery>(() => {
    const query: NotificationListQuery = {}

    if (
      typeof notificationQueryValues.value.recipientUserId === "string" &&
      notificationQueryValues.value.recipientUserId.trim()
    ) {
      query.recipientUserId =
        notificationQueryValues.value.recipientUserId.trim()
    }

    if (
      typeof notificationQueryValues.value.title === "string" &&
      notificationQueryValues.value.title.trim()
    ) {
      query.title = notificationQueryValues.value.title.trim()
    }

    if (
      typeof notificationQueryValues.value.content === "string" &&
      notificationQueryValues.value.content.trim()
    ) {
      query.content = notificationQueryValues.value.content.trim()
    }

    if (
      notificationQueryValues.value.level === "info" ||
      notificationQueryValues.value.level === "warning" ||
      notificationQueryValues.value.level === "success" ||
      notificationQueryValues.value.level === "error"
    ) {
      query.level = notificationQueryValues.value.level
    }

    if (
      notificationQueryValues.value.status === "unread" ||
      notificationQueryValues.value.status === "read"
    ) {
      query.status = notificationQueryValues.value.status
    }

    return query
  })

  const filteredNotificationItems = computed(() =>
    filterNotifications(notificationItems.value, {
      recipientUserId:
        typeof notificationQueryValues.value.recipientUserId === "string"
          ? notificationQueryValues.value.recipientUserId
          : undefined,
      title:
        typeof notificationQueryValues.value.title === "string"
          ? notificationQueryValues.value.title
          : undefined,
      content:
        typeof notificationQueryValues.value.content === "string"
          ? notificationQueryValues.value.content
          : undefined,
      level:
        notificationQueryValues.value.level === "info" ||
        notificationQueryValues.value.level === "warning" ||
        notificationQueryValues.value.level === "success" ||
        notificationQueryValues.value.level === "error"
          ? notificationQueryValues.value.level
          : "",
      status:
        notificationQueryValues.value.status === "read" ||
        notificationQueryValues.value.status === "unread"
          ? notificationQueryValues.value.status
          : "",
    }),
  )

  const selectedNotification = notificationWorkspace.selectedRecord

  const tableColumns = computed(() =>
    options.page.tableColumns.value
      .filter((column) => notificationListColumnOrder.has(column.key))
      .sort(
        (left, right) =>
          (notificationListColumnOrder.get(left.key) ?? 99) -
          (notificationListColumnOrder.get(right.key) ?? 99),
      )
      .map((column) => ({
        ...column,
        key: column.key === "status" ? "statusLabel" : column.key,
        label: options.localizeFieldLabel(column.key),
        width:
          column.key === "title"
            ? "220"
            : column.key === "level" || column.key === "status"
              ? "100"
              : column.key.endsWith("At")
                ? "180"
                : undefined,
      })),
  )

  const queryFields = computed<ElyQueryField[]>(() => [
    {
      key: "recipientUserId",
      kind: "text",
      label: options.t("app.notification.field.recipientUserId"),
      placeholder: options.t(
        "app.notification.query.recipientUserIdPlaceholder",
      ),
    },
    ...options.page.queryFields.value.map((field) => ({
      ...field,
      label: options.localizeFieldLabel(field.key),
      options:
        field.key === "level" && field.options
          ? field.options.map((option) => ({
              ...option,
              label: options.localizeLevel(option.value),
            }))
          : field.key === "status" && field.options
            ? field.options.map((option) => ({
                ...option,
                label: options.localizeStatus(option.value),
              }))
            : field.options,
      placeholder:
        field.key === "title"
          ? options.t("app.notification.query.titlePlaceholder")
          : field.key === "content"
            ? options.t("app.notification.query.contentPlaceholder")
            : field.key === "level"
              ? options.t("app.notification.query.levelPlaceholder")
              : field.key === "status"
                ? options.t("app.notification.query.statusPlaceholder")
                : field.placeholder,
    })),
  ])

  const tableItems = computed(() =>
    createNotificationTableItems(filteredNotificationItems.value, {
      localizeLevel: options.localizeLevel,
      localizeStatus: options.localizeStatus,
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
      readAtEmptyLabel: options.t("app.notification.readAtEmpty"),
    }),
  )

  const visibleUnreadNotificationIds = computed(() =>
    resolveUnreadNotificationIds(filteredNotificationItems.value),
  )

  const visibleUnreadNotificationCount = computed(
    () => visibleUnreadNotificationIds.value.length,
  )

  const countLabel = computed(() =>
    options.t("app.notification.countLabel", {
      visible: filteredNotificationItems.value.length,
      total: notificationItems.value.length,
    }),
  )

  const notificationPanelMode = computed<NotificationPanelMode>(() =>
    notificationWorkspace.panelMode.value === "create" ? "create" : "detail",
  )

  const formFields = computed<ElyFormField[]>(() => {
    const allowedFieldKeys =
      notificationPanelMode.value === "create"
        ? new Set(["recipientUserId", "title", "content", "level"])
        : new Set([
            "recipientUserId",
            "title",
            "content",
            "level",
            "status",
            "createdByUserId",
            "readAt",
            "createdAt",
          ])

    return options.page.formFields.value
      .filter((field) => allowedFieldKeys.has(field.key))
      .map((field) => ({
        ...field,
        disabled: notificationPanelMode.value === "detail" || field.disabled,
        input: field.key === "content" ? ("textarea" as const) : field.input,
        label: options.localizeFieldLabel(field.key),
        options:
          field.key === "level" && field.options
            ? field.options.map((option) => ({
                ...option,
                label: options.localizeLevel(option.value),
              }))
            : field.key === "status" && field.options
              ? field.options.map((option) => ({
                  ...option,
                  label: options.localizeStatus(option.value),
                }))
              : field.options,
        placeholder:
          field.key === "recipientUserId"
            ? options.t("app.notification.form.recipientUserIdPlaceholder")
            : field.key === "title"
              ? options.t("app.notification.form.titlePlaceholder")
              : field.key === "content"
                ? options.t("app.notification.form.contentPlaceholder")
                : field.key === "level"
                  ? options.t("app.notification.form.levelPlaceholder")
                  : field.placeholder,
      }))
  })

  const formValues = computed<NotificationFormValues>(() => {
    if (
      notificationPanelMode.value === "detail" &&
      selectedNotification.value
    ) {
      return {
        recipientUserId: selectedNotification.value.recipientUserId,
        title: selectedNotification.value.title,
        content: selectedNotification.value.content,
        level: selectedNotification.value.level,
        status: selectedNotification.value.status,
        createdByUserId: selectedNotification.value.createdByUserId ?? "",
        readAt: selectedNotification.value.readAt ?? "",
        createdAt: selectedNotification.value.createdAt,
      }
    }

    return {
      ...notificationCreateForm.value,
    }
  })

  const panelTitle = computed(() => {
    if (notificationPanelMode.value === "create") {
      return options.t("app.notification.panelTitle.create")
    }

    return (
      selectedNotification.value?.title ??
      options.t("app.notification.panelTitle.detailFallback")
    )
  })

  const panelDescription = computed(() =>
    notificationPanelMode.value === "create"
      ? options.t("app.notification.panelDesc.create")
      : selectedNotification.value
        ? options.t("app.notification.panelDesc.detail")
        : options.t("app.notification.detailEmptyDescription"),
  )

  const clearWorkspace = notificationWorkspace.clearWorkspace

  const reloadNotifications = async () => {
    notificationDetailErrorMessage.value = ""
    await notificationWorkspace.reloadRecords()
  }

  const handleSearch = async (values: ElyQueryValues) => {
    notificationWorkspace.handleSearch(values)
    await reloadNotifications()
  }

  const handleReset = async () => {
    notificationWorkspace.handleReset()
    await reloadNotifications()
  }

  const openCreatePanel = notificationWorkspace.openCreatePanel
  const selectNotification = notificationWorkspace.selectRecord
  const submitForm = notificationWorkspace.submitForm

  const cancelPanel = () => {
    notificationErrorMessage.value = ""
    notificationWorkspace.cancelPanel()
  }

  const markSelectedAsRead = async () => {
    if (
      notificationLoading.value ||
      notificationDetailLoading.value ||
      !selectedNotification.value ||
      selectedNotification.value.status === "read" ||
      !options.canUpdate.value
    ) {
      return
    }

    notificationLoading.value = true
    notificationErrorMessage.value = ""

    try {
      const updated = await markNotificationAsRead(
        selectedNotification.value.id,
      )
      notificationItems.value = notificationItems.value.map(
        (notification: NotificationRecord) =>
          notification.id === updated.id ? updated : notification,
      )
      notificationDetail.value = updated
      await reloadNotifications()
    } catch (error) {
      options.onRecoverableAuthError(error)
      notificationErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.markNotificationRead")
    } finally {
      notificationLoading.value = false
    }
  }

  const markVisibleAsRead = async () => {
    if (
      notificationLoading.value ||
      notificationDetailLoading.value ||
      !options.canUpdate.value ||
      visibleUnreadNotificationIds.value.length === 0
    ) {
      return
    }

    notificationLoading.value = true
    notificationErrorMessage.value = ""

    try {
      const payload = await markNotificationsAsRead(
        visibleUnreadNotificationIds.value,
      )
      const updatedById = new Map(
        payload.items.map((notification) => [notification.id, notification]),
      )

      notificationItems.value = notificationItems.value.map(
        (notification: NotificationRecord) =>
          updatedById.get(notification.id) ?? notification,
      )

      if (selectedNotification.value) {
        notificationDetail.value =
          updatedById.get(selectedNotification.value.id) ??
          selectedNotification.value
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      notificationErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.markNotificationsRead")
    } finally {
      notificationLoading.value = false
    }
  }

  const handleRowClick = async (row: Record<string, unknown>) => {
    if (notificationLoading.value || notificationDetailLoading.value) {
      return
    }

    const rowId = String(row.id ?? "")
    const notification = filteredNotificationItems.value.find(
      (item) => item.id === rowId,
    )

    if (!notification) {
      return
    }

    await selectNotification(notification)
  }

  return {
    cancelPanel,
    clearWorkspace,
    countLabel,
    filteredNotificationItems,
    formFields,
    formValues,
    handleReset,
    handleRowClick,
    handleSearch,
    listQuery,
    markSelectedAsRead,
    markVisibleAsRead,
    notificationDetail,
    notificationDetailErrorMessage,
    notificationDetailLoading,
    notificationErrorMessage,
    notificationItems,
    notificationLoading,
    notificationPanelMode,
    notificationQueryValues,
    openCreatePanel,
    panelDescription,
    panelTitle,
    queryFields,
    reloadNotifications,
    selectedNotification,
    selectedNotificationId,
    selectNotification,
    submitForm,
    tableColumns,
    tableItems,
    visibleUnreadNotificationCount,
  }
}
