import type { ElyFormField, ElyQueryField } from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed } from "vue"

import {
  createDefaultMenuDraft,
  createMenuParentLookup,
  createMenuParentOptions,
  createMenuTableItems,
  filterMenus,
  normalizeMenuBoolean,
  normalizeMenuSort,
  normalizeMenuStatus,
  normalizeMenuText,
  normalizeMenuType,
  normalizeOptionalMenuId,
  normalizeOptionalMenuText,
  resolveMenuSelection,
} from "../lib/menu-workspace"
import {
  type MenuDetailRecord,
  type MenuRecord,
  createMenu,
  fetchMenuById,
  fetchMenus,
  updateMenu,
} from "../lib/platform-api"
import { createCrudWorkspace } from "./create-crud-workspace"

export type MenuPanelMode = "detail" | "create" | "edit"
type MenuFormValues = Record<string, unknown>

type MenuPageColumn = {
  key: string
  label?: string
  width?: string
} & Record<string, unknown>

interface MenuPageContract {
  tableColumns: ComputedRef<MenuPageColumn[]>
  queryFields: ComputedRef<ElyQueryField[]>
  formFields: ComputedRef<ElyFormField[]>
}

interface UseMenuWorkspaceOptions {
  currentShellTabKey: Ref<string>
  page: MenuPageContract
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeFieldLabel: (fieldKey: string) => string
  localizeType: (type: string) => string
  localizeBoolean: (value: boolean) => string
  localizeStatus: (status: string) => string
  canView: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

export const useMenuWorkspace = (options: UseMenuWorkspaceOptions) => {
  const menuWorkspace = createCrudWorkspace<
    MenuRecord,
    ReturnType<typeof createDefaultMenuDraft>,
    Parameters<typeof createMenu>[0],
    MenuDetailRecord
  >({
    canCreate: options.canCreate,
    canUpdate: options.canUpdate,
    canView: options.canView,
    createDefaultDraft: createDefaultMenuDraft,
    createRecord: createMenu,
    currentShellTabKey: options.currentShellTabKey,
    fetchDetail: fetchMenuById,
    fetchList: fetchMenus,
    getCreateErrorMessage: () => options.t("app.error.createMenu"),
    getLoadDetailErrorMessage: () => options.t("app.error.loadMenuDetail"),
    getLoadListErrorMessage: () => options.t("app.error.loadMenus"),
    getUpdateErrorMessage: () => options.t("app.error.updateMenu"),
    normalizePayload: (values) => {
      const payload = {
        parentId: normalizeOptionalMenuId(values.parentId) ?? null,
        type: normalizeMenuType(values.type),
        code: normalizeMenuText(values.code),
        name: normalizeMenuText(values.name),
        path: normalizeOptionalMenuText(values.path),
        component: normalizeOptionalMenuText(values.component),
        icon: normalizeOptionalMenuText(values.icon),
        sort: normalizeMenuSort(values.sort),
        isVisible: normalizeMenuBoolean(values.isVisible),
        status: normalizeMenuStatus(values.status),
        permissionCode: normalizeOptionalMenuText(values.permissionCode),
      }

      if (payload.code.length === 0) {
        return {
          message: options.t("app.error.menuCodeRequired"),
          status: "invalid" as const,
        }
      }

      if (payload.name.length === 0) {
        return {
          message: options.t("app.error.menuNameRequired"),
          status: "invalid" as const,
        }
      }

      return {
        payload,
        status: "valid" as const,
      }
    },
    onRecoverableAuthError: options.onRecoverableAuthError,
    resolveSelection: resolveMenuSelection,
    toEditDraft: (menu) => ({
      parentId: menu.parentId ?? "",
      type: menu.type,
      code: menu.code,
      name: menu.name,
      path: menu.path ?? "",
      component: menu.component ?? "",
      icon: menu.icon ?? "",
      sort: menu.sort,
      isVisible: menu.isVisible,
      status: menu.status,
      permissionCode: menu.permissionCode ?? "",
    }),
    updateRecord: updateMenu,
  })

  const menuItems = menuWorkspace.items
  const menuDetail = menuWorkspace.detail
  const menuLoading = menuWorkspace.loading
  const menuDetailLoading = menuWorkspace.detailLoading
  const menuErrorMessage = menuWorkspace.errorMessage
  const menuDetailErrorMessage = menuWorkspace.detailErrorMessage
  const selectedMenuId = menuWorkspace.selectedId
  const menuPanelMode = menuWorkspace.panelMode
  const menuQueryValues = menuWorkspace.queryValues
  const menuCreateForm = menuWorkspace.createForm
  const menuEditForm = menuWorkspace.editForm

  const filteredMenuItems = computed(() =>
    filterMenus(menuItems.value, {
      type:
        menuQueryValues.value.type === "directory" ||
        menuQueryValues.value.type === "menu" ||
        menuQueryValues.value.type === "button"
          ? menuQueryValues.value.type
          : "",
      code:
        typeof menuQueryValues.value.code === "string"
          ? menuQueryValues.value.code
          : undefined,
      name:
        typeof menuQueryValues.value.name === "string"
          ? menuQueryValues.value.name
          : undefined,
      path:
        typeof menuQueryValues.value.path === "string"
          ? menuQueryValues.value.path
          : undefined,
      component:
        typeof menuQueryValues.value.component === "string"
          ? menuQueryValues.value.component
          : undefined,
      icon:
        typeof menuQueryValues.value.icon === "string"
          ? menuQueryValues.value.icon
          : undefined,
      permissionCode:
        typeof menuQueryValues.value.permissionCode === "string"
          ? menuQueryValues.value.permissionCode
          : undefined,
      status:
        menuQueryValues.value.status === "active" ||
        menuQueryValues.value.status === "disabled"
          ? menuQueryValues.value.status
          : "",
    }),
  )

  const selectedMenu = menuWorkspace.selectedRecord

  const selectedMenuDetail = computed(() =>
    menuDetail.value && menuDetail.value.id === selectedMenuId.value
      ? menuDetail.value
      : null,
  )

  const parentLookup = computed(() => createMenuParentLookup(menuItems.value))

  const parentOptions = computed(() =>
    createMenuParentOptions(
      menuItems.value,
      selectedMenuId.value,
      options.t("app.menu.parentRoot"),
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
            : column.key === "type"
              ? "140"
              : column.key === "sort"
                ? "120"
                : column.key === "isVisible"
                  ? "140"
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
        field.key === "type" && field.options
          ? field.options.map((option) => ({
              ...option,
              label: options.localizeType(option.value),
            }))
          : field.key === "status" && field.options
            ? field.options.map((option) => ({
                ...option,
                label: options.localizeStatus(option.value),
              }))
            : field.options,
      placeholder:
        field.key === "code"
          ? options.t("app.menu.query.codePlaceholder")
          : field.key === "name"
            ? options.t("app.menu.query.namePlaceholder")
            : field.key === "path"
              ? options.t("app.menu.query.pathPlaceholder")
              : field.key === "component"
                ? options.t("app.menu.query.componentPlaceholder")
                : field.key === "icon"
                  ? options.t("app.menu.query.iconPlaceholder")
                  : field.key === "permissionCode"
                    ? options.t("app.menu.query.permissionCodePlaceholder")
                    : field.key === "status"
                      ? options.t("copy.query.statusPlaceholder")
                      : field.placeholder,
    })),
  )

  const tableItems = computed(() =>
    createMenuTableItems(filteredMenuItems.value, {
      parentLookup: parentLookup.value,
      rootLabel: options.t("app.menu.parentRoot"),
      localizeType: (type) => options.localizeType(type),
      localizeBoolean: options.localizeBoolean,
      localizeStatus: (status) => options.localizeStatus(status),
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
    }),
  )

  const countLabel = computed(() =>
    options.t("app.menu.countLabel", {
      visible: filteredMenuItems.value.length,
      total: menuItems.value.length,
    }),
  )

  const formFields = computed<ElyFormField[]>(() => {
    const baseFields = options.page.formFields.value.map((field) => ({
      ...field,
      label: options.localizeFieldLabel(field.key),
      input:
        field.key === "parentId"
          ? ("select" as const)
          : field.key === "type"
            ? ("select" as const)
            : field.key === "status"
              ? ("select" as const)
              : field.key === "isVisible"
                ? ("switch" as const)
                : field.input,
      options:
        field.key === "parentId"
          ? parentOptions.value
          : field.key === "type"
            ? [
                {
                  label: options.t("app.menu.type.directory"),
                  value: "directory",
                },
                {
                  label: options.t("app.menu.type.menu"),
                  value: "menu",
                },
                {
                  label: options.t("app.menu.type.button"),
                  value: "button",
                },
              ]
            : field.key === "status"
              ? [
                  {
                    label: options.t("app.menu.status.active"),
                    value: "active",
                  },
                  {
                    label: options.t("app.menu.status.disabled"),
                    value: "disabled",
                  },
                ]
              : field.options,
      placeholder:
        field.key === "parentId"
          ? options.t("app.menu.parentPlaceholder")
          : field.key === "code"
            ? options.t("app.menu.query.codePlaceholder")
            : field.key === "name"
              ? options.t("app.menu.query.namePlaceholder")
              : field.key === "path"
                ? options.t("app.menu.query.pathPlaceholder")
                : field.key === "component"
                  ? options.t("app.menu.query.componentPlaceholder")
                  : field.key === "icon"
                    ? options.t("app.menu.query.iconPlaceholder")
                    : field.key === "permissionCode"
                      ? options.t("app.menu.query.permissionCodePlaceholder")
                      : field.key === "status"
                        ? options.t("copy.query.statusPlaceholder")
                        : field.placeholder,
    }))

    if (menuPanelMode.value !== "detail") {
      return baseFields
    }

    return [
      ...baseFields,
      {
        key: "createdAt",
        label: options.t("app.menu.field.createdAt"),
        input: "datetime",
        disabled: true,
      },
      {
        key: "updatedAt",
        label: options.t("app.menu.field.updatedAt"),
        input: "datetime",
        disabled: true,
      },
    ]
  })

  const formValues = computed<MenuFormValues>(() => {
    if (menuPanelMode.value === "edit") {
      return {
        ...menuEditForm.value,
        parentId: menuEditForm.value.parentId ?? "",
        path: menuEditForm.value.path ?? "",
        component: menuEditForm.value.component ?? "",
        icon: menuEditForm.value.icon ?? "",
        permissionCode: menuEditForm.value.permissionCode ?? "",
      }
    }

    if (menuPanelMode.value === "detail" && selectedMenu.value) {
      return {
        parentId: selectedMenu.value.parentId ?? "",
        type: selectedMenu.value.type,
        code: selectedMenu.value.code,
        name: selectedMenu.value.name,
        path: selectedMenu.value.path ?? "",
        component: selectedMenu.value.component ?? "",
        icon: selectedMenu.value.icon ?? "",
        sort: selectedMenu.value.sort,
        isVisible: selectedMenu.value.isVisible,
        status: selectedMenu.value.status,
        permissionCode: selectedMenu.value.permissionCode ?? "",
        createdAt: selectedMenu.value.createdAt,
        updatedAt: selectedMenu.value.updatedAt,
      }
    }

    return {
      ...menuCreateForm.value,
      parentId: menuCreateForm.value.parentId ?? "",
      path: menuCreateForm.value.path ?? "",
      component: menuCreateForm.value.component ?? "",
      icon: menuCreateForm.value.icon ?? "",
      permissionCode: menuCreateForm.value.permissionCode ?? "",
    }
  })

  const panelTitle = computed(() => {
    if (menuPanelMode.value === "edit") {
      return options.t("app.menu.panelTitle.edit")
    }

    if (menuPanelMode.value === "create") {
      return options.t("app.menu.panelTitle.create")
    }

    return (
      selectedMenu.value?.name ??
      options.t("app.menu.panelTitle.detailFallback")
    )
  })

  const panelDescription = computed(() => {
    if (menuPanelMode.value === "edit") {
      return options.t("app.menu.panelDesc.edit")
    }

    if (menuPanelMode.value === "create") {
      return options.t("app.menu.panelDesc.create")
    }

    return selectedMenu.value
      ? options.t("app.menu.panelDesc.detail")
      : options.t("app.menu.detailEmptyDescription")
  })

  const cancelPanel = menuWorkspace.cancelPanel
  const clearWorkspace = menuWorkspace.clearWorkspace
  const handleReset = menuWorkspace.handleReset
  const handleSearch = menuWorkspace.handleSearch
  const openCreatePanel = menuWorkspace.openCreatePanel
  const reloadMenus = menuWorkspace.reloadRecords
  const resetQuery = menuWorkspace.resetQuery
  const selectMenu = menuWorkspace.selectRecord
  const startEdit = menuWorkspace.startEdit
  const submitForm = menuWorkspace.submitForm

  const handleRowClick = async (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const menu = filteredMenuItems.value.find((item) => item.id === rowId)

    if (!menu) {
      return
    }

    await selectMenu(menu)
  }

  return {
    cancelPanel,
    clearWorkspace,
    countLabel,
    filteredMenuItems,
    formFields,
    formValues,
    handleReset,
    handleRowClick,
    handleSearch,
    menuDetail,
    menuDetailErrorMessage,
    menuDetailLoading,
    menuErrorMessage,
    menuLoading,
    menuPanelMode,
    menuQueryValues,
    openCreatePanel,
    panelDescription,
    panelTitle,
    parentLookup,
    queryFields,
    reloadMenus,
    resetQuery,
    selectMenu,
    selectedMenu,
    selectedMenuDetail,
    selectedMenuId,
    startEdit,
    submitForm,
    tableColumns,
    tableItems,
  }
}
