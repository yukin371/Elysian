import type {
  ElyFormField,
  ElyQueryField,
  ElyQueryValues,
} from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  type RoleDetailRecord,
  type RoleRecord,
  createRole,
  fetchRoleById,
  fetchRoles,
  updateRole,
} from "../lib/platform-api"
import {
  createDefaultRoleDraft,
  createRoleTableItems,
  filterRoles,
  normalizeOptionalRoleText,
  normalizeRoleBoolean,
  normalizeRoleDataScope,
  normalizeRoleStatus,
  normalizeRoleText,
  resolveRoleSelection,
} from "../lib/role-workspace"

export type RolePanelMode = "detail" | "create" | "edit"
type RoleFormValues = Record<string, unknown>

type RolePageColumn = {
  key: string
  label?: string
  width?: string
} & Record<string, unknown>

interface RolePageContract {
  tableColumns: ComputedRef<RolePageColumn[]>
  queryFields: ComputedRef<ElyQueryField[]>
  formFields: ComputedRef<ElyFormField[]>
}

interface UseRoleWorkspaceOptions {
  currentShellTabKey: Ref<string>
  page: RolePageContract
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeFieldLabel: (fieldKey: string) => string
  localizeStatus: (status: string) => string
  localizeBoolean: (value: boolean) => string
  localizeDataScope: (value: RoleRecord["dataScope"]) => string
  canView: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
  canUpdate: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

export const useRoleWorkspace = (options: UseRoleWorkspaceOptions) => {
  const roleItems = ref<RoleRecord[]>([])
  const roleDetail = ref<RoleDetailRecord | null>(null)
  const roleLoading = ref(false)
  const roleDetailLoading = ref(false)
  const roleErrorMessage = ref("")
  const roleDetailErrorMessage = ref("")
  const selectedRoleId = ref<string | null>(null)
  const rolePanelMode = ref<RolePanelMode>("detail")
  const roleQueryValues = ref<ElyQueryValues>({})
  const roleCreateForm = ref(createDefaultRoleDraft())
  const roleEditForm = ref(createDefaultRoleDraft())

  const filteredRoleItems = computed(() =>
    filterRoles(roleItems.value, {
      code:
        typeof roleQueryValues.value.code === "string"
          ? roleQueryValues.value.code
          : undefined,
      name:
        typeof roleQueryValues.value.name === "string"
          ? roleQueryValues.value.name
          : undefined,
      description:
        typeof roleQueryValues.value.description === "string"
          ? roleQueryValues.value.description
          : undefined,
      status:
        roleQueryValues.value.status === "active" ||
        roleQueryValues.value.status === "disabled"
          ? roleQueryValues.value.status
          : "",
    }),
  )

  const selectedRoleListItem = computed(
    () =>
      roleItems.value.find((role) => role.id === selectedRoleId.value) ?? null,
  )

  const selectedRole = computed(
    () =>
      (roleDetail.value && roleDetail.value.id === selectedRoleId.value
        ? roleDetail.value
        : selectedRoleListItem.value) ?? null,
  )

  const selectedRoleDetail = computed(() =>
    roleDetail.value && roleDetail.value.id === selectedRoleId.value
      ? roleDetail.value
      : null,
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
            : column.key === "isSystem"
              ? "140"
              : column.key === "dataScope"
                ? "160"
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
        field.key === "code"
          ? options.t("app.role.query.codePlaceholder")
          : field.key === "name"
            ? options.t("app.role.query.namePlaceholder")
            : field.key === "description"
              ? options.t("app.role.query.descriptionPlaceholder")
              : field.key === "status"
                ? options.t("copy.query.statusPlaceholder")
                : field.placeholder,
    })),
  )

  const tableItems = computed(() =>
    createRoleTableItems(filteredRoleItems.value, {
      localizeStatus: (status) =>
        options.localizeStatus(status as RoleRecord["status"]),
      localizeBoolean: options.localizeBoolean,
      localizeDataScope: options.localizeDataScope,
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
    }),
  )

  const countLabel = computed(() =>
    options.t("app.role.countLabel", {
      visible: filteredRoleItems.value.length,
      total: roleItems.value.length,
    }),
  )

  const roleDataScopeOptions = computed(() => [
    {
      label: options.t("app.role.dataScope.1"),
      value: "1",
    },
    {
      label: options.t("app.role.dataScope.2"),
      value: "2",
    },
    {
      label: options.t("app.role.dataScope.3"),
      value: "3",
    },
    {
      label: options.t("app.role.dataScope.4"),
      value: "4",
    },
    {
      label: options.t("app.role.dataScope.5"),
      value: "5",
    },
  ])

  const formFields = computed<ElyFormField[]>(() => {
    const baseFields = options.page.formFields.value.map((field) => ({
      ...field,
      label: options.localizeFieldLabel(field.key),
      input:
        field.key === "description"
          ? ("textarea" as const)
          : field.key === "dataScope"
            ? ("select" as const)
            : field.input,
      options:
        field.key === "status"
          ? [
              {
                label: options.t("app.role.status.active"),
                value: "active",
              },
              {
                label: options.t("app.role.status.disabled"),
                value: "disabled",
              },
            ]
          : field.key === "dataScope"
            ? roleDataScopeOptions.value
            : field.options,
      placeholder:
        field.key === "code"
          ? options.t("app.role.query.codePlaceholder")
          : field.key === "name"
            ? options.t("app.role.query.namePlaceholder")
            : field.key === "description"
              ? options.t("app.role.query.descriptionPlaceholder")
              : field.key === "status"
                ? options.t("copy.query.statusPlaceholder")
                : field.placeholder,
    }))

    if (rolePanelMode.value !== "detail") {
      return baseFields
    }

    return [
      ...baseFields,
      {
        key: "createdAt",
        label: options.t("app.role.field.createdAt"),
        input: "datetime",
        disabled: true,
      },
      {
        key: "updatedAt",
        label: options.t("app.role.field.updatedAt"),
        input: "datetime",
        disabled: true,
      },
    ]
  })

  const formValues = computed<RoleFormValues>(() => {
    if (rolePanelMode.value === "edit") {
      return {
        ...roleEditForm.value,
        description: roleEditForm.value.description ?? "",
        dataScope: String(roleEditForm.value.dataScope),
      }
    }

    if (rolePanelMode.value === "detail" && selectedRole.value) {
      return {
        code: selectedRole.value.code,
        name: selectedRole.value.name,
        description: selectedRole.value.description ?? "",
        status: selectedRole.value.status,
        isSystem: selectedRole.value.isSystem,
        dataScope: String(selectedRole.value.dataScope),
        createdAt: selectedRole.value.createdAt,
        updatedAt: selectedRole.value.updatedAt,
      }
    }

    return {
      ...roleCreateForm.value,
      description: roleCreateForm.value.description ?? "",
      dataScope: String(roleCreateForm.value.dataScope),
    }
  })

  const panelTitle = computed(() => {
    if (rolePanelMode.value === "edit") {
      return options.t("app.role.panelTitle.edit")
    }

    if (rolePanelMode.value === "create") {
      return options.t("app.role.panelTitle.create")
    }

    return (
      selectedRole.value?.name ??
      options.t("app.role.panelTitle.detailFallback")
    )
  })

  const panelDescription = computed(() => {
    if (rolePanelMode.value === "edit") {
      return options.t("app.role.panelDesc.edit")
    }

    if (rolePanelMode.value === "create") {
      return options.t("app.role.panelDesc.create")
    }

    return selectedRole.value
      ? options.t("app.role.panelDesc.detail")
      : options.t("app.role.detailEmptyDescription")
  })

  const resetPanelInputs = () => {
    roleCreateForm.value = createDefaultRoleDraft()
    roleEditForm.value = createDefaultRoleDraft()
  }

  const resetQuery = () => {
    roleQueryValues.value = {}
  }

  const clearWorkspace = () => {
    roleItems.value = []
    roleDetail.value = null
    selectedRoleId.value = null
    roleErrorMessage.value = ""
    roleDetailErrorMessage.value = ""
    rolePanelMode.value = "detail"
    resetPanelInputs()
  }

  const selectRole = async (role: RoleRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedRoleId.value = role.id
    rolePanelMode.value = "detail"
    roleDetail.value = null
    roleDetailLoading.value = true
    roleDetailErrorMessage.value = ""

    try {
      roleDetail.value = await fetchRoleById(role.id)
    } catch (error) {
      options.onRecoverableAuthError(error)
      roleDetailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadRoleDetail")
    } finally {
      roleDetailLoading.value = false
    }
  }

  const reloadRoles = async () => {
    if (!options.canView.value) {
      clearWorkspace()
      return
    }

    roleLoading.value = true
    roleErrorMessage.value = ""

    try {
      const payload = await fetchRoles()
      roleItems.value = payload.items

      if (payload.items.length === 0) {
        selectedRoleId.value = null
        roleDetail.value = null

        if (options.canCreate.value) {
          rolePanelMode.value = "create"
        }

        return
      }

      selectedRoleId.value = resolveRoleSelection(
        payload.items,
        selectedRoleId.value,
      )

      if (rolePanelMode.value !== "detail") {
        return
      }

      const nextRole = payload.items.find(
        (item) => item.id === selectedRoleId.value,
      )

      if (nextRole) {
        await selectRole(nextRole)
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkspace()
      roleErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadRoles")
    } finally {
      roleLoading.value = false
    }
  }

  const openCreatePanel = () => {
    if (!options.canCreate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedRoleId.value = null
    roleDetail.value = null
    roleErrorMessage.value = ""
    roleDetailErrorMessage.value = ""
    resetPanelInputs()
    rolePanelMode.value = "create"
  }

  const startEdit = (role: RoleRecord | RoleDetailRecord) => {
    if (!options.canUpdate.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    selectedRoleId.value = role.id
    roleErrorMessage.value = ""
    roleDetailErrorMessage.value = ""
    roleEditForm.value = {
      code: role.code,
      name: role.name,
      description: role.description ?? "",
      status: role.status,
      isSystem: role.isSystem,
      dataScope: role.dataScope,
    }
    rolePanelMode.value = "edit"
  }

  const cancelPanel = () => {
    roleErrorMessage.value = ""

    if (selectedRole.value) {
      rolePanelMode.value = "detail"
      return
    }

    if (options.canCreate.value) {
      rolePanelMode.value = "create"
      return
    }

    rolePanelMode.value = "detail"
  }

  const submitForm = async (values: RoleFormValues) => {
    if (roleLoading.value || roleDetailLoading.value) {
      return
    }

    const payload = {
      code: normalizeRoleText(values.code),
      name: normalizeRoleText(values.name),
      description: normalizeOptionalRoleText(values.description),
      status: normalizeRoleStatus(values.status),
      isSystem: normalizeRoleBoolean(values.isSystem),
      dataScope: normalizeRoleDataScope(values.dataScope),
    }

    if (payload.code.length === 0) {
      roleErrorMessage.value = options.t("app.error.roleCodeRequired")
      return
    }

    if (payload.name.length === 0) {
      roleErrorMessage.value = options.t("app.error.roleNameRequired")
      return
    }

    roleLoading.value = true
    roleErrorMessage.value = ""

    try {
      if (rolePanelMode.value === "edit" && selectedRoleId.value) {
        const updated = await updateRole(selectedRoleId.value, payload)
        selectedRoleId.value = updated.id
        roleDetail.value = updated
        rolePanelMode.value = "detail"
        await reloadRoles()
        return
      }

      if (!options.canCreate.value) {
        return
      }

      const created = await createRole(payload)
      selectedRoleId.value = created.id
      roleDetail.value = created
      rolePanelMode.value = "detail"
      resetPanelInputs()
      await reloadRoles()
    } catch (error) {
      roleErrorMessage.value =
        error instanceof Error
          ? error.message
          : rolePanelMode.value === "edit"
            ? options.t("app.error.updateRole")
            : options.t("app.error.createRole")
    } finally {
      roleLoading.value = false
    }
  }

  const handleSearch = (values: ElyQueryValues) => {
    roleQueryValues.value = values
  }

  const handleReset = () => {
    resetQuery()
  }

  const handleRowClick = async (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const role = filteredRoleItems.value.find((item) => item.id === rowId)

    if (!role) {
      return
    }

    await selectRole(role)
  }

  return {
    cancelPanel,
    clearWorkspace,
    countLabel,
    filteredRoleItems,
    formFields,
    formValues,
    handleReset,
    handleRowClick,
    handleSearch,
    openCreatePanel,
    panelDescription,
    panelTitle,
    queryFields,
    reloadRoles,
    resetQuery,
    roleDetail,
    roleDetailErrorMessage,
    roleDetailLoading,
    roleErrorMessage,
    roleLoading,
    rolePanelMode,
    roleQueryValues,
    selectRole,
    selectedRole,
    selectedRoleDetail,
    selectedRoleId,
    startEdit,
    submitForm,
    tableColumns,
    tableItems,
  }
}
