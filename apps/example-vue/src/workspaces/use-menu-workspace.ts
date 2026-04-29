import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

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
  const menuItems = ref<MenuRecord[]>([])
  const menuDetail = ref<MenuDetailRecord | null>(null)
  const menuLoading = ref(false)
  const menuDetailLoading = ref(false)
  const menuErrorMessage = ref("")
  const menuDetailErrorMessage = ref("")
  const selectedMenuId = ref<string | null>(null)
  const menuPanelMode = ref<MenuPanelMode>("detail")
  const menuQueryValues = ref<ElyQueryValues>({})
  const menuCreateForm = ref(createDefaultMenuDraft())
  const menuEditForm = ref(createDefaultMenuDraft())

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

  const selectedMenuListItem = computed(
    () =>
      menuItems.value.find(
        (menu: MenuRecord) => menu.id === selectedMenuId.value,
      ) ?? null,
  )

  const selectedMenu = computed(
    () =>
      (menuDetail.value && menuDetail.value.id === selectedMenuId.value
        ? menuDetail.value
        : selectedMenuListItem.value) ?? null,
  )

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

  const resetPanelInputs = () => {
    menuCreateForm.value = createDefaultMenuDraft()
    menuEditForm.value = createDefaultMenuDraft()
  }

  const resetQuery = () => {
    menuQueryValues.value = {}
  }

  const clearWorkspace = () => {
    menuItems.value = []
    menuDetail.value = null
    selectedMenuId.value = null
    menuErrorMessage.value = ""
    menuDetailErrorMessage.value = ""
    menuPanelMode.value = "detail"
    resetPanelInputs()
  }

  const selectMenu = async (menu: MenuRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedMenuId.value = menu.id
    menuPanelMode.value = "detail"
    menuDetail.value = null
    menuDetailLoading.value = true
    menuDetailErrorMessage.value = ""

    try {
      menuDetail.value = await fetchMenuById(menu.id)
    } catch (error) {
      options.onRecoverableAuthError(error)
      menuDetailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadMenuDetail")
    } finally {
      menuDetailLoading.value = false
    }
  }

  const reloadMenus = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    menuLoading.value = true
    menuErrorMessage.value = ""

    try {
      const payload = await fetchMenus()
      menuItems.value = payload.items

      if (payload.items.length === 0) {
        selectedMenuId.value = null
        menuDetail.value = null

        if (options.canCreate.value) {
          menuPanelMode.value = "create"
        }

        return
      }

      selectedMenuId.value = resolveMenuSelection(
        payload.items,
        selectedMenuId.value,
      )

      if (menuPanelMode.value !== "detail") {
        return
      }

      const nextMenu = payload.items.find(
        (item) => item.id === selectedMenuId.value,
      )

      if (nextMenu) {
        await selectMenu(nextMenu)
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkspace()
      menuErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadMenus")
    } finally {
      menuLoading.value = false
    }
  }

  const handleSearch = (values: ElyQueryValues) => {
    menuQueryValues.value = values
  }

  const handleReset = () => {
    resetQuery()
  }

  const openCreatePanel = () => {
    if (!options.canCreate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedMenuId.value = null
    menuDetail.value = null
    menuErrorMessage.value = ""
    menuDetailErrorMessage.value = ""
    resetPanelInputs()
    menuPanelMode.value = "create"
  }

  const startEdit = (menu: MenuRecord | MenuDetailRecord) => {
    if (!options.canUpdate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedMenuId.value = menu.id
    menuErrorMessage.value = ""
    menuDetailErrorMessage.value = ""
    menuEditForm.value = {
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
    }
    menuPanelMode.value = "edit"
  }

  const cancelPanel = () => {
    menuErrorMessage.value = ""

    if (selectedMenu.value) {
      menuPanelMode.value = "detail"
      return
    }

    if (options.canCreate.value) {
      menuPanelMode.value = "create"
      return
    }

    menuPanelMode.value = "detail"
  }

  const submitForm = async (values: MenuFormValues) => {
    if (menuLoading.value || menuDetailLoading.value) {
      return
    }

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
      menuErrorMessage.value = options.t("app.error.menuCodeRequired")
      return
    }

    if (payload.name.length === 0) {
      menuErrorMessage.value = options.t("app.error.menuNameRequired")
      return
    }

    menuLoading.value = true
    menuErrorMessage.value = ""

    try {
      if (menuPanelMode.value === "edit" && selectedMenuId.value) {
        const updated = await updateMenu(selectedMenuId.value, payload)
        selectedMenuId.value = updated.id
        menuDetail.value = updated
        menuPanelMode.value = "detail"
        await reloadMenus()
        return
      }

      if (!options.canCreate.value) {
        return
      }

      const created = await createMenu(payload)
      selectedMenuId.value = created.id
      menuDetail.value = created
      menuPanelMode.value = "detail"
      resetPanelInputs()
      await reloadMenus()
    } catch (error) {
      menuErrorMessage.value =
        error instanceof Error
          ? error.message
          : menuPanelMode.value === "edit"
            ? options.t("app.error.updateMenu")
            : options.t("app.error.createMenu")
    } finally {
      menuLoading.value = false
    }
  }

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
