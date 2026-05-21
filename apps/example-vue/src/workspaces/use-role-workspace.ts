import type { ElyFormField, ElyQueryField } from "@elysian/ui-enterprise-vue"
import { type ComputedRef, type Ref, computed } from "vue"

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
import { createCrudWorkspace } from "./create-crud-workspace"

export type RolePanelMode = "detail" | "create" | "edit"
type RoleFormValues = Record<string, unknown>

type RolePageColumn = {
  key: string
  label?: string
  width?: string
}

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

const roleListColumnOrder = new Map(
  [
    "name",
    "code",
    "description",
    "dataScope",
    "isSystem",
    "status",
    "updatedAt",
  ].map((key, index) => [key, index]),
)

export const useRoleWorkspace = (options: UseRoleWorkspaceOptions) => {
  const roleWorkspace = createCrudWorkspace<
    RoleRecord,
    ReturnType<typeof createDefaultRoleDraft>,
    Parameters<typeof createRole>[0],
    RoleDetailRecord
  >({
    canCreate: options.canCreate,
    canUpdate: options.canUpdate,
    canView: options.canView,
    createDefaultDraft: createDefaultRoleDraft,
    createRecord: createRole,
    currentShellTabKey: options.currentShellTabKey,
    fetchDetail: fetchRoleById,
    fetchList: fetchRoles,
    getCreateErrorMessage: () => options.t("app.error.createRole"),
    getLoadDetailErrorMessage: () => options.t("app.error.loadRoleDetail"),
    getLoadListErrorMessage: () => options.t("app.error.loadRoles"),
    getUpdateErrorMessage: () => options.t("app.error.updateRole"),
    normalizePayload: (values) => {
      const payload = {
        code: normalizeRoleText(values.code),
        name: normalizeRoleText(values.name),
        description: normalizeOptionalRoleText(values.description),
        status: normalizeRoleStatus(values.status),
        isSystem: normalizeRoleBoolean(values.isSystem),
        dataScope: normalizeRoleDataScope(values.dataScope),
      }

      if (payload.code.length === 0) {
        return {
          message: options.t("app.error.roleCodeRequired"),
          status: "invalid" as const,
        }
      }

      if (payload.name.length === 0) {
        return {
          message: options.t("app.error.roleNameRequired"),
          status: "invalid" as const,
        }
      }

      return {
        payload,
        status: "valid" as const,
      }
    },
    onRecoverableAuthError: options.onRecoverableAuthError,
    resolveSelection: resolveRoleSelection,
    toEditDraft: (role) => ({
      code: role.code,
      name: role.name,
      description: role.description ?? "",
      status: role.status,
      isSystem: role.isSystem,
      dataScope: role.dataScope,
    }),
    updateRecord: updateRole,
  })

  const roleItems = roleWorkspace.items
  const roleDetail = roleWorkspace.detail
  const roleLoading = roleWorkspace.loading
  const roleDetailLoading = roleWorkspace.detailLoading
  const roleErrorMessage = roleWorkspace.errorMessage
  const roleDetailErrorMessage = roleWorkspace.detailErrorMessage
  const selectedRoleId = roleWorkspace.selectedId
  const rolePanelMode = roleWorkspace.panelMode
  const roleQueryValues = roleWorkspace.queryValues
  const roleCreateForm = roleWorkspace.createForm
  const roleEditForm = roleWorkspace.editForm

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

  const selectedRole = roleWorkspace.selectedRecord

  const selectedRoleDetail = computed(() =>
    roleDetail.value && roleDetail.value.id === selectedRoleId.value
      ? roleDetail.value
      : null,
  )

  const tableColumns = computed(() =>
    options.page.tableColumns.value
      .filter((column) => roleListColumnOrder.has(column.key))
      .sort(
        (left, right) =>
          (roleListColumnOrder.get(left.key) ?? 99) -
          (roleListColumnOrder.get(right.key) ?? 99),
      )
      .map((column) => ({
        ...column,
        label: options.localizeFieldLabel(column.key),
        width:
          column.key === "name"
            ? "180"
            : column.key === "code"
              ? "140"
              : column.key === "description"
                ? "220"
                : column.key === "status"
                  ? "100"
                  : column.key === "isSystem"
                    ? "120"
                    : column.key === "dataScope"
                      ? "150"
                      : column.key === "updatedAt"
                        ? "180"
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
          ? options.t("app.role.form.codePlaceholder")
          : field.key === "name"
            ? options.t("app.role.form.namePlaceholder")
            : field.key === "description"
              ? options.t("app.role.form.descriptionPlaceholder")
              : field.key === "status"
                ? options.t("copy.query.statusPlaceholder")
                : field.placeholder,
      readonlyTrueLabel:
        field.key === "isSystem"
          ? options.localizeBoolean(true)
          : field.readonlyTrueLabel,
      readonlyFalseLabel:
        field.key === "isSystem"
          ? options.localizeBoolean(false)
          : field.readonlyFalseLabel,
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

  const cancelPanel = roleWorkspace.cancelPanel
  const clearWorkspace = roleWorkspace.clearWorkspace
  const handleReset = roleWorkspace.handleReset
  const handleSearch = roleWorkspace.handleSearch
  const openCreatePanel = roleWorkspace.openCreatePanel
  const openRecordForEdit = roleWorkspace.openRecordForEdit
  const reloadRoles = roleWorkspace.reloadRecords
  const resetQuery = roleWorkspace.resetQuery
  const selectRole = roleWorkspace.selectRecord
  const startEdit = roleWorkspace.startEdit
  const submitForm = roleWorkspace.submitForm

  const handleRowClick = async (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    const role = filteredRoleItems.value.find((item) => item.id === rowId)

    if (!role) {
      return
    }

    await openRecordForEdit(role)
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
