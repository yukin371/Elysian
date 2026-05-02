import type { ElyQueryValues } from "@elysian/ui-enterprise-vue"
import type { ComputedRef, Ref } from "vue"

import { buildOperationLogListQuery } from "../lib/operation-log-workspace"
import {
  type AuthIdentityResponse,
  type FileListQuery,
  type NotificationListQuery,
  exportDepartmentsCsv,
  exportDictionaryItemsCsv,
  exportDictionaryTypesCsv,
  exportFilesCsv,
  exportMenusCsv,
  exportNotificationsCsv,
  exportOperationLogsCsv,
  exportPostsCsv,
  exportRolesCsv,
  exportSettingsCsv,
  exportTenantsCsv,
  exportUsersCsv,
} from "../lib/platform-api"
import type { AppTranslate } from "./app-shell-helpers"
import { downloadBrowserBlob } from "./download-browser-blob"

interface ExportTaskOptions {
  canRun: ComputedRef<boolean>
  loading: Ref<boolean>
  errorMessage: Ref<string>
  fallbackErrorKey: string
  basename: string
  loadBlob: () => Promise<Blob>
}

interface UseExampleCsvExportsOptions {
  t: AppTranslate
  authIdentity: Ref<AuthIdentityResponse | null>
  isRecoverableAuthError: (error: unknown) => boolean
  canViewDictionaries: ComputedRef<boolean>
  dictionaryTypeExportLoading: Ref<boolean>
  dictionaryItemsExportLoading: Ref<boolean>
  dictionaryErrorMessage: Ref<string>
  selectedDictionaryTypeId: Ref<string | null>
  canViewUsers: ComputedRef<boolean>
  userExportLoading: Ref<boolean>
  userErrorMessage: Ref<string>
  canViewRoles: ComputedRef<boolean>
  roleExportLoading: Ref<boolean>
  roleErrorMessage: Ref<string>
  canViewDepartments: ComputedRef<boolean>
  departmentExportLoading: Ref<boolean>
  departmentErrorMessage: Ref<string>
  canViewPosts: ComputedRef<boolean>
  postExportLoading: Ref<boolean>
  postErrorMessage: Ref<string>
  canViewMenus: ComputedRef<boolean>
  menuExportLoading: Ref<boolean>
  menuErrorMessage: Ref<string>
  canViewSettings: ComputedRef<boolean>
  settingExportLoading: Ref<boolean>
  settingErrorMessage: Ref<string>
  canViewTenants: ComputedRef<boolean>
  tenantExportLoading: Ref<boolean>
  tenantErrorMessage: Ref<string>
  canViewNotifications: ComputedRef<boolean>
  notificationExportLoading: Ref<boolean>
  notificationErrorMessage: Ref<string>
  notificationListQuery: ComputedRef<NotificationListQuery>
  canExportOperationLogs: ComputedRef<boolean>
  operationLogExportLoading: Ref<boolean>
  operationLogErrorMessage: Ref<string>
  operationLogQueryValues: Ref<ElyQueryValues>
  canViewFiles: ComputedRef<boolean>
  fileExportLoading: Ref<boolean>
  fileErrorMessage: Ref<string>
  fileListQuery: ComputedRef<FileListQuery>
}

type CsvExportDateLike = Pick<Date, "getDate" | "getFullYear" | "getMonth">

const padDatePart = (value: number) => String(value).padStart(2, "0")

export const createCsvExportFilename = (
  basename: string,
  now: CsvExportDateLike = new Date(),
) =>
  `${basename}-${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}-${padDatePart(now.getDate())}.csv`

export const useExampleCsvExports = ({
  t,
  authIdentity,
  isRecoverableAuthError,
  canViewDictionaries,
  dictionaryTypeExportLoading,
  dictionaryItemsExportLoading,
  dictionaryErrorMessage,
  selectedDictionaryTypeId,
  canViewUsers,
  userExportLoading,
  userErrorMessage,
  canViewRoles,
  roleExportLoading,
  roleErrorMessage,
  canViewDepartments,
  departmentExportLoading,
  departmentErrorMessage,
  canViewPosts,
  postExportLoading,
  postErrorMessage,
  canViewMenus,
  menuExportLoading,
  menuErrorMessage,
  canViewSettings,
  settingExportLoading,
  settingErrorMessage,
  canViewTenants,
  tenantExportLoading,
  tenantErrorMessage,
  canViewNotifications,
  notificationExportLoading,
  notificationErrorMessage,
  notificationListQuery,
  canExportOperationLogs,
  operationLogExportLoading,
  operationLogErrorMessage,
  operationLogQueryValues,
  canViewFiles,
  fileExportLoading,
  fileErrorMessage,
  fileListQuery,
}: UseExampleCsvExportsOptions) => {
  const exportCsv = async ({
    canRun,
    loading,
    errorMessage,
    fallbackErrorKey,
    basename,
    loadBlob,
  }: ExportTaskOptions) => {
    if (!canRun.value || loading.value) {
      return
    }

    loading.value = true
    errorMessage.value = ""

    try {
      const blob = await loadBlob()
      downloadBrowserBlob(blob, createCsvExportFilename(basename))
    } catch (error) {
      if (isRecoverableAuthError(error)) {
        authIdentity.value = null
      }

      errorMessage.value =
        error instanceof Error ? error.message : t(fallbackErrorKey)
    } finally {
      loading.value = false
    }
  }

  const handleExportDictionaryTypes = () =>
    exportCsv({
      canRun: canViewDictionaries,
      loading: dictionaryTypeExportLoading,
      errorMessage: dictionaryErrorMessage,
      fallbackErrorKey: "app.error.exportDictionaryTypes",
      basename: "system-dictionary-types",
      loadBlob: exportDictionaryTypesCsv,
    })

  const handleExportDictionaryItems = () =>
    exportCsv({
      canRun: canViewDictionaries,
      loading: dictionaryItemsExportLoading,
      errorMessage: dictionaryErrorMessage,
      fallbackErrorKey: "app.error.exportDictionaryItems",
      basename: "system-dictionary-items",
      loadBlob: () =>
        exportDictionaryItemsCsv(selectedDictionaryTypeId.value ?? undefined),
    })

  const handleExportUsers = () =>
    exportCsv({
      canRun: canViewUsers,
      loading: userExportLoading,
      errorMessage: userErrorMessage,
      fallbackErrorKey: "app.error.exportUsers",
      basename: "system-users",
      loadBlob: exportUsersCsv,
    })

  const handleExportRoles = () =>
    exportCsv({
      canRun: canViewRoles,
      loading: roleExportLoading,
      errorMessage: roleErrorMessage,
      fallbackErrorKey: "app.error.exportRoles",
      basename: "system-roles",
      loadBlob: exportRolesCsv,
    })

  const handleExportDepartments = () =>
    exportCsv({
      canRun: canViewDepartments,
      loading: departmentExportLoading,
      errorMessage: departmentErrorMessage,
      fallbackErrorKey: "app.error.exportDepartments",
      basename: "system-departments",
      loadBlob: exportDepartmentsCsv,
    })

  const handleExportPosts = () =>
    exportCsv({
      canRun: canViewPosts,
      loading: postExportLoading,
      errorMessage: postErrorMessage,
      fallbackErrorKey: "app.error.exportPosts",
      basename: "system-posts",
      loadBlob: exportPostsCsv,
    })

  const handleExportMenus = () =>
    exportCsv({
      canRun: canViewMenus,
      loading: menuExportLoading,
      errorMessage: menuErrorMessage,
      fallbackErrorKey: "app.error.exportMenus",
      basename: "system-menus",
      loadBlob: exportMenusCsv,
    })

  const handleExportSettings = () =>
    exportCsv({
      canRun: canViewSettings,
      loading: settingExportLoading,
      errorMessage: settingErrorMessage,
      fallbackErrorKey: "app.error.exportSettings",
      basename: "system-settings",
      loadBlob: exportSettingsCsv,
    })

  const handleExportTenants = () =>
    exportCsv({
      canRun: canViewTenants,
      loading: tenantExportLoading,
      errorMessage: tenantErrorMessage,
      fallbackErrorKey: "app.error.exportTenants",
      basename: "system-tenants",
      loadBlob: exportTenantsCsv,
    })

  const handleExportNotifications = () =>
    exportCsv({
      canRun: canViewNotifications,
      loading: notificationExportLoading,
      errorMessage: notificationErrorMessage,
      fallbackErrorKey: "app.error.exportNotifications",
      basename: "system-notifications",
      loadBlob: () => exportNotificationsCsv(notificationListQuery.value),
    })

  const handleExportOperationLogs = () =>
    exportCsv({
      canRun: canExportOperationLogs,
      loading: operationLogExportLoading,
      errorMessage: operationLogErrorMessage,
      fallbackErrorKey: "app.error.exportOperationLogs",
      basename: "system-operation-logs",
      loadBlob: () =>
        exportOperationLogsCsv(
          buildOperationLogListQuery(operationLogQueryValues.value),
        ),
    })

  const handleExportFiles = () =>
    exportCsv({
      canRun: canViewFiles,
      loading: fileExportLoading,
      errorMessage: fileErrorMessage,
      fallbackErrorKey: "app.error.exportFiles",
      basename: "system-files",
      loadBlob: () => exportFilesCsv(fileListQuery.value),
    })

  return {
    handleExportDepartments,
    handleExportDictionaryItems,
    handleExportDictionaryTypes,
    handleExportFiles,
    handleExportMenus,
    handleExportNotifications,
    handleExportOperationLogs,
    handleExportPosts,
    handleExportRoles,
    handleExportSettings,
    handleExportTenants,
    handleExportUsers,
  }
}
