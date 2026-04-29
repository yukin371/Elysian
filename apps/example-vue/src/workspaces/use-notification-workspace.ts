import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  createDefaultNotificationDraft,
  createNotificationTableItems,
  filterNotifications,
  normalizeNotificationLevel,
  normalizeNotificationText,
  resolveNotificationSelection,
} from "../lib/notification-workspace"
import {
  type NotificationListQuery,
  type NotificationRecord,
  createNotification,
  fetchNotificationById,
  fetchNotifications,
  markNotificationAsRead,
} from "../lib/platform-api"

type NotificationFormValues = Record<string, unknown>
export type NotificationPanelMode = "detail" | "create"

type NotificationPageColumn = {
  key: string
  label?: string
  width?: string
} & Record<string, unknown>

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

export const useNotificationWorkspace = (
  options: UseNotificationWorkspaceOptions,
) => {
  const notificationItems = ref<NotificationRecord[]>([])
  const notificationDetail = ref<NotificationRecord | null>(null)
  const notificationLoading = ref(false)
  const notificationDetailLoading = ref(false)
  const notificationErrorMessage = ref("")
  const notificationDetailErrorMessage = ref("")
  const selectedNotificationId = ref<string | null>(null)
  const notificationPanelMode = ref<NotificationPanelMode>("detail")
  const notificationQueryValues = ref<ElyQueryValues>({})
  const notificationCreateForm = ref(createDefaultNotificationDraft())

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

  const selectedNotificationListItem = computed(
    () =>
      notificationItems.value.find(
        (notification: NotificationRecord) =>
          notification.id === selectedNotificationId.value,
      ) ?? null,
  )

  const selectedNotification = computed(
    () =>
      (notificationDetail.value &&
      notificationDetail.value.id === selectedNotificationId.value
        ? notificationDetail.value
        : selectedNotificationListItem.value) ?? null,
  )

  const tableColumns = computed(() =>
    options.page.tableColumns.value.map((column) => ({
      ...column,
      key: column.key === "status" ? "statusLabel" : column.key,
      label: options.localizeFieldLabel(column.key),
      width:
        column.key === "id"
          ? "240"
          : column.key === "recipientUserId" || column.key === "createdByUserId"
            ? "180"
            : column.key === "level" || column.key === "status"
              ? "120"
              : column.key.endsWith("At")
                ? "200"
                : undefined,
    })),
  )

  const queryFields = computed<ElyQueryField[]>(() => [
    {
      key: "recipientUserId",
      label: options.t("app.notification.field.recipientUserId"),
      kind: "text",
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

  const countLabel = computed(() =>
    options.t("app.notification.countLabel", {
      visible: filteredNotificationItems.value.length,
      total: notificationItems.value.length,
    }),
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
        label: options.localizeFieldLabel(field.key),
        input: field.key === "content" ? ("textarea" as const) : field.input,
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
        disabled: notificationPanelMode.value === "detail" || field.disabled,
        placeholder:
          field.key === "recipientUserId"
            ? options.t("app.notification.query.recipientUserIdPlaceholder")
            : field.key === "title"
              ? options.t("app.notification.query.titlePlaceholder")
              : field.key === "content"
                ? options.t("app.notification.query.contentPlaceholder")
                : field.key === "level"
                  ? options.t("app.notification.query.levelPlaceholder")
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

  const resetPanelInputs = () => {
    notificationCreateForm.value = createDefaultNotificationDraft()
  }

  const clearWorkspace = () => {
    notificationItems.value = []
    notificationDetail.value = null
    selectedNotificationId.value = null
    notificationErrorMessage.value = ""
    notificationDetailErrorMessage.value = ""
    notificationPanelMode.value = "detail"
    resetPanelInputs()
  }

  const selectNotification = async (notification: NotificationRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedNotificationId.value = notification.id
    notificationDetail.value = notification
    notificationDetailLoading.value = true
    notificationDetailErrorMessage.value = ""

    try {
      notificationDetail.value = await fetchNotificationById(notification.id)
    } catch (error) {
      options.onRecoverableAuthError(error)
      notificationDetailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadNotificationDetail")
    } finally {
      notificationDetailLoading.value = false
    }
  }

  const reloadNotifications = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    notificationLoading.value = true
    notificationErrorMessage.value = ""
    notificationDetailErrorMessage.value = ""

    try {
      const payload = await fetchNotifications(listQuery.value)
      notificationItems.value = payload.items

      if (payload.items.length === 0) {
        selectedNotificationId.value = null
        notificationDetail.value = null

        if (options.canCreate.value) {
          notificationPanelMode.value = "create"
        }

        return
      }

      selectedNotificationId.value = resolveNotificationSelection(
        payload.items,
        selectedNotificationId.value,
      )

      if (notificationPanelMode.value !== "create") {
        const nextNotification = payload.items.find(
          (item) => item.id === selectedNotificationId.value,
        )

        if (nextNotification) {
          await selectNotification(nextNotification)
        }
      }
    } catch (error) {
      clearWorkspace()
      options.onRecoverableAuthError(error)
      notificationErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadNotifications")
    } finally {
      notificationLoading.value = false
    }
  }

  const handleSearch = async (values: ElyQueryValues) => {
    notificationQueryValues.value = values
    await reloadNotifications()
  }

  const handleReset = async () => {
    notificationQueryValues.value = {}
    await reloadNotifications()
  }

  const openCreatePanel = () => {
    if (!options.canCreate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedNotificationId.value = null
    notificationDetail.value = null
    notificationErrorMessage.value = ""
    notificationDetailErrorMessage.value = ""
    resetPanelInputs()
    notificationPanelMode.value = "create"
  }

  const cancelPanel = () => {
    notificationErrorMessage.value = ""

    if (selectedNotification.value) {
      notificationPanelMode.value = "detail"
      return
    }

    if (options.canCreate.value) {
      notificationPanelMode.value = "create"
      return
    }

    notificationPanelMode.value = "detail"
  }

  const submitForm = async (values: NotificationFormValues) => {
    if (notificationLoading.value || notificationDetailLoading.value) {
      return
    }

    const payload = {
      recipientUserId: normalizeNotificationText(values.recipientUserId),
      title: normalizeNotificationText(values.title),
      content: normalizeNotificationText(values.content),
      level: normalizeNotificationLevel(values.level),
    }

    if (payload.recipientUserId.length === 0) {
      notificationErrorMessage.value = options.t(
        "app.error.notificationRecipientRequired",
      )
      return
    }

    if (payload.title.length === 0) {
      notificationErrorMessage.value = options.t(
        "app.error.notificationTitleRequired",
      )
      return
    }

    if (payload.content.length === 0) {
      notificationErrorMessage.value = options.t(
        "app.error.notificationContentRequired",
      )
      return
    }

    notificationLoading.value = true
    notificationErrorMessage.value = ""

    try {
      const created = await createNotification(payload)
      selectedNotificationId.value = created.id
      notificationDetail.value = created
      notificationPanelMode.value = "detail"
      resetPanelInputs()
      await reloadNotifications()
    } catch (error) {
      notificationErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.createNotification")
    } finally {
      notificationLoading.value = false
    }
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
      notificationErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.markNotificationRead")
    } finally {
      notificationLoading.value = false
    }
  }

  const handleRowClick = async (row: Record<string, unknown>) => {
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
    markSelectedAsRead,
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
  }
}
